import { NextResponse } from 'next/server'
import { telegramBotService } from '@/lib/telegram-bot'
import { settingsQueries } from '@/lib/database'

export async function POST() {
  try {
    const botStatus = telegramBotService.getStatus()
    
    if (botStatus.isActive) {
      // Stop the bot
      await telegramBotService.stop()
      return NextResponse.json({ 
        success: true, 
        isActive: false,
        message: 'Bot stopped successfully'
      })
    } else {
      // Start the bot
      const botTokenSetting = settingsQueries.get.get('botToken') as { value: string } | undefined
      const webhookUrlSetting = settingsQueries.get.get('webhookUrl') as { value: string } | undefined
      
      if (!botTokenSetting?.value) {
        return NextResponse.json(
          { error: 'Bot token not configured. Please set it in settings.' },
          { status: 400 }
        )
      }
      
      const success = await telegramBotService.initialize(
        botTokenSetting.value,
        webhookUrlSetting?.value
      )
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          isActive: true,
          message: 'Bot started successfully'
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to start bot. Check your token and try again.' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Error toggling bot:', error)
    return NextResponse.json(
      { error: 'Failed to toggle bot status' },
      { status: 500 }
    )
  }
}