/**
 * GENERAL UTILITY FUNCTIONS
 * Reusable helpers used throughout the app
 */

/**
 * Shorten an Ethereum address for display
 * "0x1234567890abcdef..." → "0x1234...cdef"
 *
 * @param {string} address - Full Ethereum address
 * @param {number} chars   - Characters to show at start/end (default 4)
 */
export function shortenAddress(address, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a Unix timestamp to a human-readable date/time string
 *
 * @param {number|bigint} timestamp - Unix timestamp (seconds)
 * @returns {string} e.g. "Jan 15, 2025, 3:30 PM"
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return "Unknown";
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleString("en-US", {
    year:   "numeric",
    month:  "short",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate time remaining until a future timestamp
 *
 * @param {number|bigint} unlockTimestamp - Unix timestamp (seconds)
 * @returns {{ days, hours, minutes, seconds, isExpired }}
 */
export function getTimeRemaining(unlockTimestamp) {
  const ts  = typeof unlockTimestamp === "bigint" ? Number(unlockTimestamp) : unlockTimestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = ts - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days    = Math.floor(diff / 86400);
  const hours   = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return { days, hours, minutes, seconds, isExpired: false };
}

/**
 * Check if a timestamp is in the past (i.e., message is unlocked)
 *
 * @param {number|bigint} timestamp - Unix timestamp (seconds)
 */
export function isUnlocked(timestamp) {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return Math.floor(Date.now() / 1000) >= ts;
}

/**
 * Convert a datetime-local input string to Unix timestamp (seconds)
 * Input format: "2025-01-15T15:30"
 *
 * @param {string} datetimeLocal - Value from <input type="datetime-local">
 * @returns {number} Unix timestamp in seconds
 */
export function datetimeToTimestamp(datetimeLocal) {
  return Math.floor(new Date(datetimeLocal).getTime() / 1000);
}

/**
 * Convert a Unix timestamp to datetime-local input format
 * Used for setting min value on the datetime picker
 *
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} e.g. "2025-01-15T15:30"
 */
export function timestampToDatetimeLocal(timestamp) {
  const date = new Date(timestamp * 1000);
  // Format: YYYY-MM-DDTHH:MM
  const year   = date.getFullYear();
  const month  = String(date.getMonth() + 1).padStart(2, "0");
  const day    = String(date.getDate()).padStart(2, "0");
  const hour   = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Get the minimum datetime value (now + 5 minutes) for the datetime picker
 */
export function getMinDatetime() {
  const now = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
  return timestampToDatetimeLocal(now);
}

/**
 * Validate an Ethereum address
 */
export function isValidAddress(address) {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pad a number with leading zeros (for countdown display)
 * 5 → "05", 12 → "12"
 */
export function padZero(n) {
  return String(n).padStart(2, "0");
}
