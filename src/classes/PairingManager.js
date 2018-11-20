import Cookies from 'js-cookie'
import Pairing from './Pairing'

/**
 * Manages the initialization, validation and storing of pairings.
 */
export default class PairingManager {
  /**
   * @param {String} serverUrl The URL of the gymote server.
   * @param {*} http A http client, for example axios.
   */
  constructor (serverUrl, http) {
    this.serverUrl = serverUrl
    this._http = http
  }

  /**
   * Check for pairings stored in a cookie, validate them and return them.
   *
   * @param {Function} cb The callback, which will receive the pairing.
   */
  getStoredPairing (cb) {
    const cookie = Cookies.get('pairing')

    if (cookie) {
      try {
        const pairing = JSON.parse(cookie)
        this._http.post(this.serverUrl + '/pairing/validate', pairing).then((response) => {
          const isValid = response.data.isValid
          if (isValid) {
            cb(new Pairing(pairing))
          } else {
            this.deletePairing(pairing)
            cb()
          }
        })
      } catch (e) {
        this.deletePairing()
      }
    }
  }

  /**
   * Request a new pairing from the server.
   *
   * @returns {Pairing}
   */
  async requestPairing () {
    let response = false

    try {
      response = await this._http.get(this.serverUrl + '/code/get')
    } catch (e) {
      console.log(e)
    }

    if (response) {
      return new Pairing({
        hash: response.data.hash,
        code: response.data.code,
        device: 'desktop'
      })
    }
  }

  /**
   * Given a code, get the corresponding pairing.
   *
   * @param {Number} code The code to get the pairing from.
   * @returns {Pairing}
   */
  async getHash (code) {
    const response = await this._http.post(this.serverUrl + '/code/validate', {
      code: code
    })

    if (response.data.code && response.data.hash) {
      return new Pairing({
        hash: response.data.hash,
        code: response.data.code
      })
    }

    return {}
  }

  /**
   * Save the given pairing in a cookie.
   *
   * @param {Pairing} pairing The pairing to save.
   */
  savePairing (pairing) {
    Cookies.set('pairing', pairing.toString())
  }

  /**
   * Delete all pairing cookies.
   */
  deletePairing () {
    Cookies.remove('pairing')
  }
}
