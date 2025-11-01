import axios from 'axios'
import crypto from 'crypto'

const TUYA_API_BASE = 'https://openapi.tuyaus.com'

interface TuyaConfig {
  accessId: string
  accessSecret: string
}

class TuyaClient {
  private config: TuyaConfig

  constructor(config: TuyaConfig) {
    this.config = config
  }

  private generateSignature(method: string, url: string, timestamp: number, nonce: string, body?: any): string {
    const contentHash = body ? crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex') : ''
    const stringToSign = [method, contentHash, '', url].join('\n')
    const signStr = this.config.accessId + timestamp + nonce + stringToSign
    
    return crypto
      .createHmac('sha256', this.config.accessSecret)
      .update(signStr)
      .digest('hex')
      .toUpperCase()
  }

  async request(method: string, path: string, body?: any) {
    const timestamp = Date.now()
    const nonce = crypto.randomBytes(16).toString('hex')
    const url = `${TUYA_API_BASE}${path}`
    
    const signature = this.generateSignature(method, path, timestamp, nonce, body)
    
    const headers = {
      'client_id': this.config.accessId,
      'sign': signature,
      'sign_method': 'HMAC-SHA256',
      't': timestamp.toString(),
      'nonce': nonce,
      'Content-Type': 'application/json'
    }

    try {
      const response = await axios({
        method,
        url,
        headers,
        data: body
      })
      return response.data
    } catch (error) {
      console.error('Tuya API Error:', error)
      throw error
    }
  }

  async getDeviceStatus(deviceId: string) {
    return this.request('GET', `/v1.0/devices/${deviceId}/status`)
  }

  async getDeviceInfo(deviceId: string) {
    return this.request('GET', `/v1.0/devices/${deviceId}`)
  }

  async getDeviceStatistics(deviceId: string, startTime: number, endTime: number, type: string = 'day') {
    return this.request('GET', `/v1.0/devices/${deviceId}/statistics?start_time=${startTime}&end_time=${endTime}&type=${type}`)
  }

  async getDeviceLogs(deviceId: string, startTime: number, endTime: number) {
    return this.request('GET', `/v1.0/devices/${deviceId}/logs?start_time=${startTime}&end_time=${endTime}`)
  }
}

export function createTuyaClient(): TuyaClient {
  return new TuyaClient({
    accessId: process.env.TUYA_ACCESS_ID!,
    accessSecret: process.env.TUYA_ACCESS_SECRET!
  })
}

export async function getEnergyMeterReading(deviceId: string) {
  const client = createTuyaClient()
  const status = await client.getDeviceStatus(deviceId)
  
  // Parse Tuya data points based on your specific meter
  // Common DPs: cur_power, cur_voltage, cur_current, total_forward_energy
  const dataPoints: any = {}
  
  if (status.result) {
    status.result.forEach((dp: any) => {
      dataPoints[dp.code] = dp.value
    })
  }

  return {
    exportedKwh: dataPoints.total_forward_energy || 0,
    importedKwh: dataPoints.total_reverse_energy || 0,
    currentPowerKw: (dataPoints.cur_power || 0) / 1000,
    voltage: dataPoints.cur_voltage || 0,
    current: dataPoints.cur_current || 0,
    timestamp: new Date().toISOString()
  }
}
