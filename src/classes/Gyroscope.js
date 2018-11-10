import Smoothing from './Smoothing'

import GyroNorm from 'gyronorm'
require('@hughsk/fulltilt/dist/fulltilt.min.js')

const GYRONORM_OPTIONS = {
  frequency: 5,
  decimalCount: 6
}

let smoothAlpha = new Smoothing()
let smoothBeta = new Smoothing()

export default class Gyroscope {
  constructor (fnOrientation) {
    this._fnOrientation = fnOrientation

    this.gyronorm = null
    this.hasGyroscope = false

    this._alphaRaw = 0
    this._betaRaw = 0

    this.orientation = { alpha: 0, beta: 0 }
    this.offset = { alpha: 0, beta: 0 }

    this.isClicking = false

    this._lastOrientationString = ''

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
          this._alphaRaw = data.do.alpha
          this._betaRaw = data.do.beta
        })
      } else {
        this.hasGyroscope = false
      }
    }).catch((e) => {
      this.hasGyroscope = false
      console.log(e)
    })
  }

  startLoop () {
    this.loop()
  }

  loop () {
    this.orientation.alpha = Math.round((smoothAlpha.next((this._alphaRaw + 180) % 360, this.isClicking)) * this.rounding) / this.rounding
    this.orientation.beta = Math.round((smoothBeta.next(this._betaRaw, this.isClicking)) * this.rounding) / this.rounding

    const isClicking = this.isClicking

    this._fnOrientation({
      alpha: this.orientation.alpha,
      beta: this.orientation.beta,
      isClicking: isClicking
    })

    window.requestAnimationFrame(this.loop.bind(this))
  }

  calibrate () {
    this.offset = this.orientation
  }

  getOrientation () {
    return this.orientation
  }
}
