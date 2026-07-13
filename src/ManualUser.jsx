import { useState } from "react";
import { db } from "./firebase";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";

function ManualUser() {

  const navigate = useNavigate();

  const [fingerID, setFingerID] = useState("");
  const [name, setName] = useState("");

  const saveUser = async () => {

    if (!fingerID || !name) {
      alert("Please complete all fields.");
      return;
    }

    await set(ref(db, `users/${fingerID}`), {
      name,
    });

    alert("User saved successfully!");

    setFingerID("");
    setName("");
  };

  return (
    <div className="container">

      <div className="card">

        <h2>Manual User Registration</h2>

        <input
          type="number"
          placeholder="Fingerprint ID"
          value={fingerID}
          onChange={(e) => setFingerID(e.target.value)}
        />

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button onClick={saveUser}>
          Save User
        </button>

        <button onClick={() => navigate("/")}>
          Back
        </button>

      </div>
    </div>
  );
}

export default ManualUser;