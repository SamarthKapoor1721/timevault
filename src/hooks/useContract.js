/**
 * useContract HOOK
 *
 * A custom React hook that returns an ethers.js Contract instance.
 * This is what lets us call smart contract functions from React.
 *
 * HOW ETHERS.JS CONTRACTS WORK:
 * 1. You need: contract address + ABI + signer (to write) or provider (to read)
 * 2. ethers.Contract(...) creates a JS object that mirrors your Solidity contract
 * 3. You call functions like: contract.sendMessage(receiver, cid, unlockTime)
 *    and ethers.js handles converting it to an Ethereum transaction
 *
 * TWO TYPES OF CONTRACT INSTANCES:
 * - "reader" (provider): can only call view/pure functions (no gas, no tx)
 * - "writer" (signer):   can call state-changing functions (costs gas)
 */

import { useMemo } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext.jsx";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contractConfig.js";

/**
 * Returns a connected Contract instance
 *
 * @param {boolean} readOnly - If true, returns a read-only contract (no signing)
 * @returns {{ contract, isReady, error }}
 */
export function useContract(readOnly = false) {
  const { provider, signer, isConnected } = useWallet();

  const contract = useMemo(() => {
    if (!CONTRACT_ADDRESS) return null;

    // For read-only operations, we can use the provider
    if (readOnly && provider) {
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    }

    // For write operations, we need the signer (wallet)
    if (!readOnly && signer) {
      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    return null;
  }, [provider, signer, readOnly]);

  const isReady = !!contract && (readOnly ? !!provider : isConnected && !!signer);

  return {
    contract,
    isReady,
    address: CONTRACT_ADDRESS,
    error: !CONTRACT_ADDRESS ? "Contract address not configured in .env" : null,
  };
}
