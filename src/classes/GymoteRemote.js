import Gymote from './Gymote'
import Gyroscope from './Gyroscope'
import { GyroPlane } from 'gyro-plane'
import { LazyBrush } from 'lazy-brush'

import { encodeRemoteData } from './../utils'
import { MESSAGE } from './../settings'

/**
 * Manages the remote part of a gymote setup.
 *
 * Initializes the Gyroscope class for reading orientation values and a gyro-
 * plane class for calculating the screen coordinates.
 */
export default class GymoteRemote extends Gymote {
  /**
   * @param {String} serverUrl The URL of the gymote server.
   * @param {*} http A http client, for example axios.
   */
  constructor (serverUrl, http) {
    super(serverUrl, http)

    this.gyroscope = new Gyroscope()
    this.gyroplane = new GyroPlane({
      width: 1280,
      height: 900,
      distance: 1280
    })

    this.lazy = new LazyBrush({
      radius: 2,
      enabled: true
    })

    this.isClicking = false
    this.touch = {
      x: 0,
      y: 0
    }

    this.prevDataString = ''

    this.connection.on('connected', this.onConnected.bind(this))
    this.connection.on(MESSAGE.SCREEN_VIEWPORT, this.onScreenViewport.bind(this))
    this.connection.on(MESSAGE.SCREEN_DISTANCE, this.onScreenDistance.bind(this))
  }

  /**
   * Given a code, request a pairing from the server.
   *
   * @param {Number} code The code to get the pairing from.
   */
  async getPairingByCode (code) {
    const pairing = await this.pairingManager.getHash(code)
    return pairing
  }

  /**
   * Start the data loop when the connected event is emitted.
   */
  onConnected () {
    this.loop()
  }

  /**
   * Received from GymoteScreen when the viewport of the screen device changes.
   *
   * @param {String} message The received message containing the stringified
   * viewport object.
   */
  onScreenViewport (message) {
    const viewport = JSON.parse(message)
    this.gyroplane.setScreenDimensions(viewport)
  }

  /**
   * Received from GymoteScreen when the distance has changed.
   *
   * @param {String} message The received message containing the numeric
   * distance.
   */
  onScreenDistance (message) {
    const viewport = parseInt(message)
    this.gyroplane.setDistance(viewport)
  }

  /**
   * The requestAnimationFrame loop for gathering data from the gyroscope and
   * this instance's state.
   */
  loop () {
    if (!this.connection.isConnected()) {
      return
    }
    // When not clicking the orientation values can be rounded more, so that
    // less messages are sent.
    const rounding = this.isClicking ? 100 : 25
    const orientation = this.gyroscope.getOrientation(rounding)

    this.gyroplane.updateOrientation(orientation)

    const coordinates = this.gyroplane.getScreenCoordinates()

    this.lazy.update(coordinates)

    // Get the lazy coordinates.
    const { x, y } = this.lazy.getBrushCoordinates()

    // Build the data string for the message.
    const remoteDataString = encodeRemoteData({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }, this.isClicking, this.touch)

    // Only send the message if it actually has changed.
    if (remoteDataString !== this.prevDataString) {
      this.connection.send(MESSAGE.REMOTE_DATA, remoteDataString)
      this.prevDataString = remoteDataString
    }

    window.requestAnimationFrame(this.loop.bind(this))
  }

  /**
   * Updates isClicking.
   *
   * @param {Boolean} isClicking
   */
  updateClick (isClicking) {
    this.isClicking = isClicking
  }

  /**
   * Update the touch coordinates.
   *
   * @param {Object} touch The touch position.
   * @param {Number} touch.x The x coordinate of the touch.
   * @param {Number} touch.y The y coordinate of the touch.
   */
  updateTouch (touch) {
    this.touch = touch
  }

  /**
   * Get the current orientation values and use them as the offset for further
   * calculations. This will result in the pointer being centered in the middle
   * of the viewport.
   */
  calibrate () {
    // const offset = this.gyroscope.getOrientation()
    this.gyroscope.center()
    // this.gyroplane.updateOffset(offset)
  }
}
