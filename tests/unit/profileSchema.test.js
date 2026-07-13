import assert from 'node:assert/strict'
import test from 'node:test'
import { migrateProfile, migrateProfiles } from '../../src/lib/profileSchema.js'
test('legacy profile migration preserves identity and Sonos settings idempotently', () => { const legacy = { id: 'a', name: 'Movie', volume: 42, bass: 2, treble: -1, subwooferGain: 3, subwooferEnabled: true, nightMode: false, speechEnhancement: true }; const migrated = migrateProfile(legacy); assert.equal(migrated.profile.schemaVersion, 2); assert.equal(migrated.profile.sonos.volume, 42); assert.strictEqual(migrateProfile(migrated.profile).profile, migrated.profile) })
test('profile migration isolates malformed entries', () => { const result = migrateProfiles([{ id: 'a', name: 'ok' }, { nope: true }]); assert.equal(result.profiles.length, 1); assert.equal(result.rejected.length, 1) })
