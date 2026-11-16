"""Agregación y análisis sectorial offline de las rejillas publicadas por MAREA."""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

import numpy as np

from .analysis import ENSO_STUDY, VARIABLES, anomalies
from .ocean_sources import ROOT, Config, checksum
from .regional import export, months, require
from .spatial import DIRECTORY, raster_bytes
from .statistics import monthly_climatology, period_comparison, trend

SIZE = 0.25
MIN_CELLS = 4
MIN_AREA = 0.50
MIN_MONTHS = 0.75
OUTPUT = ROOT / "public/data/sectors"


def adjust_by(pvalues: list[float]) -> list[float]:
    """Ajuste de Benjamini–Yekutieli en el orden original."""
    p = np.asarray(pvalues, dtype=float)
    require(bool(np.all(np.isfinite(p) & (p >= 0) & (p <= 1))), "Valor p inválido")
    ranks = np.arange(1, len(p) + 1)
    order = np.argsort(p, kind="stable")
    q = np.empty_like(p)
    raw = p[order] * len(p) * np.sum(1 / ranks) / ranks
    q[order] = np.minimum(1, np.minimum.accumulate(raw[::-1])[::-1])
    return q.tolist()


def native_geometry(layer: dict, config: Config):
    step = layer["step"]
    lat = layer["north"] - (np.arange(layer["height"]) + .5) * step
    lon = layer["west"] + (np.arange(layer["width"]) + .5) * step
    rows = np.floor(np.round((config.north - lat) / SIZE, 8)).astype(int)
    cols = np.floor(np.round((lon - config.west) / SIZE, 8)).astype(int)
    nx = round((config.east - config.west) / SIZE)
    ny = round((config.north - config.south) / SIZE)
    require(min(rows) >= 0 and max(rows) < ny and min(cols) >= 0 and max(cols) < nx,
            "Centros fuera de los sectores")
    ids = rows[:, None] * nx + cols
    weights = np.broadcast_to(np.cos(np.deg2rad(lat))[:, None], ids.shape)
    return ids, weights, nx * ny


def mask_path(mask: np.ndarray) -> str:
    """Tramos horizontales de celdas con soporte observado, en coordenadas nativas."""
    path = []
    for y, row in enumerate(mask):
        edges = np.flatnonzero(np.diff(row.astype(int), prepend=0, append=0))
        for start, end in edges.reshape(-1, 2):
            path.append(f"M{start} {y}h{end-start}v1h{start-end}z")
    return "".join(path)


def monthly_means(totals: np.ndarray, areas: np.ndarray, cells: np.ndarray, support: np.ndarray):
    fraction = np.divide(areas, support, out=np.zeros_like(areas), where=support > 0)
    accepted = (cells >= MIN_CELLS) & (fraction >= MIN_AREA)
    means = np.divide(totals, areas, out=np.full_like(areas, np.nan), where=accepted)
    return means, fraction, accepted


def analyse_series(days: list[date], values: list, percent: bool) -> tuple[dict, dict]:
    points = list(zip(days, values))
    climate = monthly_climatology(points)
    absolute = anomalies(points, climate)
    n = sum(value is not None for value in values)
    result = trend(absolute, calendar_lags=True) if n >= len(days) * MIN_MONTHS else {}
    ci = result.get("confidenceInterval")
    period = tuple(date.fromisoformat(ENSO_STUDY[k]) for k in ("start", "end"))
    comparison = period_comparison(points, climate, period, percent=percent)
    summary = {"valid": n, "n": result.get("n", 0), "slope": result.get("slopePerDecade"),
               "ci": [v * 10 for v in ci] if ci else None, "p": result.get("pValue"),
               "q": None, "local": result.get("significant"), "adjusted": None,
               "quality": "estimated" if ci else "insufficient",
               "episode": {k: comparison[k] for k in ("validMonths", "months", "difference", "mean", "referenceMean")}}
    detail = {"values": values, "anomalies": [v for _, v in absolute],
              "climatology": [r.get("mean") for r in climate]}
    return summary, detail


def build_variable(spec: dict, layers: list, days: list, config: Config) -> tuple[dict, dict]:
    regional = json.loads(spec["path"].read_bytes())
    meta = regional["dataset"]
    first = layers[0]
    geometry = {k: first[k] for k in ("north", "west", "height", "width", "step")}
    ids, weights, count = native_geometry(first, config)
    month_index = {d.strftime("%Y-%m"): i for i, d in enumerate(days)}
    totals = np.zeros((len(days), count))
    areas = np.zeros_like(totals)
    cells = np.zeros_like(totals)
    support = np.zeros(ids.shape, dtype=bool)
    visited = set()
    for layer in layers:
        stamp = layer["month"]
        require(stamp in month_index and stamp not in visited and layer["datasetId"] == meta["id"]
                and layer["units"] == ("°C" if spec["key"] == "sst" else "mg/m³")
                and all(layer[k] == v for k, v in geometry.items()), "Manifiesto incompatible")
        visited.add(stamp)
        i = month_index[stamp]
        grid = np.frombuffer(raster_bytes(layer, DIRECTORY), "<f4").reshape(ids.shape)
        valid = np.isfinite(grid)
        support |= valid
        index, area = ids[valid], weights[valid]
        areas[i] = np.bincount(index, area, minlength=count)
        cells[i] = np.bincount(index, minlength=count)
        totals[i] = np.bincount(index, area * grid[valid], minlength=count)
    eligible = np.bincount(ids[support], weights[support], minlength=count)
    means, fractions, accepted = monthly_means(totals, areas, cells, eligible)
    nx = round((config.east - config.west) / SIZE)
    records, details = {}, {}
    for idx in range(count):
        row, col = divmod(idx, nx)
        key = f"R{row+1:02}C{col+1:02}"
        values = [float(v) if np.isfinite(v) else None for v in means[:, idx]]
        summary, detail = analyse_series(days, values, spec["percent"])
        summary["supportCells"] = int(np.sum(support & (ids == idx)))
        records[key] = summary
        details[key] = {**detail, "spatialCoverage": fractions[:, idx].round(5).tolist()}
    tested = [r for r in records.values() if r["p"] is not None]
    for record, q in zip(tested, adjust_by([r["p"] for r in tested])):
        record.update(q=q, adjusted=q < .05)
    # Reconstrucción con el área válida de cada media sectorial admitida.
    retained = np.where(accepted, areas, 0).sum(axis=1)
    reconstructed = np.divide(np.where(accepted, totals, 0).sum(axis=1), retained,
                              out=np.full(len(days), np.nan), where=retained > 0)
    reference = {r["date"]: r["value"] for r in regional["observations"]}
    delta = [v-reference[d.isoformat()] for d,v in zip(days, reconstructed)
             if np.isfinite(v) and reference[d.isoformat()] is not None]
    control = {"months": len(delta), "meanAbsolute": float(np.mean(np.abs(delta))),
               "maximumAbsolute": float(np.max(np.abs(delta)))}
    return ({"datasetId": meta["id"], "source": meta["sourceUrl"], "units": first["units"],
             "geometry": geometry, "mask": mask_path(support), "records": records,
             "control": control, "layerCount": len(layers)}, details)


def build(output: Path = OUTPUT):
    config = Config.load()
    days = list(months(config))
    manifest_path = DIRECTORY / "manifest.json"
    manifest = json.loads(manifest_path.read_bytes())
    require(manifest["bounds"] == [[config.south, config.west], [config.north, config.east]], "Región incompatible")
    output.mkdir(parents=True, exist_ok=True)
    index = {"bounds": manifest["bounds"], "size": SIZE, "dates": [d.isoformat() for d in days],
             "manifestSHA256": checksum(manifest_path), "episode": ENSO_STUDY,
             "minimumSpatialCoverage": MIN_AREA, "minimumCells": MIN_CELLS,
             "minimumTemporalCoverage": MIN_MONTHS, "adjustment": "Benjamini–Yekutieli", "variables": {}}
    for spec in VARIABLES:
        var = spec["variableId"]
        layers = [l for l in manifest["layers"] if l["variable"] == var]
        summary, detail = build_variable(spec, layers, days, config)
        index["variables"][var] = summary
        export(detail, output / f"{var}.json")
    export(index, output / "index.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    build(parser.parse_args().output)
