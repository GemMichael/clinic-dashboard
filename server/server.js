const WebSocket = require("ws");

const wss = new WebSocket.Server({
  port: 3000,
  perMessageDeflate: false,
});

console.log("WebSocket server running on ws://0.0.0.0:3000");

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (data) => {
    console.log("Audio received:", data.length);

    // broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});