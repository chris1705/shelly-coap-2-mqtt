const shelly = require('shelly-coap'),
      mqtt = require('mqtt');

const client = mqtt.connect('mqtt://192.168.1.7');

const sensors = {
  112: 'RELAY0'
};

var isListening = false;

client.on('connect', function () {

  console.log('Connected to MQTT broker!');
    
  if (isListening) return;
  isListening = true;
  shelly.listen((server) => {
    try {
      const message = server.msg;
      const deviceId = message.headers['3332'];
      const payload = JSON.parse(message.payload.toString());
      const genericDevices = payload.G;
      genericDevices.map(createDevice).forEach((device) => {
        try {
          const info = splitName(deviceId);
          const topic = `/home/shelly/${info.serial}/${device.channel}/${device.sensorId}`;
          console.log(topic, device.value);
          client.publish(topic, Buffer.from('' + device.value, 'UTF-8'));
        } catch (e) {
          console.log(e);
        }
      });
    } catch (ee) {
      console.log(ee);
    }
  });

});

client.on('error', (e) => {
  console.log(e);
});

function createDevice(device) {
  return {
    channel: device[0],
    sensorId: device[1],
    value: device[2]
  }
}

function splitName(name) {
  var splitted = name.split('#');
  return {
    hardware: splitted[0],
    serial: splitted[1],
    version: splitted[0]
  }
}