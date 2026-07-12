import test from 'node:test'
import assert from 'node:assert/strict'
import { createFlatGraphicEq } from '../../src/lib/dsp/graphicEq.js'

test('creates deterministic 15-band and 31-band flat EQ definitions', () => {
  const fifteen = createFlatGraphicEq(15)
  const thirtyOne = createFlatGraphicEq(31)
  assert.equal(fifteen.length, 15)
  assert.equal(thirtyOne.length, 31)
  assert.ok(thirtyOne.every((band) => band.gainDb === 0 && band.enabled))
})

test('rejects unsupported graphic EQ modes', () => {
  assert.throws(() => createFlatGraphicEq(10), /mode must be 15 or 31/)
})
