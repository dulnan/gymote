/**
 * Encode the remote data for sending to the screen.
 *
 * @param {ScreenPoint} coordinates The pointer position.
 * @param {Boolean} isClicking The click status.
 * @param {ScreenPoint} touch The coordinates of the touch.
 *
 * @returns {String} The string representation of the data.
 */
export function encodeRemoteData (coordinates, isClicking, touch) {
  return [
    coordinates.x,
    coordinates.y,
    isClicking ? 1 : 0,
    touch.x,
    touch.y
  ].join(';')
}

/**
 * Decode the remote data string.
 *
 * @param {String} data The string representation of the data.
 * @returns {Object}
 */
export function decodeRemoteData (data) {
  const arr = data.split(';')
  const x = parseInt(arr[0])
  const y = parseInt(arr[1])
  return {
    coordinates: {
      x,
      y
    },
    isClicking: arr[2] === '1',
    touch: {
      x: parseInt(arr[3]) || 0,
      y: parseInt(arr[4]) || 0
    }
  }
}
