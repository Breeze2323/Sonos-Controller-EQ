const FILTER_TYPES = new Set(['peak', 'low_shelf', 'high_shelf', 'low_pass', 'high_pass', 'notch'])

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validateDspConfiguration(configuration) {
  const errors = []

  if (!configuration || typeof configuration !== 'object' || Array.isArray(configuration)) {
    return { ok: false, errors: ['configuration must be an object'] }
  }

  if (configuration.schemaVersion !== 1) errors.push('schemaVersion must equal 1')
  if (typeof configuration.enabled !== 'boolean') errors.push('enabled must be boolean')
  if (!finiteNumber(configuration.preampDb) || configuration.preampDb < -60 || configuration.preampDb > 0) {
    errors.push('preampDb must be a finite number from -60 through 0')
  }

  const graphicBands = configuration.graphicEq?.bands ?? []
  if (!Array.isArray(graphicBands) || graphicBands.length > 31) {
    errors.push('graphicEq.bands must be an array containing no more than 31 bands')
  } else {
    for (const [index, band] of graphicBands.entries()) {
      if (!finiteNumber(band.frequencyHz) || band.frequencyHz < 20 || band.frequencyHz > 20000) {
        errors.push(`graphicEq.bands[${index}].frequencyHz must be between 20 and 20000`)
      }
      if (!finiteNumber(band.gainDb) || band.gainDb < -12 || band.gainDb > 12) {
        errors.push(`graphicEq.bands[${index}].gainDb must be between -12 and 12`)
      }
      if (typeof band.enabled !== 'boolean') errors.push(`graphicEq.bands[${index}].enabled must be boolean`)
    }
  }

  const filters = configuration.parametricEq?.filters ?? []
  if (!Array.isArray(filters) || filters.length > 64) {
    errors.push('parametricEq.filters must be an array containing no more than 64 filters')
  } else {
    for (const [index, filter] of filters.entries()) {
      if (!FILTER_TYPES.has(filter.type)) errors.push(`parametricEq.filters[${index}].type is unsupported`)
      if (!finiteNumber(filter.frequencyHz) || filter.frequencyHz < 10 || filter.frequencyHz > 24000) {
        errors.push(`parametricEq.filters[${index}].frequencyHz must be between 10 and 24000`)
      }
      if (!finiteNumber(filter.gainDb) || filter.gainDb < -24 || filter.gainDb > 12) {
        errors.push(`parametricEq.filters[${index}].gainDb must be between -24 and 12`)
      }
      if (!finiteNumber(filter.q) || filter.q < 0.1 || filter.q > 30) {
        errors.push(`parametricEq.filters[${index}].q must be between 0.1 and 30`)
      }
      if (typeof filter.enabled !== 'boolean') errors.push(`parametricEq.filters[${index}].enabled must be boolean`)
    }
  }

  return { ok: errors.length === 0, errors }
}
