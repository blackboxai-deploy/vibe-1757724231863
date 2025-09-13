import { NextRequest, NextResponse } from 'next/server'
import { channelQueries } from '@/lib/database'
import { telegramBotService } from '@/lib/telegram-bot'

export async function GET() {
  try {
    const channels = channelQueries.getAll.all()
    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { channelId, channelName } = await request.json()
    
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }
    
    const result = await telegramBotService.addChannel(channelId, channelName)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Channel added successfully',
        channelInfo: result.channelInfo
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error adding channel:', error)
    return NextResponse.json(
      { error: 'Failed to add channel' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, channelName, isActive } = await request.json()
    
    if (!id || !channelName) {
      return NextResponse.json(
        { error: 'Channel ID and name are required' },
        { status: 400 }
      )
    }
    
    channelQueries.update.run(id, channelName, isActive)
    
    return NextResponse.json({
      success: true,
      message: 'Channel updated successfully'
    })
  } catch (error) {
    console.error('Error updating channel:', error)
    return NextResponse.json(
      { error: 'Failed to update channel' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }
    
    channelQueries.delete.run(parseInt(id))
    
    return NextResponse.json({
      success: true,
      message: 'Channel removed successfully'
    })
  } catch (error) {
    console.error('Error removing channel:', error)
    return NextResponse.json(
      { error: 'Failed to remove channel' },
      { status: 500 }
    )
  }
}