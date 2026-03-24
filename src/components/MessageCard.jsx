/**
 * MESSAGE CARD COMPONENT
 *
 * Displays a single message entry in the inbox or sent list.
 * Shows sender/receiver, unlock time, status badge, and countdown.
 *
 * Props:
 * - message: { id, sender, receiver, unlockTime, isRead, createdAt }
 * - type: "received" | "sent"
 * - onView: callback when "View Message" button is clicked
 */

import React, { useState } from "react";
import CountdownTimer from "./CountdownTimer.jsx";
import {
  shortenAddress,
  formatTimestamp,
  isUnlocked,
  copyToClipboard,
} from "../utils/helpers.js";

export default function MessageCard({ message, type = "received", onView }) {
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

  const unlocked = isUnlocked(message.unlockTime);
  const canView  = type === "received" && unlocked;

  const handleView = async () => {
    setLoading(true);
    try {
      await onView(message.id);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async () => {
    if (await copyToClipboard(String(message.id))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`panel p-5 transition-all duration-300 hover:border-accent/20
        ${unlocked ? "hover:shadow-[0_0_30px_rgba(0,212,255,0.05)]" : ""}`}
    >
      {/* ── Top Row: ID + Status ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Message ID badge */}
          <button
            onClick={handleCopyId}
            title="Copy message ID"
            className="font-mono text-xs text-muted hover:text-accent transition-colors"
          >
            #{copied ? "COPIED" : String(message.id).padStart(4, "0")}
          </button>

          {/* Read indicator */}
          {type === "received" && message.isRead && (
            <span className="text-xs font-mono text-muted/60">(read)</span>
          )}
        </div>

        {/* Status badge */}
        {unlocked ? (
          <span className="badge-unlocked">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            UNLOCKED
          </span>
        ) : (
          <span className="badge-locked">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            LOCKED
          </span>
        )}
      </div>

      {/* ── Message Info ── */}
      <div className="space-y-2 mb-4">
        {/* Sender or Receiver */}
        <div className="flex items-center gap-2">
          <span className="field-label w-20 mb-0">
            {type === "received" ? "FROM" : "TO"}
          </span>
          <span className="font-mono text-sm text-text">
            {shortenAddress(type === "received" ? message.sender : message.receiver, 6)}
          </span>
        </div>

        {/* Unlock time */}
        <div className="flex items-center gap-2">
          <span className="field-label w-20 mb-0">UNLOCKS</span>
          <span className="font-mono text-sm text-text">
            {formatTimestamp(message.unlockTime)}
          </span>
        </div>

        {/* Created at */}
        <div className="flex items-center gap-2">
          <span className="field-label w-20 mb-0">SENT</span>
          <span className="font-mono text-sm text-muted">
            {formatTimestamp(message.createdAt)}
          </span>
        </div>
      </div>

      {/* ── Countdown or Unlocked State ── */}
      {!unlocked ? (
        <div className="border-t border-border pt-4">
          <CountdownTimer unlockTime={message.unlockTime} />
        </div>
      ) : (
        <div className="border-t border-border pt-4">
          {type === "received" ? (
            <button
              onClick={handleView}
              disabled={loading}
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  DECRYPTING...
                </>
              ) : (
                <>
                  <span>👁</span> VIEW MESSAGE
                </>
              )}
            </button>
          ) : (
            <div className="text-center text-xs font-mono text-success/60">
              ✓ Receiver can now access this message
            </div>
          )}
        </div>
      )}
    </div>
  );
}
