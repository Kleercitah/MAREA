export type LocalizedText = { es: string; en: string }

export type SpeciesId =
  | 'Spheniscus mendiculus'
  | 'Amblyrhynchus cristatus'
  | 'Zalophus wollebaeki'
  | 'Chelonia mydas'
  | 'Mobula birostris'

export interface Species {
  id: SpeciesId
  scientificName: SpeciesId
  commonNameES: string
  commonNameEN: string
  ecology?: LocalizedText
  relevance?: LocalizedText
  regionIds: string[]
  citations: string[]
  illustrationPath?: string
  photoPath?: string
  photoCredit?: string
}

export interface Region {
  id: string
  nameES: string
  nameEN: string
  polygonGeoJSON: {
    type: 'Polygon'
    coordinates: [longitude: number, latitude: number][][]
  }
  coverageNotes: LocalizedText
}

export interface TimeRange {
  start: string
  end: string
}

export interface Variable {
  id: 'sst' | 'sst-anomaly' | 'chlorophyll-a' | 'chlorophyll-a-anomaly'
  name: LocalizedText
  units: string
}

export interface DatasetMeta {
  id: string
  provider: string
  mission: string
  product: string
  version: string
  sourceUrl: string
  license: string
  fetchedAt: string
  period: TimeRange
  spatialResolution: string
  temporalResolution: string
  units: string
  baseline?: TimeRange
  qaNotes: string
}

export interface Observation {
  date: string
  regionId: Region['id']
  variableId: Variable['id']
  value: number | null
  qualityFlag: string | null
  datasetId: DatasetMeta['id']
}

interface TrendContext extends TimeRange {
  regionId: Region['id']
  variableId: Variable['id']
  datasetId: DatasetMeta['id']
  n: number
  warnings: string[]
}

export type TrendResult = TrendContext & (
  | { status: 'insufficient-data' }
  | {
      status: 'estimated'
      slopePerYear: number
      unit: string
      testName: string
      pValue?: number
      confidenceInterval?: [lower: number, upper: number]
      significant?: boolean
    }
)
