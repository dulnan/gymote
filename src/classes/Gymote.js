import EventEmitter from 'eventemitter3'

import PairingManager from './PairingManager.js'
import Connection from './Connection.js'

export default class Gymote extends EventEmitter {
  constructor (serverUrl, http) {
    super()

    this.serverUrl = serverUrl

    this.pairingManager = new PairingManager(serverUrl, http)
    this.connection = new Connection(serverUrl)

    this.isPressing = false

    this.connection.on('connected', () => {
      this.emit('connected')
    })
  }

  loadStoredPairings () {
    this.pairingManager.getStoredPairing((pairing) => {
      if (pairing) {
        this.emit('restorable', pairing)
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
}
