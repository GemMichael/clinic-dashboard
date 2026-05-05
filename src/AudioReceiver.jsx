import { useEffect } from "react";

function AudioReceiver() {
  useEffect(() => {
    let socket;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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
      console.log("Connecting to WebSocket...");

      socket = new WebSocket("wss://clinic-dashboard-1-xlgb.onrender.com");

      socket.onopen = () => {
        console.log("Connected to WebSocket");
      };

      socket.onmessage = async (event) => {
        const arrayBuffer = await event.data.arrayBuffer();

        const int16Data = new Int16Array(arrayBuffer);
        const float32Data = new Float32Array(int16Data.length);

        for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768;
        }

        queue.push(float32Data);

        if (!isPlaying) playNext();
      };

      socket.onclose = () => {
        console.log("Disconnected. Reconnecting in 2s...");
        setTimeout(connectSocket, 2000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };
    }

    connectSocket();
  }, []);

  return null;
}

export default AudioReceiver;