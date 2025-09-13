import { NextResponse } from 'next/server'
import { userQueries, messageQueries } from '@/lib/database'
import { telegramBotService } from '@/lib/telegram-bot'

export async function GET() {
  try {
    const totalUsersResult = userQueries.getCount.get() as { count: number }
    const totalMessagesResult = messageQueries.getCount.get() as { count: number }
    const todayMessagesResult = messageQueries.getTodayCount.get() as { count: number }
    
    const botStatus = telegramBotService.getStatus()
    
    return NextResponse.json({
      isActive: botStatus.isActive,
      uptime: botStatus.uptime,
      totalUsers: totalUsersResult.count,
      totalMessages: totalMessagesResult.count,
      todayMessages: todayMessagesResult.count
    })
  } catch (error) {
    console.error('Error fetching bot stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bot statistics' },
      { status: 500 }
    )
  }
}