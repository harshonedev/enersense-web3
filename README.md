# EnerSense Web3 — Tokenized Renewable Energy Trading (with kWALA Automation)

EnerSense enables users with renewable energy installations (solar, wind, microgrid) to **tokenize their surplus energy** and **trade it on-chain**.

Real-time surplus energy is measured using **Tuya IoT energy meters**, verified, and **automatically converted into ENRG tokens** using the **kWALA Web3 Workflow Automation Protocol** — ensuring secure, verifiable, and transparent minting.

Users can **sell**, **buy**, or **redeem** energy tokens in a decentralized marketplace.

---

## 🌍 Key Features

- **Automated Surplus Detection → Token Minting** powered by **kWALA workflows**
- **Real-Time IoT Energy Measurement** via Tuya Smart Meter SDK
- **Decentralized Marketplace** for peer-to-peer energy token trading
- **Wallet Connect Integration** (MetaMask & WalletConnect)
- **Stablecoin or Native Gas Token Payments**
- Optional **Fiat Redemption / Utility Bill Credits**
- **No Centralized API Between IoT & Blockchain** — thanks to kWALA automation

---

## 🔗 System Architecture (With kWALA)

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
(EnergyVoucherMinter + ENRG Token)
│
▼
ENRG Tokens in User Wallet
│
▼
EnerSense Marketplace
```

---

## 🛠 Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first styling
- **Web3Modal + Wagmi** - Wallet connection and blockchain interactions
- **Ethers.js v6** - Smart contract calls
- **Supabase** - Authentication & real-time database

### **Backend & Automation**
- **kWALA Web3 Workflow Automation** - Automates token minting
- **Supabase PostgreSQL** - Device and voucher logs
- **Next.js API Routes** - Minimal backend layer
- **Tuya Cloud API** - IoT energy meter integration

### **Blockchain**
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Audited contract libraries
- **ENRG Token (ERC-20)** - Represents energy units
- **VoucherMinter** - Secure minting with signatures
- **EnergyMarketplace** - P2P trading contract

### **IoT Layer**
- **Tuya Smart Meter / Solar Inverter** - Energy monitoring
- **Tuya Cloud API / MQTT** - Real-time data streaming

---

## ⚡ How kWALA Adds Automation

| Without kWALA | With kWALA |
|--------------|------------|
| Backend must detect surplus manually | Surplus detection triggers **automatically** |
| Manual signing of vouchers | **kWALA signs & broadcasts mint transaction** |
| Requires developer-managed cron & queue layers | Fully event-driven workflow graph |
| Higher risk of operational failure | **Guaranteed execution sequencing** |

**Example Workflow:**
```
WHEN exported_kWh increases
THEN generate voucher
AND call smart contract redeem()
```

This removes backend private-key exposure and central dependency.

---

## 🪙 Token Model

- **Name:** ENRG (Energy Token)
- **Standard:** ERC-20
- **Conversion:** 1 ENRG = 1 kWh of verified surplus energy
- **Mint Trigger:** Tuya → Supabase → kWALA Workflow → Smart Contract
- **Burn Trigger:** Token redemption for fiat/utility credit

---

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Tuya IoT Platform account
- kWALA account and API key
- Supabase project

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-org>/enersense-web3
cd enersense-web3

# Install frontend dependencies
npm install

# Install blockchain dependencies
cd blockchain
npm install
cd ..
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Fill in your credentials in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Tuya IoT
TUYA_ACCESS_ID=your-tuya-access-id
TUYA_ACCESS_SECRET=your-tuya-access-secret
TUYA_DEVICE_ID=your-device-id

# kWALA
KWALA_API_KEY=your-kwala-api-key
KWALA_WORKFLOW_ID=your-workflow-id
KWALA_WEBHOOK_SECRET=your-webhook-secret

# Blockchain
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `supabase/schema.sql`
3. Set up database triggers for kWALA integration

### Smart Contract Deployment

```bash
cd blockchain

# Copy environment example
cp .env.example .env

# Add your private key to .env
# PRIVATE_KEY=your-private-key

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to Base Sepolia testnet
npm run deploy:baseSepolia

# Deploy to Base mainnet
npm run deploy:base
```

After deployment, add the contract addresses to your `.env.local` file.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Project Structure

```
enersense-web3/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── kwala-webhook/        # kWALA webhook handler
│   │   ├── tuya/                 # Tuya IoT endpoints
│   │   └── voucher/              # Voucher management
│   ├── dashboard/                # User dashboard
│   ├── marketplace/              # Trading marketplace
│   └── profile/                  # User profile
├── components/                   # React components
│   ├── energy/                   # Energy monitoring
│   ├── marketplace/              # Marketplace UI
│   ├── wallet/                   # Web3 wallet
│   └── ui/                       # Shared UI components
├── lib/                          # Utility libraries
│   ├── blockchain/               # Smart contract interactions
│   ├── supabase/                 # Database client
│   ├── tuya/                     # Tuya IoT client
│   └── kwala/                    # kWALA automation client
├── blockchain/                   # Smart contracts
│   ├── contracts/                # Solidity contracts
│   ├── scripts/                  # Deployment scripts
│   └── test/                     # Contract tests
└── types/                        # TypeScript types
```

---

## 🔐 Security Considerations

1. **Private Keys**: Never commit private keys. Use environment variables.
2. **Voucher Signatures**: All minting requires valid signatures from kWALA workflow.
3. **Nonce Tracking**: Prevents replay attacks on voucher redemption.
4. **Contract Auditing**: Consider professional audit before mainnet deployment.
5. **Webhook Verification**: kWALA webhooks are signature-verified.

---

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Smart Contract Tests
```bash
cd blockchain
npm run test
```

### Local Blockchain
```bash
cd blockchain
npx hardhat node
```

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel or your preferred hosting
```

### Smart Contracts
See the [blockchain deployment guide](./blockchain/README.md)

---

## 📚 Documentation

- [Smart Contracts](./blockchain/README.md)
- [kWALA Integration Guide](./docs/kwala-integration.md)
- [Tuya IoT Setup](./docs/tuya-setup.md)
- [API Reference](./docs/api-reference.md)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **kWALA** - Web3 workflow automation
- **Tuya** - IoT platform for energy monitoring
- **OpenZeppelin** - Secure smart contract libraries
- **Supabase** - Backend infrastructure
- **Base** - Layer 2 blockchain network

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/<your-org>/enersense-web3/issues)
- Discord: [Join our community](#)
- Email: support@enersense.io

---

## 🗺️ Roadmap

- [x] Core token minting with kWALA automation
- [x] P2P marketplace
- [ ] Mobile app (React Native)
- [ ] Multi-chain support (Ethereum, BSC)
- [ ] Fiat on/off ramps
- [ ] Utility bill payment integration
- [ ] DAO governance
- [ ] Carbon credit tracking
- [ ] Advanced analytics dashboard

---

**Built with ⚡ by the EnerSense Team**
