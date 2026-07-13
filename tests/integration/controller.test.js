import assert from 'node:assert/strict'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import test from 'node:test'
import { createControllerServer } from '../../server/controller.js'

async function listen(server) { await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); return server.address().port }
async function request(port, route) { const response = await fetch(`http://127.0.0.1:${port}${route}`); return { status: response.status, body: await response.text() } }

test('proxy reaches an IPv4 loopback configured API and rejects other targets', async t => {
  const api = http.createServer((req, res) => { res.writeHead(201, { 'content-type': 'text/plain' }); res.end(req.url) })
  const apiPort = await listen(api)
  const directory = await mkdtemp(path.join(os.tmpdir(), 'sonos-controller-test-'))
  const dataFile = path.join(directory, 'sonos-data.json')
  await writeFile(dataFile, JSON.stringify({ 'sonos-config': { host: '127.0.0.1', port: String(apiPort), room: 'Fixture Room' } }))
  const controller = createControllerServer({ dataFile })
  const port = await listen(controller)
  t.after(() => { api.close(); controller.close() })
  const ok = await request(port, `/sonos-proxy?url=${encodeURIComponent(`http://127.0.0.1:${apiPort}/zones`)}`)
  assert.equal(ok.status, 201); assert.equal(ok.body, '/zones')
  const denied = await request(port, `/sonos-proxy?url=${encodeURIComponent('http://127.0.0.1:1/zones')}`)
  assert.equal(denied.status, 403)
})

test('store rejects malformed and oversized input while preserving valid data atomically', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'sonos-store-test-'))
  const dataFile = path.join(directory, 'sonos-data.json')
  await writeFile(dataFile, JSON.stringify({ retained: true }))
  const server = createControllerServer({ dataFile })
  const port = await listen(server); t.after(() => server.close())
  const bad = await fetch(`http://127.0.0.1:${port}/sonos-store`, { method: 'POST', body: '{bad' })
  assert.equal(bad.status, 400)
  const saved = await fetch(`http://127.0.0.1:${port}/sonos-store`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ 'sonos-config': { host: '127.0.0.1', port: '5005', room: 'Fixture Room' } }) })
  assert.equal(saved.status, 200)
  const value = JSON.parse(await readFile(dataFile, 'utf8')); assert.equal(value.retained, true); assert.equal(value['sonos-config'].host, '127.0.0.1')
})
