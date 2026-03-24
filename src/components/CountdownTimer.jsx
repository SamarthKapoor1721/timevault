/**
 * COUNTDOWN TIMER COMPONENT
 *
 * Shows a ticking countdown to the unlock time.
 * Displays days / hours / minutes / seconds with a glowing sci-fi aesthetic.
 *
 * @param {number|bigint} unlockTime - Unix timestamp (seconds)
 * @param {boolean} compact - If true, shows a smaller inline version
 */

import React from "react";
import { useCountdown } from "../hooks/useCountdown.js";
import { padZero } from "../utils/helpers.js";

export default function CountdownTimer({ unlockTime, compact = false }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(unlockTime);

  if (isExpired) {
    return compact ? (
      <span className="badge-unlocked">
        <span>✓</span> UNLOCKED
      </span>
    ) : (
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-success/10 border border-success/40">
          <span className="text-success text-2xl">✓</span>
          <div>
            <div className="font-display font-bold text-success text-lg tracking-widest">
              UNLOCKED
            </div>
            <div className="text-success/60 text-xs font-mono">
              Message is now accessible
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <span className="badge-locked">
        <span>🔒</span>
        {days > 0 && `${days}d `}
        {padZero(hours)}h {padZero(minutes)}m {padZero(seconds)}s
      </span>
    );
  }

  // Full countdown display
  const units = [
    { label: "DAYS",    value: days    },
    { label: "HOURS",   value: hours   },
    { label: "MINUTES", value: minutes },
    { label: "SECONDS", value: seconds },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-mono text-muted tracking-widest uppercase">
        <span className="text-danger">🔒</span>
        <span>Time until unlock</span>
      </div>

      {/* Digit blocks */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {units.map(({ label, value }, i) => (
          <React.Fragment key={label}>
            {/* Digit block */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Background glow */}
                <div
                  className="absolute inset-0 rounded-lg blur-md opacity-30"
                  style={{ background: "rgba(0,212,255,0.4)" }}
                />
                {/* Digit */}
                <div
                  className="relative w-14 sm:w-16 h-14 sm:h-16 rounded-lg border border-accent/30
                              bg-panel flex items-center justify-center"
                  style={{ boxShadow: "0 0 20px rgba(0,212,255,0.1)" }}
                >
                  <span
                    className="countdown-digit text-2xl sm:text-3xl tabular-nums"
                    key={value} // Re-trigger CSS animation on change
                  >
                    {padZero(value)}
                  </span>
                </div>
              </div>
              <span className="mt-2 text-xs font-mono text-muted tracking-widest">
                {label}
              </span>
            </div>

            {/* Separator (not after last item) */}
            {i < units.length - 1 && (
              <span
                className="countdown-digit text-2xl mb-4 animate-pulse"
                style={{ animationDuration: "1s" }}
              >
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
