import { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";
import AudioReceiver from "./AudioReceiver";
import MicSender from "./MicSender";

function App() {
  // STATES

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

  const [users, setUsers] =
    useState({});

  const alarmRef = useRef(null);

  const audioCtxRef = useRef(null);

  const [showUsers, setShowUsers] = useState(false);

  const [room2Alert, setRoom2Alert] =
    useState(false);

  const [room3Alert, setRoom3Alert] =
    useState(false);

  const [activeRoom, setActiveRoom] =
    useState("room1");

  // AUDIO UNLOCK

  useEffect(() => {

    audioCtxRef.current =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    const unlockAudio = () => {

      audioCtxRef.current.resume();

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

  // FIREBASE LISTENERS

  useEffect(() => {

    //  PANIC
    const panicRef =
      ref(db, "panic");

    onValue(panicRef, (snapshot) => {

      const value = snapshot.val();

      if (value === true) {

        setAlert(true);

        if (alarmRef.current) {

          alarmRef.current.loop = true;

          alarmRef.current.play().catch(() => { });
        }

      } else {

        setAlert(false);

        if (alarmRef.current) {

          alarmRef.current.pause();

          alarmRef.current.currentTime = 0;
        }
      }
    });

    // ROOM 2 PANIC
    const panic2Ref =
      ref(db, "panic2");

    onValue(panic2Ref, (snapshot) => {

      const value = snapshot.val();

      if (value === true) {

        setRoom2Alert(true);

        if (alarmRef.current) {

          alarmRef.current.loop = true;

          alarmRef.current.play()
            .then(() => {
              console.log("ROOM 2 ALARM PLAYING");
            })
            .catch((err) => {
              console.log("ROOM 2 AUDIO ERROR", err);
            });
        }

      } else {

        setRoom2Alert(false);

        if (alarmRef.current) {

          alarmRef.current.pause();

          alarmRef.current.currentTime = 0;
        }
      }
    });

    // ROOM 3 PANIC
    const panic3Ref =
      ref(db, "panic3");

    onValue(panic3Ref, (snapshot) => {

      const value = snapshot.val();

      if (value === true) {

        setRoom3Alert(true);

        if (alarmRef.current) {

          alarmRef.current.loop = true;

          alarmRef.current.play()
            .catch(() => { });
        }

      } else {

        setRoom3Alert(false);

        if (!alert && !room2Alert) {

          alarmRef.current.pause();
          alarmRef.current.currentTime = 0;
        }

      }

    });

    //  FINGERPRINT STATUS
    const fingerRef =
      ref(db, "fingerprint/status");

    onValue(fingerRef, (snapshot) => {

      const value = snapshot.val();

      if (value) {

        setFingerStatus(value);
      }
    });

    //  LAST ID
    const fingerIDRef =
      ref(db, "fingerprint/lastID");

    onValue(fingerIDRef, (snapshot) => {

      const value = snapshot.val();

      if (value) {

        setFingerID(value);
      }
    });

    // PANIC LOGS
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

    // ACTIVE ROOM

    const activeRoomRef =
      ref(db, "activeRoom");

    onValue(activeRoomRef, (snapshot) => {

      setActiveRoom(
        snapshot.val() || "room1"
      );

    });
    //  USERS
    const usersRef =
      ref(db, "users");

    onValue(usersRef, (snapshot) => {

      const data = snapshot.val();

      if (data) {

        setUsers(data);
      }
    });

  }, []);


  // SAVE USER

  const saveUser = async () => {

    if (!fingerID || !userName) {

      alert(
        "Missing Fingerprint ID or Name"
      );

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


  // OK BUTTON

  const handleRoom1 = () => {

    set(ref(db, "panic"), false);

    set(ref(db, "activeRoom"), "room1");

    if (alarmRef.current) {

      alarmRef.current.pause();

      alarmRef.current.currentTime = 0;
    }
    // only refresh if room2 is already cleared
    if (!room2Alert) {

      setTimeout(() => {
        window.location.reload();
      }, 500);

    }
  };

  const handleRoom2 = () => {

    set(ref(db, "panic2"), false);

    set(ref(db, "activeRoom"), "room2");

    if (alarmRef.current) {

      alarmRef.current.pause();

      alarmRef.current.currentTime = 0;
    }
    // only refresh if room1 is already cleared
    if (!alert) {

      setTimeout(() => {
        window.location.reload();
      }, 500);

    }
  };

  const handleRoom3 = () => {

    set(ref(db, "panic3"), false);

    set(ref(db, "activeRoom"), "room3");

    if (alarmRef.current) {

      alarmRef.current.pause();

      alarmRef.current.currentTime = 0;
    }

    if (!alert && !room2Alert) {

      setTimeout(() => {

        window.location.reload();

      }, 500);

    }

  };
  return (

    <div
      className={`app-container ${(alert || room2Alert || room3Alert)
        ? "alert-mode"
        : ""
        }`}
    >

      {/*  ALARM */}
      <audio
        ref={alarmRef}
        src="/alarm.mp3"
        preload="auto"
      />

      {/*  AUDIO */}
      <AudioReceiver
        activeRoom={activeRoom}
      />

      <MicSender
        talking={talking}
        activeRoom={activeRoom}
      />

      {/* MAIN CARD */}

      <div className="main-card">

        <h1 className="title">
          <img
            src="/logo.jpg"
            alt="Ambulance"
            className="ambulance-icon"
          />
          CERMedi-ALERT
        </h1>

        {/*  ALERT */}
        {(alert || room2Alert) && (

          <div className="alert-box">

            <h2>
              🚨 EMERGENCY ALERT 🚨
            </h2>

            <div>

              {alert && (
                <div>🏥 ROOM 1</div>
              )}

              {room2Alert && (
                <div>🏥 ROOM 2</div>
              )}
              {room3Alert && (
                <div>🏥 ROOM 3</div>
              )}

            </div>

            {alert && (

              <button
                className="btn-ok"
                onClick={handleRoom1}
              >
                Resolve Room 1
              </button>

            )}

            {room2Alert && (

              <button
                className="btn-ok"
                onClick={handleRoom2}
              >
                Resolve Room 2
              </button>

            )}
            {room3Alert && (

              <button
                className="btn-ok"
                onClick={handleRoom3}
              >
                Resolve Room 3
              </button>

            )}

          </div>
        )}


        {/* FINGERPRINT */}

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

          {/* REGISTER */}
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

        {/* HISTORY */}

        <div className="history-card">

          <h3 className="history-title">
            🚨 Panic History
          </h3>

          <div className="history-scroll">

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
                    {
                      users[
                        log.fingerprintID
                      ]?.name || "Unknown"
                    }
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

        </div>


        {/* PUSH TO TALK */}

        <button
          className={`ptt-btn ${talking ? "talking" : ""
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


        <button
          className="users-btn"
          onClick={() => setShowUsers(true)}
        >
          👥 VIEW USERS
        </button>

        {showUsers && (

          <div className="modal-overlay">

            <div className="modal-card">

              <h2> Registered Users</h2>

              <div className="users-list">

                {Object.keys(users).length === 0 ? (

                  <p>No users found</p>

                ) : (

                  Object.entries(users).map(([id, user]) => (

                    <div key={id} className="user-item">

                      <p><strong>ID:</strong> {id}</p>

                      <p><strong>Name:</strong> {user.name}</p>

                    </div>
                  ))
                )}

              </div>

              <button
                className="close-btn"
                onClick={() => setShowUsers(false)}
              >
                CLOSE
              </button>

            </div>

          </div>
        )}

      </div>

      {/* STYLES */}

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
          padding: 20px;
        }

        /* 🚨 FLASH */
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

        /* CARD */

        .main-card {

          width: 450px;
          background: white;
          border-radius: 24px;
          padding: 30px;
          box-shadow:
            0 10px 30px rgba(0,0,0,0.12);
          border: 2px solid #2563eb;
        }

        .title {

          text-align: center;
          font-size: 34px;
          color: #2563eb;
          margin-bottom: 25px;
        }


        /* ALERT */

        .alert-box {

          background: #dc2626;
          color: white;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 20px;
          text-align: center;
        }

        .btn-ok {

          margin-top: 15px;
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          background: white;
          color: #dc2626;
          font-weight: bold;
          cursor: pointer;
        }


        /* FINGER BOX */

        .finger-box {

          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 20px;
        }

        .finger-box h3 {

          text-align: center;
          color: #2563eb;
          margin-bottom: 15px;
        }

        .finger-status {

          text-align: center;
          color: #16a34a;
          font-size: 20px;
          font-weight: bold;
        }

        .finger-id {

          text-align: center;
          margin-top: 10px;
          color: #475569;
        }


        /* REGISTER */

        .register-box {

          margin-top: 20px;
        }

        .name-input {

          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          margin-bottom: 12px;
          box-sizing: border-box;
          font-size: 15px;
        }

        .save-user-btn {

          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: #2563eb;
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        .save-user-btn:hover {

          background: #1d4ed8;
        }

          .title {
  text-align: center;
  font-size: 34px;
  color: #2563eb;
  margin-bottom: 25px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.ambulance-icon {
  width: 40px;
  height: 40px;
}


        /* HISTORY */

        .history-card {

          margin-top: 25px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 20px;
        }

        .history-title {

          color: #dc2626;
          margin-bottom: 15px;
          text-align: center;
        }

        .history-scroll {

          max-height: 320px;
          overflow-y: auto;
          padding-right: 5px;
        }

        .history-item {

          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 14px;
          margin-bottom: 12px;
        }

        .history-item p {

          margin: 6px 0;
        }

        .no-history {

          text-align: center;
          color: #64748b;
        }

        .users-btn {
  margin-top: 15px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.modal-card {
  background: white;
  width: 400px;
  max-height: 500px;

  border-radius: 20px;
  padding: 20px;

  overflow: hidden;

  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.users-list {
  max-height: 300px;
  overflow-y: auto;

  margin-top: 20px;
}

.user-item {
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.close-btn {
  width: 100%;
  margin-top: 20px;

  padding: 12px;

  border: none;
  border-radius: 12px;

  background: #dc2626;
  color: white;

  font-weight: bold;
  cursor: pointer;
}


        /* PTT */

        .ptt-btn {

          width: 100%;
          margin-top: 25px;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: #dc2626;
          color: white;
          font-size: 17px;
          font-weight: bold;
          cursor: pointer;
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
            transform: scale(1.02);
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