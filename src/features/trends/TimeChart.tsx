import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/Language'

export type ChartPoint = { date: string; value: number | null }
export function TimeChart({points, unit, title, anomaly}: {
  points: ChartPoint[]; unit: string; title: string; anomaly: boolean
}) {
  const { language } = useLanguage()
  const es = language === 'es'
  const [index, select] = useState(0)
  const element = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(820)
  const hasPoints = points.length > 0
  useEffect(() => {
    if (!element.current) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(240, Math.min(1000, Math.round(entry.contentRect.width))))
    })
    observer.observe(element.current)
    return () => observer.disconnect()
  }, [hasPoints])
  const left = 48, right = width-12, top = 18, bottom = 204
  const values = points.flatMap(p => p.value === null ? [] : [p.value])
  const floor = values.length ? Math.min(...values) : 0
  const ceiling = values.length ? Math.max(...values) : 1
  const margin = (ceiling - floor || 1) * 0.05
  const low = (anomaly ? Math.min(floor,0) : floor) - margin
  const high = (anomaly ? Math.max(ceiling,0) : ceiling) + margin
  const x = (i: number) => left + i*(right-left)/Math.max(1,points.length-1)
  const y = (v: number) => bottom-(v-low)*(bottom-top)/(high-low || 1)
  let path = '', connected = false
  for (const [i,p] of points.entries()) {
    if (p.value === null) { connected = false; continue }
    path += (connected ? 'L' : 'M') + x(i).toFixed(2) + ',' + y(p.value).toFixed(2)
    connected = true
  }
  const chosen = Math.min(index,points.length-1)
  const point = points[chosen]
  const fmt = (n: number, digits=2) => n.toLocaleString(language,{maximumFractionDigits:digits})
  const month = (date: string) => new Intl.DateTimeFormat(language,{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'))
  if (!point) return <p>{es ? 'Sin registros en este intervalo.' : 'No records in this interval.'}</p>
  return <figure className="time-chart">
    <figcaption><strong>{title}</strong><span>{unit}</span></figcaption>
    <svg ref={element} viewBox={`0 0 ${width} 236`} role="img" aria-label={title+' · '+unit}
      onPointerMove={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX-rect.left)*width/rect.width
        select(Math.max(0, Math.min(points.length-1, Math.round((px-left)/(right-left)*(points.length-1)))))
      }}>
      {[0,1,2,3,4].map(i => {
        const v = low + (high-low)*i/4
        return <g key={i}><line x1={left} x2={right} y1={y(v)} y2={y(v)} stroke="#36476a"/>
          <text x={left-8} y={y(v)+4} textAnchor="end">{fmt(v)}</text></g>
      })}
      {anomaly && <line x1={left} x2={right} y1={y(0)} y2={y(0)} stroke="white" strokeDasharray="4 4"/>}
      <path d={path} fill="none" stroke={anomaly ? '#E8A0FF' : '#83E7FF'} strokeWidth="2"/>
      {points.map((p,i) => p.value === null
        ? <path key={p.date} d={`M${x(i)},${bottom-6}v6`} stroke="#E8A0FF"><title>{month(p.date)}</title></path> : null)}
      <line x1={x(chosen)} x2={x(chosen)} y1={top} y2={bottom} stroke="#b9c9df" strokeDasharray="2 4"/>
      {point.value !== null && <circle cx={x(chosen)} cy={y(point.value)} r="4" fill="white"/>}
      {[0,Math.floor((points.length-1)/2),points.length-1].map((i,k)=>
        <text key={k} x={x(i)} y="228" textAnchor={k===0?'start':k===2?'end':'middle'}>{month(points[i].date)}</text>)}
    </svg>
    <label className="chart-reader"><span>{es?'Consultar mes':'Inspect month'}</span>
      <input type="range" min={0} max={points.length-1} value={chosen} aria-valuetext={month(point.date)}
        onChange={e=>select(Number(e.target.value))}/><output>{month(point.date)} · {point.value === null
          ? es?'Sin datos':'No data' : fmt(point.value,3)+' '+unit}</output></label>
    {values.length < points.length && <small>{es?'Meses sin datos':'Missing months'} · {points.filter(p=>p.value===null).map(p=>month(p.date)).join(', ')}</small>}
  </figure>
}
