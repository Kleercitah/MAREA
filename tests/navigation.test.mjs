import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { createServer } from 'vite'

let server
let browser
let origin

test('sector maps match published estimates at mobile, tablet and desktop widths', async () => {
  const index = JSON.parse(readFileSync('public/data/sectors/index.json','utf8'))
  const page = await browser.newPage()
  try {
    await page.goto(new URL('/ocean-explorer?mode=sst-trend',origin).href)
    await page.getByRole('button',{name:'English'}).click()
    for (const width of [360,768,1280]) {
      await page.setViewportSize({width,height:850})
      await page.locator('rect[data-sector="R03C12"]').click()
      await page.getByRole('heading',{name:'R03C12',exact:true}).waitFor()
      assert.equal(await page.getByLabel('Sector',{exact:true}).inputValue(),'R03C12')
      const r = index.variables.sst.records.R03C12
      assert.equal(await page.locator('.sector-slope').innerText(),r.slope.toLocaleString('en',{maximumFractionDigits:4})+' °C/decade')
      await page.getByText(/Whole Galápagos region/).waitFor()
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
      await page.locator('.discovery').scrollIntoViewIfNeeded()
      await page.screenshot({path:join(tmpdir(),'marea-sectors-'+width+'.png')})
      const [map,panel] = await Promise.all([page.locator('.sector-figure').boundingBox(),page.locator('.sector-reading').boundingBox()])
      assert.ok(map.x+map.width<=panel.x+1 || map.y+map.height<=panel.y+1)
    }
    await page.getByLabel('Map mode').selectOption('significance')
    await page.getByRole('heading',{name:'Sector significance',exact:true}).waitFor()
    assert.equal(await page.locator('[data-sector="R03C12"]').getAttribute('fill'),'#b09ed5')
    await page.getByLabel('Variable',{exact:true}).selectOption('chlorophyll-a')
    await page.getByLabel('Sector',{exact:true}).selectOption('R09C04')
    await page.locator('.sector-reading').scrollIntoViewIfNeeded()
    await page.getByText('Insufficient coverage to estimate the trend.').waitFor()
    assert.equal(await page.locator('[data-sector="R09C04"]').getAttribute('fill'),'none')
    await page.getByLabel('Sector',{exact:true}).selectOption('R01C01')
    await page.getByLabel('Map mode').selectOption('episode')
    await page.locator('.sector-event').getByText(/Mean \/ sector reference/).waitFor()
    const event = index.variables['chlorophyll-a'].records.R01C01.episode
    assert.equal(await page.locator('.sector-event strong').innerText(),'Δ '+event.difference.toLocaleString('en',{maximumFractionDigits:4})+' mg/m³')
    await page.getByRole('button',{name:'Monthly series'}).click()
    await page.locator('.chart-reader output').waitFor()
    await page.getByRole('slider').press('End')
    await page.locator('.chart-reader output').getByText(/No data/).waitFor()
    const pending = page.waitForEvent('download')
    await page.getByRole('button',{name:'Download query'}).click()
    const file = await (await pending).path()
    const saved = JSON.parse(readFileSync(file,'utf8'))
    assert.equal(saved.sector,'R01C01')
    assert.equal(saved.manifestSHA256,index.manifestSHA256)
    assert.deepEqual(saved.result,index.variables['chlorophyll-a'].records.R01C01)
    await page.reload()
    assert.equal(await page.getByLabel('Sector',{exact:true}).inputValue(),'R01C01')
  } finally { await page.close() }
})

test('guided investigation opens, closes and follows the published episode to the sector activity',async()=>{
  const page = await browser.newPage({viewport:{width:360,height:800}})
  try {
    await page.goto(origin)
    const start = page.getByRole('button',{name:/Descubre El Niño/})
    await start.click()
    await page.getByRole('button',{name:'Cerrar recorrido'}).press('Enter')
    assert.ok(await start.evaluate(el=>el===document.activeElement))
    await page.getByRole('button',{name:'English'}).click()
    await page.getByRole('button',{name:/Discover El Niño/}).click()
    const next = page.getByRole('button',{name:'Next',exact:true})
    await next.press('Enter')
    await page.locator('.guide-map img').waitFor()
    await page.getByText(/2014-10 – 2016-05/).waitFor()
    await next.click()
    await page.getByText(/2015-01 – 2016-06/).waitFor()
    await page.getByText(/Δ SST \+1.154 °C/).waitFor()
    await next.click()
    await page.getByRole('link',{name:/Neave/}).waitFor()
    const biology = page.getByRole('link', { name: /See the study and count change/ })
    assert.equal(await biology.getAttribute('href'), '/marine-life?species=Arctocephalus%20galapagoensis')
    await next.click()
    await page.getByRole('link',{name:/Investigate with the map/}).click()
    await page.getByLabel('Sector',{exact:true}).selectOption('R03C12')
    await page.getByText(/reaches local significance only/).waitFor()
    await page.getByRole('button',{name:'No',exact:true}).click()
    await page.getByRole('status').getByText(/evidence supports your answer/).waitFor()
    await page.getByRole('button',{name:'Español'}).click()
    await page.getByText(/alcanza significancia local/).waitFor()
  } finally { await page.close() }
})
const routes = [
  ['/', 'El océano de', 'The ocean of'],
  ['/ocean-explorer', 'Explorador oceánico', 'Ocean Explorer'],
  ['/climate-detective', 'Detective climático', 'Climate Detective'],
  ['/marine-life', 'Vida marina', 'Marine Life'],
  ['/habitat-signals', 'Señales de hábitat', 'Habitat Signals'],
  ['/el-nino-timeline', 'Cronología de El Niño', 'El Niño Timeline'],
  ['/scientific-report', 'Informe científico', 'Scientific Report'],
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

test('seven direct URLs in ES and EN, local fonts, active links and saved language', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ABORTED')) errors.push(request.url()) })
  try {
    for (const [path, es, en] of routes) {
      await page.goto(new URL(path, origin).href)
      await page.getByRole('button', { name: 'Español' }).click()
      await page.getByRole('heading', { level: 1, name: new RegExp(es) }).waitFor()
      const active = page.locator('nav a[aria-current="page"]')
      assert.equal(await active.getAttribute('href'), path)
      assert.equal(await page.title(), (path === '/' ? 'Inicio' : es) + ' · MAREA')
      assert.equal(await page.locator('header .brand').innerText(), 'MAREA')
      assert.equal(await page.locator('footer .brand').innerText(), 'MAREA')
      await page.getByRole('button', { name: 'English' }).click()
      await page.reload()
      await page.getByRole('heading', { level: 1, name: new RegExp(en) }).waitFor()
      assert.equal(await page.locator('html').getAttribute('lang'), 'en')
      assert.equal(await page.title(), (path === '/' ? 'Home' : en) + ' · MAREA')
    }
    await page.evaluate(() => document.fonts.ready)
    const style = await page.evaluate(() => ({
      loaded: Array.from(document.fonts).filter(font => font.status === 'loaded').map(font => font.family),
      title: getComputedStyle(document.querySelector('h1')).fontFamily,
      body: getComputedStyle(document.body).fontFamily,
      background: getComputedStyle(document.documentElement).backgroundColor,
    }))
    assert.match(style.title, /Space Grotesk/)
    assert.match(style.body, /Inter/)
    assert.match(style.loaded.join(), /Space Grotesk/)
    assert.match(style.loaded.join(), /Inter/)
    assert.equal(style.background, 'rgb(7, 17, 61)')
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('Spanish default, keyboard menu, seven mobile destinations and overflow', async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 760 } })
  try {
    await page.goto(origin)
    const menu = page.getByRole('button', { name: 'Menú' })
    assert.equal(await menu.getAttribute('aria-expanded'), 'false')
    await menu.click()
    await page.keyboard.press('Escape')
    assert.equal(await menu.getAttribute('aria-expanded'), 'false')
    assert.equal(await menu.evaluate(el => el === document.activeElement), true)
    for (const [path, es] of routes) {
      await menu.click()
      assert.equal(await page.locator('#primary-nav a:visible').count(), 7)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.locator('#primary-nav').getByRole('link', { name: path === '/' ? 'Inicio' : es, exact: true }).click()
      await page.getByRole('heading', { name: new RegExp(es), level: 1 }).waitFor()
      assert.equal(new URL(page.url()).pathname, path)
      assert.equal(await menu.getAttribute('aria-expanded'), 'false')
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    }
    await page.setViewportSize({ width: 1280, height: 800 })
    assert.equal(await page.locator('#primary-nav a:visible').count(), 7)
    assert.equal(await menu.isVisible(), false)
  } finally { await page.close() }
})

test('home actions, history and recovery from an unknown URL', async () => {
  const page = await browser.newPage()
  try {
    await page.goto(origin)
    for (const [name, path] of [['Explorar océano', '/ocean-explorer'], ['Conocer la vida marina', '/marine-life'], ['Fuentes y metodología', '/scientific-report']]) {
      await page.getByRole('link', { name }).click()
      await page.waitForURL(new URL(path, origin).href)
      await page.goBack()
      await page.getByRole('heading', { level: 1, name: /Galápagos/ }).waitFor()
    }
    await page.goto(new URL('/missing-section', origin).href)
    await page.getByRole('heading', { name: 'Página no encontrada' }).waitFor()
    await page.getByRole('link', { name: 'Volver al inicio' }).click()
    assert.equal(new URL(page.url()).pathname, '/')
  } finally { await page.close() }
})


test('Ocean Explorer connects map pixels, cell values, regional records and anomalies', async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const data = name => JSON.parse(readFileSync('public/data/' + name, 'utf8'))
  const manifest = data('spatial/manifest.json')
  const series = data('sst-monthly.json')
  const analysis = data('marea-analysis.json')
  try {
    await page.goto(new URL('/ocean-explorer', origin).href)
    const image = page.locator('.ocean-raster')
    await image.waitFor()
    const layer = manifest.layers.find(l => l.variable === 'sst' && l.month === '2024-10')
    const grid = readFileSync('public/data/spatial/' + layer.file)
    const date = '2024-10-01'
    const mean = series.observations.find(o => o.date === date).value
    const anomaly = analysis.anomalies.find(a => a.variableId === 'sst').observations.find(o => o.date === date).absolute
    const number = n => n.toLocaleString('en', { maximumFractionDigits: 2 }) + ' °C'
    await page.getByRole('button', { name: 'English' }).click()
    await page.getByText(number(mean), { exact: true }).waitFor()
    await page.getByText(number(anomaly), { exact: true }).waitFor()
    async function pick(lat, lon) {
      const col = Math.floor((lon-layer.west)/layer.step), row = Math.floor((layer.north-lat)/layer.step)
      const box = await image.boundingBox()
      await page.mouse.click(box.x + box.width*(col+.5)/layer.width, box.y + box.height*(row+.5)/layer.height)
      return grid.readFloatLE(4*(row*layer.width+col))
    }
    const cell = await pick(.65, -91.7)
    await page.locator('.cell-panel').getByText(number(cell), { exact: true }).waitFor()
    const pixel = await image.evaluate(img => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      return [...ctx.getImageData(29,109,1,1).data]
    })
    const fraction = (cell - 23.5) / (25.75 - 23.5)
    const expected = [187,55,85].map((v,i) => Math.round(v + fraction * ([247,129,76][i] - v)))
    assert.deepEqual(pixel, [...expected,255])
    assert.deepEqual(await page.locator('.ticks span').allTextContents(), ['19','21.25','23.5','25.75','28'])
    assert.ok(Number.isNaN(await pick(-.55,-91.1)))
    await page.locator('.cell-panel').getByText('Land', { exact: true }).waitFor()
    const before = await image.boundingBox()
    await page.getByRole('button', { name: 'Zoom in' }).click()
    await page.waitForFunction(w => document.querySelector('.ocean-raster').getBoundingClientRect().width > w*1.5, before.width)
    await page.getByRole('button', { name: 'Reset view' }).click()
    await page.waitForFunction(w => Math.abs(document.querySelector('.ocean-raster').getBoundingClientRect().width-w) < 2, before.width)
    const slider = page.getByRole('slider')
    await slider.focus()
    await slider.press('End')
    await page.waitForFunction(() => document.querySelector('.ocean-raster').style.opacity === '1')
    await page.getByLabel('Show layer').uncheck()
    await image.waitFor({state:'detached'})
    await page.getByLabel('Show layer').check()
    await image.waitFor()
    const year = page.getByLabel('Year', {exact:true})
    const month = page.getByLabel('Observation month')
    await year.selectOption('2003')
    await month.selectOption('2003-01')
    await image.waitFor()
    await page.getByText('Mapped months · 12/12').waitFor()
    assert.match(await month.locator('option:checked').innerText(), /Satellite layer/)
    await page.getByRole('button', { name:'Chlorophyll-a', exact:true }).click()
    await page.getByText('Logarithmic scale').waitFor()
    await page.locator('.science-context summary').click()
    await page.getByText(/Chlorophyll-a is a phytoplankton pigment/).waitFor()
    await year.selectOption('2015')
    await month.selectOption('2015-12')
    assert.equal(await page.getByLabel('Observation month').inputValue(),'2015-12')
    await year.selectOption('2024')
    await month.selectOption('2024-12')
    await image.waitFor({state:'detached'})
    await page.getByRole('status').getByText('No spatial data for this month.').waitFor()
    assert.equal(await page.locator('.regional-value').innerText(),'No data')
    await year.selectOption('2022')
    await month.selectOption('2022-05')
    assert.match(await page.locator('.regional-value').innerText(), /mg\/m³/)
    await page.setViewportSize({ width:360, height:760 })
    assert.ok(await page.locator('.ocean-map').isVisible())
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.route('**/data/spatial/*.f32', route => route.fulfill({ status: 503, body: '' }))
    await year.selectOption('2024')
    await month.selectOption('2024-10')
    await page.locator('.map-status').getByText('Could not load this resource.').waitFor()
    assert.match(await page.locator('.regional-value').innerText(), /mg\/m³/)
    assert.equal(await image.count(), 0)
  } finally { await page.close() }
})

test('Climate Detective reads the approved series, trend and matched-month comparison', async () => {
  const page = await browser.newPage({ viewport: { width: 360, height: 760 } })
  const read = file => JSON.parse(readFileSync('public/data/'+file+'.json', 'utf8'))
  const analysis = read('marea-analysis')
  const number = (v, digits=3) => v.toLocaleString('en', { maximumFractionDigits: digits })
  try {
    await page.goto(new URL('/climate-detective', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    const reader = page.getByRole('slider', { name: /Inspect month/ })
    for (const variable of ['sst', 'chlorophyll-a']) {
      await page.getByLabel('Variable', {exact:true}).selectOption(variable)
      const series = read(variable==='sst' ? 'sst-monthly' : 'chlorophyll-monthly')
      const trend = analysis.trends.find(t=>t.variableId===variable)
      const unit = variable==='sst' ? '°C' : 'mg/m³'
      await page.getByLabel('Display').selectOption('observed')
      await page.getByLabel('Chart interval').selectOption('full')
      await page.locator('.chart-reader output').getByText('Jan 2003 · '+number(series.observations[0].value)+' '+unit).waitFor()
      await page.locator('.trend-summary').getByText(number(trend.slopePerYear,5)+' '+unit, {exact:true}).waitFor()
      await page.locator('.trend-summary').getByText(number(trend.pValue,4), {exact:true}).waitFor()
      await page.getByText(/not statistically significant/).waitFor()
      const episode = analysis.comparisons.find(c=>c.id.startsWith('elnino-2015-2016-') && c.variableId===variable)
      const cells = await page.locator('.episode tbody tr').filter({hasText:unit}).locator('td').allTextContents()
      assert.deepEqual(cells, [number(episode.mean), number(episode.referenceMean), number(episode.difference),
        episode.differencePercent===null ? '—' : number(episode.differencePercent,1), '18/18 (100 %)'])
      await page.getByLabel('Chart interval').selectOption('episode')
      assert.equal(await reader.getAttribute('max'), '17')
      await page.getByLabel('Display').selectOption('absolute')
      const zero = page.locator('.time-chart line[stroke-dasharray="4 4"]')
      await zero.waitFor({state:'attached'})
      const zeroY = Number(await zero.getAttribute('y1'))
      assert.ok(zeroY >= 18 && zeroY <= 204)
      const obs = analysis.anomalies.find(a=>a.variableId===variable).observations.find(r=>r.date===episode.period.start)
      assert.match(await page.locator('.chart-reader output').innerText(), new RegExp(number(obs.absolute)+' '+unit))
    }
    await page.getByLabel('Display').selectOption('percent')
    await page.getByLabel('Chart interval').selectOption('2024')
    assert.equal(await reader.getAttribute('max'), '11')
    await reader.press('End')
    await page.locator('.chart-reader output').getByText('Dec 2024 · No data').waitFor()
    assert.equal(await page.locator('.time-chart svg path title').count(),3)
    await page.locator('.science-context summary').click()
    await page.getByText(/Chlorophyll-a is a phytoplankton pigment/).waitFor()
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.getByRole('button',{name:'Español'}).click()
    await page.getByText(/La clorofila-a es un pigmento/).waitFor()
  } finally { await page.close() }
})

test('El Niño Timeline follows the official ONI record and the approved analysis', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const data = name => JSON.parse(readFileSync('public/data/' + name, 'utf8'))
  const oni = data('enso-oni.json')
  const analysis = data('marea-analysis.json')
  const number = (value, digits = 2) => value.toLocaleString('en', { maximumFractionDigits: digits })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  try {
    await page.goto(new URL('/el-nino-timeline', origin).href)
    await page.getByRole('heading', { level: 1, name: /Cronología de El Niño/ }).waitFor()
    await page.locator('.oni-ribbon svg').waitFor()
    assert.equal(await page.locator('.episode-chips li').count(), oni.episodes.length)
    await page.getByRole('button', { name: 'English' }).click()
    await page.getByRole('heading', { level: 1, name: /El Niño Timeline/ }).waitFor()
    const episode = oni.episodes.find(item => item.id === 'el-nino-2014-2016')
    assert.deepEqual([episode.start, episode.end, episode.peak.month], ['2014-10', '2016-05', '2015-12'])
    const strongest = page.locator('.episode-chips li').filter({ has: page.getByText(/highest peak on record/) })
    assert.match(await strongest.innerText(), /2014–2016/)
    const reader = page.getByRole('slider', { name: /Inspect month/ })
    assert.equal(await reader.getAttribute('max'), String(oni.seasons.length - 1))
    await page.getByLabel('Year', { exact: true }).selectOption('2015')
    await page.getByLabel('Month', { exact: true }).selectOption('2015-12')
    assert.match(await page.locator('.phase-badge').innerText(), /El Niño/)
    assert.match(await page.locator('.oni-reader output').innerText(), new RegExp(number(episode.peak.value)))
    const comparison = analysis.comparisons.find(item => item.id === 'elnino-2015-2016-sst')
    await page.locator('.comparison-line').first().getByText(new RegExp(number(comparison.mean, 3))).waitFor()
    assert.equal(await page.locator('.anomaly-bars').count(), 2)
    assert.match(await page.locator('.oni-ribbon figcaption').innerText(), /ONI/)
    await page.getByLabel('Year', { exact: true }).selectOption('2007')
    await page.getByLabel('Month', { exact: true }).selectOption('2007-11')
    assert.match(await page.locator('.phase-badge').innerText(), /La Niña/)
    await page.getByLabel('Year', { exact: true }).selectOption('2013')
    await page.getByLabel('Month', { exact: true }).selectOption('2013-06')
    assert.match(await page.locator('.phase-badge').innerText(), /No declared episode/)
    await reader.focus()
    await reader.press('End')
    await page.locator('.oni-reader output').getByText(/Dec 2024/).waitFor()
    assert.equal(await page.getByLabel('Month', { exact: true }).inputValue(), '2024-12')
    await page.getByRole('link', { name: 'View this month in Ocean Explorer' }).click()
    await page.waitForURL(url => url.pathname === '/ocean-explorer' &&
      url.searchParams.get('variable') === 'sst' && url.searchParams.get('month') === '2024-12')
    await page.locator('select[aria-labelledby="map-month"] option[value="2024-12"]').waitFor({ state: 'attached' })
    assert.equal(await page.getByLabel('Observation month').inputValue(), '2024-12')
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('Ocean Explorer opens on a requested month and offers per-variable availability', async () => {
  const page = await browser.newPage({ viewport: { width: 1024, height: 820 } })
  const manifest = JSON.parse(readFileSync('public/data/spatial/manifest.json', 'utf8'))
  const sst = manifest.layers.filter(layer => layer.variable === 'sst').length
  const chlorophyll = manifest.layers.filter(layer => layer.variable === 'chlorophyll-a').length
  try {
    await page.goto(new URL('/ocean-explorer?variable=chlorophyll-a&month=2015-12', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    const monthField = page.getByLabel('Observation month')
    // Las opciones dependen de la serie publicada: esperar antes de leer el valor conservado.
    await monthField.locator('option[value="2015-12"]').waitFor({ state: 'attached' })
    assert.equal(await monthField.inputValue(), '2015-12')
    assert.equal(await page.getByRole('button', { name: 'Chlorophyll-a', exact: true }).getAttribute('aria-pressed'), 'true')
    await page.locator('.ocean-raster').waitFor()
    const availability = await page.locator('.variable-availability').innerText()
    assert.match(availability, new RegExp(`Sea surface temperature ${sst}/264`))
    assert.match(availability, new RegExp(`Chlorophyll-a ${chlorophyll}/264`))
    await page.getByRole('button', { name: 'Next mapped month' }).click()
    assert.equal(await page.getByLabel('Observation month').inputValue(), '2016-01')
    await page.getByLabel('Year', { exact: true }).selectOption('2024')
    await page.getByLabel('Observation month').selectOption('2024-12')
    await page.getByRole('status').getByText('No spatial data for this month.').waitFor()
    await page.getByText('This month has no spatial layer.').waitFor()
    assert.equal(await page.locator('.ocean-raster').count(), 0)
  } finally { await page.close() }
})
