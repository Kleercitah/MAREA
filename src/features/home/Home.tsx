import { Link } from 'react-router'
import { lazy, Suspense, useRef, useState } from 'react'
import { modules } from '../../app/sections'
import { CurrentArt } from '../../components/CurrentArt'
import { Icon } from '../../components/Icon'
import { useLanguage } from '../../i18n/Language'
import { useAnalysis } from '../ocean/data'

const Guide = lazy(() => import('../discovery/Guide'))

export function Home() {
  const { language, t } = useLanguage()
  const [guiding,setGuiding] = useState(false)
  const startGuide = useRef<HTMLButtonElement>(null)
  const bundle = useAnalysis()?.value
  const sstTrend = bundle?.trends.find(trend => trend.variableId === 'sst')
  const chlorophyllTrend = bundle?.trends.find(trend => trend.variableId === 'chlorophyll-a')
  const temperature = sstTrend?.status === 'estimated' ? sstTrend : undefined
  const chlorophyll = chlorophyllTrend?.status === 'estimated' ? chlorophyllTrend : undefined
  const episode = bundle?.comparisons.find(item => item.id === 'elnino-2015-2016-sst')
  const episodeChlorophyll = bundle?.comparisons.find(item => item.id === 'elnino-2015-2016-chlorophyll')
  const difference = episode?.difference
  const number = (value: number, digits: number) => value.toLocaleString(language, { maximumFractionDigits: digits })
  const signed = (value: number, digits: number) => (value > 0 ? '+' : '') + number(value, digits)
  const percent = episodeChlorophyll?.differencePercent == null
    ? null : number(Math.abs(episodeChlorophyll.differencePercent), 1)

  // Indicadores tomados del motor estadístico publicado: ninguna cifra se recalcula aquí.
  const findings = temperature && chlorophyll && difference != null ? [
    { label: t.evidence.period,
      value: temperature.start.slice(0, 4) + '–' + temperature.end.slice(0, 4),
      note: `${temperature.n} ${t.evidence.temperatureMonths} · ${chlorophyll.n} ${t.evidence.chlorophyllMonths}` },
    { label: t.evidence.temperature,
      value: signed(temperature.slopePerDecade, 3) + ' °C ' + t.evidence.decade,
      note: t.evidence.notSignificant },
    { label: t.evidence.episode,
      value: signed(difference, 2) + ' °C',
      note: percent == null ? '' : t.evidence.episodeNote.replace('{percent}', percent) },
  ] : []

  return <>
    <section className="hero">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="eyebrow"><span className="rule" />{t.observatory}</p>
          <h1>{t.hero[0]}<br/><em>{t.hero[1]}</em></h1>
          <p className="intro">{t.intro}</p>
          <div className="actions flex flex-wrap items-center gap-5">
            <Link className="primary" to="/ocean-explorer">{t.explore}<Icon name="arrow" /></Link>
            <Link className="secondary" to="/marine-life">{t.marine}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="art-panel">
          <CurrentArt />
          <p className="place"><Icon name="pin"/>{t.location}</p>
        </div>
      </div>
    </section>
    <section className="wrap home-evidence">
      <h2>{t.evidence.title}</h2>
      <p className="home-lead">{t.evidence.lead}</p>
      <button ref={startGuide} className="secondary" aria-expanded={guiding} onClick={()=>setGuiding(!guiding)}>
        {language==='es'?'Descubre El Niño en Galápagos':'Discover El Niño in Galápagos'} →</button>
      {guiding && <Suspense fallback={<p role="status">{language==='es'?'Cargando…':'Loading…'}</p>}>
        <Guide onClose={()=>{setGuiding(false);startGuide.current?.focus()}}/></Suspense>}
      {findings.length > 0 && <ul className="evidence-grid">
        {findings.map(item => <li key={item.label}>
          <span className="evidence-label">{item.label}</span>
          <strong>{item.value}</strong>
          {item.note && <p>{item.note}</p>}
        </li>)}
      </ul>}
      <p className="home-note">{t.evidence.source}{' '}
        <Link to="/scientific-report">{t.read} →</Link></p>
    </section>
    <section className="directory wrap">
      <h2>{t.directory}</h2>
      <div className="module-grid">
        {modules.map(({ id, path }) => <Link to={path} key={id} className="module">
          <div className="module-icons"><span className="icon-tile"><Icon name={id}/></span><span className="diagonal" aria-hidden="true">↗</span></div>
          <h3>{t.sections[id].name}</h3><p>{t.sections[id].description}</p>
        </Link>)}
      </div>
    </section>
  </>
}
