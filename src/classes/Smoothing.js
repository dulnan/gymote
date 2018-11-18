/**
 * Slowly ease a value to a new value.
 */
export default class Smoothing {
  constructor (amount) {
    this.prev = 0
    this.prevRaw = 0
    this.smoothing = amount
  }

  /**
   * Get the next eased value.
   *
   * @param {Number} input The input value
   * @param {Boolean} force If true, the value will be updated immediately.
   */
  next (input, force, smoothingOverwrite) {
    const smoothing = smoothingOverwrite || this.smoothing

    if (Math.abs(input - this.prev) > 0.1 || !force) {
      const value = this.prev + smoothing * (input - this.prev)
      this.prev = value

      return value
    } else {
      this.prev = input
      return this.prev
    }
  }
}
