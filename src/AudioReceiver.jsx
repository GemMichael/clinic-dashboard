import { useEffect } from "react";

function AudioReceiver({
  activeRoom
}) {
  useEffect(() => {
    let socket;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // 🔊 Unlock audio
    const unlock = () => {
      audioCtx.resume();
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock);

    // 🎚 Filters + gain
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 100;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 1.6;

    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3800;

    // 🔗 chain
    highpass.connect(gainNode);
    gainNode.connect(lowpass);
    lowpass.connect(audioCtx.destination);

    // 🔥 LOW LATENCY scheduling
    let nextTime = audioCtx.currentTime + 0.1;

    const playChunk = (float32Data) => {
      const buffer = audioCtx.createBuffer(1, float32Data.length, 16000);
      buffer.copyToChannel(float32Data, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      // ✅ connect chain HERE (correct place)
      source.connect(highpass);

      source.start(nextTime);

      nextTime += buffer.duration;

      // prevent delay buildup
      if (nextTime < audioCtx.currentTime) {
        nextTime = audioCtx.currentTime;
      }
    };

    function connectSocket() {
      console.log("🔄 Connecting...");

      const wsUrl =
        activeRoom === "room2"
          ? "wss://clinic-dashboard-4.onrender.com"
          : "wss://clinic-dashboard-1-xlgb.onrender.com";

      console.log(
        "RECEIVER CONNECTING TO:",
        wsUrl
      );

      socket =
        new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {

        if (activeRoom === "room2") {

          socket.send(
            JSON.stringify({
              type: "register",
              role: "nurseReceiver"
            })
          );

          console.log(
            "Registered Nurse Receiver"
          );
        }

        console.log("✅ Connected");
      };

      socket.onmessage = (event) => {
        const int16Data = new Int16Array(event.data);
        const float32Data = new Float32Array(int16Data.length);

        for (let i = 0; i < int16Data.length; i++) {
          let sample = int16Data[i] / 32768;

          // 🔇 noise gate
          if (Math.abs(sample) < 0.015) sample = 0;

          float32Data[i] = sample;
        }

        // 🔥 LOW LATENCY (no queue)
        playChunk(float32Data);
      };

      socket.onclose = () => {
        console.log("⚠️ Reconnecting...");
        setTimeout(connectSocket, 2000);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connectSocket();
  }, [activeRoom]);

  return null;
}

export default AudioReceiver;