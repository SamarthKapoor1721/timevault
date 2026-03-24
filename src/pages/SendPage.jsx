/**
 * SEND MESSAGE PAGE
 *
 * This page handles the full flow of sending a time-locked message:
 *
 * Step 1 — User fills the form (receiver, message, unlock time)
 * Step 2 — Upload message to IPFS via Pinata → get CID
 * Step 3 — Call contract.sendMessage(receiver, cid, unlockTime) on-chain
 * Step 4 — Show success with transaction hash
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WalletGuard from "../components/WalletGuard.jsx";
import { useContract } from "../hooks/useContract.js";
import { useWallet } from "../context/WalletContext.jsx";
import { useToast } from "../components/Toast.jsx";
import { uploadToIPFS } from "../utils/ipfs.js";
import {
  isValidAddress,
  datetimeToTimestamp,
  getMinDatetime,
  formatTimestamp,
  datetimeToTimestamp as toTs,
} from "../utils/helpers.js";

// Steps shown in the progress bar
const STEPS = ["COMPOSE", "UPLOAD TO IPFS", "SEND ON-CHAIN", "DONE"];

export default function SendPage() {
  return (
    <WalletGuard>
      <SendPageContent />
    </WalletGuard>
  );
}

function SendPageContent() {
  const { account } = useWallet();
  const { contract, isReady } = useContract(false); // false = writable
  const toast = useToast();
  const navigate = useNavigate();

  // ── Form State ──
  const [form, setForm] = useState({
    receiver:   "",
    message:    "",
    unlockTime: "", // datetime-local string
  });

  // ── Process State ──
  const [step,    setStep]    = useState(0); // 0=idle, 1=uploading, 2=tx, 3=done
  const [txHash,  setTxHash]  = useState("");
  const [ipfsCid, setIpfsCid] = useState("");
  const [msgId,   setMsgId]   = useState(null);
  const [errors,  setErrors]  = useState({});

  const isProcessing = step > 0 && step < 3;

  // ── Validation ──
  function validate() {
    const e = {};
    if (!form.receiver.trim())             e.receiver   = "Receiver address is required";
    else if (!isValidAddress(form.receiver)) e.receiver = "Invalid Ethereum address";
    else if (form.receiver.toLowerCase() === account.toLowerCase())
                                           e.receiver   = "Cannot send to yourself";
    if (!form.message.trim())              e.message    = "Message cannot be empty";
    if (form.message.length > 10000)       e.message    = "Message too long (max 10,000 chars)";
    if (!form.unlockTime)                  e.unlockTime = "Unlock time is required";
    else {
      const ts = datetimeToTimestamp(form.unlockTime);
      if (ts <= Math.floor(Date.now() / 1000) + 60) {
        e.unlockTime = "Unlock time must be at least 1 minute in the future";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit Handler ──
  async function handleSend() {
    if (!validate())   return;
    if (!isReady) {
      toast.error("Contract not ready. Check your .env configuration.");
      return;
    }

    const unlockTimestamp = datetimeToTimestamp(form.unlockTime);

    try {
      // ── STEP 1: Upload to IPFS ──
      setStep(1);
      toast.info("Uploading message to IPFS...");

      const cid = await uploadToIPFS(form.message, {
        sender:     account,
        receiver:   form.receiver,
        unlockTime: unlockTimestamp,
      });

      setIpfsCid(cid);
      toast.success(`Uploaded to IPFS: ${cid.slice(0, 16)}...`);

      // ── STEP 2: Send on-chain ──
      setStep(2);
      toast.info("Sending transaction... Check MetaMask.");

      const tx = await contract.sendMessage(
        form.receiver,
        cid,
        unlockTimestamp
      );

      toast.info(`Transaction submitted: ${tx.hash.slice(0, 16)}...`);

      // Wait for 1 confirmation
      const receipt = await tx.wait(1);
      setTxHash(receipt.hash || tx.hash);

      // Try to extract the messageId from emitted event logs
      try {
        // The MessageSent event is the first log
        const log = receipt.logs[0];
        if (log && log.args) {
          setMsgId(log.args[0]?.toString());
        }
      } catch { /* ignore — messageId is optional */ }

      // ── STEP 3: Done ──
      setStep(3);
      toast.success("🎉 Secret message sent successfully!");

    } catch (err) {
      setStep(0);
      console.error(err);

      // Human-readable error messages
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user.");
      } else if (err.message?.includes("unlock time must be in the future")) {
        toast.error("Unlock time must be in the future (contract rejected).");
      } else if (err.message?.includes("Pinata")) {
        toast.error("IPFS upload failed. Check your Pinata API keys in .env");
      } else {
        toast.error("Error: " + (err.reason || err.message || "Unknown error"));
      }
    }
  }

  // ── Reset form ──
  function handleReset() {
    setForm({ receiver: "", message: "", unlockTime: "" });
    setStep(0);
    setTxHash("");
    setIpfsCid("");
    setMsgId(null);
    setErrors({});
  }

  // ─────────────────────────────────────────────
  // RENDER: Success state
  // ─────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
        <div className="panel p-8 text-center space-y-6">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none"
                  stroke="#00e676" strokeWidth="2" />
                <path d="M24 40l12 12 20-24" fill="none"
                  stroke="#00e676" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="absolute inset-0 bg-success/10 blur-xl rounded-full" />
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-success text-2xl tracking-wider mb-2">
              MESSAGE SENT!
            </h2>
            <p className="text-muted text-sm">
              Your secret message is locked on the blockchain.
            </p>
          </div>

          {/* Details */}
          <div className="text-left space-y-3 panel p-4">
            {msgId !== null && (
              <div>
                <div className="field-label">Message ID</div>
                <div className="font-mono text-sm text-accent">#{msgId}</div>
              </div>
            )}
            {ipfsCid && (
              <div>
                <div className="field-label">IPFS CID</div>
                <div className="font-mono text-xs text-text break-all">{ipfsCid}</div>
              </div>
            )}
            {txHash && (
              <div>
                <div className="field-label">Transaction Hash</div>
                <div className="font-mono text-xs text-text break-all">{txHash}</div>
              </div>
            )}
            <div>
              <div className="field-label">Unlock Time</div>
              <div className="font-mono text-sm text-gold">
                {formatTimestamp(datetimeToTimestamp(form.unlockTime))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleReset} className="btn-primary flex-1">
              Send Another
            </button>
            <button onClick={() => navigate("/sent")} className="btn-gold flex-1">
              View Sent Messages
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER: Form
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      {/* Page header */}
      <div className="mb-8">
        <div className="font-mono text-xs tracking-[0.3em] text-muted uppercase mb-2">
          Compose
        </div>
        <h1 className="font-display font-bold text-white text-3xl tracking-wide">
          Send Secret Message
        </h1>
        <p className="text-muted text-sm mt-2">
          Write your message, choose an unlock time, and seal it on the blockchain.
        </p>
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mb-6 panel p-4">
          <div className="flex justify-between mb-3">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`text-xs font-mono font-bold tracking-wider transition-colors ${
                  i < step ? "text-success"
                  : i === step - 1 ? "text-accent animate-pulse"
                  : "text-muted/40"
                }`}
              >
                {i < step ? "✓ " : ""}{label}
              </div>
            ))}
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${((step) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="mt-3 text-xs font-mono text-accent animate-pulse">
            {step === 1 && "Uploading to IPFS via Pinata..."}
            {step === 2 && "Waiting for blockchain confirmation..."}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="panel p-6 space-y-6">
        {/* Receiver Address */}
        <div>
          <label className="field-label" htmlFor="receiver">
            Receiver Address
          </label>
          <input
            id="receiver"
            type="text"
            placeholder="0x1234567890abcdef..."
            className={`input-field font-mono ${errors.receiver ? "border-danger/60" : ""}`}
            value={form.receiver}
            onChange={(e) => setForm({ ...form, receiver: e.target.value.trim() })}
            disabled={isProcessing}
          />
          {errors.receiver && (
            <p className="mt-1.5 text-xs text-danger font-mono">{errors.receiver}</p>
          )}
          <p className="mt-1.5 text-xs text-muted font-mono">
            The Ethereum address of the person who will receive this message.
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="field-label" htmlFor="message">
            Secret Message
          </label>
          <textarea
            id="message"
            placeholder="Write your secret message here... It will be stored on IPFS and locked until the unlock time."
            className={`input-field ${errors.message ? "border-danger/60" : ""}`}
            style={{ minHeight: "150px" }}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            disabled={isProcessing}
          />
          <div className="flex justify-between mt-1.5">
            {errors.message ? (
              <p className="text-xs text-danger font-mono">{errors.message}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs font-mono ${form.message.length > 9000 ? "text-danger" : "text-muted"}`}>
              {form.message.length}/10,000
            </span>
          </div>
        </div>

        {/* Unlock Time */}
        <div>
          <label className="field-label" htmlFor="unlockTime">
            Unlock Time
          </label>
          <input
            id="unlockTime"
            type="datetime-local"
            className={`input-field font-mono ${errors.unlockTime ? "border-danger/60" : ""}`}
            min={getMinDatetime()}
            value={form.unlockTime}
            onChange={(e) => setForm({ ...form, unlockTime: e.target.value })}
            disabled={isProcessing}
            style={{ colorScheme: "dark" }}
          />
          {errors.unlockTime ? (
            <p className="mt-1.5 text-xs text-danger font-mono">{errors.unlockTime}</p>
          ) : (
            <p className="mt-1.5 text-xs text-muted font-mono">
              The receiver cannot view this message before this date/time.
            </p>
          )}

          {/* Quick presets */}
          {!isProcessing && (
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: "5 min",  secs: 5 * 60 },
                { label: "1 hour", secs: 3600 },
                { label: "1 day",  secs: 86400 },
                { label: "1 week", secs: 7 * 86400 },
                { label: "1 year", secs: 365 * 86400 },
              ].map(({ label, secs }) => {
                const future = Math.floor(Date.now() / 1000) + secs;
                const d = new Date(future * 1000);
                const pad = (n) => String(n).padStart(2, "0");
                const dtLocal = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setForm({ ...form, unlockTime: dtLocal })}
                    className="px-3 py-1 text-xs font-mono rounded-lg border border-border
                               text-muted hover:border-accent/40 hover:text-accent transition-all"
                  >
                    +{label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="px-4 py-3 rounded-lg bg-accent/5 border border-accent/20 text-xs font-mono text-muted space-y-1">
          <div className="text-accent font-bold mb-1">ℹ  What happens when you click Send:</div>
          <div>1. Message is uploaded to IPFS via Pinata</div>
          <div>2. MetaMask will ask you to confirm a transaction</div>
          <div>3. The contract stores the IPFS hash + unlock time on-chain</div>
          <div>4. Gas fees apply (small ETH amount for Sepolia testnet)</div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSend}
          disabled={isProcessing || !isReady}
          className="btn-gold w-full py-4 text-base flex items-center justify-center gap-3"
        >
          {isProcessing ? (
            <>
              <span className="spinner" />
              {step === 1 ? "Uploading to IPFS..." : "Sending Transaction..."}
            </>
          ) : (
            "🔒 Seal & Send Message"
          )}
        </button>
      </div>
    </div>
  );
}
