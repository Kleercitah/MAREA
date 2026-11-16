import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router'
import { Layout } from '../components/Layout'
import { Home } from '../features/home/Home'
import { useLanguage } from '../i18n/Language'
import { modules } from './sections'

const OceanExplorer = lazy(() => import('../features/ocean/OceanExplorer').then(m => ({ default: m.OceanExplorer })))
const ClimateDetective = lazy(() => import('../features/trends/ClimateDetective'))
const MarineLife = lazy(() => import('../features/species/MarineLife'))
const HabitatSignals = lazy(() => import('../features/signals/HabitatSignals'))
const ElNinoTimeline = lazy(() => import('../features/timeline/ElNinoTimeline'))
const ScientificReport = lazy(() => import('../features/report/ScientificReport'))

const pages = {
  ocean: OceanExplorer, trends: ClimateDetective, species: MarineLife,
  signals: HabitatSignals, timeline: ElNinoTimeline, report: ScientificReport,
}

function NotFound() {
  const { t } = useLanguage()
  return <section className="wrap interior"><p className="eyebrow">404</p>
    <h1>{t.missing}</h1><Link className="primary" to="/">{t.back}</Link></section>
}

export function App() {
  const { language } = useLanguage()
  const loading = <p role="status" className="wrap">{language === 'es' ? 'Cargando…' : 'Loading…'}</p>
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    {modules.map(({ path, id }) => {
      const Page = pages[id]
      return <Route key={id} path={path} element={<Suspense fallback={loading}><Page /></Suspense>}/>
    })}
    <Route path="*" element={<NotFound />} />
  </Route></Routes>
}
