"""Métodos estadísticos de MAREA: climatologías, anomalías y tendencias.

El módulo trabaja sobre series de pares (fecha, valor) y no accede a archivos:
todas sus funciones pueden verificarse con series sintéticas controladas.
"""
from __future__ import annotations

from datetime import date
from statistics import NormalDist
from typing import Any, Iterable

import numpy as np
from numpy.typing import NDArray

from .regional import require

Point = tuple[date, float | None]

MIN_YEARS_CLIMATOLOGY = 10
MIN_SEASON_YEARS = 10
MIN_SEASONAL_MONTHS = 9
MIN_TREND_OBSERVATIONS = 60
MIN_COMPARISON_MONTHS = 3
MIN_COMPARISON_COVERAGE = 0.5
PERCENT_DENOMINATOR_MIN = 0.01
AUTOCORRELATION_LAGS = 3
CONFIDENCE = 0.95
NORMAL = NormalDist()
TREND_TEST = (
    "Seasonal Mann-Kendall (Hirsch y Slack, 1984) con varianza corregida por "
    "Hamed y Rao (1998); pendiente estacional de Sen (Gilbert, 1987)"
)
CAUSALITY_WARNING = (
    "La prueba cuantifica una asociación temporal; no demuestra causalidad."
)


def valid_points(points: Iterable[Point]) -> list[tuple[date, float]]:
    return [(day, float(value)) for day, value in points if value is not None]


def month_count(first: date, last: date) -> int:
    require(first <= last, "El intervalo mensual está invertido")
    return (last.year - first.year) * 12 + (last.month - first.month) + 1


def validate_period(start: str, end: str, available: tuple[date, date]) -> tuple[date, date]:
    first, last = date.fromisoformat(start), date.fromisoformat(end)
    require(first <= last, "El periodo termina antes de comenzar")
    require(available[0] <= first and last <= available[1],
            "El periodo queda fuera de los datos disponibles")
    return first, last


def monthly_climatology(points: Iterable[Point],
                        minimum_years: int = MIN_YEARS_CLIMATOLOGY) -> list[dict[str, Any]]:
    """Climatología por mes del calendario. No sustituye meses ausentes."""
    buckets: dict[int, list[float]] = {month: [] for month in range(1, 13)}
    for day, value in valid_points(points):
        buckets[day.month].append(value)
    rows = []
    for month in range(1, 13):
        values = np.asarray(buckets[month], dtype=float)
        years = int(values.size)
        if years < minimum_years:
            rows.append({"month": month, "status": "insufficient-data", "years": years,
                         "reason": f"Se requieren {minimum_years} años con datos y hay {years}."})
        else:
            rows.append({"month": month, "status": "estimated", "mean": float(values.mean()),
                         "years": years,
                         "standardDeviation": float(values.std(ddof=1)) if years > 1 else None})
    return rows


def climatology_means(climatology: Iterable[dict[str, Any]]) -> dict[int, float]:
    return {row["month"]: row["mean"] for row in climatology if row["status"] == "estimated"}


def anomaly_rows(points: Iterable[Point], climatology: Iterable[dict[str, Any]], *,
                 percent: bool = False,
                 denominator_min: float = PERCENT_DENOMINATOR_MIN) -> list[dict[str, Any]]:
    """Anomalía absoluta y, opcionalmente, porcentual frente a la climatología mensual."""
    means = climatology_means(climatology)
    rows = []
    for day, value in points:
        mean = means.get(day.month)
        absolute = None if value is None or mean is None else float(value) - mean
        ratio = None
        if percent and absolute is not None and mean >= denominator_min:
            ratio = absolute / mean * 100.0
        rows.append({"date": day.isoformat(), "absolute": absolute, "percent": ratio})
    return rows


def normal_two_sided_p(z: float) -> float:
    return 2.0 * (1.0 - NORMAL.cdf(abs(z)))


def kendall_sum(values: NDArray[np.float64]) -> float:
    total = 0.0
    for i in range(values.size - 1):
        total += float(np.sum(np.sign(values[i + 1:] - values[i])))
    return total


def kendall_variance(values: NDArray[np.float64]) -> float:
    size = int(values.size)
    if size < 2:
        return 0.0
    counts = np.unique(values, return_counts=True)[1]
    ties = float(np.sum(counts * (counts - 1) * (2 * counts + 5)))
    return (size * (size - 1) * (2 * size + 5) - ties) / 18.0


def rank_autocorrelation(values: NDArray[np.float64], lag: int) -> float:
    valid = np.isfinite(values)
    ranks = _average_ranks(values[valid])
    centered = np.zeros(values.shape)
    centered[valid] = ranks - ranks.mean()
    denominator = float(np.dot(centered, centered))
    if denominator <= 0:
        return 0.0
    return float(np.dot(centered[:-lag], centered[lag:])) / denominator


def hamed_rao_factor(residuals: NDArray[np.float64],
                     maximum_lag: int = AUTOCORRELATION_LAGS) -> float:
    """Factor de corrección de varianza de Hamed y Rao (1998), acotado en 1."""
    size = int(residuals.size)
    if size < 4:
        return 1.0
    total = 0.0
    for lag in range(1, min(maximum_lag, size - 1) + 1):
        total += (size - lag) * (size - lag - 1) * (size - lag - 2) * rank_autocorrelation(residuals, lag)
    factor = 1.0 + 2.0 * total / (size * (size - 1) * (size - 2))
    return max(factor, 1.0)


def seasonal_groups(points: Iterable[Point]) -> dict[int, list[tuple[int, float]]]:
    buckets: dict[int, list[tuple[int, float]]] = {month: [] for month in range(1, 13)}
    for day, value in valid_points(points):
        buckets[day.month].append((day.year, value))
    for rows in buckets.values():
        rows.sort()
    return buckets


def seasonal_slopes(groups: dict[int, list[tuple[int, float]]]) -> NDArray[np.float64]:
    slopes = []
    for rows in groups.values():
        for i in range(len(rows) - 1):
            year_i, value_i = rows[i]
            for year_j, value_j in rows[i + 1:]:
                if year_j != year_i:
                    slopes.append((value_j - value_i) / (year_j - year_i))
    return np.asarray(slopes, dtype=float)


def slope_interval(slopes: NDArray[np.float64], variance: float,
                   confidence: float = CONFIDENCE) -> list[float] | None:
    """Intervalo de confianza no paramétrico de la pendiente (Gilbert, 1987)."""
    count = int(slopes.size)
    if count < 2 or variance <= 0:
        return None
    ordered = np.sort(slopes)
    width = NORMAL.inv_cdf(0.5 + confidence / 2.0) * np.sqrt(variance)
    lower = int(np.floor((count - width) / 2.0))
    upper = int(np.ceil((count + width) / 2.0))
    limits = (float(ordered[min(max(position - 1, 0), count - 1)]) for position in (lower, upper))
    low, high = sorted(limits)
    return [low, high]


def trend(anomalies: Iterable[Point], *, unit: str = "",
          minimum_season_years: int = MIN_SEASON_YEARS,
          minimum_months: int = MIN_SEASONAL_MONTHS,
          minimum_observations: int = MIN_TREND_OBSERVATIONS,
          confidence: float = CONFIDENCE, calendar_lags: bool = False) -> dict[str, Any]:
    """Tendencia sobre anomalías desestacionalizadas, con errores autocorrelacionados."""
    series = list(anomalies)
    groups = seasonal_groups(series)
    usable = {month: rows for month, rows in groups.items() if len(rows) >= minimum_season_years}
    observations = sum(len(rows) for rows in groups.values())
    warnings: list[str] = []
    if observations < minimum_observations or len(usable) < minimum_months:
        warnings.append(
            f"Muestra insuficiente: {observations} observaciones válidas y {len(usable)} meses "
            f"con {minimum_season_years} años o más; se requieren {minimum_observations} y "
            f"{minimum_months} respectivamente."
        )
        return {"status": "insufficient-data", "n": observations, "warnings": warnings}
    statistic = 0.0
    variance = 0.0
    for rows in usable.values():
        values = np.asarray([value for _, value in rows], dtype=float)
        statistic += kendall_sum(values)
        variance += kendall_variance(values)
    slopes = seasonal_slopes(usable)
    slope = float(np.median(slopes))
    origin = valid_points(series)[0][0]
    residuals = np.asarray([value - slope * elapsed_years(day, origin) for day, value in valid_points(series)],
                           dtype=float)
    if calendar_lags:
        # Mantener los huecos para que un retardo represente meses de calendario.
        complete = np.full(month_count(origin, valid_points(series)[-1][0]), np.nan)
        for (day, _), residual in zip(valid_points(series), residuals):
            complete[month_count(origin, day)-1] = residual
        residuals = complete
    factor = hamed_rao_factor(residuals)
    corrected = variance * factor
    if corrected <= 0:
        warnings.append("La varianza del estadístico es nula; no puede evaluarse la significancia.")
        return {"status": "insufficient-data", "n": observations, "warnings": warnings}
    z = (statistic - float(np.sign(statistic))) / float(np.sqrt(corrected))
    p_value = normal_two_sided_p(z)
    if len(usable) < 12:
        warnings.append(f"Sólo {len(usable)} meses del calendario alcanzan {minimum_season_years} años.")
    if factor > 1.05:
        warnings.append(f"La varianza se amplió por autocorrelación serial (factor {factor:.2f}).")
    warnings.append(CAUSALITY_WARNING)
    result: dict[str, Any] = {
        "status": "estimated", "n": observations, "slopePerYear": slope,
        "slopePerDecade": slope * 10.0, "unit": unit, "testName": TREND_TEST,
        "pValue": p_value, "significant": p_value < 1.0 - confidence, "warnings": warnings,
    }
    interval = slope_interval(slopes, corrected, confidence)
    if interval is not None:
        result["confidenceInterval"] = interval
    return result


def elapsed_years(day: date, origin: date) -> float:
    return (day.year - origin.year) + (day.month - origin.month) / 12.0


def period_comparison(points: Iterable[Point], climatology: Iterable[dict[str, Any]],
                      period: tuple[date, date], *, percent: bool = False,
                      minimum_months: int = MIN_COMPARISON_MONTHS,
                      minimum_coverage: float = MIN_COMPARISON_COVERAGE,
                      denominator_min: float = PERCENT_DENOMINATOR_MIN) -> dict[str, Any]:
    """Compara un intervalo con la climatología mensual que le corresponde."""
    first, last = period
    means = climatology_means(climatology)
    total = month_count(first, last)
    valid = [(day, float(value)) for day, value in points
             if first <= day <= last and value is not None]
    coverage = len(valid) / total if total else 0.0
    empty = {"months": total, "validMonths": len(valid), "coverage": coverage, "mean": None,
             "referenceMean": None, "difference": None, "differencePercent": None}
    if len(valid) < minimum_months or coverage < minimum_coverage:
        return {"status": "insufficient-data", **empty}
    if any(day.month not in means for day, _ in valid):
        return {"status": "insufficient-data", **empty}
    mean = float(np.mean([value for _, value in valid]))
    reference = float(np.mean([means[day.month] for day, _ in valid]))
    difference = mean - reference
    ratio = difference / reference * 100.0 if percent and reference >= denominator_min else None
    return {"status": "estimated", "months": total, "validMonths": len(valid), "coverage": coverage,
            "mean": mean, "referenceMean": reference, "difference": difference,
            "differencePercent": ratio}


def _average_ranks(values: NDArray[np.float64]) -> NDArray[np.float64]:
    order = np.argsort(values, kind="stable")
    ordered = values[order]
    ranks = np.empty(values.size, dtype=float)
    start = 0
    while start < values.size:
        stop = start
        while stop + 1 < values.size and ordered[stop + 1] == ordered[start]:
            stop += 1
        ranks[order[start:stop + 1]] = (start + stop) / 2.0 + 1.0
        start = stop + 1
    return ranks
