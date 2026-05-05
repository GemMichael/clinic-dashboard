import { useEffect } from "react";

function AudioReceiver() {
  useEffect(() => {
    let socket;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // 🔊 Unlock audio (REQUIRED)
    const unlock = () => {
      audioCtx.resume();
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock);

    // 🔊 Gain
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 1.8;

    // 🎚 Low-pass filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3200;

    gainNode.connect(filter);
    filter.connect(audioCtx.destination);

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
      source.connect(gainNode);

      source.onended = playNext;
      source.start();
    };

    function connectSocket() {
      console.log(" Connecting...");

      socket = new WebSocket("wss://clinic-dashboard-1-xlgb.onrender.com");
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        console.log(" Connected");
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

        queue.push(float32Data);

        if (!isPlaying) playNext();
      };

      socket.onclose = () => {
        console.log(" Reconnecting...");
        setTimeout(connectSocket, 2000);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connectSocket();
  }, []);

  return null;
}

export default AudioReceiver;