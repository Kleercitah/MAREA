import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useLanguage } from '../../i18n/Language'
import type { SpeciesId } from '../../data/contracts'
import { BiologicalEvidence } from '../species/BiologicalEvidence'
import { citationLabel, citations } from '../species/references'
import { isSpecies, speciesArticles, speciesOrder } from '../species/species'
import { MonthReading, OceanIndicator } from './MonthlyReading'
import { habitatProfiles, type HabitatImage } from './habitats'
import { signalLabels } from './labels'
import { interpretMonth, speciesReadings } from './signals'
import { useRegionalMonth } from './useRegionalMonth'
import { productivityOrder, thermalOrder, type ProductivityScenario, type ThermalScenario } from './scenarios'
import { ecosystemCore, productivityReadings, thermalReadings, type AxisReading } from './scenarioContent'
import { consequenceKinds, consequences } from './consequences'
import './signals.css'

type SignalCopy = (typeof signalLabels)['es']

/**
 * Galería de ambientes de la especie: imagen principal amplia, miniaturas,
 * navegación anterior/siguiente, visor ampliado y soporte de teclado y tacto.
 */
function HabitatGallery({ images, copy, language }: {
  images: HabitatImage[]; copy: SignalCopy['gallery']; language: 'es' | 'en'
}) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const start = useRef<number | null>(null)
  const total = images.length
  const current = images[index]
  const go = (step: number) => setIndex(value => (value + step + total) % total)
  const counter = copy.counter.replace('{current}', String(index + 1)).replace('{total}', String(total))

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1) }
    else if (event.key === 'ArrowRight') { event.preventDefault(); go(1) }
    else if (event.key === 'Escape' && zoom) { event.preventDefault(); setZoom(false) }
  }
  const onTouchStart = (event: TouchEvent) => { start.current = event.touches[0].clientX }
  const onTouchEnd = (event: TouchEvent) => {
    if (start.current === null) return
    const delta = event.changedTouches[0].clientX - start.current
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1)
    start.current = null
  }

  return <div className="habitat-gallery" role="group" aria-roledescription="carousel"
    aria-label={copy.thumbnails} tabIndex={0}
    onKeyDown={onKeyDown} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <figure className="gallery-stage">
      <button type="button" className="gallery-zoom" onClick={() => setZoom(true)} aria-label={copy.open}>
        <img src={current.src} alt={current.caption[language]} />
      </button>
      <figcaption className="gallery-caption">
        <span className="gallery-tag" data-galapagos={current.galapagos}>
          {current.galapagos ? copy.galapagos : copy.notGalapagos}</span>
        <p className="gallery-text">{current.caption[language]}</p>
        <p className="gallery-location"><span>{copy.location}</span> {current.location[language]}</p>
        <p className="gallery-credit">
          <span>{copy.credit}</span> {current.credit} ·{' '}
          <a href={current.licenseUrl} target="_blank" rel="noreferrer">{current.license}</a>{' · '}
          <a href={current.source} target="_blank" rel="noreferrer">{copy.source} ↗</a>
        </p>
      </figcaption>
      <div className="gallery-nav">
        <button type="button" onClick={() => go(-1)} aria-label={copy.previous}>‹</button>
        <span className="gallery-counter">{counter}</span>
        <button type="button" onClick={() => go(1)} aria-label={copy.next}>›</button>
      </div>
    </figure>
    <div className="gallery-thumbs" role="list" aria-label={copy.thumbnails}>
      {images.map((item, position) => <button key={item.src} type="button" role="listitem"
        aria-current={position === index} aria-label={item.caption[language]} data-source={item.src}
        onClick={() => setIndex(position)}>
        <img src={item.src} alt="" loading="lazy" />
      </button>)}
    </div>
    {zoom && <div className="gallery-viewer" role="dialog" aria-modal="true" aria-label={copy.caption}
      onClick={() => setZoom(false)}>
      <button type="button" className="gallery-close" onClick={() => setZoom(false)} aria-label={copy.close}>×</button>
      <img src={current.src} alt={current.caption[language]} onClick={event => event.stopPropagation()} />
      <p>{current.credit} · {current.license} · {current.location[language]}</p>
    </div>}
  </div>
}

/** Estudios que respaldan una afirmación, en etiqueta corta y enlace consultable. */
function CitationChips({ ids, label }: { ids: string[]; label: string }) {
  const unique = [...new Set(ids)]
  if (!unique.length) return null
  return <p className="citation-chips">
    <span className="citation-chips-label">{label}</span>
    {unique.map(id => {
      const citation = citations[id]
      if (!citation) return null
      return citation.url
        ? <a key={id} href={citation.url} target="_blank" rel="noreferrer">{citationLabel(id)} ↗</a>
        : <span key={id}>{citationLabel(id)}</span>
    })}
  </p>
}

/** Lectura profunda de un eje del escenario: qué cambia, qué alimento, qué mecanismo y qué se documentó. */
function AxisReadingCard({ heading, option, reading }: {
  heading: string; option: string; reading: AxisReading
}) {
  const { language } = useLanguage()
  const t = signalLabels[language]
  return <article className="reading-card">
    <header>
      <h3>{heading}</h3>
      <span className="reading-option">{option}</span>
    </header>
    <dl className="reading-fields">
      <div><dt>{t.readingFields.physical}</dt><dd>{reading.physical[language]}</dd></div>
      <div><dt>{t.readingFields.food}</dt><dd>{reading.food[language]}</dd></div>
      <div><dt>{t.readingFields.mechanism}</dt><dd>{reading.mechanism[language]}</dd></div>
      <div><dt>{t.readingFields.historic}</dt><dd>{reading.historic[language]}</dd></div>
    </dl>
    <CitationChips ids={reading.citations} label={t.studies}/>
  </article>
}

export default function HabitatSignals() {
  const { language, t: site } = useLanguage()
  const t = signalLabels[language]
  const [params, setParams] = useSearchParams()
  const requestedSpecies = params.get('species')
  const species = isSpecies(requestedSpecies) ? requestedSpecies : speciesOrder[0]

  const [thermal, setThermal] = useState<ThermalScenario>('warming')
  const [productivity, setProductivity] = useState<ProductivityScenario>('lower')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [methodsOpen, setMethodsOpen] = useState(false)

  // El parámetro temporal de un enlace antiguo se ignora: la experiencia es
  // general y no se crea ninguna selección mensual ficticia al cambiar de especie.
  const { record, loaded, failed } = useRegionalMonth(null)
  const interpretation = interpretMonth(species, record, language)

  const article = speciesArticles[species]
  const profile = habitatProfiles[species]
  const core = ecosystemCore[species]
  const readings = [thermalReadings[species][thermal], productivityReadings[species][productivity]]

  const choose = (id: SpeciesId) => setParams({ species: id }, { replace: true })

  const references = [...new Set([
    ...readings.flatMap(reading => reading.citations),
    ...core.citations,
    ...consequenceKinds.flatMap(kind => consequences[species][kind].flatMap(item => item.citations)),
  ])].map(id => citations[id]).filter(Boolean)

  const explorerVariable = speciesReadings[species].focus === 'chlorophyll' ? 'chlorophyll-a' : 'sst'

  return <section className="wrap signals">
    <p className="eyebrow"><span className="rule"/>{t.eyebrow}</p>
    <h1>{site.sections.signals.name}</h1>
    {requestedSpecies && !isSpecies(requestedSpecies) && <p role="status">{language==='es'
      ? 'Esta ficha ya no está en el catálogo. Se muestra el pingüino de Galápagos; puedes elegir otra especie.'
      : 'This profile is unavailable in the current catalogue. The Galápagos penguin is shown; you can select another species.'}</p>}
    <p className="signals-lead">{t.explorerLead}</p>

    {/* A. Especie. El explorador no tiene selectores de año ni de mes. */}
    <div className="signals-controls">
      <label><span id="signal-species">{t.species}</span>
        <select aria-labelledby="signal-species" value={species} onChange={e => choose(e.target.value as SpeciesId)}>
          {speciesOrder.map(id => <option key={id} value={id}>{speciesArticles[id].commonName[language]}</option>)}
        </select></label>
    </div>

    {/* B. Hábitat protagonista: identidad, descripción del ambiente y galería real. */}
    <div className="signal-species" data-species={species}>
      <p className="eyebrow"><span className="rule"/>{t.context}</p>
      <h2 id="species-name">{article.commonName[language]}</h2>
      <p className="species-scientific">{article.scientificName}</p>
      <Link className="species-sheet" to={'/marine-life?species=' + encodeURIComponent(species)}>
        {t.sheetLink} <span>→</span></Link>
    </div>

    <section className="signal-habitat" data-species={species} aria-labelledby="habitat-title">
      <h2 id="habitat-title">{t.habitatTitle}</h2>
      <p className="habitat-lead">{profile.habitat[language]}</p>
      <HabitatGallery images={profile.images} copy={t.gallery} language={language}/>
    </section>

    <details className="science-context signal-about" open={aboutOpen}
      onToggle={event => setAboutOpen(event.currentTarget.open)}>
      <summary>{t.moreAbout}</summary>
      <dl className="species-context">
        <div><dt>{t.feedingTitle}</dt><dd>{profile.feeding[language]}</dd></div>
        <div><dt>{t.sstRelationTitle}</dt><dd>{profile.sstRelation[language]}</dd></div>
        <div><dt>{t.chlorophyllRelationTitle}</dt><dd>{profile.chlorophyllRelation[language]}</dd></div>
        <div><dt>{t.sensitivityTitle}</dt><dd>{profile.sensitivity[language]}</dd></div>
        {profile.physiology && <div><dt>{t.physiologyTitle}</dt><dd>{profile.physiology[language]}</dd></div>}
      </dl>
    </details>

    {/* C. Cómo cambia el ambiente: escenarios generales, sin fecha ni valor concreto. */}
    <section className="signals-scenarios" aria-labelledby="scenarios-title">
      <h2 id="scenarios-title">{t.scenariosTitle}</h2>
      <p className="scenarios-lead">{t.scenariosLead}</p>
      <div className="scenario-controls">
        <div className="scenario-group" role="group" aria-label={t.scenarioThermal}>
          <p className="scenario-group-title">{t.scenarioThermal}</p>
          <div className="scenario-options">
            {thermalOrder.map(value => <button key={value} type="button" aria-pressed={thermal === value}
              onClick={() => setThermal(value)}>{t.scenarioOptions[value]}</button>)}
          </div>
        </div>
        <div className="scenario-group" role="group" aria-label={t.scenarioProductivity}>
          <p className="scenario-group-title">{t.scenarioProductivity}</p>
          <div className="scenario-options">
            {productivityOrder.map(value => <button key={value} type="button" aria-pressed={productivity === value}
              onClick={() => setProductivity(value)}>{t.scenarioOptions[value]}</button>)}
          </div>
        </div>
      </div>
      <p className="scenario-selection">{t.scenarioSelection} · <strong>{t.scenarioOptions[thermal]}</strong>
        {' · '}<strong>{t.scenarioOptions[productivity]}</strong></p>
      <p className="scenario-note">{t.scenarioNote}</p>
    </section>

    {/* D. Interpretación ecológica profunda por eje. */}
    <section className="signal-reading" aria-labelledby="reading-title">
      <h2 id="reading-title">{t.interpretation} {t.subject[species]}?</h2>
      <div className="reading-cards">
        <AxisReadingCard heading={t.scenarioThermal} option={t.scenarioOptions[thermal]}
          reading={thermalReadings[species][thermal]}/>
        <AxisReadingCard heading={t.scenarioProductivity} option={t.scenarioOptions[productivity]}
          reading={productivityReadings[species][productivity]}/>
      </div>
    </section>

    {/* E. Consecuencias ecológicas: el ecosistema, los otros organismos y lo no demostrado. */}
    <section className="signal-core" aria-labelledby="core-title">
      <h2 id="core-title">{t.coreTitle}</h2>
      <dl className="core-grid">
        <div><dt>{t.coreFields.community}</dt><dd>{core.community[language]}</dd></div>
        <div><dt>{t.coreFields.habitatEffect}</dt><dd>{core.habitatEffect[language]}</dd></div>
        <div><dt>{t.coreFields.unknown}</dt><dd>{core.unknown[language]}</dd></div>
      </dl>
      <CitationChips ids={core.citations} label={t.studies}/>
    </section>

    <section className="signal-consequences" aria-labelledby="consequences-title">
      <h2 id="consequences-title">{t.consequencesTitle}</h2>
      <p className="consequences-lead">{t.consequencesLead}</p>
      <div className="consequence-grid">
        {consequenceKinds.map(kind => <section key={kind} className="consequence-column" data-kind={kind}>
          <h3>{t.consequenceKinds[kind]}</h3>
          <ul>
            {consequences[species][kind].map(item => <li key={item.text.es}>
              <p>{item.text[language]}</p>
              <CitationChips ids={item.citations} label={t.studies}/>
            </li>)}
          </ul>
        </section>)}
      </div>
    </section>

    <BiologicalEvidence id={species}/>

    {/* F. Observación auténtica del archivo MAREA, separada de los escenarios generales. */}
    <section className="signal-example" aria-labelledby="example-title">
      <h2 id="example-title">{t.exampleTitle}</h2>
      <p className="example-lead">{t.exampleLead}</p>
      <details className="signals-hint">
        <summary>{t.regionalHelpSummary}</summary>
        <p>{t.regionalHelp}</p>
      </details>
      {failed ? <p role="alert">{t.error}</p>
        : !loaded ? <p role="status">{t.loading}</p>
        : <>
          <p className="example-month">{t.exampleMonth} · <strong>{record.month}</strong></p>
          <div className="monthly-indicators">{interpretation.observations.map(item =>
            <OceanIndicator key={item.variable} item={item} month={record.month}/>)}</div>
          <MonthReading reading={interpretation}/>
          <p className="example-note">{t.regionalNote}</p>
        </>}
    </section>

    <details className="science-context signal-methods" open={methodsOpen}
      onToggle={event => setMethodsOpen(event.currentTarget.open)}>
      <summary>{t.methods}</summary>
      <p>{t.methodsTopics.criteria}</p>
      <p>{t.methodsTopics.reference}</p>
      <p>{t.methodsTopics.reuse}</p>
      <p>{t.methodsTopics.scope}</p>
    </details>

    <section className="signal-references" id="signal-references">
      <h3>{t.references}</h3>
      <ol>
        {references.map(citation => <li key={citation.text}>
          {citation.url
            ? <a href={citation.url} target="_blank" rel="noreferrer">{citation.text}</a>
            : citation.text}
        </li>)}
      </ol>
    </section>

    <p className="signal-links">
      <Link className="primary" to={'/ocean-explorer?variable=' + explorerVariable + '&month=' + record.month}>
        {t.explorerLink}</Link>
      <Link className="secondary" to="/climate-detective">{t.trendsLink} <span>→</span></Link>
    </p>
  </section>
}
