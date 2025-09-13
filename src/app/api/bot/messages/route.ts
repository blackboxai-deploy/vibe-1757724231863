import { NextResponse } from 'next/server'
import { messageQueries } from '@/lib/database'

export async function GET() {
  try {
    const messages = messageQueries.getRecent.all()
    
    // Format the response
    const formattedMessages = (messages as any[]).map(message => ({
      id: message.id,
      userId: message.user_id,
      userName: message.user_name || 'Unknown User',
      messageType: message.message_type,
      content: message.content,
      timestamp: message.created_at,
      isFromBot: Boolean(message.is_from_bot)
    }))
    
    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}