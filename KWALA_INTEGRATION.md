# kWALA Integration Guide - Event-Based Workflow

This guide explains how to integrate kWALA with EnerSense using event-based triggers since kWALA API/webhooks are unavailable.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│ Tuya IoT    │────▶│  Supabase   │────▶│  API Route   │
│   Meter     │     │  Database   │     │/emit-event   │
└─────────────┘     └─────────────┘     └──────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │EnergyEventEmitter│
                                    │    Contract      │
                                    │   (Emits Event)  │
                                    └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  kWALA Workflow  │
                                    │ (Listens Event)  │
                                    └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │ VoucherMinter    │
                                    │    Contract      │
                                    │  (Mints Tokens)  │
                                    └──────────────────┘
```

## Step-by-Step Setup

### 1. Deploy EnergyEventEmitter Contract

```bash
cd blockchain
npx hardhat run scripts/deploy-events.ts --network baseSepolia
```

This will output the contract address. Add to `.env.local`:

```env
NEXT_PUBLIC_ENERGY_EVENT_EMITTER_ADDRESS=0x...
EMITTER_PRIVATE_KEY=0x...  # Private key for wallet authorized to emit events
```

### 2. Set Authorized Emitter

After deploying, create a wallet for your API to use, then set it as authorized:

```bash
# Create a script: scripts/set-emitter.ts
import { ethers } from "hardhat";

async function main() {
  const emitterAddress = process.env.NEXT_PUBLIC_ENERGY_EVENT_EMITTER_ADDRESS!;
  const authorizedAddress = process.env.EMITTER_WALLET_ADDRESS!; // The public address of EMITTER_PRIVATE_KEY
  
  const emitter = await ethers.getContractAt("EnergyEventEmitter", emitterAddress);
  const tx = await emitter.setAuthorizedEmitter(authorizedAddress);
  await tx.wait();
  console.log("Authorized emitter set to:", authorizedAddress);
}

main().catch(console.error);
```

Run:
```bash
npx hardhat run scripts/set-emitter.ts --network baseSepolia
```

### 3. Update Database Schema

Add the event tracking fields (already in updated schema.sql):

```sql
ALTER TABLE energy_readings 
ADD COLUMN IF NOT EXISTS event_emitted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS event_tx_hash TEXT;
```

### 4. Create kWALA Workflow

Go to kWALA platform and create a workflow with this structure:

#### Workflow Name
```
EnerSense-Auto-Mint-Workflow
```

#### Trigger
- **TriggerSourceContract**: `<ENERGY_EVENT_EMITTER_ADDRESS>`
- **TriggerChainID**: `84532` (Base Sepolia) or `8453` (Base Mainnet)
- **TriggerEventName**: `SurplusEnergyDetected`
- **TriggerEventFilter**: (leave empty to listen to all)
- **TriggerSourceContractABI**: See full ABI in `docs/kwala-workflow-config.md`

#### Action 1: Prepare Voucher Data

This action extracts data from the event and prepares it for minting.

**Type**: `post` (or metadata-only action)

**Metadata**:
```json
{
  "userAddress": "{{TriggerEvent.userAddress}}",
  "deviceId": "{{TriggerEvent.deviceId}}",
  "surplusKwh": "{{TriggerEvent.surplusKwh}}",
  "timestamp": "{{TriggerEvent.timestamp}}",
  "nonce": "{{TriggerEvent.nonce}}",
  "tokenAmount": "{{TriggerEvent.surplusKwh}} * 1000000000000000000",
  "expiry": "{{TriggerEvent.timestamp}} + 3600"
}
```

#### Action 2: Sign Voucher

kWALA will automatically sign using the workflow's wallet. You need to configure:
- The voucher hash calculation (must match VoucherMinter contract)
- The signing method (Ethereum message signing)

**Note**: You may need to provide custom signing logic if kWALA doesn't support the exact format. Check with kWALA documentation.

#### Action 3: Call VoucherMinter.redeem()

- **Type**: `call`
- **TargetContract**: `<VOUCHER_MINTER_ADDRESS>`
- **TargetFunction**: `redeem`
- **TargetParams**: 
  - Param 1: Voucher struct
    ```solidity
    {
      user: address,      // {{TriggerEvent.userAddress}}
      amount: uint256,    // {{TriggerEvent.surplusKwh}} * 10^18
      nonce: uint256,     // {{TriggerEvent.nonce}}
      expiry: uint256,    // {{TriggerEvent.timestamp}} + 3600
      deviceId: bytes32   // {{TriggerEvent.deviceId}}
    }
    ```
  - Param 2: Signature bytes (from Action 2)
- **ChainID**: `84532` or `8453`

#### Execution Mode
```
sequential
```

### 5. Configure Workflow Signer

1. Get the wallet address from kWALA workflow (this is kWALA's signing wallet)
2. Update VoucherMinter to accept this address:

```bash
npx hardhat console --network baseSepolia
> const minter = await ethers.getContractAt("VoucherMinter", "<VOUCHER_MINTER_ADDRESS>")
> await minter.updateSigner("<KWALA_WORKFLOW_WALLET_ADDRESS>")
```

### 6. Connect Supabase to API

Create a Supabase webhook or use a cron job to check for new readings and call your API:

**Option A: Next.js API Route (Recommended)**

Create `/app/api/cron/check-readings/route.ts`:

```typescript
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  // Check for readings with surplus but no event emitted
  const { data } = await supabase
    .from('energy_readings')
    .select('*, energy_devices(user_id, user_profiles(wallet_address))')
    .eq('event_emitted', false)
    .gt('surplus_kwh', 1)
    .limit(10)

  for (const reading of data || []) {
    // Call emit-event API
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/energy/emit-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAddress: reading.energy_devices.user_profiles.wallet_address,
        deviceId: reading.device_id,
        surplusKwh: reading.surplus_kwh.toString(),
        timestamp: reading.timestamp,
        nonce: Date.now(),
        readingId: reading.id
      })
    })
  }

  return Response.json({ processed: data?.length || 0 })
}
```

Then set up a cron job (Vercel Cron, GitHub Actions, etc.) to call this route every 5 minutes.

**Option B: Supabase Edge Function**

Create a Supabase Edge Function that calls your API when surplus is detected.

### 7. Testing Flow

1. **Insert test reading in Supabase**:
   ```sql
   INSERT INTO energy_readings 
   (device_id, exported_kwh, imported_kwh, surplus_kwh, timestamp)
   VALUES 
   ('<device-uuid>', 10.5, 5.0, 5.5, NOW());
   ```

2. **Trigger event emission** (manually or via cron):
   ```bash
   curl -X POST http://localhost:3000/api/energy/emit-event \
     -H "Content-Type: application/json" \
     -d '{
       "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
       "deviceId": "test-device",
       "surplusKwh": "5.5",
       "timestamp": "2024-01-01T00:00:00Z",
       "nonce": 1234567890,
       "readingId": "<reading-uuid>"
     }'
   ```

3. **Check kWALA dashboard** for workflow execution
4. **Verify on BaseScan** that tokens were minted
5. **Check Supabase** that mint_vouchers table was updated

## Important Considerations

### Voucher Signing

The voucher must be signed exactly as VoucherMinter expects:

1. Hash voucher: `keccak256(abi.encodePacked(user, amount, nonce, expiry, deviceId))`
2. Ethereum message hash: `keccak256("\x19Ethereum Signed Message:\n32" + hash)`
3. Sign with kWALA workflow wallet

If kWALA doesn't support this exact format, you may need:
- A custom signing action
- Or modify VoucherMinter to accept a different signing format

### Nonce Management

- Nonces must be unique per user
- Use timestamp or reading ID as nonce
- Track in Supabase to prevent duplicates

### Error Handling

Add retry logic in kWALA workflow:
- Set `RetriesUntilSuccess: 3` for critical actions
- Configure notification URLs for failures

### Gas Optimization

- Batch multiple readings if possible
- Monitor gas prices
- Set appropriate gas limits in workflow

## Troubleshooting

**Event not triggering workflow:**
- Verify contract address is correct
- Check ChainID matches network
- View events on BaseScan to confirm emission
- Check kWALA workflow status

**Signature verification failing:**
- Ensure voucher hash calculation matches contract
- Verify signer address is set correctly
- Check nonce hasn't been used

**Transaction failing:**
- Verify user address in voucher matches msg.sender
- Check voucher expiry (must be > current time)
- Ensure nonce is unique
- Verify token amount > 0

## Alternative Approaches

### Recurring Workflow

Instead of event-based, use recurring workflow that polls your API:

```yaml
RecurringSourceContract: ""  # Not needed
RepeatEvery: "300"  # Every 5 minutes
ExecuteAfter: ""
```

First action: POST to your API to fetch pending readings.

### Hybrid Approach

Combine both:
- Event-based for real-time processing
- Recurring workflow as backup for missed events

## Next Steps

1. ✅ Deploy EnergyEventEmitter
2. ✅ Set authorized emitter
3. ✅ Create kWALA workflow
4. ✅ Configure workflow signer
5. ✅ Set up cron/trigger for API calls
6. ✅ Test end-to-end
7. ✅ Deploy to mainnet

See `docs/kwala-workflow-config.md` for detailed workflow configuration.

