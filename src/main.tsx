import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { registerSW } from "virtual:pwa-register";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available! Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready for offline use");
  },
});
