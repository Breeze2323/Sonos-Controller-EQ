import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import test from 'node:test'
import { EqualizerApoAdapter } from '../../server/services/dsp/EqualizerApoAdapter.js'

const config = { schemaVersion: 1, enabled: true, preampDb: -5, graphicEq: { bands: [{ frequencyHz: 100, gainDb: 2, enabled: true }] }, parametricEq: { filters: [] } }
test('Equalizer APO adapter only applies in sandbox and can roll back', async () => { const root = await mkdtemp(path.join(os.tmpdir(), 'apo-sandbox-')); const adapter = new EqualizerApoAdapter({ sandboxRoot: root }); await adapter.applyConfiguration(config); assert.match(await readFile(path.join(root, 'active.txt'), 'utf8'), /Preamp: -5 dB/); await adapter.applyConfiguration({ ...config, preampDb: -8 }); await adapter.rollback(); assert.match(await readFile(path.join(root, 'active.txt'), 'utf8'), /Preamp: -5 dB/); assert.equal((await adapter.probe()).liveAudioProcessed, false) })
test('Equalizer APO adapter stages without sandbox writes and rejects live mode', async () => { const root = await mkdtemp(path.join(os.tmpdir(), 'apo-sandbox-')); const adapter = new EqualizerApoAdapter({ sandboxRoot: root }); const staged = await adapter.stageConfiguration(config); assert.equal(staged.applied, false); assert.equal((await adapter.getStatus()).hasStagedConfiguration, true); assert.throws(() => new EqualizerApoAdapter({ sandboxRoot: root, liveEnabled: true }), /not supported/) })
test('Equalizer APO readiness only probes an explicit read-only candidate path', async () => { const root = await mkdtemp(path.join(os.tmpdir(), 'apo-sandbox-')); const candidate = path.join(root, 'EqualizerAPO.exe'); await writeFile(candidate, 'fixture'); const adapter = new EqualizerApoAdapter({ sandboxRoot: root, readinessPath: candidate }); assert.equal((await adapter.probe()).readiness.status, 'candidate_present'); assert.throws(() => new EqualizerApoAdapter({ sandboxRoot: root, readinessPath: 'relative.exe' }), /absolute/) })
