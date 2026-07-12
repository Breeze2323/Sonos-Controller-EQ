import { randomUUID } from 'node:crypto'
import { DspAdapter } from './DspAdapter.js'
import { validateDspConfiguration } from '../../validation/dspConfig.js'

export class MockDspAdapter extends DspAdapter {
  constructor(initialConfiguration = null) {
    super()
    this.configuration = initialConfiguration
    this.bypassed = false
    this.history = []
  }

  async probe() {
    return {
      engine: 'mock',
      available: true,
      supportsGraphicEq: true,
      supportsParametricEq: true,
      supportsRollback: true,
      liveAudioProcessed: false,
    }
  }

  async getStatus() {
    return {
      engine: 'mock',
      available: true,
      bypassed: this.bypassed,
      activeVersionId: this.history.at(-1)?.versionId ?? null,
      liveAudioProcessed: false,
    }
  }

  async getConfiguration() {
    return structuredClone(this.configuration)
  }

  validateConfiguration(configuration) {
    return validateDspConfiguration(configuration)
  }

  async applyConfiguration(configuration) {
    const validation = this.validateConfiguration(configuration)
    if (!validation.ok) {
      return { ok: false, applied: false, errors: validation.errors }
    }

    const versionId = randomUUID()
    this.history.push({ versionId, configuration: structuredClone(this.configuration) })
    this.configuration = structuredClone(configuration)
    return { ok: true, applied: true, versionId }
  }

  async bypass(enabled) {
    this.bypassed = Boolean(enabled)
    return { ok: true, bypassed: this.bypassed }
  }

  async rollback(versionId) {
    const version = this.history.find((entry) => entry.versionId === versionId)
    if (!version) return { ok: false, restored: false, error: 'VERSION_NOT_FOUND' }
    this.configuration = structuredClone(version.configuration)
    return { ok: true, restored: true, versionId }
  }
}
