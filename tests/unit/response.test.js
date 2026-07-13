import assert from 'node:assert/strict'
import test from 'node:test'
import { estimateResponse } from '../../src/lib/dsp/response.js'
test('response model is deterministic and recommends headroom for boosts', () => { const config = { preampDb: 0, graphicEq: { bands: [] }, parametricEq: { filters: [{ enabled: true, type: 'peak', frequencyHz: 1000, gainDb: 6, q: 1 }] } }; const result = estimateResponse(config); assert.equal(result.model, 'electrical_filter_estimate'); assert.ok(result.maximumBoostDb > 5); assert.ok(result.recommendedPreampDb < -6); assert.equal(result.clippingRisk, 'high') })
