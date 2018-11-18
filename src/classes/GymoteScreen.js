import Gymote from './Gymote'
import Smoothing from './Smoothing'
import { Point } from 'lazy-brush'

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

    this.smoothX = new Smoothing(0.3)
    this.smoothY = new Smoothing(0.3)

    this.remoteCoordinates = new Point(0, 0)
    this.currentCoordinates = new Point(0, 0)

    this.lastDataTimestamp = 0
    this.lastLoopTimestamp = 0

    this.hasRemoteDelay = false

    this.connection.on('connected', this.onConnected.bind(this))
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

  onConnected () {
    const now = Date.now()

    this.lastDataTimestamp = now
    this.lastLoopTimestamp = now

    this.loop()
  }

  loop () {
    const now = Date.now()

    const dataDelta = now - this.lastDataTimestamp
    // const frameDelta = now - this.lastFrameTimestamp

    if (dataDelta > 80) {
      if (!this.hasRemoteDelay) {
        this.emit('dropstart')
        this.hasRemoteDelay = true
      }
    } else {
      if (this.hasRemoteDelay) {
        this.emit('dropend')
        this.hasRemoteDelay = false
      }
    }

    const coordinates = this.getCoordinates(dataDelta)

    if (this.currentCoordinates.x !== coordinates.x || this.currentCoordinates.y !== coordinates.y) {
      this.emit('pointermove', coordinates)
      this.currentCoordinates = coordinates
    }

    this.lastFrameTimestamp = now

    window.requestAnimationFrame(this.loop.bind(this))
  }

  getCoordinates (dataDelta) {
    const smoothing = (200 - Math.min(dataDelta, 200)) / 300

    return {
      x: this.smoothX.next(this.remoteCoordinates.x, false, smoothing),
      y: this.smoothY.next(this.remoteCoordinates.y, false, smoothing)
    }
  }

  /**
   * Received from the device of GymoteRemote. The message contains the pointer
   * coordinates, touch coordinates and a boolean indicating if the user is
   * clicking.
   *
   * @param {String} data The data from the Remote.
   */
  onRemoteData (data) {
    const now = Date.now()

    const { coordinates, touch, isClicking } = decodeRemoteData(data)

    this.remoteCoordinates = coordinates
    this.lastDataTimestamp = now

    // Emit the touch event.
    this.emit('touch', touch)

    // Check if isClicking has changed since the last time. If it has, then emit
    // the corresponding pointer event.
    if (isClicking !== this.isClicking) {
      if (isClicking) {
        this.emit('pointerdown')
      } else {
        this.emit('pointerup')
      }

      this.isClicking = isClicking
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
