import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { createServer } from 'vite'

let server
let browser
let origin

const read = file => JSON.parse(readFileSync('public/data/' + file + '.json', 'utf8'))
const pages = ['sst-monthly', 'chlorophyll-monthly', 'marea-analysis', 'enso-oni']
const modules = [
  '/ocean-explorer', '/climate-detective', '/marine-life',
  '/habitat-signals', '/el-nino-timeline', '/scientific-report',
]

before(async () => {
  origin = process.env.TEST_BASE_URL
  if (!origin) {
    server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' })
    await server.listen()
    origin = server.resolvedUrls.local[0]
  }
  const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  const executablePath = process.env.BROWSER_PATH ?? (existsSync(edge) ? edge : undefined)
  browser = await chromium.launch({ executablePath, headless: true })
})

after(async () => {
  try { await browser?.close() } finally { await server?.close() }
})

async function open(path, viewport = { width: 1280, height: 1000 }) {
  const page = await browser.newPage({ viewport })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ABORTED')) errors.push(request.url()) })
  await page.goto(new URL(path, origin).href)
  return { page, errors }
}

// 1. El informe se publica en su ruta, con estructura de lectura y enlaces internos válidos.
test('the Scientific Report is served on its route with a readable structure and working anchors', async () => {
  const { page, errors } = await open('/scientific-report')
  try {
    await page.getByRole('button', { name: 'English' }).click()
    await page.getByRole('heading', { level: 1, name: 'Scientific Report' }).waitFor()
    await page.locator('.report-toc ol a').first().waitFor()
    assert.equal(await page.locator('#report-top h1').count(), 1)
    const contents = ['study', 'questions', 'methods', 'results', 'charts', 'episode',
      'interpretation', 'limits', 'conclusions', 'references', 'downloads']
    assert.deepEqual(await page.locator('.report-toc ol a').evaluateAll(links => links.map(link => link.getAttribute('href'))),
      contents.map(id => '#report-' + id))
    for (const id of contents) assert.equal(await page.locator('section#' + 'report-' + id).count(), 1)
    assert.equal(await page.locator('.report-section').count(), 11)
    // Sin diario de programación ni bloques de aviso decorativos.
    assert.equal(await page.getByText(/TODO|Work in progress|En desarrollo/).count(), 0)
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

// 2, 3 y 4. Resultados idénticos al motor de la Fase 2, con intervalo de confianza y significancia explícita.
test('the report shows the published trends, confidence intervals and the non-significant verdict', async () => {
  const analysis = read('marea-analysis')
  const fmt = (value, digits = 4) => value.toLocaleString('en', { maximumFractionDigits: digits })
  const { page } = await open('/scientific-report')
  try {
    await page.getByRole('button', { name: 'English' }).click()
    for (const variable of ['sst', 'chlorophyll-a']) {
      const trend = analysis.trends.find(item => item.variableId === variable)
      const unit = variable === 'sst' ? '°C' : 'mg/m³'
      const card = page.locator('.report-trend[data-variable="' + variable + '"]')
      await card.waitFor()
      const text = await card.innerText()
      assert.ok(text.includes(fmt(trend.slopePerDecade) + ' ' + unit + '/decade'), variable + ' slope')
      assert.ok(text.includes(fmt(trend.confidenceInterval[0]) + ' … ' + fmt(trend.confidenceInterval[1]) + ' ' + unit + '/year'),
        variable + ' interval')
      assert.ok(text.includes(fmt(trend.pValue)), variable + ' p-value')
      assert.ok(text.includes(String(trend.n)), variable + ' n')
      assert.equal(trend.significant, false)
      assert.equal(await card.getAttribute('data-significant'), 'false')
      assert.match(await card.locator('.report-verdict').innerText(), /No statistically significant trend/)
    }
    // La no significancia se explica y no se convierte en alarma ambiental.
    assert.match(await page.locator('#report-results .report-caution').innerText(), /does not prove that no change exists/)
    assert.equal(await page.locator('.report-trend[data-significant="true"]').count(), 0)
  } finally { await page.close() }
})

// 5 y 6. Visualizaciones con las series publicadas, meses ausentes visibles y fuentes correctas.
test('the charts reuse the published series, mark the missing months and cite their products', async () => {
  const chlorophyll = read('chlorophyll-monthly')
  const sst = read('sst-monthly')
  const missing = chlorophyll.observations.filter(row => row.value === null).map(row => row.date)
  assert.equal(missing.length, 3)
  const { page } = await open('/scientific-report')
  try {
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.report-variable[data-variable="sst"] .time-chart').first().waitFor()
    assert.equal(await page.locator('.report-variable[data-variable="sst"] .time-chart').count(), 2)
    assert.equal(await page.locator('.report-variable[data-variable="chlorophyll-a"] .time-chart').count(), 2)
    // La serie observada usa los mismos números que el producto publicado.
    const first = sst.observations[0]
    await page.locator('.report-variable[data-variable="sst"] .time-chart').first()
      .locator('.chart-reader output').getByText(new RegExp('Jan 2003 · ' + first.value.toLocaleString('en', { maximumFractionDigits: 3 }) + ' °C')).waitFor()
    // Los tres meses sin observación se marcan como ausentes, sin estimarse.
    const marks = page.locator('.report-variable[data-variable="chlorophyll-a"] .time-chart').first().locator('svg path title')
    assert.equal(await marks.count(), 3)
    const legend = page.locator('.report-variable[data-variable="chlorophyll-a"] .time-chart').first().locator('small')
    for (const date of missing) {
      assert.match(await legend.innerText(), new RegExp(new Intl.DateTimeFormat('en', {
        month: 'short', year: 'numeric', timeZone: 'UTC',
      }).format(new Date(date + 'T00:00:00Z'))))
    }
    // Variable, unidad, periodo y fuente declarados junto a cada gráfica.
    const meta = page.locator('.report-variable[data-variable="chlorophyll-a"] .report-meta')
    const metaText = await meta.innerText()
    assert.match(metaText, /Unit mg\/m³/)
    assert.match(metaText, /Period 2003-01 – 2024-12/)
    assert.match(metaText, /Source/)
    assert.match(await meta.locator('a').getAttribute('href'), /modis|oceancolor|earthdata/i)
    assert.equal(await page.locator('.time-chart svg[role="img"]').count(), 4)
  } finally { await page.close() }
})

// 7 y 8. Comparación 2015-2016 con las diferencias, la cobertura y la aclaración sobre el ONI.
test('the 2015-2016 comparison publishes the difference, the coverage and the ONI caveat', async () => {
  const analysis = read('marea-analysis')
  const oni = read('enso-oni')
  const number = (value, digits) => value.toLocaleString('en', { maximumFractionDigits: digits })
  const { page } = await open('/scientific-report')
  try {
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.report-table tbody tr').first().waitFor()
    const episodes = analysis.comparisons.filter(item => item.id.startsWith('elnino-2015-2016-'))
    assert.equal(episodes.length, 2)
    const rows = page.locator('.report-table tbody tr')
    assert.equal(await rows.count(), 2)
    assert.deepEqual(await rows.nth(0).locator('td').allTextContents(), [
      number(episodes[0].mean, 3), number(episodes[0].referenceMean, 3), number(episodes[0].difference, 3),
      '—', '18/18 (100 %)',
    ])
    assert.deepEqual(await rows.nth(1).locator('td').allTextContents(), [
      number(episodes[1].mean, 3), number(episodes[1].referenceMean, 3), number(episodes[1].difference, 3),
      number(episodes[1].differencePercent, 1), '18/18 (100 %)',
    ])
    const sectorText = await page.locator('#report-conclusions li').allTextContents()
    const { variables } = read('sectors/index')
    for (const [i, variable] of ['sst', 'chlorophyll-a'].entries()) {
      const records = Object.values(variables[variable].records)
      const estimable = records.filter(item => item.p !== null).length
      assert.ok(sectorText[i].includes(estimable + '/' + records.length))
      assert.ok(sectorText[i].includes(records.filter(item => item.p !== null && item.p < .05).length + ' (p < 0.05)'))
      assert.ok(sectorText[i].includes(records.filter(item => item.q !== null && item.q < .05).length + ' (q < 0.05)'))
    }
    const intervals = await page.locator('.report-intervals li').allTextContents()
    assert.ok(intervals.some(line => line.includes('2015-01 – 2016-06')))
    assert.ok(intervals.some(line => line.includes('2003-01 – 2024-12')))
    const declared = oni.episodes.find(item => item.id === 'el-nino-2014-2016')
    assert.ok(intervals.some(line => line.includes(declared.start + ' – ' + declared.end)))
    // El ONI sitúa el episodio, no mide Galápagos; la comparación no atribuye causalidad.
    assert.match(await page.locator('#report-episode').innerText(), /central equatorial Pacific/)
    assert.match(await page.locator('#report-episode .report-caution').innerText(), /do not establish an effect/)
  } finally { await page.close() }
})

// 9 y 10. La exportación hace lo que anuncia: abre el diálogo de impresión y ofrece los JSON publicados.
test('export runs a real action, is labelled honestly and serves the published products', async () => {
  const { page } = await open('/scientific-report')
  try {
    await page.getByRole('button', { name: 'English' }).click()
    await page.evaluate(() => { window.__printCalls = 0; window.print = () => { window.__printCalls += 1 } })
    const button = page.locator('.report-print')
    assert.equal(await button.getAttribute('type'), 'button')
    assert.equal(await button.innerText(), 'Print or save as PDF')
    await button.click()
    assert.equal(await page.evaluate(() => window.__printCalls), 1)
    assert.match(await page.locator('.report-actions small').innerText(), /print dialog/)
    const guide = await page.locator('#report-methods a[href*="DATA_SOURCES"]').getAttribute('href')
    const guideResponse = await page.request.get(new URL(guide, origin).href)
    assert.equal(await guideResponse.text(), readFileSync('docs/DATA_SOURCES.md', 'utf8'))
    const files = ['sst-monthly.json', 'chlorophyll-monthly.json', 'marea-analysis.json', 'enso-oni.json']
    assert.deepEqual(await page.locator('.report-downloads a').evaluateAll(links => links.map(link => link.getAttribute('href'))),
      files.map(file => '/data/' + file))
    assert.deepEqual(await page.locator('.report-downloads a').evaluateAll(links => links.map(link => link.hasAttribute('download'))),
      files.map(() => true))
    for (const file of files) {
      const response = await page.request.get(new URL('/data/' + file, origin).href)
      assert.equal(response.status(), 200)
      const body = await response.json()
      assert.equal(typeof body, 'object')
      assert.equal(Array.isArray(body), false)
    }
  } finally { await page.close() }
})

// 11, 12 y 13. Impresión: papel claro, sin controles interactivos, con paginación y referencias legibles.
test('the print stylesheet produces a light, paginated document without interactive controls', async () => {
  const { page } = await open('/scientific-report')
  try {
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.time-chart').first().waitFor()
    await page.emulateMedia({ media: 'print' })
    for (const selector of ['header', 'footer', '.report-actions', '.report-toc', '.report-back',
      '.chart-reader', '.report-print']) {
      assert.equal(await page.locator(selector).first().isHidden(), true, selector + ' hidden in print')
    }
    assert.equal(await page.locator('.chart-reader').count(), 4)
    for (let index = 0; index < 4; index += 1) {
      assert.equal(await page.locator('.chart-reader').nth(index).isHidden(), true, 'chart reader ' + index + ' hidden in print')
    }
    const styles = await page.evaluate(() => ({
      scheme: getComputedStyle(document.documentElement).colorScheme,
      details: getComputedStyle(document.querySelector('.report-details'), '::details-content').contentVisibility,
      body: getComputedStyle(document.body).backgroundColor,
      report: getComputedStyle(document.querySelector('.report')).color,
      chart: getComputedStyle(document.querySelector('.time-chart')).backgroundColor,
      card: getComputedStyle(document.querySelector('.report-trend')).backgroundColor,
      label: getComputedStyle(document.querySelector('.report-trend dt')).color,
      reference: getComputedStyle(document.querySelector('.report-refs a[href^="http"]'), '::after').content,
      page: Array.from(document.styleSheets).flatMap(sheet => {
        try { return Array.from(sheet.cssRules).filter(rule => rule.conditionText === 'print').map(rule => rule.cssText) }
        catch { return [] }
      }).join(' '),
    }))
    assert.equal(styles.scheme, 'light')
    assert.equal(styles.details, 'visible')
    assert.equal(styles.body, 'rgb(255, 255, 255)')
    assert.equal(styles.chart, 'rgb(255, 255, 255)')
    assert.equal(styles.card, 'rgb(255, 255, 255)')
    const channels = value => value.match(/\d+/g).map(Number)
    assert.ok(channels(styles.report).every(channel => channel < 128), 'report text stays dark on paper')
    assert.ok(channels(styles.label).every(channel => channel < 140), 'figure labels stay dark on paper')
    assert.match(styles.reference, /https?:/)
    assert.match(styles.page, /@page/)
    assert.match(styles.page, /break-after/)
    assert.match(styles.page, /break-inside/)
  } finally { await page.close() }
})

// 14. Traducciones ES/EN completas en el informe.
test('the report switches between Spanish and English without mixing languages', async () => {
  const { page } = await open('/scientific-report')
  try {
    await page.getByRole('button', { name: 'Español' }).click()
    await page.getByRole('heading', { level: 1, name: 'Informe científico' }).waitFor()
    assert.equal(await page.locator('html').getAttribute('lang'), 'es')
    assert.equal(await page.locator('.report-toc h2').textContent(), 'Contenido del informe')
    assert.match(await page.locator('#report-results .report-verdict').first().innerText(), /Sin tendencia estadísticamente significativa/)
    assert.equal(await page.locator('.report-print').innerText(), 'Imprimir o guardar como PDF')
    assert.equal(await page.locator('#report-episode h2').innerText(), 'El Niño 2015–2016')
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.report-toc h2').getByText('Report contents').waitFor()
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    assert.equal(await page.locator('#report-limits h2').innerText(), 'Limitations')
    assert.equal(await page.locator('.report-print').innerText(), 'Print or save as PDF')
    assert.equal(await page.getByText(/Sin tendencia|Datos insuficientes/).count(), 0)
  } finally { await page.close() }
})

// 15, 16. Home: qué es MAREA, indicadores auténticos, los seis módulos y ninguna etiqueta pendiente.
test('the home page introduces MAREA, shows published indicators and links to every module', async () => {
  const analysis = read('marea-analysis')
  const sst = analysis.trends.find(item => item.variableId === 'sst')
  const chlorophyll = analysis.trends.find(item => item.variableId === 'chlorophyll-a')
  const episode = analysis.comparisons.find(item => item.id === 'elnino-2015-2016-sst')
  const episodeChlorophyll = analysis.comparisons.find(item => item.id === 'elnino-2015-2016-chlorophyll')
  const { page, errors } = await open('/', { width: 1280, height: 900 })
  try {
    await page.getByRole('button', { name: 'Español' }).click()
    await page.getByRole('heading', { level: 1, name: /El océano de Galápagos/ }).waitFor()
    assert.equal(await page.locator('.module-grid a.module').count(), 6)
    assert.deepEqual(await page.locator('.module-grid a.module').evaluateAll(links => links.map(link => new URL(link.href).pathname)),
      modules)
    assert.equal(await page.getByText(/En desarrollo|In development/).count(), 0)
    await page.locator('.evidence-grid li').first().waitFor()
    const cells = await page.locator('.evidence-grid li').allTextContents()
    assert.equal(cells.length, 3)
    assert.match(cells[0], /2003–2024/)
    assert.match(cells[0], new RegExp(String(sst.n)))
    assert.match(cells[0], new RegExp(String(chlorophyll.n)))
    assert.ok(cells[1].includes((sst.slopePerDecade > 0 ? '+' : '') + sst.slopePerDecade.toLocaleString('es', { maximumFractionDigits: 3 })))
    assert.match(cells[1], /no muestra una tendencia estadísticamente significativa/)
    assert.ok(cells[2].includes((episode.difference > 0 ? '+' : '') + episode.difference.toLocaleString('es', { maximumFractionDigits: 2 })))
    assert.match(cells[2], new RegExp(Math.abs(episodeChlorophyll.differencePercent).toLocaleString('es', { maximumFractionDigits: 1 })))
    assert.equal(await page.locator('.home-note a').getAttribute('href'), '/scientific-report')
    assert.match(await page.locator('.home-lead').innerText(), /surgencia|corrientes/)
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.home-evidence h2').getByText('The ocean we observe').waitFor()
    assert.match(await page.locator('.evidence-grid li').first().textContent(), /Observed period/)
    assert.equal(await page.getByText(/En desarrollo|In development/).count(), 0)
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

// 17. Habitat Signals muestra sus controles generales sin fechas ni saltos mientras carga la serie.
test('Habitat Signals keeps its general controls visible while the regional record loads', async () => {
  const { page } = await open('/habitat-signals')
  try {
    let release
    const gate = new Promise(resolve => { release = resolve })
    await page.route('**/data/sst-monthly.json', async route => { await gate; await route.continue() })
    await page.reload()
    const controls = page.locator('.signals-controls')
    await controls.waitFor()
    // Solo el selector de especie: el explorador ya no ofrece selectores de año ni de mes.
    assert.equal(await controls.locator('select').count(), 1)
    assert.equal(await controls.locator('select option').count(), 5)
    // Los escenarios generales están disponibles de inmediato, sin depender de la serie regional.
    assert.equal(await page.locator('.scenario-options button').count(), 6)
    const species = controls.locator('select')
    assert.equal(await species.isDisabled(), false)
    assert.match(await species.inputValue(), /^[A-Z][a-z]+ [a-z]+$/)
    const before = await controls.boundingBox()
    release()
    await page.locator('.signal-example .monthly-indicator').first().waitFor()
    const after = await controls.boundingBox()
    assert.ok(Math.abs(before.height - after.height) <= 4, 'control band keeps its height')
    assert.equal(await controls.locator('select').count(), 1)
  } finally { await page.close() }
})

// 18. Responsive 360/768/1280 en el informe, la Home y la versión de impresión sin desbordes.
test('the report, the home page and the print view stay inside 360, 768 and 1280 pixels', async () => {
  const { page } = await open('/scientific-report')
  try {
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.locator('#report-results').waitFor()
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'report ' + width)
    }
    await page.emulateMedia({ media: 'print' })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'print')
    await page.emulateMedia({ media: 'screen' })
    await page.goto(new URL('/', origin).href)
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      await page.locator('.evidence-grid').waitFor()
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'home ' + width)
    }
    // Accesibilidad básica: un solo h1, encabezados en orden y salto al contenido disponible.
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.locator('.skip').count(), 1)
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => document.activeElement?.className), 'skip')
  } finally { await page.close() }
})

// 19. Integridad de los productos científicos que alimentan la aplicación.
test('the published scientific products keep their approved contents', async () => {
  const analysis = read('marea-analysis')
  assert.equal(analysis.engine.version, '1.0.0')
  assert.equal(analysis.engine.baseline.start, '2003-01-01')
  assert.equal(analysis.engine.baseline.end, '2024-12-31')
  assert.equal(analysis.engine.confidence, 0.95)
  assert.deepEqual(Object.keys(analysis.engine.methods).sort(), ['anomaly', 'climatology', 'comparison', 'trend'])
  assert.deepEqual(analysis.engine.thresholds, {
    minimumYearsPerMonth: 10, minimumSeasonYears: 10, minimumSeasonalMonths: 9,
    minimumTrendObservations: 60, minimumComparisonMonths: 3, minimumComparisonCoverage: 0.5,
    percentDenominatorMin: 0.01, autocorrelationLags: 3,
  })
  assert.match(analysis.engine.inputs.sst.sha256, /^[0-9a-f]{64}$/)
  assert.match(analysis.engine.inputs.chlorophyll.sha256, /^[0-9a-f]{64}$/)
  assert.equal(read('sst-monthly').observations.length, 264)
  assert.equal(read('chlorophyll-monthly').observations.length, 264)
  assert.equal(read('chlorophyll-monthly').observations.filter(row => row.value === null).length, 3)
  const oni = read('enso-oni')
  assert.equal(oni.episodes.find(item => item.id === 'el-nino-2014-2016').peak.value, 2.59)
  const { page } = await open('/scientific-report')
  try {
    for (const file of pages) {
      const response = await page.request.get(new URL('/data/' + file + '.json', origin).href)
      assert.equal(response.status(), 200, file)
      assert.deepEqual(await response.json(), read(file))
    }
  } finally { await page.close() }
})
