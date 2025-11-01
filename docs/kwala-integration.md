# kWALA Integration Guide

This guide explains how to integrate kWALA Web3 Workflow Automation with EnerSense for automated token minting.

## Overview

kWALA automates the entire flow from surplus energy detection to token minting, eliminating the need for manual intervention and centralized signing services.

## Workflow Architecture

```
1. Surplus Energy Detected (Supabase Trigger)
   ↓
2. kWALA Workflow Triggered (Database Event)
   ↓
3. Validate Energy Reading
   ↓
4. Generate Mint Voucher
   ↓
5. Sign Voucher (kWALA Secure Signing)
   ↓
6. Submit to VoucherMinter Contract
   ↓
7. Update Database Status
   ↓
8. Notify User (Webhook)
```

## Setup Steps

### 1. Create kWALA Account

1. Visit https://app.kwala.com
2. Sign up for an account
3. Create a new workflow
4. Note your API key and workflow ID

### 2. Configure Workflow Triggers

#### Supabase Database Trigger

```yaml
trigger:
  type: supabase_database
  config:
    url: ${SUPABASE_URL}
    table: energy_readings
    event: INSERT
    filter:
      surplus_kwh:
        $gt: 1
```

#### Alternative: Webhook Trigger

```yaml
trigger:
  type: webhook
  config:
    method: POST
    authentication:
      type: signature
      secret: ${WEBHOOK_SECRET}
```

### 3. Define Workflow Actions

#### Step 1: Validate Reading

```yaml
- action: validate_data
  name: Validate Energy Reading
  config:
    checks:
      - field: surplus_kwh
        type: number
        min: 0.1
        max: 10000
      - field: device_id
        type: string
        required: true
```

#### Step 2: Generate Voucher

```yaml
- action: custom_code
  name: Generate Mint Voucher
  code: |
    const voucher = {
      user: input.user_address,
      amount: ethers.parseEther(input.surplus_kwh.toString()),
      nonce: Date.now(),
      expiry: Date.now() + 3600000, // 1 hour
      deviceId: ethers.id(input.device_id)
    };
    
    return voucher;
```

#### Step 3: Sign Voucher

```yaml
- action: blockchain_sign
  name: Sign Voucher
  config:
    chain: base
    wallet: ${KWALA_SIGNER_ADDRESS}
    data: ${steps.generate_voucher.output}
    signing_method: eth_sign
```

#### Step 4: Submit Transaction

```yaml
- action: blockchain_transaction
  name: Mint ENRG Tokens
  config:
    chain: base
    contract: ${VOUCHER_MINTER_ADDRESS}
    function: redeem
    params:
      - ${steps.generate_voucher.output}
      - ${steps.sign_voucher.signature}
    gas_limit: 200000
```

#### Step 5: Update Database

```yaml
- action: supabase_insert
  name: Record Mint
  config:
    table: mint_vouchers
    data:
      device_id: ${trigger.device_id}
      user_address: ${trigger.user_address}
      kwh_amount: ${trigger.surplus_kwh}
      token_amount: ${steps.generate_voucher.output.amount}
      signature: ${steps.sign_voucher.signature}
      tx_hash: ${steps.mint_tokens.tx_hash}
      status: minted
```

#### Step 6: Send Notification

```yaml
- action: webhook
  name: Notify Application
  config:
    url: ${APP_WEBHOOK_URL}/api/kwala-webhook
    method: POST
    body:
      event: mint.successful
      data:
        tx_hash: ${steps.mint_tokens.tx_hash}
        user: ${trigger.user_address}
        amount: ${trigger.surplus_kwh}
```

## Security Best Practices

### 1. Secure Key Management

kWALA securely manages your signing keys in an HSM (Hardware Security Module). Never expose private keys in your application code.

### 2. Webhook Signature Verification

Always verify webhook signatures:

```typescript
import crypto from 'crypto'

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return signature === digest
}
```

### 3. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// In your API route
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each user to 100 requests per windowMs
}
```

## Monitoring & Debugging

### View Workflow Runs

```bash
curl -X GET https://api.kwala.com/v1/workflows/${WORKFLOW_ID}/runs \
  -H "Authorization: Bearer ${KWALA_API_KEY}"
```

### Check Workflow Status

```typescript
import { createKWALAClient } from '@/lib/kwala/client'

const client = createKWALAClient()
const status = await client.getWorkflowStatus(runId)

console.log('Status:', status.state)
console.log('Steps completed:', status.completed_steps)
```

### Error Handling

Set up error notifications:

```yaml
on_error:
  - action: webhook
    config:
      url: ${ERROR_WEBHOOK_URL}
      body:
        error: ${error.message}
        step: ${error.step}
  
  - action: supabase_update
    config:
      table: mint_vouchers
      filter:
        id: ${trigger.voucher_id}
      data:
        status: failed
        error_message: ${error.message}
```

## Testing

### Test Workflow Manually

```typescript
import { triggerMintWorkflow } from '@/lib/kwala/client'

const result = await triggerMintWorkflow({
  deviceId: 'test-device-001',
  userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  surplusKwh: 5.5,
  timestamp: new Date().toISOString()
})

console.log('Workflow triggered:', result.run_id)
```

### Monitor Test Results

Check the kWALA dashboard for real-time workflow execution monitoring.

## Cost Optimization

### Batch Processing

For high-volume scenarios, batch multiple readings:

```yaml
trigger:
  type: scheduled
  config:
    cron: "0 * * * *" # Every hour
    
steps:
  - action: supabase_query
    name: Get Pending Readings
    config:
      query: |
        SELECT * FROM energy_readings 
        WHERE processed = false 
        AND surplus_kwh > 1
        LIMIT 100
```

### Gas Price Management

Optimize gas costs:

```yaml
- action: blockchain_transaction
  config:
    gas_strategy: medium
    max_gas_price: 50 # gwei
    retry_on_failure: true
    retry_count: 3
```

## Support

For kWALA-specific issues:
- Documentation: https://docs.kwala.com
- Discord: https://discord.gg/kwala
- Email: support@kwala.com
