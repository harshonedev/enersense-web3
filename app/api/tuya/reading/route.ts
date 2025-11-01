import { NextRequest, NextResponse } from 'next/server'
import { getEnergyMeterReading } from '@/lib/tuya/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 })
    }

    const reading = await getEnergyMeterReading(deviceId)
    
    const surplusKwh = reading.exportedKwh - reading.importedKwh

    return NextResponse.json({
      device_id: deviceId,
      timestamp: reading.timestamp,
      exported_kwh: reading.exportedKwh,
      imported_kwh: reading.importedKwh,
      surplus_kwh: surplusKwh,
      power_output_kw: reading.currentPowerKw,
      battery_level: null
    })
  } catch (error) {
    console.error('Tuya reading error:', error)
    return NextResponse.json({ error: 'Failed to fetch reading' }, { status: 500 })
  }
}
