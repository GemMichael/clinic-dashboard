import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";
import AudioReceiver from "./AudioReceiver";
import MicSender from "./MicSender";

function App() {

  // =========================
  // STATES
  // =========================
  const [alert, setAlert] = useState(false);

  const [talking, setTalking] = useState(false);

  const [fingerStatus, setFingerStatus] =
    useState("System Ready");

  const [fingerID, setFingerID] =
    useState(null);

  const alarmRef = useRef(null);

  const audioCtxRef = useRef(null);

  // =========================
  // AUDIO UNLOCK
  // =========================
  useEffect(() => {

    audioCtxRef.current =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    const unlockAudio = () => {

      audioCtxRef.current.resume();

      console.log("Audio unlocked");

      window.removeEventListener(
        "click",
        unlockAudio
      );
    };

    window.addEventListener(
      "click",
      unlockAudio
    );

  }, []);

  // =========================
  // FIREBASE LISTENERS
  // =========================
  useEffect(() => {

    // 🚨 PANIC
    const panicRef = ref(db, "panic");

    onValue(panicRef, (snapshot) => {

      const value = snapshot.val();

      if (value === true) {

        setAlert(true);

        if (alarmRef.current) {

          alarmRef.current.loop = true;

          alarmRef.current.play().catch(() => {

            console.log(
              "Autoplay blocked"
            );
          });
        }

      } else {

        setAlert(false);
      }
    });

    // 👆 FINGERPRINT STATUS
    const fingerRef =
      ref(db, "fingerprint/status");

    onValue(fingerRef, (snapshot) => {

      const value = snapshot.val();

      if (value) {

        setFingerStatus(value);
      }
    });

    // 👆 LAST ID
    const fingerIDRef =
      ref(db, "fingerprint/lastID");

    onValue(fingerIDRef, (snapshot) => {

      const value = snapshot.val();

      if (value) {

        setFingerID(value);
      }
    });

  }, []);

  // =========================
  // OK BUTTON
  // =========================
  const handleOK = () => {

    set(ref(db, "panic"), false);

    if (alarmRef.current) {

      alarmRef.current.pause();

      alarmRef.current.currentTime = 0;
    }
  };

  return (

    <div
      className={`app-container ${
        alert ? "alert-mode" : ""
      }`}
    >

      {/* 🔊 ALARM */}
      <audio
        ref={alarmRef}
        src="/alarm.mp3"
        preload="auto"
      />

      {/* 🎤 AUDIO */}
      <AudioReceiver />

      <MicSender talking={talking} />

      {/* ========================= */}
      {/* MAIN CARD */}
      {/* ========================= */}
      <div className="main-card">

        <h1 className="title">
          🚑 CERMedi-ALERT
        </h1>

        {/* 🚨 ALERT */}
        {alert && (

          <div className="alert-box">

            <h2>
              🚨 EMERGENCY ALERT 🚨
            </h2>

            <button
              className="btn-ok"
              onClick={handleOK}
            >
              OK
            </button>

          </div>
        )}

        {/* 👆 FINGERPRINT STATUS */}
        <div className="finger-box">

          <h3>
             Fingerprint Status
          </h3>

          <p className="finger-status">
            {fingerStatus}
          </p>

          {fingerID && (

            <p className="finger-id">
              Last Fingerprint ID:
              {" "}
              {fingerID}
            </p>
          )}

        </div>

        {/* 🎤 PUSH TO TALK */}
        <button
          className={`ptt-btn ${
            talking ? "talking" : ""
          }`}
          onPointerDown={() => setTalking(true)}
          onPointerUp={() => setTalking(false)}
          onPointerLeave={() => setTalking(false)}
          onTouchStart={() => setTalking(true)}
          onTouchEnd={() => setTalking(false)}
        >

          {talking
            ? "🔴 TALKING..."
            : "🎤 HOLD TO TALK"}

        </button>

      </div>

      {/* ========================= */}
      {/* STYLES */}
      {/* ========================= */}
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
          padding: 20px;
        }

        /* 🚨 FLASHING */
        .alert-mode {

          animation:
            flashMedical 0.4s infinite;
        }

        @keyframes flashMedical {

          0% {
            background: #ffffff;
          }

          50% {
            background: #ef4444;
          }

          100% {
            background: #ffffff;
          }
        }

        /* ========================= */
        /* CARD */
        /* ========================= */
        .main-card {

          background: white;
          padding: 35px;
          border-radius: 24px;
          text-align: center;
          color: #0f172a;
          box-shadow:
            0 10px 30px rgba(0,0,0,0.12);
          width: 420px;
          border: 2px solid #3b82f6;
        }

        .title {

          font-size: 30px;
          margin-bottom: 25px;
          color: #2563eb;
        }

        /* ========================= */
        /* FINGERPRINT BOX */
        /* ========================= */
        .finger-box {

          margin-top: 20px;
          padding: 20px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
        }

        .finger-box h3 {

          margin: 0 0 12px 0;
          color: #2563eb;
        }

        .finger-status {

          font-size: 18px;
          font-weight: bold;
          color: #16a34a;
          margin-bottom: 10px;
        }

        .finger-id {

          font-size: 15px;
          color: #334155;
        }

        /* ========================= */
        /* ALERT */
        /* ========================= */
        .alert-box {

          margin-bottom: 20px;
        }

        .alert-box h2 {

          color: #dc2626;
          margin-bottom: 15px;
        }

        .btn-ok {

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

        /* ========================= */
        /* PUSH TO TALK */
        /* ========================= */
        .ptt-btn {

          margin-top: 25px;
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: #dc2626;
          color: white;
          font-size: 17px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }

        .ptt-btn:hover {

          background: #b91c1c;
        }

        .ptt-btn.talking {

          background: #16a34a;

          animation:
            pulse 0.8s infinite;
        }

        @keyframes pulse {

          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.03);
          }

          100% {
            transform: scale(1);
          }
        }

      `}</style>

    </div>
  );
}

export default App;