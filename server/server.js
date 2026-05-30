const WebSocket = require("ws");
let nurseSocket = null;
let room2Socket = null;

const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({
  port,
  perMessageDeflate: false,
});

console.log("WebSocket running on port:", port);

wss.on("connection", (ws, req) => {

  ws.role = null;

  console.log(
    "Client connected:",
    req.socket.remoteAddress
  );

  ws.on("message", (data) => {

    try {

      const msg =
        JSON.parse(data.toString());

      if (msg.type === "register") {

        ws.role = msg.role;

        console.log(
          "Registered:",
          ws.role
        );

        if (ws.role === "nurse") {

          nurseSocket = ws;
        }

        if (ws.role === "room2") {

          room2Socket = ws;
        }

        return;
      }

    } catch {

      // AUDIO FROM NURSE

      if (
        ws.role === "nurse" &&
        room2Socket &&
        room2Socket.readyState === WebSocket.OPEN
      ) {

        room2Socket.send(data);
      }

      // AUDIO FROM ROOM2

      if (
        ws.role === "room2" &&
        nurseSocket &&
        nurseSocket.readyState === WebSocket.OPEN
      ) {

        nurseSocket.send(data);
      }
    }

  });

  ws.on("close", () => {

    if (ws === nurseSocket) {

      nurseSocket = null;
    }

    if (ws === room2Socket) {

      room2Socket = null;
    }

    console.log("Client disconnected");
  });

  ws.on("error", (err) => {

    console.log("Socket error:", err.message);
  });
});