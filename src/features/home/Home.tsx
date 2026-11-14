import { Link } from 'react-router'
import { modules } from '../../app/sections'
import { CurrentArt } from '../../components/CurrentArt'
import { Icon } from '../../components/Icon'
import { useLanguage } from '../../i18n/Language'

export function Home() {
  const { t } = useLanguage()
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
