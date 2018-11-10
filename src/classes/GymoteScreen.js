import Gymote from './Gymote.js'

import { decodeRemoteData } from './../utils/index.js'
import { MESSAGE } from './../settings'

export default class GymoteScreen extends Gymote {
  constructor (serverUrl, http) {
    super(serverUrl, http)

    this.isClicking = false

    this.connection.on('connected', this.onConnected.bind(this))
    this.connection.on(MESSAGE.REMOTE_DATA, this.onRemoteData.bind(this))
  }

  onConnected (pairing) {
    this.pairingManager.savePairing(pairing, 'screen')
  }

  onRemoteData (data) {
    const { coordinates, isClicking, touch } = decodeRemoteData(data)

    this.emit('touch', touch)
    this.emit('pointermove', coordinates)

    if (isClicking !== this.isClicking) {
      this.isClicking = isClicking

      if (isClicking) {
        this.emit('pointerdown')
      } else {
        this.emit('pointerup')
      }
    }
  }

  updateViewport (viewport) {
    this.connection.send(MESSAGE.SCREEN_VIEWPORT, JSON.stringify(viewport))
  }

  updateDistance (distance) {
    this.connection.send(MESSAGE.SCREEN_DISTANCE, distance.toString())
  }

  async getPairing () {
    const pairing = await this.pairingManager.requestPairing()
    return pairing
  }
}
