import assert from 'node:assert/strict'
import test from 'node:test'
import {
  applyProfileUpdates,
  migrateProfile,
  migrateProfiles,
  resolvePersistedProfiles,
} from '../../src/lib/profileSchema.js'

const legacy = {
  id: 'a', name: 'Movie', volume: 42, bass: 2, treble: -1,
  subwooferGain: 3, subwooferEnabled: true, nightMode: false, speechEnhancement: true,
}

test('legacy profile migration preserves identity, Sonos settings, and the flat UI projection', () => {
  const migrated = migrateProfile(legacy)
  assert.equal(migrated.profile.schemaVersion, 2)
  assert.equal(migrated.profile.sonos.volume, 42)
  assert.equal(migrated.profile.volume, 42)
  assert.strictEqual(migrateProfile(migrated.profile).profile, migrated.profile)
})

test('profile migration preserves malformed array entries for recovery', () => {
  const invalid = { nope: true }
  const result = migrateProfiles([legacy, invalid])
  assert.equal(result.profiles.length, 1)
  assert.equal(result.rejected.length, 1)
  assert.strictEqual(result.persistedProfiles[1], invalid)
})

test('early v2 profiles regain the flat compatibility projection from canonical Sonos fields', () => {
  const earlyV2 = migrateProfile(legacy).profile
  for (const key of ['volume', 'bass', 'treble', 'subwooferGain', 'subwooferEnabled', 'nightMode', 'speechEnhancement']) {
    delete earlyV2[key]
  }
  const repaired = migrateProfile(earlyV2).profile
  assert.equal(repaired.volume, earlyV2.sonos.volume)
  assert.equal(repaired.subwooferGain, earlyV2.sonos.subGain)
  assert.equal(repaired.dsp.sourceCoverage.browserAudio, 'expected')
})

test('profile collection with a non-array stored value falls back without overwriting recoverable data', () => {
  const invalidStoreValue = { profiles: [legacy] }
  const result = resolvePersistedProfiles(invalidStoreValue, [legacy])
  assert.equal(result.profiles.length, 1)
  assert.strictEqual(result.persistedProfiles, invalidStoreValue)
  assert.equal(result.rejected[0].error, 'PROFILE_COLLECTION_INVALID')
})

test('profile updates synchronize flat Sonos fields with the canonical section', () => {
  const profile = migrateProfile(legacy).profile
  const updated = applyProfileUpdates(profile, { volume: 55, name: 'Loud Movie' })
  assert.equal(updated.volume, 55)
  assert.equal(updated.sonos.volume, 55)
  assert.equal(updated.name, 'Loud Movie')
})
