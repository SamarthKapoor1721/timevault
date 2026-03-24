/**
 * useCountdown HOOK
 *
 * A custom hook that counts down to a future timestamp.
 * Updates every second using setInterval.
 *
 * @param {number|bigint} unlockTimestamp - Unix timestamp (seconds) to count down to
 * @returns {{ days, hours, minutes, seconds, isExpired }}
 */

import { useState, useEffect } from "react";
import { getTimeRemaining } from "../utils/helpers.js";

export function useCountdown(unlockTimestamp) {
  const [remaining, setRemaining] = useState(() =>
    getTimeRemaining(unlockTimestamp)
  );

  useEffect(() => {
    if (!unlockTimestamp) return;

    // Update immediately
    setRemaining(getTimeRemaining(unlockTimestamp));

    // Then update every second
    const interval = setInterval(() => {
      const r = getTimeRemaining(unlockTimestamp);
      setRemaining(r);

      // Stop ticking once expired
      if (r.isExpired) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockTimestamp]);

  return remaining;
}
