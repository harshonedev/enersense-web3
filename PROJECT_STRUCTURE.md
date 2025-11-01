# EnerSense Project Structure

Complete overview of the project architecture and file organization.

## 📁 Directory Structure

```
enersense-web3/
│
├── 📱 app/                           # Next.js 14 App Router
│   ├── api/                          # API Routes
│   │   ├── kwala-webhook/            # kWALA automation webhooks
│   │   │   └── route.ts              # Webhook handler
│   │   ├── tuya/                     # Tuya IoT endpoints
│   │   │   └── reading/              # Energy meter readings
│   │   │       └── route.ts
│   │   ├── voucher/                  # Voucher management
│   │   │   └── list/                 # List user vouchers
│   │   │       └── route.ts
│   │   └── marketplace/              # Marketplace APIs
│   │       ├── listings/             # List all listings
│   │       ├── create/               # Create new listing
│   │       └── buy/                  # Purchase tokens
│   │
│   ├── dashboard/                    # User dashboard
│   │   └── page.tsx                  # Main dashboard view
│   ├── marketplace/                  # Trading marketplace
│   │   └── page.tsx                  # Marketplace view
│   ├── profile/                      # User profile
│   │   └── page.tsx                  # Profile view
│   │
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
│
├── 🎨 components/                    # React Components
│   ├── energy/                       # Energy monitoring
│   │   ├── EnergyMeter.tsx          # Real-time meter display
│   │   └── TokenBalance.tsx         # ENRG token balance
│   ├── marketplace/                  # Marketplace UI
│   │   └── ListingCard.tsx          # Individual listing card
│   ├── wallet/                       # Web3 wallet
│   │   └── Web3Provider.tsx         # Wagmi + Web3Modal setup
│   └── ui/                           # Shared UI components
│       └── Navbar.tsx                # Navigation bar
│
├── 📚 lib/                           # Utility Libraries
│   ├── blockchain/                   # Blockchain interactions
│   │   └── contracts.ts              # Contract ABIs and helpers
│   ├── supabase/                     # Database client
│   │   └── client.ts                 # Supabase queries
│   ├── tuya/                         # Tuya IoT client
│   │   └── client.ts                 # Energy meter API
│   ├── kwala/                        # kWALA automation
│   │   └── client.ts                 # Workflow triggers
│   └── utils.ts                      # General utilities
│
├── 🔗 blockchain/                    # Smart Contracts
│   ├── contracts/                    # Solidity contracts
│   │   ├── ENRGToken.sol            # ERC-20 energy token
│   │   ├── VoucherMinter.sol        # Secure minting with vouchers
│   │   └── EnergyMarketplace.sol    # P2P trading contract
│   │
│   ├── scripts/                      # Deployment scripts
│   │   └── deploy.ts                 # Main deployment script
│   │
│   ├── test/                         # Contract tests
│   │   └── ENRGToken.test.ts        # Token contract tests
│   │
│   ├── hardhat.config.ts            # Hardhat configuration
│   ├── package.json                  # Blockchain dependencies
│   └── .env.example                  # Environment template
│
├── 🗄️ supabase/                      # Database
│   └── schema.sql                    # PostgreSQL schema
│
├── 📖 docs/                          # Documentation
│   ├── kwala-integration.md         # kWALA setup guide
│   └── tuya-setup.md                # Tuya IoT guide
│
├── 🔧 scripts/                       # Helper scripts
│   └── setup.sh                      # Development setup script
│
├── 📝 types/                         # TypeScript Types
│   └── index.ts                      # Global type definitions
│
├── 🎨 styles/                        # Additional styles
│
├── 📦 public/                        # Static assets
│
├── package.json                      # Frontend dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts               # Tailwind CSS config
├── next.config.js                   # Next.js config
├── .eslintrc.json                   # ESLint config
├── .gitignore                        # Git ignore rules
├── .env.local.example               # Environment template
├── README.md                         # Main documentation
├── CONTRIBUTING.md                   # Contribution guide
├── LICENSE                           # MIT License
└── PROJECT_STRUCTURE.md             # This file
```

## 🔑 Key Files Explained

### Frontend Core

- **`app/layout.tsx`** - Root layout with Web3Provider wrapper
- **`app/page.tsx`** - Landing page with feature showcase
- **`components/wallet/Web3Provider.tsx`** - Wagmi and Web3Modal configuration

### API Routes

- **`app/api/kwala-webhook/route.ts`** - Receives automation events from kWALA
- **`app/api/tuya/reading/route.ts`** - Fetches real-time energy data
- **`app/api/voucher/list/route.ts`** - Lists user's minting history

### Smart Contracts

- **`ENRGToken.sol`** - ERC-20 token representing 1 kWh per token
- **`VoucherMinter.sol`** - Signature-based minting with nonce tracking
- **`EnergyMarketplace.sol`** - Decentralized P2P trading

### Integration Clients

- **`lib/blockchain/contracts.ts`** - Contract ABIs and ethers.js wrappers
- **`lib/supabase/client.ts`** - Database queries for devices and vouchers
- **`lib/tuya/client.ts`** - Tuya Cloud API integration
- **`lib/kwala/client.ts`** - kWALA workflow automation

## 🔄 Data Flow

### Token Minting Flow

```
1. Tuya Meter → Surplus Energy Detected
2. Supabase → Store Reading + Trigger
3. kWALA → Workflow Activated
4. kWALA → Generate & Sign Voucher
5. kWALA → Call VoucherMinter.redeem()
6. Blockchain → Mint ENRG Tokens
7. Webhook → Update Database Status
8. Frontend → Display New Balance
```

### Trading Flow

```
1. User → Create Listing (Marketplace UI)
2. Frontend → Approve ENRG Tokens
3. Frontend → Call createListing()
4. Blockchain → Lock Tokens in Contract
5. Buyer → Send Payment + Call buyListing()
6. Blockchain → Transfer Tokens & Payment
7. Database → Update Listing Status
```

## 🛠️ Technology Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Wagmi v2 + Web3Modal
- Ethers.js v6

### Backend
- Next.js API Routes
- Supabase (PostgreSQL)
- kWALA Automation
- Tuya Cloud API

### Blockchain
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- Base Network

## 📦 Dependencies Overview

### Main Dependencies
```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "ethers": "^6.9.2",
  "wagmi": "^2.5.7",
  "@web3modal/wagmi": "^4.1.0",
  "@supabase/supabase-js": "^2.39.1",
  "tailwindcss": "^3.4.0"
}
```

### Blockchain Dependencies
```json
{
  "@openzeppelin/contracts": "^5.0.1",
  "hardhat": "^2.19.4",
  "ethers": "^6.9.2"
}
```

## 🚀 Getting Started

### Quick Setup

```bash
# Clone and install
git clone <repository-url>
cd enersense-web3
./scripts/setup.sh

# Configure environment
cp .env.local.example .env.local
# Edit with your credentials

# Start development
npm run dev
```

### Deploy Contracts

```bash
cd blockchain
npm run compile
npm run test
npm run deploy:baseSepolia
```

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Contract tests
cd blockchain && npm test

# Type checking
npm run type-check
```

## 📝 Environment Variables

Required variables documented in `.env.local.example`:

- Supabase (URL, anon key)
- Tuya (access ID, secret, device ID)
- kWALA (API key, workflow ID, webhook secret)
- Blockchain (RPC URL, contract addresses)
- WalletConnect (project ID)

## 🔐 Security Considerations

- Private keys stored only in kWALA HSM
- Voucher nonces prevent replay attacks
- Webhook signatures verified
- Row-level security in Supabase
- Contract auditing recommended

## 📊 Database Schema

Main tables:
- `user_profiles` - User accounts
- `energy_devices` - Registered meters
- `energy_readings` - Time-series data
- `mint_vouchers` - Minting history
- `marketplace_listings` - Active trades
- `kwala_workflow_logs` - Automation logs

## 🌐 Deployment

- **Frontend**: Vercel, Netlify, or self-hosted
- **Contracts**: Base Sepolia (testnet) or Base (mainnet)
- **Database**: Supabase cloud or self-hosted PostgreSQL

## 📚 Additional Resources

- [README.md](./README.md) - Main documentation
- [docs/kwala-integration.md](./docs/kwala-integration.md) - kWALA setup
- [docs/tuya-setup.md](./docs/tuya-setup.md) - IoT configuration
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

---

**Last Updated**: 2024
