import { FieldPlate } from './FieldPlate'
import { useLanguage } from '../../i18n/Language'
import { habitatProfiles, type HabitatImage } from '../signals/habitats'
import { StudyLink } from './FieldStory'
import { fieldStories } from './fieldStories'
import { biologicalEvidence } from './evidence'
import type { SpeciesArticle, SpeciesSection } from './species'

/**
 * Recurso visual de cada apartado de profundización de una ficha.
 * Se reutiliza una fotografía verificada cuando el tema coincide exactamente con
 * lo que la imagen muestra; en el resto de los casos se dibuja un esquema
 * original de MAREA, específico del apartado y de la especie, con etiquetas
 * científicas propias. Nunca se usa una imagen genérica ajena al contenido.
 */
function sectionPhoto(article: SpeciesArticle, section: SpeciesSection): HabitatImage | undefined {
  const images = habitatProfiles[article.id].images
  if (section.key === 'habitat') return images[0]
  if (section.key === 'breeding' && article.id === 'Nannopterum harrisi') return images[2]
  return undefined
}

function ChapterDiagram({ article, section }: { article: SpeciesArticle; section: SpeciesSection }) {
  const { language } = useLanguage()
  const es = language === 'es'
  const story = fieldStories[article.id]
  const topic = section.key
  const labels: Partial<Record<SpeciesSection['key'], string>> = {
    observation: es ? 'Medición de la superficie oceánica' : 'Measuring the ocean surface',
    diet: story.food.title[language],
    genetics: es ? 'Doble hélice conceptual de ADN' : 'Conceptual DNA double helix',
    physiology: article.id === 'Amblyrhynchus cristatus' ? (es ? 'Calentamiento sobre la lava' : 'Warming on lava')
      : article.id === 'Zalophus wollebaeki' ? (es ? 'Reservas de oxígeno para bucear' : 'Oxygen stores for diving')
      : (es ? 'Pesaje de aves en campo' : 'Weighing birds in the field'),
    nursing: es ? 'Madre y cría en la colonia' : 'Mother and pup at the colony',
    sensitivity: biologicalEvidence[article.id].period + ' · ' + story.metric[language],
    ecology: story.food.title[language] + ' · ' + story.response.title[language],
    mechanism: story.food.title[language] + ' · ' + story.response.title[language],
  }
  const subject = section.title[language]
  const label = labels[topic] ?? subject
  return <figure data-topic={topic}>
    <FieldPlate species={article.id} topic={topic} es={es} magnitude={story.magnitude[language]}
      label={article.scientificName + ' · ' + subject + ' · ' + label}/>
    <figcaption>{es ? 'Ilustración de MAREA' : 'MAREA illustration'} · {label}</figcaption>
  </figure>
}

export function EditorialSection({ article, section }: { article: SpeciesArticle; section: SpeciesSection }) {
  const { language } = useLanguage()
  const es = language === 'es'
  const photo = sectionPhoto(article, section)
  return <details className="species-section" name="species-chapters" open={section.key === 'habitat'}>
    <summary>{section.title[language]}</summary>
    <div className="editorial-layout">
      {photo ? <figure data-topic={section.key}>
        <img className="editorial-image" src={photo.src} alt={photo.caption[language]} loading="lazy"/>
        <figcaption>{photo.caption[language]} · <a href={photo.source}>{photo.credit}</a> · <a href={photo.licenseUrl}>{photo.license}</a></figcaption>
      </figure> : <ChapterDiagram article={article} section={section}/>}
      <div><p>{section.body[language]}</p>
        {section.citations.length > 0 && <p className="section-citations">
          {section.citations.map(source => <StudyLink key={source} source={source}/>)}
        </p>}
        {section.kind === 'hypothesis' && <p className="field-kind">{es ? 'Hipótesis ecológica' : 'Ecological hypothesis'}</p>}
      </div>
    </div>
  </details>
}
