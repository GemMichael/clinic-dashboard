import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import App from "./App.jsx";
import Room2 from "./Room2.jsx";
import Room3 from "./Room3.jsx";
import ManualUser from "./ManualUser.jsx";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<App />}
        />

        <Route
          path="/room2"
          element={<Room2 />}
        />


        <Route
          path="/room3"
          element={<Room3 />}
        />

          <Route
          path="/manual-user"
          element={<ManualUser />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);