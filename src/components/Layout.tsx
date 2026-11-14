import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { sections } from '../app/sections'
import { useLanguage } from '../i18n/Language'
import { Icon } from './Icon'

function Brand() {
  return <Link to="/" className="brand"><img src="/brand.svg" alt="" width="38" height="38" />MAREA</Link>
}

export function Layout() {
  const { t, language, setLanguage } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const menu = useRef<HTMLButtonElement>(null)
  const main = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const lastPath = useRef(pathname)
  useEffect(() => {
    const section = sections.find(section => section.path === pathname)
    document.title = (section ? t.sections[section.id].name : t.missing) + ' · MAREA'
    setMenuOpen(false)
    if (lastPath.current !== pathname) {
      main.current?.focus({ preventScroll: true })
      window.scrollTo(0, 0)
      lastPath.current = pathname
    }
  }, [pathname, t])
  return <div className="shell">
    <a className="skip" href="#content">{t.skip}</a>
    <header onKeyDown={event => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        menu.current?.focus()
      }
    }}>
      <div className="wrap masthead">
        <Brand />
        <div className="tools">
          <div className="languages" aria-label="ES / EN" role="group">
            {(['es', 'en'] as const).map(lang => <button key={lang} type="button" lang={lang}
              aria-label={lang === 'es' ? 'Español' : 'English'} aria-pressed={language === lang}
              onClick={() => setLanguage(lang)}>{lang.toUpperCase()}</button>)}
          </div>
          <button className="menu-toggle" ref={menu} type="button" aria-label={t.menu}
            aria-controls="primary-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      <nav id="primary-nav" aria-label={t.nav} className={menuOpen ? 'open' : ''}>
        <div className="wrap nav-inner">
          {sections.map(({ id, path }) => <NavLink key={id} to={path} end
            onClick={() => setMenuOpen(false)}>{t.sections[id].name}</NavLink>)}
        </div>
      </nav>
    </header>
    <main id="content" tabIndex={-1} ref={main}><Outlet /></main>
    <footer><div className="wrap footer-inner">
      <div><Brand /><p>Galápagos Marine Observatory</p></div>
      <Link to="/scientific-report">{t.sources} <span aria-hidden="true">↗</span></Link>
    </div></footer>
  </div>
}
