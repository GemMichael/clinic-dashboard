import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";
import AudioReceiver from "./AudioReceiver";
import MicSender from "./MicSender";

function App() {
  const [alert, setAlert] = useState(false);
  const alarmRef = useRef(null);
  const audioCtxRef = useRef(null);
  const [talking, setTalking] = useState(false);

  // 🔥 AUTO ENABLE AUDIO (best possible)
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();

    const unlockAudio = () => {
      audioCtxRef.current.resume();
      console.log("Audio unlocked");
      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
  }, []);

  // 🔥 Firebase listener
  useEffect(() => {
    const panicRef = ref(db, "panic");

    onValue(panicRef, (snapshot) => {
      const value = snapshot.val();

      if (value === true) {
        setAlert(true);

        if (alarmRef.current) {
          alarmRef.current.loop = true;
          alarmRef.current.play().catch(() => {
            console.log("Autoplay blocked, click screen");
          });
        }
      }
    });
  }, []);

  // 🔘 OK button
  const handleOK = () => {
    set(ref(db, "panic"), false);
    setAlert(false);

    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
  };

  return (
    <div className={`app-container ${alert ? "alert-mode" : ""}`}>

      {/* 🔊 Alarm */}
      <audio ref={alarmRef} src="/alarm.mp3" preload="auto" />

      <div className="main-card">
        <h1 className="title">🚑 CERMedi-ALERT</h1>

        {!alert ? (
          <p className="status normal">System Ready</p>
        ) : (
          <div className="alert-box">
            <h2>🚨 EMERGENCY ALERT 🚨</h2>
            <button className="btn-ok" onClick={handleOK}>
              OK
            </button>
          </div>
        )}
      </div>

      <AudioReceiver />

      <MicSender talking={talking} />

      <button
        className="ptt-btn"
        onMouseDown={() => setTalking(true)}
        onMouseUp={() => setTalking(false)}
        onTouchStart={() => setTalking(true)}
        onTouchEnd={() => setTalking(false)}
      >
        🎤 HOLD TO TALK
      </button>

      {/* 🎨 STYLES */}
      <style>{`
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f1f5f9;
        }

        .app-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          transition: 0.3s;
        }

      .ptt-btn {
  margin-top: 20px;
  padding: 15px 25px;
  border: none;
  border-radius: 12px;
  background: #dc2626;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

        /* 🚨 FLASHING ALERT */
.alert-mode {
  animation: flashMedical 0.4s infinite;
}

@keyframes flashMedical {
  0%   { background: #ffffff; }
  50%  { background: #ef4444; }
  100% { background: #ffffff; }
}

        .main-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          color: #0f172a;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          width: 360px;
          border: 2px solid #3b82f6;
        }

        .title {
          font-size: 28px;
          margin-bottom: 20px;
          color: #2563eb;
        }

        .status.normal {
          color: #16a34a;
          font-size: 18px;
        }

        .alert-box h2 {
          color: #dc2626;
        }

        .btn-ok {
          margin-top: 20px;
          padding: 12px 25px;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-ok:hover {
          background: #1d4ed8;
        }
      `}</style>
    </div>
  );
}

export default App;