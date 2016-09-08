var noble = require('noble');

var ESTIMOTE_SERVICE_UUID = 'fe9a';

var ESTIMOTE_FRAME_TYPE_TELEMETRY = 2;

var ESTIMOTE_TELEMETRY_SUBFRAME_A = 0;
var ESTIMOTE_TELEMETRY_SUBFRAME_B = 1;

noble.on('stateChange', function(state) {
  console.log('state has changed', state);
  if (state == 'poweredOn') {
    var serviceUUIDs = [ESTIMOTE_SERVICE_UUID]; // Estimote Service
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
    return el.uuid == ESTIMOTE_SERVICE_UUID;
  }).data;

  // byte 0, lower 4 bits => frame type, for Telemetry it's always 2 (i.e., 0b0010)
  var frameType = data.readUInt8(0) & 0b00001111;
  if (frameType != ESTIMOTE_FRAME_TYPE_TELEMETRY) { return; }

  // byte 0, upper 4 bits => Telemetry protocol version
  var protocolVersion = (data.readUInt8(0) & 0b11110000) >> 4;

  // bytes 1, 2, 3, 4, 5, 6, 7, 8 => first half of the identifier of the beacon
  var shortIdentifier = data.toString('hex', 1, 9);

  // byte 9, lower 2 bits => Telemetry subframe type
  // to fit all the telemetry data, we currently use two packets, "A" and "B"
  var subFrameType = data.readUInt8(9) & 0b00000011;

  // ****************
  // * SUBFRAME "A" *
  // ****************
  if (subFrameType == ESTIMOTE_TELEMETRY_SUBFRAME_A) {
    // ***** ACCELERATION
    // byte 10 => acceleration on the X axis
    // byte 11 => acceleration on the Y axis
    // byte 12 => acceleration on the Z axis
    // signed (two's complement) 8-bit integer
    // raw_value * 2 / 127.0 = acceleration in "g-unit" (http://www.helmets.org/g.htm)
    var acceleration = {
      x: data.readInt8(10) * 2 / 127.0,
      y: data.readInt8(11) * 2 / 127.0,
      z: data.readInt8(12) * 2 / 127.0
    };

    // ***** MOTION STATE
    // byte 15, lower 2 bits => motion state
    // 0b00 ("0") when not moving, 0b01 ("1") when moving
    var isMoving = (data.readUInt8(15) & 0b00000011) == 1;

    // ***** MOTION STATE DURATION
    // byte 13 => "previous" motion state duration
    // byte 14 => "current" motion state duration
    // e.g., if the beacon is currently still, "current" will state how long
    // it's been still and "previous" will state how long it's previously been
    // in motion before it stopped moving
    //
    // motion state duration is composed of two parts:
    // - lower 6 bits is a NUMBER
    // - upper 2 bits is a unit:
    //     - 0b00 ("0") => seconds
    //     - 0b01 ("1") => minutes
    //     - 0b10 ("2") => hours
    //     - 0b11 ("3") => days if NUMBER is < 32
    //                     if it's >= 32, then it's "NUMBER - 32" weeks
    var parseMotionStateDuration = function(byte) {
      var number = byte & 0b00111111;
      var unitCode = (byte & 0b11000000) >> 6;
      var unit;
      if (unitCode == 0) {
        unit = 'seconds';
      } else if (unitCode == 1) {
        unit = 'minutes';
      } else if (unitCode == 2) {
        unit = 'hours';
      } else if (unitCode == 3 && number < 32) {
        unit = 'days';
      } else {
        unit = 'weeks';
      }
      return {number: number, unit: unit};
    }
    var motionStateDuration = {
      previous: parseMotionStateDuration(data.readUInt8(13)),
      current: parseMotionStateDuration(data.readUInt8(14))
    };

    // ***** GPIO
    // byte 15, upper 4 bits => state of GPIO pins, one bit per pin
    // 0 = state "low", 1 = state "high"
    var gpio = {
      pin0: (data.readUInt8(15) & 0b00010000) >> 4 ? 'high' : 'low',
      pin1: (data.readUInt8(15) & 0b00100000) >> 5 ? 'high' : 'low',
      pin2: (data.readUInt8(15) & 0b01000000) >> 6 ? 'high' : 'low',
      pin3: (data.readUInt8(15) & 0b10000000) >> 7 ? 'high' : 'low',
    };

    // ***** ERROR CODES
    var errors;
    if (protocolVersion == 2) {
      // in protocol version "2"
      // byte 15, bits 2 & 3 => error codes
      // bit 2 = firmware error
      // bit 3 = Real-Time Clock error
      errors = {
        hasFirmwareError: ((data.readUInt8(15) & 0b00000100) >> 2) == 1,
        hasClockError: ((data.readUInt8(15) & 0b00001000) >> 3) == 1
      };
    } else if (protocolVersion == 1) {
      // in protocol version "1"
      // byte 16, lower 2 bits => error codes
      // bit 0 = firmware error
      // bit 1 = Real-Time Clock error
      errors = {
        hasFirmwareError: (data.readUInt8(16) & 0b00000001) == 1,
        hasClockError: ((data.readUInt8(16) & 0b00000010) >> 1) == 1
      };
    } else if (protocolVersion == 0) {
      // in protocol version "0", error codes are in subframe "B" instead
    }

    // ***** ATMOSPHERIC PRESSURE
    var pressure;
    if (protocolVersion == 2) {
      // added in protocol version "2"
      // bytes 16, 17, 18, 19 => atmospheric pressure
      // unsigned 32-bit integer
      // little-endian encoding, i.e., least-significant byte comes first
      //   e.g., if bytes are 16th = 0x12, 17th = 0x34, 18th = 0x56, 19th = 0x78
      //         then the value is 0x78563412
      // raw_value / 256.0 = atmospheric pressure in pascals (Pa)
      // note that unlike what you see on the weather forecast, this value is
      // not normalized to the sea level!
      pressure = data.readUInt32LE(16) / 256.0;
    }

    console.log({shortIdentifier, protocolVersion, acceleration, isMoving,
      motionStateDuration, gpio, errors, pressure});
  } else if (subFrameType == ESTIMOTE_TELEMETRY_SUBFRAME_B) {

  }
});
