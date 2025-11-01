import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { supabase } from '@/lib/supabase/client'

/**
 * API route to emit surplus energy event to blockchain
 * Called when surplus energy is detected in Supabase
 * This emits an event that kWALA workflows can listen to
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            userAddress,
            deviceId,
            surplusKwh,
            timestamp,
            nonce
        } = body

        // Validate required fields
        if (!userAddress || !deviceId || !surplusKwh || !timestamp || !nonce) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get contract address and private key from environment
        const emitterAddress = process.env.NEXT_PUBLIC_ENERGY_EVENT_EMITTER_ADDRESS
        const emitterPrivateKey = process.env.EMITTER_PRIVATE_KEY

        if (!emitterAddress || !emitterPrivateKey) {
            return NextResponse.json(
                { error: 'Event emitter not configured' },
                { status: 500 }
            )
        }

        // Connect to blockchain
        const rpcUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || 'https://sepolia.base.org'
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const wallet = new ethers.Wallet(emitterPrivateKey, provider)

        // EnergyEventEmitter ABI (only the function we need)
        const emitterABI = [
            "function emitSurplusEnergy(address userAddress, bytes32 deviceId, uint256 surplusKwh, uint256 timestamp, uint256 nonce) external",
            "event SurplusEnergyDetected(address indexed userAddress, bytes32 indexed deviceId, uint256 surplusKwh, uint256 timestamp, uint256 nonce)"
        ]

        const emitter = new ethers.Contract(emitterAddress, emitterABI, wallet)

        // Convert deviceId string to bytes32
        const deviceIdBytes32 = ethers.id(deviceId)

        // Convert surplus kWh to token amount (1 kWh = 1 token, with 18 decimals)
        const tokenAmount = ethers.parseEther(surplusKwh.toString())

        // Emit the event by calling the contract function
        const tx = await emitter.emitSurplusEnergy(
            userAddress,
            deviceIdBytes32,
            ethers.parseEther(surplusKwh.toString()), // Store as wei for precision
            Math.floor(new Date(timestamp).getTime() / 1000), // Convert to unix timestamp
            nonce
        )

        await tx.wait()

        // Update Supabase to record that event was emitted
        if (body.readingId) {
            await supabase.from('energy_readings').update({
                event_emitted: true,
                event_tx_hash: tx.hash
            }).eq('id', body.readingId)
        }

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            message: 'Surplus energy event emitted successfully'
        })
    } catch (error: any) {
        console.error('Error emitting energy event:', error)
        return NextResponse.json(
            {
                error: 'Failed to emit event',
                details: error.message
            },
            { status: 500 }
        )
    }
}

