/**
 * IPFS UTILITY (using Pinata)
 *
 * WHAT IS IPFS?
 * InterPlanetary File System — a decentralized storage network.
 * Instead of storing files on a single server, they're distributed
 * across many computers worldwide.
 *
 * WHAT IS PINATA?
 * A service that "pins" your files on IPFS so they stay available.
 * Free tier: 1GB storage, perfect for this project.
 *
 * HOW IT WORKS HERE:
 * 1. User writes message in the frontend
 * 2. We upload it to Pinata → get back a CID (Content Identifier)
 *    e.g. "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 * 3. We store the CID in the smart contract (not the full message)
 * 4. To read: fetch from IPFS using the CID + a gateway URL
 *
 * WHY IPFS AND NOT ON-CHAIN?
 * Storing strings on-chain is very expensive (gas fees).
 * IPFS is essentially free and decentralized.
 */

const PINATA_API_KEY    = import.meta.env.VITE_PINATA_API_KEY    || "";
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || "";
const IPFS_GATEWAY      = import.meta.env.VITE_IPFS_GATEWAY      || "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload a text message to IPFS via Pinata
 *
 * @param {string} message - The secret message text
 * @param {object} metadata - Extra info stored alongside the message
 * @returns {string} The IPFS CID (hash)
 *
 * @example
 * const cid = await uploadToIPFS("Hello future!", { sender: "0x123..." });
 * // Returns: "QmAbcDef..."
 */
export async function uploadToIPFS(message, metadata = {}) {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error(
      "Pinata API keys not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in your .env file."
    );
  }

  // Structure the data we'll store on IPFS
  const data = {
    message,
    metadata: {
      ...metadata,
      version: "1.0",
      uploadedAt: new Date().toISOString(),
    },
  };

  // Convert to JSON string for upload
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: "application/json" });

  // Use FormData to send multipart request to Pinata
  const formData = new FormData();
  formData.append("file", blob, "secret-message.json");

  // Optional: add Pinata-specific metadata (shows up in your Pinata dashboard)
  const pinataMetadata = JSON.stringify({
    name: `SecretMessage_${Date.now()}`,
    keyvalues: {
      app: "TimeLockedDApp",
      type: "secret-message",
    },
  });
  formData.append("pinataMetadata", pinataMetadata);

  // Upload to Pinata
  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key:        PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} — ${errorText}`);
  }

  const result = await response.json();

  // IpfsHash is the CID we store on-chain
  return result.IpfsHash;
}

/**
 * Fetch message content from IPFS using a CID
 *
 * @param {string} cid - The IPFS CID stored in the smart contract
 * @returns {object} The parsed message data { message, metadata }
 *
 * @example
 * const data = await fetchFromIPFS("QmAbcDef...");
 * console.log(data.message); // "Hello future!"
 */
export async function fetchFromIPFS(cid) {
  if (!cid) throw new Error("CID is required");

  const url = `${IPFS_GATEWAY}${cid}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Build a full IPFS URL from a CID
 * Useful for linking to the raw IPFS content
 */
export function getIPFSUrl(cid) {
  return `${IPFS_GATEWAY}${cid}`;
}
