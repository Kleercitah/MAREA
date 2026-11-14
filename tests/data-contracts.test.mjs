import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import ts from 'typescript'

function validateContracts(file) {
  const bundle = JSON.parse(readFileSync(file, 'utf8'))
  const sample = resolve('tests/virtual-data-contract.ts')
  const source = `import type { DatasetMeta, Observation, Region } from '../src/data/contracts'
    const dataset: DatasetMeta = ${JSON.stringify(bundle.dataset)}
    const region: Region = ${JSON.stringify(bundle.region)}
    const observations: Observation[] = ${JSON.stringify(bundle.observations)}`
  const options = { strict: true, noEmit: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022 }
  const host = ts.createCompilerHost(options)
  const readFile = host.readFile.bind(host)
  host.readFile = path => resolve(path) === sample ? source : readFile(path)
  const program = ts.createProgram([sample], options, host)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  assert.equal(diagnostics.length, 0, ts.formatDiagnostics(diagnostics, host))
}

for (const variable of ['chlorophyll', 'sst']) {
  test(`${variable} JSON satisfies DatasetMeta, Region and Observation[]`, () => {
    validateContracts(`public/data/${variable}-monthly.json`)
  })
}
