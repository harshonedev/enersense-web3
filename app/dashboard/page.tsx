'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { EnergyMeter } from '@/components/energy/EnergyMeter'
import { TokenBalance } from '@/components/energy/TokenBalance'
import { Activity, Zap, TrendingUp, Workflow } from 'lucide-react'
import type { MintVoucher } from '@/types'

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [vouchers, setVouchers] = useState<MintVoucher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }

    async function fetchVouchers() {
      try {
        const response = await fetch(`/api/voucher/list?address=${address}`)
        const data = await response.json()
        setVouchers(data)
      } catch (error) {
        console.error('Error fetching vouchers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVouchers()
  }, [isConnected, address, router])

  if (!isConnected) {
    return <div className="p-8 text-center">Connecting...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8">Energy Dashboard</h1>

      {/* Token Balance */}
      <div className="mb-8">
        <TokenBalance />
      </div>

      {/* Energy Meter */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Real-Time Energy Monitoring</h2>
        <EnergyMeter deviceId={process.env.TUYA_DEVICE_ID || 'demo'} />
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Zap className="w-8 h-8" />}
          title="Total Minted"
          value={`${vouchers.filter(v => v.status === 'minted').length} ENRG`}
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          icon={<Activity className="w-8 h-8" />}
          title="Pending Vouchers"
          value={vouchers.filter(v => v.status === 'pending').length.toString()}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Total Energy"
          value={`${vouchers.reduce((sum, v) => sum + v.kwh_amount, 0).toFixed(2)} kWh`}
          color="bg-green-100 text-green-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Workflow className="w-6 h-6" />
          Recent kWALA Workflow Activity
        </h2>
        
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No minting activity yet. Your surplus energy will automatically trigger token minting via kWALA.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Energy (kWh)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tokens</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vouchers.slice(0, 10).map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(voucher.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{voucher.kwh_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{voucher.token_amount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {voucher.tx_hash ? (
                        <a
                          href={typeof window !== 'undefined' ? `https://basescan.org/tx/${voucher.tx_hash}` : `#`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {voucher.tx_hash.slice(0, 8)}...
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ 
  icon, 
  title, 
  value, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  value: string
  color: string
}) {
  return (
    <div className="card">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    minted: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status}
    </span>
  )
}
