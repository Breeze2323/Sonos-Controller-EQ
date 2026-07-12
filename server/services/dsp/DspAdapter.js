export class DspAdapter {
  async probe() {
    throw new Error('probe() not implemented')
  }

  async getStatus() {
    throw new Error('getStatus() not implemented')
  }

  async getConfiguration() {
    throw new Error('getConfiguration() not implemented')
  }

  validateConfiguration(_configuration) {
    throw new Error('validateConfiguration() not implemented')
  }

  async applyConfiguration(_configuration) {
    throw new Error('applyConfiguration() not implemented')
  }

  async bypass(_enabled) {
    throw new Error('bypass() not implemented')
  }

  async rollback(_versionId) {
    throw new Error('rollback() not implemented')
  }
}
