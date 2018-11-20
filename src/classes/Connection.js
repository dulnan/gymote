import SocketPeer from 'socketpeer'
import EventEmitter from 'eventemitter3'

import { MESSAGE, EVENT } from './../settings'

/**
 * The connection handler wraps SocketPeer for sending and receiving messages
 * via WebRTC or WebSockets.
 */
export default class Connection extends EventEmitter {
  /**
   * @param {String} serverUrl The URL of the gymote server.
   */
  constructor (serverUrl) {
    super()

    this.peer = new SocketPeer({
      autoconnect: false,
      timeout: 10000,
      url: serverUrl + '/socketpeer/',
      serveLibrary: false
    })

    this.pairing = null

    this._isConnected = false

    this.interval = null
    this.timeout = null

    this.initSocketPeer()
  }

  /**
   * Initialize SocketPeer by adding event listeners.
   */
  initSocketPeer () {
    this.peer.on('connect', () => {
      this._isConnected = true

      this.emit(EVENT.CONNECTED, this.pairing)

      this.interval = window.setInterval(() => {
        this.send(MESSAGE.PING, '1')
      }, 5000)
    })

    this.peer.on('close', () => {
      this._isConnected = false
    })

    this.peer.on('data', (message) => {
      const [ name, data ] = message.split('~')

      if (name === MESSAGE.PING) {
        window.clearTimeout(this.timeout)

        this.timeout = window.setTimeout(() => {
          if (this._isConnected) {
            this._isConnected = false
            this.emit(EVENT.CONNECTION_TIMEOUT)
          }
        }, 10000)
      }

      this.emit(name, data)
    })

    this.peer.on('upgrade_error', () => {
      console.log('upgrade error')
      this.emit(EVENT.USING_FALLBACK)
    })
    this.peer.on('upgrade', () => {
      console.log('upgrade')
      this.emit(EVENT.USING_FALLBACK)
    })
    this.peer.on('upgrade_attempt', () => {
      console.log('upgrade attempt')
    })
    this.peer.on('connect_error', () => this.emit(EVENT.CONNECTION_ERROR))

    this.peer.on('error', (data) => {
      this._isConnected = false

      if (this._isConnected) {
        this.emit(EVENT.CONNECTION_TIMEOUT)
      }
    })
  }

  /**
   * Connect to the other device of the given pairing.
   *
   * @param {Pairing} pairing
   */
  connect (pairing) {
    this.pairing = pairing
    this.peer.pairCode = pairing.hash
    this.peer.connect()
  }

  /**
   * Sends a message to the other device.
   *
   * @param {String} name The name of the message.
   * @param {String} data The data to be sent.
   */
  send (name, data) {
    if (!this.isConnected()) {
      return
    }

    const message = name + '~' + data
    this.peer.send(message)
  }

  /**
   * @returns {Boolean}
   */
  isConnected () {
    return this._isConnected
  }
}
