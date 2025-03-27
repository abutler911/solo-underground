import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Add this code to ensure styled-components works consistently
if (typeof window !== "undefined") {
  // Force styled-components to initialize early
  const styleTag = document.createElement("style");
  styleTag.id = "styled-components-initializer";
  document.head.appendChild(styleTag);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
