/**
 * HOME PAGE
 *
 * Landing page that explains the DApp and lets users connect their wallet.
 * Includes animated visuals and feature overview.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext.jsx";
import { shortenAddress } from "../utils/helpers.js";

export default function HomePage() {
  const { isConnected, isConnecting, account, connect } = useWallet();
  const navigate = useNavigate();

  const features = [
    {
      icon: "✉️",
      title: "Write Your Message",
      desc: "Compose any secret message you want — a confession, a surprise, a time capsule.",
    },
    {
      icon: "⏰",
      title: "Set a Lock Time",
      desc: "Choose exactly when the message becomes readable — hours, days, or years from now.",
    },
    {
      icon: "🔗",
      title: "Stored on IPFS",
      desc: "Messages are stored on a decentralized network. No server can delete them.",
    },
    {
      icon: "🔒",
      title: "Blockchain Enforced",
      desc: "The smart contract cryptographically prevents access before unlock time.",
    },
  ];

  return (
    <div className="min-h-screen bg-void bg-grid page-enter">
      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">

        {/* Background decorative orbs */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)",
          }}
        />

        {/* Lock icon — hero visual */}
        <div className="relative mb-8">
          <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-32 sm:h-32">
            {/* Outer ring */}
            <circle cx="60" cy="60" r="54" fill="none"
              stroke="rgba(0,212,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="60" cy="60" r="40" fill="none"
              stroke="rgba(0,212,255,0.1)" strokeWidth="1" />
            {/* Lock body */}
            <rect x="32" y="52" width="56" height="42" rx="6"
              fill="rgba(0,212,255,0.05)" stroke="#00d4ff" strokeWidth="1.5" />
            {/* Shackle */}
            <path d="M40 52V38a20 20 0 0 1 40 0v14"
              fill="none" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" />
            {/* Keyhole */}
            <circle cx="60" cy="72" r="6" fill="#00d4ff" opacity="0.8" />
            <rect x="57" y="78" width="6" height="8" rx="1" fill="#00d4ff" opacity="0.8" />
          </svg>

          {/* Pulsing glow rings */}
          <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping"
            style={{ animationDuration: "3s" }} />
          <div className="absolute -inset-4 rounded-full border border-accent/10 animate-ping"
            style={{ animationDuration: "4s", animationDelay: "1s" }} />
        </div>

        {/* Tagline */}
        <div className="mb-3 font-mono text-xs tracking-[0.4em] text-muted uppercase">
          Decentralized · Immutable · Time-Locked
        </div>

        {/* Title */}
        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight mb-4">
          <span className="text-white">TIME</span>
          <span className="text-accent glow-text">VAULT</span>
        </h1>

        <p className="max-w-xl text-muted text-base sm:text-lg leading-relaxed mb-10 font-body">
          Send secret messages that are cryptographically locked until a future moment.
          Powered by blockchain and IPFS — no middlemen, no censorship.
        </p>

        {/* CTA Buttons */}
        {isConnected ? (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={() => navigate("/send")}
              className="btn-primary text-base px-8 py-4"
            >
              ✉ Send Secret Message
            </button>
            <button
              onClick={() => navigate("/inbox")}
              className="btn-gold text-base px-8 py-4"
            >
              📬 Open Inbox
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="btn-primary text-base px-10 py-4 flex items-center gap-3"
          >
            {isConnecting ? (
              <>
                <span className="spinner" />
                Connecting...
              </>
            ) : (
              "Connect MetaMask to Begin →"
            )}
          </button>
        )}

        {/* Connected address */}
        {isConnected && (
          <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full
                          bg-success/10 border border-success/30">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-mono text-xs text-success">
              {shortenAddress(account, 8)}
            </span>
          </div>
        )}
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <div className="font-mono text-xs tracking-[0.3em] text-muted uppercase mb-3">
            How It Works
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Four Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="panel p-6 hover:border-accent/20 transition-all duration-300
                         hover:shadow-[0_0_30px_rgba(0,212,255,0.05)]"
            >
              <div className="flex items-start gap-4">
                {/* Step number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 border border-accent/30
                                flex items-center justify-center font-mono text-xs font-bold text-accent">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{icon}</span>
                    <h3 className="font-display font-bold text-white text-base tracking-wide">
                      {title}
                    </h3>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech stack note */}
        <div className="mt-8 panel p-5 text-center">
          <p className="text-xs font-mono text-muted tracking-wider">
            Built with{" "}
            <span className="text-accent">Solidity</span> ·{" "}
            <span className="text-accent">Ethers.js</span> ·{" "}
            <span className="text-accent">React + Vite</span> ·{" "}
            <span className="text-accent">IPFS (Pinata)</span> ·{" "}
            <span className="text-accent">Hardhat</span>
          </p>
        </div>
      </section>
    </div>
  );
}
