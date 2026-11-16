import type { AnalysisBundle } from '../../data/contracts'
import type { OceanVariable, Series } from '../ocean/data'
import type { OniIndex } from '../timeline/oni'

export interface Indicator {
  variable: OceanVariable
  value: number | null
  anomaly: number | null
  percent: number | null
  reference: number | null
  deviation: number | null
  category: 'near' | 'moderate' | 'large' | null
  coverage: number | null
  quality: string | null
  missing: boolean
}

export function readIndicator(variable: OceanVariable, month: string, series?: Series, analysis?: AnalysisBundle): Indicator {
  const index = series?.observations.findIndex(row => row.date.slice(0, 7) === month) ?? -1
  const row = series?.observations[index]
  const counts = series?.coverage.byMonth?.[index]
  const validCells = counts?.validCells ?? series?.coverage.validCellsByMonth?.[index]
  const oceanCells = counts?.oceanCells ?? series?.coverage.oceanCells
  const reference = analysis?.climatology.find(item => item.variableId === variable)?.months
    .find(item => item.month === Number(month.slice(5)))
  const anomaly = analysis?.anomalies.find(item => item.variableId === variable)?.observations
    .find(item => item.date === row?.date)
  const value = row?.qualityFlag === 'valid' ? row.value : null
  const absolute = value == null ? null : anomaly?.absolute ?? null
  const spread = reference?.standardDeviation
  const deviation = absolute != null && spread ? absolute / spread : null
  return {
    variable, value, anomaly: absolute, percent: value == null ? null : anomaly?.percent ?? null,
    reference: reference?.mean ?? null, deviation,
    category: deviation == null ? null : Math.abs(deviation) < 1 ? 'near' : Math.abs(deviation) < 2 ? 'moderate' : 'large',
    coverage: validCells != null && oceanCells ? 100 * validCells / oceanCells : null,
    quality: row?.qualityFlag ?? null, missing: value == null,
  }
}

export function ensoPhase(month: string, index?: OniIndex) {
  if (!index?.seasons.some(item => item.month === month)) return 'unavailable'
  return index.episodes.find(event => month >= event.start && month <= event.end)?.phase ?? 'outside'
}

export interface RegionalMonth {
  month: string
  sst: Indicator
  chlorophyll: Indicator
  phase: ReturnType<typeof ensoPhase>
}

export function combination({ sst, chlorophyll }: RegionalMonth) {
  if (sst.anomaly == null || chlorophyll.anomaly == null) return null
  // La variable relevante es la que supera su variación mensual habitual (|z| ≥ 1);
  // la que permanece cerca de su referencia se nombra como tal en lugar de aportar
  // una dirección que su anomalía no sostiene.
  const sstNear = sst.category === 'near'
  const chlorophyllNear = chlorophyll.category === 'near'
  if (sstNear && chlorophyllNear) return 'mixed'
  if (sstNear) return chlorophyll.anomaly > 0 ? 'equal-high' : 'equal-low'
  if (chlorophyllNear) return sst.anomaly > 0 ? 'warm-equal' : 'cool-equal'
  if (sst.anomaly === 0) return chlorophyll.anomaly > 0 ? 'equal-high' : 'equal-low'
  if (chlorophyll.anomaly === 0) return sst.anomaly > 0 ? 'warm-equal' : 'cool-equal'
  return sst.anomaly > 0
    ? chlorophyll.anomaly > 0 ? 'warm-high' : 'warm-low'
    : chlorophyll.anomaly > 0 ? 'cool-high' : 'cool-low'
}
