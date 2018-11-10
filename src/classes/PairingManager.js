import Pairing from './Pairing'

import Cookies from 'js-cookie'

export default class PairingManager {
  constructor (serverUrl, http) {
    this.serverUrl = serverUrl
    this._http = http
  }

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

  savePairing (pairing) {
    Cookies.set('pairing', pairing.toString())
  }

  deletePairing () {
    Cookies.remove('pairing')
  }
}
