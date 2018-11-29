import EventEmitter from 'eventemitter3'

import { EVENT } from './../settings/index.js'

/**
 * The base Gymote class.
 *
 * Initializes the pairing manager and connection handler.
 */
export default class Gymote extends EventEmitter {
  /**
   * @param {String} serverUrl The URL of the gymote server.
   * @param {*} http A http client, for example axios.
   */
  constructor () {
    super()

    this._send = () => {}
  }
}
