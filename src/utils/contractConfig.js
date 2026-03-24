/**
 * CONTRACT CONFIGURATION
 *
 * This file contains:
 * 1. The contract's Ethereum address (where it's deployed)
 * 2. The ABI — Application Binary Interface
 *
 * WHAT IS AN ABI?
 * Think of it as the "menu" for your smart contract.
 * It tells ethers.js what functions exist and what parameters they take.
 * The ABI is auto-generated when you compile with Hardhat.
 *
 * UPDATED in v2:
 * - Removed getMessage() (was broken — non-view returning a value)
 * - Added viewMessage()  → view function, free, returns IPFS hash directly
 * - Added markAsRead()   → nonpayable tx, records isRead=true on-chain
 * - Added MAX_LOCK_DURATION constant
 */

// ─── Contract Address ─────────────────────────────────────
// Filled in from your .env file (Vite exposes VITE_* vars to the browser)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

// ─── Expected Chain ID ────────────────────────────────────
export const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "31337");

// ─── Contract ABI ────────────────────────────────────────
// Matches SecretMessage.sol v2 exactly.
// If you add/change functions in Solidity, update this too.
export const CONTRACT_ABI = [

  // ── Events ──────────────────────────────────────────────

  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "name": "messageId",  "type": "uint256" },
      { "indexed": true,  "name": "sender",     "type": "address" },
      { "indexed": true,  "name": "receiver",   "type": "address" },
      { "indexed": false, "name": "unlockTime", "type": "uint256" }
    ],
    "name": "MessageSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "messageId", "type": "uint256" },
      { "indexed": true, "name": "receiver",  "type": "address" }
    ],
    "name": "MessageRead",
    "type": "event"
  },

  // ── sendMessage ─────────────────────────────────────────
  // Sends a new time-locked message. Costs gas (writes to blockchain).

  {
    "inputs": [
      { "name": "_receiver",   "type": "address" },
      { "name": "_ipfsHash",   "type": "string"  },
      { "name": "_unlockTime", "type": "uint256" }
    ],
    "name": "sendMessage",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ── viewMessage ─────────────────────────────────────────
  // ✅ NEW in v2 — replaces the broken getMessage()
  // FREE to call (view). Returns the IPFS hash directly.
  // ethers.js performs an eth_call (no tx, no MetaMask popup, instant).
  // Requirements: caller == receiver AND block.timestamp >= unlockTime

  {
    "inputs": [
      { "name": "_messageId", "type": "uint256" }
    ],
    "name": "viewMessage",
    "outputs": [{ "name": "ipfsHash", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },

  // ── markAsRead ──────────────────────────────────────────
  // ✅ NEW in v2 — replaces the state-change part of old getMessage()
  // Costs gas (writes isRead=true to blockchain). Emits MessageRead event.
  // Call this after viewMessage() to permanently record the read on-chain.

  {
    "inputs": [
      { "name": "_messageId", "type": "uint256" }
    ],
    "name": "markAsRead",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // ── getMyReceivedMessages ───────────────────────────────
  // FREE. Returns 5 parallel arrays of inbox metadata (no IPFS hashes).

  {
    "inputs": [],
    "name": "getMyReceivedMessages",
    "outputs": [
      { "name": "ids",         "type": "uint256[]" },
      { "name": "senders",     "type": "address[]" },
      { "name": "unlockTimes", "type": "uint256[]" },
      { "name": "isReadFlags", "type": "bool[]"    },
      { "name": "createdAts",  "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // ── getMySentMessages ───────────────────────────────────
  // FREE. Returns 5 parallel arrays of sent messages metadata.

  {
    "inputs": [],
    "name": "getMySentMessages",
    "outputs": [
      { "name": "ids",         "type": "uint256[]" },
      { "name": "receivers",   "type": "address[]" },
      { "name": "unlockTimes", "type": "uint256[]" },
      { "name": "isReadFlags", "type": "bool[]"    },
      { "name": "createdAts",  "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },

  // ── isUnlocked ──────────────────────────────────────────
  // ✅ FIXED in v2 — now returns false for non-existent message IDs.
  // FREE. Returns true only if message EXISTS and is past its unlock time.

  {
    "inputs": [{ "name": "_messageId", "type": "uint256" }],
    "name": "isUnlocked",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },

  // ── totalMessages ───────────────────────────────────────
  // FREE. Returns total count of all messages ever created.

  {
    "inputs": [],
    "name": "totalMessages",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },

  // ── MAX_LOCK_DURATION ───────────────────────────────────
  // FREE. Returns the maximum allowed lock duration (10 years in seconds).

  {
    "inputs": [],
    "name": "MAX_LOCK_DURATION",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }

];
