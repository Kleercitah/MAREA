import { useId } from 'react'
import { Link } from 'react-router'
import { useLanguage } from '../../i18n/Language'
import { signalLabels } from './labels'
import type { interpretMonth } from './signals'
import type { Indicator } from './regionalMonth'

export function MonthControls({ month, months, loaded, change }: {
  month: string; months: string[]; loaded: boolean; change: (value: string) => void
}) {
  const { language } = useLanguage()
  const t = signalLabels[language]
  const id = useId()
  const year = month.slice(0, 4)
  const yearMonths = months.filter(value => value.startsWith(year))
  const years = [...new Set(months.map(value => value.slice(0, 4)))]
  const format = new Intl.DateTimeFormat(language, { month: 'short', year: 'numeric', timeZone: 'UTC' })
  return <>
    <label><span id={id + "-year"}>{t.year}</span>
      <select aria-labelledby={id + "-year"} value={loaded ? year : ''} disabled={!loaded} onChange={event => {
        const requested = event.target.value + month.slice(4)
        change(months.includes(requested) ? requested : months.find(value => value.startsWith(event.target.value))!)
      }}>{loaded ? years.map(value => <option key={value}>{value}</option>) : <option value="">{t.loading}</option>}</select>
    </label>
    <label><span id={id + "-month"}>{t.monthOfRecord}</span>
      <select aria-labelledby={id + "-month"} value={loaded ? month : ''} disabled={!loaded} onChange={event => change(event.target.value)}>
        {loaded ? yearMonths.map(value => <option key={value} value={value}>
          {format.format(new Date(value + '-01T00:00:00Z'))}</option>) : <option value="">{t.loading}</option>}
      </select>
    </label>
  </>
}

// Lectura mensual: interpretación dinámica del mes seleccionado (contexto ONI,
// comparación con la referencia y explicación ecológica de la especie). El
// mecanismo de campo y sus límites se desarrollan en «Del océano al ecosistema»
// para no repetir el mismo texto en dos apartados de la ficha.
export function MonthReading({ reading }: { reading: ReturnType<typeof interpretMonth> }) {
  return <div className="monthly-reading" data-month={reading.month}>
    <p className="monthly-phase">{reading.month} · ONI · {reading.phaseText}</p>
    <p className="month-conditions">{reading.conditions}</p>
    <p className="month-ecology">{reading.ecology}</p>
    <p className="month-context">{reading.context}</p>
  </div>
}

export function OceanIndicator({ item, month }: { item: Indicator; month: string }) {
  const { language } = useLanguage()
  const t = signalLabels[language]
  const sst = item.variable === 'sst'
  const title = sst ? (language === 'es' ? 'Temperatura superficial' : 'Sea surface temperature')
    : (language === 'es' ? 'Clorofila-a' : 'Chlorophyll-a')
  const unit = sst ? '°C' : 'mg/m³'
  const format = (value: number | null, signed = false) => value == null ? '—'
    : new Intl.NumberFormat(language, { maximumFractionDigits: sst ? 2 : 3, signDisplay: signed ? 'exceptZero' : 'auto' }).format(value)
  const quality = item.quality === 'valid' || item.quality === 'insufficient' || item.quality === 'month-absent' ? t[item.quality] : t.noData
  return <section className="monthly-indicator" data-variable={item.variable}>
    <h4>{title}</h4>
    <p className="month-value">{format(item.value)} <small>{unit}</small></p>
    <dl>
      <div><dt>{t.reference}</dt><dd>{format(item.reference)} {unit}</dd></div>
      <div><dt>{t.anomaly}</dt><dd>{format(item.anomaly, true)} {unit}</dd></div>
      <div><dt>{t.coverage}</dt><dd>{item.coverage == null ? '—' : item.coverage.toLocaleString(language, { maximumFractionDigits: 1 }) + ' %'}</dd></div>
    </dl>
    <p>{quality}{item.category && ' · ' + t.categories[item.category]}</p>
    <Link to={'/ocean-explorer?variable=' + item.variable + '&month=' + month}>
      {language === 'es' ? 'Explorar' : 'Explore'} {sst ? 'SST' : title} →</Link>
  </section>
}
