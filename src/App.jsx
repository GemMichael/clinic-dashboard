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

  const [userName, setUserName] =
    useState("");

  const [panicLogs, setPanicLogs] =
    useState([]);

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

    // 🚨 PANIC LOGS
    const logsRef =
      ref(db, "panicLogs");

    onValue(logsRef, (snapshot) => {

      const data = snapshot.val();

      if (data) {

        const logs =
          Object.entries(data).map(
            ([id, value]) => ({
              id,
              ...value
            })
          );

        logs.reverse();

        setPanicLogs(logs);

      } else {

        setPanicLogs([]);
      }
    });

  }, []);

  // =========================
  // SAVE USER
  // =========================
  const saveUser = async () => {

    if (!fingerID || !userName) {

      alert("Missing Fingerprint ID or Name");

      return;
    }

    await set(
      ref(db, `users/${fingerID}`),
      {
        name: userName
      }
    );

    alert("User Saved!");

    setUserName("");
  };

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

        {/* ========================= */}
        {/* FINGERPRINT STATUS */}
        {/* ========================= */}
        <div className="finger-box">

          <h3>
            👆 Fingerprint Status
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

          {/* REGISTER USER */}
          <div className="register-box">

            <input
              type="text"
              placeholder="Enter User Name"
              value={userName}
              onChange={(e) =>
                setUserName(
                  e.target.value
                )
              }
              className="name-input"
            />

            <button
              className="save-user-btn"
              onClick={saveUser}
            >
              Save User
            </button>

          </div>

        </div>

        {/* ========================= */}
        {/* PANIC HISTORY */}
        {/* ========================= */}
        <div className="history-box">

          <h3>
            🚨 Panic History
          </h3>

          {panicLogs.length === 0 ? (

            <p className="no-history">
              No panic history
            </p>

          ) : (

            panicLogs.map((log) => (

              <div
                key={log.id}
                className="history-item"
              >

                <p>
                  <strong>ID:</strong>
                  {" "}
                  {log.fingerprintID}
                </p>

                <p>
                  <strong>Name:</strong>
                  {" "}
                  {log.name || "Unknown"}
                </p>

                <p>
                  <strong>Time:</strong>
                  {" "}
                  {log.time}
                </p>

              </div>
            ))
          )}

        </div>

        {/* ========================= */}
        {/* PUSH TO TALK */}
        {/* ========================= */}
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
          min-height: 100vh;
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
          width: 450px;
          border: 2px solid #3b82f6;
        }

        .title {

          font-size: 32px;
          margin-bottom: 25px;
          color: #2563eb;
        }

        /* ========================= */
        /* ALERT */
        /* ========================= */
        .alert-box {

          background: #dc2626;
          color: white;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 20px;
        }

        .btn-ok {

          padding: 12px 25px;
          border: none;
          border-radius: 10px;
          background: white;
          color: #dc2626;
          font-weight: bold;
          cursor: pointer;
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

          margin-bottom: 12px;
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
          margin-bottom: 20px;
        }

        /* ========================= */
        /* REGISTER */
        /* ========================= */
        .register-box {

          margin-top: 15px;
        }

        .name-input {

          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          margin-bottom: 10px;
          font-size: 15px;
          box-sizing: border-box;
        }

        .save-user-btn {

          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }

        .save-user-btn:hover {

          background: #1d4ed8;
        }

        /* ========================= */
        /* HISTORY */
        /* ========================= */
        .history-box {

          margin-top: 25px;
          text-align: left;
        }

        .history-box h3 {

          color: #dc2626;
          margin-bottom: 15px;
        }

        .history-item {

          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px;
          margin-top: 12px;
        }

        .history-item p {

          margin: 6px 0;
        }

        .no-history {

          color: #64748b;
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