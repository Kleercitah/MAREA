import json
import unittest
from calendar import monthrange
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import numpy as np
from netCDF4 import Dataset, num2date

from scripts.data.chlorophyll import ocean_mask
from scripts.data.spatial import DIRECTORY, cached, generate, raster_bytes
from scripts.data.ocean_sources import ROOT, Config
from scripts.data.regional import time_index
from scripts.data.sst import celsius


class SpatialTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads((DIRECTORY / "manifest.json").read_bytes())

    def test_grids_alignment_and_provenance(self):
        c = Config.load()
        self.assertEqual(self.manifest["bounds"], [[c.south,c.west],[c.north,c.east]])
        for layer in self.manifest["layers"]:
            with self.subTest(file=layer["file"]):
                raw = raster_bytes(layer, DIRECTORY)
                a = np.frombuffer(raw, "<f4").reshape(layer["height"], layer["width"])
                self.assertTrue(np.isnan(a).any())
                self.assertEqual(float(np.nanmin(a)), layer["min"])
                self.assertEqual(float(np.nanmax(a)), layer["max"])
                self.assertGreater(layer["max"], layer["min"])
                self.assertTrue(layer["inputs"][0]["url"].startswith("https://coastwatch.pfeg.noaa.gov/"))
                row = int((layer["north"] + .55)/layer["step"])
                col = int((-91.1 - layer["west"])/layer["step"])
                self.assertTrue(np.isnan(a[row, col]))  # Interior de Isabela.
                self.assertEqual(layer["units"], "°C" if layer["variable"] == "sst" else "mg/m³")

    def test_historical_inventory_and_original_layers(self):
        layers = self.manifest["layers"]
        keys = {(layer["month"], layer["variable"]) for layer in layers}
        self.assertEqual(len(keys), len(layers))
        for year in range(2003, 2014):
            for month in range(1, 13):
                for variable in ("sst", "chlorophyll-a"):
                    self.assertIn((f"{year}-{month:02}", variable), keys)
        for name in ("sst-2015-12-b96c6e2a64.f32", "sst-2024-10-a16fd6c6f8.f32",
                     "chlorophyll-2015-12-e2efe0ad8f.f32", "chlorophyll-2024-10-5c430eebf3.f32"):
            self.assertIn(name, {layer["file"] for layer in layers})

    def test_resume_retains_successes_after_a_failed_month(self):
        dates = ["2003-01", "2003-02", "2003-03"]
        grid = (np.array([[1., np.nan]]), 1., -90., .01, [])
        with TemporaryDirectory() as tmp:
            out = Path(tmp)
            with patch("scripts.data.spatial.field", side_effect=[grid, OSError("fixture"), grid]):
                self.assertEqual(generate(dates, out, out, ("sst",)), 1)
            manifest = out / "manifest.json"
            self.assertEqual([l["month"] for l in json.loads(manifest.read_bytes())["layers"]], dates[::2])
            with patch("scripts.data.spatial.field", return_value=grid) as source:
                self.assertEqual(generate(dates, out, out, ("sst",)), 0)
                self.assertEqual(source.call_count, 1)
            before = manifest.read_bytes()
            with patch("scripts.data.spatial.field", side_effect=AssertionError):
                self.assertEqual(generate(dates, out, out, ("sst",)), 0)
                self.assertEqual(manifest.read_bytes(), before)

    def test_modern_inventory_covers_every_available_month(self):
        keys = {(layer["variable"], layer["month"]) for layer in self.manifest["layers"]}
        for year in range(2014, 2025):
            for month in range(1, 13):
                stamp = f"{year}-{month:02}"
                self.assertIn(("sst", stamp), keys)
                if stamp not in {"2024-01", "2024-11", "2024-12"}:
                    self.assertIn(("chlorophyll-a", stamp), keys)

    def daily_source(self, layer, month, cache):
        days = monthrange(month.year, month.month)[1]
        last = month.replace(day=days)
        total = count = None
        lat = lon = None
        for receipt in layer["inputs"]:
            with Dataset(cached(receipt, cache)) as d:
                v, m = d["analysed_sst"], d["mask"]
                lat, lon = d["latitude"][:], d["longitude"][:]
                if total is None:
                    total = np.zeros((lat.size, lon.size))
                    count = np.zeros((lat.size, lon.size), dtype=np.int32)
                for i, stamp in enumerate(num2date(d["time"][:], d["time"].units)):
                    day = date(stamp.year, stamp.month, stamp.day)
                    if not month <= day <= last:
                        continue
                    water = np.ma.asarray(m[i]).filled(0) == 1
                    values = celsius(np.ma.asarray(v[i], dtype=np.float64).filled(np.nan), v.units)
                    good = water & np.isfinite(values)
                    total[good] += values[good]
                    count += good
        means = np.divide(total, count, out=np.full_like(total, np.nan), where=count > 0)
        src = np.where((count >= days/2) & (count <= days), means, np.nan)[-2:0:-1, 1:-1]
        return src.astype("<f4"), lat[-2:0:-1], lon[1:-1]

    def test_source_coordinates_and_every_published_value(self):
        cache = ROOT / ".marea-cache"
        if not cache.exists():
            self.skipTest("Se requiere la caché NetCDF para el contraste directo")
        relief_mask = None
        for l in self.manifest["layers"]:
            month = date.fromisoformat(l["month"] + "-01")
            if l["variable"] == "sst" and "jplMURSST41.nc" in l["inputs"][0]["url"]:
                src, lat, lon = self.daily_source(l, month, cache)
            else:
                with Dataset(cached(l["inputs"][0], cache)) as d:
                    var = "sst" if l["variable"] == "sst" else "chlor_a"
                    i = time_index(d)[month]
                    src = d[var][i].filled(np.nan)
                    lat, lon = d["latitude"][:], d["longitude"][:]
                    if var == "sst":
                        self.assertIn(d[var].units, ("degree_C", "degrees_Celsius"))
                        days = monthrange(month.year, month.month)[1]
                        nobs = d["nobs"][i]
                        mask = (d["mask"][i] == 1) & (nobs >= days/2) & (nobs <= days) & (nobs == np.floor(nobs))
                        src = np.where(mask, src, np.nan)[-2:0:-1,1:-1]
                        lat, lon = lat[-2:0:-1], lon[1:-1]
                    else:
                        self.assertIn(d[var].units, ("mg m-3", "mg m^-3"))
                        if relief_mask is None:
                            with Dataset(cached(l["inputs"][1], cache)) as relief:
                                relief_mask = ocean_mask(relief, lat, lon, Config.load())
                        src = np.where(relief_mask & (src >= d[var].valid_min) & (src <= d[var].valid_max), src, np.nan)
            a = np.frombuffer(raster_bytes(l, DIRECTORY), "<f4").reshape(src.shape)
            np.testing.assert_allclose(l["north"]-(np.arange(l["height"])+.5)*l["step"], lat, atol=1e-5, rtol=0)
            np.testing.assert_allclose(l["west"]+(np.arange(l["width"])+.5)*l["step"], lon, atol=1e-5, rtol=0)
            np.testing.assert_array_equal(a, src)
