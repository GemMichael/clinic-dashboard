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

console.log("Room2 Voice Server running:", port);

wss.on("connection", (ws) => {

  ws.on("message", (data) => {

    try {

      const msg =
        JSON.parse(data.toString());

      if (msg.type === "register") {

        switch (msg.role) {

          case "nurseSender":
            nurseSender = ws;
            console.log("Registered Nurse Sender");
            break;

          case "nurseReceiver":
            nurseReceiver = ws;
            console.log("Registered Nurse Receiver");
            break;

          case "room2Sender":
            room2Sender = ws;
            console.log("Registered Room2 Sender");
            break;

          case "room2Receiver":
            room2Receiver = ws;
            console.log("Registered Room2 Receiver");
            break;
        }

        return;
      }

    } catch {

      if (
        ws === nurseSender &&
        room2Receiver &&
        room2Receiver.readyState === WebSocket.OPEN
      ) {

        console.log("Nurse -> Room2");

        room2Receiver.send(data);
      }

      if (
        ws === room2Sender &&
        nurseReceiver &&
        nurseReceiver.readyState === WebSocket.OPEN
      ) {

        console.log("Room2 -> Nurse");

        nurseReceiver.send(data);
      }

    }

  });

  ws.on("close", () => {

    if (ws === nurseSender) nurseSender = null;
    if (ws === nurseReceiver) nurseReceiver = null;
    if (ws === room2Sender) room2Sender = null;
    if (ws === room2Receiver) room2Receiver = null;

  });

});