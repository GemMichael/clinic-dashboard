import { useEffect, useRef } from "react";

function Room3MicSender({ talking }) {

  const socketRef = useRef(null);

  const talkingRef = useRef(false);

  talkingRef.current = talking;

  useEffect(() => {

    // =========================
    // WEBSOCKET
    // =========================
    socketRef.current = new WebSocket(
      "wss://clinic-dashboard-7.onrender.com"
    );

    socketRef.current.binaryType = "arraybuffer";


    socketRef.current.onopen = async () => {

      socketRef.current.send( 
        JSON.stringify({
          type: "register",
          role: "room3Sender"
        })
      );

      console.log("Mic Connected");

      // =========================
      // GET MICROPHONE
      // =========================
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });

      // =========================
      // AUDIO CONTEXT
      // =========================
      const audioCtx = new (
        window.AudioContext ||
        window.webkitAudioContext
      )({
        sampleRate: 16000
      });

      // =========================
      // SOURCE
      // =========================
      const source =
        audioCtx.createMediaStreamSource(stream);

      // 🔥 SMALLER BUFFER
      const processor =
        audioCtx.createScriptProcessor(
          1024,
          1,
          1
        );

      source.connect(processor);

      processor.connect(audioCtx.destination);

      // =========================
      // AUDIO PROCESS
      // =========================
      processor.onaudioprocess = (e) => {

        if (!talkingRef.current) return;

        const input =
          e.inputBuffer.getChannelData(0);

        const int16 =
          new Int16Array(input.length);

        // 🔥 VOLUME BOOST
        for (let i = 0; i < input.length; i++) {

          let sample = input[i];

          // LIMIT
          sample = Math.max(-1, Math.min(1, sample));

          // CONVERT FLOAT → PCM16
          int16[i] = sample * 28000;
        }

        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {

          console.log(
            "Sending audio:",
            int16.length
          );

          socketRef.current.send(
            int16.buffer
          );
        }
      };
    };

    socketRef.current.onerror = (err) => {

      console.log("Mic Socket Error", err);
    };

    socketRef.current.onclose = () => {

      console.log("Mic Socket Closed");
    };

    return () => {

      if (socketRef.current) {

        socketRef.current.close();
      }
    };

  }, []);

  return null;
}

export default Room3MicSender;