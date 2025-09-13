import { NextRequest, NextResponse } from 'next/server'
import { autoReplyQueries } from '@/lib/database'

export async function GET() {
  try {
    const autoReplies = autoReplyQueries.getAll.all()
    return NextResponse.json(autoReplies)
  } catch (error) {
    console.error('Error fetching auto-replies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auto-replies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyword, response, matchType } = await request.json()
    
    if (!keyword || !response || !matchType) {
      return NextResponse.json(
        { error: 'Keyword, response, and match type are required' },
        { status: 400 }
      )
    }
    
    autoReplyQueries.create.run(keyword.trim(), response.trim(), matchType)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Auto-reply rule created successfully' 
    })
  } catch (error) {
    console.error('Error creating auto-reply:', error)
    return NextResponse.json(
      { error: 'Failed to create auto-reply rule' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, keyword, response, matchType, isActive } = await request.json()
    
    if (!id || !keyword || !response || !matchType) {
      return NextResponse.json(
        { error: 'ID, keyword, response, and match type are required' },
        { status: 400 }
      )
    }
    
    autoReplyQueries.update.run(id, keyword.trim(), response.trim(), matchType, isActive)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Auto-reply rule updated successfully' 
    })
  } catch (error) {
    console.error('Error updating auto-reply:', error)
    return NextResponse.json(
      { error: 'Failed to update auto-reply rule' },
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
        { error: 'Auto-reply ID is required' },
        { status: 400 }
      )
    }
    
    autoReplyQueries.delete.run(parseInt(id))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Auto-reply rule deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting auto-reply:', error)
    return NextResponse.json(
      { error: 'Failed to delete auto-reply rule' },
      { status: 500 }
    )
  }
}