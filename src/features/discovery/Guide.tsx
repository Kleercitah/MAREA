import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../../i18n/Language'
import { getManifest, loadRaster, rasterImage, scales, useAnalysis, useResource, type Layer } from '../ocean/data'
import { getOni } from '../timeline/oni'
import './discovery.css'

function GuideMap({layer}: {layer: Layer}) {
  const {language} = useLanguage()
  const es = language==='es'
  const loader = useMemo(()=>async(signal:AbortSignal)=>rasterImage(await loadRaster(layer,signal)),[layer])
  const image = useResource(loader)
  const scale = scales.sst
  return <figure className="guide-map">
    {image?.value ? <img src={image.value} width={layer.width} height={layer.height}
      alt={es?'Rejilla mensual de temperatura del mar alrededor de Galápagos, norte arriba':'Monthly sea temperature grid around Galápagos, north up'}/>
      : <p role="status">{image?.failed ? es?'Capa no disponible':'Layer unavailable' : es?'Cargando…':'Loading…'}</p>}
    <div className="color-scale" style={{background:'linear-gradient(to right,'+scale.colors.join(',')+')'}}/>
    <figcaption>{scale.ticks[0]} – {scale.ticks.at(-1)} °C · {layer.month} · NASA JPL MUR</figcaption>
    <Link to={'/ocean-explorer?variable=sst&month='+layer.month}>{es?'Consultar una celda':'Inspect a grid cell'} →</Link>
  </figure>
}

export default function Guide({onClose}: {onClose:()=>void}) {
  const {language} = useLanguage()
  const es = language==='es'
  const [step,setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(()=>{ heading.current?.focus({preventScroll:true}) },[step])
  const analysis = useAnalysis(), manifest = useResource(getManifest), oni = useResource(getOni)
  const sst = analysis?.value?.comparisons.find(c=>c.id==='elnino-2015-2016-sst')
  const chl = analysis?.value?.comparisons.find(c=>c.id==='elnino-2015-2016-chlorophyll')
  const episode = oni?.value?.episodes.find(e=>e.id==='el-nino-2014-2016')
  const layer = manifest?.value?.layers.find(l=>l.variable==='sst' && l.month===episode?.peak.month)
  const titles = es ? ['Ubica las observaciones','Mira el mes del máximo ONI','Compara meses equivalentes','Interpreta la respuesta marina','Investiga un sector']
    : ['Locate the observations','Map the month of peak ONI','Compare matching months','Interpret the marine response','Investigate a sector']
  const number = (n:number|null|undefined) => n==null?'—':n.toLocaleString(language,{maximumFractionDigits:3,signDisplay:'exceptZero'})
  const bounds = manifest?.value?.bounds
  const ready = sst && chl && episode && bounds
  return <section className="discovery-guide" aria-label={es?'Recorrido guiado':'Guided investigation'}>
    <div className="guide-top"><span>{es?'Paso':'Step'} {step+1}/{titles.length}</span>
      <button onClick={onClose}>{es?'Cerrar recorrido':'Close guide'}</button></div>
    <h2 ref={heading} tabIndex={-1}>{titles[step]}</h2>
    {!ready ? <p role="status">{analysis?.failed||manifest?.failed||oni?.failed ? es?'No se pudieron cargar las fuentes.':'Could not load the sources.' : es?'Cargando…':'Loading…'}</p> : <>
      {step===0 && <p>{es?'En el Pacífico ecuatorial, MAREA compara la temperatura del agua (SST) y la concentración superficial de clorofila-a, un pigmento del fitoplancton. El recorte de Galápagos abarca':'In the equatorial Pacific, MAREA compares sea surface temperature (SST) and surface chlorophyll-a, a phytoplankton pigment. The Galápagos study area spans'}
        {' '}{bounds[0][1]}° … {bounds[1][1]}° ({es?'longitud':'longitude'}), {bounds[0][0]}° … {bounds[1][0]}° ({es?'latitud':'latitude'}).</p>}
      {step===1 && <><p>{es?'El episodio del registro ONI abarcó':'The episode in the ONI record extended from'} {episode.start} – {episode.end}.
        {' '}{es?'En su máximo, el índice del Pacífico Niño 3.4 alcanzó':'At its peak, the Pacific Niño 3.4 index reached'} {number(episode.peak.value)} °C.</p>
        {layer ? <GuideMap layer={layer}/> : <p>{es?'Capa mensual ausente.':'Monthly layer unavailable.'}</p>}</>}
      {step===2 && <><p>{es?'El intervalo de comparación de MAREA es':'MAREA’s comparison interval is'} {sst.period.start.slice(0,7)} – {sst.period.end.slice(0,7)}.
        {' '}{es?'Se compara cada mes con su referencia del mismo mes del calendario.':'Each month is compared with its matching calendar-month reference.'}</p>
        <p><strong>Δ SST {number(sst.difference)} °C · Δ {es?'clorofila-a':'chlorophyll-a'} {number(chl.difference)} mg/m³ ({number(chl.differencePercent)} %)</strong></p>
        <p>{es?'Cobertura':'Coverage'} · SST {sst.validMonths}/{sst.months} · {es?'clorofila-a':'chlorophyll-a'} {chl.validMonths}/{chl.months}</p></>}
      {step===3 && <p>{es?'En expediciones a Galápagos durante este episodio, los cambios en las aguas profundas se asociaron con cambios en las comunidades de plancton. El afloramiento aporta nutrientes al fitoplancton, que sostiene redes alimentarias. La respuesta varía por lugar y especie.':
        'During this episode, Galápagos field surveys linked shifts in deep water masses to changes in plankton communities. Upwelling supplies nutrients to phytoplankton that support food webs. Responses vary by site and species.'}
        {' '}<a href="https://pubmed.ncbi.nlm.nih.gov/34921709/">Neave et al. ↗</a></p>}
      {step===3 && <p>{es?'En los censos de 2015 también se contaron menos lobos peleteros que en 2014. El dato procede de las colonias censadas por Páez-Rosas et al.':
        'The 2015 surveys also counted fewer fur seals than in 2014. This result comes from colonies surveyed by Páez-Rosas et al.'}
        {' '}<Link to="/marine-life?species=Arctocephalus%20galapagoensis">{es?'Ver estudio y magnitud':'See the study and count change'} →</Link></p>}
      {step===4 && <><p>{es?'La diferencia del episodio describe una asociación regional. ¿También hay evidencia de cambio sostenido en un sector? En clase, elijan dos sectores, comparen sus pendientes con Galápagos y expliquen si su conclusión cambia al pasar de p a q.':
        'The episode difference describes a regional association. Is there evidence of sustained change in one sector? In class, choose two sectors, compare their slopes with Galápagos and explain whether using q instead of p changes your conclusion.'}</p>
        <Link className="primary" to="/ocean-explorer?mode=sst-trend&activity=1">{es?'Investigar con el mapa':'Investigate with the map'} →</Link></>}
    </>}
    <div className="discovery-controls"><button disabled={step===0} onClick={()=>setStep(step-1)}>{es?'Anterior':'Previous'}</button>
      {step<titles.length-1 && <button disabled={!ready} onClick={()=>setStep(step+1)}>{es?'Siguiente':'Next'}</button>}</div>
  </section>
}
