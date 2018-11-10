// import Smoothing from './Smoothing'

import GyroNorm from 'gyronorm'
require('@hughsk/fulltilt/dist/fulltilt.min.js')

const GYRONORM_OPTIONS = {
  frequency: 5,
  decimalCount: 6
}

// let smoothAlpha = new Smoothing()
// let smoothBeta = new Smoothing()

export default class Gyroscope {
  constructor () {
    this.gyronorm = null
    this.hasGyroscope = false

    this.alpha = 0
    this.beta = 0

    this.initGyroscope()
  }

  get rounding () {
    return this.isClicking ? 100 : 25
  }

  initGyroscope () {
    this.gyronorm = new GyroNorm()

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

  getOrientation (rounding = 1) {
    return {
      alpha: Math.round(this.alpha * rounding) / rounding,
      beta: Math.round(this.beta * rounding) / rounding
    }
  }
}
