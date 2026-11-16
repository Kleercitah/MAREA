import { useAnalysis, useRegionalSeries, useResource } from '../ocean/data'
import { getOni } from '../timeline/oni'
import { ensoPhase, readIndicator, type RegionalMonth } from './regionalMonth'

export function useRegionalMonth(requested: string | null) {
  const sst = useRegionalSeries('sst')
  const chlorophyll = useRegionalSeries('chlorophyll-a')
  const analysis = useAnalysis()
  const oni = useResource(getOni)
  const months = [...new Set([...(sst?.value?.observations ?? []), ...(chlorophyll?.value?.observations ?? [])]
    .map(row => row.date.slice(0, 7)))].sort()
  const preferred = requested ?? '2024-10'
  const month = months.length && !months.includes(preferred) ? months[months.length - 1] : preferred
  const record: RegionalMonth = {
    month,
    sst: readIndicator('sst', month, sst?.value, analysis?.value),
    chlorophyll: readIndicator('chlorophyll-a', month, chlorophyll?.value, analysis?.value),
    phase: ensoPhase(month, oni?.value),
  }
  return { record, months, sst, chlorophyll,
    // Los selectores de año y mes permanecen visibles durante la carga y solo se
    // habilitan con la serie y la climatología completas, sin ofrecer fechas
    // mientras faltan datos.
    loaded: !!(sst?.value && chlorophyll?.value && analysis?.value),
    failed: !!(sst?.failed || chlorophyll?.failed || analysis?.failed) }
}

export function speciesMonthUrl(path: string, species: string, month: string) {
  return path + '?species=' + encodeURIComponent(species) + '&month=' + encodeURIComponent(month)
}
