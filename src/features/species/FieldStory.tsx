import type { SpeciesId } from '../../data/contracts'
import { useLanguage } from '../../i18n/Language'
import { biologicalEvidence } from './evidence'
import { fieldStories } from './fieldStories'
import { citationLabel, citations } from './references'

export function StudyLink({ source }: { source: string }) {
  return <a href={citations[source].url} target="_blank" rel="noreferrer">{citationLabel(source)} ↗</a>
}

export function FieldStory({ id }: { id: SpeciesId }) {
  const { language } = useLanguage()
  const es = language === 'es'
  const story = fieldStories[id]
  const evidence = biologicalEvidence[id]
  const foodHypothesis = id === 'Nannopterum harrisi' || id === 'Spheniscus mendiculus'
  const steps = [
    { title: es ? 'Aguas superficiales' : 'Surface waters', kind: es ? 'Registro satelital' : 'Satellite record',
      text: story.ocean[language], source: id === 'Zalophus wollebaeki' || id === 'Arctocephalus galapagoensis' ? 'paez-rosas-2021' : undefined },
    { title: story.food.title[language], kind: foodHypothesis ? (es ? 'Mecanismo propuesto' : 'Proposed mechanism') : (es ? 'Estudio de campo' : 'Field study'),
      text: story.food.text[language], source: story.food.source },
    { title: story.response.title[language], kind: es ? 'Estudio de campo' : 'Field study',
      text: story.response.text[language], source: story.response.source },
    { title: es ? 'Papel en el ecosistema' : 'Role in the ecosystem', kind: id === 'Amblyrhynchus cristatus'
      ? (es ? 'Experimento de exclusión' : 'Grazer exclusion experiment') : (es ? 'Interacción documentada' : 'Documented interaction'),
      text: evidence.ecosystem[language], source: evidence.ecosystemSource },
  ]
  return <>
    <section className="episode-history" aria-labelledby="episode-title">
      <h3 id="episode-title">{es ? 'Historia del episodio' : 'The episode in the field'}</h3>
      <ol>{story.history.map(event => <li key={event.title.en}>
        <h4>{event.title[language]}</h4>
        <p>{event.text[language]}</p>
        <StudyLink source={event.source}/>
      </li>)}</ol>
    </section>
    <section className="eco-path" aria-labelledby="mechanism">
      <h3 id="mechanism" tabIndex={-1}>{es ? 'Del océano al ecosistema' : 'From ocean to ecosystem'}</h3>
      <dl className="path-steps">
        {steps.map((step, index) => <div key={index}>
          <dt><span className="field-kind">{step.kind}</span>{step.title}</dt>
          <dd>
            <p>{step.text}</p>
            {step.source && <StudyLink source={step.source}/>}
          </dd>
        </div>)}
        <div className="path-caveat">
          <dt>{es ? 'Por comprobar' : 'Still to be tested'}</dt>
          <dd><p>{evidence.uncertainty[language]} {story.missing[language]}</p></dd>
        </div>
      </dl>
    </section>
  </>
}
