import { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "./firebase";
import MicSender from "./Room2MicSender";
import AudioReceiver from "./AudioReceiver";

function Room2() {
  const [talking, setTalking] = useState(false);

  const [activeRoom, setActiveRoom] =
    useState("room1");

  const sendPanic = async () => {
    await set(ref(db, "panic2"), true);
  };
  useEffect(() => {

    const activeRoomRef =
      ref(db, "activeRoom");

    onValue(activeRoomRef, (snapshot) => {

      setActiveRoom(
        snapshot.val() || "room1"
      );

    });

  }, []);

  return (
    <>
      <AudioReceiver />
      <MicSender
        talking={
          talking &&
          activeRoom === "room2"
        }
      />

      <div className="room-container">
        <div className="card">

          <div className="header">
            <h1>🏥 CERMedi-ALERT</h1>
            <h2>ROOM 2</h2>
          </div>

          <div className="section">

            <h3>Emergency Assistance</h3>

            <button
              className="panic-btn"
              onClick={sendPanic}
            >
              🚨 PANIC BUTTON
            </button>

          </div>

          <div className="section">

            <h3>Voice Communication</h3>

            <button
              disabled={
                activeRoom !== "room2"
              }
              className={`talk-btn ${talking ? "talking" : ""
                }`}
              onPointerDown={() => setTalking(true)}
              onPointerUp={() => setTalking(false)}
              onPointerLeave={() => setTalking(false)}
              onTouchStart={() => setTalking(true)}
              onTouchEnd={() => setTalking(false)}
            >
              {activeRoom !== "room2"
                ? "🔒 WAITING FOR NURSE"
                : talking
                  ? "🔴 TALKING..."
                  : "🎤 HOLD TO TALK"}
            </button>

          </div>

        </div>
      </div>

      <style>{`
      
      body{
        margin:0;
        font-family:Arial,sans-serif;
        background:#f1f5f9;
      }

      .room-container{
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:20px;
      }

      .card{
        width:420px;
        background:white;
        border-radius:24px;
        padding:30px;
        box-shadow:
          0 15px 40px rgba(0,0,0,0.15);
        border:2px solid #2563eb;
      }

      .header{
        text-align:center;
        margin-bottom:30px;
      }

      .header h1{
        color:#2563eb;
        margin-bottom:10px;
      }

      .header h2{
        color:#475569;
        margin:0;
      }

      .section{
        margin-top:25px;
      }

      .section h3{
        text-align:center;
        color:#334155;
        margin-bottom:15px;
      }

      .panic-btn{
        width:100%;
        padding:22px;
        border:none;
        border-radius:16px;
        background:#dc2626;
        color:white;
        font-size:22px;
        font-weight:bold;
        cursor:pointer;
      }

      .panic-btn:hover{
        background:#b91c1c;
      }

      .talk-btn{
        width:100%;
        padding:18px;
        border:none;
        border-radius:16px;
        background:#2563eb;
        color:white;
        font-size:18px;
        font-weight:bold;
        cursor:pointer;
      }

      .talk-btn.talking{
        background:#16a34a;
        animation:pulse 0.8s infinite;
      }

      @keyframes pulse{
        0%{
          transform:scale(1);
        }
        50%{
          transform:scale(1.03);
        }
        100%{
          transform:scale(1);
        }
      }

      `}</style>
    </>
  );
}

export default Room2;