const WebSocket = require("ws");

let nurseSender = null;
let nurseReceiver = null;

let room1Sender = null;
let room1Receiver = null;

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

        if (msg.role === "room1Receiver") {

          room1Receiver = ws;

          console.log(
            "Room1 Receiver Registered"
          );
        }

        ws.role = msg.role;

        if (msg.role === "nurseSender") {

          nurseSender = ws;

          console.log(
            "Nurse Sender Registered"
          );
        }

        if (msg.role === "room1Sender") {

          room1Sender = ws;

          console.log(
            "Room1 Sender Registered"
          );
        }

        if (msg.role === "nurseReceiver") {

          nurseReceiver = ws;

          console.log(
            "Nurse Receiver Registered"
          );
        }

        return;
      }

    } catch {

      console.log(
        "Audio packet:",
        data.length
      );

      // 🚫 DON'T SEND NURSE AUDIO
      // BACK TO NURSE

      if (ws === nurseSender) {

        if (
          room1Receiver &&
          room1Receiver.readyState === WebSocket.OPEN
        ) {

          console.log(
            "Forwarding Nurse -> Room1",
            data.length
          );

          room1Receiver.send(data);
        }

        return;
      }

      // ✅ SEND ESP32 AUDIO
      // TO NURSE RECEIVER

      if (
        nurseReceiver &&
        nurseReceiver.readyState ===
        WebSocket.OPEN
      ) {
        console.log(
          "Forwarding Room1 -> Nurse",
          data.length
        );

        nurseReceiver.send(data);
      }
    }
  });

  ws.on("close", () => {

    if (ws === nurseSender)
      nurseSender = null;

    if (ws === nurseReceiver)
      nurseReceiver = null;

    if (ws === room1Sender)
      room1Sender = null;

    console.log(
      "Client disconnected"
    );
  });

  ws.on("error", (err) => {

    console.log("Socket error:", err.message);
  });
});