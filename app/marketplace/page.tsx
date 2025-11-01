'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { Plus } from 'lucide-react'
import type { MarketplaceListing } from '@/types'

export default function Marketplace() {
  const { address, isConnected } = useAccount()
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    try {
      const response = await fetch('/api/marketplace/listings')
      const data = await response.json()
      setListings(data.filter((l: MarketplaceListing) => l.status === 'active'))
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleBuyListing(listingId: string) {
    if (!isConnected) {
      alert('Please connect your wallet')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Call marketplace contract
      const response = await fetch('/api/marketplace/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, buyerAddress: address })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Purchase successful!')
        fetchListings()
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Purchase failed. Please try again.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Energy Marketplace</h1>
        {isConnected && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Listing
          </button>
        )}
      </div>

      <p className="text-gray-600 mb-8">
        Buy renewable energy tokens from peer sellers. Each ENRG token represents 1 kWh of verified clean energy.
      </p>

      {!isConnected && (
        <div className="card text-center py-12 mb-8">
          <p className="text-lg text-gray-600">Connect your wallet to view and purchase listings</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading marketplace...</div>
      ) : listings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No active listings at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onBuy={handleBuyListing}
            />
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateForm && (
        <CreateListingModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchListings()
          }}
        />
      )}
    </div>
  )
}

function CreateListingModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void
  onSuccess: () => void
}) {
  const { address } = useAccount()
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/marketplace/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerAddress: address,
          tokenAmount: amount,
          pricePerToken: price,
          currency: 'ETH'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Listing created successfully!')
        onSuccess()
      }
    } catch (error) {
      console.error('Create listing error:', error)
      alert('Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Create Listing</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount (ENRG tokens)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Price per token (ETH)
            </label>
            <input
              type="number"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total value</div>
            <div className="text-xl font-bold">
              {(parseFloat(amount || '0') * parseFloat(price || '0')).toFixed(4)} ETH
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
