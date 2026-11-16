import { useState } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../../i18n/Language'
import { useAnalysis, useRegionalSeries, useResource } from '../ocean/data'
import './timeline.css'

import { getOni, type OniIndex, type OniEpisode } from './oni'

// Expande un intervalo "AAAA-MM" a la lista continua de sus meses.
function monthsBetween(start: string, end: string) {
  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)
  const months: string[] = []
  let year = startYear
  let month = startMonth
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month += 1
    if (month > 12) { month = 1; year += 1 }
  }
  return months
}

function OniRibbon({ oni, month, onSelect }: { oni: OniIndex; month: string; onSelect: (month: string) => void }) {
  const { language } = useLanguage()
  const es = language === 'es'
  const seasons = oni.seasons
  if (!seasons.length) return null
  const width = 1000, height = 208, pad = 18, top = 16, bottom = 166
  const values = seasons.map(season => season.value)
  const low = Math.min(...values) - 0.2
  const high = Math.max(...values) + 0.2
  const x = (i: number) => pad + i * (width - 2 * pad) / Math.max(1, seasons.length - 1)
  const y = (value: number) => bottom - (value - low) * (bottom - top) / (high - low)
  const at = (value: string) => seasons.findIndex(season => season.month === value)
  const path = seasons.map((season, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(season.value).toFixed(1)}`).join(' ')
  const chosen = Math.max(0, at(month))
  const current = seasons[chosen]
  const active = oni.episodes.find(item => month >= item.start && month <= item.end)?.id
  const tone = (value: number) => value >= oni.threshold ? '#E8A0FF' : value <= -oni.threshold ? '#83E7FF' : '#8fa3c4'
  const short = (value: string) => new Intl.DateTimeFormat(language, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + '-01T00:00:00Z'))
  const format = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
  return <figure className="oni-ribbon">
    <figcaption><strong>{oni.index} · {oni.version}</strong><span>{oni.region}</span></figcaption>
    <svg viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={(es ? 'Índice ONI de 2003 a 2024 con los episodios declarados por el CPC' : 'ONI index from 2003 to 2024 with CPC-declared episodes') + ' · ' + short(month)}
      onClick={event => {
        const rect = event.currentTarget.getBoundingClientRect()
        const px = (event.clientX - rect.left) * width / rect.width
        const index = Math.round((px - pad) / (width - 2 * pad) * (seasons.length - 1))
        onSelect(seasons[Math.max(0, Math.min(seasons.length - 1, index))].month)
      }}>
      {oni.episodes.map(item => {
        const from = at(item.start), to = at(item.end)
        if (from < 0 || to < 0) return null
        return <rect key={item.id} x={x(from)} y={top} width={Math.max(2, x(to) - x(from))} height={bottom - top}
          fill={item.phase === 'el-nino' ? '#E8A0FF' : '#83E7FF'} opacity={item.id === active ? 0.18 : 0.08}>
          <title>{item.label[language] + ' ' + item.designation}</title></rect>
      })}
      <line x1={pad} x2={width - pad} y1={y(0)} y2={y(0)} stroke="#5c6d8f"/>
      <line x1={pad} x2={width - pad} y1={y(oni.threshold)} y2={y(oni.threshold)} stroke="#7d8aa6" strokeDasharray="4 5"/>
      <line x1={pad} x2={width - pad} y1={y(-oni.threshold)} y2={y(-oni.threshold)} stroke="#7d8aa6" strokeDasharray="4 5"/>
      <path d={path} fill="none" stroke="#c4d1e4" strokeWidth="1.4"/>
      {seasons.map((season, i) => <circle key={season.month} cx={x(i)} cy={y(season.value)} r="2.6" fill={tone(season.value)}/>)}
      <text x={pad} y={y(oni.threshold) - 7}>+{format(oni.threshold)}</text>
      <text x={pad} y={y(-oni.threshold) + 15}>-{format(oni.threshold)}</text>
      <line x1={x(chosen)} x2={x(chosen)} y1={top} y2={bottom} stroke="#ffffff" strokeDasharray="3 4"/>
      <circle cx={x(chosen)} cy={y(current.value)} r="5" fill="#ffffff" stroke={tone(current.value)} strokeWidth="2"/>
      {[0, Math.floor((seasons.length - 1) / 2), seasons.length - 1].map(index =>
        <text key={index} x={x(index)} y={height - 10} textAnchor="middle" className="bar-year">{seasons[index].year}</text>)}
    </svg>
    <label className="oni-reader"><span>{es ? 'Consultar mes sobre el índice' : 'Inspect month on the index'}</span>
      <input type="range" min={0} max={seasons.length - 1} value={chosen}
        aria-valuetext={`${short(month)} · ${oni.index} ${format(current.value)}`}
        onChange={event => onSelect(seasons[Number(event.target.value)].month)}/>
      <output>{short(month)} · {format(current.value)}</output></label>
    <small>{es ? 'Cada punto es una temporada móvil de tres meses.' : 'Each point is a three-month running season.'}</small>
  </figure>
}

function AnomalyBars({ months, values, unit, selected, label }: {
  months: string[]; values: (number | null)[]; unit: string; selected: string; label: string
}) {
  const { language } = useLanguage()
  const width = 1000, height = 96, middle = 52, pad = 10
  const known = values.filter((value): value is number => value !== null).map(Math.abs)
  const scale = Math.max(0.0001, ...(known.length ? known : [1]))
  const band = (width - 2 * pad) / Math.max(1, months.length)
  const month = (value: string) => new Intl.DateTimeFormat(language, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + '-01T00:00:00Z'))
  const format = (value: number) => value.toLocaleString(language, { maximumFractionDigits: 2 })
  return <svg className="anomaly-bars" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
    <line x1={pad} x2={width - pad} y1={middle} y2={middle} stroke="#5c6d8f"/>
    {values.map((value, i) => value === null ? null : <rect key={months[i]}
      x={pad + i * band + band * 0.16} width={band * 0.68}
      y={value >= 0 ? middle - (value / scale) * (middle - 8) : middle}
      height={Math.abs(value) / scale * (middle - 8)}
      fill={value >= 0 ? '#E8A0FF' : '#83E7FF'} opacity={months[i] === selected ? 1 : 0.6}>
      <title>{month(months[i]) + ' · ' + format(value) + ' ' + unit}</title></rect>)}
    {[0, months.length - 1].map(index => <text key={index} x={pad + index * band + band / 2} y={height - 6}
      textAnchor={index === 0 ? 'start' : 'end'} className="bar-year">{month(months[index])}</text>)}
  </svg>
}

export default function ElNinoTimeline() {
  const { language, t: site } = useLanguage()
  const es = language === 'es'
  const oni = useResource(getOni)
  const sst = useRegionalSeries('sst')
  const chlorophyll = useRegionalSeries('chlorophyll-a')
  const analysis = useAnalysis()
  const [month, setMonth] = useState('2015-12')
  const [episodeId, setEpisodeId] = useState('el-nino-2014-2016')
  const eyebrow = <p className="eyebrow"><span className="rule"/>{es ? 'Índice ONI · NOAA CPC' : 'ONI index · NOAA CPC'}</p>
  const index = oni?.value

  const selectMonth = (value: string) => {
    setMonth(value)
    const found = index?.episodes.find(item => value >= item.start && value <= item.end)
    if (found) setEpisodeId(found.id)
  }
  const selectEpisode = (item: OniEpisode) => { setEpisodeId(item.id); setMonth(item.peak.month) }

  const format = (value: number | null | undefined, digits = 2) => value == null ? '—' : value.toLocaleString(language, { maximumFractionDigits: digits })
  const stamp = (value: string) => new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(value.slice(0, 7) + '-01T00:00:00Z'))
  const short = (value: string) => new Intl.DateTimeFormat(language, { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(value.slice(0, 7) + '-01T00:00:00Z'))
  const units: Record<string, string> = { sst: '°C', 'chlorophyll-a': 'mg/m³' }
  const names: Record<string, string> = {
    sst: es ? 'Temperatura superficial' : 'Sea surface temperature',
    'chlorophyll-a': es ? 'Clorofila-a' : 'Chlorophyll-a',
  }

  if (oni?.failed || sst?.failed || chlorophyll?.failed || analysis?.failed)
    return <section className="wrap timeline">{eyebrow}<h1>{site.sections.timeline.name}</h1>
      <p role="alert">{es ? 'No se pudieron cargar los datos de la cronología.' : 'The chronology data could not be loaded.'}</p></section>
  if (!index || !sst?.value || !chlorophyll?.value || !analysis?.value)
    return <section className="wrap timeline">{eyebrow}<h1>{site.sections.timeline.name}</h1>
      <p role="status">{es ? 'Cargando…' : 'Loading…'}</p></section>

  const episode = index.episodes.find(item => item.id === episodeId)
  const season = index.seasons.find(item => item.month === month)
  const contained = index.episodes.find(item => month >= item.start && month <= item.end)
  const phase = contained?.phase ?? (season && Math.abs(season.value) >= index.threshold ? 'threshold' : 'neutral')
  const phaseText = contained ? contained.label[language]
    : phase === 'threshold' ? (es ? 'Umbral superado, sin episodio declarado' : 'Threshold exceeded, no declared episode')
    : (es ? 'Sin episodio declarado' : 'No declared episode')
  const sstRow = sst.value.observations.find(observation => observation.date.slice(0, 7) === month)
  const chlRow = chlorophyll.value.observations.find(observation => observation.date.slice(0, 7) === month)
  const sstAnomalies = analysis.value.anomalies.find(item => item.variableId === 'sst' && item.datasetId === sst.value!.dataset.id)
  const chlAnomalies = analysis.value.anomalies.find(item => item.variableId === 'chlorophyll-a' && item.datasetId === chlorophyll.value!.dataset.id)
  const sstAnomaly = sstAnomalies?.observations.find(item => item.date === sstRow?.date)
  const chlAnomaly = chlAnomalies?.observations.find(item => item.date === chlRow?.date)
  const comparisons = episode?.id === 'el-nino-2014-2016'
    ? analysis.value.comparisons.filter(item => item.id.startsWith('elnino-2015-2016-')) : []
  const episodeMonths = episode ? monthsBetween(episode.start, episode.end) : []
  const sstStrip = episodeMonths.map(value => sstAnomalies?.observations.find(item => item.date.slice(0, 7) === value)?.absolute ?? null)
  const chlStrip = episodeMonths.map(value => chlAnomalies?.observations.find(item => item.date.slice(0, 7) === value)?.percent ?? null)
  const warm = index.episodes.filter(item => item.phase === 'el-nino')
  const strongest = warm.reduce<OniEpisode | undefined>((best, item) => !best || item.peak.value > best.peak.value ? item : best, undefined)
  const year = month.slice(0, 4)
  const years = [...new Set(index.seasons.map(item => item.year))]
  const monthsOfYear = index.seasons.filter(item => item.year === Number(year))

  return <section className="wrap timeline">
    {eyebrow}
    <h1>{site.sections.timeline.name}</h1>
    <p className="timeline-lead">{es
      ? 'Veintidós años de temperatura y clorofila-a alrededor de Galápagos junto al índice ONI del CPC, que documenta oficialmente los episodios de El Niño y La Niña. La cronología describe; el análisis estadístico vive en Climate Detective.'
      : 'Twenty-two years of temperature and chlorophyll-a around Galápagos alongside the CPC ONI, which officially documents El Niño and La Niña episodes. The chronology describes; the statistical analysis lives in Climate Detective.'}</p>

    <OniRibbon oni={index} month={month} onSelect={selectMonth}/>

    <div className="timeline-controls">
      <label><span id="oni-year">{es ? 'Año' : 'Year'}</span>
        <select aria-labelledby="oni-year" value={year} onChange={event => selectMonth(event.target.value + '-01')}>
          {years.map(value => <option key={value}>{value}</option>)}
        </select></label>
      <label><span id="oni-month">{es ? 'Mes' : 'Month'}</span>
        <select aria-labelledby="oni-month" value={month} onChange={event => selectMonth(event.target.value)}>
          {monthsOfYear.map(item => <option key={item.month} value={item.month}>{short(item.month)}</option>)}
        </select></label>
      <p className="phase-badge" data-phase={phase}>{phaseText}</p>
    </div>

    <div className="readout-grid">
      <div><p className="eyebrow">{index.index}</p><strong>{format(season?.value)} °C</strong>
        <p>{stamp(month)} · {index.region}</p></div>
      <div><p className="eyebrow">{names.sst}</p>
        <strong>{sstRow?.value == null ? (es ? 'Sin media' : 'No mean') : format(sstRow.value) + ' °C'}</strong>
        <p>{es ? 'Anomalía' : 'Anomaly'} {format(sstAnomaly?.absolute)} °C · {es ? 'referencia' : 'reference'} {index.period.start.slice(0, 4)}–{index.period.end.slice(0, 4)}</p></div>
      <div><p className="eyebrow">{names['chlorophyll-a']}</p>
        <strong>{chlRow?.value == null ? (es ? 'Sin media' : 'No mean') : format(chlRow.value, 3) + ' mg/m³'}</strong>
        <p>{es ? 'Anomalía' : 'Anomaly'} {format(chlAnomaly?.absolute)} mg/m³{chlAnomaly?.percent != null ? ' · ' + format(chlAnomaly.percent, 1) + ' %' : ''}</p></div>
    </div>

    <section className="episode-catalogue">
      <h2>{es ? 'Episodios documentados' : 'Documented episodes'}</h2>
      <p className="catalogue-note">{es
        ? 'Los intervalos siguen la tabla oficial del CPC: al menos cinco temporadas móviles consecutivas sobre +0,5 °C o bajo −0,5 °C. Los meses restantes no se marcan como episodio.'
        : 'Intervals follow the CPC official table: at least five consecutive three-month seasons above +0.5 °C or below −0.5 °C. Remaining months are not marked as episodes.'}</p>
      <ul className="episode-chips">
        {index.episodes.map(item => <li key={item.id}>
          <button type="button" aria-pressed={item.id === episodeId} data-phase={item.phase}
            onClick={() => selectEpisode(item)}>{item.label[language]} {item.designation}
            {strongest?.id === item.id && <span className="strongest"> · {es ? 'pico máximo del registro' : 'highest peak on record'}</span>}
          </button></li>)}
      </ul>
    </section>

    {episode && <section className="episode-detail">
      <h2>{episode.label[language]} {episode.designation}</h2>
      <dl>
        <div><dt>{es ? 'Intervalo' : 'Interval'}</dt><dd>{short(episode.start)} – {short(episode.end)}</dd></div>
        <div><dt>{es ? 'Temporadas' : 'Seasons'}</dt><dd>{episode.seasons}</dd></div>
        <div><dt>{es ? 'Pico' : 'Peak'}</dt><dd>{short(episode.peak.month)} · {format(episode.peak.value)} °C</dd></div>
      </dl>
      {contained?.id !== episode.id && <p className="detail-note">{es
        ? 'El mes consultado está fuera de este episodio.' : 'The inspected month lies outside this episode.'}</p>}
      {comparisons.map(item => <p className="comparison-line" key={item.id}>
        <strong>{names[item.variableId]}</strong>{' · '}{es ? 'media del episodio' : 'episode mean'} {format(item.mean, 3)} {units[item.variableId]}
        {' '}{es ? 'frente a la referencia de los mismos meses' : 'against the matching-month reference'} {format(item.referenceMean, 3)} {units[item.variableId]}
        {' · '}{item.differencePercent == null
          ? (es ? 'diferencia' : 'difference') + ' ' + format(item.difference, 3) + ' ' + units[item.variableId]
          : (es ? 'diferencia' : 'difference') + ' ' + format(item.differencePercent, 1) + ' %'}
        {' · '}{item.validMonths}/{item.months} {es ? 'meses' : 'months'}</p>)}
      {comparisons[0] && <p className="detail-source">{es ? 'Comparación verificada por el motor de Fase 2'
        : 'Comparison verified by the Phase 2 engine'} · <a href={comparisons[0].citation} target="_blank" rel="noreferrer">NOAA CPC · ONI ↗</a></p>}
      <div className="strips">
        <figure><figcaption>{names.sst} · {es ? 'anomalía mensual' : 'monthly anomaly'} (°C)</figcaption>
          <AnomalyBars months={episodeMonths} values={sstStrip} unit="°C" selected={month}
            label={(es ? 'Anomalía mensual de temperatura durante ' : 'Monthly temperature anomaly during ') + episode.designation}/></figure>
        <figure><figcaption>{names['chlorophyll-a']} · {es ? 'anomalía mensual' : 'monthly anomaly'} (%)</figcaption>
          <AnomalyBars months={episodeMonths} values={chlStrip} unit="%" selected={month}
            label={(es ? 'Anomalía porcentual mensual de clorofila durante ' : 'Monthly percent chlorophyll anomaly during ') + episode.designation}/></figure>
      </div>
    </section>}

    <div className="timeline-links">
      <Link className="primary" to={'/ocean-explorer?variable=sst&month=' + month}>{es ? 'Ver temperatura de este mes' : 'View this month in Ocean Explorer'}</Link>
      <Link className="primary" to={'/ocean-explorer?variable=chlorophyll-a&month=' + month}>{es ? 'Ver clorofila-a de este mes' : 'View chlorophyll-a for this month'}</Link>
      <Link className="secondary" to="/climate-detective">{es ? 'Análisis estadístico completo' : 'Full statistical analysis'}</Link>
    </div>

    <details className="timeline-notes">
      <summary>{es ? 'Cómo leer esta cronología' : 'How to read this chronology'}</summary>
      <p>{index.convention[language]}</p>
      <p>{index.limitations[language]}</p>
      <p>{es ? 'Última consulta' : 'Retrieved'} {index.retrieved.slice(0, 10)} · SHA-256 {index.sha256.slice(0, 10)}… ·{' '}
        <a href={index.source} target="_blank" rel="noreferrer">{es ? 'Tabla oficial del CPC' : 'CPC official table'} ↗</a></p>
    </details>
  </section>
}
