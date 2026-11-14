"""Transformación mensual de clorofila superficial. Ejecutar desde la raíz con -m."""
from __future__ import annotations

import argparse
from calendar import monthrange
from datetime import date
from pathlib import Path
from typing import Any

import numpy as np
from netCDF4 import Dataset, Variable
from numpy.typing import NDArray

from .ocean_sources import BASE, COLLECTION, DOI, ROOT, Config, Source, acquire, source_urls

from .regional import (
    Grid, TOL, coordinate, export, match_axis, months, numbers, region, require, summarize, time_index,
)

STEP = 1 / 24
DATASET_ID = "modisa-l3m-chl-r2022-monthly-4km"
POLICY = "https://science.nasa.gov/earth-science/earth-science-data/data-information-policy/"
OUTPUT = ROOT / "public/data/chlorophyll-monthly.json"
def expected_axis(low: float, high: float) -> Grid:
    size = round((high - low) / STEP)
    require(size > 0 and abs(size * STEP - (high - low)) < TOL, "Límites fuera de malla")
    return low + (np.arange(size) + 0.5) * STEP


def ocean_mask(relief: Dataset, lat: Grid, lon: Grid, c: Config) -> NDArray[np.bool_]:
    y = coordinate(relief, "latitude", "degrees_north")
    x = coordinate(relief, "longitude", "degrees_east")
    match_axis(y, np.linspace(c.south, c.north, round((c.north-c.south)*60) + 1))
    match_axis(x, np.linspace(c.west, c.east, round((c.east-c.west)*60) + 1))
    z = relief["altitude"]
    require(relief.id == "etopo180" and z.units == "m" and z.positive == "up"
            and z.dimensions == ("latitude", "longitude"), "Relieve incompatible")
    submerged = numbers(z[:]) < 0
    mask = np.empty((lat.size, lon.size), dtype=bool)
    for i, center_y in enumerate(lat):
        rows = abs(y - center_y) <= STEP / 2 + TOL
        for j, center_x in enumerate(lon):
            cols = abs(x - center_x) <= STEP / 2 + TOL
            nodes = submerged[np.ix_(rows, cols)]
            mask[i, j] = nodes.size > 0 and nodes.all()
    require(bool(mask.any()), "Ninguna celda marina elegible")
    return mask


def chlor_variable(d: Dataset, dimensions: tuple[str, ...]) -> Variable:
    v = d["chlor_a"]
    require(d.platform == "Aqua" and d.instrument == "MODIS" and d.processing_level == "L3 Mapped"
            and d.temporal_range == "month" and d.measure == "Mean"
            and d.processing_version.startswith("R2022.0")
            and "LAND" in d.l2_flag_names.split(",") and d.license == POLICY,
            "Identidad o QA del producto inesperada")
    require(v.dimensions == dimensions and v.units in {"mg m-3", "mg m^-3"}
            and np.isclose(v.valid_min, 0.001) and v.valid_max == 100,
            "Dimensiones, unidades o rango de chlor_a inesperados")
    return v


def clean(v: Variable, index: Any) -> Grid:
    data = numbers(v[index])
    valid = np.isfinite(data) & (data >= v.valid_min) & (data <= v.valid_max)
    return np.where(valid, data, np.nan)


def verify_original(original: Dataset, c: Config, lat: Grid, lon: Grid, first: Grid) -> None:
    start = date.fromisoformat(c.startMonth + "-01")
    end = start.replace(day=monthrange(start.year, start.month)[1])
    expected = f"AQUA_MODIS.{start:%Y%m%d}_{end:%Y%m%d}.L3m.MO.CHL.chlor_a.4km.nc"
    require(original.product_name == expected and original.file_format == "NETCDF4",
            "El gránulo de control no corresponde al mes inicial")
    v = chlor_variable(original, ("lat", "lon"))
    y = coordinate(original, "lat", "degrees_north")
    x = coordinate(original, "lon", "degrees_east")
    rows = (y > c.south) & (y < c.north)
    cols = (x > c.west) & (x < c.east)
    match_axis(y[rows], lat)
    match_axis(x[cols], lon)
    require(np.array_equal(clean(v, (rows, cols)), first, equal_nan=True),
            "El recorte difiere del gránulo original")


def monthly_series(var: Variable, indices: dict[date, int], calendar: list[date],
                   c: Config, ocean: NDArray[np.bool_], lat: Grid
                   ) -> tuple[list[dict[str, Any]], list[int | None]]:
    weights = np.broadcast_to(np.cos(np.deg2rad(lat))[:, None], ocean.shape)
    observations = []
    counts = []
    for month in calendar:
        if month in indices:
            value, count, flag = summarize(clean(var, indices[month]), ocean, weights, c.minimumValidFraction)
        else:
            value, count, flag = None, None, "month-absent"
        observations.append({"date": month.isoformat(), "regionId": c.regionId,
                             "variableId": "chlorophyll-a", "datasetId": DATASET_ID,
                             "value": value, "qualityFlag": flag})
        counts.append(count)
    return observations, counts


def transform(sources: dict[str, Source], c: Config) -> dict[str, Any]:
    calendar = list(months(c))
    require(0 < c.minimumValidFraction <= 1, "Umbral de cobertura inválido")
    with (
        Dataset(sources["chlorophyll"].path) as d,
        Dataset(sources["relief"].path) as relief,
        Dataset(sources["original"].path) as original,
    ):
        var = chlor_variable(d, ("time", "latitude", "longitude"))
        require("R2022 SQ" in d.title, "Se requiere la colección Science Quality")
        lat = coordinate(d, "latitude", "degrees_north")
        lon = coordinate(d, "longitude", "degrees_east")
        match_axis(lat, expected_axis(c.south, c.north)[::-1])
        match_axis(lon, expected_axis(c.west, c.east))
        ocean = ocean_mask(relief, lat, lon, c)
        indices = time_index(d)
        require(calendar[0] in indices, "Falta el mes del gránulo de control")
        verify_original(original, c, lat, lon, clean(var, indices[calendar[0]]))
        observations, counts = monthly_series(var, indices, calendar, c, ocean, lat)
        granule = {"name": original.product_name, "processingVersion": original.processing_version,
                   "timeCoverageStart": original.time_coverage_start, "timeCoverageEnd": original.time_coverage_end,
                   "units": original["chlor_a"].units}
        epoch = max(source.fetched_at for source in sources.values())
        dataset = {"id": DATASET_ID, "provider": "NASA/GSFC OBPG", "mission": "Aqua MODIS",
                   "product": "MODISA_L3m_CHL / MO / chlor_a / 4km", "version": "2022.0",
                   "sourceUrl": DOI, "license": POLICY, "fetchedAt": epoch,
                   "period": {"start": calendar[0].isoformat(), "end": calendar[-1].replace(
                       day=monthrange(calendar[-1].year, calendar[-1].month)[1]).isoformat()},
                   "spatialResolution": "1/24° (4 km nominal)", "temporalResolution": "monthly",
                   "units": var.units, "qaNotes": "NASA L3 LAND + ETOPO1. Ver docs/DATA_SOURCES.md."}
    return {"dataset": dataset,
            "region": region(c, "Recorte con máscara marina ETOPO1.", "Subset with an ETOPO1 ocean mask."),
            "coverage": {"gridCells": int(ocean.size), "oceanCells": int(ocean.sum()),
                         "minimumValidFraction": c.minimumValidFraction, "validCellsByMonth": counts},
            "provenance": {"distribution": f"{BASE}/griddap/{COLLECTION}.html", "originalCheck": granule,
                           "inputs": {key: value.provenance() for key, value in sources.items()}},
            "observations": observations}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offline", action="store_true", help="Reutilizar descargas verificadas")
    parser.add_argument("--cache", type=Path, default=ROOT / ".marea-cache")
    args = parser.parse_args()
    config = Config.load()
    sources = {name: acquire(url, args.cache, args.offline) for name, url in source_urls(config).items()}
    result = transform(sources, config)
    export(result, OUTPUT)
    valid = sum(row["value"] is not None for row in result["observations"])
    print(f"{OUTPUT.name}: {valid}/{len(result['observations'])} meses válidos")


if __name__ == "__main__":
    main()
