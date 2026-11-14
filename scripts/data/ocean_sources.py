"""Acceso público a recortes de la colección científica y a un gránulo original."""
from __future__ import annotations

import hashlib
import json
import shutil
import time
from calendar import monthrange
from dataclasses import dataclass
from datetime import UTC, date, datetime
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://coastwatch.pfeg.noaa.gov/erddap"
COLLECTION = "erdMH1chlamday_R2022SQ"
DOI = "https://doi.org/10.5067/AQUA/MODIS/L3M/CHL/2022.0"


@dataclass(frozen=True)
class Config:
    regionId: str
    west: float
    east: float
    south: float
    north: float
    startMonth: str
    endMonth: str
    minimumValidFraction: float

    @classmethod
    def load(cls) -> Config:
        return cls(**json.loads((ROOT / "scripts/data/galapagos.json").read_text()))


def source_urls(c: Config) -> dict[str, str]:
    # ERDDAP selecciona por proximidad. Pedir los centros extremos, no los bordes.
    half = 1 / 48
    lat = f"[({c.north-half:.7f}):1:({c.south+half:.7f})]"
    lon = f"[({c.west+half:.7f}):1:({c.east-half:.7f})]"
    period = f"[({c.startMonth}-16):1:({c.endMonth}-16)]"
    mask = f"altitude[({c.south}):1:({c.north})][({c.west}):1:({c.east})]"
    start = date.fromisoformat(c.startMonth + "-01")
    last = start.replace(day=monthrange(start.year, start.month)[1])
    name = f"AQUA_MODIS.{start:%Y%m%d}_{last:%Y%m%d}.L3m.MO.CHL.chlor_a.4km.nc"
    return {
        "chlorophyll": f"{BASE}/griddap/{COLLECTION}.nc?" + quote("chlor_a" + period + lat + lon),
        "relief": f"{BASE}/griddap/etopo180.nc?" + quote(mask),
        "original": f"{BASE}/files/{COLLECTION}/{name}",
    }


@dataclass(frozen=True)
class Source:
    path: Path
    url: str
    sha256: str
    fetched_at: str

    def provenance(self) -> dict[str, str]:
        return {"url": self.url, "sha256": self.sha256, "fetchedAt": self.fetched_at}


def checksum(path: Path) -> str:
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def acquire(url: str, cache: Path, offline: bool) -> Source:
    key = hashlib.sha256(url.encode()).hexdigest()
    path = cache / (key + ".nc")
    receipt = path.with_suffix(".json")
    if path.exists() and receipt.exists():
        meta = json.loads(receipt.read_text())
        if meta["url"] != url or meta["sha256"] != checksum(path):
            raise ValueError(f"Caché alterada: {path.name}")
        datetime.fromisoformat(meta["fetchedAt"])
        return Source(path, url, meta["sha256"], meta["fetchedAt"])
    if offline:
        raise FileNotFoundError(f"Falta una entrada de caché para {url}")
    cache.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(dir=cache) as tmp:
        temp = Path(tmp) / "download.nc"
        for attempt in range(3):
            try:
                with urlopen(url, timeout=180) as response, temp.open("wb") as out:
                    shutil.copyfileobj(response, out)
                    length = response.headers.get("Content-Length")
                if length and temp.stat().st_size != int(length):
                    raise OSError("Descarga incompleta")
                break
            except (OSError, URLError) as error:
                if attempt == 2 or isinstance(error, HTTPError) and error.code < 500 and error.code != 429:
                    raise
                time.sleep(2 ** attempt)
        with temp.open("rb") as stream:
            if not stream.read(8).startswith((b"CDF", b"\x89HDF\r\n\x1a\n")):
                raise ValueError("La respuesta no contiene un NetCDF")
        source = Source(path, url, checksum(temp), datetime.now(UTC).isoformat(timespec="seconds"))
        marker = Path(tmp) / "receipt.json"
        marker.write_text(json.dumps(source.provenance()), encoding="utf-8")
        temp.replace(path)
        marker.replace(receipt)
    return source
