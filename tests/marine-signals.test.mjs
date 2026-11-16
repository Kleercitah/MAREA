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

// Las cinco especies aprobadas: nombre científico, nombre común en inglés y en español.
const species = [
  ['Spheniscus mendiculus', 'Galápagos penguin', 'Pingüino de Galápagos'],
  ['Amblyrhynchus cristatus', 'Marine iguana', 'Iguana marina'],
  ['Zalophus wollebaeki', 'Galápagos sea lion', 'Lobo marino de Galápagos'],
  ['Nannopterum harrisi', 'Flightless cormorant', 'Cormorán no volador'],
  ['Arctocephalus galapagoensis', 'Galápagos fur seal', 'Lobo peletero de Galápagos'],
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

test('Marine Life shows the five approved species with taxonomy, credits and a photo-illustration switch', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ABORTED')) errors.push(request.url()) })
  try {
    await page.goto(new URL('/marine-life', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    await page.getByRole('heading', { level: 1, name: 'Marine Life' }).waitFor()
    assert.equal(await page.locator('.species-index li').count(), 5)
    assert.deepEqual(await page.locator('.index-scientific').allTextContents(), species.map(item => item[0]))
    assert.equal(await page.locator('.portrait-switch').getAttribute('aria-label'), 'Portrait view')

    for (const [scientific, common, spanish] of species) {
      const selector = page.locator('.species-index button', { hasText: scientific })
      if (scientific === 'Arctocephalus galapagoensis') await selector.press('Enter')
      else await selector.click()
      await page.locator('#species-title').getByText(common, { exact: true }).waitFor()
      assert.equal(await page.locator('.scientific-name').innerText(), scientific)
      assert.equal(await page.locator('.taxonomy li').count(), 3)
      assert.match(await page.locator('.taxonomy-source a').getAttribute('href'), /marinespecies\.org/)
      assert.equal(await page.locator('.taxonomy-source a').getAttribute('target'), '_blank')
      assert.ok(await page.locator('.species-references li').count() >= 3)
      assert.ok(await page.locator('.species-references a[target="_blank"]').count() >= 3)
      assert.equal(await page.locator('.species-section').count() >= 5, true)
      const changes = ['77%', '60–70%', '23.9%', '49%', '38.1%']
      const evidence = page.locator('.biological-evidence')
      assert.ok((await evidence.innerText()).includes(changes[species.findIndex(item=>item[0]===scientific)]))
      await evidence.locator('summary').press('Enter')
      assert.ok((await evidence.locator('details p').innerText()).includes(changes[species.findIndex(item => item[0] === scientific)]))
      assert.ok(await evidence.locator('a').isVisible())
      assert.equal(await page.locator('.episode-history li a').count(), 3)
      const counts = ['435', '1982 hatchling cohort', '19 survived', '869', '18 pups']
      assert.ok((await page.locator('.episode-history').innerText()).includes(counts[species.findIndex(item => item[0] === scientific)]))
      // «Del océano al ecosistema»: síntesis editorial estática, sin nodos ni panel interactivo.
      assert.equal(await page.locator('.path-steps > div').count(), 5)
      assert.equal(await page.locator('.eco-path button').count(), 0)
      assert.ok(await page.locator('.path-steps a[target="_blank"]').count() >= 3)
      await page.locator('.path-steps').getByText('Still to be tested').waitFor()
      // Fotografía auténtica con crédito, lugar, licencia y enlace de origen.
      const portrait = page.locator('.portrait-frame img')
      assert.match(await portrait.getAttribute('src'), /\/art\/species\/photos\/.+\.jpg$/)
      await portrait.evaluate(img => img.decode())
      const meta = await page.locator('.portrait-meta').innerText()
      assert.match(meta, /Credit/)
      assert.match(meta, /Place taken/)
      assert.match(meta, /Licence/)
      assert.match(meta, /Original image/)
      assert.ok((await page.locator('.portrait-meta strong').innerText()).trim().length > 0)
      assert.equal(await page.locator('.portrait-meta a[href*="creativecommons.org"]').count(), 1)
      // Ilustración: identificada como tal, nunca presentada como fotografía.
      await page.locator('.portrait-switch button', { hasText: 'Illustration' }).click()
      assert.match(await page.locator('.portrait-frame img').getAttribute('src'), /\/art\/species\/illustrations\/.+\.png$/)
      await portrait.evaluate(img => img.decode())
      await page.locator('.portrait-meta').getByText('It is not a photograph.').waitFor()
      await page.locator('.portrait-switch button', { hasText: 'Photograph' }).click()
      assert.match(await page.locator('.portrait-frame img').getAttribute('src'), /\/art\/species\/photos\/.+\.jpg$/)
      // Modelo 3D: tercera opción del visor. El motor 3D y el GLB solo se cargan al elegir «Modelo».
      assert.equal(await page.locator('.portrait-switch button').count(), 3)
      await page.locator('.portrait-switch button', { hasText: '3D model' }).click()
      await page.locator('.model-viewer').waitFor()
      assert.equal(await page.locator('.portrait-frame img').count(), 0)
      // El visor se rotula como representación ilustrativa, no como fotografía real.
      await page.locator('.model-viewer-hint').waitFor()
      assert.ok((await page.locator('.model-viewer-hint').innerText()).trim().length > 0)
      assert.equal(await page.locator('.species-model').count(), 0)
      await page.locator('.portrait-switch button', { hasText: 'Photograph' }).click()
      assert.match(await page.locator('.portrait-frame img').getAttribute('src'), /\/art\/species\/photos\/.+\.jpg$/)
      // Español: misma ficha en el otro idioma.
      await page.getByRole('button', { name: 'Español' }).click()
      await page.locator('#species-title').getByText(spanish, { exact: true }).waitFor()
      await page.getByRole('button', { name: 'English' }).click()
      await page.locator('#species-title').getByText(common, { exact: true }).waitFor()
    }

    await page.goto(new URL('/marine-life?species=Chelonia%20mydas',origin).href)
    await page.getByRole('status').getByText(/current catalogue/).waitFor()
    assert.equal(await page.locator('#species-title').innerText(),'Galápagos penguin')
    await page.setViewportSize({ width: 360, height: 760 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('Habitat Signals shows the selected species, its habitat gallery and the regional reading', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ABORTED')) errors.push(request.url()) })
  try {
    await page.goto(new URL('/habitat-signals?species=Spheniscus%20mendiculus&month=2015-12', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    await page.getByRole('heading', { level: 1, name: 'Habitat Signals' }).waitFor()

    // Aclaración breve junto a los indicadores, sin bloques de advertencia repetidos.
    await page.getByText('Regional values for the Galápagos ocean').waitFor()
    await page.locator('.signals-hint summary').getByText(/Why doesn’t the value change/).waitFor()

    // Especie seleccionada e identidad, con acceso a la ficha completa.
    assert.equal(await page.locator('#species-name').innerText(), 'Galápagos penguin')
    assert.equal(await page.locator('.species-scientific').innerText(), 'Spheniscus mendiculus')
    assert.match(await page.locator('.species-sheet').getAttribute('href'), /marine-life\?species=Spheniscus%20mendiculus/)

    // Hábitat visual: descripción breve única y galería protagonista.
    assert.equal(await page.locator('.signal-habitat h2').innerText(), 'Habitat it uses')
    assert.ok((await page.locator('.habitat-lead').innerText()).trim().length > 40)
    assert.equal(await page.locator('.gallery-thumbs button').count(), 3)
    assert.equal(await page.locator('.gallery-counter').innerText(), '1 of 3')
    const gallerySources = []
    for (const index of [0, 1, 2]) {
      await page.locator('.gallery-thumbs button').nth(index).click()
      const photo = page.locator('.gallery-stage img')
      await photo.evaluate(img => img.decode())
      assert.ok(await photo.evaluate(img => img.naturalWidth > img.naturalHeight))
      gallerySources.push(await photo.getAttribute('src'))
    }
    assert.equal(gallerySources[0], '/art/habitats/penguin-fernandina-pair.jpg')
    assert.notEqual(gallerySources[0], '/art/species/photos/spheniscus-mendiculus.jpg')
    assert.equal(new Set(gallerySources).size, 3)
    await page.locator('.gallery-thumbs button').nth(0).click()
    assert.equal(await page.locator('.gallery-tag[data-galapagos="true"]').count(), 1)
    assert.equal(await page.locator('.gallery-credit a[href*="creativecommons.org"]').count(), 1)
    assert.equal(await page.locator('.gallery-credit a[target="_blank"]').count(), 2)

    // Navegación anterior/siguiente y con teclado.
    await page.locator('.gallery-nav button[aria-label="Next image"]').click()
    assert.equal(await page.locator('.gallery-counter').innerText(), '2 of 3')
    await page.locator('.habitat-gallery').focus()
    await page.keyboard.press('ArrowLeft')
    assert.equal(await page.locator('.gallery-counter').innerText(), '1 of 3')

    // Visor ampliado y cierre con Escape.
    await page.locator('.gallery-zoom').click()
    await page.locator('.gallery-viewer').waitFor()
    await page.keyboard.press('Escape')
    assert.equal(await page.locator('.gallery-viewer').count(), 0)

    // La observación auténtica es regional: su valor no cambia al cambiar de especie,
    // mientras que la lectura ecológica y los escenarios sí se adaptan a la especie.
    const example = await page.locator('.signal-example .monthly-indicator[data-variable="sst"] .month-value').innerText()
    await page.getByLabel('Species', { exact: true }).selectOption('Amblyrhynchus cristatus')
    await page.locator('.signal-habitat[data-species="Amblyrhynchus cristatus"]').waitFor()
    assert.equal(await page.locator('.signal-example .monthly-indicator[data-variable="sst"] .month-value').innerText(), example)

    // Lo que sí cambia por especie: identidad, hábitat, lectura e información ampliada.
    assert.equal(await page.locator('#species-name').innerText(), 'Marine iguana')
    assert.ok((await page.locator('.signal-reading h2').innerText()).includes('marine iguana'))
    await page.locator('.signal-about summary').click()
    const iguanaContext = await page.locator('.species-context dd').allTextContents()
    assert.equal(iguanaContext.length, 5)

    for (const [id] of species) {
      await page.getByLabel('Species', {exact:true}).selectOption(id)
      await page.locator('.signal-habitat[data-species="'+id+'"]').waitFor()
      for (let i=0;i<3;i++) {
        await page.locator('.gallery-thumbs button').nth(i).click()
        await page.locator('.gallery-stage img').evaluate(img=>img.decode())
        assert.ok(await page.locator('.gallery-stage img').evaluate(img=>img.naturalWidth>=600))
        assert.equal(await page.locator('.gallery-tag[data-galapagos="true"]').count(),1)
        assert.match(await page.locator('.gallery-credit a').last().getAttribute('href'),/commons.wikimedia.org/)
      }
    }
    // Versión en español de la aclaración, la lectura y la etiqueta regional.
    await page.getByRole('button', { name: 'Español' }).click()
    await page.getByText(/no mediciones individuales del hábitat/).waitFor()
    await page.locator('.signal-reading h2').getByText(/lobo peletero de Galápagos/).waitFor()
    await page.locator('.gallery-tag[data-galapagos="true"]').waitFor()

    await page.setViewportSize({ width: 768, height: 1024 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.setViewportSize({ width: 360, height: 760 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('Habitat Signals offers general scenarios, no date selectors and a real published example', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const read = file => JSON.parse(readFileSync('public/data/' + file + '.json', 'utf8'))
  const sst = read('sst-monthly')
  const number = (value, digits) => value.toLocaleString('en', { maximumFractionDigits: digits })
  try {
    await page.goto(new URL('/habitat-signals?species=Spheniscus%20mendiculus&month=2015-12', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.signals-scenarios').waitFor()

    // El explorador educativo ya no ofrece selectores de año ni de mes.
    assert.equal(await page.locator('.signals-controls select').count(), 1)
    assert.equal(await page.getByLabel('Year', { exact: true }).count(), 0)
    assert.equal(await page.getByLabel('Observation month', { exact: true }).count(), 0)
    assert.equal(await page.locator('.signals-grid, .signal-panel').count(), 0)

    // Los controles son escenarios generales: dos ejes, seis opciones y ninguna fecha.
    assert.equal(await page.locator('.scenario-group').count(), 2)
    assert.equal(await page.locator('.scenario-options button').count(), 6)
    assert.equal(await page.locator('.scenario-options button[aria-pressed="true"]').count(), 2)
    assert.match(await page.locator('.scenario-note').innerText(), /not a prediction/)
    // Cambiar de escenario no genera ninguna selección mensual ficticia.
    await page.locator('.scenario-options button', { hasText: 'Cooling' }).click()
    assert.equal(await page.getByLabel('Observation month', { exact: true }).count(), 0)
    assert.equal(new URL(page.url()).searchParams.get('month'), '2015-12')

    // La escena abstracta del ecosistema se retiró por completo de la experiencia.
    assert.equal(await page.locator('.signal-scene, .scene, .scene-node, .scene-detail, .scene-legend').count(), 0)
    assert.equal(await page.getByRole('heading', { name: 'Ecosystem scene' }).count(), 0)
    assert.ok(existsSync('public/art/species/models'), 'the model folder is prepared')

    // La observación auténtica refleja el mismo valor que publica el motor para su mes real.
    const month = await page.locator('.example-month strong').innerText()
    const row = sst.observations.find(item => item.date === month + '-01')
    assert.equal(await page.locator('.signal-example .monthly-indicator[data-variable="sst"] .month-value').innerText(),
      number(row.value, 2) + ' °C')

    // Los criterios estadísticos se documentan y se declaran ajenos a la fisiología.
    await page.locator('.signal-methods summary').click()
    await page.getByText(/not physiological thresholds/).waitFor()
    await page.getByText(/near the reference when/).waitFor()

    // Navegación por teclado en el selector de especie.
    const speciesSelect = page.getByLabel('Species', { exact: true })
    await speciesSelect.focus()
    await page.keyboard.press('End')
    await page.locator('.signal-reading h2').getByText('Galápagos fur seal').waitFor()
    assert.equal(await speciesSelect.inputValue(), 'Arctocephalus galapagoensis')
    assert.match(await page.locator('.signal-links a').first().getAttribute('href'), /variable=sst/)

    // i18n y ámbito regional: nunca se presenta como riesgo ni como el punto exacto del animal.
    await page.getByRole('button', { name: 'Español' }).click()
    await page.getByRole('heading', { level: 1, name: 'Señales de hábitat' }).waitFor()
    await page.getByText(/no mediciones individuales del hábitat/).waitFor()
    assert.equal(await page.getByText(/riesgo de muerte|especie en peligro inmediato/i).count(), 0)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  } finally { await page.close() }
})

test('new profiles, galleries and published biological sources at three widths',async()=>{
  const page = await browser.newPage()
  try {
    for (const width of [360,768,1280]) {
      await page.setViewportSize({width,height:850})
      for (const [route,id,selector] of [
        ['marine-life','Nannopterum harrisi','.portrait-frame'],
        ['habitat-signals','Arctocephalus galapagoensis','.gallery-stage']
      ]) {
        await page.goto(new URL('/'+route+'?species='+encodeURIComponent(id),origin).href)
        const panel = page.locator(selector)
        await panel.locator('img').evaluate(img=>img.decode())
        await panel.scrollIntoViewIfNeeded()
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
        await page.screenshot({path:join(tmpdir(),'marea-bio-'+route+'-'+width+'.png')})
        if (route === 'marine-life') {
          await page.locator('.eco-path').scrollIntoViewIfNeeded()
          await page.screenshot({path:join(tmpdir(),'marea-mechanism-'+width+'.png')})
        }
      }
    }
    // El enlace profundo abre la ficha de la especie directamente en su mecanismo de campo.
    await page.goto(new URL('/marine-life?species=Arctocephalus%20galapagoensis#mechanism', origin).href)
    await page.locator('#mechanism').waitFor()
    assert.equal(new URL(page.url()).hash, '#mechanism')
    assert.equal(await page.locator('#species-title').innerText(), 'Lobo peletero de Galápagos')
    assert.ok(await page.locator('#mechanism').evaluate(el => document.activeElement === el))
    await page.goto(new URL('/habitat-signals?species=Mobula%20birostris',origin).href)
    await page.getByRole('status').getByText(/catálogo/).waitFor()
    assert.equal(await page.locator('#species-name').innerText(),'Pingüino de Galápagos')
    await page.goto(new URL('/scientific-report',origin).href)
    const section=page.locator('#report-interpretation')
    for (const text of ['77 %','60–70 %','23,9 %','49 %','38,1 %','Santa Cruz']) {
      await section.getByText(text,{exact:false}).first().waitFor()
    }
  } finally {await page.close()}
})

test('monthly species readings share dates, evidence and navigation across both views', async () => {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  try {
    await page.goto(new URL('/marine-life?species=Spheniscus%20mendiculus&month=2015-12', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    const ocean = page.locator('.species-month')
    await ocean.getByText('2015-12 · ONI · El Niño').waitFor()
    assert.match(await ocean.locator('.month-value').first().innerText(), /26.93/)
    assert.match(await ocean.locator('.month-value').last().innerText(), /0.166/)
    const warm = await ocean.locator('.month-ecology').innerText()
    await page.getByLabel('Year', { exact:true }).selectOption('2010')
    await page.getByLabel('Observation month', {exact:true}).selectOption('2010-10')
    await ocean.getByText('2010-10 · ONI · La Niña').waitFor()
    assert.notEqual(await ocean.locator('.month-ecology').innerText(),warm)
    assert.match(await ocean.locator('.month-value').first().innerText(), /21.39/)
    assert.match(await ocean.locator('.month-value').last().innerText(), /0.422/)
    await page.locator('.species-index button').first().press('ArrowRight')
    await page.locator('#species-title').getByText('Marine iguana').waitFor()
    assert.equal(new URL(page.url()).searchParams.get('month'),'2010-10')
    await page.getByRole('button', { name:'Español' }).click()
    const text = await ocean.locator('.month-ecology').innerText()
    assert.match(text, /algas/)
    assert.equal(await ocean.locator('a[href*="variable=chlorophyll-a"]').getAttribute('href'), '/ocean-explorer?variable=chlorophyll-a&month=2010-10')
    // Habitat Signals ya no participa en la navegación mensual: abre la especie y
    // ofrece su experiencia general, sin heredar ni inventar un mes.
    await ocean.getByRole('link', {name:/Ver señales de hábitat/}).click()
    await page.locator('.signal-species[data-species="Amblyrhynchus cristatus"]').waitFor()
    assert.equal(await page.getByLabel('Observation month', {exact:true}).count(), 0)
    assert.equal(await page.locator('#species-name').innerText(),'Iguana marina')
    await page.locator('.species-sheet').click()
    await page.locator('#species-title').getByText('Iguana marina').waitFor()
    for (const width of [360,390,768,1280]) {
      await page.setViewportSize({width,height:850})
      const cards = page.locator('.species-index button')
      assert.equal(await cards.count(),5)
      for (const img of await cards.locator('img').all()) {
        await img.evaluate(el=>el.decode())
        const box = await img.boundingBox()
        assert.ok(box.width>=130 && box.height>=95)
      }
      await cards.first().press('End')
      await page.locator('#species-title').getByText('Lobo peletero de Galápagos').waitFor()
      const last = await cards.last().boundingBox()
      assert.ok(last.x >= -1 && last.x + last.width <= width + 1)
      assert.match(await page.getByLabel('Mes de observación', { exact: true }).inputValue(), /^\d{4}-\d{2}$/)
      const bounds = await page.locator('.editorial-layout:visible').first().locator('.editorial-image').boundingBox()
      assert.ok(Math.abs(bounds.width-bounds.height)<1)
      assert.equal(await page.locator('.leaflet-container, .ocean-map, canvas').count(),0)
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
      await page.locator('.species-index').scrollIntoViewIfNeeded()
      await page.screenshot({path:join(tmpdir(),'marea-cards-'+width+'.png')})
      await page.locator('.monthly-indicators').scrollIntoViewIfNeeded()
      await page.screenshot({path:join(tmpdir(),'marea-ocean-reading-'+width+'.png')})
      await page.locator('.editorial-layout:visible').first().scrollIntoViewIfNeeded()
      await page.screenshot({path:join(tmpdir(),'marea-square-'+width+'.png')})
    }
    await page.getByLabel('Año', {exact:true}).selectOption('2024')
    await page.getByLabel('Mes de observación', {exact:true}).selectOption('2024-12')
    await ocean.getByText(/Sin comparación válida de clorofila-a/).waitFor()
    await page.locator('.species-section summary').getByText('Alimentación', { exact:true }).click()
    const diagram = page.locator('.editorial-layout:visible svg')
    assert.ok(await diagram.isVisible())
    assert.match(await diagram.getAttribute('aria-label'), /alimentación/i)
    const square = await diagram.boundingBox()
    assert.ok(Math.abs(square.width-square.height)<1)
    assert.match(await ocean.locator('.month-value').last().innerText(),/—/)
    assert.deepEqual(errors,[])
  } finally { await page.close() }
})

test('rapid month changes keep the published values in Marine Life without inventing a date elsewhere', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const sst = JSON.parse(readFileSync('public/data/sst-monthly.json', 'utf8'))
  const show = value => value.toLocaleString('en', { maximumFractionDigits: 2 })
  try {
    await page.goto(new URL('/marine-life?species=Spheniscus%20mendiculus&month=2015-12', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    const ocean = page.locator('.species-month')
    await ocean.getByText('2015-12 · ONI').waitFor()
    await page.getByLabel('Year', { exact: true }).selectOption('2024')
    const monthSelect = page.getByLabel('Observation month', { exact: true })
    // Cambios rápidos entre meses consecutivos: el estado final corresponde al último mes elegido.
    for (const value of ['2024-02', '2024-03', '2024-04', '2024-11', '2024-12']) await monthSelect.selectOption(value)
    await ocean.getByText('2024-12 · ONI').waitFor()
    assert.equal(await monthSelect.inputValue(), '2024-12')

    // Diciembre de 2024: la SST se muestra aunque la clorofila-a no tenga observación.
    const december = sst.observations.find(item => item.date === '2024-12-01')
    const temperature = ocean.locator('.monthly-indicator[data-variable="sst"] .month-value')
    assert.ok((await temperature.innerText()).includes(show(december.value)))
    assert.match(await ocean.locator('.monthly-indicator[data-variable="chlorophyll-a"] .month-value').innerText(), /—/)
    assert.match(await ocean.locator('.month-ecology').innerText(), /No valid chlorophyll-a comparison/)

    // Enero de 2024 también carece de clorofila-a y conserva la SST.
    await monthSelect.selectOption('2024-01')
    await ocean.getByText('2024-01 · ONI').waitFor()
    const january = sst.observations.find(item => item.date === '2024-01-01')
    assert.ok((await temperature.innerText()).includes(show(january.value)))

    // Habitat Signals ya no hereda ni inventa un mes: ignora el enlace antiguo y
    // muestra su propia observación auténtica publicada, sin selectores de fecha.
    await page.goto(new URL('/habitat-signals?species=Spheniscus%20mendiculus&month=2024-01', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.signal-example .monthly-indicator[data-variable="sst"]').waitFor()
    assert.equal(await page.getByLabel('Observation month', { exact: true }).count(), 0)
    const exampleMonth = await page.locator('.example-month strong').innerText()
    assert.notEqual(exampleMonth, '2024-01')
    const exampleRow = sst.observations.find(item => item.date === exampleMonth + '-01')
    assert.equal(await page.locator('.signal-example .monthly-indicator[data-variable="sst"] .month-value').innerText(),
      show(exampleRow.value) + ' °C')
  } finally { await page.close() }
})

test('Marine Life and Ocean Explorer keep the same month while Habitat Signals shares the published bundle', async () => {
  const read = file => JSON.parse(readFileSync('public/data/' + file + '.json', 'utf8'))
  const sst = read('sst-monthly')
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ABORTED')) errors.push(request.url()) })
  const number = value => value.toLocaleString('en', { maximumFractionDigits: 2 })
  try {
    // 1. Marine Life: valor regional, unidades y enlace que conserva especie y mes.
    await page.goto(new URL('/marine-life?species=Spheniscus%20mendiculus&month=2015-12', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    const ocean = page.locator('.species-month')
    const row = sst.observations.find(item => item.date === '2015-12-01')
    await ocean.getByText(number(row.value) + ' °C', { exact: false }).first().waitFor()
    const explored = await ocean.locator('.monthly-indicator[data-variable="sst"] a').getAttribute('href')
    assert.equal(explored, '/ocean-explorer?variable=sst&month=2015-12')
    assert.ok((await ocean.locator('.monthly-scope').innerText()).includes('Regional mean'))

    // 2. Habitat Signals: sin selectores de fecha, comparte el mismo conjunto publicado
    //    en su observación auténtica.
    await page.goto(new URL('/habitat-signals?species=Spheniscus%20mendiculus&month=2015-12', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.signal-example .monthly-indicator[data-variable="sst"]').waitFor()
    assert.equal(await page.getByLabel('Observation month', { exact: true }).count(), 0)
    const exampleMonth = await page.locator('.example-month strong').innerText()
    const exampleRow = sst.observations.find(item => item.date === exampleMonth + '-01')
    assert.equal(await page.locator('.signal-example .monthly-indicator[data-variable="sst"] .month-value').innerText(),
      number(exampleRow.value) + ' °C')

    // 3. Ocean Explorer: la misma fuente, la misma unidad y el mismo mes conservado por el enlace.
    await page.goto(new URL(explored, origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.regional-value').waitFor()
    const monthField = page.getByLabel('Observation month')
    // Las opciones dependen de la serie publicada: esperar a que el mes solicitado exista.
    await monthField.locator('option[value="2015-12"]').waitFor({ state: 'attached' })
    assert.equal(await monthField.inputValue(), '2015-12')
    assert.equal(await page.locator('.regional-value').innerText(), number(row.value) + ' °C')

    // 4. Un mes sin observación de clorofila-a conserva el mismo estado en el explorador y en la ficha.
    await page.getByRole('button', { name: 'Chlorophyll-a', exact: true }).click()
    await page.getByLabel('Year', { exact: true }).selectOption('2024')
    await page.getByLabel('Observation month').selectOption('2024-01')
    assert.equal(await page.locator('.regional-value').innerText(), 'No data')
    assert.equal(await page.locator('.data-panel dd').nth(1).innerText(), 'Missing month')
    await page.goto(new URL('/marine-life?species=Spheniscus%20mendiculus&month=2024-01', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    const missing = page.locator('.monthly-indicator[data-variable="chlorophyll-a"]')
    await missing.locator('.month-value').getByText('—').waitFor()
    assert.match(await missing.innerText(), /Missing month/)
    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('every deepening section of the five species shows a square visual that really loads', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('requestfailed', request => { if (!request.failure()?.errorText.includes('ABORTED')) errors.push(request.url()) })
  try {
    await page.goto(new URL('/marine-life', origin).href)
    await page.getByRole('button', { name: 'English' }).click()
    await page.locator('.species-index button').first().waitFor()

    for (const [scientific] of species) {
      await page.locator('.species-index button', { hasText: scientific }).click()
      await page.locator('.scientific-name').getByText(scientific, { exact: true }).waitFor()
      const sections = page.locator('.species-section')
      const total = await sections.count()
      assert.ok(total >= 5, scientific + ' keeps at least five chapters')
      for (let index = 0; index < total; index++) {
        const section = sections.nth(index)
        const title = scientific + ' · chapter ' + (index + 1)
        if (await section.getAttribute('open') === null) await section.locator('summary').click()
        const layout = section.locator('.editorial-layout').first()
        const figure = layout.locator('figure')
        assert.equal(await figure.count(), 1, title + ' has one visual')
        await figure.scrollIntoViewIfNeeded()
        const image = figure.locator('img.editorial-image')
        if (await image.count()) {
          // La fotografía debe decodificarse y tener píxeles reales, no solo existir en el DOM.
          await image.evaluate(element => element.decode())
          const pixels = await image.evaluate(element => [element.naturalWidth, element.naturalHeight])
          assert.ok(pixels[0] >= 600 && pixels[1] >= 400, title + ' photo is ' + pixels.join('×'))
          assert.equal(await image.evaluate(element => element.complete), true, title + ' photo finished loading')
        } else {
          const diagram = figure.locator('svg.editorial-image')
          assert.equal(await diagram.count(), 1, title + ' has an original diagram')
          assert.ok(await diagram.isVisible(), title + ' diagram is visible')
          assert.match(await diagram.getAttribute('aria-label'), /·/, title + ' diagram is labelled')
        }
        // Recorte cuadrado, de tamaño generoso y con el texto científico al lado.
        const square = await figure.locator('.editorial-image').boundingBox()
        assert.ok(square.width >= 160, title + ' visual is ' + square.width + 'px wide')
        assert.ok(Math.abs(square.width - square.height) < 1, title + ' visual is square')
        const copy = await layout.locator(':scope > div > p').first().innerText()
        assert.ok(copy.trim().length > 30, title + ' keeps its scientific text')
        const text = await layout.locator(':scope > div').first().boundingBox()
        if (index % 2 === 0) assert.ok(square.x < text.x, title + ' keeps the photo on the left')
        else assert.ok(square.x > text.x, title + ' moves the photo to the right')
        await page.screenshot({ path: join(tmpdir(), 'marea-chapter-' + index + '.png') })
      }

      // En móvil: una sola columna, imagen cuadrada y texto inmediatamente debajo.
      await page.setViewportSize({ width: 390, height: 844 })
      const first = sections.first()
      if (await first.getAttribute('open') === null) await first.locator('summary').click()
      const figure = first.locator('.editorial-layout figure')
      await figure.scrollIntoViewIfNeeded()
      const square = await figure.locator('.editorial-image').boundingBox()
      const copy = await first.locator('.editorial-layout > div').first().boundingBox()
      assert.ok(square.width >= 250 && Math.abs(square.width - square.height) < 1, scientific + ' mobile visual')
      assert.ok(copy.y > square.y + square.height - 2, scientific + ' puts the text below the visual')
      await page.setViewportSize({ width: 1280, height: 1000 })
    }

    assert.deepEqual(errors, [])
  } finally { await page.close() }
})

test('touch scrolling reveals the final illustrated species card on a phone', async () => {
  const page = await browser.newPage({viewport:{width:390,height:844}, isMobile:true, hasTouch:true})
  try {
    await page.goto(new URL('/marine-life?month=2015-12',origin).href)
    const list = page.locator('.species-index')
    await list.scrollIntoViewIfNeeded()
    const box = await list.boundingBox()
    const y = Math.round(box.y + box.height / 2)
    const client = await page.context().newCDPSession(page)
    for (let swipe = 0; swipe < 4; swipe++) {
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:325,y}]})
      for (const x of [270,210,150,90,40]) {
        await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]})
      }
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
    }
    await page.waitForFunction(() => {
      const card = document.querySelector('.species-index li:last-child').getBoundingClientRect()
      return card.left >= 0 && card.right <= innerWidth
    })
    await list.locator('button').last().tap()
    await page.locator('#species-title').getByText('Lobo peletero de Galápagos').waitFor()
    assert.equal(new URL(page.url()).searchParams.get('month'),'2015-12')
  } finally { await page.close() }
})
