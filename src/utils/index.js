export function encodeRemoteData (coordinates, isClicking, touch) {
  return [
    coordinates.x,
    coordinates.y,
    isClicking ? 1 : 0,
    touch.x,
    touch.y
  ].join(';')
}

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
