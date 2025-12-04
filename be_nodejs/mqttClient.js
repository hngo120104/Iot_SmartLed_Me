const mqtt = require('mqtt');

const client = mqtt.connect('mqtts://ddfcdef7ae004b43a84d4f38a2709f6c.s1.eu.hivemq.cloud', {
    username: "astrios04",
    password: "Hoang12124@"
}); 

client.on('connect', () => {
    console.log('Connected to HiveMQ Cloud MQTT broker');
    client.subscribe([
        'led/state/env',
        'led/state/env/history'
    ]);
});

module.exports = client;
