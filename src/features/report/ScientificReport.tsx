import { getSectorIndex } from '../discovery/data'
import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import { ScienceContext } from '../../components/ScienceContext'
import type { DatasetMeta, Region } from '../../data/contracts'
import { useLanguage } from '../../i18n/Language'
import { json, useAnalysis, useRegionalSeries, useResource, type OceanVariable, type Series } from '../ocean/data'
import { TimeChart } from '../trends/TimeChart'
import { citationList, citations } from '../species/references'
import { biologicalEvidence } from '../species/evidence'
import { speciesArticles, speciesOrder } from '../species/species'
import { reportLabels } from './labels'
import { publicUrl } from '../../public-url'
import '../trends/climate.css'
import './report.css'

/** Lectura mínima del índice ONI: solo el intervalo declarado por el CPC y su cita. */
interface OniDocument {
  source: string
  citation: string
  episodes: { id: string; start: string; end: string }[]
}
const getOni = (signal: AbortSignal) => json<OniDocument>('/data/enso-oni.json', signal)

const methodNames: Record<string, { es: string; en: string }> = {
  climatology: { es: 'Climatología mensual', en: 'Monthly climatology' },
  anomaly: { es: 'Anomalías', en: 'Anomalies' },
  trend: { es: 'Tendencia', en: 'Trend' },
  comparison: { es: 'Comparación de periodos', en: 'Period comparison' },
}

const methodologyUrl = new URL('../../../docs/DATA_SOURCES.md', import.meta.url).href

const products: [string, string][] = [
  ['sst-monthly.json', 'sst-monthly.json'],
  ['chlorophyll-monthly.json', 'chlorophyll-monthly.json'],
  ['marea-analysis.json', 'marea-analysis.json'],
  ['enso-oni.json', 'enso-oni.json'],
]

export default function ScientificReport() {
  const { language, t: site } = useLanguage()
  const es = language === 'es'
  const r = reportLabels[language]
  const analysis = useAnalysis()
  const sstSeries = useRegionalSeries('sst')
  const chlorophyllSeries = useRegionalSeries('chlorophyll-a')
  const sectors = useResource(getSectorIndex)
  const oni = useResource(getOni)

  useEffect(() => {
    document.body.classList.add('report-open')
    return () => document.body.classList.remove('report-open')
  }, [])

  const shell = (body: ReactNode) => <article className="wrap report" id="report-top">
    <p className="eyebrow"><span className="rule" />{r.eyebrow}</p>
    <h1>{site.sections.report.name}</h1>
    {body}
  </article>

  if (analysis?.failed || sstSeries?.failed || chlorophyllSeries?.failed || sectors?.failed || oni?.failed)
    return shell(<p role="alert">{r.error}</p>)
  const bundle = analysis?.value
  const sst = sstSeries?.value
  const chlorophyll = chlorophyllSeries?.value
  const sectorIndex = sectors?.value
  if (!bundle || !sst || !chlorophyll || !sectorIndex || !oni?.value)
    return shell(<p role="status">{r.loading}</p>)

  const datasets: Record<OceanVariable, DatasetMeta> = {
    sst: sst.dataset,
    'chlorophyll-a': chlorophyll.dataset,
  }
  const series: Record<OceanVariable, Series> = { sst, 'chlorophyll-a': chlorophyll }
  const variables: OceanVariable[] = ['sst', 'chlorophyll-a']
  const names: Record<OceanVariable, string> = { sst: r.charts.sst, 'chlorophyll-a': r.charts.chlorophyll }
  const units: Record<OceanVariable, string> = { sst: '°C', 'chlorophyll-a': 'mg/m³' }
  const fmt = (value: number | null | undefined, digits = 4) =>
    value == null ? '—' : value.toLocaleString(language, { maximumFractionDigits: digits })
  const range = (period: { start: string; end: string }) => period.start.slice(0, 7) + ' – ' + period.end.slice(0, 7)
  const region: Region = sst.region
  const trendOf = (variable: OceanVariable) => bundle.trends.find(item => item.datasetId === datasets[variable].id)
  const comparisons = bundle.comparisons.filter(item => item.id.startsWith('elnino-2015-2016-'))
  const declared = oni.value.episodes.find(item => item.id === 'el-nino-2014-2016')
  const referenceIds = [...new Set(speciesOrder.flatMap(id => speciesArticles[id].citations))]

  const contents: [string, string][] = [
    ['report-study', r.study.title],
    ['report-questions', r.questions.title],
    ['report-methods', r.methods.title],
    ['report-results', r.results.title],
    ['report-charts', r.charts.title],
    ['report-episode', r.episode.title],
    ['report-interpretation', r.interpretation.title],
    ['report-limits', r.limits.title],
    ['report-conclusions', r.conclusions.title],
    ['report-references', r.references.title],
    ['report-downloads', r.downloads.title],
  ]

  return shell(<>
    <p className="report-lead">{r.lead}</p>
    <div className="report-actions">
      <button className="report-print" type="button" onClick={() => window.print()}>{r.print}</button>
      <small>{r.printNote}</small>
    </div>

    <nav className="report-toc" aria-labelledby="report-toc-title">
      <h2 id="report-toc-title">{r.toc}</h2>
      <ol>{contents.map(([id, label]) => <li key={id}><a href={'#' + id}>{label}</a></li>)}</ol>
    </nav>

    <section className="report-section" id="report-study">
      <h2>{r.study.title}</h2>
      {r.study.paragraphs.map(paragraph => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
    </section>

    <section className="report-section" id="report-questions">
      <h2>{r.questions.title}</h2>
      <ol className="report-questions">{r.questions.items.map(item => <li key={item}>{item}</li>)}</ol>
      <p className="report-note">{r.questions.note}</p>
    </section>

    <section className="report-section" id="report-methods">
      <h2>{r.methods.title}</h2>
      <p>{r.methods.lead}</p>
      <p className="report-note">{es ? region.nameES : region.nameEN} · {range(datasets.sst.period)} · {bundle.engine.baselineNote[language]}</p>
      <details className="report-details">
        <summary>{r.methods.details}</summary>
        <ol className="report-steps">{r.methods.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <dl className="report-methods-list">
          {Object.entries(bundle.engine.methods).map(([key, value]) => <div key={key}>
            <dt>{(methodNames[key] ?? { es: key, en: key })[language]}</dt><dd>{value[language]}</dd></div>)}
        </dl>
        <dl className="report-datasets">
          {variables.map(variable => <div key={variable}>
            <dt>{names[variable]}</dt>
            <dd>{datasets[variable].provider} · {datasets[variable].mission} · {datasets[variable].product} · {datasets[variable].version}
              {' · '}{datasets[variable].spatialResolution} · {datasets[variable].temporalResolution} · {datasets[variable].units}{' · '}
              <a href={datasets[variable].sourceUrl} target="_blank" rel="noreferrer">{es ? 'Producto' : 'Product'} ↗</a>
            </dd></div>)}
        </dl>
        <p className="report-note">{r.methods.docNote} <a href={methodologyUrl} target="_blank" rel="noreferrer">{r.methods.doc} ↗</a></p>
      </details>
    </section>

    <section className="report-section" id="report-results">
      <h2>{r.results.title}</h2>
      <p>{r.results.lead}</p>
      <div className="report-grid">
        {variables.map(variable => {
          const trend = trendOf(variable)
          const unit = units[variable]
          return <section className="report-trend" key={variable} data-variable={variable}
            data-significant={trend?.status === 'estimated' ? String(trend.significant === true) : 'unknown'}>
            <h3>{names[variable]}</h3>
            {trend?.status === 'estimated' ? <>
              <dl>
                <div><dt>{r.results.slope}</dt><dd>{fmt(trend.slopePerDecade)} {unit}/{es ? 'década' : 'decade'}</dd></div>
                <div><dt>{r.results.ci} {fmt(bundle.engine.confidence * 100, 0)} %</dt>
                  <dd>{trend.confidenceInterval ? trend.confidenceInterval.map(value => fmt(value)).join(' … ') : '—'} {unit}/{es ? 'año' : 'year'}</dd></div>
                <div><dt>{r.results.p}</dt><dd>{fmt(trend.pValue)}</dd></div>
                <div><dt>{r.results.n}</dt><dd>{trend.n}</dd></div>
                <div><dt>{r.results.period}</dt><dd>{range(trend)}</dd></div>
              </dl>
              <p className="report-verdict">{trend.significant ? r.results.significant : r.results.notSignificant}</p>
              <p className="report-note">{r.results.test}: {es ? trend.testName : 'Seasonal Mann–Kendall with Hamed–Rao variance correction and seasonal Sen slope'}</p>
            </> : <p role="status">{es ? 'Datos insuficientes' : 'Insufficient data'}</p>}
          </section>
        })}
      </div>
      <p className="report-note">{r.results.note}</p>
      <p className="report-caution">{r.results.caution}</p>
    </section>

    <section className="report-section" id="report-charts">
      <h2>{r.charts.title}</h2>
      <p className="report-note">{r.charts.legend} {r.charts.legendMissing}</p>
      {variables.map(variable => {
        const data = series[variable]
        const anomaly = bundle.anomalies.find(item => item.datasetId === datasets[variable].id)
        const observed = data.observations.map(observation => ({ date: observation.date, value: observation.value }))
        const anomalies = anomaly?.observations.map(observation => ({
          date: observation.date,
          value: variable === 'sst' ? observation.absolute : observation.percent,
        })) ?? []
        return <div className="report-variable" key={variable} data-variable={variable}>
          <h3>{names[variable]}</h3>
          <p className="report-meta">
            <span>{r.charts.unit}</span> {units[variable]} · <span>{r.charts.period}</span> {range(data.dataset.period)} ·{' '}
            <span>{r.charts.source}</span> <a href={data.dataset.sourceUrl} target="_blank" rel="noreferrer">{data.dataset.product} ↗</a>
          </p>
          <TimeChart key={variable + '-observed'} points={observed} unit={units[variable]}
            title={names[variable] + ' · ' + r.charts.observed} anomaly={false}/>
          {anomalies.length > 0 && <TimeChart key={variable + '-anomaly'} points={anomalies}
            unit={variable === 'chlorophyll-a' ? '%' : units[variable]}
            title={names[variable] + ' · ' + (variable === 'chlorophyll-a' ? r.charts.percent : r.charts.anomaly)} anomaly/>}
        </div>
      })}
    </section>

    <section className="report-section" id="report-episode">
      <h2>{r.episode.title}</h2>
      <p>{r.episode.lead}</p>
      {comparisons[0] && <ul className="report-intervals">
        <li><span>{r.episode.compared}</span> {range(comparisons[0].period)}</li>
        <li><span>{r.episode.reference}</span> {range(comparisons[0].reference)}</li>
        {declared && <li><span>{r.episode.declared}</span> {declared.start} – {declared.end}</li>}
      </ul>}
      <p className="report-note">{es ? 'La comparación usa los mismos meses del calendario para formar la referencia. Su último mes, junio de 2016, queda fuera del episodio declarado por el ONI.'
        : 'The reference uses matching calendar months. The comparison ends in June 2016, one month after the ONI episode ended.'}</p>
      <div className="report-table-scroll">
        <table className="report-table">
          <thead><tr>
            <th scope="col">{r.episode.variable}</th>
            <th scope="col">{r.episode.mean}</th>
            <th scope="col">{r.episode.reference}</th>
            <th scope="col">{r.episode.difference}</th>
            <th scope="col">Δ %</th>
            <th scope="col">{r.episode.coverage}</th>
          </tr></thead>
          <tbody>{comparisons.map(item => <tr key={item.id}>
            <th scope="row">{names[item.variableId as OceanVariable]} ({units[item.variableId as OceanVariable]})</th>
            <td>{fmt(item.mean, 3)}</td>
            <td>{fmt(item.referenceMean, 3)}</td>
            <td>{fmt(item.difference, 3)}</td>
            <td>{item.differencePercent == null ? '—' : fmt(item.differencePercent, 1)}</td>
            <td>{item.validMonths}/{item.months} ({fmt(100 * item.coverage, 0)} %)</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="report-note">{r.episode.oni}{' '}
        <a href={oni?.value?.source ?? comparisons[0]?.citation} target="_blank" rel="noreferrer">NOAA CPC · ONI ↗</a></p>
      <p className="report-caution">{r.episode.caveat}</p>
    </section>

    <section className="report-section" id="report-interpretation">
      <h2>{r.interpretation.title}</h2>
      <p>{r.interpretation.lead}</p>
      {r.interpretation.biochemistry.map(paragraph => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
      <p className="report-note">{r.interpretation.distinction}</p>
      <ScienceContext variable="chlorophyll-a"/>
      <ScienceContext variable="sst" includeEnso={false}/>
      <h3>{r.interpretation.species}</h3>
      <p>{es
        ? 'En las mismas costas occidentales, el recuento de cormoranes ya superaba en 1984 el nivel anterior a El Niño. El de pingüinos seguía bajo y se observaron pocos juveniles. En Santa Fe el marcaje de iguanas permitió estudiar algo distinto: la supervivencia según edad y tamaño cuando cambió el pasto de algas.'
        : 'On the same western shores, cormorant counts exceeded their pre-event level by 1984. Penguin counts remained low and juveniles were scarce. On Santa Fe, marking iguanas allowed a different question to be tested: how survival varied with age and size as the algal food changed.'}{' '}
        <a href={citations['valle-1987-condor'].url}>Valle &amp; Coulter (1987) ↗</a>{' · '}
        <a href={citations['laurie-brown-1990'].url}>Laurie &amp; Brown (1990) ↗</a></p>
      <p>{es
        ? 'En los pinnípedos, el seguimiento de 1982–1983 documentó pérdidas de crías dependientes y, en el lobo peletero, ausencias maternas más largas. Los censos de 2015 registraron cuántos animales había en tierra. Las asociaciones regionales entre crías y variables oceanográficas no alcanzaron significancia en ese estudio.'
        : 'In 1982–1983, field monitoring documented losses of dependent pups and, in fur seals, longer maternal absences. The 2015 surveys counted animals ashore. The study found no statistically significant regional associations between pup counts and oceanographic variables.'}{' '}
        <a href={citations['trillmich-limberger-1985'].url}>Trillmich &amp; Limberger (1985) ↗</a>{' · '}
        <a href={citations['paez-rosas-2021'].url}>Páez-Rosas et al. (2021) ↗</a></p>
      <ul className="report-species">
        {speciesOrder.map(id => {
          const article = speciesArticles[id]
          return <li key={id}>
            <strong>{article.commonName[language]}</strong>
            <span className="report-scientific">{article.scientificName}</span>
            <p><strong>{biologicalEvidence[id].period}</strong> · {biologicalEvidence[id].observed[language]}{' '}
              <a href={citations[biologicalEvidence[id].source].url}>{es?'Estudio':'Study'} ↗</a></p>
            {id==='Amblyrhynchus cristatus' && <p>{biologicalEvidence[id].ecosystem[language]}{' '}
              <a href={citations['vinueza-2006'].url}>Vinueza et al. (2006) ↗</a></p>}
            <p className="report-species-links">
              <Link to={'/marine-life?species=' + encodeURIComponent(id)}>{r.interpretation.sheet} →</Link>
              {' · '}
              <Link to={'/habitat-signals?species=' + encodeURIComponent(id)}>{r.interpretation.signals} →</Link>
            </p>
          </li>
        })}
      </ul>
    </section>

    <section className="report-section" id="report-limits">
      <h2>{r.limits.title}</h2>
      <ul className="report-limits">{r.limits.items.map(item => <li key={item}>{item}</li>)}</ul>
      <p className="report-note">{r.limits.note}</p>
    </section>

    <section className="report-section" id="report-conclusions">
      <h2>{r.conclusions.title}</h2>
      {r.conclusions.paragraphs.map(paragraph => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
      <h3>{es ? 'Tendencias por sector' : 'Trends by sector'}</h3>
      <ul>{variables.map(variable => {
          const records = Object.values(sectorIndex.variables[variable].records)
          const estimable = records.filter(result => result.p !== null).length
          const local = records.filter(result => result.local).length
          const adjusted = records.filter(result => result.adjusted).length
          return <li key={variable}>{names[variable]} · {estimable}/{records.length} {es ? 'sectores estimables' : 'estimable sectors'} · {local} (p &lt; 0.05) · {adjusted} (q &lt; 0.05)</li>
        })}</ul>
      <p>{es ? 'El ajuste de Benjamini–Yekutieli controla las comparaciones múltiples por variable. Los intervalos de confianza son locales.'
        : 'The Benjamini–Yekutieli adjustment accounts for multiple comparisons within each variable. Confidence intervals are local.'}
        {' '}<Link to="/ocean-explorer?mode=significance">{es ? 'Consultar sectores' : 'Explore sectors'} →</Link></p>
    </section>

    <section className="report-section" id="report-references">
      <h2>{r.references.title}</h2>
      <h3>{r.references.datasets}</h3>
      <ul className="report-refs">
        {variables.map(variable => <li key={variable}>
          <a href={datasets[variable].sourceUrl} target="_blank" rel="noreferrer">{datasets[variable].product} ↗</a>
          {' · '}{datasets[variable].provider} · {datasets[variable].mission} · {datasets[variable].version} ·{' '}
          <span>{datasets[variable].license}</span>
        </li>)}
      </ul>
      <h3>{r.references.studies}</h3>
      <ol className="report-refs">
        {citationList(referenceIds).map(citation => <li key={citation.text}>
          {citation.url
            ? <a href={citation.url} target="_blank" rel="noreferrer">{citation.text}</a>
            : citation.text}
        </li>)}
      </ol>
      <p className="report-note">{r.references.eps}: <a href={methodologyUrl} target="_blank" rel="noreferrer">docs/DATA_SOURCES.md ↗</a>
        {oni?.value && <> · <a href={oni.value.source} target="_blank" rel="noreferrer">NOAA CPC · ONI ↗</a></>}
        {citations.worms.url && <> · <a href={citations.worms.url} target="_blank" rel="noreferrer">WoRMS ↗</a></>}
      </p>
    </section>

    <section className="report-section" id="report-downloads">
      <h2>{r.downloads.title}</h2>
      <p>{r.downloads.lead}</p>
      <ul className="report-downloads">
        {products.map(([file, label]) => <li key={file}><a href={publicUrl('/data/' + file)} download>{label}</a></li>)}
      </ul>
      <p className="report-note">{r.downloads.note}</p>
    </section>

    <p className="report-back"><a href="#report-top">{r.back}</a></p>
  </>)
}
