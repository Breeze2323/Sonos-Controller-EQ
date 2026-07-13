import { DEFAULT_SOURCE_COVERAGE } from '../../shared/domain/sourceCoverage.js'

export const PROFILE_SCHEMA_VERSION = 2

const LEGACY_SONOS_KEYS = [
  'volume',
  'bass',
  'treble',
  'subwooferGain',
  'subwooferEnabled',
  'nightMode',
  'speechEnhancement',
]

const SONOS_FIELD_MAP = {
  volume: 'volume',
  bass: 'bass',
  treble: 'treble',
  subwooferGain: 'subGain',
  subwooferEnabled: 'subEnabled',
  nightMode: 'nightMode',
  speechEnhancement: 'speechEnhancement',
}

function isProfile(value) {
  return value
    && typeof value === 'object'
    && !Array.isArray(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
}

function legacySonosFields(profile) {
  return Object.fromEntries(LEGACY_SONOS_KEYS.map((key) => {
    const sonosKey = SONOS_FIELD_MAP[key]
    return [key, profile[key] ?? profile.sonos?.[sonosKey]]
  }))
}

function sonosFromLegacy(profile) {
  return Object.fromEntries(
    Object.entries(SONOS_FIELD_MAP).map(([legacyKey, sonosKey]) => [sonosKey, profile[legacyKey]]),
  )
}

export function migrateProfile(profile) {
  if (!isProfile(profile)) return { ok: false, error: 'PROFILE_INVALID', profile }
  const hasFlatProjection = LEGACY_SONOS_KEYS.every((key) => Object.hasOwn(profile, key))
  if (profile.schemaVersion === PROFILE_SCHEMA_VERSION && hasFlatProjection) {
    return { ok: true, profile }
  }

  const flatSonos = legacySonosFields(profile)
  return {
    ok: true,
    profile: {
      ...profile,
      schemaVersion: PROFILE_SCHEMA_VERSION,
      id: profile.id,
      name: profile.name,
      // Transitional flat fields keep the existing editor and Sonos apply path compatible.
      ...flatSonos,
      scope: { sonosNative: true, beast2Dsp: false, ...profile.scope },
      sonos: { ...sonosFromLegacy(flatSonos), ...profile.sonos },
      dsp: {
        enabled: false,
        preampDb: 0,
        graphicEq: { bands: [] },
        parametricEq: { filters: [] },
        ...profile.dsp,
        sourceCoverage: { ...DEFAULT_SOURCE_COVERAGE, ...profile.dsp?.sourceCoverage },
      },
      metadata: { migratedFrom: profile.schemaVersion ?? 1, ...profile.metadata },
    },
  }
}

export function migrateProfiles(profiles) {
  const results = Array.isArray(profiles) ? profiles.map(migrateProfile) : []
  return {
    profiles: results.filter((result) => result.ok).map((result) => result.profile),
    rejected: results
      .map((result, index) => ({ ...result, index }))
      .filter((result) => !result.ok),
    persistedProfiles: results.map((result) => (result.ok ? result.profile : result.profile)),
  }
}

export function resolvePersistedProfiles(value, fallbackProfiles) {
  if (!Array.isArray(value)) {
    return {
      ...migrateProfiles(fallbackProfiles),
      persistedProfiles: value,
      rejected: [{ error: 'PROFILE_COLLECTION_INVALID', profile: value, index: null }],
    }
  }
  return migrateProfiles(value)
}

export function applyProfileUpdates(profile, updates) {
  const next = { ...profile, ...updates }
  if (profile.schemaVersion !== PROFILE_SCHEMA_VERSION) return next

  const sonosUpdates = Object.fromEntries(
    Object.entries(SONOS_FIELD_MAP)
      .filter(([legacyKey]) => Object.hasOwn(updates, legacyKey))
      .map(([legacyKey, sonosKey]) => [sonosKey, updates[legacyKey]]),
  )
  return { ...next, sonos: { ...profile.sonos, ...sonosUpdates } }
}
