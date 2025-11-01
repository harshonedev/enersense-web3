# EnerSense Deployment Guide - Base Network

Complete guide to deploying and running EnerSense contracts on Base network.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Contract Deployment](#contract-deployment)
4. [Frontend Configuration](#frontend-configuration)
5. [Testing the Deployment](#testing-the-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** 18+ and npm
- **Git**
- **MetaMask** or compatible Web3 wallet
- **Base Network** added to your wallet

### Required Accounts

1. **BaseSepolia Testnet Faucet** - For test ETH
   - Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Or use: https://www.alchemy.com/faucets/base-sepolia

2. **BaseScan API Key** (optional, for contract verification)
   - Sign up at: https://basescan.org/
   - Get API key from account dashboard

3. **Supabase Account**
   - Create at: https://supabase.com

4. **WalletConnect Project ID**
   - Get from: https://cloud.walletconnect.com

---

## Environment Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd enersense-web3

# Install frontend dependencies
npm install

# Install blockchain dependencies
cd blockchain
npm install
cd ..
```

### Step 2: Configure Blockchain Environment

Create `blockchain/.env` file:

```bash
cd blockchain
touch .env
```

Add the following to `blockchain/.env`:

```env
# Private key of the wallet used for deployment (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Base Sepolia Testnet RPC (optional - defaults to https://sepolia.base.org)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Base Mainnet RPC (optional - defaults to https://mainnet.base.org)
BASE_RPC_URL=https://mainnet.base.org

# BaseScan API Key (for contract verification)
BASESCAN_API_KEY=your_basescan_api_key
```

**⚠️ Security Warning:**
- Never commit your private key to version control
- Add `blockchain/.env` to `.gitignore`
- Use a separate wallet for deployment with minimal funds
- Consider using a hardware wallet for mainnet deployments

### Step 3: Get Test ETH

For **Base Sepolia Testnet**:

1. Visit the Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect your wallet
3. Request test ETH (you'll need at least 0.1 ETH for deployment)
4. Wait for the transaction to confirm

For **Base Mainnet**:

1. Bridge ETH from Ethereum mainnet using the Base Bridge: https://bridge.base.org/
2. Or use a centralized exchange that supports Base network

---

## Contract Deployment

### Step 1: Compile Contracts

```bash
cd blockchain
npm run compile
```

This will create the artifacts in the `artifacts/` directory.

### Step 2: Run Tests (Recommended)

```bash
npm run test
```

Ensure all tests pass before deploying to any network.

### Step 3: Deploy to Base Sepolia (Testnet)

```bash
npm run deploy:baseSepolia
```

Example output:
```
Deploying EnerSense contracts...
Deploying with account: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

1. Deploying ENRG Token...
✓ ENRG Token deployed to: 0x1234567890123456789012345678901234567890

2. Deploying VoucherMinter...
✓ VoucherMinter deployed to: 0x2345678901234567890123456789012345678901

3. Setting VoucherMinter as authorized minter...
✓ Minter authorized

4. Deploying EnergyMarketplace...
✓ EnergyMarketplace deployed to: 0x3456789012345678901234567890123456789012

========================================
DEPLOYMENT COMPLETE
========================================
ENRG Token: 0x1234567890123456789012345678901234567890
VoucherMinter: 0x2345678901234567890123456789012345678901
EnergyMarketplace: 0x3456789012345678901234567890123456789012
========================================

Add these addresses to your .env.local:
NEXT_PUBLIC_ENRG_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_VOUCHER_MINTER_ADDRESS=0x2345678901234567890123456789012345678901
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x3456789012345678901234567890123456789012

IMPORTANT: Update the signer in VoucherMinter to your kWALA workflow address
```

### Step 4: Verify Contracts (Optional)

After deployment, verify your contracts on BaseScan:

```bash
# Verify ENRG Token
npx hardhat verify --network baseSepolia 0x1234567890123456789012345678901234567890

# Verify VoucherMinter (include constructor arguments)
npx hardhat verify --network baseSepolia 0x2345678901234567890123456789012345678901 \
  "0x1234567890123456789012345678901234567890" \
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

# Verify EnergyMarketplace
npx hardhat verify --network baseSepolia 0x3456789012345678901234567890123456789012 \
  "0x1234567890123456789012345678901234567890"
```

### Step 5: Deploy to Base Mainnet

**⚠️ Before deploying to mainnet:**

1. Ensure all tests pass
2. Review the contracts thoroughly
3. Consider a professional audit
4. Test thoroughly on testnet first
5. Use a secure wallet with appropriate funds for gas

To deploy:

```bash
npm run deploy:base
```

The process is identical to testnet deployment, but make sure:
- You have sufficient ETH for gas fees
- Your private key is in `blockchain/.env`
- You've reviewed the contract addresses carefully

---

## Frontend Configuration

### Step 1: Configure Environment Variables

Create `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Tuya IoT Configuration
TUYA_ACCESS_ID=your-tuya-access-id
TUYA_ACCESS_SECRET=your-tuya-access-secret
TUYA_DEVICE_ID=your-device-id

# kWALA Configuration
KWALA_API_KEY=your-kwala-api-key
KWALA_WORKFLOW_ID=your-workflow-id
KWALA_WEBHOOK_SECRET=your-webhook-secret

# Blockchain Configuration
NEXT_PUBLIC_ENRG_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_VOUCHER_MINTER_ADDRESS=0x2345678901234567890123456789012345678901
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x3456789012345678901234567890123456789012
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84532

# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

**For Base Mainnet**, update:
```env
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
```

### Step 2: Update VoucherMinter Signer

After deployment, update the VoucherMinter contract to use your kWALA workflow address as the signer:

```typescript
// Example script (create scripts/updateSigner.ts)
import { ethers } from "hardhat";

async function main() {
  const voucherMinterAddress = process.env.NEXT_PUBLIC_VOUCHER_MINTER_ADDRESS!;
  const kwalaSignerAddress = process.env.KWALA_SIGNER_ADDRESS!;
  
  const VoucherMinter = await ethers.getContractFactory("VoucherMinter");
  const minter = VoucherMinter.attach(voucherMinterAddress);
  
  const tx = await minter.updateSigner(kwalaSignerAddress);
  await tx.wait();
  
  console.log(`Signer updated to: ${kwalaSignerAddress}`);
  console.log(`Transaction: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run with:
```bash
npx hardhat run scripts/updateSigner.ts --network baseSepolia
```

### Step 3: Set Up Database

1. Create a Supabase project
2. Run the SQL schema:

```bash
# In Supabase SQL Editor
# Copy and paste contents of supabase/schema.sql
```

3. Update your Supabase credentials in `.env.local`

### Step 4: Configure kWALA Workflow

1. Create a workflow in kWALA dashboard
2. Set the trigger (Supabase database event)
3. Configure actions to:
   - Generate vouchers
   - Sign vouchers
   - Call VoucherMinter.redeem()
   - Update database

See `docs/kwala-integration.md` for detailed instructions.

---

## Testing the Deployment

### Step 1: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### Step 2: Connect Wallet

1. Click "Connect Wallet" in the navbar
2. Select your wallet (MetaMask, WalletConnect, etc.)
3. **Switch to Base Sepolia network** (or Base Mainnet for production)
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.basescan.org

### Step 3: Verify Contract Interaction

1. Navigate to Dashboard
2. Check if token balance displays correctly
3. Try creating a marketplace listing
4. Verify transactions appear on BaseScan

### Step 4: Test Token Minting

1. Configure your Tuya device or use demo mode
2. Trigger an energy reading
3. Verify kWALA workflow executes
4. Check that tokens are minted to your wallet
5. Verify transaction on BaseScan

---

## Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution:**
- Ensure your deployment wallet has enough ETH
- For Base Sepolia: Get test ETH from faucet
- Check current gas prices: https://basescan.org/gastracker

### Issue: "Contract verification failed"

**Solution:**
- Ensure `BASESCAN_API_KEY` is set in `blockchain/.env`
- Wait a few minutes after deployment before verifying
- Check that constructor arguments match exactly

### Issue: "Wrong network in wallet"

**Solution:**
- Manually add Base Sepolia network:
  - Name: Base Sepolia
  - RPC: https://sepolia.base.org
  - Chain ID: 84532
  - Currency: ETH
  - Explorer: https://sepolia.basescan.org
- Or use the network switch prompt in MetaMask

### Issue: "Transaction reverted"

**Solution:**
- Check contract address is correct in `.env.local`
- Ensure you have approved token transfers (for marketplace)
- Verify contract state (active, not paused, etc.)
- Check gas limit is sufficient

### Issue: "RPC URL not responding"

**Solution:**
- Try alternative RPC endpoints:
  - https://sepolia.base.org
  - https://base-sepolia-rpc.publicnode.com
  - https://base-sepolia.gateway.tenderly.co
- For mainnet:
  - https://mainnet.base.org
  - https://base-rpc.publicnode.com

### Issue: "VoucherMinter signer not set"

**Solution:**
- Call `updateSigner()` with your kWALA workflow address
- Verify signer address is correct
- Check contract owner permissions

---

## Network Information

### Base Sepolia Testnet

- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Base Mainnet

- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org
- **Bridge**: https://bridge.base.org/

---

## Security Checklist

Before deploying to mainnet:

- [ ] All tests passing
- [ ] Contracts reviewed and audited (recommended)
- [ ] Private keys secured and never committed
- [ ] Environment variables properly configured
- [ ] kWALA workflow tested on testnet
- [ ] VoucherMinter signer address configured
- [ ] Database schema deployed and secured
- [ ] Webhook secrets configured
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Monitoring and alerts set up

---

## Additional Resources

- **Base Documentation**: https://docs.base.org
- **BaseScan Explorer**: https://basescan.org
- **Hardhat Documentation**: https://hardhat.org/docs
- **Ethers.js Documentation**: https://docs.ethers.org
- **Supabase Documentation**: https://supabase.com/docs
- **kWALA Documentation**: https://docs.kwala.com

---

## Quick Reference Commands

```bash
# Compile contracts
cd blockchain && npm run compile

# Run tests
cd blockchain && npm run test

# Deploy to testnet
cd blockchain && npm run deploy:baseSepolia

# Deploy to mainnet
cd blockchain && npm run deploy:base

# Verify contracts
cd blockchain && npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS]

# Start frontend
npm run dev

# Build for production
npm run build
```

---

**Need Help?** Check the [README.md](./README.md) or open an issue on GitHub.

