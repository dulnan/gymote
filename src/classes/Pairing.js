/**
 * A pairing used to pair a remote and screen device.
 */
export default class Pairing {
  /**
   * @param {String} options
   * @param {String} options.code The code used to retrive a hash.
   * @param {String} options.hash The hash used to initialize the pairing.
   * @param {String} options.device The device (remote or screen).
   */
  constructor ({ code = '', hash = '', device = '' } = {}) {
    this.device = device
    this.hash = hash
    this.code = code
  }

  /**
   * Return an object of the pairing values.
   *
   * @returns {Object}
   */
  toObject () {
    return {
      device: this.device,
      hash: this.hash,
      code: this.code
    }
  }

  /**
   * Return a stringified representation of a pairing.
   *
   * @returns {String}
   */
  toString () {
    return JSON.stringify(this.toObject())
  }
}
