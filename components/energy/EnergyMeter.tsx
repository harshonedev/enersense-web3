'use client'

import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Battery, Activity } from 'lucide-react'
import type { EnergyReading } from '@/types'

interface EnergyMeterProps {
  deviceId: string
}

export function EnergyMeter({ deviceId }: EnergyMeterProps) {
  const [reading, setReading] = useState<EnergyReading | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReading() {
      try {
        const response = await fetch(`/api/tuya/reading?deviceId=${deviceId}`)
        const data = await response.json()
        setReading(data)
      } catch (error) {
        console.error('Error fetching reading:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReading()
    const interval = setInterval(fetchReading, 30000) // Update every 30s

    return () => clearInterval(interval)
  }, [deviceId])

  if (loading) {
    return <div className="card animate-pulse">Loading energy data...</div>
  }

  if (!reading) {
    return <div className="card">No energy data available</div>
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<Zap className="w-8 h-8" />}
        label="Current Output"
        value={`${reading.power_output_kw.toFixed(2)} kW`}
        color="text-energy-solar"
      />
      <MetricCard
        icon={<TrendingUp className="w-8 h-8" />}
        label="Surplus Energy"
        value={`${reading.surplus_kwh.toFixed(2)} kWh`}
        color="text-primary-600"
      />
      <MetricCard
        icon={<Activity className="w-8 h-8" />}
        label="Exported"
        value={`${reading.exported_kwh.toFixed(2)} kWh`}
        color="text-green-600"
      />
      <MetricCard
        icon={<Battery className="w-8 h-8" />}
        label="Battery Level"
        value={reading.battery_level ? `${reading.battery_level}%` : 'N/A'}
        color="text-blue-600"
      />
    </div>
  )
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="card">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
