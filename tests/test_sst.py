"""Pruebas de medias regionales MUR con recortes NetCDF temporales."""
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

import numpy as np
from netCDF4 import Dataset

from scripts.data.ocean_sources import Config
from scripts.data.sst import CATALOG, area_weights, celsius, month_mean, read_batch


class SeaTemperatureTests(unittest.TestCase):
    def test_units(self) -> None:
        np.testing.assert_allclose(celsius(np.array([273.15, 300]), "kelvin"), [0, 26.85])
        self.assertEqual(celsius(np.array([24.5]), "degree_C")[0], 24.5)
        with self.assertRaises(ValueError):
            celsius(np.array([32]), "degree_F")

    def test_quality_weights_and_temporal_support(self) -> None:
        temp = np.array([[12., 24., 55., 66., np.nan, 80.]])
        flags = np.array([[1., 1., 2., 5., 1., 1.]])
        days = np.array([[29., 15., 29., 29., 29., 14.]])
        weights = np.array([[1., 3., 1., 1., 1., 1.]])
        mean, qa, counts = month_mean(temp, flags, days, weights, 29, .5)
        self.assertEqual((mean, qa), (21., "valid"))
        self.assertEqual(counts, {"oceanCells": 4, "validCells": 2, "calendarDays": 29, "contributingCellDays": 44})
        days[0, 0] = 30
        self.assertEqual(month_mean(temp, flags, days, weights, 29, .5)[:2], (None, "insufficient-coverage"))

    def test_netcdf_crop_dates_and_missing(self) -> None:
        cfg = Config("test", -90, -89.98, 0, .02, "2004-02", "2004-03", .5)
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "synthetic.nc"
            with Dataset(path, "w") as d:
                axes = [
                    ("time", [(date(2004, 2, 16)-date(1970, 1, 1)).days*86400], "seconds since 1970-01-01T00:00:00Z"),
                    ("latitude", [0., .01, .02], "degrees_north"),
                    ("longitude", [-90., -89.99, -89.98], "degrees_east"),
                ]
                for name, values, units in axes:
                    d.createDimension(name, len(values))
                    v = d.createVariable(name, "f8", (name,))
                    v.units, v[:] = units, values
                dims = ("time", "latitude", "longitude")
                var = d.createVariable("sst", "f4", dims, fill_value=-999.)
                var.standard_name, var.units = "sea_surface_foundation_temperature", "degree_C"
                var[:] = 20
                var[0, 1, 1] = -999
                mask = d.createVariable("mask", "i1", dims)
                mask.flag_meanings, mask[:] = "1=open-sea, 2=land", 1
                d.createVariable("nobs", "i4", dims)[:] = 29
                d.infoUrl, d.title, d.license = CATALOG, "Test fv04.1 Monthly", "TEST"
                weights = area_weights(d, cfg)
                self.assertAlmostEqual(weights[1, 1] / weights[1, 0], 2)
                self.assertAlmostEqual(weights.sum(), np.deg2rad(.02)*np.sin(np.deg2rad(.02)))
            dates = [date(2004, 2, 1), date(2004, 3, 1)]
            rows, coverage, _ = read_batch(path, dates, cfg)
            self.assertAlmostEqual(rows[0]["value"], 20)
            self.assertEqual(coverage[0]["validCells"], 8)
            self.assertEqual((rows[1]["value"], rows[1]["qualityFlag"], coverage[1]), (None, "month-absent", None))
            self.assertEqual(read_batch(path, dates, cfg)[0], rows)
            with Dataset(path, "r+") as d:
                d["longitude"][2] = -89.97
            with self.assertRaises(ValueError):
                read_batch(path, dates, cfg)
