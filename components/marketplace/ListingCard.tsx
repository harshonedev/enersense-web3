'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Zap, ShoppingCart } from 'lucide-react'
import type { MarketplaceListing } from '@/types'

interface ListingCardProps {
  listing: MarketplaceListing
  onBuy: (listingId: string) => Promise<void>
}

export function ListingCard({ listing, onBuy }: ListingCardProps) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    try {
      await onBuy(listing.id)
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const tokenAmount = ethers.formatUnits(listing.token_amount, 18)
  const pricePerToken = ethers.formatUnits(listing.price_per_token, 18)
  const totalPrice = ethers.formatUnits(listing.total_price, 18)

  return (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary-600" />
          <span className="text-2xl font-bold">{parseFloat(tokenAmount).toFixed(2)}</span>
          <span className="text-gray-600">ENRG</span>
        </div>
        <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
          {listing.currency}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Price per token</span>
          <span className="font-semibold">{parseFloat(pricePerToken).toFixed(4)} {listing.currency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total price</span>
          <span className="font-semibold text-lg">{parseFloat(totalPrice).toFixed(4)} {listing.currency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Seller</span>
          <span className="font-mono text-xs">
            {listing.seller_address.slice(0, 6)}...{listing.seller_address.slice(-4)}
          </span>
        </div>
      </div>

      <button
        onClick={handleBuy}
        disabled={loading || listing.status !== 'active'}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="w-4 h-4" />
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  )
}
