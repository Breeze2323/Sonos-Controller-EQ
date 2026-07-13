export const SOURCE_COVERAGE_STATES = Object.freeze(['verified_processed', 'verified_bypassed', 'expected', 'unknown', 'unsupported', 'unavailable', 'mock_only', 'sandbox_only'])

export const DEFAULT_SOURCE_COVERAGE = Object.freeze({
  beast2SharedStereoPcm: 'expected', beast2MultichannelPcm: 'expected', browserAudio: 'expected', games: 'expected', sharedModeMedia: 'expected', exclusiveBitstream: 'unknown', windowsSpatialAudio: 'unknown', lgC2InternalApps: 'unsupported', consoles: 'unsupported', directSonosStreams: 'unsupported', roonToSonos: 'unknown',
})

export function validateSourceCoverage(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, errors: ['sourceCoverage must be an object'] }
  const errors = Object.entries(value).filter(([, state]) => !SOURCE_COVERAGE_STATES.includes(state)).map(([key]) => `${key} has an invalid source coverage state`)
  return { ok: errors.length === 0, errors }
}
