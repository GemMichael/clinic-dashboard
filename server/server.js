const WebSocket = require("ws");
let nurseSender = null;
let nurseReceiver = null;

let room2Sender = null;
let room2Receiver = null;

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

        switch (msg.role) {

          case "nurseSender":
            nurseSender = ws;
            break;

          case "nurseReceiver":
            nurseReceiver = ws;
            break;

          case "room2Sender":
            room2Sender = ws;
            break;

          case "room2Receiver":
            room2Receiver = ws;
            break;
        }

        return;
      }

    } catch {

      if (
        ws.role === "nurseSender" &&
        room2Receiver &&
        room2Receiver.readyState === WebSocket.OPEN
      ) {

        console.log("Nurse -> Room2");

        room2Receiver.send(data);
      }

      if (
        ws.role === "room2Sender" &&
        nurseReceiver &&
        nurseReceiver.readyState === WebSocket.OPEN
      ) {

        console.log("Room2 -> Nurse");

        nurseReceiver.send(data);
      }

    }
  });

  ws.on("close", () => {
    if (ws === nurseSender)
      nurseSender = null;

    if (ws === nurseReceiver)
      nurseReceiver = null;

    if (ws === room2Sender)
      room2Sender = null;

    if (ws === room2Receiver)
      room2Receiver = null;

    console.log("Client disconnected");
  });

  ws.on("error", (err) => {

    console.log("Socket error:", err.message);
  });
});