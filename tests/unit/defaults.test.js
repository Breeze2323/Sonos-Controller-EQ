import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_SONOS_CONFIG } from '../../src/lib/defaultConfig.js'

test('default local Sonos API uses IPv4 loopback', () => assert.equal(DEFAULT_SONOS_CONFIG.host, '127.0.0.1'))
