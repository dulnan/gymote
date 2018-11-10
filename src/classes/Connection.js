import SocketPeer from 'socketpeer'
import EventEmitter from 'eventemitter3'

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
      url: serverUrl + '/socketpeer/',
      serveLibrary: false
    })

    this.pairing = null

    this._isConnected = false

    this.initSocketPeer()
  }

  /**
   * Initialize SocketPeer by adding event listeners.
   */
  initSocketPeer () {
    this.peer.on('connect', () => {
      this._isConnected = true
      this.emit('connected', this.pairing)
    })

    this.peer.on('close', () => {
      this._isConnected = false
    })

    this.peer.on('data', (message) => {
      const [ name, data ] = message.split('~')
      this.emit(name, data)
    })

    this.peer.on('connect_timeout', () => this.emit('connectionTimeout'))
    this.peer.on('upgrade_error', () => this.emit('usingFallback'))
    this.peer.on('connect_error', () => this.emit('connectError'))

    this.peer.on('error', (data) => {
      this._isConnected = false
      this.emit('connectionTimeout')
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
