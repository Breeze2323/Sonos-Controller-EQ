const LOG_GRID = Object.freeze([20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000])
export function filterMagnitudeDb(filter, frequencyHz) {
  if (!filter?.enabled || !Number.isFinite(frequencyHz) || !Number.isFinite(filter.frequencyHz) || !Number.isFinite(filter.gainDb) || !Number.isFinite(filter.q) || filter.frequencyHz <= 0 || filter.q <= 0) return 0
  const distance = Math.log2(frequencyHz / filter.frequencyHz)
  if (filter.type === 'peak' || filter.type === 'notch') return filter.gainDb * Math.exp(-(distance * distance) * filter.q * 3)
  if (filter.type === 'low_shelf') return filter.gainDb / (1 + Math.exp(distance * filter.q * 4))
  if (filter.type === 'high_shelf') return filter.gainDb / (1 + Math.exp(-distance * filter.q * 4))
  return 0
}
export function estimateResponse(configuration) {
  const filters = [...(configuration?.parametricEq?.filters ?? []), ...(configuration?.graphicEq?.bands ?? []).map(band => ({ ...band, type: 'peak', q: 4.318 }))]
  const points = LOG_GRID.map(frequencyHz => ({ frequencyHz, magnitudeDb: filters.reduce((sum, filter) => sum + filterMagnitudeDb(filter, frequencyHz), 0) }))
  const maximumBoostDb = Math.max(0, ...points.map(point => point.magnitudeDb))
  const preampDb = Number.isFinite(configuration?.preampDb) ? configuration.preampDb : 0
  return { points, maximumBoostDb, recommendedPreampDb: -(maximumBoostDb + 1), clippingRisk: preampDb + maximumBoostDb > -0.1 ? 'high' : preampDb + maximumBoostDb > -3 ? 'moderate' : 'low', model: 'electrical_filter_estimate' }
}
