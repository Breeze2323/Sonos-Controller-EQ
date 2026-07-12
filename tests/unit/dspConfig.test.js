import test from 'node:test'
import assert from 'node:assert/strict'
import { validateDspConfiguration } from '../../server/validation/dspConfig.js'

const valid = {
  schemaVersion: 1,
  enabled: true,
  preampDb: -4,
  graphicEq: { bands: [{ frequencyHz: 63, gainDb: 3, enabled: true }] },
  parametricEq: { filters: [{ type: 'peak', frequencyHz: 90, gainDb: -2, q: 1.4, enabled: true }] },
}

test('accepts a valid DSP configuration', () => {
  assert.deepEqual(validateDspConfiguration(valid), { ok: true, errors: [] })
})

test('rejects malformed and unsafe values', () => {
  const result = validateDspConfiguration({
    ...valid,
    preampDb: 2,
    parametricEq: { filters: [{ type: 'unknown', frequencyHz: Infinity, gainDb: 50, q: 0, enabled: 'yes' }] },
  })
  assert.equal(result.ok, false)
  assert.ok(result.errors.length >= 5)
})
