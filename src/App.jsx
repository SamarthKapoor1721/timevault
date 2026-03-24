/**
 * APP.JSX — Root Application Component
 *
 * Sets up:
 * 1. Toast notification system (wraps entire app)
 * 2. React Router routes (URL → Page mapping)
 * 3. Navbar (always visible at top)
 * 4. Page container with padding for navbar height
 */

import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { ToastProvider } from "./components/Toast.jsx";

// Pages
import HomePage  from "./pages/HomePage.jsx";
import SendPage  from "./pages/SendPage.jsx";
import InboxPage from "./pages/InboxPage.jsx";
import SentPage  from "./pages/SentPage.jsx";

export default function App() {
  return (
    <ToastProvider>
      {/* Fixed navbar at top */}
      <Navbar />

      {/* Main content area — pt-20 accounts for the navbar height */}
      <main className="pt-20 min-h-screen bg-void">
        <Routes>
          <Route path="/"      element={<HomePage />}  />
          <Route path="/send"  element={<SendPage />}  />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/sent"  element={<SentPage />}  />

          {/* Catch-all 404 */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <div className="font-display font-black text-8xl text-accent/20 mb-4">404</div>
                <h2 className="font-display font-bold text-white text-2xl mb-2">PAGE NOT FOUND</h2>
                <p className="text-muted text-sm mb-6">This route doesn't exist in the vault.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            }
          />
        </Routes>
      </main>
    </ToastProvider>
  );
}
