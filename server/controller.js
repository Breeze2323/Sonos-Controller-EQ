import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { HttpSonosAdapter } from './services/sonos/HttpSonosAdapter.js'
import { MockDspAdapter } from './services/dsp/MockDspAdapter.js'
import { parseRewText } from './rew/parse.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MAX_BODY = 256 * 1024
const MAX_RESPONSE = 5 * 1024 * 1024
const TIMEOUT_MS = 8_000
const DEFAULT_CONFIG = { host: '127.0.0.1', port: '5005', room: '' }

function json(res, status, value) { res.statusCode = status; res.setHeader('content-type', 'application/json; charset=utf-8'); res.end(JSON.stringify(value)) }
function error(res, status, code, message) { json(res, status, { error: { code, message } }) }
function plainObject(value) { return value && typeof value === 'object' && !Array.isArray(value) }
function validateConfig(value) {
  if (!plainObject(value)) return null
  const host = typeof value.host === 'string' ? value.host.trim() : ''
  const port = String(value.port ?? '').trim()
  if (!/^(127\.0\.0\.1|localhost|\[::1\]|[a-zA-Z0-9.-]+)$/.test(host) || !/^[1-9]\d{0,4}$/.test(port) || Number(port) > 65535) return null
  return { host, port, room: typeof value.room === 'string' ? value.room.slice(0, 128) : '' }
}
async function readStore(dataFile) {
  try { const parsed = JSON.parse(await fs.readFile(dataFile, 'utf8')); if (!plainObject(parsed)) throw new Error('not object'); return parsed } catch (cause) { if (cause.code === 'ENOENT') return {}; throw new Error('Stored controller data is malformed', { cause }) }
}
async function atomicWrite(dataFile, value) {
  const temp = path.join(path.dirname(dataFile), `.${path.basename(dataFile)}.${process.pid}.${Date.now()}.tmp`)
  const backup = `${dataFile}.previous`
  await fs.mkdir(path.dirname(dataFile), { recursive: true })
  try {
    await fs.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
    try { await fs.copyFile(dataFile, backup) } catch (cause) { if (cause.code !== 'ENOENT') throw cause }
    await fs.rename(temp, dataFile)
  } catch (cause) { await fs.rm(temp, { force: true }).catch(() => {}); throw cause }
}
function allowedPath(pathname) {
  const decoded = pathname.split('/').map(decodeURIComponent)
  if (pathname === '/zones') return true
  if (decoded.length < 3 || !decoded[1]) return false
  const action = decoded[2]
  return ['state', 'play', 'pause', 'playpause', 'next', 'previous', 'leave'].includes(action) ||
    ['volume', 'groupvolume', 'bass', 'treble', 'subwoofer'].includes(action) && decoded.length === 4 ||
    ['nightmode', 'speechenhancement', 'sub'].includes(action) && decoded.length <= 5 ||
    action === 'queue' && decoded.length <= 4 || action === 'add' && decoded.length === 4
}
function proxyRequest(req, res, target, config) {
  if (target.protocol !== 'http:' || target.username || target.password || target.hostname !== config.host || target.port !== config.port || !allowedPath(target.pathname)) return error(res, 403, 'PROXY_TARGET_DENIED', 'Target is not an allowed local Sonos API route')
  const client = http
  const upstream = client.request(target, { method: 'GET', timeout: TIMEOUT_MS, headers: { accept: req.headers.accept || '*/*' } }, response => {
    let size = 0; const chunks = []
    response.on('data', chunk => { size += chunk.length; if (size > MAX_RESPONSE) { upstream.destroy(); return } chunks.push(chunk) })
    response.on('end', () => { if (size > MAX_RESPONSE) return error(res, 502, 'UPSTREAM_RESPONSE_TOO_LARGE', 'Sonos response exceeded the limit'); res.statusCode = response.statusCode || 502; if (response.headers['content-type']) res.setHeader('content-type', response.headers['content-type']); res.end(Buffer.concat(chunks)) })
  })
  upstream.on('timeout', () => { upstream.destroy(); error(res, 504, 'UPSTREAM_TIMEOUT', 'Sonos API timed out') })
  upstream.on('error', cause => { if (!res.writableEnded) error(res, 502, 'UPSTREAM_ERROR', cause.code || 'Sonos API request failed') })
  upstream.end()
}
async function readBody(req) {
  const chunks = []; let size = 0
  for await (const chunk of req) { size += chunk.length; if (size > MAX_BODY) { const err = new Error('too large'); err.code = 'TOO_LARGE'; throw err } chunks.push(chunk) }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
export function createControllerHandler({ dataFile = path.join(__dirname, '..', 'sonos-data.json'), distDir = path.join(__dirname, '..', 'dist'), sonosAdapter = new HttpSonosAdapter(), dspAdapter = new MockDspAdapter() } = {}) {
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname.startsWith('/api/sonos/')) {
      if (req.method === 'GET') {
        try {
          if (url.pathname === '/api/sonos/health') return json(res, 200, await sonosAdapter.probe())
          if (url.pathname === '/api/sonos/zones') return json(res, 200, await sonosAdapter.getZones())
          if (url.pathname === '/api/sonos/state') return json(res, 200, await sonosAdapter.getState(url.searchParams.get('room')))
          if (url.pathname === '/api/sonos/capabilities') return json(res, 200, await sonosAdapter.getCapabilities(url.searchParams.get('room')))
        } catch (cause) { return error(res, 503, 'SONOS_UNAVAILABLE', cause.message) }
      }
      if (req.method === 'POST' && url.pathname === '/api/sonos/settings/apply') { try { const body = await readBody(req); return json(res, 200, await sonosAdapter.applySettings(body.roomId, body.settings)) } catch (cause) { return error(res, 400, 'INVALID_SONOS_REQUEST', cause.message) } }
      return error(res, 404, 'SONOS_ROUTE_NOT_FOUND', 'Unknown Sonos API route')
    }
    if (url.pathname.startsWith('/api/dsp/')) {
      if (req.method === 'GET') {
        if (url.pathname === '/api/dsp/capabilities') return json(res, 200, await dspAdapter.probe())
        if (url.pathname === '/api/dsp/status') return json(res, 200, await dspAdapter.getStatus())
        if (url.pathname === '/api/dsp/config') return json(res, 200, await dspAdapter.getConfiguration())
        if (url.pathname === '/api/dsp/history') return json(res, 200, { history: dspAdapter.history ?? [] })
      }
      if (req.method === 'POST') { try { const body = await readBody(req); if (url.pathname === '/api/dsp/validate') return json(res, 200, dspAdapter.validateConfiguration(body)); if (url.pathname === '/api/dsp/stage') return json(res, 200, await dspAdapter.stageConfiguration(body)); if (url.pathname === '/api/dsp/apply') return json(res, 200, await dspAdapter.applyConfiguration(body)); if (url.pathname === '/api/dsp/bypass') return json(res, 200, await dspAdapter.bypass(body.enabled)); if (url.pathname === '/api/dsp/rollback') return json(res, 200, await dspAdapter.rollback(body.versionId)) } catch (cause) { return error(res, 400, 'INVALID_DSP_REQUEST', cause.message) } }
      return error(res, 404, 'DSP_ROUTE_NOT_FOUND', 'Unknown DSP API route')
    }
    if (url.pathname === '/api/rew/parse') {
      if (req.method !== 'POST') return error(res, 405, 'METHOD_NOT_ALLOWED', 'Only POST is supported')
      try {
        const body = await readBody(req)
        if (!plainObject(body) || typeof body.text !== 'string') return error(res, 400, 'INVALID_REW_REQUEST', 'REW text is required')
        return json(res, 200, { ...parseRewText(body.text), applied: false, liveAudioProcessed: false })
      } catch (cause) {
        return error(res, cause.code === 'TOO_LARGE' ? 413 : 400, 'INVALID_REW_REQUEST', cause.message)
      }
    }
    if (url.pathname === '/sonos-store') {
      if (req.method === 'GET') { try { return json(res, 200, await readStore(dataFile)) } catch { return error(res, 500, 'STORE_MALFORMED', 'Stored controller data is malformed') } }
      if (req.method !== 'POST') return error(res, 405, 'METHOD_NOT_ALLOWED', 'Only GET and POST are supported')
      try { const updates = await readBody(req); if (!plainObject(updates) || Object.keys(updates).some(key => !key || key.length > 128 || ['__proto__', 'prototype', 'constructor'].includes(key))) return error(res, 400, 'INVALID_STORE_UPDATE', 'Store updates must be a plain object'); if ('sonos-config' in updates && !validateConfig(updates['sonos-config'])) return error(res, 400, 'INVALID_SONOS_CONFIG', 'Sonos host or port is invalid'); const current = await readStore(dataFile); await atomicWrite(dataFile, { ...current, ...updates }); return json(res, 200, { ok: true }) } catch (cause) { return error(res, cause.code === 'TOO_LARGE' ? 413 : 400, cause.code === 'TOO_LARGE' ? 'BODY_TOO_LARGE' : 'INVALID_JSON', 'Request body must be valid JSON') }
    }
    if (url.pathname === '/sonos-proxy') {
      if (req.method !== 'GET') return error(res, 405, 'METHOD_NOT_ALLOWED', 'Only GET is supported')
      const raw = url.searchParams.get('url'); if (!raw) return error(res, 400, 'MISSING_URL', 'url is required')
      let target; try { target = new URL(raw) } catch { return error(res, 400, 'INVALID_URL', 'url must be absolute') }
      try { const store = await readStore(dataFile); const config = validateConfig(store['sonos-config']) || DEFAULT_CONFIG; return proxyRequest(req, res, target, config) } catch { return error(res, 500, 'STORE_MALFORMED', 'Stored controller data is malformed') }
    }
    if (next) return next()
    const relative = path.posix.normalize(url.pathname).replace(/^\/+/, '')
    const candidate = path.resolve(distDir, relative || 'index.html')
    if (!candidate.startsWith(`${path.resolve(distDir)}${path.sep}`)) return error(res, 403, 'STATIC_PATH_DENIED', 'Forbidden')
    try { res.end(await fs.readFile(candidate)) } catch { try { res.end(await fs.readFile(path.join(distDir, 'index.html'))) } catch { error(res, 404, 'NOT_FOUND', 'Not found') } }
  }
}
export function createControllerServer(options) { return http.createServer(createControllerHandler(options)) }
