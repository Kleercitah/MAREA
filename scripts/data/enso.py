"""Publica el índice ONI del NOAA CPC y los episodios ENSO documentados.

La tabla oficial «Cold & Warm Episodes by Season» marca en rojo y azul las temporadas
cuyo ONI alcanza ±0,5 °C durante al menos cinco temporadas móviles consecutivas. Este
módulo aplica esa misma regla a la tabla numérica del CPC para obtener los intervalos
que usa la cronología, sin clasificar intensidades ni nombrar episodios adicionales.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import time
from datetime import UTC, date, datetime
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from .ocean_sources import ROOT, Config
from .regional import export, require

SOURCE = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
PAGE = "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v5/"
CACHE = ROOT / ".marea-cache/enso"
OUTPUT = ROOT / "public/data/enso-oni.json"
SEASONS = ("DJF", "JFM", "FMA", "MAM", "AMJ", "MJJ", "JJA", "JAS", "ASO", "SON", "OND", "NDJ")
THRESHOLD = 0.5
MINIMUM_SEASONS = 5
CITATION = ("NOAA Climate Prediction Center. Oceanic Niño Index (ONI), ERSSTv5, "
            "Cold & Warm Episodes by Season. " + PAGE)
PHASES = {"el-nino": {"es": "El Niño", "en": "El Niño"},
          "la-nina": {"es": "La Niña", "en": "La Niña"}}
CONVENTION = {
    "es": "Cada valor es la media móvil de tres meses de la anomalía de la temperatura "
          "superficial del mar en la región Niño 3.4 (5° N–5° S, 120°–170° O), calculada "
          "sobre ERSSTv5. La columna DJF se centra en enero y la columna NDJ en diciembre. "
          "El índice describe el Pacífico ecuatorial central, no el sector de Galápagos.",
    "en": "Each value is the three-month running mean of the sea surface temperature "
          "anomaly in the Niño 3.4 region (5°N–5°S, 120°–170°W), computed from ERSSTv5. "
          "The DJF column is centred on January and the NDJ column on December. The index "
          "describes the central equatorial Pacific, not the Galápagos sector.",
}
LIMITATIONS = {
    "es": "Los intervalos se derivan del criterio publicado por el CPC y coinciden con su "
          "tabla de episodios. Un valor por encima del umbral no implica por sí solo una "
          "respuesta marina concreta en Galápagos: la cronología es descriptiva y la "
          "significancia estadística de las tendencias de MAREA no depende de ella.",
    "en": "Intervals are derived from the criterion published by CPC and match its episode "
          "table. A value above the threshold does not by itself imply a particular marine "
          "response in Galápagos: the chronology is descriptive, and the statistical "
          "significance of MAREA trends does not depend on it.",
}


def checksum(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def fetch(offline: bool) -> tuple[Path, dict[str, str]]:
    path = CACHE / "oni.ascii.txt"
    receipt = CACHE / "oni.ascii.json"
    if path.exists() and receipt.exists():
        meta = json.loads(receipt.read_text(encoding="utf-8"))
        require(meta["url"] == SOURCE and meta["sha256"] == checksum(path),
                "La caché del índice no coincide con su recibo")
        datetime.fromisoformat(meta["fetchedAt"])
        return path, meta
    if offline:
        raise FileNotFoundError(f"Falta la tabla ONI en caché: {path}")
    CACHE.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(dir=CACHE) as tmp:
        temp = Path(tmp) / "oni.ascii.txt"
        for attempt in range(3):
            try:
                with urlopen(SOURCE, timeout=60) as response, temp.open("wb") as out:
                    shutil.copyfileobj(response, out)
                break
            except (OSError, URLError) as error:
                if attempt == 2 or isinstance(error, HTTPError) and error.code < 500:
                    raise
                time.sleep(2 ** attempt)
        text = temp.read_text(encoding="utf-8", errors="strict")
        require(not text.lstrip().startswith("<"), "La respuesta no es la tabla de texto del CPC")
        meta = {"url": SOURCE, "sha256": checksum(temp),
                "fetchedAt": datetime.now(UTC).isoformat(timespec="seconds")}
        marker = Path(tmp) / "oni.ascii.json"
        marker.write_text(json.dumps(meta), encoding="utf-8")
        temp.replace(path)
        marker.replace(receipt)
    return path, meta


def parse(text: str) -> list[dict[str, float]]:
    lines = [line.split() for line in text.splitlines() if line.strip()]
    require(bool(lines) and lines[0] == ["SEAS", "YR", "TOTAL", "ANOM"], "Encabezado inesperado")
    rows: list[dict[str, float]] = []
    for parts in lines[1:]:
        require(len(parts) == 4, "Fila incompleta en la tabla ONI")
        season, year, total, anomaly = parts[0], int(parts[1]), float(parts[2]), float(parts[3])
        require(season in SEASONS and 1900 <= year <= 2100 and -5 < anomaly < 5
                and 15 < total < 40, f"Fila no válida: {' '.join(parts)}")
        rows.append({"season": season, "year": year, "index": SEASONS.index(season),
                     "total": total, "value": anomaly})
    for earlier, later in zip(rows, rows[1:]):
        require(later["index"] == (earlier["index"] + 1) % 12
                and later["year"] == earlier["year"] + (earlier["index"] == 11),
                "Secuencia de temporadas discontinua")
    return rows


def stamp(row: dict[str, float]) -> date:
    return date(int(row["year"]), int(row["index"]) + 1, 1)


def episodes(rows: list[dict[str, float]], start: date, end: date) -> list[dict[str, object]]:
    runs: list[list[dict[str, float]]] = []
    current: list[dict[str, float]] = []
    for row in rows:
        value = float(row["value"])
        sign = 1 if value >= THRESHOLD else -1 if value <= -THRESHOLD else 0
        if sign and current and (1 if float(current[-1]["value"]) > 0 else -1) == sign:
            current.append(row)
        else:
            if len(current) >= MINIMUM_SEASONS:
                runs.append(current)
            current = [row] if sign else []
    if len(current) >= MINIMUM_SEASONS:
        runs.append(current)
    found = []
    for run in runs:
        first, last = run[0], run[-1]
        if stamp(last) < start or stamp(first) > end:
            continue
        peak = max(run, key=lambda r: abs(float(r["value"])))
        phase = "el-nino" if float(first["value"]) > 0 else "la-nina"
        years = f"{first['year']}" if first["year"] == last["year"] else f"{first['year']}–{last['year']}"
        found.append({"id": f"{phase}-{first['year']}-{last['year']}", "phase": phase,
                      "label": dict(PHASES[phase]), "designation": years,
                      "start": stamp(first).strftime("%Y-%m"), "end": stamp(last).strftime("%Y-%m"),
                      "seasons": len(run),
                      "peak": {"month": stamp(peak).strftime("%Y-%m"), "value": float(peak["value"])}})
    return found


def build(offline: bool) -> dict[str, object]:
    config = Config.load()
    path, meta = fetch(offline)
    rows = parse(path.read_text(encoding="utf-8"))
    start = date.fromisoformat(config.startMonth + "-01")
    end = date.fromisoformat(config.endMonth + "-01")
    window = [row for row in rows if start <= stamp(row) <= end]
    require(len(window) == 264, "La tabla ONI no cubre todos los meses configurados")
    return {
        "index": "Oceanic Niño Index (ONI)",
        "version": "ERSSTv5",
        "threshold": THRESHOLD,
        "minimumSeasons": MINIMUM_SEASONS,
        "region": "Niño 3.4 (5°N–5°S, 120°–170°O)",
        "convention": CONVENTION,
        "limitations": LIMITATIONS,
        "period": {"start": config.startMonth + "-01", "end": config.endMonth + "-01"},
        "page": PAGE,
        "source": SOURCE,
        "citation": CITATION,
        "retrieved": meta["fetchedAt"],
        "sha256": meta["sha256"],
        "seasons": [{"month": stamp(row).strftime("%Y-%m"), "season": row["season"],
                     "year": row["year"], "value": float(row["value"])} for row in window],
        "episodes": episodes(rows, start, end),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()
    bundle = build(args.offline)
    export(bundle, args.output)
    print(f"{len(bundle['seasons'])} temporadas y {len(bundle['episodes'])} episodios")


if __name__ == "__main__":
    main()
