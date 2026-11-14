import { Link } from 'react-router'
import type { SectionId } from '../app/sections'
import { useLanguage } from '../i18n/Language'
import { Icon } from './Icon'

export function PendingSection({ id }: { id: Exclude<SectionId, 'home'> }) {
  const { t } = useLanguage()
  const section = t.sections[id]
  return <section className="wrap interior">
    <span className="icon-tile"><Icon name={id}/></span>
    <p className="eyebrow"><span className="rule" />{t.pending}</p>
    <h1>{section.name}</h1><p className="intro">{section.description}</p>
    <Link className="secondary" to="/"><span aria-hidden="true">←</span>{t.back}</Link>
  </section>
}
