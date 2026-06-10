import { useEffect, useRef } from "react";

function MicSender({
  talking,
  activeRoom
}) {

  const socketRef = useRef(null);

  const talkingRef = useRef(false);

  talkingRef.current = talking;

  useEffect(() => {
    console.log(
      "MIC EFFECT RUN"
    );

    let stream;

    // =========================
    // WEBSOCKET
    // =========================
    const wsUrl =
      activeRoom === "room2"

        ? "wss://clinic-dashboard-4.onrender.com"
        : "wss://clinic-dashboard-1-xlgb.onrender.com";
    console.log(
      "MIC CONNECTING TO:",
      wsUrl
    );

    socketRef.current =
      new WebSocket(wsUrl);

    socketRef.current.binaryType = "arraybuffer";

    socketRef.current.onopen = async () => {
      socketRef.current.send(
        JSON.stringify({
          type: "register",
          role: "nurseSender"
        })
      );

      console.log(
        "Registered Nurse Sender"
      );
      console.log("Mic Connected");

      // =========================
      // GET MICROPHONE
      // =========================
      stream =
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

      console.log(
        "Mic Destroyed"
      );

      if (stream) {
        stream.getTracks().forEach(track =>
          track.stop()
        );
      }

      if (socketRef.current) {
        socketRef.current.close();
      }
    };

  }, [activeRoom]);

  return null;
}

export default MicSender;