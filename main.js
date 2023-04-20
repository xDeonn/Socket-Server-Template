const http = require("http");
const express = require("express");
const fs = require('fs');
const app = express();

app.use(express.static("public"));
// require("dotenv").config();

const serverPort = process.env.PORT || 3000;
const server = http.createServer(app);
const WebSocket = require("ws");

let keepAliveId;

const wss =
  process.env.NODE_ENV === "production"
    ? new WebSocket.Server({ server })
    : new WebSocket.Server({ port: 3001 });

server.listen(serverPort);
console.log(`Server started on port ${serverPort} in stage ${process.env.NODE_ENV}`);

wss.on("connection", function (ws, req) {
  console.log('WebSocket connection established');

    clients.add(ws);
    function SendMessages() {
        messages.slice(-100).forEach((message) => {
            ws.send(JSON.stringify(message));
        });
    }
    setTimeout(SendMessages, 500);

    ws.on('message', (message) => {
        try {
            const json = JSON.parse(message);
            console.log('Received message:', json);
            messages.push(json);
            if (messages.length > 100) {
                messages.shift();
            }
            broadcast(json);
        } catch (error) {
            console.error('Invalid message:', message);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        clients.delete(ws);
    });
});


function broadcast(message) {
  const json = JSON.stringify(message);
  clients.forEach((socket) => {
      socket.send(json);
  });
}

/**
 * Sends a ping message to all connected clients every 50 seconds
 */
 const keepServerAlive = () => {
  keepAliveId = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('ping');
      }
    });
  }, 50000);
};


app.get('/', (req, res) => {
    res.send('Hello World!');
});
