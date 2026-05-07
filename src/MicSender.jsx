import { useEffect, useRef } from "react";

function MicSender({ talking }) {

  const socketRef = useRef(null);
  const processorRef = useRef(null);

  useEffect(() => {

    socketRef.current = new WebSocket(
      "wss://clinic-dashboard-1-xlgb.onrender.com"
    );

    socketRef.current.onopen = async () => {

      console.log("Mic Connected");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const audioCtx = new AudioContext();

      const source =
        audioCtx.createMediaStreamSource(stream);

      const processor =
        audioCtx.createScriptProcessor(1024, 1, 1);

      processorRef.current = processor;

      source.connect(processor);

      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (e) => {

        if (!talking) return;

        const input =
          e.inputBuffer.getChannelData(0);

        const int16 =
          new Int16Array(input.length);

        for (let i = 0; i < input.length; i++) {

          int16[i] = input[i] * 32767;
        }

        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {

          socketRef.current.send(int16.buffer);
        }
      };
    };

  }, []);

  return null;
}

export default MicSender;