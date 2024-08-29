import React from "react";
import ReactDOM from "react-dom/client";

function Home() {
  return <h1>Welcome to Home Page</h1>;
}
const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Home />
    </React.StrictMode>,
  );
}
