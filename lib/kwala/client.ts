import axios from 'axios'

const KWALA_API_BASE = 'https://api.kwala.com/v1'

interface KWALAConfig {
  apiKey: string
  workflowId: string
}

class KWALAClient {
  private config: KWALAConfig

  constructor(config: KWALAConfig) {
    this.config = config
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  async triggerWorkflow(data: any) {
    try {
      const response = await axios.post(
        `${KWALA_API_BASE}/workflows/${this.config.workflowId}/trigger`,
        data,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('kWALA Trigger Error:', error)
      throw error
    }
  }

  async getWorkflowStatus(runId: string) {
    try {
      const response = await axios.get(
        `${KWALA_API_BASE}/workflows/${this.config.workflowId}/runs/${runId}`,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('kWALA Status Error:', error)
      throw error
    }
  }

  async getWorkflowRuns(limit: number = 10) {
    try {
      const response = await axios.get(
        `${KWALA_API_BASE}/workflows/${this.config.workflowId}/runs?limit=${limit}`,
        { headers: this.getHeaders() }
      )
      return response.data
    } catch (error) {
      console.error('kWALA Runs Error:', error)
      throw error
    }
  }
}

export function createKWALAClient(): KWALAClient {
  return new KWALAClient({
    apiKey: process.env.KWALA_API_KEY!,
    workflowId: process.env.KWALA_WORKFLOW_ID!
  })
}

export async function triggerMintWorkflow(data: {
  deviceId: string
  userAddress: string
  surplusKwh: number
  timestamp: string
}) {
  const client = createKWALAClient()
  
  return client.triggerWorkflow({
    event: 'energy_surplus_detected',
    data: {
      device_id: data.deviceId,
      user_address: data.userAddress,
      surplus_kwh: data.surplusKwh,
      timestamp: data.timestamp,
      action: 'mint_enrg_tokens'
    }
  })
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return signature === digest
}
