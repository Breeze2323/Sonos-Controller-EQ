import { createHash } from 'node:crypto'

const TYPES = new Map([['PK', 'peak'], ['LSC', 'low_shelf'], ['HSC', 'high_shelf'], ['LPQ', 'low_pass'], ['HPQ', 'high_pass'], ['NO', 'notch']])
export function parseRewText(text) {
  if (typeof text !== 'string' || text.length > 128 * 1024) return { ok: false, errors: [{ line: 0, message: 'REW text must be at most 128 KiB' }] }
  const filters = []; const errors = []; let preampDb = null
  text.split(/\r?\n/).forEach((line, index) => { const trimmed = line.trim(); if (!trimmed || trimmed.startsWith('#')) return; const preamp = /^Preamp:\s*(-?\d+(?:\.\d+)?)\s*dB$/i.exec(trimmed); if (preamp) { preampDb = Number(preamp[1]); return }; const match = /^Filter\s+(\d+):\s+(ON|OFF)\s+(PK|LSC|HSC|LPQ|HPQ|NO)\s+Fc\s+(\d+(?:\.\d+)?)\s+Hz(?:\s+Gain\s+(-?\d+(?:\.\d+)?)\s+dB)?\s+Q\s+(\d+(?:\.\d+)?)$/i.exec(trimmed); if (!match) { errors.push({ line: index + 1, message: 'Unsupported REW filter syntax' }); return }; const [, id, enabled, type, frequencyHz, gainDb = '0', q] = match; filters.push({ id: `rew-${id}`, enabled: enabled === 'ON', type: TYPES.get(type.toUpperCase()), frequencyHz: Number(frequencyHz), gainDb: Number(gainDb), q: Number(q) }) })
  if (filters.length > 64) errors.push({ line: 0, message: 'Too many filters' })
  return { ok: errors.length === 0, errors, preampDb, filters, importHash: createHash('sha256').update(text).digest('hex') }
}
