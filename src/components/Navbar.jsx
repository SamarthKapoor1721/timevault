/**
 * NAVBAR COMPONENT
 * Top navigation bar with wallet connection status
 */

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useWallet } from "../context/WalletContext.jsx";
import { shortenAddress, copyToClipboard } from "../utils/helpers.js";

export default function Navbar() {
  const { account, isConnected, isConnecting, isWrongNetwork, connect, disconnect, switchNetwork } =
    useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyToClipboard(account)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navLinks = [
    { to: "/",       label: "HOME"   },
    { to: "/send",   label: "SEND"   },
    { to: "/inbox",  label: "INBOX"  },
    { to: "/sent",   label: "SENT"   },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-void/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              {/* Animated lock icon */}
              <svg viewBox="0 0 32 32" className="w-8 h-8">
                <rect x="6" y="14" width="20" height="14" rx="2"
                  fill="none" stroke="#00d4ff" strokeWidth="1.5" />
                <path d="M10 14V10a6 6 0 0 1 12 0v4"
                  fill="none" stroke="#00d4ff" strokeWidth="1.5"
                  strokeLinecap="round" />
                <circle cx="16" cy="21" r="2" fill="#00d4ff" />
              </svg>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-wider">
              TIME<span className="text-accent">VAULT</span>
            </span>
          </NavLink>

          {/* ── Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-widest transition-all duration-200 ${
                    isActive
                      ? "text-accent bg-accent/10 border border-accent/30"
                      : "text-muted hover:text-text hover:bg-white/5"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Wallet Button ── */}
          <div className="flex items-center gap-3">
            {/* Wrong Network Warning */}
            {isWrongNetwork && (
              <button
                onClick={switchNetwork}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg
                           bg-gold/10 border border-gold/40 text-gold text-xs font-mono font-bold
                           hover:bg-gold/20 transition-all animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-gold" />
                WRONG NETWORK
              </button>
            )}

            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Address display */}
                <button
                  onClick={handleCopy}
                  title="Click to copy address"
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg
                             bg-success/10 border border-success/30 text-success
                             text-xs font-mono hover:bg-success/20 transition-all"
                >
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  {copied ? "COPIED!" : shortenAddress(account)}
                </button>

                {/* Disconnect */}
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 rounded-lg border border-border text-muted
                             text-xs font-mono hover:border-danger/50 hover:text-danger
                             transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <span className="spinner" style={{ width: 14, height: 14 }} />
                    CONNECTING
                  </>
                ) : (
                  <>
                    <span>⬡</span> CONNECT
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex-shrink-0 px-3 py-1 rounded font-mono text-xs font-bold tracking-wider transition-all ${
                  isActive
                    ? "text-accent bg-accent/10 border border-accent/30"
                    : "text-muted hover:text-text"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
