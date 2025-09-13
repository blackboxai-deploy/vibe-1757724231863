import { NextResponse } from 'next/server'
import { userQueries } from '@/lib/database'

export async function GET() {
  try {
    const users = userQueries.getAll.all()
    
    // Format the response
    const formattedUsers = (users as any[]).map(user => ({
      id: user.id,
      telegramId: user.telegram_id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      lastActive: user.last_active,
      isBlocked: Boolean(user.is_blocked)
    }))
    
    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}