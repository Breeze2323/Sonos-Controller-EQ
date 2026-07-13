import test from 'node:test'
import assert from 'node:assert/strict'
import { MockDspAdapter } from '../../server/services/dsp/MockDspAdapter.js'

const config = {
  schemaVersion: 1,
  enabled: true,
  preampDb: -3,
  graphicEq: { bands: [] },
  parametricEq: { filters: [] },
}

test('mock adapter applies, bypasses, and reports status without claiming live audio', async () => {
  const adapter = new MockDspAdapter()
  const applied = await adapter.applyConfiguration(config)
  assert.equal(applied.ok, true)
  assert.equal((await adapter.getConfiguration()).preampDb, -3)
  await adapter.bypass(true)
  const status = await adapter.getStatus()
  assert.equal(status.bypassed, true)
  assert.equal(status.liveAudioProcessed, false)
})

test('mock adapter rejects invalid configuration', async () => {
  const adapter = new MockDspAdapter()
  const result = await adapter.applyConfiguration({ schemaVersion: 99 })
  assert.equal(result.ok, false)
  assert.equal(result.applied, false)
})

test('mock adapter stages without changing the active configuration', async () => {
  const adapter = new MockDspAdapter()
  const staged = await adapter.stageConfiguration(config)
  assert.equal(staged.staged, true)
  assert.equal(staged.applied, false)
  assert.equal(await adapter.getConfiguration(), null)
  assert.equal((await adapter.getStatus()).hasStagedConfiguration, true)
})
