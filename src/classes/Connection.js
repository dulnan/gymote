import SocketPeer from 'socketpeer/browser'
import EventEmitter from 'eventemitter3'
// import { parseDataString } from './utils/index.js'

export default class Connection extends EventEmitter {
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

  initSocketPeer () {
    this.peer.on('connect', () => {
      this._isConnected = true
      this.emit('connected', this.pairing)
    })

    this.peer.on('close', () => {
      this._isConnected = false
    })

    this.peer.on('connect_timeout', () => this.emit('connectionTimeout'))

    // this.peer.on('connect_error', () => {
    //   console.log('connect_error')
    // })

    this.peer.on('error', (data) => {
      this._isConnected = false
      this.emit('connectionTimeout')
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
    return this._isConnected
  }

  connect (pairing) {
    this.pairing = pairing
    this.peer.pairCode = pairing.hash
    this.peer.connect()
  }

  send (name, data) {
    if (!this.isConnected()) {
      return
    }

    this.peer.send(JSON.stringify({
      name: name,
      data: data
    }))
  }
}
