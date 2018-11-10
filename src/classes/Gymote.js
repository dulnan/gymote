import EventEmitter from 'eventemitter3'

import PairingManager from './PairingManager.js'
import Connection from './Connection.js'

/**
 * The base Gymote class.
 *
 * Initializes the pairing manager and connection handler.
 */
export default class Gymote extends EventEmitter {
  /**
   * @param {String} serverUrl The URL of the gymote server.
   * @param {*} http A http client, for example axios.
   */
  constructor (serverUrl, http) {
    super()

    this.serverUrl = serverUrl

    this.pairingManager = new PairingManager(serverUrl, http)
    this.connection = new Connection(serverUrl)

    this.connection.on('connected', (pairing) => {
      this.pairingManager.savePairing(pairing, 'remote')
      this.emit('connected')
    })

    this.connection.on('usingFallback', () => {
      this.emit('usingFallback')
    })
  }

  /**
   * Load the stored pairings.
   */
  loadStoredPairings () {
    this.pairingManager.getStoredPairing((pairing) => {
      if (pairing) {
        this.emit('restorable', pairing)
      }
    })
  }

  /**
   * Deletes the given pairing from the cookies.
   *
   * @param {Pairing} pairing The pairing to delete.
   */
  deleteStoredPairing (pairing) {
    this.pairingManager.deletePairing(pairing)
  }

  /**
   * @returns {Boolean}
   */
  isConnected () {
    return this.connection.isConnected()
  }

  /**
   * Connect with the given pairing.
   *
   * @param {Pairing} pairing The pairing to use for the connection.
   */
  connect (pairing) {
    this.connection.connect(pairing)
  }
}
