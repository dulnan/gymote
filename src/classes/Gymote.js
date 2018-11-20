import EventEmitter from 'eventemitter3'

import PairingManager from './PairingManager.js'
import Connection from './Connection.js'

import { EVENT } from './../settings/index.js'

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

    this.connection.on(EVENT.CONNECTED, (pairing) => {
      this.pairingManager.savePairing(pairing, 'remote')
      this.emit(EVENT.CONNECTED)
    })

    this.connection.on(EVENT.USING_FALLBACK, () => {
      this.emit(EVENT.USING_FALLBACK)
    })

    this.connection.on(EVENT.CONNECTION_TIMEOUT, () => {
      this.emit(EVENT.CONNECTION_TIMEOUT)
    })
  }

  /**
   * Load the stored pairings.
   */
  loadStoredPairings () {
    this.pairingManager.getStoredPairing((pairing) => {
      if (pairing) {
        this.emit(EVENT.RESTORABLE, pairing)
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
