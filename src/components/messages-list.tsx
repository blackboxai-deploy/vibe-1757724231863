"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  userId: number
  userName: string
  messageType: string
  content: string
  timestamp: string
  isFromBot: boolean
}

export function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/bot/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '💬'
      case 'photo': return '📸'
      case 'document': return '📄'
      case 'sticker': return '🎭'
      case 'voice': return '🎤'
      case 'video': return '🎥'
      default: return '📩'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
          <CardDescription>
            Monitor all messages sent to and from your bot in real-time
          </CardDescription>
          <div className="pt-4 flex items-center justify-between">
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={fetchMessages} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {messages.length === 0 ? 'No messages yet' : 'No messages match your search'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.isFromBot 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">
                        {message.isFromBot ? '🤖' : '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.isFromBot ? 'Bot' : message.userName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getMessageTypeIcon(message.messageType)} {message.messageType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {formatDate(message.timestamp)}
                        </p>
                        <div className="text-sm">
                          {message.messageType === 'text' ? (
                            <p className="break-words">{message.content}</p>
                          ) : (
                            <p className="italic text-muted-foreground">
                              {message.messageType} message
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}