import { json } from '../ocean/data'
import type { Bounds, Layer, OceanVariable } from '../ocean/data'
import type { TimeRange } from '../../data/contracts'

export type Mode = 'monthly' | 'sst-trend' | 'chl-trend' | 'significance' | 'episode'
export interface SectorResult {
  valid: number
  n: number
  slope: number | null
  ci: [number, number] | null
  p: number | null
  q: number | null
  adjusted: boolean | null
  local: boolean | null
  supportCells: number
  episode: {validMonths: number; months: number; difference: number | null; mean: number | null; referenceMean: number | null}
}
export interface SectorField {
  source: string
  datasetId: string
  units: string
  geometry: Pick<Layer,'north' | 'west' | 'height' | 'width' | 'step'>
  mask: string
  records: Record<string, SectorResult>
}
export interface SectorIndex {
  bounds: Bounds
  size: number
  dates: string[]
  adjustment: string
  manifestSHA256: string
  episode: TimeRange
  variables: Record<OceanVariable,SectorField>
}
export interface SectorSeries {
  values: (number | null)[]
  anomalies: (number | null)[]
  spatialCoverage: number[]
  climatology: (number | null)[]
}

export function sectorBounds(key: string, index: SectorIndex) {
  const row = Number(key.slice(1,3))-1, col = Number(key.slice(4))-1
  const north = index.bounds[1][0] - row * index.size
  const west = index.bounds[0][1] + col * index.size
  return { north, west, south:north-index.size, east:west+index.size }
}

export const modeNames = {
  es: {monthly:'Observación mensual', 'sst-trend':'Tendencia de SST', 'chl-trend':'Tendencia de clorofila-a',
    significance:'Significancia por sector', episode:'Diferencia durante El Niño'},
  en: {monthly:'Monthly observation', 'sst-trend':'SST trend', 'chl-trend':'Chlorophyll-a trend',
    significance:'Sector significance', episode:'El Niño difference'},
}

export const getSectorIndex = (signal: AbortSignal) => json<SectorIndex>('/data/sectors/index.json', signal)
