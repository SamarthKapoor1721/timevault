/**
 * WALLET CONTEXT
 *
 * React Context is like a "global store" — any component in the app
 * can access wallet state without passing props through every level.
 *
 * This context handles:
 * - Connecting to MetaMask
 * - Storing the connected address
 * - Storing the ethers.js provider and signer
 * - Auto-reconnecting on page refresh
 * - Listening for account/network changes
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// Create the context object
const WalletContext = createContext(null);

// Expected chain ID — must match your deployed network
const EXPECTED_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "31337");

/**
 * WalletProvider wraps your app and provides wallet state to all children
 */
export function WalletProvider({ children }) {
  // ─── State ───────────────────────────────────────────────
  const [account,   setAccount]   = useState(null);    // Connected wallet address
  const [provider,  setProvider]  = useState(null);    // ethers.js BrowserProvider
  const [signer,    setSigner]    = useState(null);    // ethers.js Signer (can sign txs)
  const [chainId,   setChainId]   = useState(null);    // Current chain ID
  const [isConnecting, setIsConnecting] = useState(false);
  const [error,     setError]     = useState(null);

  // Derived state
  const isConnected    = !!account;
  const isWrongNetwork = chainId !== null && chainId !== EXPECTED_CHAIN_ID;

  // ─── Connect Wallet ───────────────────────────────────────
  const connect = useCallback(async () => {
    setError(null);

    // Check if MetaMask is installed
    if (!window.ethereum) {
      setError("MetaMask not found. Please install MetaMask browser extension.");
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access — triggers MetaMask popup
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        setError("No accounts found. Please unlock MetaMask.");
        return;
      }

      // Create ethers.js provider wrapping MetaMask
      // BrowserProvider = the new v6 way (was Web3Provider in v5)
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer   = await _provider.getSigner();
      const _network  = await _provider.getNetwork();

      setAccount(accounts[0]);
      setProvider(_provider);
      setSigner(_signer);
      setChainId(Number(_network.chainId));
    } catch (err) {
      if (err.code === 4001) {
        setError("Connection rejected by user.");
      } else {
        setError("Failed to connect wallet: " + err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ─── Disconnect Wallet ────────────────────────────────────
  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  // ─── Switch to correct network ────────────────────────────
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${EXPECTED_CHAIN_ID.toString(16)}` }],
      });
    } catch (err) {
      setError("Failed to switch network: " + err.message);
    }
  }, []);

  // ─── Auto-reconnect on page load ─────────────────────────
  // If user was already connected, reconnect silently
  useEffect(() => {
    if (!window.ethereum) return;

    const tryAutoConnect = async () => {
      try {
        // eth_accounts doesn't trigger popup — just checks if already connected
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          const _signer   = await _provider.getSigner();
          const _network  = await _provider.getNetwork();

          setAccount(accounts[0]);
          setProvider(_provider);
          setSigner(_signer);
          setChainId(Number(_network.chainId));
        }
      } catch {
        // Silently fail — user just isn't connected
      }
    };

    tryAutoConnect();
  }, []);

  // ─── Listen for MetaMask Events ──────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    // User switched account in MetaMask
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAccount(accounts[0]);
        // Re-init signer for new account
        const _provider = new ethers.BrowserProvider(window.ethereum);
        _provider.getSigner().then(setSigner);
      }
    };

    // User switched network in MetaMask
    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
      // Reload the page — ethers.js recommends this on chain change
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged",    handleChainChanged);

    // Cleanup listeners when component unmounts
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged",    handleChainChanged);
    };
  }, [disconnect]);

  // ─── Context Value ────────────────────────────────────────
  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isConnecting,
    isWrongNetwork,
    error,
    connect,
    disconnect,
    switchNetwork,
    clearError: () => setError(null),
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Custom hook — use this in any component to access wallet state
 * Usage: const { account, connect, isConnected } = useWallet();
 */
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
