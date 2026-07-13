export const GRAPHIC_EQ_15_BANDS_HZ = Object.freeze([
  25, 40, 63, 100, 160, 250, 400, 630, 1000, 1600, 2500, 4000, 6300, 10000, 16000,
])

export const GRAPHIC_EQ_31_BANDS_HZ = Object.freeze([
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630,
  800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000,
  12500, 16000, 20000,
])

export function createFlatGraphicEq(mode = 31) {
  const frequencies = mode === 15 ? GRAPHIC_EQ_15_BANDS_HZ : GRAPHIC_EQ_31_BANDS_HZ
  if (mode !== 15 && mode !== 31) throw new RangeError('mode must be 15 or 31')
  return frequencies.map((frequencyHz) => ({ frequencyHz, gainDb: 0, enabled: true }))
}
