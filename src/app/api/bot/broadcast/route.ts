import { NextRequest, NextResponse } from 'next/server'
import { telegramBotService } from '@/lib/telegram-bot'

export async function POST(request: NextRequest) {
  try {
    const { message, userIds } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }
    
    const result = await telegramBotService.sendBroadcastMessage(message, userIds)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Broadcast sent successfully',
        stats: {
          successCount: result.successCount,
          failCount: result.failCount
        }
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send broadcast' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending broadcast:', error)
    return NextResponse.json(
      { error: 'Failed to send broadcast message' },
      { status: 500 }
    )
  }
}