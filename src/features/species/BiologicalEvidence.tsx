import type { SpeciesId } from '../../data/contracts'
import { useLanguage } from '../../i18n/Language'
import { biologicalEvidence } from './evidence'
import { citations, citationLabel } from './references'

export function BiologicalEvidence({id}: {id:SpeciesId}) {
  const {language} = useLanguage()
  const es = language==='es'
  const evidence = biologicalEvidence[id]
  return <section className="biological-evidence">
    <h3>{es?'Evidencia de afectación durante El Niño':'Evidence of effects during El Niño'}</h3>
    <p><strong>{evidence.period}</strong> · {evidence.observed[language]}{' '}
      <a href={citations[evidence.source].url}>{citationLabel(evidence.source)} ↗</a></p>
    <small>{es?'Estudio biológico de campo. Las observaciones satelitales de MAREA abarcan 2003–2024.':
      'Biological field study. MAREA’s satellite observations cover 2003–2024.'}</small>
    <details><summary>{es?'Papel en el ecosistema':'Role in the ecosystem'}</summary>
      <p>{evidence.ecosystem[language]}{' '}<a href={citations[evidence.ecosystemSource].url}>{citationLabel(evidence.ecosystemSource)} ↗</a></p>
      <p>{evidence.uncertainty[language]}</p>
    </details>
  </section>
}
