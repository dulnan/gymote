import PairingManager from './PairingManager.js'
import Connection from './Connection.js'

export default class Gymote {
  constructor (serverUrl, http) {
    this.serverUrl = serverUrl

    this.pairingManager = new PairingManager(serverUrl, http)
    this.connection = new Connection(serverUrl)

    this.isPressing = false

    this.on = this.connection.on.bind(this.connection)
    this.off = this.connection.off.bind(this.connection)
    this.emit = this.connection.emit.bind(this.connection)

    this.connection.on('connected', this.handleConnected.bind(this))
  }

  handleConnected (pairing) {
    this.pairingManager.savePairing(pairing)
  }

  loadStoredPairings () {
    this.pairingManager.getStoredPairing((pairing) => {
      if (pairing) {
        this.connection.emit('restorable', pairing)
      }
    })
  }

  deleteStoredPairing (pairing) {
    this.pairingManager.deletePairing(pairing)
  }

  isConnected () {
    return this.connection.isConnected()
  }

  connect (pairing) {
    this.connection.connect(pairing)
  }

  send (name, data) {
    if (!this.isConnected()) {
      return
    }

    this.connection.send(JSON.stringify({
      name: name,
      data: data
    }))
  }
}
