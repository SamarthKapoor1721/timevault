# ⏳ TimeVault — Time-Locked Secret Message DApp

> Send secret messages on the Ethereum blockchain that are **cryptographically locked** until a future date and time. Only the intended receiver can unlock them — enforced entirely by a smart contract with no servers or middlemen.

![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?logo=solidity)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-8C2BE2)
![Network](https://img.shields.io/badge/Network-Sepolia%20Testnet-627EEA)
![IPFS](https://img.shields.io/badge/Storage-IPFS%20Pinata-65C2CB)
![License](https://img.shields.io/badge/License-MIT-22C55E)

---

## 📸 Preview

| Home Page | Send Message | Inbox |
|-----------|-------------|-------|
| Connect wallet | Compose + set unlock time | Countdown timer |
| Dark sci-fi UI | Upload to IPFS + send tx | View after unlock |

---

## 🔥 Features

- 🔒 **Time-locked messages** — smart contract blocks access before unlock time
- 🌐 **Decentralized storage** — messages stored on IPFS via Pinata
- ⛓️ **On-chain enforcement** — Solidity contract verifies receiver + time
- ⏰ **Live countdown timer** — ticks down to unlock moment
- 📬 **Inbox & Sent pages** — view all your messages
- 🦊 **MetaMask integration** — connect any Ethereum wallet
- 🔁 **Auto-reconnect** — remembers wallet on page refresh
- 📱 **Responsive UI** — works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.19 |
| Blockchain | Ethereum Sepolia Testnet |
| Contract Dev Tool | Hardhat |
| Web3 Library | Ethers.js v6 |
| Wallet | MetaMask |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Decentralized Storage | IPFS via Pinata |

---

## ⚙️ How It Works

```
Sender                     Blockchain (Sepolia)          IPFS (Pinata)
  │                                │                          │
  ├── Write message ───────────────────────────────────────► Upload
  │                                │                 ◄─────── Get CID
  ├── sendMessage(receiver, CID, unlockTime) ───────► Store on-chain
  │                                │
  │                        [Time passes...]
  │                                │
Receiver                           │
  ├── viewMessage(id) ────────────► Checks: are you receiver? is it time?
  │               ◄──────────────── Returns IPFS CID
  ├── Fetch from IPFS ─────────────────────────────────────► Pinata
  │               ◄────────────────────────────────────────── Message text
  └── Read secret message ✅
```

**Message text** → stored on **IPFS** (cheap + decentralized)

**IPFS hash + unlock rules** → stored on **Ethereum blockchain** (tamper-proof)

---

## 📁 Project Structure

```
time-locked-dapp/
│
├── contracts/
│   └── SecretMessage.sol        ← Smart contract
│
├── scripts/
│   └── deploy.js                ← Deployment script
│
├── test/
│   └── SecretMessage.test.js    ← Contract tests
│
├── hardhat.config.js            ← Hardhat configuration
├── .env.example                 ← Root env template
│
└── frontend/
    └── src/
        ├── components/          ← Navbar, MessageCard, CountdownTimer...
        ├── context/             ← WalletContext (MetaMask state)
        ├── hooks/               ← useContract, useCountdown
        ├── pages/               ← Home, Send, Inbox, Sent
        └── utils/               ← contractConfig, ipfs, helpers
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js v18+](https://nodejs.org)
- [MetaMask](https://metamask.io) browser extension
- Free [Alchemy](https://dashboard.alchemy.com) account → Sepolia RPC URL
- Free [Pinata](https://app.pinata.cloud) account → IPFS storage
- Sepolia test ETH → [sepoliafaucet.com](https://sepoliafaucet.com)

---

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/time-locked-dapp.git
cd time-locked-dapp

# Install Hardhat dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

---

### 2. Configure Environment Variables

**Root `.env`** (for deploying the contract)

```bash
cp .env.example .env
```

```env
PRIVATE_KEY=your_metamask_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**`frontend/.env`** (for the React app)

```bash
cd frontend && cp .env.example .env
```

```env
VITE_CONTRACT_ADDRESS=        # fill after deploying
VITE_CHAIN_ID=11155111
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

---

### 3. Deploy Smart Contract to Sepolia

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the printed contract address and paste it as `VITE_CONTRACT_ADDRESS` in `frontend/.env`.

---

### 4. Run the Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

### 5. Switch MetaMask to Sepolia

MetaMask → click network dropdown → **Sepolia Test Network**

---

## 📜 Smart Contract

Contract: `SecretMessage.sol`

### Functions

| Function | Type | Description |
|----------|------|-------------|
| `sendMessage(receiver, ipfsHash, unlockTime)` | nonpayable | Send a time-locked message |
| `viewMessage(messageId)` | view | Get IPFS hash — free, receiver only, after unlock |
| `markAsRead(messageId)` | nonpayable | Record message as read on-chain |
| `getMyReceivedMessages()` | view | Get all received message metadata |
| `getMySentMessages()` | view | Get all sent message metadata |
| `isUnlocked(messageId)` | view | Check if message is past unlock time |
| `totalMessages()` | view | Total messages ever sent |

### Events

| Event | Emitted When |
|-------|-------------|
| `MessageSent(messageId, sender, receiver, unlockTime)` | New message created |
| `MessageRead(messageId, receiver)` | Receiver reads a message |

### Security

- ✅ Receiver-only access enforced on-chain
- ✅ Time-lock enforced by `block.timestamp`
- ✅ Non-existent message IDs return `false` (not `true`)
- ✅ Maximum unlock time capped at 10 years

---

## 🔑 Environment Variables Reference

| Variable | File | Description |
|----------|------|-------------|
| `PRIVATE_KEY` | root `.env` | MetaMask private key for deploying |
| `SEPOLIA_RPC_URL` | root `.env` | Alchemy HTTPS URL for Sepolia |
| `VITE_CONTRACT_ADDRESS` | `frontend/.env` | Deployed contract address |
| `VITE_CHAIN_ID` | `frontend/.env` | `11155111` for Sepolia |
| `VITE_PINATA_API_KEY` | `frontend/.env` | Pinata API key |
| `VITE_PINATA_SECRET_KEY` | `frontend/.env` | Pinata secret key |
| `VITE_IPFS_GATEWAY` | `frontend/.env` | IPFS gateway URL |

> ⚠️ **Never commit your `.env` files to GitHub.** They are already in `.gitignore`.

---

## 🧪 Run Tests

```bash
npx hardhat test
```

Tests cover all contract functions including the 3 bug fixes.

---

## ❗ Troubleshooting

| Error | Fix |
|-------|-----|
| MetaMask not found | Install MetaMask extension |
| Wrong Network | Switch MetaMask to Sepolia Testnet |
| Contract address not configured | Set `VITE_CONTRACT_ADDRESS` in `frontend/.env` |
| Pinata upload failed | Check Pinata API keys in `frontend/.env` |
| Message is still locked | Wait for the unlock time to pass |
| Transaction nonce error | MetaMask → Settings → Advanced → Reset Account |

---

## 🌐 Deploy Frontend

Deploy to Vercel in 2 minutes:

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Set **Root Directory** to `frontend`
4. Add all `VITE_*` environment variables in Vercel dashboard
5. Click **Deploy** ✅

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🙏 Built With

- [Hardhat](https://hardhat.org) — Ethereum development environment
- [Ethers.js](https://docs.ethers.org) — Ethereum JavaScript library
- [Pinata](https://pinata.cloud) — IPFS pinning service
- [Alchemy](https://alchemy.com) — Blockchain node provider
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS framework
- [Vite](https://vitejs.dev) — Frontend build tool
