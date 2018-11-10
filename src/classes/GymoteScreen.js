import { GyroPlane } from 'gyro-plane'
import { LazyBrush } from 'lazy-brush'
import Gymote from './Gymote.js'
// import { parseDataString } from './../utils/index.js'

export default class GymoteScreen extends Gymote {
  constructor (serverUrl, http) {
    super(serverUrl, http)

    this.gyro = new GyroPlane({
      width: window.innerWidth,
      height: window.innerHeight,
      distance: window.innerWidth * 1.1
    })

    this.lazy = new LazyBrush({
      radius: 5,
      enabled: false
    })

    this.isClicking = false

    this.connection.peer.on('data', this.handleData.bind(this))
  }

  handleData (messageString) {
    const message = JSON.parse(messageString)

    switch (message.name) {
      case 'Orientation':
        const data = message.data

        this.gyro.updateOrientation(data)
        const coordinates = this.gyro.getScreenCoordinates()
        const hasChanged = this.lazy.update(coordinates)
        if (hasChanged) {
          this.emit('pointermove', coordinates)
        }

        if (data.isClicking !== this.isClicking) {
          this.isClicking = data.isClicking

          if (data.isClicking) {
            this.emit('pointerdown')
          } else {
            this.emit('pointerup')
          }
        }

        this.emit('slide', data.touchDiffY)
        break
      case 'OrientationOffset':
        this.gyro.updateOffset(message.data)
        this.emit('calibrated', message.data)
        break
    }
  }

  updateViewport (viewport) {
    this.gyro.setScreenDimensions(viewport)
  }

  async getPairing () {
    const pairing = await this.pairingManager.requestPairing()
    return pairing
  }
}
