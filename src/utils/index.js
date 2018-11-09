export function buildDataString (alpha, beta, isPressingMain, touchDiffY) {
  const values = [
    alpha,
    beta,
    isPressingMain ? 1 : 0,
    touchDiffY
  ]
  return values.join(';')
}

export function parseDataString (data) {
  const arr = data.split(';')
  const alpha = Math.round(((parseFloat(arr[0]) + 180) % 360) * 100) / 100
  const beta = Math.round(parseFloat(arr[1]) * 100) / 100
  return {
    alpha: alpha,
    beta: beta,
    isPressingMain: arr[2] === '1',
    touchDiffY: parseInt(arr[3]) || 0
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
