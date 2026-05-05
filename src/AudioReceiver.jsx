import { useEffect } from "react";

function AudioReceiver() {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

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

      source.onended = () => {
        playNext();
      };

      source.start();
    };

    socket.onmessage = async (event) => {
      const arrayBuffer = await event.data.arrayBuffer();

      const int16Data = new Int16Array(arrayBuffer);
      const float32Data = new Float32Array(int16Data.length);

      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
      }

      // add to queue
      queue.push(float32Data);

      // start playback if not already
      if (!isPlaying) {
        playNext();
      }
    };
  }, []);

  return null;
}

export default AudioReceiver;