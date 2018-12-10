import Smoothing from './Smoothing'
import { Point, LazyPoint } from 'lazy-brush'
import EventEmitter from 'eventemitter3'

import { EVENT } from './../settings'

/**
 * Manages the screen part of a gymote setup.
 *
 * It needs to receive the result from the GymoteRemote onDataChange function.
 * The data needs to be passed to the handleRemoteData function where it is
 * processed and the matching events emitted.
 *
 * @example
 * const gymote = new GymoteScreen()
 *
 * // Directly pass incoming data (e.g. from a WebRTC data connection) to the
 * // remote data handler.
 * peerConnection.on('data', gymote.handleRemoteData.bind(gymote))
 *
 * gymote.on('pointermove', ({ x, y }) => {
 *   // Do something with the coordinates.
 * })
 *
 * gymote.on('touch', ({ x, y }) => {
 *   // The touch position has changed.
 * })
 *
 * @class
 * @extends EventEmitter
 * @fires GymoteScreen#lagstart
 * @fires GymoteScreen#lagend
 * @fires GymoteScreen#pointermove
 * @fires GymoteScreen#pointerup
 * @fires GymoteScreen#pointerdown
 * @fires GymoteScreen#calibrated
 * @fires GymoteScreen#touch
 */
class GymoteScreen extends EventEmitter {
  constructor () {
    super()

    this.isClicking = false

    this.smoothX = new Smoothing(0.3)
    this.smoothY = new Smoothing(0.3)

    this.coordinates = new LazyPoint(0, 0)
    this.touch = new LazyPoint(0, 0)

    this.lastDataTimestamp = 0

    this.hasRemoteDelay = false
  }

  /**
   * Get the smoothed coordinates from the last received remote message.
   * Depending on the given dataDelta, the smoothing is adjusted. With that,
   * when a small lag has happened, the pointer is not moved immediately to the
   * new position.
   *
   * @param {Number} x The new x coordinate from the remote.
   * @param {Number} y The new y coordinate from the remote.
   * @param {Number} dataDelta The delta in ms from the last message.
   */
  getCoordinates (x, y, dataDelta) {
    const smoothing = (200 - Math.min(dataDelta, 200)) / 300

    return new Point(
      Math.round(this.smoothX.next(x, false, smoothing)),
      Math.round(this.smoothY.next(y, false, smoothing))
    )
  }

  /**
   * Received from the device of GymoteRemote. The message contains the pointer
   * coordinates, touch coordinates and a boolean indicating if the user is
   * clicking.
   *
   * The data is received as Uint8Array, but has been sent as Int16Array. So we
   * take the buffer of the typed array and create a new one with the correct
   * type.
   *
   * @param {ArrayBuffer} data The data from the Remote.
   */
  handleRemoteData (buffer) {
    // Create a new array with the correct type.
    const intArray = new Int16Array(buffer)

    // Get and set the current timestamp.
    const now = Date.now()
    this.lastDataTimestamp = now

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

    this._touchDataHandler(0, intArray[3] || 0)
    this._pointerDataHandler(
      intArray[0] || 0,
      intArray[1] || 0,
      (intArray[2] || 0) === 1,
      dataDelta
    )
  }

  /**
   * Handle incoming coordinate data for the pointer.
   *
   * @private
   * @param {number} x The new x coordinate of the remote.
   * @param {number} y The new y coordinate of the remote.
   * @param {boolean} isClicking If the pointer is clicking.
   * @param {number} dataDelta The time delta in ms since the last message.
   */
  _pointerDataHandler (x, y, isClicking, dataDelta) {
    // Get the new coordinates.
    const newCoordinates = this.getCoordinates(x, y, dataDelta)

    // Only emit the pointermove event if the coordinates have actually changed.
    if (!this.coordinates.equalsTo(newCoordinates)) {
      this.emit(EVENT.POINTER_MOVE, newCoordinates)
      this.coordinates.update(newCoordinates)
    }

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
   * Handle incoming touch data.
   *
   * @private
   * @param {Number} x The x coordinates of the touchmove.
   * @param {Number} y The y coordinates of the touchmove.
   */
  _touchDataHandler (x, y) {
    const newTouch = new Point(x, y)

    if (!this.touch.equalsTo(newTouch)) {
      this.emit(EVENT.TOUCH, newTouch)
      this.touch.update(newTouch)
    }
  }
}

/**
 * The remote lag has exceeded the threshold.
 *
 * @member
 * @event GymoteScreen#lagstart
 */

/**
 * @member
 * @type {string}
 */
GymoteScreen.EVENT_LAG_START = EVENT.LAG_START

/**
 * The remote lag has returned below the threshold.
 *
 * @member
 * @event GymoteScreen#lagend
 */

/**
 * @member
 * @type {string}
 */
GymoteScreen.EVENT_LAG_END = EVENT.LAG_END

/**
 * The pointer has moved.
 *
 * @member
 * @event GymoteScreen#pointermove
 * @type {ScreenPoint}
 */

/**
 * @member
 * @type {string}
 */
GymoteScreen.EVENT_POINTER_MOVE = EVENT.POINTER_MOVE

/**
 * The pointer was released.
 *
 * @member
 * @event GymoteScreen#pointerup
 * @type {ScreenPoint}
 */

/**
 * @member
 * @type {string}
 */
GymoteScreen.EVENT_POINTER_UP = EVENT.POINTER_UP

/**
 * The pointer is pressing.
 *
 * @member
 * @event GymoteScreen#pointerdown
 * @type {ScreenPoint}
 */

/**
 * @member
 * @type {string}
 */
GymoteScreen.EVENT_POINTER_DOWN = EVENT.POINTER_DOWN

/**
 * The gyroscope has been calibrated.
 *
 * @member
 * @event GymoteScreen#calibrated
 */

/**
 * @member
 * @type {string}
 */
GymoteScreen.EVENT_CALIBRATED = EVENT.CALIBRATED

/**
 * The touch values have changed.
 *
 * @member
 * @event GymoteScreen#touch
 * @type {ScreenPoint}
 */

/**
 * @member
 * @type {string}
 */
GymoteScreen.EVENT_TOUCH = EVENT.TOUCH

export default GymoteScreen
