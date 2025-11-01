import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getEnergyDevices(userId: string) {
  const { data, error } = await supabase
    .from('energy_devices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getLatestReading(deviceId: string) {
  const { data, error } = await supabase
    .from('energy_readings')
    .select('*')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data
}

export async function getMintVouchers(userAddress: string) {
  const { data, error } = await supabase
    .from('mint_vouchers')
    .select('*')
    .eq('user_address', userAddress)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createMintVoucher(voucher: any) {
  const { data, error } = await supabase
    .from('mint_vouchers')
    .insert([voucher])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateVoucherStatus(
  voucherId: string,
  status: string,
  txHash?: string
) {
  const { data, error } = await supabase
    .from('mint_vouchers')
    .update({
      status,
      tx_hash: txHash,
      minted_at: status === 'minted' ? new Date().toISOString() : undefined
    })
    .eq('id', voucherId)
    .select()
    .single()

  if (error) throw error
  return data
}
