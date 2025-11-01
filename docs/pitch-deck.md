# EnerSense Web3
### Tokenized Renewable Energy Trading with Automated IoT→On-chain Minting

- Turn surplus renewable energy into tradable tokens
- Automated, verifiable, and transparent via kWALA workflows
- Real-time IoT measurement using Tuya energy meters
- P2P marketplace for buying/selling ENRG tokens

---

## Problem
- Surplus renewable energy is hard to monetize for small producers
- Fragmented and centralized systems breed inefficiency and opacity
- IoT→Blockchain bridges often require brittle custom backends and key custody

---

## Our Solution
- Tokenize surplus energy as ERC-20 ENRG tokens (1 ENRG = 1 kWh)
- Automate detection→minting with kWALA Web3 Workflow Automation
- Verify energy via Tuya smart meter readings
- Enable P2P trading in a decentralized marketplace

---

## How It Works (High-Level)
1) Tuya meter measures exported kWh
2) Supabase syncs and logs readings
3) kWALA workflow validates surplus and signs mint voucher
4) Smart contracts mint ENRG to the user
5) Users trade ENRG in the marketplace

---

## System Architecture
```
Tuya Smart Meter (export kWh)
│
▼
Tuya Cloud Events
│
▼
Supabase Data Sync
│
▼
kWALA Workflow Trigger
│
▼
Voucher-Based Minting Contract
(ENRG Token + VoucherMinter)
│
▼
ENRG Tokens in User Wallet
│
▼
EnerSense Marketplace
```

---

## Why kWALA Automation Matters
- Event-driven minting—no cron jobs, no brittle servers
- Secure signing via kWALA HSM (no private keys in app)
- Workflow guarantees and sequencing
- Reduces DevOps complexity and operational risk

---

## Product Features
- Automated surplus energy detection → token minting
- Real-time IoT measurement via Tuya Cloud API
- Decentralized P2P marketplace for ENRG trades
- Wallet support (MetaMask + WalletConnect)
- Stablecoin or native gas token payments
- Optional redemption flows (fiat/utility credits)
- Fully event-driven backend via kWALA

---

## Token Model
- Token: ENRG (ERC-20)
- 1 ENRG = 1 kWh of verified surplus energy
- Mint trigger: Tuya → Supabase → kWALA → VoucherMinter.redeem()
- Burn trigger: Redemption for fiat/utility credit (optional flow)

---

## Smart Contracts
- ENRGToken.sol — ERC-20 token (energy unit)
- VoucherMinter.sol — signature-based minting with nonce/expiry
- EnergyMarketplace.sol — P2P listing creation and purchases
- Built with Solidity 0.8.x, OpenZeppelin, Hardhat, Ethers v6

---

## Integrations
- IoT: Tuya Smart Meter / Inverter (Cloud API + optional MQTT)
- Automation: kWALA Web3 Workflow Automation
- Data: Supabase (PostgreSQL, auth, real-time)
- Frontend: Next.js 14, React, Tailwind, Wagmi + Web3Modal
- Chain: Polygon (Mumbai testnet → Polygon mainnet ready)

---

## Demo Flow (Hackathon-Friendly)
1) Connect wallet (MetaMask / WalletConnect)
2) Dashboard shows address + real-time meter data
3) Simulate/export reading (Tuya endpoint or test mode)
4) kWALA workflow triggers voucher → mint ENRG
5) ENRG balance updates in wallet UI
6) Create marketplace listing; buy from another wallet

---

## Security By Design
- Keys: Managed in kWALA HSM (no app-side private keys)
- Vouchers: Signed with nonces and expiries (replay-safe)
- Webhook signature verification for kWALA events
- OpenZeppelin libraries and gas-optimized patterns
- Supabase RLS and input validation

---

## Tech Stack
- Frontend: Next.js 14, React 18, Tailwind, Wagmi, Web3Modal, Ethers v6
- Backend: Next.js API routes, Supabase, kWALA workflows
- Blockchain: Solidity 0.8.x, Hardhat, OpenZeppelin, Polygon
- IoT: Tuya Cloud API (status polling + event/webhook options)

---

## Traction & Readiness
- 3 core contracts (ENRGToken, VoucherMinter, EnergyMarketplace)
- Next.js app with marketplace and dashboard
- Tuya + kWALA + Supabase integration clients
- Deployment scripts, tests, and docs (Quickstart, Tuya, kWALA)

---

## Impact
- Empowers prosumers to monetize clean energy
- Transparent, auditable kWh tokenization on-chain
- Incentivizes local microgrids and community energy sharing
- Foundation for future carbon and ESG reporting

---

## Roadmap
- Phase 1 (Done): Automated minting, P2P marketplace, testnet deploy
- Phase 2: Mobile app, multi-chain (ETH/BSC), fiat on/off ramps, utility bill credits
- Phase 3: DAO governance, staking/LPs, carbon credit tracking, advanced analytics

---

## Why Now
- Rising distributed generation (solar/wind/microgrids)
- Maturing Web3 infra for real assets
- IoT platforms (Tuya) enable verifiable data at scale
- Automation (kWALA) removes ops and custody barriers

---

## What We Need
- Pilot users with Tuya-compatible meters
- Utility and community microgrid partners
- Advisors on compliance and renewable markets
- Grants or credits for testnet/mainnet infra

---

## Team, Links, and Contact
- Repo: https://github.com/harshonedev/enersense-web3
- Docs: README, Quickstart, Tuya + kWALA guides in `/docs`
- Chain: Polygon (Mumbai testnet, mainnet-ready)
- Date: 2025-11-01

---

## Closing
EnerSense bridges IoT energy data and Web3 markets—automating trust, unlocking liquidity, and empowering prosumers to monetize renewable energy.

Let’s power the future—one kWh at a time.
