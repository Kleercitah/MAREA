"""Media regional de los compuestos mensuales de MUR SST v4.1."""
from __future__ import annotations

import argparse
from calendar import monthrange
from dataclasses import replace
from datetime import date, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote

import numpy as np
from netCDF4 import Dataset, num2date

from .ocean_sources import BASE, Config, ROOT, Source, acquire
from .regional import Grid, coordinate, export, match_axis, months, numbers, region, require, summarize, time_index

COLLECTION = "jplMURSST41mday"
CATALOG = "https://podaac.jpl.nasa.gov/dataset/MUR-JPL-L4-GLOB-v4.1"
OUTPUT = ROOT / "public/data/sst-monthly.json"
DATASET_ID = "mur-jpl-l4-v4.1-coastwatch-monthly"
MIN_DAY_FRACTION = 0.5


def batch_url(c: Config, year: int) -> str:
    start = max(c.startMonth, f"{year}-01")
    end = min(c.endMonth, f"{year}-12")
    bounds = (f"[({start}-16):1:({end}-16)]"
              f"[({c.south}):1:({c.north})][({c.west}):1:({c.east})]")
    query = ",".join(field + bounds for field in ("sst", "nobs", "mask"))
    return f"{BASE}/griddap/{COLLECTION}.nc?" + quote(query)


def daily_url(c: Config, start: date, end: date) -> str:
    bounds = (f"[({start}T09:00:00Z):1:({end}T09:00:00Z)]"
              f"[({c.south}):1:({c.north})][({c.west}):1:({c.east})]")
    return f"{BASE}/griddap/jplMURSST41.nc?" + quote("analysed_sst" + bounds + ",mask" + bounds)


def batches(c: Config, year: int, dates: list[date], cache: Path, offline: bool) -> list[tuple[Source, list[date]]]:
    annual = batch_url(c, year)
    quarters = []
    for start in (1, 4, 7, 10):
        group = [d for d in dates if start <= d.month < start + 3]
        if group:
            limits = replace(c, startMonth=group[0].strftime("%Y-%m"), endMonth=group[-1].strftime("%Y-%m"))
            quarters.append((batch_url(limits, year), group))
    try:
        return [(acquire(url, cache, True), group) for url, group in quarters]
    except FileNotFoundError:
        pass
    try:
        return [(acquire(annual, cache, offline), dates)]
    except OSError:
        return [(acquire(url, cache, offline), group) for url, group in quarters]


def celsius(values: Grid, units: str) -> Grid:
    if units in {"K", "kelvin"}:
        return values - 273.15
    require(units in {"degree_C", "degrees_Celsius"}, f"Unidad SST desconocida: {units}")
    return values


def area_weights(d: Dataset, c: Config) -> Grid:
    step = 0.01
    lat = coordinate(d, "latitude", "degrees_north")
    lon = coordinate(d, "longitude", "degrees_east")
    match_axis(lat, np.linspace(c.south, c.north, round((c.north-c.south)/step) + 1))
    match_axis(lon, np.linspace(c.west, c.east, round((c.east-c.west)/step) + 1))
    # Área esférica de la intersección de cada celda con el rectángulo.
    top = np.minimum(lat + step/2, c.north)
    bottom = np.maximum(lat - step/2, c.south)
    width = np.minimum(lon + step/2, c.east) - np.maximum(lon - step/2, c.west)
    height = np.sin(np.deg2rad(top)) - np.sin(np.deg2rad(bottom))
    return height[:, None] * np.deg2rad(width)


def month_mean(values: Grid, mask: Grid, nobs: Grid, weights: Grid, days: int,
               minimum: float) -> tuple[float | None, str, dict[str, int]]:
    ocean = mask == 1
    # nobs cuenta campos diarios L4. Un compuesto escasamente muestreado queda fuera.
    enough = (nobs >= days * MIN_DAY_FRACTION) & (nobs <= days) & (nobs == np.floor(nobs))
    filtered = np.where(enough, values, np.nan)
    value, count, flag = summarize(filtered, ocean, weights, minimum)
    valid_days = nobs[ocean & np.isfinite(filtered)]
    return value, flag, {
        "oceanCells": int(ocean.sum()), "validCells": count,
        "contributingCellDays": int(valid_days.sum()), "calendarDays": days,
    }


def read_batch(path: Path, calendar: list[date], c: Config) -> tuple[list[dict[str, Any]], list[dict[str, int] | None], str]:
    observations, coverage = [], []
    with Dataset(path) as d:
        require(d.infoUrl == CATALOG and "fv04.1" in d.title and "Monthly" in d.title
                and d["sst"].standard_name == "sea_surface_foundation_temperature"
                and "1=open-sea" in d["mask"].flag_meanings, "Producto MUR mensual inesperado")
        require(all(d[k].dimensions == ("time", "latitude", "longitude") for k in ("sst", "nobs", "mask")),
                "Dimensiones incompatibles")
        indices = time_index(d)
        weights = area_weights(d, c)
        for month in calendar:
            value, flag, counts = None, "month-absent", None
            if month in indices:
                i = indices[month]
                values = celsius(numbers(d["sst"][i]), d["sst"].units)
                value, flag, counts = month_mean(
                    values, numbers(d["mask"][i]), numbers(d["nobs"][i]), weights,
                    monthrange(month.year, month.month)[1], c.minimumValidFraction,
                )
            observations.append({"date": month.isoformat(), "datasetId": DATASET_ID, "regionId": c.regionId,
                                 "variableId": "sst", "value": value, "qualityFlag": flag})
            coverage.append(counts)
        return observations, coverage, d.license


def from_daily(month: date, c: Config, cache: Path, offline: bool
               ) -> tuple[float | None, str, dict[str, int] | None, dict[str, dict[str, str]]]:
    days = monthrange(month.year, month.month)[1]
    last = month.replace(day=days)
    seen, inputs = set(), {}
    for offset in range(0, days, 7):
        start = month + timedelta(days=offset)
        end = min(start + timedelta(days=6), last)
        batch = acquire(daily_url(c, start, end), cache, offline)
        inputs["daily-" + start.isoformat()] = batch.provenance()
        with Dataset(batch.path) as d:
            var, mask, t = d["analysed_sst"], d["mask"], d["time"]
            require(d.infoUrl == CATALOG and "Daily" in d.title and "fv04.1" in d.title
                    and var.standard_name == "sea_surface_foundation_temperature"
                    and var.dimensions == mask.dimensions == ("time", "latitude", "longitude")
                    and mask.flag_meanings.split()[0] == "open_sea" and mask.flag_masks[0] == 1
                    and t.units == "seconds since 1970-01-01T00:00:00Z", "Producto diario incompatible")
            weights = area_weights(d, c)
            if offset == 0:
                totals = np.zeros_like(weights)
                counts = np.zeros(weights.shape, dtype=np.int32)
                ocean = np.zeros(weights.shape, dtype=bool)
            for i, stamp in enumerate(num2date(t[:], t.units)):
                day = date(stamp.year, stamp.month, stamp.day)
                if not start <= day <= end:
                    continue
                require(day not in seen, "Dos análisis diarios para la misma fecha")
                seen.add(day)
                water = numbers(mask[i]) == 1
                values = celsius(numbers(var[i]), var.units)
                valid = water & np.isfinite(values)
                ocean |= water
                totals[valid] += values[valid]
                counts += valid
    if not seen:
        return None, "month-absent", None, inputs
    means = np.divide(totals, counts, out=np.full_like(totals, np.nan), where=counts > 0)
    value, flag, support = month_mean(means, ocean, counts, weights, days, c.minimumValidFraction)
    support["analysesRead"] = len(seen)
    return value, flag, support, inputs


def process(c: Config, cache: Path, offline: bool) -> dict[str, Any]:
    calendar = list(months(c))
    require(0 < c.minimumValidFraction <= 1, "Umbral espacial inválido")
    observations, coverage, inputs = [], [], {}
    for year in range(calendar[0].year, calendar[-1].year + 1):
        dates = [m for m in calendar if m.year == year]
        for batch, group in batches(c, year, dates, cache, offline):
            rows, counts, license_text = read_batch(batch.path, group, c)
            for i, row in enumerate(rows):
                if row["qualityFlag"] == "month-absent":
                    value, flag, counts[i], daily_inputs = from_daily(group[i], c, cache, offline)
                    row.update(value=value, qualityFlag=flag)
                    inputs.update(daily_inputs)
            observations.extend(rows)
            coverage.extend(counts)
            inputs[group[0].strftime("%Y-%m")] = batch.provenance()
    end = calendar[-1]
    return {
        "dataset": {
            "id": DATASET_ID, "provider": "NASA JPL / NOAA CoastWatch ERD (monthly composite)",
            "mission": "NASA MEaSUREs MUR", "product": "MUR-JPL-L4-GLOB-v4.1", "version": "4.1",
            "sourceUrl": CATALOG, "license": license_text,
            "fetchedAt": max(item["fetchedAt"] for item in inputs.values()),
            "period": {"start": calendar[0].isoformat(), "end": end.replace(day=monthrange(end.year, end.month)[1]).isoformat()},
            "spatialResolution": "0.01°", "temporalResolution": "monthly", "units": "°C",
            "qaNotes": "Mar abierto con al menos 50 % de los días del mes. Ver docs/DATA_SOURCES.md.",
        },
        "region": region(c, "Máscara marina del compuesto MUR.", "MUR composite open-sea mask."),
        "coverage": {"minimumValidFraction": c.minimumValidFraction, "minimumDayFraction": MIN_DAY_FRACTION,
                     "byMonth": coverage},
        "provenance": {"distribution": f"{BASE}/griddap/{COLLECTION}.html", "inputs": inputs},
        "observations": observations,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--cache", type=Path, default=ROOT / ".marea-cache")
    args = parser.parse_args()
    result = process(Config.load(), args.cache, args.offline)
    export(result, OUTPUT)
    print(f"{sum(r['value'] is not None for r in result['observations'])}/{len(result['observations'])} SST")


if __name__ == "__main__":
    main()
