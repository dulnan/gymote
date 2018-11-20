export const MESSAGE = {
  PING: 'PING',
  REMOTE_DATA: 'RD',
  REMOTE_CALIBRATED: 'RO',
  SCREEN_VIEWPORT: 'SV',
  SCREEN_DISTANCE: 'SD'
}

export const EVENT = {
  CONNECTED: 'connected',
  USING_FALLBACK: 'usingFallback',
  CONNECTION_TIMEOUT: 'connectionTimeout',
  CONNECTION_ERROR: 'connectionError',
  DISCONNECTED: 'disconnected',
  RESTORABLE: 'restorable',
  LAG_START: 'lagstart',
  LAG_END: 'lagend',
  POINTER_MOVE: 'pointermove',
  POINTER_UP: 'pointerup',
  POINTER_DOWN: 'pointerdown',
  CALIBRATED: 'calibrated',
  TOUCH: 'touch'
}

export const GYRONORM_OPTIONS = {
  frequency: 5,
  decimalCount: 7
}
