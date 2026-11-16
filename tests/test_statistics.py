"""Pruebas del motor estadístico con series sintéticas controladas.

Los valores fabricados aquí nunca se presentan al usuario: viven sólo en memoria
y sirven para comprobar climatologías, anomalías, tendencias y comparaciones.
"""
from __future__ import annotations

import json
import math
import unittest
from datetime import date

import numpy as np

from scripts.data import analysis
from scripts.data.ocean_sources import checksum
from scripts.data.statistics import (
    PERCENT_DENOMINATOR_MIN, anomaly_rows, climatology_means, month_count,
    monthly_climatology, period_comparison, trend, validate_period,
)

AVAILABLE = (date(2003, 1, 1), date(2024, 12, 1))
# Huellas de las series publicadas; si cambian, Fases 1A o 1B dejaron de ser reproducibles.
CHLOROPHYLL_SHA256 = "86135795bb269d7dc160d078ef7faf6acef151d7b3e7229059990f69270b9bda"
SST_SHA256 = "39721dd824c74dee8f947978ca3d1f11abe3177a9ed099b0a4bdd69824f4ad02"


def synthetic(slope: float, noise: float, seed: int, years: int = 22,
              start: int = 2003) -> list[tuple[date, float]]:
    """Serie mensual determinista con ciclo estacional y tendencia conocidas."""
    rng = np.random.default_rng(seed)
    return [
        (date(start + index // 12, index % 12 + 1, 1),
         20.0 + 2.0 * math.sin(2 * math.pi * (index % 12) / 12)
         + slope * (index // 12) + float(rng.normal(0, noise)))
        for index in range(years * 12)
    ]


def deseasonalize(points: list[tuple[date, float]]) -> list[tuple[date, float]]:
    means = climatology_means(monthly_climatology(points))
    return [(day, None if value is None or day.month not in means else value - means[day.month])
            for day, value in points]


def flat_climatology(mean: float = 20.0) -> list[dict[str, object]]:
    return [{"month": month, "status": "estimated", "mean": mean, "years": 22}
            for month in range(1, 13)]


class ClimatologyTests(unittest.TestCase):
    def test_known_values_by_calendar_month(self) -> None:
        points = [(date(2003, 1, 1), 10.0), (date(2004, 1, 1), 12.0), (date(2005, 1, 1), 14.0)]
        rows = monthly_climatology(points, minimum_years=3)
        january = next(row for row in rows if row["month"] == 1)
        self.assertEqual(january["status"], "estimated")
        self.assertEqual(january["years"], 3)
        self.assertAlmostEqual(january["mean"], 12.0)
        self.assertAlmostEqual(january["standardDeviation"], 2.0)
        february = next(row for row in rows if row["month"] == 2)
        self.assertEqual(february["status"], "insufficient-data")
        self.assertNotIn("mean", february)
        self.assertIn("reason", february)

    def test_missing_months_are_not_replaced(self) -> None:
        points = [(date(2003, 1, 1), 10.0), (date(2004, 1, 1), None), (date(2005, 1, 1), 14.0)]
        january = monthly_climatology(points, minimum_years=2)[0]
        self.assertEqual(january["years"], 2)
        self.assertAlmostEqual(january["mean"], 12.0)


class AnomalyTests(unittest.TestCase):
    def test_positive_negative_and_zero_anomalies(self) -> None:
        rows = anomaly_rows(
            [(date(2003, 1, 1), 22.0), (date(2003, 2, 1), 18.0),
             (date(2003, 3, 1), 20.0), (date(2003, 4, 1), None)],
            flat_climatology(), percent=True,
        )
        self.assertAlmostEqual(rows[0]["absolute"], 2.0)
        self.assertAlmostEqual(rows[1]["absolute"], -2.0)
        self.assertEqual(rows[2]["absolute"], 0.0)
        self.assertIsNone(rows[3]["absolute"])
        self.assertIsNone(rows[3]["percent"])

    def test_percentages_use_the_monthly_climatology(self) -> None:
        rows = anomaly_rows(
            [(date(2003, 1, 1), 24.0), (date(2003, 2, 1), 15.0)],
            flat_climatology(20.0), percent=True,
        )
        self.assertAlmostEqual(rows[0]["percent"], 20.0)
        self.assertAlmostEqual(rows[1]["percent"], -25.0)

    def test_percent_guard_near_zero_denominator(self) -> None:
        rows = anomaly_rows([(date(2003, 1, 1), 0.02)],
                            [{"month": 1, "status": "estimated", "mean": 0.005, "years": 22}],
                            percent=True)
        self.assertGreater(PERCENT_DENOMINATOR_MIN, 0.005)
        self.assertAlmostEqual(rows[0]["absolute"], 0.015)
        self.assertIsNone(rows[0]["percent"])


class PeriodValidationTests(unittest.TestCase):
    def test_impossible_periods_are_rejected(self) -> None:
        with self.assertRaises(ValueError):
            validate_period("2024-01-01", "2003-01-01", AVAILABLE)
        with self.assertRaises(ValueError):
            validate_period("2002-01-01", "2003-12-01", AVAILABLE)
        with self.assertRaises(ValueError):
            validate_period("2003-01-01", "2025-12-01", AVAILABLE)
        with self.assertRaises(ValueError):
            month_count(date(2004, 1, 1), date(2003, 1, 1))

    def test_month_count_spans_boundaries(self) -> None:
        self.assertEqual(month_count(date(2003, 1, 1), date(2003, 12, 1)), 12)
        self.assertEqual(month_count(date(2015, 1, 1), date(2016, 6, 1)), 18)


class TrendTests(unittest.TestCase):
    def test_detects_a_known_artificial_trend(self) -> None:
        result = trend(deseasonalize(synthetic(0.05, 0.05, seed=7)), unit="°C/año")
        self.assertEqual(result["status"], "estimated")
        self.assertEqual(result["n"], 264)
        self.assertAlmostEqual(result["slopePerYear"], 0.05, delta=0.01)
        self.assertAlmostEqual(result["slopePerDecade"], result["slopePerYear"] * 10.0)
        self.assertLess(result["pValue"], 0.05)
        self.assertTrue(result["significant"])
        low, high = result["confidenceInterval"]
        self.assertLess(low, 0.05)
        self.assertGreater(high, 0.05)
        self.assertIn("no demuestra causalidad", " ".join(result["warnings"]))

    def test_series_without_trend_is_not_significant(self) -> None:
        result = trend(deseasonalize(synthetic(0.0, 0.3, seed=1)), unit="°C/año")
        self.assertEqual(result["status"], "estimated")
        self.assertGreater(result["pValue"], 0.05)
        self.assertFalse(result["significant"])
        self.assertLess(abs(result["slopePerYear"]), 0.02)

    def test_insufficient_samples_are_flagged(self) -> None:
        short = trend(synthetic(0.05, 0.05, seed=3, years=4))
        self.assertEqual(short["status"], "insufficient-data")
        self.assertEqual(short["n"], 48)
        self.assertIn("Muestra insuficiente", short["warnings"][0])

    def test_too_few_seasonal_months_are_flagged(self) -> None:
        partial = [point for point in synthetic(0.05, 0.05, seed=5, years=11)
                   if point[0].month <= 8]
        result = trend(partial)
        self.assertEqual(result["status"], "insufficient-data")
        self.assertGreater(result["n"], 60)
        self.assertIn("Muestra insuficiente", result["warnings"][0])


class ComparisonTests(unittest.TestCase):
    def test_difference_against_matching_calendar_months(self) -> None:
        points = [(date(2015 + index // 12, index % 12 + 1, 1), 22.0) for index in range(18)]
        result = period_comparison(points, flat_climatology(20.0),
                                   (date(2015, 1, 1), date(2016, 6, 1)), percent=True)
        self.assertEqual(result["status"], "estimated")
        self.assertEqual(result["months"], 18)
        self.assertEqual(result["validMonths"], 18)
        self.assertAlmostEqual(result["coverage"], 1.0)
        self.assertAlmostEqual(result["mean"], 22.0)
        self.assertAlmostEqual(result["referenceMean"], 20.0)
        self.assertAlmostEqual(result["difference"], 2.0)
        self.assertAlmostEqual(result["differencePercent"], 10.0)

    def test_too_few_or_incomplete_periods_are_rejected(self) -> None:
        few = period_comparison([(date(2015, 1, 1), 22.0)], flat_climatology(),
                                (date(2015, 1, 1), date(2016, 6, 1)))
        self.assertEqual(few["status"], "insufficient-data")
        self.assertIsNone(few["mean"])
        partial = period_comparison([(date(2015, 1, 1), 22.0), (date(2015, 2, 1), 22.0),
                                     (date(2015, 3, 1), 22.0), (date(2015, 4, 1), 22.0)],
                                    flat_climatology(), (date(2015, 1, 1), date(2016, 6, 1)))
        self.assertEqual(partial["status"], "insufficient-data")
        self.assertLess(partial["coverage"], 0.5)


class EngineTests(unittest.TestCase):
    def test_results_are_reproducible(self) -> None:
        first = json.dumps(analysis.build(), sort_keys=True, ensure_ascii=False)
        second = json.dumps(analysis.build(), sort_keys=True, ensure_ascii=False)
        self.assertEqual(first, second)

    def test_bundle_grain_and_provenance(self) -> None:
        bundle = analysis.build()
        engine = bundle["engine"]
        self.assertEqual(len(bundle["climatology"]), 2)
        self.assertEqual(len(bundle["anomalies"]), 2)
        self.assertEqual(len(bundle["trends"]), 2)
        self.assertEqual(len(bundle["comparisons"]), 2)
        for item in bundle["climatology"]:
            self.assertEqual([row["month"] for row in item["months"]], list(range(1, 13)))
            self.assertEqual(item["units"], engine_units(item["variableId"]))
        for item in bundle["anomalies"]:
            self.assertEqual(len(item["observations"]), 264)
        for row in bundle["trends"]:
            self.assertTrue({"regionId", "variableId", "datasetId", "start", "end",
                             "n", "warnings"} <= set(row))

    def test_source_series_keep_their_checksum(self) -> None:
        self.assertEqual(checksum(analysis.CHLOROPHYLL), CHLOROPHYLL_SHA256)
        self.assertEqual(checksum(analysis.SST), SST_SHA256)


def engine_units(variable_id: str) -> str:
    return {"sst": "°C", "chlorophyll-a": "mg m-3"}[variable_id]


if __name__ == "__main__":
    unittest.main()
