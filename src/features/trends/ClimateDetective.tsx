import { useState } from 'react'
import { ScienceContext } from '../../components/ScienceContext'
import { useLanguage } from '../../i18n/Language'
import { useAnalysis, useRegionalSeries, type OceanVariable } from '../ocean/data'
import { TimeChart } from './TimeChart'
import './climate.css'

type DisplayMode = 'observed' | 'absolute' | 'percent'

export default function ClimateDetective() {
  const {language, t} = useLanguage()
  const es = language === 'es'
  const [variable, change] = useState<OceanVariable>('sst')
  const [period, setPeriod] = useState('full')
  const [mode, setMode] = useState<DisplayMode>('observed')
  const analysis = useAnalysis()
  const regional = useRegionalSeries(variable)
  const bundle = analysis?.value, series = regional?.value
  const id = series?.dataset.id
  const anomaly = bundle?.anomalies.find(a=>a.datasetId===id)
  const trend = bundle?.trends.find(a=>a.datasetId===id)
  const comparisons = bundle?.comparisons.filter(c=>c.id.startsWith('elnino-2015-2016-')) ?? []
  const years = [...new Set(series?.observations.map(p => p.date.slice(0,4)))]
  const range = period==='full' ? series?.dataset.period : period==='episode'
    ? comparisons.find(c=>c.datasetId===id)?.period : {start:period+'-01-01',end:period+'-12-31'}
  const unit = variable==='sst'?'°C':'mg/m³'
  const fmt = (n: number | null | undefined, digits=3) => n == null ? '—' : n.toLocaleString(language,{maximumFractionDigits:digits})
  const dates = (r: {start:string; end:string}) => r.start.slice(0,7)+' – '+r.end.slice(0,7)
  const names = {sst: es?'Temperatura superficial':'Sea surface temperature', 'chlorophyll-a':es?'Clorofila-a':'Chlorophyll-a'}
  const modes = {observed:es?'Media mensual':'Monthly mean', absolute:es?'Anomalía absoluta':'Absolute anomaly', percent:es?'Anomalía porcentual':'Percent anomaly'}
  const points = (mode==='observed' ? series?.observations : anomaly?.observations.map(p=>({date:p.date,value:mode==='percent'?p.percent:p.absolute}))) ?? []
  const visible = points.filter(p=>range && p.date>=range.start && p.date<=range.end)
  return <section className="wrap climate">
    <p className="eyebrow"><span className="rule"/>{es?'Series regionales · Galápagos':'Regional series · Galápagos'}</p>
    <h1>{t.sections.trends.name}</h1>
    <div className="climate-controls">
      <label><span id="chart-variable">Variable</span><select aria-labelledby="chart-variable" value={variable} onChange={e=>{ change(e.target.value as OceanVariable); if(mode==='percent') setMode('absolute') }}>
        {Object.entries(names).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label><span id="chart-period">{es?'Intervalo de la gráfica':'Chart interval'}</span><select aria-labelledby="chart-period" value={period} onChange={e=>setPeriod(e.target.value)}>
        <option value="full">{es?'Serie completa':'Full record'}</option><option value="episode">El Niño 2015–2016</option>
        {years.map(year=><option key={year}>{year}</option>)}</select></label>
      <label><span id="chart-display">{es?'Visualización':'Display'}</span><select aria-labelledby="chart-display" value={mode} onChange={e=>setMode(e.target.value as DisplayMode)}>
        {Object.entries(modes).filter(([k])=>k!=='percent'||variable==='chlorophyll-a').map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
    </div>
    {analysis?.failed || regional?.failed ? <p role="alert">{es?'No se pudo cargar la serie o su análisis.':'The series or its analysis could not be loaded.'}</p>
      : !bundle || !series ? <p role="status">{es?'Cargando…':'Loading…'}</p> : <>
      <TimeChart key={variable+mode+period} points={visible} unit={mode==='percent'?'%':unit}
        title={names[variable]+' · '+modes[mode]} anomaly={mode!=='observed'}/>
      <p className="climate-note"><a href={series.dataset.sourceUrl}>{series.dataset.product} ↗</a>
        {mode!=='observed' && anomaly && ' · '+(es?'Referencia mensual ':'Monthly reference ')+dates(anomaly.baseline)}</p>
      <section className="trend-summary"><h2>{es?'Tendencia de la serie completa':'Full-record trend'}</h2>
        {trend?.status==='estimated' ? <>
          <p>{dates(trend)} · {es?'Pendiente de Sen estacional':'Seasonal Sen slope'} · n = {trend.n}</p>
          <dl><div><dt>{es?'Por año':'Per year'}</dt><dd>{fmt(trend.slopePerYear,5)} {unit}</dd></div>
            <div><dt>{es?'Por década':'Per decade'}</dt><dd>{fmt(trend.slopePerDecade,5)} {unit}</dd></div>
            <div><dt>{es?'IC':'CI'} {fmt(bundle.engine.confidence*100)} % · {unit}/{es?'año':'year'}</dt><dd>{trend.confidenceInterval?.map(n=>fmt(n,5)).join(' … ') ?? '—'}</dd></div>
            <div><dt>{es?'Valor p':'p-value'}</dt><dd>{fmt(trend.pValue,4)}</dd></div></dl>
          <p>{trend.significant ? (es?'Tendencia estadísticamente significativa.':'Statistically significant trend.') :
            (es?'La tendencia no fue estadísticamente significativa para este periodo (α = 0,05).':'The trend was not statistically significant over this period (α = 0.05).')}
            {' '}{es?'Prueba estacional de Mann-Kendall con corrección de Hamed–Rao.':'Seasonal Mann–Kendall test with Hamed–Rao correction.'}</p>
        </> : <p>{es?'Datos insuficientes':'Insufficient data'}</p>}
      </section>
      <section className="episode"><h2>El Niño 2015–2016</h2>
        {comparisons[0] && <p>{dates(comparisons[0].period)} · {es?'Referencia de los mismos meses':'Reference for matching calendar months'} · {dates(comparisons[0].reference)}</p>}
        <div className="comparison-scroll" tabIndex={0}><table><thead><tr>{['Variable',es?'Media':'Mean',es?'Referencia':'Reference',
          es?'Diferencia':'Difference','Δ %',es?'Cobertura temporal':'Temporal coverage'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{comparisons.map(c=><tr key={c.id}><th scope="row">{names[c.variableId as OceanVariable]} ({c.units==='mg m-3'?'mg/m³':c.units})</th>
          <td>{fmt(c.mean)}</td><td>{fmt(c.referenceMean)}</td><td>{fmt(c.difference)}</td><td>{fmt(c.differencePercent,1)}</td>
          <td>{c.validMonths}/{c.months} ({fmt(100*c.coverage)} %)</td></tr>)}</tbody></table></div>
      </section>
      <ScienceContext variable={variable}/>
    </>}
  </section>
}
