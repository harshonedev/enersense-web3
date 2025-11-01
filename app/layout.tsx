import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/components/wallet/Web3Provider'
import { Navbar } from '@/components/ui/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EnerSense - Tokenized Renewable Energy Trading',
  description: 'Trade renewable energy tokens powered by kWALA automation and Tuya IoT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  )
}
