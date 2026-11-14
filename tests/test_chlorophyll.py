"""Los valores fabricados aquí viven exclusivamente en NetCDF temporales de prueba."""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

import numpy as np
from netCDF4 import Dataset

from scripts.data.chlorophyll import (
    OUTPUT, POLICY, STEP, Config, chlor_variable, clean, expected_axis, export,
    monthly_series, months, ocean_mask, summarize, time_index, verify_original,
)
from scripts.data.ocean_sources import acquire, source_urls


def axis(d: Dataset, name: str, values: np.ndarray, unit: str) -> None:
    d.createDimension(name, len(values))
    v = d.createVariable(name, "f8", (name,))
    v.units = unit
    v[:] = values


class ProcessingTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.path = Path(self.tmp.name) / "synthetic.nc"
        self.cfg = Config("test-only", 0, STEP * 3, 0, STEP * 2, "2004-02", "2004-04", 0.5)

    def test_original_netcdf4_and_geographic_crop(self) -> None:
        c = self.cfg
        lat = expected_axis(c.south, c.north)[::-1]
        lon = expected_axis(c.west, c.east)
        with Dataset(self.path, "w", format="NETCDF4") as d:
            axis(d, "lat", np.r_[lat[0] + STEP, lat], "degrees_north")
            axis(d, "lon", lon, "degrees_east")
            d.setncatts({"product_name": "AQUA_MODIS.20040201_20040229.L3m.MO.CHL.chlor_a.4km.nc",
                         "processing_version": "R2022.0", "measure": "Mean", "platform": "Aqua",
                         "instrument": "MODIS", "processing_level": "L3 Mapped", "temporal_range": "month",
                         "l2_flag_names": "LAND,CLDICE", "license": POLICY})
            v = d.createVariable("chlor_a", "f4", ("lat", "lon"), fill_value=-32767.)
            v.setncatts({"units": "mg m^-3", "valid_min": np.float32(.001), "valid_max": np.float32(100)})
            v[:] = [[30, 30, 30], [2, -32767, np.nan], [np.inf, -1, 101]]
        with Dataset(self.path, "r+") as d:
            first = np.array([[2, np.nan, np.nan], [np.nan, np.nan, np.nan]])
            verify_original(d, c, lat, lon, first)
            with self.assertRaises(ValueError):
                verify_original(d, c, lat, lon, np.ones_like(first))
            self.assertEqual(clean(d["chlor_a"], 0).tolist(), [30, 30, 30])
            d["chlor_a"].units = "kg m-3"
            with self.assertRaises(ValueError):
                chlor_variable(d, ("lat", "lon"))

    def test_land_coast_and_missing_relief(self) -> None:
        c = Config("test-only", 0, STEP*2, 0, STEP*2, "2003-01", "2003-01", .5)
        with Dataset(self.path, "w") as d:
            nodes = np.arange(6)/60
            axis(d, "latitude", nodes, "degrees_north")
            axis(d, "longitude", nodes, "degrees_east")
            z = d.createVariable("altitude", "i2", ("latitude", "longitude"), fill_value=32767)
            z.units, z.positive, d.id = "m", "up", "etopo180"
            z[:] = -20
            z[1, 1], z[5, 5] = 1, 32767
            centers = expected_axis(0, STEP*2)
            mask = ocean_mask(d, centers[::-1], centers, c)
            self.assertEqual(mask.tolist(), [[True, False], [False, True]])
            values = np.array([[4, 100], [100, 2]])
            self.assertEqual(summarize(values, mask, np.ones((2,2)), .5), (3, 2, "valid"))

    def test_coverage_and_weighting(self) -> None:
        ocean = np.ones((2, 2), dtype=bool)
        weights = np.array([[1., 1.], [.5, .5]])
        for values, expected in [
            ([[np.nan, np.nan], [np.nan, np.nan]], (None, 0, "no-valid-pixels")),
            ([[1., np.nan], [np.nan, np.nan]], (None, 1, "insufficient-coverage")),
            ([[1., np.nan], [4., np.nan]], (2., 2, "valid")),
        ]:
            self.assertEqual(summarize(np.array(values), ocean, weights, .5), expected)

    def test_cf_dates_gaps_and_duplicate_month(self) -> None:
        calendar = list(months(self.cfg))
        with Dataset(self.path, "w") as d:
            stamps = [((day - date(1970, 1, 1)).days + 15) * 86400 for day in (calendar[0], calendar[2])]
            axis(d, "time", np.array(stamps), "seconds since 1970-01-01T00:00:00Z")
            self.assertEqual(time_index(d), {calendar[0]: 0, calendar[2]: 1})
            d["time"][1] = stamps[0] + 86400
            with self.assertRaises(ValueError):
                time_index(d)

    def test_public_series_calendar_qa_and_provenance(self) -> None:
        cfg = Config.load()
        bundle = json.loads(OUTPUT.read_bytes())
        obs, cov = bundle["observations"], bundle["coverage"]
        self.assertEqual([row["date"] for row in obs], [m.isoformat() for m in months(cfg)])
        for row, n in zip(obs, cov["validCellsByMonth"], strict=True):
            self.assertEqual(row["datasetId"], bundle["dataset"]["id"])
            self.assertEqual(row["regionId"], cfg.regionId)
            if n is None:
                self.assertEqual((row["value"], row["qualityFlag"]), (None, "month-absent"))
            elif n < cov["minimumValidFraction"] * cov["oceanCells"]:
                self.assertIsNone(row["value"])
            else:
                self.assertTrue(0.001 <= row["value"] <= 100 and n <= cov["oceanCells"])
        for key, url in source_urls(cfg).items():
            receipt = bundle["provenance"]["inputs"][key]
            self.assertEqual(receipt["url"], url)
            self.assertRegex(receipt["sha256"], r"^[0-9a-f]{64}$")
        self.assertNotRegex(OUTPUT.read_text(encoding="utf-8").lower(),
                            r"bearer |authorization|password|token=|x-amz-|earthdata_token")
        export(bundle, self.path)
        self.assertEqual(self.path.read_bytes(), OUTPUT.read_bytes())

    def test_repeated_monthly_transform_and_gap_export(self) -> None:
        dates = list(months(self.cfg))
        with Dataset(self.path, "w") as d:
            d.createDimension("t", 2)
            d.createDimension("y", 1)
            d.createDimension("x", 4)
            v = d.createVariable("chlor_a", "f4", ("t", "y", "x"), fill_value=-32767.)
            v.valid_min, v.valid_max = np.float32(.001), np.float32(100)
            v[:] = [[[2, 4, 80, -32767]], [[1, np.nan, 90, -32767]]]
            args = (v, {dates[0]: 0, dates[2]: 1}, dates, self.cfg,
                    np.array([[True, True, False, True]]), np.array([0.]))
            first, counts = monthly_series(*args)
            self.assertEqual(counts, [2, None, 1])
            self.assertEqual([r["value"] for r in first], [3., None, None])
            self.assertEqual([r["qualityFlag"] for r in first], ["valid", "month-absent", "insufficient-coverage"])
            target = Path(self.tmp.name) / "synthetic.json"
            export({"observations": first}, target)
            saved = target.read_bytes()
            export({"observations": monthly_series(*args)[0]}, target)
            self.assertEqual(saved, target.read_bytes())

    def test_missing_offline_inputs_fail(self) -> None:
        with self.assertRaises(FileNotFoundError):
            acquire(source_urls(self.cfg)["relief"], Path(self.tmp.name), True)
