import React, { useEffect } from "react";
import { shortenAddress, formatTimestamp } from "../utils/helpers.js";
import { getIPFSUrl as buildIpfsUrl } from "../utils/ipfs.js";

export default function MessageModal({ message, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,5,10,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg panel p-0 overflow-hidden animate-slide-up"
        style={{ boxShadow: "0 0 60px rgba(0,212,255,0.15), 0 0 0 1px rgba(0,212,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg viewBox="0 0 28 28" className="w-7 h-7">
                <rect x="5" y="12" width="18" height="12" rx="2"
                  fill="none" stroke="#00e676" strokeWidth="1.5" />
                <path d="M9 12V9a5 5 0 0 1 9.5-2" fill="none"
                  stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="14" cy="18" r="2" fill="#00e676" />
              </svg>
              <div className="absolute inset-0 blur-md bg-success/30 rounded-full" />
            </div>
            <div>
              <div className="font-display font-bold text-success text-sm tracking-widest">
                MESSAGE UNLOCKED
              </div>
              <div className="text-xs font-mono text-muted">
                Decrypted from IPFS
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-border text-muted hover:border-danger/50 hover:text-danger transition-all flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Meta info */}
        <div className="px-6 py-4 border-b border-border bg-void/50 space-y-2">

          {message.sender && (
            <div className="flex items-center gap-3">
              <span className="field-label mb-0 w-16">FROM</span>
              <span className="font-mono text-sm text-text">
                {shortenAddress(message.sender, 8)}
              </span>
            </div>
          )}

          {message.unlockTime && (
            <div className="flex items-center gap-3">
              <span className="field-label mb-0 w-16">OPENED</span>
              <span className="font-mono text-sm text-muted">
                {formatTimestamp(Math.floor(Date.now() / 1000))}
              </span>
            </div>
          )}

          {message.ipfsHash && (
            <div className="flex items-center gap-3">
              <span className="field-label mb-0 w-16">IPFS</span>
              <span className="font-mono text-xs text-accent truncate max-w-xs">
                <a
                  href={buildIpfsUrl(message.ipfsHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {message.ipfsHash.slice(0, 20)}...
                </a>
              </span>
            </div>
          )}

        </div>

        {/* Message Content */}
        <div className="px-6 py-6">
          <div className="field-label">SECRET MESSAGE</div>
          <div
            className="mt-2 p-4 rounded-xl border border-success/20 bg-success/5 font-body text-base text-text leading-relaxed whitespace-pre-wrap"
            style={{ minHeight: "120px" }}
          >
            {message.content || (
              <span className="text-muted italic">No message content found.</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg border border-border text-muted font-mono text-xs tracking-widest hover:border-accent/40 hover:text-accent transition-all duration-200"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}