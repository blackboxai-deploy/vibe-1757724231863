import { NextRequest, NextResponse } from 'next/server'
import { settingsQueries } from '@/lib/database'

export async function GET() {
  try {
    const allSettings = settingsQueries.getAll.all() as { key: string; value: string }[]
    
    const settings = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
    
    // Don't return sensitive data like bot token in full
    if (settings.botToken) {
      settings.botToken = settings.botToken.substring(0, 10) + '...'
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()
    
    // Save each setting
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
        settingsQueries.set.run(key, String(value))
      }
    }
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}