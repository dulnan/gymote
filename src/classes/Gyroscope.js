import GyroNorm from 'gyronorm'
import { GYRONORM_OPTIONS } from './../settings'

require('@hughsk/fulltilt/dist/fulltilt.min.js')

/**
 * Initializes GyroNorm for reading the orientation from the gyroscope.
 *
 * @private
 * @class
 */
class Gyroscope {
  constructor () {
    this.gyronorm = new GyroNorm()

    this._hasGyroscope = null
    this._hasGyroscopeResolve = null

    this.alpha = 0
    this.beta = 0

    this.initGyroNorm()
  }

  hasGyroscope () {
    return new Promise((resolve, reject) => {
      if (this._hasGyroscope !== null) {
        return resolve(this._hasGyroscope)
      }

      this._hasGyroscopeResolve = resolve
    })
  }

  /**
   * Initialize GyroNorm.
   */
  initGyroNorm () {
    this.gyronorm.init(GYRONORM_OPTIONS).then(() => {
      const { deviceOrientationAvailable } = this.gyronorm.isAvailable()

      if (deviceOrientationAvailable) {
        this._hasGyroscope = true
        this.start()
      } else {
        this._hasGyroscope = false
      }

      this._hasGyroscopeResolve(this._hasGyroscope)
    }).catch(() => {
      this._hasGyroscope = false
      this._hasGyroscopeResolve(this._hasGyroscope)
    })
  }

  /**
   * Start reading the values from the gyroscope and store them continously.
   */
  start () {
    this.gyronorm.start((data) => {
      this.alpha = data.do.alpha
      this.beta = data.do.beta
    })
  }

  /**
   * Return the rounded device orientation values.
   *
   * @param {Number} rounding The rounding precision.
   * @returns {DeviceOrientation} The orientation.
   */
  getOrientation (rounding = 1) {
    return {
      alpha: Math.round(this.alpha * rounding) / rounding,
      beta: Math.round(this.beta * rounding) / rounding
    }
  }
}

export default Gyroscope
