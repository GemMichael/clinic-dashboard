const WebSocket = require("ws");

let nurse = null;
let room2 = null;

const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({
  port,
  perMessageDeflate: false,
});

console.log(
  "Room2 Voice Server running:",
  port
);

wss.on("connection", (ws) => {

  console.log("Client connected");

  ws.on("message", (data) => {

    try {

      const msg =
        JSON.parse(data.toString());

      if (msg.type === "register") {

        if (msg.role === "nurse") {

          nurse = ws;

          console.log(
            "Nurse Connected"
          );
        }

        if (msg.role === "room2") {

          room2 = ws;

          console.log(
            "Room2 Connected"
          );
        }

        return;
      }

    } catch {

      // NURSE -> ROOM2

      if (
        ws === nurse &&
        room2 &&
        room2.readyState === WebSocket.OPEN
      ) {

        console.log(
          "Nurse -> Room2"
        );

        room2.send(data);
      }

      // ROOM2 -> NURSE

      if (
        ws === room2 &&
        nurse &&
        nurse.readyState === WebSocket.OPEN
      ) {

        console.log(
          "Room2 -> Nurse"
        );

        nurse.send(data);
      }
    }

  });

  ws.on("close", () => {

    if (ws === nurse)
      nurse = null;

    if (ws === room2)
      room2 = null;

    console.log(
      "Client disconnected"
    );
  });

});