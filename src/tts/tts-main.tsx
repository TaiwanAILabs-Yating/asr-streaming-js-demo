import React from "react";
import ReactDOM from "react-dom/client";
import { TTSDemo } from "./tts";

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <TTSDemo />
    </React.StrictMode>,
  );
}
