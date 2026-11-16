export type LocalizedText = { es: string; en: string }

export type SpeciesId =
  | 'Spheniscus mendiculus'
  | 'Amblyrhynchus cristatus'
  | 'Zalophus wollebaeki'
  | 'Nannopterum harrisi'
  | 'Arctocephalus galapagoensis'

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
      slopePerDecade: number
      unit: string
      testName: string
      pValue?: number
      confidenceInterval?: [lower: number, upper: number]
      significant?: boolean
    }
)

export interface ClimatologyMonth {
  month: number
  status: 'estimated' | 'insufficient-data'
  years: number
  mean?: number
  standardDeviation?: number | null
  reason?: string
}

export interface ClimatologyResult {
  regionId: Region['id']
  variableId: Variable['id']
  datasetId: DatasetMeta['id']
  baseline: TimeRange
  units: string
  months: ClimatologyMonth[]
}

export interface AnomalyObservation {
  date: string
  absolute: number | null
  percent: number | null
}

export interface AnomalyResult {
  regionId: Region['id']
  variableId: Variable['id']
  datasetId: DatasetMeta['id']
  baseline: TimeRange
  units: string
  method: string
  observations: AnomalyObservation[]
}

export interface PeriodComparison {
  id: string
  label: LocalizedText
  regionId: Region['id']
  variableId: Variable['id']
  datasetId: DatasetMeta['id']
  units: string
  period: TimeRange
  reference: TimeRange
  citation: string
  notes: LocalizedText
  status: 'estimated' | 'insufficient-data'
  months: number
  validMonths: number
  coverage: number
  mean: number | null
  referenceMean: number | null
  difference: number | null
  differencePercent: number | null
}

export interface AnalysisEngine {
  version: string
  baseline: TimeRange
  baselineNote: LocalizedText
  methods: Record<string, LocalizedText>
  confidence: number
  thresholds: Record<string, number>
  inputs: Record<
    string,
    { datasetId: DatasetMeta['id']; sha256: string; period: TimeRange }
  >
}

export interface AnalysisBundle {
  engine: AnalysisEngine
  climatology: ClimatologyResult[]
  anomalies: AnomalyResult[]
  trends: TrendResult[]
  comparisons: PeriodComparison[]
}
