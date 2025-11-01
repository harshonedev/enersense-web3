# Tuya IoT Integration Guide

This guide walks you through setting up Tuya IoT energy meters with EnerSense.

## Prerequisites

- Tuya-compatible smart energy meter or solar inverter
- Tuya IoT Platform account
- Physical access to your energy installation

## Step 1: Create Tuya IoT Platform Account

1. Visit https://iot.tuya.com
2. Sign up for a developer account
3. Verify your email address
4. Complete the developer profile

## Step 2: Create a Cloud Project

1. Go to **Cloud** → **Create Cloud Project**
2. Select **Custom Development**
3. Choose **Smart Home** as the industry
4. Select your region (important for API latency)
5. Note your **Access ID** and **Access Secret**

## Step 3: Link Your Energy Meter

### Option A: Using Tuya Smart App

1. Download **Tuya Smart** or **Smart Life** app
2. Add your energy meter device
3. Follow pairing instructions (usually Wi-Fi setup mode)
4. Note the **Device ID** from device settings

### Option B: Using Developer Platform

1. Go to **Devices** → **Link Tuya App Account**
2. Scan QR code with Tuya Smart app
3. Your devices will appear in the platform
4. Copy the **Device ID**

## Step 4: Subscribe to Device Data

1. Go to **Cloud** → **Your Project** → **API Products**
2. Subscribe to:
   - **IoT Core** (required for device control)
   - **Device Status Notification** (for real-time updates)
3. Go to **Message Service**
4. Enable **Device Status Change** notifications

## Step 5: Configure Data Points

Common energy meter data points (DPs):

| DP Code | Description | Unit |
|---------|-------------|------|
| `cur_power` | Current power | W |
| `cur_voltage` | Voltage | V |
| `cur_current` | Current | mA |
| `total_forward_energy` | Total exported energy | kWh |
| `total_reverse_energy` | Total imported energy | kWh |
| `phase_a`, `phase_b`, `phase_c` | Three-phase data | Various |

To view your device's specific DPs:

```bash
curl -X GET "https://openapi.tuyaus.com/v1.0/devices/{device_id}/status" \
  -H "client_id: YOUR_ACCESS_ID" \
  -H "sign: YOUR_SIGNATURE"
```

## Step 6: Test Connection

Use our test script:

```typescript
import { createTuyaClient, getEnergyMeterReading } from '@/lib/tuya/client'

async function testConnection() {
  try {
    const deviceId = 'YOUR_DEVICE_ID'
    const reading = await getEnergyMeterReading(deviceId)
    
    console.log('✓ Connection successful!')
    console.log('Exported:', reading.exportedKwh, 'kWh')
    console.log('Current power:', reading.currentPowerKw, 'kW')
  } catch (error) {
    console.error('✗ Connection failed:', error)
  }
}

testConnection()
```

## Step 7: Configure EnerSense

Add to your `.env.local`:

```env
TUYA_ACCESS_ID=your_access_id_here
TUYA_ACCESS_SECRET=your_access_secret_here
TUYA_DEVICE_ID=your_device_id_here
```

## Supported Devices

### Tested Energy Meters
- Tuya WiFi Energy Meter (3-Phase)
- Tuya DIN Rail Energy Meter
- Various Tuya-compatible solar inverters

### Compatible Brands
- BlitzWolf
- Nous
- Moes
- Hiking
- Other Tuya-certified manufacturers

## Data Synchronization

EnerSense polls your device every 30 seconds by default. For real-time updates, configure webhooks:

1. In Tuya IoT Platform, go to **Message Service**
2. Set webhook URL: `https://your-domain.com/api/tuya/webhook`
3. Select events: **Device Status Change**
4. Save configuration

## Troubleshooting

### Device Not Found

**Problem:** Device ID returns 404

**Solution:**
- Verify device is online in Tuya Smart app
- Check if device is linked to your cloud project
- Ensure your account is linked in the platform

### Authentication Failed

**Problem:** 401 Unauthorized error

**Solution:**
- Verify Access ID and Secret are correct
- Check if your IP is whitelisted (if enabled)
- Ensure timestamp in signature is accurate

### Incorrect Data Points

**Problem:** Data values seem wrong or null

**Solution:**
- Check device-specific DPs using status endpoint
- Update parsing logic in `lib/tuya/client.ts`
- Verify unit conversions (W to kW, etc.)

### Rate Limiting

**Problem:** 429 Too Many Requests

**Solution:**
- Reduce polling frequency
- Implement request caching
- Consider upgrading to higher tier plan

## Advanced Configuration

### Multi-Device Setup

```typescript
const devices = [
  { id: 'device-1', type: 'solar', name: 'Rooftop Solar' },
  { id: 'device-2', type: 'wind', name: 'Wind Turbine' },
  { id: 'device-3', type: 'microgrid', name: 'Battery Storage' }
]

for (const device of devices) {
  const reading = await getEnergyMeterReading(device.id)
  // Store in database
}
```

### Custom Data Processing

Modify `lib/tuya/client.ts` for your specific meter:

```typescript
export async function getEnergyMeterReading(deviceId: string) {
  const client = createTuyaClient()
  const status = await client.getDeviceStatus(deviceId)
  
  const dataPoints: any = {}
  status.result.forEach((dp: any) => {
    dataPoints[dp.code] = dp.value
  })

  // Custom mapping for your device
  return {
    exportedKwh: dataPoints.export_energy / 100, // Some devices use centi-kWh
    importedKwh: dataPoints.import_energy / 100,
    currentPowerKw: dataPoints.active_power / 1000,
    voltage: dataPoints.voltage / 10,
    current: dataPoints.current,
    timestamp: new Date().toISOString()
  }
}
```

## Alternative Solutions

If Tuya doesn't fit your needs:

- **Modbus/RS485**: Direct serial connection to meter
- **MQTT**: Local broker for IoT communication
- **REST API**: If your inverter provides one
- **Cloud API**: SolarEdge, Enphase, etc. have official APIs

## Resources

- [Tuya IoT Platform Docs](https://developer.tuya.com/en/docs/iot)
- [API Reference](https://developer.tuya.com/en/docs/cloud)
- [Tuya Smart App](https://play.google.com/store/apps/details?id=com.tuya.smart)
- [Compatible Devices List](https://developer.tuya.com/en/hardware)

## Support

For Tuya-specific issues:
- Developer Forum: https://www.tuyaos.com
- Email: support@tuya.com
