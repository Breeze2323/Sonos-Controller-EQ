import test from 'node:test'
import assert from 'node:assert/strict'
import { assessHeadroom, estimateWorstCaseBoostDb, recommendPreampDb } from '../../src/lib/dsp/headroom.js'

const configuration = {
  preampDb: -7,
  graphicEq: { bands: [{ gainDb: 4, enabled: true }, { gainDb: -2, enabled: true }] },
  parametricEq: { filters: [{ gainDb: 2, enabled: true }, { gainDb: 8, enabled: false }] },
}

test('estimates a conservative sum of enabled positive gains', () => {
  assert.equal(estimateWorstCaseBoostDb(configuration), 6)
})

test('recommends negative preamp with safety margin', () => {
  assert.equal(recommendPreampDb(configuration, 1), -7)
})

test('assesses configured headroom', () => {
  assert.deepEqual(assessHeadroom(configuration, 1), {
    configuredPreampDb: -7,
    recommendedPreampDb: -7,
    sufficient: true,
    estimatedWorstCaseBoostDb: 6,
  })
})
