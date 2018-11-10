import Gymote from './Gymote'
import Gyroscope from './Gyroscope'
import { GyroPlane } from 'gyro-plane'
import { LazyBrush } from 'lazy-brush'

import { encodeRemoteData } from './../utils'
import { MESSAGE } from './../settings'

export default class GymoteRemote extends Gymote {
  constructor (serverUrl, http) {
    super(serverUrl, http)

    this.gyroscope = new Gyroscope()
    this.gyro = new GyroPlane({
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
  }

  onConnected (pairing) {
    this.pairingManager.savePairing(pairing, 'remote')
    this.loop()
  }

  onScreenViewport (data) {
    const viewport = JSON.parse(data)
    this.gyro.setScreenDimensions(viewport)
  }

  loop () {
    const rounding = this.isClicking ? 100 : 25
    const orientation = this.gyroscope.getOrientation(rounding)

    this.gyro.updateOrientation(orientation)
    const coordinates = this.gyro.getScreenCoordinates()
    this.lazy.update(coordinates)

    const { x, y } = this.lazy.getBrushCoordinates()
    const remoteDataString = encodeRemoteData({ x: Math.round(x), y: Math.round(y) }, this.isClicking, this.touch)

    if (remoteDataString !== this.prevDataString) {
      this.connection.send(MESSAGE.REMOTE_DATA, remoteDataString)
      this.prevDataString = remoteDataString
    }

    window.requestAnimationFrame(this.loop.bind(this))
  }

  async getPairingByCode (code) {
    const pairing = await this.pairingManager.getHash(code)
    return pairing
  }

  updateViewport (viewport) {
    this.viewport = viewport
  }

  updateClick (isClicking) {
    this.isClicking = isClicking
  }

  updateTouch (touch) {
    this.touch = touch
  }

  calibrate () {
    const offset = this.gyroscope.getOrientation()
    this.gyro.updateOffset(offset)
  }
}
