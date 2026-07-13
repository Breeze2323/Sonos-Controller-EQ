import assert from 'node:assert/strict'
import test from 'node:test'
import { parseRewText } from '../../server/rew/parse.js'
import { validateSourceCoverage } from '../../server/domain/sourceCoverage.js'
import { HttpSonosAdapter } from '../../server/services/sonos/HttpSonosAdapter.js'

test('REW parser normalizes supported filters and reports syntax lines', () => { const result = parseRewText('Preamp: -4 dB\nFilter 1: ON PK Fc 100 Hz Gain 3 dB Q 1.4'); assert.equal(result.ok, true); assert.equal(result.filters[0].type, 'peak'); assert.equal(result.preampDb, -4); assert.equal(parseRewText('bad').errors[0].line, 1) })
test('source coverage refuses unrecognized states', () => assert.equal(validateSourceCoverage({ browserAudio: 'processed' }).ok, false))
test('Sonos writes are disabled by default', async () => { const adapter = new HttpSonosAdapter(); assert.equal((await adapter.applySettings('Room', { loudness: true })).status, 'blocked') })
