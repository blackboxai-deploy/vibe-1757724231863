import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()
    
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      )
    }
    
    // Test the webhook URL by sending a test request
    const testPayload = {
      test: true,
      message: 'Webhook test from Telegram Bot Manager'
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TelegramBotManager/1.0'
      },
      body: JSON.stringify(testPayload)
    })
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Webhook test successful',
        status: response.status,
        statusText: response.statusText
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Webhook test failed',
        status: response.status,
        statusText: response.statusText
      })
    }
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}