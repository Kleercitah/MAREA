import type { MultiPolygon } from 'geojson'
import { useCallback, useEffect, useState } from 'react'
import type { AnalysisBundle, DatasetMeta, Observation, Region } from '../../data/contracts'
import { publicUrl } from '../../public-url'

export type OceanVariable = 'sst' | 'chlorophyll-a'
export type Bounds = [[number, number], [number, number]]
export interface Layer {
  variable: OceanVariable
  month: string
  file: string
  encoding?: 'gzip'
  datasetId: string
  source: string
  units: string
  step: number
  north: number
  west: number
  width: number
  height: number
  min: number
  max: number
}
export interface Manifest { bounds: Bounds; layers: Layer[] }
export interface Series {
  dataset: DatasetMeta
  region: Region
  observations: Observation[]
  coverage: {
    oceanCells?: number
    validCellsByMonth?: (number | null)[]
    byMonth?: ({ validCells: number; oceanCells: number } | null)[]
  }
}
export interface Raster { layer: Layer; values: Float32Array }

export async function json<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(publicUrl(url), { signal })
  if (!response.ok) throw new Error(String(response.status))
  return response.json()
}

export async function loadRaster(layer: Layer, signal: AbortSignal): Promise<Raster> {
  const response = await fetch(publicUrl('/data/spatial/' + layer.file), { signal })
  if (!response.ok) throw new Error(String(response.status))
  let bytes = await response.arrayBuffer()
  const header = new Uint8Array(bytes, 0, Math.min(2, bytes.byteLength))
  if (layer.encoding === 'gzip' && header[0] === 0x1f && header[1] === 0x8b) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
    bytes = await new Response(stream).arrayBuffer()
  }
  if (bytes.byteLength !== 4 * layer.width * layer.height) throw new Error('Raster size')
  return { layer, values: new Float32Array(bytes) }
}

export function useResource<T>(load: ((signal: AbortSignal) => Promise<T>) | null) {
  const [result, setResult] = useState<{ load: typeof load; value?: T; failed?: boolean }>()
  useEffect(() => {
    if (!load) return
    const controller = new AbortController()
    load(controller.signal).then(value => {
      if (!controller.signal.aborted) setResult({ load, value })
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ load, failed: true })
    })
    return () => controller.abort()
  }, [load])
  return result?.load === load ? result : undefined
}

const getAnalysis = (signal: AbortSignal) => json<AnalysisBundle>('/data/marea-analysis.json', signal)

export function useAnalysis() {
  return useResource(getAnalysis)
}

export function useRegionalSeries(variable: OceanVariable) {
  const file = variable === 'sst' ? 'sst-monthly' : 'chlorophyll-monthly'
  return useResource(useCallback((signal: AbortSignal) => json<Series>(`/data/${file}.json`, signal), [file]))
}

export function cellAt({ layer, values }: Raster, lat: number, lng: number) {
  const col = Math.floor((lng - layer.west) / layer.step)
  const row = Math.floor((layer.north - lat) / layer.step)
  if (row < 0 || row >= layer.height || col < 0 || col >= layer.width) return null
  const value = values[row * layer.width + col]
  return {
    value: Number.isFinite(value) ? value : null,
    lat: layer.north - (row + 0.5) * layer.step,
    lng: layer.west + (col + 0.5) * layer.step,
  }
}

// Escalas secuenciales compartidas por todas las fechas de una variable.
export const scales = {
  sst: { ticks: [19, 21.25, 23.5, 25.75, 28], colors: ['#211150', '#64216c', '#bb3755', '#f7814c', '#fff0aa'] },
  'chlorophyll-a': { ticks: [0.03125, 0.1767766953, 1, 5.6568542495, 32], colors: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'] },
}
export function rasterImage({ layer, values }: Raster): string {
  const canvas = document.createElement('canvas')
  canvas.width = layer.width
  canvas.height = layer.height
  const ctx = canvas.getContext('2d')!
  const pixels = ctx.createImageData(layer.width, layer.height)
  const { ticks, colors } = scales[layer.variable]
  const stops = colors.map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i+2), 16)))
  const convert = layer.variable === 'sst' ? (x: number) => x : Math.log
  const lo = convert(ticks[0]), hi = convert(ticks[ticks.length-1])
  values.forEach((v, i) => {
    if (!Number.isFinite(v)) return
    const position = Math.min(1, Math.max(0, (convert(v)-lo)/(hi-lo))) * (stops.length-1)
    const a = Math.min(stops.length-2, Math.floor(position))
    for (let channel = 0; channel < 3; channel++) {
      pixels.data[i*4+channel] = stops[a][channel] + (position-a)*(stops[a+1][channel]-stops[a][channel])
    }
    pixels.data[i*4+3] = 255
  })
  ctx.putImageData(pixels, 0, 0)
  return canvas.toDataURL()
}

export const getManifest = (signal: AbortSignal) => json<Manifest>('/data/spatial/manifest.json', signal)
export const getLand = (signal: AbortSignal) => json<MultiPolygon>('/data/spatial/islands.geojson', signal)
