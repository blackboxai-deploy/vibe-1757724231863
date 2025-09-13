import { NextRequest, NextResponse } from 'next/server'
import { telegramBotService } from '@/lib/telegram-bot'

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    // Process the webhook update
    await telegramBotService.processWebhookUpdate(update)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process update' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Telegram Bot Webhook Endpoint' })
}