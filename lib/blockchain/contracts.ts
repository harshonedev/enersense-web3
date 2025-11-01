import { ethers } from 'ethers'

export const ENRG_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]

export const VOUCHER_MINTER_ABI = [
  "function redeem(tuple(address user, uint256 amount, uint256 nonce, uint256 expiry, bytes32 deviceId) voucher, bytes signature) returns (bool)",
  "function usedNonces(address, uint256) view returns (bool)",
  "function enrgToken() view returns (address)",
  "event TokensMinted(address indexed user, uint256 amount, uint256 nonce)",
  "event VoucherRedeemed(address indexed user, bytes32 deviceId, uint256 kwhAmount)"
]

export const MARKETPLACE_ABI = [
  "function createListing(uint256 tokenAmount, uint256 pricePerToken) returns (uint256)",
  "function buyListing(uint256 listingId) payable",
  "function cancelListing(uint256 listingId)",
  "function getListing(uint256 listingId) view returns (tuple(address seller, uint256 tokenAmount, uint256 pricePerToken, bool active))",
  "function getActiveListings() view returns (uint256[])",
  "event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 tokenAmount, uint256 pricePerToken)",
  "event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 amount)",
  "event ListingCancelled(uint256 indexed listingId)"
]

export function getENRGTokenContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_ENRG_TOKEN_ADDRESS!
  return new ethers.Contract(address, ENRG_TOKEN_ABI, signerOrProvider)
}

export function getVoucherMinterContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_VOUCHER_MINTER_ADDRESS!
  return new ethers.Contract(address, VOUCHER_MINTER_ABI, signerOrProvider)
}

export function getMarketplaceContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!
  return new ethers.Contract(address, MARKETPLACE_ABI, signerOrProvider)
}

export interface Voucher {
  user: string
  amount: bigint
  nonce: bigint
  expiry: bigint
  deviceId: string
}

export function hashVoucher(voucher: Voucher): string {
  return ethers.solidityPackedKeccak256(
    ['address', 'uint256', 'uint256', 'uint256', 'bytes32'],
    [voucher.user, voucher.amount, voucher.nonce, voucher.expiry, voucher.deviceId]
  )
}
