# Gymote
JavaScript library to use a device with a gyroscope (like every smartphone from
the last few years) as a pointing device for a screen.

[Documentation / API](https://gymote.dulnan.net)

<hr>

The library consists of two parts: GymoteRemote and GymoteScreen, with the idea
that both run on different devices.

It's built around the idea that a WebRTC or WebSocket connection is used to send
data. To keep latency as low as possible, data ist sent as an ArrayBuffer. 

## GymoteRemote
The remote reads out the values of the gyroscope, calculate where the device is
pointing at and return the x and y coordinates on the screen. For this to work,
it needs to be aware of these two values:

- Size of the screen in pixels
- Distance from the phone to the screen, measured in pixels, relative to the
  viewport width.

You need to somehow pass this information to the remote whenever it changes.

In addition, the remote supports clicking and touch events, but again you have
to update the state yourself, by having a button, attach event listeners to it
and so on.

Once all is wired up you need to send the remote data to the screen whenever it
changes. The remote doesn't emit an event for that, you have to pass a function
which will received the data as the first argument. In there you send the data
via your WebRTC or WebSocket connection.

### Requesting access to gyroscope
Starting with iOS 12.2 accessing device motion data (like gyroscope) requires
permission from the user. As of September 2019 there is no way to check if
permission has been granted, so the best bet is to ask for permission on every
page load.

## GymoteScreen
The "receiving" end is mostly responsible for emitting events based on the
incoming remote data. The data (ArrayBuffer) is passed to the handleRemoteData
function. Common events like pointerdown, pointermove or touch are emitted, so
it should be easy to integrate in various setups.

# Sending data
Gymote was built with low latency and performance in mind. But for achieving the
best results the data needs to be transmitted from the remote to the screen in
the shortes amount of time possible.

[Peersox](https://github.com/dulnan/peersox) was built with exactly this in
mind, providing a client and server to pair two devices and send data via WebRTC
data channels, with WebSocket for signaling and fallback.
