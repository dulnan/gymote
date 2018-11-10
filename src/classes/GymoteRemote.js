import Gymote from './Gymote'
import Gyroscope from './Gyroscope'

export default class GymoteRemote extends Gymote {
  constructor (serverUrl, http) {
    super(serverUrl, http)

    this.isClicking = false
    this.gyroscope = new Gyroscope(this.updateOrientation.bind(this))

    this.viewport = { width: 0, height: 0 }

    this.connection.on('connected', this.handleConnected.bind(this))
  }

  handleConnected () {
    this.gyroscope.startLoop()
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
    this.gyroscope.isClicking = isClicking
  }

  updateOrientation (orientation) {
    this.connection.send('Orientation', orientation)
  }

  updateTouch (touch) {
    this.connection.send('Touch', touch)
  }

  calibrate () {
    const orientation = this.gyroscope.getOrientation()
    this.connection.send('Orientation', orientation)
  }
}
