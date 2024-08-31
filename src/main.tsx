import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function Home() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-3xl">Welcome to Home Page</h1>
      <a
        href="/asr-streaming-js-demo/asr/"
        className="w-fit text-blue-500 underline-offset-2 hover:underline"
      >
        ASR Sample Code
      </a>
      <a
        href="/asr-streaming-js-demo/tts/"
        className="w-fit text-blue-500 underline-offset-2 hover:underline"
      >
        TTS Sample Code
      </a>
    </div>
  );
}
const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Home />
    </React.StrictMode>,
  );
}
