export interface EnergyDevice {
  id: string
  user_id: string
  device_id: string
  device_name: string
  device_type: 'solar' | 'wind' | 'microgrid'
  capacity_kw: number
  location: string
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
}

export interface EnergyReading {
  id: string
  device_id: string
  timestamp: string
  exported_kwh: number
  imported_kwh: number
  surplus_kwh: number
  battery_level?: number
  power_output_kw: number
}

export interface MintVoucher {
  id: string
  device_id: string
  user_address: string
  kwh_amount: number
  token_amount: string
  reading_timestamp: string
  voucher_hash: string
  signature: string
  status: 'pending' | 'minted' | 'expired' | 'failed'
  created_at: string
  minted_at?: string
  tx_hash?: string
}

export interface MarketplaceListing {
  id: string
  seller_address: string
  token_amount: string
  price_per_token: string
  total_price: string
  currency: 'USDC' | 'MATIC' | 'ETH'
  status: 'active' | 'sold' | 'cancelled'
  created_at: string
  sold_at?: string
  buyer_address?: string
}

export interface KWALAWorkflow {
  id: string
  name: string
  trigger_type: 'supabase_event' | 'webhook' | 'scheduled'
  status: 'active' | 'paused'
  last_run?: string
  run_count: number
}

export interface UserProfile {
  id: string
  wallet_address: string
  email?: string
  username?: string
  total_energy_produced: number
  total_tokens_minted: number
  total_tokens_sold: number
  created_at: string
}

export interface ChainConfig {
  chainId: number
  name: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}
