import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./context/UserContext";
import axios from "axios";

/* -------------------------------
  IMPORTANT: Set Axios Base URL 
   ------------------------------- */
axios.defaults.baseURL = "http://127.0.0.1:5000/api"; 
axios.defaults.withCredentials = true; // optional but useful for auth cookies

/* ------------------------------- */

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <UserProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </UserProvider>
);

reportWebVitals();
