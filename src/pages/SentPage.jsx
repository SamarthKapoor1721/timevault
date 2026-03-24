/**
 * SENT PAGE
 *
 * Shows all messages the connected wallet has sent.
 * Similar to inbox but shows receiver addresses instead of senders.
 * Cannot view message content (only receiver can do that).
 */

import React, { useState, useCallback } from "react";
import WalletGuard from "../components/WalletGuard.jsx";
import MessageCard from "../components/MessageCard.jsx";
import { useContract } from "../hooks/useContract.js";
import { useToast } from "../components/Toast.jsx";

export default function SentPage() {
  return (
    <WalletGuard>
      <SentContent />
    </WalletGuard>
  );
}

function SentContent() {
  const { contract, isReady } = useContract(true); // true = read-only
  const toast = useToast();

  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [fetched,  setFetched]  = useState(false);

  const fetchSent = useCallback(async () => {
    if (!isReady) {
      toast.error("Contract not connected.");
      return;
    }

    setLoading(true);
    try {
      const [ids, receivers, unlockTimes, isReadFlags, createdAts] =
        await contract.getMySentMessages();

      const msgs = ids.map((id, i) => ({
        id:         id,
        receiver:   receivers[i],
        unlockTime: unlockTimes[i],
        isRead:     isReadFlags[i],
        createdAt:  createdAts[i],
      }));

      msgs.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      setMessages(msgs);
      setFetched(true);
      toast.success(`Loaded ${msgs.length} sent message${msgs.length !== 1 ? "s" : ""}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sent messages: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  }, [contract, isReady, toast]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-xs tracking-[0.3em] text-muted uppercase mb-2">
            Outbox
          </div>
          <h1 className="font-display font-bold text-white text-3xl tracking-wide">
            Sent Messages
          </h1>
          <p className="text-muted text-sm mt-1">
            Messages you've sent to others.
          </p>
        </div>

        <button
          onClick={fetchSent}
          disabled={loading}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          {loading ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              Loading...
            </>
          ) : (
            <>{fetched ? "↻ Refresh" : "Load Sent"}</>
          )}
        </button>
      </div>

      {!fetched && !loading && (
        <div className="panel p-12 text-center">
          <div className="text-5xl mb-4">📤</div>
          <h3 className="font-display font-bold text-white text-xl mb-2">
            View Sent Messages
          </h3>
          <p className="text-muted text-sm mb-6">
            See all time-locked messages you've sent and their current status.
          </p>
          <button onClick={fetchSent} className="btn-primary">
            Load Sent Messages
          </button>
        </div>
      )}

      {fetched && messages.length === 0 && (
        <div className="panel p-12 text-center">
          <div className="text-5xl mb-4">📮</div>
          <h3 className="font-display font-bold text-white text-xl mb-2">
            No Sent Messages
          </h3>
          <p className="text-muted text-sm">
            You haven't sent any time-locked messages yet.
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <>
          <div className="flex gap-4 mb-6">
            <div className="panel px-4 py-2 text-center">
              <div className="font-display font-bold text-accent text-xl">{messages.length}</div>
              <div className="text-xs font-mono text-muted">SENT</div>
            </div>
            <div className="panel px-4 py-2 text-center">
              <div className="font-display font-bold text-success text-xl">
                {messages.filter(m => m.isRead).length}
              </div>
              <div className="text-xs font-mono text-muted">READ</div>
            </div>
            <div className="panel px-4 py-2 text-center">
              <div className="font-display font-bold text-muted text-xl">
                {messages.filter(m => !m.isRead).length}
              </div>
              <div className="text-xs font-mono text-muted">UNREAD</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map((msg) => (
              <MessageCard
                key={msg.id.toString()}
                message={msg}
                type="sent"
                onView={() => {}} // Sender can't view — only receiver
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
