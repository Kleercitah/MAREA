import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { createServer } from 'vite'

let server
let browser
let origin
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
      if (path !== '/') await page.getByText('En desarrollo', { exact: true }).waitFor()
      await page.getByRole('button', { name: 'English' }).click()
      await page.reload()
      await page.getByRole('heading', { level: 1, name: new RegExp(en) }).waitFor()
      assert.equal(await page.locator('html').getAttribute('lang'), 'en')
      assert.equal(await page.title(), (path === '/' ? 'Home' : en) + ' · MAREA')
      if (path !== '/') await page.getByText('In development', { exact: true }).waitFor()
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
      assert.equal(await page.locator('nav a:visible').count(), 7)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      await page.locator('nav').getByRole('link', { name: path === '/' ? 'Inicio' : es, exact: true }).click()
      await page.getByRole('heading', { name: new RegExp(es), level: 1 }).waitFor()
      assert.equal(new URL(page.url()).pathname, path)
      assert.equal(await menu.getAttribute('aria-expanded'), 'false')
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    }
    await page.setViewportSize({ width: 1280, height: 800 })
    assert.equal(await page.locator('nav a:visible').count(), 7)
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
