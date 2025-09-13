import { NextRequest, NextResponse } from 'next/server'
import { telegramBotService } from '@/lib/telegram-bot'

export async function POST(request: NextRequest) {
  try {
    const { channelId, content, mediaUrl, mediaType } = await request.json()
    
    if (!channelId || !content) {
      return NextResponse.json(
        { error: 'Channel ID and content are required' },
        { status: 400 }
      )
    }
    
    const result = await telegramBotService.postToChannel(
      channelId,
      content,
      mediaUrl,
      mediaType
    )
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Message posted to channel successfully',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error posting to channel:', error)
    return NextResponse.json(
      { error: 'Failed to post to channel' },
      { status: 500 }
    )
  }
}