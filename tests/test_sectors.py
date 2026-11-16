import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

import numpy as np

from scripts.data.ocean_sources import Config, checksum
from scripts.data.regional import months
from scripts.data.sectors import OUTPUT, adjust_by, analyse_series, build, monthly_means
from scripts.data.spatial import DIRECTORY, raster_bytes
from scripts.data.statistics import rank_autocorrelation


class SectorTests(unittest.TestCase):
    def test_spatial_thresholds_and_land(self):
        # Mar sin datos, fracción insuficiente, tres celdas y mínimo exacto.
        areas = np.array([[0., 4., 3., 4.]])
        means, coverage, accepted = monthly_means(areas*2, areas, np.array([[0,4,3,4]]),
                                                  np.array([0.,10.,3.,8.]))
        np.testing.assert_allclose(coverage, [[0,.4,1,.5]])
        np.testing.assert_array_equal(accepted, [[False,False,False,True]])
        np.testing.assert_allclose(means, [[np.nan,np.nan,np.nan,2.]])

    def test_known_slopes_with_seasonality_persistence_and_gaps(self):
        days = list(months(Config.load()))
        noise = np.random.default_rng(17).normal(0, .015, len(days))
        for i in range(1, len(days)):
            noise[i] += .6 * noise[i-1]
        for slope in (-.1, .1, 0):
            values = [None if i % 29 == 0 else float(noise[i]+slope*i/12+2*np.sin(i*np.pi/6))
                      for i in range(len(days))]
            result, detail = analyse_series(days, values, False)
            self.assertAlmostEqual(result["slope"], 10*slope, delta=.02)
            self.assertEqual(result["local"], slope != 0)
            self.assertIsNone(detail["anomalies"][0])
            self.assertEqual(result, analyse_series(days, values, False)[0])
        sparse = [None if i % 2 else float(i) for i in range(len(days))]
        self.assertIsNone(analyse_series(days, sparse, False)[0]["slope"])
        self.assertEqual(rank_autocorrelation(np.array([1.,np.nan,2.,np.nan,3.]),1),0)

    def test_adjustment_multiple_testing(self):
        # Tres pruebas: factor armónico 11/6, acumulación monótona desde la cola.
        np.testing.assert_allclose(adjust_by([.7,.001,.02]), [1,.0055,.055])
        self.assertEqual(adjust_by([]), [])
        np.testing.assert_allclose(adjust_by([.01,.01]), [.015,.015])

    def test_native_values_missing_months_and_regional_control(self):
        index = json.loads((OUTPUT / "index.json").read_bytes())
        manifest = json.loads((DIRECTORY / "manifest.json").read_bytes())
        self.assertEqual(index["manifestSHA256"], checksum(DIRECTORY / "manifest.json"))
        for var, summary in index["variables"].items():
            detail = json.loads((OUTPUT / f"{var}.json").read_bytes())
            layers = [l for l in manifest["layers"] if l["variable"] == var]
            self.assertEqual(len(layers),summary["control"]["months"])
            for layer in [layers[0], layers[-1]]:
                grid = np.frombuffer(raster_bytes(layer,DIRECTORY),"<f4").reshape(layer["height"],layer["width"])
                y = layer["north"]-(np.arange(grid.shape[0])+.5)*layer["step"]
                x = layer["west"]+(np.arange(grid.shape[1])+.5)*layer["step"]
                # R01C01: norte y oeste inclusivos; sur y este exclusivos.
                pick = ((y>1.50+1e-8)&(y<=1.75+1e-8))[:,None] & ((x>=-92-1e-8)&(x<-91.75-1e-8)) & np.isfinite(grid)
                weights = np.broadcast_to(np.cos(np.deg2rad(y))[:,None],grid.shape)
                i = index["dates"].index(layer["month"]+"-01")
                self.assertAlmostEqual(detail["R01C01"]["values"][i], np.average(grid[pick],weights=weights[pick]),places=8)
            for key, result in summary["records"].items():
                series = detail[key]
                self.assertEqual(sum(v is not None for v in series["values"]),result["valid"])
                for value,coverage in zip(series["values"],series["spatialCoverage"]):
                    if value is not None:
                        self.assertGreaterEqual(coverage,.5)
                if var == "chlorophyll-a":
                    self.assertIsNone(series["values"][-1])
                    self.assertIsNone(series["values"][-2])
                    self.assertIsNone(series["values"][-12])
            self.assertLess(summary["control"]["maximumAbsolute"],.005 if var=="sst" else .05)

    def test_offline_reproduction(self):
        with TemporaryDirectory() as temp:
            build(Path(temp))
            for path in OUTPUT.glob("*.json"):
                self.assertEqual(checksum(path),checksum(Path(temp)/path.name))
