import { useId } from 'react'
import { useLanguage } from '../../i18n/Language'
import { getLand, useResource } from '../ocean/data'
import { sectorBounds, type Mode, type SectorField, type SectorIndex } from './data'

const levels = ['#5785d5','#aac6ff','#dae4ee','#a4d6c1','#30866f']
const states = ['#65778e','#b09ed5','#6ae3cf']

function shade(value:number, limit:number) {
  const position = Math.max(0,Math.min(4,(value/limit+1)*2))
  const i = Math.min(3,Math.floor(position))
  const channels = [1,3,5].map(start=>{
    const a = parseInt(levels[i].slice(start,start+2),16)
    const b = parseInt(levels[i+1].slice(start,start+2),16)
    return Math.round(a+(b-a)*(position-i))
  })
  return 'rgb('+channels.join(',')+')'
}

export function SectorMap({index,field,mode,selected,onSelect}: {
  index:SectorIndex; field:SectorField; mode:Mode; selected:string; onSelect:(key:string)=>void
}) {
  const { language } = useLanguage()
  const es = language==='es'
  const land = useResource(getLand)
  const clip = useId()
  const [[south,west],[north,east]] = index.bounds
  const x = (lon:number) => (lon-west)*100
  const y = (lat:number) => (north-lat)*100
  const geo = field.geometry
  const significance = mode==='significance'
  const event = mode==='episode'
  const values = Object.values(field.records).flatMap(r => (event ? r.episode.difference : r.slope) ?? [])
  const limit = Math.max(...values.map(Math.abs), .000001)
  const fmt = (v:number) => v.toLocaleString(language,{maximumFractionDigits:3})
  const box = sectorBounds(selected,index)
  const landPath = land?.value?.coordinates.flatMap(p=>p.map(r=>r.map(([lon,lat],i)=>
    (i?'L':'M')+x(lon).toFixed(2)+' '+y(lat).toFixed(2)).join('')+'Z')).join('')
  return <figure className="sector-figure">
    <figcaption>{fmt(north)}° N · {fmt(Math.abs(west))}° W ↔ {fmt(Math.abs(east))}° W</figcaption>
    <svg viewBox={`0 0 ${x(east)} ${y(south)}`} role="group" aria-label={es?'Mapa de sectores de Galápagos':'Galápagos sector map'}>
      <defs><clipPath id={clip}><path d={field.mask} transform={`translate(${x(geo.west)} ${y(geo.north)}) scale(${geo.step*100})`}/></clipPath></defs>
      <g clipPath={`url(#${clip})`}>{Object.entries(field.records).map(([key,r])=>{
        const b = sectorBounds(key,index)
        const v = event ? r.episode.difference : r.slope
        const color = significance ? (r.p===null ? null : states[r.adjusted ? 2 : r.local ? 1 : 0])
          : v===null ? null : shade(v,limit)
        return <rect key={key} data-sector={key} x={x(b.west)} y={y(b.north)} width={100*index.size} height={100*index.size}
          fill={color ?? 'none'} stroke="#20314c" strokeWidth=".35" onClick={()=>onSelect(key)}>
          <title>{key} · {v===null?'—':fmt(v)}</title></rect>
      })}</g>
      {landPath && <path d={landPath} fill="#344052" fillRule="evenodd" stroke="#9caabe" strokeWidth=".45"/>}
      <rect x={x(box.west)} y={y(box.north)} width={index.size*100} height={index.size*100} fill="none" stroke="#10152c" strokeWidth="2.5" pointerEvents="none"/>
      <rect x={x(box.west)} y={y(box.north)} width={index.size*100} height={index.size*100} fill="none" stroke="white" strokeWidth="1" pointerEvents="none"/>
    </svg>
    <figcaption>{fmt(Math.abs(south))}° S · {es?'Sector seleccionado':'Selected sector'} {selected}</figcaption>
    {significance ? <div className="sector-key">{states.map((c,i)=><span key={c}><i style={{background:c}}/>
      {(es?['Sin significancia','Solo local','Tras ajuste BY']:['Not significant','Local only','After BY'])[i]}</span>)}</div>
      : <><div className="sector-ramp" style={{background:'linear-gradient(to right,'+levels.join(',')+')'}}/>
        <div className="sector-ticks">{[-limit,-limit/2,0,limit/2,limit].map(n=><span key={n}>{fmt(n)}</span>)}</div>
        <small>{field.units}{event?'':es?' por década':' per decade'}</small></>}
    <small>{es?'Fondo oscuro: soporte insuficiente. Contorno gris: tierra.':'Dark background: insufficient support. Grey outline: land.'}</small>
  </figure>
}
