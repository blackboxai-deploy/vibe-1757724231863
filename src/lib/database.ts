// In-memory database for development/demo purposes
// In production, you would use a proper database like PostgreSQL or MongoDB

interface User {
  id: number
  telegram_id: string
  username?: string
  first_name: string
  last_name?: string
  language_code?: string
  is_blocked: boolean
  created_at: string
  last_active: string
}

interface Message {
  id: number
  user_id: number
  telegram_message_id: number
  message_type: string
  content: string
  is_from_bot: boolean
  created_at: string
}

interface Setting {
  key: string
  value: string
  updated_at: string
}

interface AutoReply {
  id: number
  keyword: string
  response: string
  is_active: boolean
  match_type: 'exact' | 'contains' | 'starts_with' | 'regex'
  created_at: string
  updated_at: string
}

interface Channel {
  id: number
  channel_id: string
  channel_name: string
  channel_type: 'public' | 'private'
  is_active: boolean
  added_at: string
}

interface ScheduledPost {
  id: number
  channel_id: string
  content: string
  media_url?: string
  media_type?: 'photo' | 'video' | 'document'
  scheduled_time: string
  status: 'pending' | 'sent' | 'failed'
  created_at: string
  sent_at?: string
}

// In-memory storage
let users: User[] = []
let messages: Message[] = []
let settings: Setting[] = []
let autoReplies: AutoReply[] = []
let channels: Channel[] = []
let scheduledPosts: ScheduledPost[] = []
let nextUserId = 1
let nextMessageId = 1
let nextAutoReplyId = 1
let nextChannelId = 1
let nextScheduledPostId = 1

export function initDatabase() {
  console.log('In-memory database initialized successfully')
}

// User operations
export const userQueries = {
  create: {
    run: (telegram_id: string, username: string | null, first_name: string, last_name: string | null, language_code: string | null) => {
      const existingUserIndex = users.findIndex(u => u.telegram_id === telegram_id)
      const now = new Date().toISOString()
      
      if (existingUserIndex >= 0) {
        // Update existing user
        users[existingUserIndex] = {
          ...users[existingUserIndex],
          username: username || undefined,
          first_name,
          last_name: last_name || undefined,
          language_code: language_code || undefined,
          last_active: now
        }
      } else {
        // Create new user
        users.push({
          id: nextUserId++,
          telegram_id,
          username: username || undefined,
          first_name,
          last_name: last_name || undefined,
          language_code: language_code || undefined,
          is_blocked: false,
          created_at: now,
          last_active: now
        })
      }
    }
  },

  findByTelegramId: {
    get: (telegram_id: string) => users.find(u => u.telegram_id === telegram_id)
  },

  updateLastActive: {
    run: (telegram_id: string) => {
      const user = users.find(u => u.telegram_id === telegram_id)
      if (user) {
        user.last_active = new Date().toISOString()
      }
    }
  },

  getAll: {
    all: () => users.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getCount: {
    get: () => ({ count: users.length })
  },

  getTodayCount: {
    get: () => {
      const today = new Date().toISOString().split('T')[0]
      const todayUsers = users.filter(u => u.created_at.startsWith(today))
      return { count: todayUsers.length }
    }
  }
}

// Message operations
export const messageQueries = {
  create: {
    run: (user_id: number, telegram_message_id: number, message_type: string, content: string, is_from_bot: boolean) => {
      messages.push({
        id: nextMessageId++,
        user_id,
        telegram_message_id,
        message_type,
        content,
        is_from_bot,
        created_at: new Date().toISOString()
      })
    }
  },

  getRecent: {
    all: () => {
      return messages
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50)
        .map(m => {
          const user = users.find(u => u.id === m.user_id)
          return {
            ...m,
            user_name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Unknown User',
            username: user?.username
          }
        })
    }
  },

  getCount: {
    get: () => ({ count: messages.length })
  },

  getTodayCount: {
    get: () => {
      const today = new Date().toISOString().split('T')[0]
      const todayMessages = messages.filter(m => m.created_at.startsWith(today))
      return { count: todayMessages.length }
    }
  }
}

// Settings operations
export const settingsQueries = {
  get: {
    get: (key: string) => {
      const setting = settings.find(s => s.key === key)
      return setting ? { value: setting.value } : undefined
    }
  },

  set: {
    run: (key: string, value: string) => {
      const existingIndex = settings.findIndex(s => s.key === key)
      const now = new Date().toISOString()
      
      if (existingIndex >= 0) {
        settings[existingIndex] = { key, value, updated_at: now }
      } else {
        settings.push({ key, value, updated_at: now })
      }
    }
  },

  getAll: {
    all: () => settings.map(s => ({ key: s.key, value: s.value }))
  }
}

// Auto-reply operations
export const autoReplyQueries = {
  create: {
    run: (keyword: string, response: string, match_type: string) => {
      autoReplies.push({
        id: nextAutoReplyId++,
        keyword,
        response,
        is_active: true,
        match_type: match_type as 'exact' | 'contains' | 'starts_with' | 'regex',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  },

  getAll: {
    all: () => autoReplies.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getActive: {
    all: () => autoReplies.filter(ar => ar.is_active)
  },

  update: {
    run: (id: number, keyword: string, response: string, match_type: string, is_active: boolean) => {
      const index = autoReplies.findIndex(ar => ar.id === id)
      if (index >= 0) {
        autoReplies[index] = {
          ...autoReplies[index],
          keyword,
          response,
          match_type: match_type as 'exact' | 'contains' | 'starts_with' | 'regex',
          is_active,
          updated_at: new Date().toISOString()
        }
      }
    }
  },

  delete: {
    run: (id: number) => {
      const index = autoReplies.findIndex(ar => ar.id === id)
      if (index >= 0) {
        autoReplies.splice(index, 1)
      }
    }
  }
}

// Channel operations
export const channelQueries = {
  create: {
    run: (channel_id: string, channel_name: string, channel_type: string) => {
      const existing = channels.find(c => c.channel_id === channel_id)
      if (!existing) {
        channels.push({
          id: nextChannelId++,
          channel_id,
          channel_name,
          channel_type: channel_type as 'public' | 'private',
          is_active: true,
          added_at: new Date().toISOString()
        })
      }
    }
  },

  getAll: {
    all: () => channels.slice().sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
  },

  getActive: {
    all: () => channels.filter(c => c.is_active)
  },

  update: {
    run: (id: number, channel_name: string, is_active: boolean) => {
      const index = channels.findIndex(c => c.id === id)
      if (index >= 0) {
        channels[index] = {
          ...channels[index],
          channel_name,
          is_active
        }
      }
    }
  },

  delete: {
    run: (id: number) => {
      const index = channels.findIndex(c => c.id === id)
      if (index >= 0) {
        channels.splice(index, 1)
      }
    }
  }
}

// Scheduled post operations
export const scheduledPostQueries = {
  create: {
    run: (channel_id: string, content: string, scheduled_time: string, media_url?: string, media_type?: string) => {
      scheduledPosts.push({
        id: nextScheduledPostId++,
        channel_id,
        content,
        media_url,
        media_type: media_type as 'photo' | 'video' | 'document' | undefined,
        scheduled_time,
        status: 'pending',
        created_at: new Date().toISOString()
      })
    }
  },

  getAll: {
    all: () => scheduledPosts.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },

  getPending: {
    all: () => scheduledPosts.filter(sp => sp.status === 'pending' && new Date(sp.scheduled_time) <= new Date())
  },

  updateStatus: {
    run: (id: number, status: string, sent_at?: string) => {
      const index = scheduledPosts.findIndex(sp => sp.id === id)
      if (index >= 0) {
        scheduledPosts[index] = {
          ...scheduledPosts[index],
          status: status as 'pending' | 'sent' | 'failed',
          sent_at
        }
      }
    }
  },

  delete: {
    run: (id: number) => {
      const index = scheduledPosts.findIndex(sp => sp.id === id)
      if (index >= 0) {
        scheduledPosts.splice(index, 1)
      }
    }
  }
}

// Initialize database on first import
initDatabase()