import Gymote from './Gymote.js'

import { decodeRemoteData } from './../utils/index.js'
import { MESSAGE } from './../settings'

/**
 * Manages the screen part of a gymote setup.
 */
export default class GymoteScreen extends Gymote {
  /**
   * @param {String} serverUrl The URL of the gymote server.
   * @param {*} http A http client, for example axios.
   */
  constructor (serverUrl, http) {
    super(serverUrl, http)

    this.isClicking = false

    this.connection.on(MESSAGE.REMOTE_DATA, this.onRemoteData.bind(this))
  }

  /**
   * Get a new pairing from the gymote server.
   *
   * @returns {Pairing} The pairing containing the code and hash.
   */
  async getPairing () {
    const pairing = await this.pairingManager.requestPairing()
    return pairing
  }

  /**
   * Received from the device of GymoteRemote. The message contains the pointer
   * coordinates, touch coordinates and a boolean indicating if the user is
   * clicking.
   *
   * @param {String} data The data from the Remote.
   */
  onRemoteData (data) {
    const { coordinates, isClicking, touch } = decodeRemoteData(data)

    this.emit('touch', touch)
    this.emit('pointermove', coordinates)

    // Check if isClicking has changed since the last time. If it has, then emit
    // the corresponding pointer event.
    if (isClicking !== this.isClicking) {
      this.isClicking = isClicking

      if (isClicking) {
        this.emit('pointerdown')
      } else {
        this.emit('pointerup')
      }
    }
  }

  /**
   * Send the viewport size to the Remote device.
   *
   * @param {Object} viewport The viewport.
   * @param {Number} viewport.width The viewport width.
   * @param {Number} viewport.height The viewport height.
   */
  sendViewport (viewport) {
    this.connection.send(MESSAGE.SCREEN_VIEWPORT, JSON.stringify(viewport))
  }

  /**
   * Send the distance to the Remote device.
   *
   * @param {Number} distance The distance between screen and remote in pixels.
   */
  sendDistance (distance) {
    this.connection.send(MESSAGE.SCREEN_DISTANCE, distance.toString())
  }
}
