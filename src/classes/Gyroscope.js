import GyroNorm from 'gyronorm'
import { GYRONORM_OPTIONS } from './../utils'

require('@hughsk/fulltilt/dist/fulltilt.min.js')

/**
 * Initializes GyroNorm for reading the orientation from the gyroscope.
 */
export default class Gyroscope {
  constructor () {
    this.gyronorm = new GyroNorm()

    this.hasGyroscope = false

    this.alpha = 0
    this.beta = 0

    this.initGyroNorm()
  }

  /**
   * Initialize GyroNorm.
   */
  initGyroNorm () {
    this.gyronorm.init(GYRONORM_OPTIONS).then(() => {
      const isAvailable = this.gyronorm.isAvailable()

      if (isAvailable) {
        this.hasGyroscope = true

        this.gyronorm.start((data) => {
          this.alpha = data.do.alpha
          this.beta = data.do.beta
        })
      } else {
        this.hasGyroscope = false
      }
    }).catch((e) => {
      this.hasGyroscope = false
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
