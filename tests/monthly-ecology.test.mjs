import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'

const read = name => JSON.parse(readFileSync('public/data/' + name + '.json', 'utf8'))
const datasets = { sst: read('sst-monthly'), 'chlorophyll-a': read('chlorophyll-monthly') }
const analysis = read('marea-analysis')
const oni = read('enso-oni')
let server, readIndicator, interpretMonth, ensoPhase, combination, species, speciesReadings, labels

before(async () => {
  server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, logLevel: 'error' })
  ;({ readIndicator, ensoPhase, combination } = await server.ssrLoadModule('/src/features/signals/regionalMonth.ts'))
  const module = await server.ssrLoadModule('/src/features/signals/signals.ts')
  interpretMonth = module.interpretMonth
  speciesReadings = module.speciesReadings
  species = Object.keys(module.speciesReadings)
  labels = (await server.ssrLoadModule('/src/features/signals/labels.ts')).signalLabels
})
after(async () => { await server?.close() })

// These input observations exist only in this test.
function fixture(variable, anomaly, quality = 'valid') {
  const ref = variable === 'sst' ? 24 : 0.4
  const spread = variable === 'sst' ? 1 : 0.1
  const date = '2015-12-01'
  return readIndicator(variable, '2015-12', {
    observations: [{ date, value: anomaly == null ? null : ref + anomaly, qualityFlag: quality }],
    coverage: { oceanCells: 20, validCellsByMonth: [quality === 'insufficient' ? 2 : 18] },
  }, {
    climatology: [{ variableId: variable, months: [{ month: 12, mean: ref, standardDeviation: spread }] }],
    anomalies: [{ variableId: variable, observations: [{ date, absolute: anomaly, percent: null }] }],
  })
}

test('each species responds independently to temperature and chlorophyll in all four quadrants', () => {
  const scenarios = [[2,-0.2,'warm-low'],[-2,0.2,'cool-high'],[2,0.2,'warm-high'],[-2,-0.2,'cool-low']]
  const bySpecies = new Map(species.map(id => [id, new Set()]))
  for (const [heat, pigment, expected] of scenarios) {
    const sample = { month:'2015-12', sst:fixture('sst',heat), chlorophyll:fixture('chlorophyll-a',pigment), phase:'outside' }
    assert.equal(combination(sample), expected)
    const responses = new Set()
    for (const id of species) {
      const result = interpretMonth(id, sample, 'es')
      responses.add(result.ecology)
      bySpecies.get(id).add(result.ecology)
      assert.ok(result.mechanism && result.historical && result.ecosystem && result.uncertainty && result.references.length)
    }
    assert.equal(responses.size, 5)
  }
  for (const texts of bySpecies.values()) assert.equal(texts.size, 4)
})

test('near-reference values, equality, quality flags and missing variables retain their meaning', () => {
  const sample = { month:'2015-12', sst:fixture('sst',0.2), chlorophyll:fixture('chlorophyll-a',-0.02), phase:'el-nino' }
  assert.equal(combination(sample), 'mixed')
  assert.equal(sample.sst.category, 'near')
  assert.equal(fixture('sst',1).category, 'moderate')
  assert.equal(fixture('sst',2).category, 'large')
  assert.equal(combination({...sample,sst:fixture('sst',0),chlorophyll:fixture('chlorophyll-a',0.2)}),'equal-high')
  for (const id of species) {
    const reference = interpretMonth(id, sample, 'en')
    assert.match(reference.conditions,/No marked/)
    for (const key of ['sst','chlorophyll']) {
      const variable = sample[key].variable
      const incomplete = {...sample,[key]:fixture(variable,1,'insufficient')}
      const result = interpretMonth(id,incomplete,'en')
      assert.equal(combination(incomplete),null)
      assert.equal(incomplete[key].coverage,10)
      assert.equal(incomplete[key].anomaly,null)
      assert.equal(incomplete[key].value,null)
      assert.match(result.ecology,/coverage is insufficient/)
      assert.equal(result.historical,reference.historical)
      assert.notEqual(result.ecology,reference.ecology)
    }
    const absent = {...sample, sst:fixture('sst',null,'month-absent'), chlorophyll:fixture('chlorophyll-a',null,'month-absent')}
    assert.match(interpretMonth(id,absent,'en').ecology,/No valid SST comparison.*No valid chlorophyll-a comparison/)
  }
})

test('all published monthly readings use original observations, climatologies, anomalies and ONI dates', () => {
  for (const row of datasets.sst.observations) {
    const month = row.date.slice(0,7)
    const phase = ensoPhase(month,oni)
    const expectedEvent = oni.episodes.find(e => e.start <= month && month <= e.end)
    assert.equal(phase,expectedEvent?.phase ?? 'outside')
    const sample = { month, phase }
    for (const [variable,series] of Object.entries(datasets)) {
      const item = readIndicator(variable,month,series,analysis)
      const original = series.observations.find(o=>o.date===row.date)
      assert.equal(item.value,original.value)
      assert.equal(item.quality,original.qualityFlag)
      assert.equal(item.reference,analysis.climatology.find(c=>c.variableId===variable).months.find(m=>m.month===Number(month.slice(5))).mean)
      assert.equal(item.anomaly,analysis.anomalies.find(a=>a.variableId===variable).observations.find(o=>o.date===row.date).absolute)
      sample[variable==='sst'?'sst':'chlorophyll'] = item
    }
    for (const id of species) {
      const result = interpretMonth(id,sample,'en')
      assert.equal(result.month,month)
      assert.deepEqual(result.observations,[sample.sst,sample.chlorophyll])
      assert.ok(result.period && result.ecology)
    }
  }
  assert.equal(ensoPhase('1983-01',undefined),'unavailable')
  assert.equal(ensoPhase('2015-12',oni),'el-nino')
  assert.equal(ensoPhase('2010-10',oni),'la-nina')
  const sample = {month:'2015-12', sst:fixture('sst',2),chlorophyll:fixture('chlorophyll-a',0.2)}
  const texts = ['el-nino','la-nina','outside','unavailable'].map(phase=>interpretMonth(species[2],{...sample,phase},'en').context)
  assert.equal(new Set(texts).size,4)
})

test('the reading names the variable beyond its usual variation and the one that stays near its reference', () => {
  const at = (sst, chlorophyll, phase = 'el-nino') => ({ month: '2015-07', phase, sst, chlorophyll })
  // 1. SST muy por encima de su variación habitual; clorofila dentro de ella.
  const warmOnly = at(fixture('sst', 2), fixture('chlorophyll-a', -0.02))
  assert.equal(combination(warmOnly), 'warm-equal')
  for (const id of species) {
    const result = interpretMonth(id, warmOnly, 'es')
    assert.equal(result.conditions, labels.es.combinations['warm-equal'])
    assert.equal(result.ecology, speciesReadings[id].warm.es)
    assert.doesNotMatch(result.conditions, /menos clorofila/)
  }
  // 2. Ambas variables superan su variación mensual habitual, en sentidos opuestos.
  const warmLow = at(fixture('sst', 2), fixture('chlorophyll-a', -0.2))
  assert.equal(combination(warmLow), 'warm-low')
  for (const id of species) {
    assert.equal(interpretMonth(id, warmLow, 'es').ecology,
      speciesReadings[id].warm.es + ' ' + speciesReadings[id].low.es)
  }
  // 3. SST fría y clorofila elevada.
  const coolHigh = at(fixture('sst', -2), fixture('chlorophyll-a', 0.2))
  assert.equal(combination(coolHigh), 'cool-high')
  for (const id of species) {
    assert.equal(interpretMonth(id, coolHigh, 'es').ecology,
      speciesReadings[id].cool.es + ' ' + speciesReadings[id].high.es)
  }
  // 4. SST cálida y clorofila elevada.
  const warmHigh = at(fixture('sst', 2), fixture('chlorophyll-a', 0.2))
  assert.equal(combination(warmHigh), 'warm-high')
  for (const id of species) {
    assert.equal(interpretMonth(id, warmHigh, 'es').ecology,
      speciesReadings[id].warm.es + ' ' + speciesReadings[id].high.es)
  }
  // 5. SST fría y clorofila reducida.
  const coolLow = at(fixture('sst', -2), fixture('chlorophyll-a', -0.2))
  assert.equal(combination(coolLow), 'cool-low')
  for (const id of species) {
    assert.equal(interpretMonth(id, coolLow, 'es').ecology,
      speciesReadings[id].cool.es + ' ' + speciesReadings[id].low.es)
  }
  // 6. Ambas cerca de su referencia: ninguna dirección forzada.
  const bothNear = at(fixture('sst', 0.2), fixture('chlorophyll-a', -0.02))
  assert.equal(combination(bothNear), 'mixed')
  for (const id of species) {
    assert.equal(interpretMonth(id, bothNear, 'es').ecology, speciesReadings[id].near.es)
  }
  // 7. Clorofila ausente: la SST se mantiene y la variable sin dato se nombra aparte.
  const absent = at(fixture('sst', 2), fixture('chlorophyll-a', null, 'month-absent'))
  assert.equal(combination(absent), null)
  for (const id of species) {
    const result = interpretMonth(id, absent, 'es')
    assert.equal(result.ecology,
      speciesReadings[id].warm.es + ' Sin comparación válida de clorofila-a para este mes.')
    assert.match(result.conditions, /clorofila-a sin comparación/)
  }
  // 8. Mes fuera de los episodios ENSO catalogados.
  const outside = at(fixture('sst', 2), fixture('chlorophyll-a', -0.02), 'outside')
  assert.equal(interpretMonth(species[0], outside, 'es').phaseText, 'Fuera de los episodios catalogados')
})
