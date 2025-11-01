# EnerSense Quick Start Guide

Get up and running with EnerSense in under 15 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] MetaMask or compatible Web3 wallet
- [ ] Supabase account (free tier works)
- [ ] Tuya IoT Platform account
- [ ] kWALA account
- [ ] Test MATIC tokens (for Mumbai testnet)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/your-org/enersense-web3
cd enersense-web3

# Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install all dependencies
- Create environment files
- Compile smart contracts
- Run initial tests

## Step 2: Configure Supabase (3 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for provisioning (2-3 minutes)
3. Go to **SQL Editor** and run `supabase/schema.sql`
4. Get your credentials:
   - Project Settings → API
   - Copy URL and anon public key

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Set Up Tuya IoT (5 minutes)

1. Visit https://iot.tuya.com
2. Create a Cloud Project
3. Link your Tuya Smart app account
4. Add your energy meter device
5. Note the Device ID

Add to `.env.local`:
```env
TUYA_ACCESS_ID=your-access-id
TUYA_ACCESS_SECRET=your-access-secret
TUYA_DEVICE_ID=your-device-id
```

## Step 4: Configure kWALA (3 minutes)

1. Go to https://app.kwala.com
2. Create a new workflow
3. Set trigger: Supabase database event
4. Add actions (see docs/kwala-integration.md)
5. Get your API credentials

Add to `.env.local`:
```env
KWALA_API_KEY=your-api-key
KWALA_WORKFLOW_ID=your-workflow-id
KWALA_WEBHOOK_SECRET=your-webhook-secret
```

## Step 5: Get WalletConnect Project ID (1 minute)

1. Visit https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID

Add to `.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

## Step 6: Deploy Smart Contracts (2 minutes)

```bash
cd blockchain

# Add your private key to .env (testnet wallet with MATIC)
echo "PRIVATE_KEY=your-private-key" > .env

# Deploy to Mumbai testnet
npm run deploy:mumbai

# Note the contract addresses
# Add them to your .env.local
```

Add to `.env.local`:
```env
NEXT_PUBLIC_ENRG_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_VOUCHER_MINTER_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://rpc.ankr.com/polygon_mumbai
NEXT_PUBLIC_CHAIN_ID=80001
```

## Step 7: Start Development Server (1 minute)

```bash
# From project root
npm run dev
```

Visit http://localhost:3000

## Step 8: Test the Flow (5 minutes)

### 8.1 Connect Wallet
1. Click "Connect Wallet" in navbar
2. Connect MetaMask
3. Switch to Mumbai testnet

### 8.2 View Dashboard
1. Navigate to Dashboard
2. You should see your energy meter (if configured)
3. Token balance should be 0 initially

### 8.3 Simulate Energy Reading
```bash
# In a new terminal
curl -X GET "http://localhost:3000/api/tuya/reading?deviceId=YOUR_DEVICE_ID"
```

### 8.4 Trigger Manual Mint (for testing)
If surplus energy is detected:
- kWALA workflow should trigger automatically
- Check workflow status in kWALA dashboard
- Tokens should appear in your wallet within 1-2 minutes

### 8.5 Test Marketplace
1. Navigate to Marketplace
2. Create a test listing
3. Try buying with a different wallet

## Verification Checklist

- [ ] Frontend loads without errors
- [ ] Wallet connects successfully
- [ ] Dashboard shows your address
- [ ] Energy meter data displays
- [ ] Smart contracts are deployed
- [ ] kWALA workflow is active
- [ ] Database tables exist
- [ ] API routes respond correctly

## Common Issues & Fixes

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Smart contract deployment fails

**Solution:**
- Check you have test MATIC in your wallet
- Get test MATIC from https://faucet.polygon.technology
- Verify private key in blockchain/.env

### Issue: Tuya API returns 401

**Solution:**
- Verify Access ID and Secret are correct
- Check if your IP is whitelisted (if enabled)
- Ensure device is linked to your cloud project

### Issue: kWALA workflow doesn't trigger

**Solution:**
- Verify workflow is published and active
- Check Supabase webhook configuration
- Review workflow logs in kWALA dashboard

### Issue: Wallet won't connect

**Solution:**
- Ensure WalletConnect Project ID is set
- Clear browser cache
- Try different wallet (MetaMask vs WalletConnect)

## Next Steps

✅ **Development Setup Complete!**

Now you can:
1. **Customize**: Modify UI components to match your brand
2. **Integrate**: Add your actual energy meters
3. **Test**: Run through the complete user flow
4. **Deploy**: Push to production (see README.md)

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Blockchain
cd blockchain
npm run compile                # Compile contracts
npm run test                   # Run contract tests
npm run deploy:mumbai          # Deploy to testnet
npm run deploy:polygon         # Deploy to mainnet

# Database
# Run supabase/schema.sql in Supabase SQL Editor

# Testing
npm run test                   # Run all tests
npm run type-check             # TypeScript checks
```

## Getting Help

- 📖 Full docs: [README.md](./README.md)
- 🔧 kWALA integration: [docs/kwala-integration.md](./docs/kwala-integration.md)
- 🌐 Tuya setup: [docs/tuya-setup.md](./docs/tuya-setup.md)
- 🤝 Contribute: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 💬 Discord: [Join our community](#)
- 📧 Email: support@enersense.io

## Demo Credentials (for testing only)

Use these for initial testing without real IoT devices:

```env
# Demo Mode (no real devices)
TUYA_DEVICE_ID=demo
```

The app will show simulated data in demo mode.

---

**Estimated Total Setup Time: 15-20 minutes**

Happy building! ⚡🌱
