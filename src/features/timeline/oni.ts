import { json } from '../ocean/data'

interface OniSeason { month: string; season: string; year: number; value: number }
export interface OniEpisode {
  id: string
  phase: 'el-nino' | 'la-nina'
  label: { es: string; en: string }
  designation: string
  start: string
  end: string
  seasons: number
  peak: { month: string; value: number }
}
export interface OniIndex {
  index: string
  version: string
  threshold: number
  minimumSeasons: number
  region: string
  convention: { es: string; en: string }
  limitations: { es: string; en: string }
  period: { start: string; end: string }
  page: string
  source: string
  citation: string
  retrieved: string
  sha256: string
  seasons: OniSeason[]
  episodes: OniEpisode[]
}

export const getOni = (signal: AbortSignal) => json<OniIndex>('/data/enso-oni.json', signal)
