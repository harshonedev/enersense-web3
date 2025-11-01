import { NextRequest, NextResponse } from 'next/server'
import { getMintVouchers } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }

    const vouchers = await getMintVouchers(address)
    
    return NextResponse.json(vouchers)
  } catch (error) {
    console.error('Voucher list error:', error)
    return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: 500 })
  }
}
