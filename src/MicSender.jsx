import { useEffect, useRef } from "react";

function MicSender({ talking }) {

  const socketRef = useRef(null);

  // 🔥 REALTIME TALKING STATE
  const talkingRef = useRef(false);

  // 🔥 UPDATE REF
  talkingRef.current = talking;

  useEffect(() => {

    socketRef.current = new WebSocket(
      "wss://clinic-dashboard-1-xlgb.onrender.com"
    );

    socketRef.current.binaryType = "arraybuffer";

    socketRef.current.onopen = async () => {

      console.log("Mic Connected");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      const audioCtx =
        new AudioContext();

      const source =
        audioCtx.createMediaStreamSource(stream);

      const processor =
        audioCtx.createScriptProcessor(
          1024,
          1,
          1
        );

      source.connect(processor);

      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (e) => {

        // 🔥 USE REF INSTEAD
        if (!talkingRef.current) return;

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

          // 🔥 DEBUG
          console.log("Sending audio");

          socketRef.current.send(int16.buffer);
        }
      };
    };

    return () => {

      if (socketRef.current) {

        socketRef.current.close();
      }
    };

  }, []);

  return null;
}

export default MicSender;