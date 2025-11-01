import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/kwala/client'
import { updateVoucherStatus } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-kwala-signature')
    const body = await request.text()

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(
      body,
      signature,
      process.env.KWALA_WEBHOOK_SECRET!
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    // Handle different workflow events
    switch (payload.event) {
      case 'workflow.completed':
        await handleWorkflowCompleted(payload.data)
        break
      
      case 'workflow.failed':
        await handleWorkflowFailed(payload.data)
        break
      
      case 'mint.successful':
        await handleMintSuccessful(payload.data)
        break
      
      default:
        console.log('Unknown event:', payload.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleWorkflowCompleted(data: any) {
  console.log('Workflow completed:', data)
  // Update database status
  if (data.voucher_id) {
    await updateVoucherStatus(data.voucher_id, 'completed')
  }
}

async function handleWorkflowFailed(data: any) {
  console.log('Workflow failed:', data)
  if (data.voucher_id) {
    await updateVoucherStatus(data.voucher_id, 'failed')
  }
}

async function handleMintSuccessful(data: any) {
  console.log('Mint successful:', data)
  if (data.voucher_id && data.tx_hash) {
    await updateVoucherStatus(data.voucher_id, 'minted', data.tx_hash)
  }
}
