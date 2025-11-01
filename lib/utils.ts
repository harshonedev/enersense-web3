import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatKwh(kwh: number): string {
  if (kwh >= 1000) {
    return `${(kwh / 1000).toFixed(2)} MWh`
  }
  return `${kwh.toFixed(2)} kWh`
}

export function formatCurrency(amount: string | number, currency: string = 'MATIC'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${num.toFixed(4)} ${currency}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function calculateSurplus(exported: number, imported: number): number {
  return Math.max(0, exported - imported)
}

export function kwhToTokens(kwh: number): string {
  // 1 kWh = 1 ENRG token (with 18 decimals)
  const rate = Number(process.env.NEXT_PUBLIC_ENERGY_CONVERSION_RATE) || 1
  return (kwh * rate).toFixed(4)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function getExplorerUrl(txHash: string, chainId: number = 80001): string {
  const explorers: { [key: number]: string } = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com'
  }
  
  const baseUrl = explorers[chainId] || explorers[80001]
  return `${baseUrl}/tx/${txHash}`
}

export function getChainName(chainId: number): string {
  const chains: { [key: number]: string } = {
    1: 'Ethereum',
    137: 'Polygon',
    80001: 'Mumbai Testnet',
    31337: 'Hardhat Local'
  }
  
  return chains[chainId] || 'Unknown Chain'
}

export function parseError(error: any): string {
  if (typeof error === 'string') return error
  
  if (error?.reason) return error.reason
  if (error?.message) return error.message
  if (error?.error?.message) return error.error.message
  
  return 'An unknown error occurred'
}
