import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { useLanguage } from '../../i18n/Language'
import type { SpeciesId } from '../../data/contracts'
import { EditorialSection } from './EditorialSection'
import { FieldStory, StudyLink } from './FieldStory'
import { biologicalEvidence } from './evidence'
import { fieldStories } from './fieldStories'
import { marineLabels } from './labels'
import { speciesModels } from './models'
import { citationList } from './references'
import { isSpecies, speciesArticles, speciesOrder } from './species'
import { MonthControls, MonthReading, OceanIndicator } from '../signals/MonthlyReading'
import { interpretMonth } from '../signals/signals'
import { speciesMonthUrl, useRegionalMonth } from '../signals/useRegionalMonth'
import { signalLabels } from '../signals/labels'
import './species.css'

type PortraitView = 'photo' | 'illustration' | 'model'

const portraitViews: PortraitView[] = ['photo', 'illustration', 'model']

// El motor 3D solo se descarga cuando se monta este componente, es decir, al
// elegir la vista «Modelo» de una ficha concreta. Como mucho hay un visor activo.
const ModelViewer = lazy(() => import('./ModelViewer').then(module => ({ default: module.ModelViewer })))


export default function MarineLife() {
  const { language, t: site } = useLanguage()
  const t = marineLabels[language]
  const [params, setParams] = useSearchParams()
  const requestedSpecies = params.get('species')
  const selected = isSpecies(requestedSpecies) ? requestedSpecies : speciesOrder[0]

  const [view, setView] = useState<PortraitView>('photo')
  const { record, months, loaded, failed } = useRegionalMonth(params.get('month'))
  const interpretation = interpretMonth(selected, record, language)
  const regionLink = speciesMonthUrl('/habitat-signals', selected, record.month)
  const article = speciesArticles[selected]
  const evidence = biologicalEvidence[selected]
  const story = fieldStories[selected]
  const model = speciesModels[selected]
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === '#mechanism') {
      const heading = document.getElementById('mechanism')
      heading?.focus({ preventScroll: true })
      heading?.scrollIntoView({ block: 'start' })
    }
  }, [hash, selected])
  const references = useMemo(() => citationList(article.citations), [article])
  const indexRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const list = indexRef.current
    const button = list?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
    if (list && button && list.scrollWidth > list.clientWidth) {
      list.scrollLeft += button.getBoundingClientRect().left - list.getBoundingClientRect().left
    }
  }, [selected])
  const choose = (id: SpeciesId) => {
    setView('photo')
    setParams({ species: id, month: record.month }, { replace: true })
  }
  return <section className="wrap species">
    <h1>{site.sections.species.name}</h1>
    {requestedSpecies && !isSpecies(requestedSpecies) && <p role="status">{language==='es'
      ? 'Esta ficha ya no está en el catálogo. Se muestra el pingüino de Galápagos; puedes elegir otra especie.'
      : 'This profile is unavailable in the current catalogue. The Galápagos penguin is shown; you can select another species.'}</p>}

    <h2 className="species-index-title">{t.index}</h2>
    <ul className="species-index" ref={indexRef} aria-label={t.index}>
      {speciesOrder.map(id => {
        const item = speciesArticles[id]
        return <li key={id}>
          <button type="button" aria-pressed={id === selected} aria-controls="species-sheet"
            onClick={() => choose(id)} onKeyDown={event => {
              const index = speciesOrder.indexOf(id)
              const target = { ArrowRight: (index + 1) % speciesOrder.length,
                ArrowLeft: (index + speciesOrder.length - 1) % speciesOrder.length, Home: 0, End: speciesOrder.length - 1 }[event.key]
              if (target === undefined) return
              event.preventDefault()
              indexRef.current?.querySelectorAll('button')[target].focus()
              choose(speciesOrder[target])
            }}>
            <img src={item.illustrationPath} alt="" width={320} height={240} loading="lazy"/>
            <span className="index-name">{item.commonName[language]}</span>
            <span className="index-scientific">{item.scientificName}</span>
          </button>
        </li>
      })}
    </ul>

    <article className="species-article" key={selected} id="species-sheet" tabIndex={-1} aria-labelledby="species-title">
      <div className="portrait">
        <figure className="portrait-figure">
          <div className="portrait-frame" data-view={view}>
            {view === 'model'
              ? (model.available
                  ? <Suspense fallback={<div className="model-viewer">
                      <p className="model-viewer-state" role="status">{t.model.loading}</p>
                    </div>}>
                      <ModelViewer src={model.path} label={article.commonName[language] + ' · ' + t.model.title}/>
                    </Suspense>
                  : <div className="portrait-model">
                      <p className="portrait-model-name">{article.commonName[language]}</p>
                      <p className="portrait-model-state">{t.model.pending}</p>
                    </div>)
              : <img key={view} src={view === 'photo' ? article.photoPath : article.illustrationPath}
                  alt={view === 'photo'
                    ? article.commonName[language] + ' · ' + article.scientificName
                    : article.commonName[language] + ' · ' + t.illustration}
                  width={1200} height={900}/>}
          </div>
          <figcaption>
            <div className="portrait-switch" role="group" aria-label={t.view}>
              {portraitViews.map(option => <button key={option} type="button"
                aria-pressed={view === option} onClick={() => setView(option)}>
                {option === 'photo' ? t.photo : option === 'illustration' ? t.illustration : t.model.title}</button>)}
            </div>
            <div className="portrait-meta">
              {view === 'photo' ? <>
                <p>{t.credit} · <strong>{article.photoCredit}</strong></p>
                <p>{t.place} · {article.photoLocation[language]}</p>
                <p>{t.license} · <a href={article.photoLicenseUrl} target="_blank" rel="noreferrer">{article.photoLicense} ↗</a></p>
                <p><a href={article.photoSource} target="_blank" rel="noreferrer">{t.origin} ↗</a></p>
                <p className="portrait-note">{t.photoNote}</p>
              </> : view === 'illustration'
                ? <p className="portrait-note">{t.illustrationNote}</p>
                : <p className="portrait-note">{t.model.note}</p>}
            </div>
          </figcaption>
        </figure>
      </div>

      <div className="species-copy">
        <h2 id="species-title">{article.commonName[language]}</h2>
        <p className="scientific-name">{article.scientificName}</p>
        <p className="species-lead-text">{article.lead[language]}</p>
        <details className="taxonomy-detail">
          <summary>{t.classification}</summary>
          <ul className="taxonomy">
            {article.taxonomy.map(item => <li key={item.rank}>{t.ranks[item.rank]} · {item.value}</li>)}
          </ul>
          <p className="taxonomy-source"><a href={article.taxonomySource} target="_blank" rel="noreferrer">{t.taxonomySource} ↗</a></p>
        </details>
        <section className="biological-evidence field-result">
          <h3>{language === 'es' ? 'Evidencia de campo' : 'Field evidence'} · {evidence.period}</h3>
          <p className="field-magnitude">{story.magnitude[language]}</p>
          <p className="field-metric">{story.metric[language]}</p>
          <p className="field-area">{story.area[language]}</p>
          <details><summary>{language === 'es' ? 'Cómo se obtuvo la cifra' : 'How this was measured'}</summary>
            <p>{evidence.observed[language]}</p>
          </details>
          <StudyLink source={evidence.source}/>
        </section>
      </div>
      <div className="field-body">
        <FieldStory id={selected}/>
        <h3 className="further-title">{language === 'es' ? 'Profundizar en la especie' : 'Explore the species in depth'}</h3>
        <div className="species-sections">
          {article.sections.map(section => <EditorialSection key={section.key} section={section} article={article}/>)}
        </div>

        <section className="species-month" aria-labelledby="species-ocean-title">
          <h3 id="species-ocean-title">{language === 'es' ? 'Explorar condiciones oceánicas' : 'Explore ocean conditions'}</h3>
          <p className="monthly-scope">{language === 'es' ? 'Galápagos · Promedio regional y referencia mensual 2003–2024' : 'Galápagos · Regional mean and 2003–2024 monthly reference'}</p>
          <div className="month-controls"><MonthControls month={record.month} months={months} loaded={loaded}
            change={month => setParams({ species: selected, month }, { replace: true })}/></div>
          {failed ? <p role="alert">{signalLabels[language].error}</p> : !loaded ? <p role="status">{signalLabels[language].loading}</p> : <>
            <div className="monthly-indicators">{interpretation.observations.map(item =>
              <OceanIndicator key={item.variable} item={item} month={record.month}/>)}</div>
            <MonthReading reading={interpretation}/>
            <Link to={regionLink}>{t.signalsLink} →</Link>
          </>}
        </section>

        <details className="species-references">
          <summary>{t.references}</summary>
          <ol>
            {references.map(citation => <li key={citation.text}>
              {citation.url
                ? <a href={citation.url} target="_blank" rel="noreferrer">{citation.text}</a>
                : citation.text}
            </li>)}
          </ol>
        </details>
      </div>
    </article>
  </section>
}
