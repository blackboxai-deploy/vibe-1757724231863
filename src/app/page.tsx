"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { MainNav } from "@/components/main-nav"
import { BotStatus } from "@/components/bot-status"
import { StatsCards } from "@/components/stats-cards"
import { UsersList } from "@/components/users-list"
import { MessagesList } from "@/components/messages-list"
import { BotSettings } from "@/components/bot-settings"
import { AutoReplies } from "@/components/auto-replies"
import { ChannelManager } from "@/components/channel-manager"

interface BotData {
  isActive: boolean
  totalUsers: number
  totalMessages: number
  todayMessages: number
  uptime: string
}

export default function Dashboard() {
  const [botData, setBotData] = useState<BotData>({
    isActive: false,
    totalUsers: 0,
    totalMessages: 0,
    todayMessages: 0,
    uptime: "00:00:00"
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBotData()
    const interval = setInterval(fetchBotData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchBotData = async () => {
    try {
      const response = await fetch('/api/bot/stats')
      if (response.ok) {
        const data = await response.json()
        setBotData(data)
      }
    } catch (error) {
      console.error('Failed to fetch bot data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBot = async () => {
    try {
      const response = await fetch('/api/bot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBotData(prev => ({ ...prev, isActive: data.isActive }))
        toast.success(data.isActive ? 'Bot started successfully' : 'Bot stopped successfully')
      }
    } catch (error) {
      toast.error('Failed to toggle bot status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Telegram Bot Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and manage your Telegram bot with real-time analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <BotStatus isActive={botData.isActive} uptime={botData.uptime} />
            <Button 
              onClick={toggleBot}
              variant={botData.isActive ? "destructive" : "default"}
            >
              {botData.isActive ? 'Stop Bot' : 'Start Bot'}
            </Button>
          </div>
        </div>

        <StatsCards 
          totalUsers={botData.totalUsers}
          totalMessages={botData.totalMessages}
          todayMessages={botData.todayMessages}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="auto-replies">Auto-Reply</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {botData.todayMessages}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Messages received today
                  </p>
                  <Progress value={33} className="mt-3" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Auto-Replies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">Active</div>
                  <p className="text-xs text-muted-foreground">
                    Smart automation enabled
                  </p>
                  <Progress value={75} className="mt-3" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Channel Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">Ready</div>
                  <p className="text-xs text-muted-foreground">
                    Automated posting system
                  </p>
                  <Progress value={90} className="mt-3" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">0.2s</div>
                  <p className="text-xs text-muted-foreground">
                    Average response time
                  </p>
                  <Progress value={95} className="mt-3" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UsersList />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesList />
          </TabsContent>

          <TabsContent value="auto-replies">
            <AutoReplies />
          </TabsContent>

          <TabsContent value="channels">
            <ChannelManager />
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Broadcast Message</CardTitle>
                <CardDescription>
                  Send a message to all bot users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Enter your broadcast message..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="preview" />
                  <Label htmlFor="preview">Enable message preview</Label>
                </div>
                
                <Button className="w-full">
                  Send Broadcast
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <BotSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}