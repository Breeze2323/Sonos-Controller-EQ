function enabledPositiveGains(configuration) {
  const graphic = (configuration.graphicEq?.bands ?? [])
    .filter((band) => band.enabled && Number.isFinite(band.gainDb) && band.gainDb > 0)
    .map((band) => band.gainDb)

  const parametric = (configuration.parametricEq?.filters ?? [])
    .filter((filter) => filter.enabled && Number.isFinite(filter.gainDb) && filter.gainDb > 0)
    .map((filter) => filter.gainDb)

  return [...graphic, ...parametric]
}

export function estimateWorstCaseBoostDb(configuration) {
  return enabledPositiveGains(configuration).reduce((sum, gain) => sum + gain, 0)
}

export function recommendPreampDb(configuration, safetyMarginDb = 1) {
  if (!Number.isFinite(safetyMarginDb) || safetyMarginDb < 0) {
    throw new TypeError('safetyMarginDb must be a non-negative finite number')
  }
  const worstCase = estimateWorstCaseBoostDb(configuration)
  return -Math.min(60, worstCase + safetyMarginDb)
}

export function assessHeadroom(configuration, safetyMarginDb = 1) {
  const recommendedPreampDb = recommendPreampDb(configuration, safetyMarginDb)
  const configuredPreampDb = Number.isFinite(configuration.preampDb) ? configuration.preampDb : 0
  return {
    configuredPreampDb,
    recommendedPreampDb,
    sufficient: configuredPreampDb <= recommendedPreampDb,
    estimatedWorstCaseBoostDb: estimateWorstCaseBoostDb(configuration),
  }
}
