/**
 * WALLET GUARD COMPONENT
 *
 * A wrapper that shows a "Connect Wallet" prompt if the user isn't connected.
 * Use this to protect pages that require a wallet connection.
 *
 * Usage:
 *   <WalletGuard>
 *     <YourProtectedComponent />
 *   </WalletGuard>
 */

import React from "react";
import { useWallet } from "../context/WalletContext.jsx";

export default function WalletGuard({ children }) {
  const { isConnected, isConnecting, isWrongNetwork, connect, switchNetwork, error } = useWallet();

  // ── Wrong network warning ──
  if (isConnected && isWrongNetwork) {
    const expectedName =
      parseInt(import.meta.env.VITE_CHAIN_ID) === 31337 ? "Hardhat Local" : "Sepolia Testnet";

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="panel p-8 max-w-md w-full text-center space-y-5">
          <div className="text-4xl">⚠️</div>
          <h2 className="font-display font-bold text-gold text-xl tracking-wider">
            WRONG NETWORK
          </h2>
          <p className="text-muted text-sm font-body leading-relaxed">
            This DApp requires you to be on the{" "}
            <span className="text-gold font-mono">{expectedName}</span> network.
            Please switch networks in MetaMask.
          </p>
          <button onClick={switchNetwork} className="btn-gold w-full">
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  // ── Not connected ──
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="panel p-8 max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-20 h-20">
                <rect x="15" y="35" width="50" height="35" rx="5"
                  fill="none" stroke="#00d4ff" strokeWidth="2" opacity="0.6" />
                <path d="M25 35V25a15 15 0 0 1 30 0v10"
                  fill="none" stroke="#00d4ff" strokeWidth="2"
                  strokeLinecap="round" opacity="0.6" />
                <circle cx="40" cy="52" r="5" fill="#00d4ff" opacity="0.8" />
                <line x1="40" y1="57" x2="40" y2="63"
                  stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              </svg>
              <div className="absolute inset-0 bg-accent/10 blur-xl rounded-full" />
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-white text-xl tracking-wider mb-2">
              WALLET REQUIRED
            </h2>
            <p className="text-muted text-sm font-body leading-relaxed">
              Connect your MetaMask wallet to access this page and interact with the blockchain.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-mono text-left">
              {error}
            </div>
          )}

          <button
            onClick={connect}
            disabled={isConnecting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16 }} />
                CONNECTING...
              </>
            ) : (
              "CONNECT METAMASK"
            )}
          </button>

          <p className="text-xs text-muted/60 font-mono">
            Don't have MetaMask?{" "}
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Install it here →
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Connected and on right network ──
  return children;
}
