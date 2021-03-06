/**
 * @typedef {Object} DeviceOrientation
 * @property {number} alpha The alpha value.
 * @property {number} beta The beta value.
 */

/**
 * @typedef {Object} ScreenPoint
 * @property {number} x The x coordinate.
 * @property {number} y The x coordinate.
 */

/**
  * @module GymoteScreen
  */
import GymoteScreen from './classes/GymoteScreen'

/**
  * @module GymoteRemote
  */
import GymoteRemote from './classes/GymoteRemote'

export default { GymoteRemote, GymoteScreen }
