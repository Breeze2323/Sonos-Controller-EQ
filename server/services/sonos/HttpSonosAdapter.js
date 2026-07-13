import { SonosAdapter } from './SonosAdapter.js'

const WRITABLE_SETTINGS = new Set(['loudness', 'subEnabled', 'subGain', 'surroundEnabled', 'surroundTvLevel', 'surroundMusicLevel', 'surroundMusicMode', 'nightMode', 'speechEnhancement', 'dialogSyncDelay'])
const BOOLEAN_SETTINGS = new Set(['loudness', 'subEnabled', 'surroundEnabled', 'nightMode', 'speechEnhancement'])
const NUMBER_RANGES = new Map([['subGain', [-15, 15]], ['surroundTvLevel', [-15, 15]], ['surroundMusicLevel', [-15, 15]], ['dialogSyncDelay', [0, 5]]])
const STATE_KEYS = { loudness: 'loudness', subEnabled: 'subEnabled', subGain: 'subGain', surroundEnabled: 'surroundEnabled', surroundTvLevel: 'surroundTvLevel', surroundMusicLevel: 'surroundMusicLevel', surroundMusicMode: 'surroundMusicMode', nightMode: 'nightMode', speechEnhancement: 'speechEnhancement', dialogSyncDelay: 'dialogSyncDelay' }

export function validateSonosSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new TypeError('settings must be an object')
  const unknown = Object.keys(settings).filter(key => !WRITABLE_SETTINGS.has(key))
  if (unknown.length) throw new TypeError(`Unsupported settings: ${unknown.join(', ')}`)
  for (const [key, value] of Object.entries(settings)) {
    if (BOOLEAN_SETTINGS.has(key) && typeof value !== 'boolean') throw new TypeError(`${key} must be boolean`)
    const range = NUMBER_RANGES.get(key)
    if (range && (!Number.isFinite(value) || value < range[0] || value > range[1])) throw new TypeError(`${key} must be between ${range[0]} and ${range[1]}`)
    if (key === 'surroundMusicMode' && !['ambient', 'full'].includes(value)) throw new TypeError('surroundMusicMode must be ambient or full')
  }
}

export class HttpSonosAdapter extends SonosAdapter {
  constructor({ baseUrl = 'http://127.0.0.1:5005', fetchImpl = fetch, allowWrites = false } = {}) { super(); this.baseUrl = new URL(baseUrl); this.fetch = fetchImpl; this.allowWrites = allowWrites }
  async probe() { try { const zones = await this.getZones(); return { available: true, mode: this.allowWrites ? 'mock-write-enabled' : 'write-disabled', zones: zones.length } } catch (cause) { return { available: false, mode: 'write-disabled', error: cause.message } } }
  async getZones() { const response = await this.fetch(new URL('/zones', this.baseUrl)); if (!response.ok) throw new Error(`SONOS_HTTP_${response.status}`); const zones = await response.json(); return Array.isArray(zones) ? zones : [] }
  async getState(roomId) { if (typeof roomId !== 'string' || !roomId.trim()) throw new TypeError('roomId is required'); const response = await this.fetch(new URL(`/${encodeURIComponent(roomId)}/state`, this.baseUrl)); if (!response.ok) throw new Error(`SONOS_HTTP_${response.status}`); return response.json() }
  async getCapabilities(roomId) { const state = await this.getState(roomId); const equalizer = state.equalizer ?? {}; return { roomId, writePolicy: this.allowWrites ? 'enabled-for-test-only' : 'disabled', controls: Object.fromEntries([...WRITABLE_SETTINGS].map(key => [key, { state: STATE_KEYS[key] in equalizer ? 'supported' : 'unknown', writable: false }])) } }
  async applySettings(roomId, settings) { if (!this.allowWrites) return { status: 'blocked', code: 'LIVE_WRITES_DISABLED', roomId }; validateSonosSettings(settings); return { status: 'dry_run', roomId, settings: structuredClone(settings) } }
}
