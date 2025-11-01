import Link from 'next/link'
import { Zap, TrendingUp, Shield, Workflow } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Trade Your Renewable Energy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Tokenize surplus solar & wind energy. Trade peer-to-peer on blockchain.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
                Get Started
              </Link>
              <Link href="/marketplace" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="w-10 h-10" />}
              title="IoT Measurement"
              description="Tuya smart meters track your surplus renewable energy in real-time"
            />
            <FeatureCard
              icon={<Workflow className="w-10 h-10" />}
              title="kWALA Automation"
              description="Automated workflows mint ENRG tokens when surplus is detected"
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10" />}
              title="Secure & Verified"
              description="Voucher-based minting prevents fraud and ensures authenticity"
            />
            <FeatureCard
              icon={<TrendingUp className="w-10 h-10" />}
              title="Trade P2P"
              description="Buy and sell energy tokens in a decentralized marketplace"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="1 ENRG" label="= 1 kWh Energy" />
            <StatCard number="100%" label="Renewable Source" />
            <StatCard number="0" label="Centralized APIs" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Trading Energy?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Connect your wallet and link your renewable energy installation today
          </p>
          <Link href="/dashboard" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition inline-block">
            Launch Dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card text-center">
      <div className="flex justify-center mb-4 text-primary-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary-600 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}
