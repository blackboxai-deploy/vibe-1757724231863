import { userQueries, messageQueries, settingsQueries, autoReplyQueries, channelQueries, scheduledPostQueries } from './database'

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  date: number
  chat: {
    id: number
    type: string
  }
  text?: string
  photo?: any[]
  document?: any
  sticker?: any
  voice?: any
  video?: any
}

class TelegramBotService {
  private bot: any = null
  private isRunning = false
  private startTime = Date.now()

  async initialize(token: string, webhookUrl?: string) {
    try {
      if (this.bot) {
        await this.stop()
      }

      // Dynamic import to avoid build issues
      const TelegramBot = require('node-telegram-bot-api')
      this.bot = new TelegramBot(token, { polling: !webhookUrl })
      
      if (webhookUrl) {
        await this.bot.setWebHook(webhookUrl)
        console.log(`Webhook set to: ${webhookUrl}`)
      } else {
        console.log('Bot started with polling')
      }

      this.setupHandlers()
      this.isRunning = true
      this.startTime = Date.now()
      
      // Start the scheduled post processor
      this.startScheduleProcessor()
      
      console.log('Telegram bot initialized successfully')
      return true
    } catch (error) {
      console.error('Failed to initialize bot:', error)
      return false
    }
  }

  private setupHandlers() {
    if (!this.bot) return

    // Handle all messages
    this.bot.on('message', async (msg: TelegramMessage) => {
      try {
        await this.handleMessage(msg)
      } catch (error) {
        console.error('Error handling message:', error)
      }
    })

    // Handle callback queries (inline keyboard responses)
    this.bot.on('callback_query', async (query: any) => {
      try {
        await this.handleCallbackQuery(query)
      } catch (error) {
        console.error('Error handling callback query:', error)
      }
    })
  }

  private async handleMessage(msg: TelegramMessage) {
    if (!this.bot || !msg.from) return

    // Save/update user
    const user = await this.saveUser(msg.from)
    if (!user) return

    // Save message
    await this.saveMessage(user.id, msg)

    // Handle commands
    if (msg.text?.startsWith('/')) {
      await this.handleCommand(msg)
    } else {
      await this.handleTextMessage(msg)
    }
  }

  private async saveUser(telegramUser: TelegramUser) {
    try {
      userQueries.create.run(
        telegramUser.id.toString(),
        telegramUser.username || null,
        telegramUser.first_name,
        telegramUser.last_name || null,
        telegramUser.language_code || null
      )

      const user = userQueries.findByTelegramId.get(telegramUser.id.toString())
      return user as any
    } catch (error) {
      console.error('Error saving user:', error)
      return null
    }
  }

  private async saveMessage(userId: number, msg: TelegramMessage) {
    try {
      let messageType = 'text'
      let content = msg.text || ''

      if (msg.photo) {
        messageType = 'photo'
        content = 'Photo message'
      } else if (msg.document) {
        messageType = 'document'
        content = msg.document.file_name || 'Document'
      } else if (msg.sticker) {
        messageType = 'sticker'
        content = msg.sticker.emoji || 'Sticker'
      } else if (msg.voice) {
        messageType = 'voice'
        content = 'Voice message'
      } else if (msg.video) {
        messageType = 'video'
        content = 'Video message'
      }

      messageQueries.create.run(
        userId,
        msg.message_id,
        messageType,
        content,
        false
      )
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  private async handleCommand(msg: TelegramMessage) {
    if (!this.bot || !msg.text) return

    const chatId = msg.chat.id
    const command = msg.text.split(' ')[0].toLowerCase()

    switch (command) {
      case '/start':
        await this.sendWelcomeMessage(chatId)
        break
      
      case '/help':
        await this.sendHelpMessage(chatId)
        break
      
      case '/settings':
        await this.sendSettingsMenu(chatId)
        break
      
      case '/stats':
        await this.sendUserStats(chatId, msg.from?.id.toString())
        break
      
      case '/about':
        await this.sendAboutMessage(chatId)
        break
      
      default:
        await this.sendUnknownCommand(chatId)
    }
  }

  private async sendWelcomeMessage(chatId: number) {
    const welcomeMessageSetting = settingsQueries.get.get('welcomeMessage') as { value: string } | undefined
    const welcomeMessage = welcomeMessageSetting?.value || 
      'Welcome to our bot! 🤖\n\nUse /help to see available commands.'
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📋 Help', callback_data: 'help' },
          { text: '⚙️ Settings', callback_data: 'settings' }
        ],
        [
          { text: '📊 Stats', callback_data: 'stats' },
          { text: 'ℹ️ About', callback_data: 'about' }
        ]
      ]
    }

    await this.bot?.sendMessage(chatId, welcomeMessage, {
      reply_markup: keyboard
    })
  }

  private async sendHelpMessage(chatId: number) {
    const helpMessageSetting = settingsQueries.get.get('helpMessage') as { value: string } | undefined
    const helpMessage = helpMessageSetting?.value || 
      'Available commands:\n\n/start - Get started\n/help - Show this help\n/settings - Your settings\n/stats - Your statistics\n/about - About this bot'
    
    await this.bot?.sendMessage(chatId, helpMessage)
  }

  private async sendSettingsMenu(chatId: number) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔔 Notifications', callback_data: 'settings_notifications' },
          { text: '🌐 Language', callback_data: 'settings_language' }
        ],
        [
          { text: '🔙 Back to Menu', callback_data: 'main_menu' }
        ]
      ]
    }

    await this.bot?.sendMessage(chatId, 'Settings Menu:', {
      reply_markup: keyboard
    })
  }

  private async sendUserStats(chatId: number, telegramId?: string) {
    if (!telegramId) return

    try {
      const user = userQueries.findByTelegramId.get(telegramId) as any
      
      const statsMessage = `📊 Your Statistics:\n\n👤 Member since: ${user?.created_at || 'Unknown'}\n💬 Messages sent: Loading...\n📈 Activity: Active`
      
      await this.bot?.sendMessage(chatId, statsMessage)
    } catch (error) {
      await this.bot?.sendMessage(chatId, 'Sorry, unable to fetch your statistics.')
    }
  }

  private async sendAboutMessage(chatId: number) {
    const aboutMessage = `🤖 About This Bot\n\nI'm a modern Telegram bot with a comprehensive management dashboard.\n\n✨ Features:\n• Real-time message monitoring\n• User analytics\n• Broadcast messaging\n• Custom commands\n• Admin controls\n\n🔧 Built with Next.js and Telegram Bot API`
    
    await this.bot?.sendMessage(chatId, aboutMessage)
  }

  private async sendUnknownCommand(chatId: number) {
    await this.bot?.sendMessage(chatId, 'Unknown command. Use /help to see available commands.')
  }

  private async handleTextMessage(msg: TelegramMessage) {
    if (!msg.text || !msg.from) return

    // Check for auto-reply triggers
    await this.processAutoReplies(msg)
  }

  private async processAutoReplies(msg: TelegramMessage) {
    if (!this.bot || !msg.text) return

    const activeRules = autoReplyQueries.getActive.all() as any[]
    const messageText = msg.text.toLowerCase()

    for (const rule of activeRules) {
      let shouldReply = false

      switch (rule.match_type) {
        case 'exact':
          shouldReply = messageText === rule.keyword.toLowerCase()
          break
        case 'contains':
          shouldReply = messageText.includes(rule.keyword.toLowerCase())
          break
        case 'starts_with':
          shouldReply = messageText.startsWith(rule.keyword.toLowerCase())
          break
        case 'regex':
          try {
            const regex = new RegExp(rule.keyword, 'i')
            shouldReply = regex.test(messageText)
          } catch (error) {
            console.error('Invalid regex pattern:', rule.keyword)
          }
          break
      }

      if (shouldReply) {
        try {
          await this.bot.sendMessage(msg.chat.id, rule.response)
          
          // Log the auto-reply message
          if (msg.from?.id) {
            const user = userQueries.findByTelegramId.get(msg.from.id.toString()) as any
            if (user) {
              messageQueries.create.run(
                user.id,
                0, // No message ID for bot messages
                'text',
                rule.response,
                true // is_from_bot = true
              )
            }
          }
          
          break // Only trigger the first matching rule
        } catch (error) {
          console.error('Error sending auto-reply:', error)
        }
      }
    }
  }

  private async handleCallbackQuery(query: any) {
    if (!this.bot) return

    const chatId = query.message?.chat?.id
    const data = query.data

    await this.bot.answerCallbackQuery(query.id)

    switch (data) {
      case 'help':
        await this.sendHelpMessage(chatId)
        break
      case 'settings':
        await this.sendSettingsMenu(chatId)
        break
      case 'stats':
        await this.sendUserStats(chatId, query.from?.id?.toString())
        break
      case 'about':
        await this.sendAboutMessage(chatId)
        break
      case 'main_menu':
        await this.sendWelcomeMessage(chatId)
        break
    }
  }

  async processWebhookUpdate(update: any) {
    if (!this.bot) return

    try {
      if (update.message) {
        await this.handleMessage(update.message)
      } else if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query)
      }
    } catch (error) {
      console.error('Error processing webhook update:', error)
    }
  }

  async sendBroadcastMessage(message: string, userIds?: string[]) {
    if (!this.bot) return { success: false, error: 'Bot not initialized' }

    try {
      const users = userIds ? 
        userIds.map(id => ({ telegram_id: id })) :
        userQueries.getAll.all() as any[]

      let successCount = 0
      let failCount = 0

      for (const user of users) {
        try {
          await this.bot.sendMessage(user.telegram_id, message)
          successCount++
          
          // Add small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 50))
        } catch (error) {
          failCount++
          console.error(`Failed to send message to ${user.telegram_id}:`, error)
        }
      }

      return { success: true, successCount, failCount }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async stop() {
    if (this.bot) {
      await this.bot.stopPolling()
      this.bot = null
    }
    this.isRunning = false
  }

  getStatus() {
    return {
      isActive: this.isRunning,
      uptime: this.formatUptime(Date.now() - this.startTime)
    }
  }

  async postToChannel(channelId: string, content: string, mediaUrl?: string, mediaType?: string) {
    if (!this.bot) return { success: false, error: 'Bot not initialized' }

    try {
      let result

      if (mediaUrl && mediaType) {
        switch (mediaType) {
          case 'photo':
            result = await this.bot.sendPhoto(channelId, mediaUrl, { caption: content })
            break
          case 'video':
            result = await this.bot.sendVideo(channelId, mediaUrl, { caption: content })
            break
          case 'document':
            result = await this.bot.sendDocument(channelId, mediaUrl, { caption: content })
            break
          default:
            result = await this.bot.sendMessage(channelId, content)
        }
      } else {
        result = await this.bot.sendMessage(channelId, content)
      }

      return { success: true, messageId: result.message_id }
    } catch (error) {
      console.error('Error posting to channel:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to post to channel' 
      }
    }
  }

  async addChannel(channelId: string, channelName: string) {
    if (!this.bot) return { success: false, error: 'Bot not initialized' }

    try {
      // Test if bot has access to the channel
      const chat = await this.bot.getChat(channelId)
      const channelType = chat.type === 'channel' ? 'public' : 'private'
      
      channelQueries.create.run(channelId, channelName || chat.title, channelType)
      
      return { success: true, channelInfo: chat }
    } catch (error) {
      console.error('Error adding channel:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add channel' 
      }
    }
  }

  async processScheduledPosts() {
    if (!this.bot) return

    const pendingPosts = scheduledPostQueries.getPending.all() as any[]

    for (const post of pendingPosts) {
      try {
        const result = await this.postToChannel(
          post.channel_id,
          post.content,
          post.media_url,
          post.media_type
        )

        if (result.success) {
          scheduledPostQueries.updateStatus.run(post.id, 'sent', new Date().toISOString())
          console.log(`Scheduled post ${post.id} sent successfully`)
        } else {
          scheduledPostQueries.updateStatus.run(post.id, 'failed')
          console.error(`Failed to send scheduled post ${post.id}:`, result.error)
        }
      } catch (error) {
        scheduledPostQueries.updateStatus.run(post.id, 'failed')
        console.error(`Error processing scheduled post ${post.id}:`, error)
      }
    }
  }

  startScheduleProcessor() {
    // Check for scheduled posts every minute
    setInterval(() => {
      this.processScheduledPosts()
    }, 60000)
  }

  private formatUptime(ms: number) {
    const seconds = Math.floor(ms / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

export const telegramBotService = new TelegramBotService()
export default telegramBotService