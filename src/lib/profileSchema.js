import { DEFAULT_SOURCE_COVERAGE } from '../../server/domain/sourceCoverage.js'

export const PROFILE_SCHEMA_VERSION = 2
export function migrateProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile) || typeof profile.id !== 'string' || typeof profile.name !== 'string') return { ok: false, error: 'PROFILE_INVALID', profile }
  if (profile.schemaVersion === PROFILE_SCHEMA_VERSION) return { ok: true, profile }
  return { ok: true, profile: { schemaVersion: PROFILE_SCHEMA_VERSION, id: profile.id, name: profile.name, scope: { sonosNative: true, beast2Dsp: false }, sonos: { volume: profile.volume, bass: profile.bass, treble: profile.treble, subGain: profile.subwooferGain, subEnabled: profile.subwooferEnabled, nightMode: profile.nightMode, speechEnhancement: profile.speechEnhancement }, dsp: { enabled: false, preampDb: 0, graphicEq: { bands: [] }, parametricEq: { filters: [] }, sourceCoverage: { ...DEFAULT_SOURCE_COVERAGE } }, metadata: { migratedFrom: profile.schemaVersion ?? 1 }, ...Object.fromEntries(Object.entries(profile).filter(([key]) => !['id', 'name', 'volume', 'bass', 'treble', 'subwooferGain', 'subwooferEnabled', 'nightMode', 'speechEnhancement'].includes(key)) } } }
}
export function migrateProfiles(profiles) { const results = Array.isArray(profiles) ? profiles.map(migrateProfile) : []; return { profiles: results.filter(result => result.ok).map(result => result.profile), rejected: results.filter(result => !result.ok) } }
