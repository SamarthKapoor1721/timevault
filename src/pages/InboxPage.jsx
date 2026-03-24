/**
 * INBOX PAGE
 *
 * Shows all messages received by the connected wallet.
 *
 * For each message:
 * - If locked:    shows countdown timer + "Access Denied" style badge
 * - If unlocked:  shows "View Message" button
 *
 * When "View Message" is clicked (v2 flow — BUG 1 fixed):
 * ─────────────────────────────────────────────────────────
 * Step 1 — contract.viewMessage(id)
 *           → FREE view call, no MetaMask popup
 *           → Returns the IPFS CID directly as a string
 *           → Validates: caller==receiver AND now>=unlockTime
 *
 * Step 2 — fetchFromIPFS(cid)
 *           → Fetches the actual message text from IPFS/Pinata
 *           → Shows it in the modal immediately
 *
 * Step 3 — contract.markAsRead(id)  [optional, background]
 *           → Nonpayable tx — asks MetaMask to confirm
 *           → Sets isRead=true on-chain, emits MessageRead event
 *           → Lets the sender know their message was opened
 */

import React, { useState, useCallback } from "react";
import WalletGuard from "../components/WalletGuard.jsx";
import MessageCard from "../components/MessageCard.jsx";
import MessageModal from "../components/MessageModal.jsx";
import { useContract } from "../hooks/useContract.js";
import { useToast } from "../components/Toast.jsx";
import { fetchFromIPFS } from "../utils/ipfs.js";

export default function InboxPage() {
  return (
    <WalletGuard>
      <InboxContent />
    </WalletGuard>
  );
}

function InboxContent() {
  // We need a writable contract for markAsRead() tx
  // We use the same instance for viewMessage() (view calls work on writable too)
  const { contract, isReady } = useContract(false);
  const toast = useToast();

  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fetched,  setFetched]  = useState(false);
  const [modal,    setModal]    = useState(null);

  // ── Fetch inbox from blockchain ──────────────────────────
  const fetchInbox = useCallback(async () => {
    if (!isReady) {
      toast.error("Contract not connected. Check your .env setup.");
      return;
    }

    setLoading(true);
    try {
      // Free view call — returns 5 parallel arrays
      const [ids, senders, unlockTimes, isReadFlags, createdAts] =
        await contract.getMyReceivedMessages();

      // Zip into array of objects
      const msgs = ids.map((id, i) => ({
        id:         id,
        sender:     senders[i],
        unlockTime: unlockTimes[i],
        isRead:     isReadFlags[i],
        createdAt:  createdAts[i],
      }));

      // Most recent first
      msgs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

      setMessages(msgs);
      setFetched(true);
      toast.success(`Loaded ${msgs.length} message${msgs.length !== 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch messages: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  }, [contract, isReady, toast]);

  // ── View a specific message ──────────────────────────────
  const handleViewMessage = useCallback(async (messageId) => {
    if (!isReady) return;

    try {
      // ── STEP 1: Get IPFS hash via FREE view call ──
      // ✅ BUG 1 FIX: viewMessage() is marked `view` in Solidity.
      // ethers.js performs an eth_call (no transaction, no MetaMask popup).
      // The return value (ipfsHash string) is directly available.
      // The old getMessage() was non-view, so ethers.js returned a tx receipt
      // instead of the string — the hash was silently lost every time.
      toast.info("Verifying access with contract...");

      let ipfsHash;
      try {
        ipfsHash = await contract.viewMessage(messageId);
      } catch (viewErr) {
        // Translate contract revert reasons into user-friendly messages
        const reason = viewErr.reason || viewErr.message || "";
        if (reason.includes("still locked")) {
          toast.error("🔒 Message is still time-locked! Check the countdown.");
          return;
        }
        if (reason.includes("only receiver")) {
          toast.error("You are not the intended receiver of this message.");
          return;
        }
        if (reason.includes("does not exist")) {
          toast.error("This message ID does not exist on-chain.");
          return;
        }
        throw viewErr;
      }

      // ── STEP 2: Fetch message content from IPFS ──
      toast.info("Fetching message from IPFS...");
      const data = await fetchFromIPFS(ipfsHash);

      // Find the message metadata from local state
      const msgMeta = messages.find(
        (m) => m.id.toString() === messageId.toString()
      );

      // Show modal with the decrypted content
      setModal({
        content:    data.message,
        sender:     msgMeta?.sender,
        unlockTime: msgMeta?.unlockTime,
        ipfsHash,
      });

      // ── STEP 3: Mark as read on-chain (background, non-blocking) ──
      // This is optional from the user's perspective — they already see the message.
      // We fire it in the background so it doesn't block the modal from showing.
      // The try/catch is intentionally separate so a rejected tx doesn't hide the message.
      try {
        toast.info("Confirm MetaMask to record this read on-chain...");
        const tx = await contract.markAsRead(messageId);
        await tx.wait(1);

        // Update local state to reflect isRead=true
        setMessages((prev) =>
          prev.map((m) =>
            m.id.toString() === messageId.toString()
              ? { ...m, isRead: true }
              : m
          )
        );
        toast.success("Message marked as read on-chain ✓");
      } catch (markErr) {
        // User rejected the markAsRead tx — that's fine, they still saw the message
        if (markErr.code === 4001 || markErr.code === "ACTION_REJECTED") {
          toast.info("Read not recorded on-chain (transaction declined).");
        } else {
          console.warn("markAsRead failed:", markErr.message);
        }
      }

    } catch (err) {
      console.error(err);
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        toast.info("Transaction cancelled.");
      } else {
        toast.error("Failed to read message: " + (err.reason || err.message));
      }
    }
  }, [contract, isReady, messages, toast]);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-xs tracking-[0.3em] text-muted uppercase mb-2">
            Inbox
          </div>
          <h1 className="font-display font-bold text-white text-3xl tracking-wide">
            Received Messages
          </h1>
          <p className="text-muted text-sm mt-1">
            Messages sent to your wallet address.
          </p>
        </div>

        <button
          onClick={fetchInbox}
          disabled={loading}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              Loading...
            </>
          ) : (
            <>{fetched ? "↻ Refresh" : "Load Messages"}</>
          )}
        </button>
      </div>

      {/* ── Empty State: Not yet loaded ── */}
      {!fetched && !loading && (
        <div className="panel p-12 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h3 className="font-display font-bold text-white text-xl mb-2">
            Load Your Inbox
          </h3>
          <p className="text-muted text-sm mb-6">
            Click "Load Messages" to fetch your messages from the blockchain.
          </p>
          <button onClick={fetchInbox} className="btn-primary">
            Load Messages
          </button>
        </div>
      )}

      {/* ── Empty State: Loaded but no messages ── */}
      {fetched && messages.length === 0 && (
        <div className="panel p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-display font-bold text-white text-xl mb-2">
            No Messages Yet
          </h3>
          <p className="text-muted text-sm">
            Nobody has sent you a time-locked message yet. Share your address!
          </p>
        </div>
      )}

      {/* ── Message List ── */}
      {messages.length > 0 && (
        <>
          {/* Stats bar */}
          <div className="flex gap-4 mb-6">
            <div className="panel px-4 py-2 text-center">
              <div className="font-display font-bold text-accent text-xl">
                {messages.length}
              </div>
              <div className="text-xs font-mono text-muted">TOTAL</div>
            </div>
            <div className="panel px-4 py-2 text-center">
              <div className="font-display font-bold text-success text-xl">
                {messages.filter(
                  (m) => Number(m.unlockTime) <= Math.floor(Date.now() / 1000)
                ).length}
              </div>
              <div className="text-xs font-mono text-muted">UNLOCKED</div>
            </div>
            <div className="panel px-4 py-2 text-center">
              <div className="font-display font-bold text-danger text-xl">
                {messages.filter(
                  (m) => Number(m.unlockTime) > Math.floor(Date.now() / 1000)
                ).length}
              </div>
              <div className="text-xs font-mono text-muted">LOCKED</div>
            </div>
          </div>

          {/* Message cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map((msg) => (
              <MessageCard
                key={msg.id.toString()}
                message={msg}
                type="received"
                onView={handleViewMessage}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Decrypted Message Modal ── */}
      {modal && (
        <MessageModal
          message={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
