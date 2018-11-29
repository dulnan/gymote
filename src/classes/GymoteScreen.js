import Gymote from './Gymote'
import Smoothing from './Smoothing'
import { Point } from 'lazy-brush'

import { decodeRemoteData } from './../utils/index.js'
import { MESSAGE, EVENT } from './../settings'

/**
 * Manages the screen part of a gymote setup.
 */
export default class GymoteScreen extends Gymote {
  /**
   * @param {String} serverUrl The URL of the gymote server.
   * @param {*} http A http client, for example axios.
   */
  constructor () {
    super()

    this.isClicking = false

    this.smoothX = new Smoothing(0.3)
    this.smoothY = new Smoothing(0.3)

    this.remoteCoordinates = new Point(0, 0)
    this.currentCoordinates = new Point(0, 0)

    this.lastDataTimestamp = 0

    this.hasRemoteDelay = false

    // this.connection.on(EVENT.CONNECTED, this.onConnected.bind(this))
    // this.connection.on(MESSAGE.REMOTE_DATA, this.onRemoteData.bind(this))
    // this.connection.on(MESSAGE.REMOTE_CALIBRATED, this.onRemoteCalibrated.bind(this))
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

  start () {
    const now = Date.now()

    this.lastDataTimestamp = now

    this.loop()
  }

  onRemoteCalibrated () {
    this.emit(EVENT.CALIBRATED)
  }

  /**
   * Animation loop used to emit events related to receiving the remote data. If
   * the time delta from the last received message exceeds a certain threshold,
   * the lagstart event is emitted, and if it goes below again, emit the lagend
   * event.
   */
  loop () {
    // Get the current timestamp.
    const now = Date.now()

    // Calculate the time delta.
    const dataDelta = now - this.lastDataTimestamp

    // If the delta is above a threshold, emit the event once.
    if (dataDelta > 80) {
      if (!this.hasRemoteDelay) {
        this.emit(EVENT.LAG_START)
        this.hasRemoteDelay = true
      }
    } else {
      if (this.hasRemoteDelay) {
        this.emit(EVENT.LAG_END)
        this.hasRemoteDelay = false
      }
    }

    const coordinates = this.getCoordinates(dataDelta)

    // Only emit the pointermove event if the coordinates have actually changed.
    if (this.currentCoordinates.x !== coordinates.x || this.currentCoordinates.y !== coordinates.y) {
      this.emit(EVENT.POINTER_MOVE, coordinates)
      this.currentCoordinates = coordinates
    }

    this.lastFrameTimestamp = now

    window.requestAnimationFrame(this.loop.bind(this))
  }

  /**
   * Get the smoothed coordinates from the last received remote message.
   * Depending on the given dataDelta, the smoothing is adjusted. With that,
   * when a small lag has happened, the pointer is not moved immediately to the
   * new position.
   *
   * @param {Number} dataDelta The time delta from the last received message.
   */
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
   * @param {ArrayBuffer} data The data from the Remote.
   */
  handleRemoteData (data) {
    const now = Date.now()

    const { coordinates, touch, isClicking } = decodeRemoteData(data)

    this.remoteCoordinates = coordinates
    this.lastDataTimestamp = now

    // Emit the touch event.
    this.emit(EVENT.TOUCH, touch)

    // Check if isClicking has changed since the last time. If it has, then emit
    // the corresponding pointer event.
    if (isClicking !== this.isClicking) {
      if (isClicking) {
        this.emit(EVENT.POINTER_DOWN)
      } else {
        this.emit(EVENT.POINTER_UP)
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
    // this.connection.send(MESSAGE.SCREEN_VIEWPORT, JSON.stringify(viewport))
  }

  /**
   * Send the distance to the Remote device.
   *
   * @param {Number} distance The distance between screen and remote in pixels.
   */
  sendDistance (distance) {
    // this.connection.send(MESSAGE.SCREEN_DISTANCE, distance.toString())
  }
}
