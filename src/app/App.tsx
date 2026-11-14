import { Link, Route, Routes } from 'react-router'
import { Layout } from '../components/Layout'
import { PendingSection } from '../components/PendingSection'
import { Home } from '../features/home/Home'
import { useLanguage } from '../i18n/Language'
import { modules } from './sections'

function NotFound() {
  const { t } = useLanguage()
  return <section className="wrap interior"><p className="eyebrow">404</p>
    <h1>{t.missing}</h1><Link className="primary" to="/">{t.back}</Link></section>
}

export function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    {modules.map(({ path, id }) => <Route key={id} path={path} element={<PendingSection id={id} />} />)}
    <Route path="*" element={<NotFound />} />
  </Route></Routes>
}
