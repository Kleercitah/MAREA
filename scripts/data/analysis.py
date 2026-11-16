"""Motor de análisis estadístico de MAREA. Ejecutar desde la raíz con -m.

Lee las series mensuales publicadas, calcula climatologías, anomalías, tendencias y
comparaciones de periodos, y exporta un único JSON compacto para la aplicación web.
"""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any

from .ocean_sources import ROOT, checksum
from .regional import export, require
from .statistics import (
    AUTOCORRELATION_LAGS, CONFIDENCE, MIN_COMPARISON_COVERAGE, MIN_COMPARISON_MONTHS,
    MIN_SEASONAL_MONTHS, MIN_SEASON_YEARS, MIN_TREND_OBSERVATIONS, MIN_YEARS_CLIMATOLOGY,
    PERCENT_DENOMINATOR_MIN, Point, anomaly_rows, climatology_means, monthly_climatology,
    period_comparison, trend, validate_period,
)

CHLOROPHYLL = ROOT / "public/data/chlorophyll-monthly.json"
SST = ROOT / "public/data/sst-monthly.json"
OUTPUT = ROOT / "public/data/marea-analysis.json"
VARIABLES: tuple[dict[str, Any], ...] = (
    {"key": "sst", "path": SST, "variableId": "sst", "units": "°C", "percent": False},
    {"key": "chlorophyll", "path": CHLOROPHYLL, "variableId": "chlorophyll-a",
     "units": "mg m-3", "percent": True},
)
ENSO_STUDY = {"start": "2015-01-01", "end": "2016-06-30"}
ENSO_LABEL = {"es": "Episodio cálido 2015-2016", "en": "2015-2016 warm episode"}
ENSO_CITATION = (
    "NOAA Climate Prediction Center, Oceanic Nino Index (ERSSTv5), "
    "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v5/"
)
ENSO_NOTES = {
    "es": "Intervalo derivado del índice ONI: todas las temporadas móviles de tres meses, de "
          "DJF 2015 a AMJ 2016, alcanzan o superan +0,5 °C. La misma tabla sitúa el primer cruce "
          "del umbral en SON 2014, de modo que el episodio cálido comienza antes de 2015.",
    "en": "Interval derived from the ONI: every overlapping three-month season from DJF 2015 to "
          "AMJ 2016 reaches or exceeds +0.5 °C. The same table places the first crossing of the "
          "threshold in SON 2014, so the warm episode begins before 2015.",
}
BASELINE_NOTE = {
    "es": "2003-2024 es el periodo de referencia disponible de MAREA, no una normal "
          "climatológica oficial de 30 años.",
    "en": "2003-2024 is MAREA's available reference period, not an official 30-year "
          "climatological normal.",
}
METHODS = {
    "climatology": {
        "es": "Media y desviación estándar por mes del calendario sobre los años con observación "
              "válida. Los meses ausentes no se sustituyen.",
        "en": "Mean and standard deviation per calendar month over the years with a valid "
              "observation. Missing months are not replaced.",
    },
    "anomaly": {
        "es": "Diferencia entre la observación y la climatología de su mismo mes. La clorofila "
              "añade el cociente porcentual cuando la climatología alcanza el umbral numérico.",
        "en": "Difference between the observation and the climatology of the same month. "
              "Chlorophyll also reports the percent ratio when the climatology reaches the "
              "numeric threshold.",
    },
    "trend": {
        "es": "Seasonal Mann-Kendall sobre anomalías desestacionalizadas, con varianza corregida "
              "por Hamed y Rao para la autocorrelación serial. La magnitud es la pendiente "
              "estacional de Sen y su intervalo de confianza es no paramétrico.",
        "en": "Seasonal Mann-Kendall on deseasonalized anomalies, with variance corrected by "
              "Hamed and Rao for serial autocorrelation. Magnitude is the seasonal Sen slope and "
              "its confidence interval is non-parametric.",
    },
    "comparison": {
        "es": "Media de un intervalo frente a la climatología de los mismos meses del calendario, "
              "de modo que la diferencia no mezcla estaciones.",
        "en": "Mean of an interval against the climatology of the same calendar months, so the "
              "difference does not mix seasons.",
    },
}


def load(path: Path) -> dict[str, Any]:
    bundle = json.loads(path.read_text(encoding="utf-8"))
    require(set(bundle) == {"dataset", "region", "coverage", "provenance", "observations"},
            f"Estructura inesperada en {path.name}")
    return bundle


def series(bundle: dict[str, Any], variable_id: str) -> list[Point]:
    points = []
    for row in bundle["observations"]:
        require(row["variableId"] == variable_id, "variableId inesperado en la serie")
        day = date.fromisoformat(row["date"])
        require(day.day == 1, "La observacion no corresponde al primer dia del mes")
        value = row["value"]
        require(value is None or isinstance(value, (int, float)) and not isinstance(value, bool),
                "Valor no numerico")
        points.append((day, None if value is None else float(value)))
    days = [day for day, _ in points]
    require(days == sorted(days) and len(set(days)) == len(days),
            "Las fechas de la serie no son unicas y crecientes")
    return points


def anomalies(points: list[Point], climatology: list[dict[str, Any]]) -> list[Point]:
    means = climatology_means(climatology)
    return [(day, None if value is None or day.month not in means else value - means[day.month])
            for day, value in points]


def analyse(spec: dict[str, Any], baseline: dict[str, str]) -> dict[str, Any]:
    bundle = load(spec["path"])
    require(bundle["dataset"]["units"] == spec["units"], "Unidades distintas de las esperadas")
    points = series(bundle, spec["variableId"])
    available = (points[0][0], points[-1][0])
    climatology = monthly_climatology(points)
    absolute = anomalies(points, climatology)
    rows = anomaly_rows(points, climatology, percent=spec["percent"])
    require([row["date"] for row in rows] == [day.isoformat() for day, _ in points],
            "La exportacion de anomalias pierde fechas")
    result = trend(absolute, unit=f"{spec['units']}/año")
    period = bundle["dataset"]["period"]
    trend_result = {"regionId": bundle["region"]["id"], "variableId": spec["variableId"],
                    "datasetId": bundle["dataset"]["id"], "start": period["start"],
                    "end": period["end"], **result}
    period_start, period_end = validate_period(ENSO_STUDY["start"], ENSO_STUDY["end"], available)
    comparison = period_comparison(points, climatology, (period_start, period_end),
                                   percent=spec["percent"])
    comparison_result = {"id": f"elnino-2015-2016-{spec['key']}", "label": ENSO_LABEL,
                         "regionId": bundle["region"]["id"], "variableId": spec["variableId"],
                         "datasetId": bundle["dataset"]["id"], "units": spec["units"],
                         "period": dict(ENSO_STUDY), "reference": dict(baseline),
                         "citation": ENSO_CITATION, "notes": ENSO_NOTES, **comparison}
    climatology_result = {"regionId": bundle["region"]["id"], "variableId": spec["variableId"],
                          "datasetId": bundle["dataset"]["id"], "baseline": dict(baseline),
                          "units": spec["units"], "months": climatology}
    anomaly_result = {"regionId": bundle["region"]["id"], "variableId": spec["variableId"],
                      "datasetId": bundle["dataset"]["id"], "baseline": dict(baseline),
                      "units": spec["units"], "method": METHODS["anomaly"]["es"],
                      "observations": rows}
    return {"climatology": climatology_result, "anomalies": anomaly_result,
            "trend": trend_result, "comparison": comparison_result,
            "input": {"datasetId": bundle["dataset"]["id"], "sha256": checksum(spec["path"]),
                      "period": dict(period)}}


def build() -> dict[str, Any]:
    analyses = {spec["key"]: analyse(spec, load(SST)["dataset"]["period"]) for spec in VARIABLES}
    baseline = load(SST)["dataset"]["period"]
    return {
        "engine": {"version": "1.0.0", "baseline": dict(baseline), "baselineNote": BASELINE_NOTE,
                   "methods": METHODS, "confidence": CONFIDENCE,
                   "thresholds": {"minimumYearsPerMonth": MIN_YEARS_CLIMATOLOGY,
                                  "minimumSeasonYears": MIN_SEASON_YEARS,
                                  "minimumSeasonalMonths": MIN_SEASONAL_MONTHS,
                                  "minimumTrendObservations": MIN_TREND_OBSERVATIONS,
                                  "minimumComparisonMonths": MIN_COMPARISON_MONTHS,
                                  "minimumComparisonCoverage": MIN_COMPARISON_COVERAGE,
                                  "percentDenominatorMin": PERCENT_DENOMINATOR_MIN,
                                  "autocorrelationLags": AUTOCORRELATION_LAGS},
                   "inputs": {spec["key"]: analyses[spec["key"]]["input"] for spec in VARIABLES}},
        "climatology": [analyses[spec["key"]]["climatology"] for spec in VARIABLES],
        "anomalies": [analyses[spec["key"]]["anomalies"] for spec in VARIABLES],
        "trends": [analyses[spec["key"]]["trend"] for spec in VARIABLES],
        "comparisons": [analyses[spec["key"]]["comparison"] for spec in VARIABLES],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    args = parser.parse_args()
    bundle = build()
    export(bundle, args.output)
    for row in bundle["trends"]:
        detail = "muestra insuficiente" if row["status"] == "insufficient-data" else (
            f"{row['slopePerYear']:+.5f} {row['unit']} (p = {row['pValue']:.4f})")
        print(f"{row['variableId']}: {detail}")


if __name__ == "__main__":
    main()
