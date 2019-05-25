import Gyroscope from './Gyroscope'
import { GyroPlane } from 'gyro-plane'
import { LazyBrush } from 'lazy-brush'

/**
 * Manages the remote part of a gymote setup.
 *
 * Initializes the Gyroscope class for reading orientation values and a gyro-
 * plane class for calculating the screen coordinates.
 *
 * @example
 * const gymote = new GymoteRemote()
 *
 * // First check if the device has a gyroscope. This function returns a
 * // promise, so wait until it has been resolved and then attach functions,
 * // event listeners and start reading the values.
 * gymote.deviceHasGyroscope().then((hasGyroscope) => {
 *   if (hasGyroscope) {
 *     // Set the function responsible to send data to the peer.
 *     gymote._onDataChange = peerConnection.send.bind(peerConnection)
 *
 *     // Start the reading of the gyroscope values.
 *     gymote.start()
 *
 *     // Assuming you have a button to function as the "mouse button", attach
 *     // touch event listeners to update the clicking state.
 *     myButton.addEventListener('touchstart', () => {
 *       gymote.updateClick(true)
 *     })
 *
 *     myButton.addEventListener('touchend', () => {
 *       gymote.updateClick(false)
 *     }
 *   }
 * })
 *
 * @class
 */
class GymoteRemote {
  constructor () {
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

    this.buffer = new ArrayBuffer(8)
    this.intArray = new Int16Array(this.buffer, 0, 4)

    this.prevArray = new Int16Array(4)

    this.shouldLoop = false

    this._onDataChange = () => {}
  }

  /**
   * Check if the device has a gyroscope and it can be accessed.
   *
   * @returns {Promise<boolean>}
   */
  deviceHasGyroscope () {
    return this.gyroscope.hasGyroscope()
  }

  /**
   * Start the data loop when the connected event is emitted.
   */
  start () {
    this.shouldLoop = true
    this.loop()
  }

  /**
   * Stop the data loop.
   */
  stop () {
    this.shouldLoop = false
  }

  /**
   * Received from GymoteScreen when the viewport of the screen device changes.
   *
   * @param {string} message The received message containing the stringified
   * viewport object.
   */
  updateScreenViewport (viewport) {
    this.gyroplane.setScreenDimensions(viewport)
  }

  /**
   * Received from GymoteScreen when the distance has changed.
   *
   * @param {string} message The received message containing the numeric
   * distance.
   */
  updateScreenDistance (distance) {
    this.gyroplane.setDistance(distance)
  }

  /**
   * The requestAnimationFrame loop for gathering data from the gyroscope and
   * this instance's state.
   */
  loop () {
    if (!this.shouldLoop) {
      return
    }

    window.requestAnimationFrame(this.loop.bind(this))

    // When not clicking the orientation values can be rounded more, so that
    // less messages are sent.
    const rounding = this.isClicking ? 100 : 25
    const orientation = this.gyroscope.getOrientation(rounding)

    this.gyroplane.updateOrientation(orientation)

    try {
      const coordinates = this.gyroplane.getScreenCoordinates()
      this.lazy.update(coordinates)
    } catch (e) {
      this.gyroplane.init()
    }

    // Get the lazy coordinates.
    const { x, y } = this.lazy.getBrushCoordinates()

    // Set the new values to the array.
    this.intArray.set([
      Math.round(x),
      Math.round(y),
      this.isClicking ? 1 : 0,
      Math.round(this.touch.y)
    ], 0)

    // Only send the data if it actually has changed.
    if (
      this.prevArray[0] !== this.intArray[0] ||
      this.prevArray[1] !== this.intArray[1] ||
      this.prevArray[2] !== this.intArray[2] ||
      this.prevArray[3] !== this.intArray[3]
    ) {
      this._onDataChange(this.buffer)
      this.prevArray.set(this.intArray, 0)
    }
  }

  /**
   * Updates isClicking.
   *
   * @param {boolean} isClicking
   */
  updateClick (isClicking) {
    this.isClicking = isClicking
  }

  /**
   * Update the touch coordinates.
   *
   * @param {object} touch The touch position.
   * @param {number} touch.x The x coordinate of the touch.
   * @param {number} touch.y The y coordinate of the touch.
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
    const offset = this.gyroscope.getOrientation()
    this.gyroplane.updateOffset(offset)
  }
}

export default GymoteRemote
