# Estimote Telemetry (runnable) specification

Simply read the (well-documented!) `scan.js` file to learn how the Estimote Telemetry packets are constructed and how to parse them.

But, the best part is, you can also run it!

You'll need:

- Node.js (e.g., from here: https://nodejs.org/en/, or on macOS, you could use [homebrew][h] and `brew install node`)
- meet the [_noble_ prerequisites][n] (_noble_ is a Node.js library that does BLE scanning)
- clone this repo and run `npm install` in this directory—this will install _noble_
- run `node scan.js`

[h]: http://brew.sh/
[n]: https://github.com/sandeepmistry/noble#prerequisites

Naturally, you'll also need some Estimote Beacons broadcasting the Telemetry packet (-:

You can learn more about which Estimote Beacons support it and how to enable it on Estimote Developer portal:

[Estimote Telemetry](http://developer.estimote.com/sensors/estimote-telemetry/)

For any questions, post on [Estimote Forums][ef], or mail us at <contact@estimote.com>.

[ef]: https://forums.estimote.com/
