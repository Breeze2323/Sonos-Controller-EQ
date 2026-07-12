export class SonosAdapter {
  async probe() {
    throw new Error('probe() not implemented')
  }

  async getZones() {
    throw new Error('getZones() not implemented')
  }

  async getState(_roomId) {
    throw new Error('getState() not implemented')
  }

  async getCapabilities(_roomId) {
    throw new Error('getCapabilities() not implemented')
  }

  async applySettings(_roomId, _settings) {
    throw new Error('applySettings() not implemented')
  }
}
