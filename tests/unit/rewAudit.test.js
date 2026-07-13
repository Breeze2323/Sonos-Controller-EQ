import assert from 'node:assert/strict'
import test from 'node:test'
import { appendRewAudit, createRewAuditEntry } from '../../src/lib/rewAudit.js'

const preview = { ok: true, importHash: 'a'.repeat(64), preampDb: -4, filters: [{ id: 'rew-1', enabled: true, type: 'peak', frequencyHz: 100, gainDb: 3, q: 1.4 }] }

test('REW audit persists normalized preview metadata without an apply claim', () => {
  const entry = createRewAuditEntry(preview, '2026-01-01T00:00:00.000Z')
  assert.equal(entry.applied, false)
  assert.equal(entry.liveAudioProcessed, false)
  assert.equal(entry.filterCount, 1)
  assert.notStrictEqual(entry.filters, preview.filters)
})

test('REW audit replaces duplicate imports and bounds retained history', () => {
  const one = appendRewAudit([], preview, '2026-01-01T00:00:00.000Z')
  const duplicate = appendRewAudit(one, preview, '2026-01-02T00:00:00.000Z')
  assert.equal(duplicate.length, 1)
  assert.equal(duplicate[0].createdAt, '2026-01-02T00:00:00.000Z')
})
