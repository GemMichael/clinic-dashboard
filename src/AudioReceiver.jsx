import { useEffect } from "react";

function AudioReceiver() {
  useEffect(() => {
    let socket;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // 🔥 FIX 1: unlock audio on first click
    const unlockAudio = () => {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
        console.log("🔊 Audio unlocked");
      }
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);

    let queue = [];
    let isPlaying = false;

    const playNext = () => {
      if (queue.length === 0) {
        isPlaying = false;
        return;
      }

      isPlaying = true;

      const float32Data = queue.shift();

      const buffer = audioCtx.createBuffer(1, float32Data.length, 22050);
      buffer.copyToChannel(float32Data, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);

      source.onended = playNext;
      source.start();
    };

    function connectSocket() {
      console.log("🔄 Connecting to WebSocket...");

      socket = new WebSocket("wss://clinic-dashboard-1-xlgb.onrender.com");

      socket.binaryType = "arraybuffer"; // 🔥 IMPORTANT

      socket.onopen = () => {
        console.log("✅ Connected to WebSocket");
      };

      socket.onmessage = (event) => {
        const int16Data = new Int16Array(event.data);
        const float32Data = new Float32Array(int16Data.length);

        for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768;
        }

        // 🔥 FIX 2: accumulate before playing
        queue.push(float32Data);

        if (!isPlaying) playNext();
      };

      socket.onclose = () => {
        console.log("⚠️ Disconnected. Reconnecting...");
        setTimeout(connectSocket, 2000);
      };

      socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        socket.close();
      };
    }

    connectSocket();
  }, []);

  return null;
}

export default AudioReceiver;