'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { getENRGTokenContract } from '@/lib/blockchain/contracts'
import { Coins } from 'lucide-react'

export function TokenBalance() {
  const { address, isConnected } = useAccount()
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = getENRGTokenContract(provider)
        const bal = await contract.balanceOf(address)
        setBalance(ethers.formatUnits(bal, 18))
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 15000)

    return () => clearInterval(interval)
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="card text-center">
        <Coins className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">Connect wallet to view balance</p>
      </div>
    )
  }

  return (
    <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Coins className="w-8 h-8" />
        <span className="text-lg font-semibold">ENRG Balance</span>
      </div>
      {loading ? (
        <div className="text-3xl font-bold">Loading...</div>
      ) : (
        <>
          <div className="text-4xl font-bold mb-1">{parseFloat(balance).toFixed(2)}</div>
          <div className="text-primary-100 text-sm">
            = {parseFloat(balance).toFixed(2)} kWh renewable energy
          </div>
        </>
      )}
    </div>
  )
}
