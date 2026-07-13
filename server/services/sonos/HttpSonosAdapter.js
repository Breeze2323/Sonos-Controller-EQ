import { SonosAdapter } from './SonosAdapter.js'

const WRITABLE_SETTINGS = new Set(['loudness', 'subEnabled', 'subGain', 'surroundEnabled', 'surroundTvLevel', 'surroundMusicLevel', 'surroundMusicMode', 'nightMode', 'speechEnhancement', 'dialogSyncDelay'])

export class HttpSonosAdapter extends SonosAdapter {
  constructor({ baseUrl = 'http://127.0.0.1:5005', fetchImpl = fetch, allowWrites = false } = {}) { super(); this.baseUrl = new URL(baseUrl); this.fetch = fetchImpl; this.allowWrites = allowWrites }
  async probe() { try { const zones = await this.getZones(); return { available: true, mode: this.allowWrites ? 'mock-write-enabled' : 'write-disabled', zones: zones.length } } catch (cause) { return { available: false, mode: 'write-disabled', error: cause.message } } }
  async getZones() { const response = await this.fetch(new URL('/zones', this.baseUrl)); if (!response.ok) throw new Error(`SONOS_HTTP_${response.status}`); const zones = await response.json(); return Array.isArray(zones) ? zones : [] }
  async getState(roomId) { if (typeof roomId !== 'string' || !roomId.trim()) throw new TypeError('roomId is required'); const response = await this.fetch(new URL(`/${encodeURIComponent(roomId)}/state`, this.baseUrl)); if (!response.ok) throw new Error(`SONOS_HTTP_${response.status}`); return response.json() }
  async getCapabilities(roomId) { const state = await this.getState(roomId); return { roomId, writePolicy: this.allowWrites ? 'enabled-for-test-only' : 'disabled', controls: Object.fromEntries([...WRITABLE_SETTINGS].map(key => [key, { state: key in (state.equalizer ?? {}) ? 'supported' : 'unknown', writable: false }])) } }
  async applySettings(roomId, settings) { if (!this.allowWrites) return { status: 'blocked', code: 'LIVE_WRITES_DISABLED', roomId }; if (!settings || typeof settings !== 'object') throw new TypeError('settings must be an object'); const unknown = Object.keys(settings).filter(key => !WRITABLE_SETTINGS.has(key)); if (unknown.length) throw new TypeError(`Unsupported settings: ${unknown.join(', ')}`); return { status: 'dry_run', roomId, settings: structuredClone(settings) } }
}
