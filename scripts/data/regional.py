"""Calendario, geometría y exportación de las series regionales de MAREA."""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any, Iterator

import numpy as np
from netCDF4 import Dataset, num2date
from numpy.typing import NDArray

from .ocean_sources import Config

TOL = 0.00002  # Precisión de los ejes float32.
Grid = NDArray[np.float64]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def months(c: Config) -> Iterator[date]:
    current = date.fromisoformat(c.startMonth + "-01")
    end = date.fromisoformat(c.endMonth + "-01")
    require(current <= end, "Intervalo mensual invertido")
    while current <= end:
        yield current
        current = date(current.year + (current.month == 12), current.month % 12 + 1, 1)


def numbers(values: Any) -> Grid:
    return np.ma.asarray(values, dtype=np.float64).filled(np.nan)


def coordinate(d: Dataset, name: str, units: str) -> Grid:
    v = d[name]
    require(v.units == units and v.dimensions == (name,), f"Eje inesperado: {name}")
    axis = numbers(v[:])
    require(bool(np.isfinite(axis).all()), f"Coordenadas ausentes: {name}")
    return axis


def match_axis(actual: Grid, expected: Grid) -> None:
    require(actual.shape == expected.shape and np.allclose(actual, expected, atol=TOL, rtol=0),
            "El recorte no coincide con la malla solicitada")


def time_index(d: Dataset) -> dict[date, int]:
    t = d["time"]
    calendar = getattr(t, "calendar", "standard")
    require(t.dimensions == ("time",) and calendar in {"standard", "gregorian", "proleptic_gregorian"}
            and t.units == "seconds since 1970-01-01T00:00:00Z", "Eje temporal no reconocido")
    timestamps = numbers(t[:])
    require(bool(np.isfinite(timestamps).all() and (np.diff(timestamps) > 0).all()), "Eje temporal inválido")
    result = {}
    for i, stamp in enumerate(num2date(timestamps, t.units, calendar)):
        key = date(stamp.year, stamp.month, 1)
        require(key not in result, "Dos compuestos para un mes")
        result[key] = i
    return result


def summarize(values: Grid, ocean: NDArray[np.bool_], weights: Grid,
              minimum: float) -> tuple[float | None, int, str]:
    valid = ocean & np.isfinite(values)
    count = int(valid.sum())
    if not count:
        return None, 0, "no-valid-pixels"
    if count < minimum * int(ocean.sum()):
        return None, count, "insufficient-coverage"
    return float(np.average(values[valid], weights=weights[valid])), count, "valid"


def export(bundle: dict[str, Any], path: Path) -> None:
    data = json.dumps(bundle, ensure_ascii=False, allow_nan=False, separators=(",", ":")) + "\n"
    with NamedTemporaryFile(dir=path.parent, delete=False) as tmp:
        temp = Path(tmp.name)
        try:
            tmp.write(data.encode("utf-8"))
            tmp.close()
            temp.replace(path)
        finally:
            temp.unlink(missing_ok=True)


def region(c: Config, es: str, en: str) -> dict[str, Any]:
    ring = [[c.west, c.south], [c.east, c.south], [c.east, c.north], [c.west, c.north], [c.west, c.south]]
    return {"id": c.regionId, "nameES": "Sector marino de Galápagos", "nameEN": "Galápagos marine sector",
            "polygonGeoJSON": {"type": "Polygon", "coordinates": [ring]}, "coverageNotes": {"es": es, "en": en}}
