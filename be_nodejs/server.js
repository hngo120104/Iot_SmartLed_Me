const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const { WebSocketServer } = require('ws');
const client = require('./mqttClient.js');

app.use(cors());
app.use(express.json());

const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });

// mqtt -> web
client.on('message', (topic, payload) => {
  const msg = payload.toString();
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ topic, message: msg }));
    }
  });
});

app.post("/api/led/set", (req, res) => {
  client.publish('led/cmd/set', JSON.stringify(req.body));
  res.send({ok : true});
})


server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});