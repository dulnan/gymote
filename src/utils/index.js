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

export function setCookie (name, value, days) {
  var expires = ''

  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

export function getCookie (name) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';')

  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function eraseCookie (name) {
  document.cookie = name + '=; Max-Age=-99999999;'
}
