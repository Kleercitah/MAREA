import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useLanguage } from '../../i18n/Language'
import { getManifest, getLand, loadRaster, scales, useAnalysis, useRegionalSeries, useResource, type OceanVariable } from './data'
import { OceanMap, type Selection } from './OceanMap'
import { ScienceContext } from '../../components/ScienceContext'
import { labels } from './labels'
import { Discovery } from '../discovery/Discovery'
import { modeNames, type Mode } from '../discovery/data'
import './ocean.css'

export function OceanExplorer() {
  const { language, t: site } = useLanguage()
  const [params, setParams] = useSearchParams()
  const requested = params.get('mode') ?? 'monthly'
  const mode = Object.hasOwn(modeNames.en,requested) ? requested as Mode : 'monthly'
  return <section className="wrap explorer">
    <p className="eyebrow"><span className="rule"/>{labels[language].atlas}</p>
    <h1>{site.sections.ocean.name}</h1>
    <label className="map-mode"><span id="map-mode">{language==='es'?'Modo del mapa':'Map mode'}</span>
      <select aria-labelledby="map-mode" value={mode} onChange={e=>{
        const next = new URLSearchParams(params)
        if (mode==='chl-trend' || mode==='sst-trend') next.set('variable',mode==='chl-trend'?'chlorophyll-a':'sst')
        next.set('mode',e.target.value); setParams(next)
      }}>{Object.entries(modeNames[language]).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select>
    </label>
    {mode==='monthly' ? <MonthlyExplorer/> : <Discovery mode={mode}/>}
  </section>
}

function MonthlyExplorer() {
  const { language } = useLanguage()
  const t = labels[language]
  const [params] = useSearchParams()
  const [variable, setVariable] = useState<OceanVariable>(() => params.get('variable') === 'chlorophyll-a' ? 'chlorophyll-a' : 'sst')
  const [month, setMonth] = useState(() => {
    const requested = params.get('month')
    return requested && /^\d{4}-\d{2}$/.test(requested) ? requested : '2024-10'
  })
  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(90)
  const [selection, setSelection] = useState<Selection | null>(null)
  const manifest = useResource(getManifest)
  const land = useResource(getLand)
  const analysis = useAnalysis()
  const regional = useRegionalSeries(variable)
  const series = regional?.value
  const available = manifest?.value?.layers.filter(l => l.variable === variable) ?? []
  const layer = available.find(l => l.month === month)
  const loader = useMemo(() => visible && layer ? (signal: AbortSignal) => loadRaster(layer,signal) : null, [visible,layer])
  const raster = useResource(loader)
  const changeMonth = (value: string) => { setSelection(null); setMonth(value) }
  const changeVariable = (value: OceanVariable) => { setSelection(null); setVariable(value) }
  const format = (n: number, places = 2) => n.toLocaleString(language, { maximumFractionDigits: places })
  const stamp = (s: string) => new Intl.DateTimeFormat(language, { month:'short', year:'numeric', timeZone:'UTC' })
    .format(new Date(s.slice(0,7) + '-01T00:00:00Z'))
  const index = series?.observations.findIndex(r => r.date.slice(0,7) === month) ?? -1
  const row = series?.observations[index]
  const last = series?.observations.filter(r => r.value !== null).at(-1)
  const cov = series?.coverage
  const counts = cov?.byMonth?.[index]
  const cells = counts?.validCells ?? cov?.validCellsByMonth?.[index]
  const ocean = counts?.oceanCells ?? cov?.oceanCells
  const anomalies = analysis?.value?.anomalies.find(a => a.variableId === variable &&
    a.datasetId === series?.dataset.id && a.regionId === series?.region.id)
  const anomaly = anomalies?.observations.find(a => a.date === row?.date)
  const unit = variable === 'sst' ? '°C' : 'mg/m³'
  const name = variable === 'sst' ? t.sst : t.chl
  const measurement = (n: number | null | undefined) => n == null ? t.nodata : format(n, variable === 'sst' ? 2 : 3) + ' ' + unit
  const scale = scales[variable]
  const failed = manifest?.failed || land?.failed || raster?.failed
  const status = failed ? t.error : !manifest?.value || !land?.value ? t.loading
    : !layer ? t.absent : !visible ? t.hidden : !raster?.value ? t.loading : ''
  const source = series?.dataset.sourceUrl ?? layer?.source
  const product = variable === 'sst' ? 'NASA JPL · MUR v4.1' : 'NASA Aqua MODIS · R2022.0'
  const year = month.slice(0,4)
  const years = Array.from(new Set(series?.observations.map(r => r.date.slice(0,4))))
  const mapped = new Set(available.map(l => l.month))
  const mappedMonths = [...mapped].sort()
  const previous = mappedMonths.filter(value => value < month).at(-1)
  const next = mappedMonths.find(value => value > month)
  const totalMonths = series?.observations.length ?? 0
  const totals: Record<OceanVariable, number> = { sst: 0, 'chlorophyll-a': 0 }
  for (const item of manifest?.value?.layers ?? []) totals[item.variable] += 1
  return <>
    <div className="ocean-controls">
      <div className="control-row control-row-temporal">
        <fieldset><legend>{t.layer}</legend><div className="variables">
          {(['sst','chlorophyll-a'] as const).map(v => <button key={v} aria-pressed={v === variable}
            onClick={() => changeVariable(v)}>{v === 'sst' ? t.sst : t.chl}</button>)}
        </div></fieldset>
        <label><span id="map-year">{language === 'es' ? 'Año' : 'Year'}</span><select aria-labelledby="map-year" value={year} onChange={e => changeMonth(e.target.value + month.slice(4))}>
          {years.map(y => <option key={y}>{y}</option>)}
        </select></label>
        <label><span id="map-month">{t.month}</span><select aria-labelledby="map-month" value={month} onChange={e => changeMonth(e.target.value)}>
          {(series?.observations ?? []).filter(r => r.date.startsWith(year)).map(r => <option key={r.date} value={r.date.slice(0,7)}>
            {stamp(r.date)} · {r.value === null ? t.nodata : mapped.has(r.date.slice(0,7)) ? t.layer : t.mean}
          </option>)}
        </select></label>
      </div>
      <div className="control-row control-row-status">
        <p className="mapped-summary">{t.available} · {available.filter(l => l.month.startsWith(year)).length}/12</p>
        <fieldset className="date-steps"><legend>{t.quick}</legend><div className="steps">
          <button type="button" aria-label={t.previous} disabled={!previous} onClick={() => previous && changeMonth(previous)}>
            <span aria-hidden="true">‹</span> {previous ? stamp(previous) : '—'}</button>
          <button type="button" aria-label={t.next} disabled={!next} onClick={() => next && changeMonth(next)}>
            {next ? stamp(next) : '—'} <span aria-hidden="true">›</span></button>
        </div></fieldset>
        <p className="variable-availability">{t.record} · {t.sst} {totals.sst}/{totalMonths} · {t.chl} {totals['chlorophyll-a']}/{totalMonths}</p>
      </div>
    </div>
    <div className="explorer-workspace">
      <div className="map-column">
        <div className="map-container">
          {manifest?.value && land?.value && <OceanMap bounds={manifest.value.bounds} land={land.value}
            raster={raster?.value} opacity={opacity} onSelect={setSelection}/>}
          {status && <p role="status" className="map-status">{status}</p>}
        </div>
        <div className="legend-panel">
          {layer && visible && raster?.value && <div className="map-legend">
            <strong>{name} <span>({unit})</span></strong><span>{variable === 'sst' ? t.scale : t.log}</span>
            <div className="color-scale" style={{ background: 'linear-gradient(to right,' + scale.colors.join(',') + ')' }}/>
            <div className="ticks">{scale.ticks.map((n,i) => <span key={n}>
              {i === 0 && layer.min < n ? '≤' : i === scale.ticks.length-1 && layer.max > n ? '≥' : ''}{format(n,5)}
            </span>)}</div>
          </div>}
          <div className="map-options">
            <label><input type="checkbox" checked={visible} disabled={!layer}
              onChange={e => { setVisible(e.target.checked); setSelection(null) }}/>{t.overlay}</label>
            <label>{t.opacity}<input type="range" min="0" max="100" value={opacity} disabled={!layer || !visible}
              onChange={e => setOpacity(Number(e.target.value))}/><output>{opacity}%</output></label>
          </div>
          <div className="map-key"><span className="key-bounds"/>{t.study}<span className="key-gap"/>{t.nodata}<span className="key-land"/>{t.land}</div>
          {manifest?.value && !layer && <p className="map-hint">{t.hint}</p>}
        </div>
      </div>
      <aside className="data-panel">
        <div><p className="eyebrow">{t.mean}</p><h2>{name}</h2><p>{stamp(month)}</p>
          <strong className="regional-value">{regional?.failed ? t.error : !series ? t.loading : measurement(row?.value)}</strong>
          <dl>
            <dt>{t.coverage}</dt><dd>{cells != null && ocean ? format(100*cells/ocean,1) + ' %' : t.nodata}</dd>
            <dt>{t.quality}</dt><dd>{row?.qualityFlag === 'valid' ? t.valid : row?.qualityFlag === 'month-absent' ? t.missing : row ? t.insufficient : '—'}</dd>
            <dt>{t.last}</dt><dd>{last ? stamp(last.date) : '—'}</dd>
          </dl>
        </div>
        <div><h3>{t.anomaly}</h3><strong>{analysis?.failed ? t.error : !analysis?.value ? t.loading : measurement(anomaly?.absolute)}</strong>
          {anomaly?.percent != null && <span> ({format(anomaly.percent)} %)</span>}
          {anomalies && <p>{t.reference} · {stamp(anomalies.baseline.start)} – {stamp(anomalies.baseline.end)}</p>}
        </div>
        <div className="cell-panel" aria-live="polite"><h3>{t.cell}</h3>
          {selection && raster?.value ? <><strong>{selection.status === 'valid' ? measurement(selection.value) : t[selection.status]}</strong>
            <p>{format(selection.lat,4)}°, {format(selection.lng,4)}° · {stamp(month)}</p></> : !status && <p>{t.inspect}</p>}
          {layer && <p>{t.resolution} · {format(layer.step,5)}° ({variable === 'sst' ? '≈ 1 km' : '≈ 4.6 km'})</p>}
        </div>
        <div><p>{t.source}</p>{source && <a href={source} target="_blank" rel="noreferrer">{product} ↗</a>}</div>
      </aside>
    </div>
    <ScienceContext variable={variable}/>
  </>
}
