"""Genera rejillas web a partir de los mismos recibos y máscaras que las series."""
from __future__ import annotations

import argparse
from calendar import monthrange
from datetime import date
import gzip
import hashlib
import json
from pathlib import Path
from tempfile import NamedTemporaryFile

from netCDF4 import Dataset, num2date
import numpy as np

from . import chlorophyll as chl
from . import sst
from .ocean_sources import ROOT, Config, acquire
from .regional import coordinate, export, months, numbers, require, time_index

DIRECTORY = ROOT / "public/data/spatial"
DEFAULT_MONTHS = ["2015-12", "2024-10"]


def cached(receipt: dict, cache: Path, offline: bool = True, unavailable: set[str] | None = None) -> Path:
    url = receipt["url"]
    if unavailable is not None and url in unavailable:
        raise OSError("Recorte pendiente tras un intento anterior en este lote")
    try:
        source = acquire(url, cache, offline=offline)
        require(source.sha256 == receipt["sha256"], "El recorte difiere de la procedencia regional")
    except (OSError, ValueError):
        if unavailable is not None:
            unavailable.add(url)
        raise
    return source.path


def daily_grid(month: date, inputs: dict, cache: Path, c: Config, offline: bool = True,
               unavailable: set[str] | None = None):
    """Compone la media del mes desde los análisis diarios cuando falta el compuesto mensual."""
    days = monthrange(month.year, month.month)[1]
    last = month.replace(day=days)
    receipts = [value for key, value in sorted(inputs.items()) if key.startswith("daily-")]
    require(bool(receipts), f"Falta el compuesto mensual sst {month}")
    totals = counts = ocean = None
    seen: set[date] = set()
    for receipt in receipts:
        with Dataset(cached(receipt, cache, offline, unavailable)) as d:
            var, mask, t = d["analysed_sst"], d["mask"], d["time"]
            require(d.infoUrl == sst.CATALOG and "Daily" in d.title and "fv04.1" in d.title
                    and var.standard_name == "sea_surface_foundation_temperature"
                    and var.dimensions == mask.dimensions == ("time", "latitude", "longitude")
                    and mask.flag_meanings.split()[0] == "open_sea" and mask.flag_masks[0] == 1
                    and t.units == "seconds since 1970-01-01T00:00:00Z", "Producto diario incompatible")
            lat = coordinate(d, "latitude", "degrees_north")
            lon = coordinate(d, "longitude", "degrees_east")
            sst.area_weights(d, c)
            if totals is None:
                totals = np.zeros((lat.size, lon.size))
                counts = np.zeros((lat.size, lon.size), dtype=np.int32)
                ocean = np.zeros((lat.size, lon.size), dtype=bool)
            for i, stamp in enumerate(num2date(t[:], t.units)):
                day = date(stamp.year, stamp.month, stamp.day)
                if not month <= day <= last:
                    continue
                require(day not in seen, "Dos análisis diarios para la misma fecha")
                seen.add(day)
                water = numbers(mask[i]) == 1
                values = sst.celsius(numbers(var[i]), var.units)
                valid = water & np.isfinite(values)
                ocean |= water
                totals[valid] += values[valid]
                counts += valid
    require(bool(seen), f"Falta el compuesto mensual sst {month}")
    means = np.divide(totals, counts, out=np.full_like(totals, np.nan), where=counts > 0)
    valid = (counts >= days * sst.MIN_DAY_FRACTION) & (counts <= days)
    # Omitir las celdas cuya huella sobrepasa el borde del recorte.
    return np.where(valid, means, np.nan)[1:-1, 1:-1][::-1], lat[-2], lon[1], 0.01, receipts


def field(variable: str, month: date, bundle: dict, cache: Path, c: Config, offline: bool = True,
          unavailable: set[str] | None = None):
    inputs = bundle["provenance"]["inputs"]
    if variable == "sst":
        key = max(k for k in inputs if not k.startswith("daily") and k <= month.strftime("%Y-%m"))
        receipt = inputs[key]
        with Dataset(cached(receipt, cache, offline, unavailable)) as d:
            idx = time_index(d).get(month)
            if idx is None:
                return daily_grid(month, inputs, cache, c, offline, unavailable)
            lat = coordinate(d, "latitude", "degrees_north")
            lon = coordinate(d, "longitude", "degrees_east")
            sst.area_weights(d, c)
            days = monthrange(month.year, month.month)[1]
            count = numbers(d["nobs"][idx])
            water = numbers(d["mask"][idx]) == 1
            valid = water & (count >= days * sst.MIN_DAY_FRACTION) & (count <= days) & (count == np.floor(count))
            raw = sst.celsius(numbers(d["sst"][idx]), d["sst"].units)
            # Omitir las celdas cuya huella sobrepasa el borde del recorte.
            grid = np.where(valid, raw, np.nan)[1:-1, 1:-1][::-1]
            return grid, lat[-2], lon[1], 0.01, [receipt]
    receipt = inputs["chlorophyll"]
    with Dataset(cached(receipt, cache, offline, unavailable)) as d:
        idx = time_index(d).get(month)
        require(idx is not None, f"Falta el compuesto mensual {variable} {month}")
        lat = coordinate(d, "latitude", "degrees_north")
        lon = coordinate(d, "longitude", "degrees_east")
        v = chl.chlor_variable(d, ("time", "latitude", "longitude"))
        with Dataset(cached(inputs["relief"], cache, offline, unavailable)) as relief:
            mask = chl.ocean_mask(relief, lat, lon, c)
        return np.where(mask, chl.clean(v, idx), np.nan), lat[0], lon[0], chl.STEP, [receipt, inputs["relief"]]


def raster_bytes(layer: dict, directory: Path) -> bytes:
    binary = (directory / layer["file"]).read_bytes()
    if layer.get("encoding") == "gzip":
        binary = gzip.decompress(binary)
    require(len(binary) == layer["width"] * layer["height"] * 4, "Dimensiones incorrectas")
    require(hashlib.sha256(binary).hexdigest() == layer["sha256"], "Huella de capa incorrecta")
    return binary


def publish_grid(grid: np.ndarray, layer: dict, directory: Path) -> None:
    binary = grid.astype("<f4").tobytes()
    digest = hashlib.sha256(binary).hexdigest()
    layer.update(file=f"{layer['variable']}-{layer['month']}-{digest[:10]}.f32.gz",
                 sha256=digest, encoding="gzip", height=grid.shape[0], width=grid.shape[1])
    with NamedTemporaryFile(dir=directory, delete=False) as tmp:
        temp = Path(tmp.name)
        try:
            tmp.write(gzip.compress(binary, compresslevel=6, mtime=0))
            tmp.close()
            raster_bytes({**layer, "file": temp.name}, directory)
            temp.replace(directory / layer["file"])
        finally:
            temp.unlink(missing_ok=True)


def save_manifest(manifest: dict, path: Path) -> None:
    try:
        export(manifest, path)
    except PermissionError:
        # En Windows un lector puede impedir el reemplazo. Conservar una copia recuperable.
        pending = path.with_suffix(".pending")
        export(manifest, pending)
        path.write_bytes(pending.read_bytes())
        pending.unlink()


def generate(dates: list[str], cache: Path, output: Path = DIRECTORY,
             variables=("sst", "chlorophyll-a"), offline: bool = True) -> int:
    c = Config.load()
    output.mkdir(exist_ok=True, parents=True)
    path = output / "manifest.json"
    pending = path.with_suffix(".pending")
    if pending.exists():
        recovered = json.loads(pending.read_bytes())
        for layer in recovered["layers"]:
            raster_bytes(layer, output)
        path.write_bytes(pending.read_bytes())
        pending.unlink()
    bounds = [[c.south, c.west], [c.north, c.east]]
    manifest = json.loads(path.read_bytes()) if path.exists() else {"bounds": bounds, "layers": []}
    require(manifest["bounds"] == bounds, "Región incompatible")
    existing = {(l["variable"], l["month"]): l for l in manifest["layers"]}
    require(len(existing) == len(manifest["layers"]), "Manifiesto con duplicados")
    failures = 0
    unavailable: set[str] = set()
    for variable in variables:
        filename = "sst" if variable == "sst" else "chlorophyll"
        bundle = json.loads((ROOT / f"public/data/{filename}-monthly.json").read_bytes())
        meta = bundle["dataset"]
        for stamp in sorted(set(dates)):
            month = date.fromisoformat(stamp + "-01")
            require(c.startMonth <= stamp <= c.endMonth, "Fecha fuera del periodo regional")
            key = variable, stamp
            if key in existing:
                try:
                    raster_bytes(existing[key], output)
                    continue
                except (OSError, EOFError, ValueError):
                    manifest["layers"].remove(existing.pop(key))
                    save_manifest(manifest, path)
            try:
                grid, north, west, step, inputs = field(variable, month, bundle, cache, c, offline, unavailable)
                grid = np.where(np.isfinite(grid), grid, np.nan).astype("<f4")
                require(bool(np.isfinite(grid).any()), "La capa carece de celdas válidas")
                layer = {"variable": variable, "month": stamp, "datasetId": meta["id"],
                         "source": meta["sourceUrl"], "version": meta["version"],
                         "units": "°C" if variable == "sst" else "mg/m³", "step": step,
                         "north": round(float(north + step/2), 5), "west": round(float(west - step/2), 5),
                         "min": float(np.nanmin(grid)), "max": float(np.nanmax(grid)), "inputs": inputs}
                publish_grid(grid, layer, output)
            except (OSError, ValueError, KeyError, RuntimeError) as exc:
                print(f"Pendiente {variable} {stamp}: {exc}", flush=True)
                failures += 1
                continue
            existing[key] = layer
            manifest["layers"].append(layer)
            save_manifest(manifest, path)
            print(f"{variable} {stamp}: {layer['file']}", flush=True)
    return failures


def islands(input_file: Path, output: Path) -> None:
    geography = json.loads(input_file.read_bytes())
    polygons = []
    for feature in geography["features"]:
        geom = feature["geometry"]
        parts = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for polygon in parts:
            if all(-93 < x < -88 and -3 < y < 3 for x, y in polygon[0]):
                polygons.append(polygon)
    require(bool(polygons), "Falta la cartografía del archipiélago")
    export({"type": "MultiPolygon", "coordinates": polygons}, output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--months", nargs="+", default=None)
    parser.add_argument("--cache", type=Path, default=ROOT / ".marea-cache")
    parser.add_argument("--land", type=Path, help="GeoJSON Natural Earth 1:10m Land v5.1.1")
    parser.add_argument("--start-year", type=int)
    parser.add_argument("--end-year", type=int)
    parser.add_argument("--start-month", help="AAAA-MM")
    parser.add_argument("--end-month", help="AAAA-MM")
    parser.add_argument("--variable", choices=["sst", "chlorophyll-a", "both"], default="both")
    parser.add_argument("--fetch", action="store_true", help="Descargar recortes si faltan en caché")
    args = parser.parse_args()
    dates = args.months or DEFAULT_MONTHS
    if args.start_month or args.end_month:
        if args.months or args.start_year is not None or args.end_year is not None:
            parser.error("Elige una lista de meses, un intervalo mensual o un intervalo anual")
        calendar = [m.strftime("%Y-%m") for m in months(Config.load())]
        if args.start_month not in calendar or args.end_month not in calendar or args.start_month > args.end_month:
            parser.error("Se requieren dos meses ordenados dentro del periodo regional")
        dates = [stamp for stamp in calendar if args.start_month <= stamp <= args.end_month]
    if args.start_year is not None or args.end_year is not None:
        if args.months or args.start_year is None or args.end_year is None or args.start_year > args.end_year:
            parser.error("Indica un intervalo de años ordenado o una lista de meses")
        dates = [f"{y:04}-{m:02}" for y in range(args.start_year, args.end_year + 1) for m in range(1, 13)]
    variables = ("sst", "chlorophyll-a") if args.variable == "both" else (args.variable,)
    failures = generate(dates, args.cache, variables=variables, offline=not args.fetch)
    if args.land:
        islands(args.land, DIRECTORY / "islands.geojson")
    raise SystemExit(1 if failures else 0)
