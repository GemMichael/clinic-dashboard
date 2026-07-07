const WebSocket = require("ws");

let nurseSender = null;
let nurseReceiver = null;

let room3Sender = null;
let room3Receiver = null;

const port = process.env.PORT || 3000;

const wss = new WebSocket.Server({
    port,
    perMessageDeflate: false,
});

console.log("Room3 Voice Server running:", port);

wss.on("connection", (ws) => {

    console.log("Client connected");

    ws.on("message", (data) => {

        try {

            const msg = JSON.parse(data.toString());

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

                    case "room3Sender":
                        room3Sender = ws;
                        console.log("Registered Room3 Sender");
                        break;

                    case "room3Receiver":
                        room3Receiver = ws;
                        console.log("Registered Room3 Receiver");
                        break;
                }

                return;
            }

        } catch {

            // Nurse -> Room3
            if (
                ws === nurseSender &&
                room3Receiver &&
                room3Receiver.readyState === WebSocket.OPEN
            ) {

                console.log("Nurse -> Room3");

                room3Receiver.send(data);
            }

            // Room3 -> Nurse
            if (
                ws === room3Sender &&
                nurseReceiver &&
                nurseReceiver.readyState === WebSocket.OPEN
            ) {

                console.log("Room3 -> Nurse");

                nurseReceiver.send(data);
            }

        }

    });

    ws.on("close", () => {

        if (ws === nurseSender) nurseSender = null;
        if (ws === nurseReceiver) nurseReceiver = null;

        if (ws === room3Sender) room3Sender = null;
        if (ws === room3Receiver) room3Receiver = null;

        console.log("Client disconnected");

    });

});