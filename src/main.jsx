import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { WalletProvider } from "./context/WalletContext.jsx";
import "./index.css";

/**
 * MAIN ENTRY POINT
 *
 * We wrap the entire app in:
 * 1. BrowserRouter   — enables client-side routing (URL changes without page reload)
 * 2. WalletProvider  — makes wallet state (address, connected, etc.) available everywhere
 * 3. App             — the actual application with all pages and routes
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <App />
      </WalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);
