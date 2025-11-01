# kWALA Workflow Configuration for EnerSense

Since kWALA API/webhook features are unavailable, workflows must be created manually in the kWALA platform. This guide provides the exact workflow configuration you need.

## Architecture Overview

```
Tuya IoT Meter → Supabase (energy_readings) 
  → API Route (/api/energy/emit-event)
  → EnergyEventEmitter Contract (emits event)
  → kWALA Workflow (listens to event)
  → VoucherMinter.redeem() (mints tokens)
```

## Step 1: Deploy EnergyEventEmitter Contract

First, deploy the event emitter contract:

```bash
cd blockchain
npx hardhat run scripts/deploy-events.ts --network baseSepolia
```

This will deploy the contract and give you an address. Add it to your `.env.local`:

```env
NEXT_PUBLIC_ENERGY_EVENT_EMITTER_ADDRESS=0x...
```

Also add a private key for emitting events (create a dedicated wallet):

```env
EMITTER_PRIVATE_KEY=0x...  # Private key of wallet authorized to emit events
```

Then update the authorized emitter:

```bash
# Create a script to set authorized emitter
npx hardhat console --network baseSepolia
> const emitter = await ethers.getContractAt("EnergyEventEmitter", "0x...")
> await emitter.setAuthorizedEmitter("0x_YOUR_API_WALLET_ADDRESS")
```

## Step 2: Configure Supabase Trigger

Update your Supabase trigger to call the API route when surplus is detected:

```sql
-- Update the trigger function to call your API
CREATE OR REPLACE FUNCTION trigger_energy_event() 
RETURNS TRIGGER AS $$
DECLARE
  api_url TEXT := 'https://your-api-domain.com/api/energy/emit-event';
  response_status INT;
BEGIN
  -- Only trigger if surplus > 1 kWh and event not already emitted
  IF NEW.surplus_kwh > 1 AND (NEW.event_emitted IS NULL OR NEW.event_emitted = false) THEN
    
    -- Call API route to emit blockchain event
    -- Note: Supabase doesn't directly support HTTP calls in triggers
    -- You'll need to use pg_net extension or an external service
    
    PERFORM pg_notify('surplus_energy_detected', json_build_object(
      'reading_id', NEW.id,
      'device_id', NEW.device_id,
      'user_address', (SELECT wallet_address FROM user_profiles WHERE id = (SELECT user_id FROM energy_devices WHERE id = NEW.device_id)),
      'surplus_kwh', NEW.surplus_kwh,
      'timestamp', NEW.timestamp
    )::text);
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Alternatively, use a Next.js API route as a webhook receiver or cron job to check for new readings.

## Step 3: kWALA Workflow Configuration

Create a workflow in kWALA with this exact structure:

### Workflow Name
```
EnerSense-Auto-Mint
```

### Trigger Configuration

```yaml
Trigger:
  TriggerSourceContract: "<ENERGY_EVENT_EMITTER_ADDRESS>"
  TriggerChainID: "84532"  # Base Sepolia, use "8453" for mainnet
  TriggerEventName: "SurplusEnergyDetected"
  TriggerEventFilter: ""  # Leave empty to listen to all events
  TriggerSourceContractABI: |
    [
      {
        "type": "event",
        "name": "SurplusEnergyDetected",
        "inputs": [
          {
            "name": "userAddress",
            "type": "address",
            "indexed": true
          },
          {
            "name": "deviceId",
            "type": "bytes32",
            "indexed": true
          },
          {
            "name": "surplusKwh",
            "type": "uint256",
            "indexed": false
          },
          {
            "name": "timestamp",
            "type": "uint256",
            "indexed": false
          },
          {
            "name": "nonce",
            "type": "uint256",
            "indexed": false
          }
        ]
      }
    ]
  RecurringSourceContract: ""
  RecurringChainID: ""
  RecurringEventName: ""
  RecurringEventFilter: ""
  RecurringSourceContractABI: ""
  RepeatEvery: ""
  ExecuteAfter: ""
  ExpiresIn: ""
  Meta: "Listens for surplus energy events and mints ENRG tokens"
  ActionStatusNotificationPOSTURL: "https://your-api-domain.com/api/kwala-webhook"
  ActionStatusNotificationAPIKey: "<YOUR_API_KEY_IF_NEEDED>"
```

### Actions Configuration

#### Action 1: Generate Voucher Hash

```yaml
Actions:
  - Name: "GenerateVoucher"
    Type: "post"
    APIEndpoint: ""  # Not needed - we'll generate in next action
    APIPayload: {}
    TargetContract: ""
    TargetFunction: ""
    TargetParams: []
    ChainID: ""
    EncodedABI: ""
    Bytecode: ""
    Metadata: |
      Calculate voucher hash from event data
      User: {{TriggerEvent.userAddress}}
      Amount: {{TriggerEvent.surplusKwh}} * 10^18 (convert to wei)
      Nonce: {{TriggerEvent.nonce}}
      Expiry: {{TriggerEvent.timestamp}} + 3600 (1 hour)
      DeviceId: {{TriggerEvent.deviceId}}
    RetriesUntilSuccess: 0
```

#### Action 2: Sign Voucher

This action will be handled by kWALA's built-in signing (using the workflow's wallet). The signature is automatically generated.

#### Action 3: Call VoucherMinter.redeem()

```yaml
  - Name: "MintENRGTokens"
    Type: "call"
    APIEndpoint: ""
    APIPayload: {}
    TargetContract: "<VOUCHER_MINTER_ADDRESS>"
    TargetFunction: "redeem"
    TargetParams:
      - userAddress: "{{TriggerEvent.userAddress}}"
        amount: "{{TriggerEvent.surplusKwh}} * 1000000000000000000"  # Convert kWh to wei (10^18)
        nonce: "{{TriggerEvent.nonce}}"
        expiry: "{{TriggerEvent.timestamp}} + 3600"  # 1 hour expiry
        deviceId: "{{TriggerEvent.deviceId}}"
      - signature: "<kWALA_GENERATED_SIGNATURE>"  # kWALA will generate this from voucher hash
    ChainID: "84532"  # Base Sepolia
    EncodedABI: ""  # kWALA will encode this automatically
    Bytecode: ""
    Metadata: "Mint ENRG tokens for surplus energy"
    RetriesUntilSuccess: 3
```

**Note on Voucher Structure:**

The VoucherMinter expects a struct. You may need to format it properly. The struct is:

```solidity
struct Voucher {
    address user;
    uint256 amount;
    uint256 nonce;
    uint256 expiry;
    bytes32 deviceId;
}
```

#### Action 4: Notify API (Optional)

```yaml
  - Name: "NotifyMintComplete"
    Type: "post"
    APIEndpoint: "https://your-api-domain.com/api/kwala-webhook"
    APIPayload:
      event: "mint.successful"
      data:
        userAddress: "{{TriggerEvent.userAddress}}"
        amount: "{{TriggerEvent.surplusKwh}}"
        nonce: "{{TriggerEvent.nonce}}"
        txHash: "{{PreviousAction.txHash}}"
    TargetContract: ""
    TargetFunction: ""
    TargetParams: []
    ChainID: ""
    EncodedABI: ""
    Bytecode: ""
    Metadata: "Notify backend of successful mint"
    RetriesUntilSuccess: 2
```

### Execution Mode

```yaml
Execution:
  Mode: "sequential"  # Actions must run in order
```

## Step 4: Workflow Signer Setup

1. In kWALA, generate or import a wallet for this workflow
2. This wallet's address becomes the **signer** for vouchers
3. Update VoucherMinter contract to accept this address:

```bash
# Using Hardhat console
npx hardhat console --network baseSepolia
> const minter = await ethers.getContractAt("VoucherMinter", "0x...")
> await minter.updateSigner("0x_KWALA_WORKFLOW_WALLET_ADDRESS")
```

## Step 5: Testing the Workflow

1. **Create a test energy reading** in Supabase:
   ```sql
   INSERT INTO energy_readings (device_id, exported_kwh, imported_kwh, surplus_kwh, timestamp)
   VALUES ('test-device-1', 10.5, 5.0, 5.5, NOW());
   ```

2. **Manually call the API** to emit the event:
   ```bash
   curl -X POST https://your-api-domain.com/api/energy/emit-event \
     -H "Content-Type: application/json" \
     -d '{
       "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
       "deviceId": "test-device-1",
       "surplusKwh": "5.5",
       "timestamp": "2024-01-01T00:00:00Z",
       "nonce": 1234567890
     }'
   ```

3. **Check kWALA dashboard** to see if workflow triggered
4. **Verify tokens minted** on BaseScan
5. **Check Supabase** to see if mint_vouchers table updated

## Important Notes

### Voucher Signing

kWALA needs to sign the voucher hash. The signing process:
1. Hash the voucher: `keccak256(abi.encodePacked(user, amount, nonce, expiry, deviceId))`
2. Create Ethereum signed message hash: `keccak256("\x19Ethereum Signed Message:\n32" + hash)`
3. Sign with kWALA workflow wallet

You may need to configure kWALA to:
- Use `eth_sign` or `personal_sign` for signing
- Format the message correctly before signing

### Event Filtering (Optional)

If you want to filter events by device or user:

```yaml
TriggerEventFilter: "deviceId = '0x...' AND userAddress = '0x...'"
```

### Gas Optimization

For mainnet, consider:
- Batching multiple readings into one mint
- Setting appropriate gas limits
- Using gas price oracles

## Troubleshooting

**Workflow not triggering:**
- Verify EnergyEventEmitter contract is deployed
- Check event is being emitted (view on BaseScan)
- Ensure TriggerSourceContract address is correct
- Verify ChainID matches your network

**Signature verification failing:**
- Ensure kWALA workflow wallet is set as VoucherMinter signer
- Verify voucher hash calculation matches contract logic
- Check nonce is unique and not reused

**Transaction reverting:**
- Verify user address matches msg.sender in redeem()
- Check voucher hasn't expired
- Ensure nonce hasn't been used
- Verify amount > 0

## Alternative: Recurring Workflow

Instead of event-based triggers, you can use a recurring workflow that polls:

```yaml
Trigger:
  TriggerSourceContract: ""
  RecurringSourceContract: "<SUPABASE_CONTRACT_OR_ORACLE>"  # If available
  RecurringChainID: "84532"
  RepeatEvery: "3600"  # Every hour
  ExecuteAfter: ""
```

Then use a POST action to fetch pending readings from your API.

---

**Next Steps:**
1. Deploy EnergyEventEmitter contract
2. Update API routes to emit events
3. Create kWALA workflow with above configuration
4. Test end-to-end flow
5. Deploy to mainnet

For questions or issues, check the kWALA documentation or contact support.

