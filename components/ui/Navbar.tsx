'use client'

import Link from 'next/link'
import { useAccount } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <Zap className="w-6 h-6" />
            EnerSense
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition">
              Dashboard
            </Link>
            <Link href="/marketplace" className="text-gray-700 hover:text-primary-600 transition">
              Marketplace
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-primary-600 transition">
              Profile
            </Link>
            
            {isConnected ? (
              <button
                onClick={() => open()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                {shortenAddress(address!)}
              </button>
            ) : (
              <button
                onClick={() => open()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition">
                Dashboard
              </Link>
              <Link href="/marketplace" className="text-gray-700 hover:text-primary-600 transition">
                Marketplace
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-primary-600 transition">
                Profile
              </Link>
              <button
                onClick={() => open()}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-left"
              >
                {isConnected ? shortenAddress(address!) : 'Connect Wallet'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
