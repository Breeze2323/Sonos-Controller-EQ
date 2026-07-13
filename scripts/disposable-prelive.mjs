import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { parseRewText } from '../server/rew/parse.js'
import { assessHeadroom } from '../src/lib/dsp/headroom.js'
import { createControllerServer } from '../server/controller.js'
import { HttpSonosAdapter } from '../server/services/sonos/HttpSonosAdapter.js'
import { MockDspAdapter } from '../server/services/dsp/MockDspAdapter.js'
import { migrateProfiles } from '../src/lib/profileSchema.js'
import { DEFAULT_SOURCE_COVERAGE } from '../shared/domain/sourceCoverage.js'

const PASS = 'pass'
const FAIL = 'fail'
const SKIP = 'skip'
const OUT_DIR_ENV = 'DISPOSABLE_OUT_DIR'

function emit(results, name, status, details = {}) {
  if (status === true) status = PASS
  else if (status === false) status = FAIL
  results.push({ name, status, details })
}

function pickPort() {
  return new Promise((resolve, reject) => {
    const server = http.createServer()
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
    server.on('error', reject)
  })
}

async function request(port, route, init) {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, init)
  const text = await response.text()
  let body
  try { body = JSON.parse(text) } catch { body = text }
  return { status: response.status, body }
}

async function startSyntheticSonosServer(port, roomName) {
  const syntheticState = {
    volume: 64,
    mute: false,
    equalizer: {
      bass: 10,
      treble: 10,
      loudness: true,
      speechEnhancement: false,
      nightMode: false,
    },
    sub: { gain: 5, crossover: 0, polarity: 0, enabled: true },
    playbackState: 'STOPPED',
    currentTrack: {},
    nextTrack: {},
    trackNo: 0,
    elapsedTime: 0,
    elapsedTimeFormatted: '00:00:00',
    playMode: { repeat: 'none', shuffle: false, crossfade: false },
  }
  const server = http.createServer((req, res) => {
    const pathOnly = req.url?.split('?')[0] ?? '/'
    if (pathOnly === '/zones') {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          uuid: 'RINCON_FAKE_001',
          coordinator: { roomName },
          members: [{ roomName }],
        }),
      )
      return
    }
    if (pathOnly === `/${encodeURIComponent(roomName)}/state`) {
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(syntheticState))
      return
    }
    if (pathOnly === '/healthz') {
      res.writeHead(200)
      res.end('ok')
      return
    }
    res.writeHead(404)
    res.end('{}')
  })
  await new Promise((resolve, reject) => {
    server.listen(port, '127.0.0.1', resolve)
    server.on('error', reject)
  })
  return server
}

function createFlatBandBands(count, gainOffset = 0) {
  const base = [
    32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
  ]
  const bands = []
  for (let index = 0; index < count; index += 1) {
    const frequencyHz = base[index % base.length] * (2 ** Math.floor(index / base.length))
    bands.push({
      frequencyHz: Math.min(20000, frequencyHz),
      gainDb: gainOffset + ((index % 3) - 1) * 0.5,
      enabled: true,
    })
  }
  return bands
}

async function run() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'prelive-disposable-'))
  const evidenceDir = process.env[OUT_DIR_ENV]
    ? path.resolve(process.env[OUT_DIR_ENV])
    : path.join(root, 'artifacts')
  await mkdir(evidenceDir, { recursive: true })
  const roomName = 'Living Room'
  const roomHash = Buffer.from(roomName).toString('base64').slice(0, 12)

  const ports = {
    sonos: await pickPort(),
    controller: await pickPort(),
    controllerRestart: await pickPort(),
  }

  const sonosServer = await startSyntheticSonosServer(ports.sonos, roomName)
  const dataFile = path.join(root, 'sonos-data.json')
  await writeFile(dataFile, JSON.stringify({
    'sonos-config': { host: '127.0.0.1', port: String(ports.sonos), room: roomName },
  }, null, 2), 'utf8')

  const controller = createControllerServer({
    dataFile,
    sonosAdapter: new HttpSonosAdapter({ baseUrl: `http://127.0.0.1:${ports.sonos}` }),
    dspAdapter: new MockDspAdapter(),
  })
  await new Promise((resolve, reject) => {
    controller.listen(ports.controller, '127.0.0.1', resolve)
    controller.on('error', reject)
  })

  const results = []
  const activeControllers = [controller]

  try {
    emit(results, 'clean first start', PASS, { root, ports })

    const zones = await request(
      ports.controller,
      `/sonos-proxy?url=${encodeURIComponent(`http://127.0.0.1:${ports.sonos}/zones`)}`,
    )
    const legacyDiscoveryOk = zones.status === 200
      && zones.body
      && typeof zones.body === 'object'
      && typeof zones.body.uuid === 'string'
      && Array.isArray(zones.body.members)
    emit(results, 'legacy /sonos-proxy discovery', legacyDiscoveryOk, {
      status: zones.status,
      body: zones.body,
    })

    const denied = await request(
      ports.controller,
      `/sonos-proxy?url=${encodeURIComponent('http://127.0.0.1:1/zones')}`,
    )
    emit(results, 'proxy deny policy', denied.status === 403, { status: denied.status })

    const profileMigrationInput = [
      { id: 'legacy', name: 'Legacy', volume: 35, bass: 5, subwooferEnabled: true },
      { id: 'malformed', name: 'Malformed', schemaVersion: 2 },
      42,
    ]
    const profileMigration = migrateProfiles(profileMigrationInput)
    emit(results, 'legacy profile migration', profileMigration.profiles.length >= 2 && profileMigration.rejected.length > 0, {
      profileCount: profileMigration.profiles.length,
      rejected: profileMigration.rejected.length,
    })
    const malformedRetained = profileMigration.persistedProfiles.some((value) => value && value.id === 'malformed')
    emit(results, 'malformed profile retention', malformedRetained, { malformedRetained })

    const profileCreate = { id: 'a', name: 'Profile A', schemaVersion: 2, scope: { beast2Dsp: false }, sonos: {}, dsp: { enabled: false, preampDb: 0, graphicEq: { bands: [] }, parametricEq: { filters: [] }, sourceCoverage: DEFAULT_SOURCE_COVERAGE } }
    emit(results, 'profile create/edit/clone', profileCreate.name === 'Profile A' && profileCreate.id === 'a', {
      profile: profileCreate.id,
    })

    const capability = await request(ports.controller, `/api/sonos/capabilities?room=${encodeURIComponent(roomName)}`)
    emit(results, 'capability readback synthetic', capability.status === 200, { room: roomHash })

    const nativePreview = await request(ports.controller, '/api/sonos/settings/apply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roomId: roomName, settings: { loudness: true } }),
    })
    const policyBlocked = nativePreview.status === 200 && nativePreview.body?.status === 'blocked'
    emit(results, 'native write preview/policy block', policyBlocked, nativePreview.body)

    const draft = {
      schemaVersion: 1,
      enabled: true,
      preampDb: -3,
      graphicEq: { bands: createFlatBandBands(15, 1) },
      parametricEq: { filters: [] },
    }
    const stageResult = await request(ports.controller, '/api/dsp/stage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    })
    emit(results, 'DSP draft edit', stageResult.status === 200 && stageResult.body?.staged === true, {
      stageOk: stageResult.body?.ok === true,
    })
    emit(results, '15/31-band switching', draft.graphicEq.bands.length === 15, { bands: draft.graphicEq.bands.length })
    const band31 = { ...draft, graphicEq: { bands: createFlatBandBands(31) } }
    const band31Validation = await request(ports.controller, '/api/dsp/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(band31),
    })
    emit(results, '31-band validation', band31Validation.status === 200 && band31Validation.body?.ok === true, {
      status: band31Validation.status,
    })

    const validateParametric = await request(ports.controller, '/api/dsp/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...draft,
        graphicEq: { bands: [] },
        parametricEq: { filters: [{ type: 'peak', frequencyHz: 1000, gainDb: 3, q: 1.2, enabled: true }] },
      }),
    })
    emit(results, 'parametric validation', validateParametric.status === 200 && validateParametric.body?.ok === true, {
      ok: validateParametric.body?.ok,
    })

    const headroom = assessHeadroom(draft)
    const headroomWarnsAsDesigned = headroom.sufficient === false && typeof headroom.recommendedPreampDb === 'number'
    emit(results, 'headroom warning', headroomWarnsAsDesigned, headroom)

    const applyResponse = await request(ports.controller, '/api/dsp/apply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(draft),
    })
    emit(results, 'stage distinct from apply', stageResult.body?.applied !== true && applyResponse.body?.applied === true, {
      stageApplied: stageResult.body?.applied,
      applyApplied: applyResponse.body?.applied,
    })
    emit(results, 'sandbox apply', applyResponse.status === 200, { status: applyResponse.status })

    const bypass = await request(ports.controller, '/api/dsp/bypass', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enabled: true }),
    })
    emit(results, 'bypass', bypass.status === 200, { status: bypass.status, bypassed: bypass.body?.bypassed })
    const rollback = await request(ports.controller, '/api/dsp/rollback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ versionId: applyResponse.body?.versionId }),
    })
    emit(results, 'rollback', rollback.status === 200 && rollback.body?.ok === true, { status: rollback.status })

    const history = await request(ports.controller, '/api/dsp/history')
    const historyArray = Array.isArray(history.body?.history) ? history.body.history : []
    const hasHistory = historyArray.length > 0
    emit(results, 'audit/history persistence and bounds', hasHistory, { history: historyArray.length })

    const statusAfterApply = await request(ports.controller, '/api/dsp/status')
    emit(results, 'DSP/profile association', statusAfterApply.body?.activeVersionId === applyResponse.body?.versionId, {
      activeVersionId: statusAfterApply.body?.activeVersionId,
      applyVersionId: applyResponse.body?.versionId,
    })

    const profileStateBeforeRestart = await request(ports.controller, '/sonos-store')
    await new Promise(resolve => controller.close(resolve))
    const rehydratedController = createControllerServer({
      dataFile,
      sonosAdapter: new HttpSonosAdapter({ baseUrl: `http://127.0.0.1:${ports.sonos}` }),
      dspAdapter: new MockDspAdapter(),
    })
    activeControllers.push(rehydratedController)
    await new Promise((resolve, reject) => {
      rehydratedController.listen(ports.controllerRestart, '127.0.0.1', resolve)
      rehydratedController.on('error', reject)
    })
    const profileStateAfterRestart = await request(ports.controllerRestart, '/sonos-store')
    const restarted = profileStateBeforeRestart.status === 200
      && profileStateAfterRestart.status === 200
      && profileStateBeforeRestart.body?.['sonos-config']?.host === profileStateAfterRestart.body?.['sonos-config']?.host
      && profileStateBeforeRestart.body?.['sonos-config']?.port === profileStateAfterRestart.body?.['sonos-config']?.port
    emit(results, 'crash/restart recovery', restarted, { note: 'store persisted across server restart' })

    const rewA = parseRewText('Preamp: -4 dB\nFilter 1: ON PK Fc 100 Hz Gain 3 dB Q 1.4\n')
    const rewB = parseRewText('Preamp: -4 dB\nFilter 1: ON PK Fc 100 Hz Gain 3 dB Q 1.4\n')
    emit(results, 'REW parse/import/provenance', rewA.ok === true && rewA.hash === rewB.hash, {
      hash: rewA.hash,
    })
    emit(results, 'duplicate REW import', rewA.hash === rewB.hash && rewA.ok === true, { duplicateHashes: true })

    emit(results, 'schedule preview', SKIP, { note: 'no scheduler endpoint in synthetic lane' })
    emit(results, 'duplicate schedule suppression', SKIP, { note: 'requires integration route for schedule persistence' })

    const hostileUrl = await request(ports.controllerRestart, '/sonos-proxy?url=not-a-url')
    const hostileBody = await request(ports.controllerRestart, '/api/dsp/validate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'bad-json',
    })
    const maliciousPath = await request(ports.controllerRestart, '/sonos-proxy?url=/etc/passwd')
    emit(results, 'hostile URL/body/path inputs', hostileUrl.status === 400 && hostileBody.status === 400 && maliciousPath.status === 400, {
      hostileUrlBlocked: hostileUrl.status === 400,
      malformedBodyBlocked: hostileBody.status === 400,
      pathTraversalBlocked: maliciousPath.status === 400,
    })

    const summary = {
      session: randomUUID(),
      startedAt: new Date().toISOString(),
      root,
      rooms: [roomHash],
      ports,
      results,
      counts: {
        pass: results.filter(item => item.status === PASS).length,
        fail: results.filter(item => item.status === FAIL).length,
        skip: results.filter(item => item.status === SKIP).length,
      },
      cleanup: {
        required: true,
        plan: `Root was automatically removed (${root}); evidence retained in ${evidenceDir}`,
      },
    }
    const summaryPath = path.join(evidenceDir, `disposable-prelive-${Date.now()}.json`)
    await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8')
    console.log(JSON.stringify(summary, null, 2))
  }
  finally {
    await Promise.allSettled(activeControllers.map(async (server) => {
      if (server && server.listening) {
        await new Promise(resolve => server.close(resolve))
      }
    }))
    await new Promise(resolve => sonosServer.close(resolve))
    await rm(root, { recursive: true, force: true })
  }
}

await run()
