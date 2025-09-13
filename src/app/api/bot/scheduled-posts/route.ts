import { NextRequest, NextResponse } from 'next/server'
import { scheduledPostQueries } from '@/lib/database'

export async function GET() {
  try {
    const scheduledPosts = scheduledPostQueries.getAll.all()
    return NextResponse.json(scheduledPosts)
  } catch (error) {
    console.error('Error fetching scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { channelId, content, scheduledTime, mediaUrl, mediaType } = await request.json()
    
    if (!channelId || !content || !scheduledTime) {
      return NextResponse.json(
        { error: 'Channel ID, content, and scheduled time are required' },
        { status: 400 }
      )
    }
    
    // Validate scheduled time is in the future
    const scheduleDate = new Date(scheduledTime)
    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }
    
    scheduledPostQueries.create.run(
      channelId,
      content,
      scheduledTime,
      mediaUrl,
      mediaType
    )
    
    return NextResponse.json({
      success: true,
      message: 'Post scheduled successfully'
    })
  } catch (error) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: 'Failed to schedule post' },
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
        { error: 'Scheduled post ID is required' },
        { status: 400 }
      )
    }
    
    scheduledPostQueries.delete.run(parseInt(id))
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting scheduled post:', error)
    return NextResponse.json(
      { error: 'Failed to delete scheduled post' },
      { status: 500 }
    )
  }
}