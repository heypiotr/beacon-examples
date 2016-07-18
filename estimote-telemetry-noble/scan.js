var noble = require('noble');

var ESTIMOTE_FRAME_TYPE_TELEMETRY = 2;

var ESTIMOTE_TELEMETRY_SUBFRAME_A = 0;
var ESTIMOTE_TELEMETRY_SUBFRAME_B = 1;

noble.on('stateChange', function(state) {
  console.log('state has changed', state);
  if (state == 'poweredOn') {
    var serviceUUIDs = ['fe9a']; // Estimote Service
    var allowDuplicates = true;
    noble.startScanning(serviceUUIDs, allowDuplicates, function(error) {
      if (error) {
        console.log('error starting scanning', error);
      } else {
        console.log('started scanning');
      }
    });
  }
});

noble.on('discover', function(peripheral) {
  var data = peripheral.advertisement.serviceData.find(function(el) {
    return el.uuid == 'fe9a';
  }).data;

  var frameType = data.readUInt8(0) & 0b00001111;
  if (frameType != ESTIMOTE_FRAME_TYPE_TELEMETRY) { return; }

  var protocolVersion = (data.readUInt8(0) & 0b11110000) >> 4;
  // firmware version 4.5.0 and later broadcast protocol version 0
  // for firmware version >= 4.0.0 && < 4.5.0, use protocol version 1
  if (protocolVersion != 1) { return; }

  var shortIdentifier = data.toString('hex', 1, 9);

  var subFrameType = data.readUInt8(9) & 0b00000011;
  if (subFrameType == ESTIMOTE_TELEMETRY_SUBFRAME_A) {
    var accelerationX = data.readUInt8(10) * 2 / 127.0;
    var accelerationY = data.readUInt8(11) * 2 / 127.0;
    var accelerationZ = data.readUInt8(12) * 2 / 127.0;
    var isMoving = (data.readUInt8(15) & 0b00000011) == 1;

    console.log({
      shortIdentifier: shortIdentifier,
      acceleration: {
        x: accelerationX,
        y: accelerationY,
        z: accelerationZ
      },
      isMoving: isMoving
    });
  } else if (subFrameType == ESTIMOTE_TELEMETRY_SUBFRAME_B) {

  }
});
