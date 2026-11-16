import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useLanguage } from '../../i18n/Language'
import { json, useAnalysis, useResource, type OceanVariable } from '../ocean/data'
import { TimeChart } from '../trends/TimeChart'
import { SectorMap } from './SectorMap'
import { getSectorIndex, modeNames, sectorBounds, type Mode, type SectorSeries } from './data'
import '../trends/climate.css'
import './discovery.css'


export function Discovery({mode}: {mode:Mode}) {
  const { language } = useLanguage()
  const es = language==='es'
  const [params, setParams] = useSearchParams()
  const update = (key:string,value:string) => { const next = new URLSearchParams(params); next.set(key,value); setParams(next,{replace:true}) }
  const variable: OceanVariable = mode==='chl-trend' || (mode!=='sst-trend' && params.get('variable')==='chlorophyll-a') ? 'chlorophyll-a' : 'sst'
  const index = useResource(getSectorIndex)
  const regional = useAnalysis()?.value?.trends.find(r=>r.variableId===variable)
  const [showSeries, setShowSeries] = useState(false)
  const [answer, setAnswer] = useState<{key:string; significant:boolean}>()
  const file = '/data/sectors/'+variable+'.json'
  const getDetail = useCallback((signal:AbortSignal)=>json<Record<string,SectorSeries>>(file,signal),[file])
  const detail = useResource(showSeries ? getDetail : null)
  if (!index?.value) return <p role="status">{index?.failed ? es?'No se pudo cargar el análisis.':'Analysis unavailable.' : es?'Cargando…':'Loading…'}</p>
  const data = index.value, field = data.variables[variable]
  const requested = params.get('sector') ?? ''
  const id = Object.hasOwn(field.records,requested) ? requested : Object.keys(field.records)[0]
  const result = field.records[id], box = sectorBounds(id,data)
  const fmt = (v:number | null | undefined, digits=4) => v==null ? '—' : v.toLocaleString(language,{maximumFractionDigits:digits})
  const location = [box.south,box.north].map(n=>fmt(n)+'°').join(' … ')+' / '+[box.west,box.east].map(n=>fmt(n)+'°').join(' … ')
  const unit = field.units+(es?'/década':'/decade')
  const period = data.dates[0].slice(0,7)+' – '+data.dates.at(-1)!.slice(0,7)
  const series = detail?.value?.[id]
  const variableName = variable==='sst'?'SST':es?'Clorofila-a':'Chlorophyll-a'
  const questionKey = variable+id
  const conclusion = result.p===null ? (es?'Cobertura insuficiente para estimar la tendencia.':'Insufficient coverage to estimate the trend.')
    : result.adjusted ? (es?'La tendencia es significativa tras el ajuste múltiple.':'The trend is significant after multiple testing adjustment.')
    : result.local ? (es?'La tendencia alcanza significancia local, pero pierde significancia tras el ajuste.':'The trend reaches local significance only. It does not survive adjustment.')
    : (es?'La tendencia estimada no alcanza significancia local ni corregida.':'The estimated trend does not reach local or adjusted significance.')
  const exportResult = () => {
    const report = {sector:id,bounds:box,variable,period,units:unit,source:field.source,datasetId:field.datasetId,
      manifestSHA256:data.manifestSHA256,accessed:new Date().toISOString(),adjustment:data.adjustment,result,
      comparisonPeriod:data.episode,comparisonUnits:field.units,regional,query:window.location.href}
    const url = URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}))
    const link = document.createElement('a'); link.href=url; link.download='MAREA-'+id+'-'+variable+'.json'; link.click()
    setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  return <section className="discovery">
    <h2>{modeNames[language][mode]}</h2>
    <p>{period} · {fmt(data.size)}° × {fmt(data.size)}° · {variableName} · {es?'Malla nativa':'Native grid'} {fmt(field.geometry.step,5)}°</p>
    {params.get('activity')==='1' && <fieldset className="sector-activity">
      <legend>{es?'Investigación en clase':'Classroom investigation'}</legend>
      <p>{es?'Elige un sector y consulta p y q. ¿Hay evidencia de una tendencia tras corregir las comparaciones múltiples?':
        'Choose a sector and inspect p and q. Is there evidence of a trend after adjusting for multiple testing?'}</p>
      {result.q===null ? <p>{es?'Elige un sector con una estimación disponible.':'Choose a sector with an available estimate.'}</p> :
        <div className="discovery-controls">{[true,false].map(value=><button key={String(value)}
          aria-pressed={answer?.key===questionKey && answer.significant===value}
          onClick={()=>setAnswer({key:questionKey,significant:value})}>{value ? es?'Sí':'Yes' : 'No'}</button>)}</div>}
      {answer?.key===questionKey && result.q!==null && <p role="status">
        {answer.significant===result.adjusted ? es?'La evidencia respalda tu respuesta.':'The evidence supports your answer.' :
          es?'Revisa el umbral corregido.':'Check the adjusted threshold.'} {id} · q = {fmt(result.q)} {result.adjusted?' < ':' ≥ '} {fmt(.05)}.
        {' '}{es?'Compara ahora la magnitud de la pendiente con Galápagos completo.':'Now compare the magnitude of the slope with the whole region.'}</p>}
    </fieldset>}
    <div className="discovery-controls">{(mode==='episode'||mode==='significance') &&
      <label>Variable <select aria-label="Variable" value={variable} onChange={e=>update('variable',e.target.value)}>
        <option value="sst">SST</option><option value="chlorophyll-a">{es?'Clorofila-a':'Chlorophyll-a'}</option></select></label>}
      <label>Sector <select aria-label="Sector" value={id} onChange={e=>update('sector',e.target.value)}>
        {Object.keys(field.records).map(key=><option key={key}>{key}</option>)}</select></label></div>
    <div className="discovery-grid"><SectorMap index={data} field={field} selected={id} mode={mode} onSelect={key=>update('sector',key)}/>
      <section className="sector-reading" aria-live="polite">
        <p className="eyebrow">{variableName} · {es?'Sector oceánico':'Ocean sector'}</p><h3>{id}</h3>
        <p>{es?'Latitud / longitud':'Latitude / longitude'} · {location}</p>
        {mode==='episode' && <div className="sector-event"><h4>{data.episode.start.slice(0,7)} – {data.episode.end.slice(0,7)}</h4>
          <p>{es?'Media / referencia sectorial':'Mean / sector reference'} · {fmt(result.episode.mean)} / {fmt(result.episode.referenceMean)} {field.units}</p>
          <strong>Δ {fmt(result.episode.difference)} {field.units}</strong> · {result.episode.validMonths}/{result.episode.months} {es?'meses':'months'}</div>}
        <strong className="sector-slope">{fmt(result.slope)} {unit}</strong>
        <p>{es?'IC del 95 %':'95% CI'} · {result.ci?.map(v=>fmt(v)).join(' … ') ?? '—'} {unit}</p>
        <p>p = {fmt(result.p)} · q (BY) = {fmt(result.q)}</p>
        <p>{conclusion}</p>
        <p>{es?'Cobertura mensual':'Monthly coverage'} · {result.valid}/{data.dates.length} · n = {result.n}</p>
        <p>{es?'Celdas nativas con soporte observado':'Native cells with observed support'} · {result.supportCells}</p>
        <p className="sector-region">{es?'Galápagos completo':'Whole Galápagos region'} · {regional?.status==='estimated'?fmt(regional.slopePerDecade):'—'} {unit}
        {regional?.status==='estimated' && ' · p = '+fmt(regional.pValue)}</p>
        <p>{es?'Fuente':'Source'} · <a href={field.source}>{field.datasetId} ↗</a></p>
        <div className="discovery-controls"><button aria-expanded={showSeries} onClick={()=>setShowSeries(!showSeries)}>{es?'Serie mensual':'Monthly series'}</button>
        <button onClick={exportResult}>{es?'Descargar consulta':'Download query'}</button></div>
      </section></div>
    {showSeries && (series ? <TimeChart key={id+variable} points={data.dates.map((date,i)=>({date,value:series.values[i] ?? null}))}
      title={variableName+' · '+id} unit={field.units} anomaly={false}/> : <p role="status">{detail?.failed ? es?'Serie no disponible':'Series unavailable' : es?'Cargando…':'Loading…'}</p>)}
    <p className="sector-method">{es?'Pendiente estacional de Sen. El criterio local es p < 0,05. El ajuste Benjamini–Yekutieli se aplica por variable (q < 0,05). Los intervalos son locales. La cobertura de nubes y la dependencia temporal limitan la interpretación.':
      'Seasonal Sen slope. Local significance uses p < 0.05. Benjamini–Yekutieli adjustment is applied per variable (q < 0.05). Intervals are local. Cloud coverage and serial dependence limit interpretation.'}</p>
  </section>
}
