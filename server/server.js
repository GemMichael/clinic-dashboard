const WebSocket = require("ws");

let nurseSender = null;
let nurseReceiver = null;

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

        if (msg.role === "nurseSender") {

          nurseSender = ws;

          console.log(
            "Nurse Sender Registered"
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

        return;
      }

      // ✅ SEND ESP32 AUDIO
      // TO NURSE RECEIVER

      if (
        nurseReceiver &&
        nurseReceiver.readyState ===
        WebSocket.OPEN
      ) {

        nurseReceiver.send(data);
      }
    }
  });

  ws.on("close", () => {

    if (ws === nurseSender)
      nurseSender = null;

    if (ws === nurseReceiver)
      nurseReceiver = null;

    console.log(
      "Client disconnected"
    );
  });

  ws.on("error", (err) => {

    console.log("Socket error:", err.message);
  });
});