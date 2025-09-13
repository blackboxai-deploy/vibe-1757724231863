"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

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

export function ChannelManager() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false)
  const [isSchedulePostOpen, setIsSchedulePostOpen] = useState(false)
  
  const [channelForm, setChannelForm] = useState({
    channelId: '',
    channelName: ''
  })
  
  const [postForm, setPostForm] = useState({
    channelId: '',
    content: '',
    mediaUrl: '',
    mediaType: '',
    scheduledTime: ''
  })

  useEffect(() => {
    fetchChannels()
    fetchScheduledPosts()
  }, [])

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/bot/channels')
      if (response.ok) {
        const data = await response.json()
        setChannels(data)
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error)
      toast.error('Failed to load channels')
    } finally {
      setLoading(false)
    }
  }

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/bot/scheduled-posts')
      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(data)
      }
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error)
    }
  }

  const addChannel = async () => {
    if (!channelForm.channelId.trim()) {
      toast.error('Channel ID is required')
      return
    }

    try {
      const response = await fetch('/api/bot/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelForm)
      })

      if (response.ok) {
        toast.success('Channel added successfully')
        setIsAddChannelOpen(false)
        setChannelForm({ channelId: '', channelName: '' })
        fetchChannels()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to add channel')
      }
    } catch (error) {
      toast.error('Failed to add channel')
    }
  }

  const postToChannel = async (channelId: string, content: string, immediate = true) => {
    try {
      if (immediate) {
        const response = await fetch('/api/bot/channels/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId, content })
        })

        if (response.ok) {
          toast.success('Message posted to channel successfully')
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to post to channel')
        }
      }
    } catch (error) {
      toast.error('Failed to post to channel')
    }
  }

  const schedulePost = async () => {
    if (!postForm.channelId || !postForm.content.trim() || !postForm.scheduledTime) {
      toast.error('Channel, content, and scheduled time are required')
      return
    }

    try {
      const response = await fetch('/api/bot/scheduled-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postForm)
      })

      if (response.ok) {
        toast.success('Post scheduled successfully')
        setIsSchedulePostOpen(false)
        setPostForm({ channelId: '', content: '', mediaUrl: '', mediaType: '', scheduledTime: '' })
        fetchScheduledPosts()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to schedule post')
      }
    } catch (error) {
      toast.error('Failed to schedule post')
    }
  }

  const deleteScheduledPost = async (id: number) => {
    try {
      const response = await fetch(`/api/bot/scheduled-posts?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Scheduled post deleted')
        fetchScheduledPosts()
      }
    } catch (error) {
      toast.error('Failed to delete scheduled post')
    }
  }

  const toggleChannel = async (channel: Channel) => {
    try {
      const response = await fetch('/api/bot/channels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: channel.id,
          channelName: channel.channel_name,
          isActive: !channel.is_active
        })
      })

      if (response.ok) {
        toast.success(`Channel ${channel.is_active ? 'disabled' : 'enabled'}`)
        fetchChannels()
      }
    } catch (error) {
      toast.error('Failed to update channel')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading channels...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="instant">Instant Post</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Channel Management</CardTitle>
                  <CardDescription>
                    Add and manage your Telegram channels for posting
                  </CardDescription>
                </div>
                
                <Dialog open={isAddChannelOpen} onOpenChange={setIsAddChannelOpen}>
                  <DialogTrigger asChild>
                    <Button>Add Channel</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Channel</DialogTitle>
                      <DialogDescription>
                        Enter the channel ID or username to add it for posting
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="channelId">Channel ID or Username</Label>
                        <Input
                          id="channelId"
                          placeholder="@mychannel or -1001234567890"
                          value={channelForm.channelId}
                          onChange={(e) => setChannelForm({ ...channelForm, channelId: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Use @username for public channels or channel ID for private channels
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="channelName">Display Name (Optional)</Label>
                        <Input
                          id="channelName"
                          placeholder="My Channel"
                          value={channelForm.channelName}
                          onChange={(e) => setChannelForm({ ...channelForm, channelName: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddChannelOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addChannel}>
                          Add Channel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {channels.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No channels configured</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your first channel to start posting
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{channel.channel_name}</h4>
                          <Badge variant="outline">
                            {channel.channel_type}
                          </Badge>
                          <Badge variant={channel.is_active ? 'default' : 'secondary'}>
                            {channel.is_active ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {channel.channel_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added: {formatDate(channel.added_at)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={channel.is_active}
                          onCheckedChange={() => toggleChannel(channel)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => postToChannel(channel.channel_id, 'Test message from your bot! 🤖')}
                        >
                          Test Post
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instant">
          <Card>
            <CardHeader>
              <CardTitle>Instant Channel Post</CardTitle>
              <CardDescription>
                Post a message to a channel immediately
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instantChannel">Select Channel</Label>
                <Select onValueChange={(value) => setPostForm({ ...postForm, channelId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.filter(c => c.is_active).map((channel) => (
                      <SelectItem key={channel.id} value={channel.channel_id}>
                        {channel.channel_name} ({channel.channel_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instantContent">Message Content</Label>
                <Textarea
                  id="instantContent"
                  placeholder="Enter your message..."
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={() => postToChannel(postForm.channelId, postForm.content)}
                disabled={!postForm.channelId || !postForm.content.trim()}
                className="w-full"
              >
                Post Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Posts</CardTitle>
                  <CardDescription>
                    Schedule messages to be posted automatically
                  </CardDescription>
                </div>
                
                <Dialog open={isSchedulePostOpen} onOpenChange={setIsSchedulePostOpen}>
                  <DialogTrigger asChild>
                    <Button>Schedule Post</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule New Post</DialogTitle>
                      <DialogDescription>
                        Set up a message to be posted automatically at a specific time
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduleChannel">Channel</Label>
                        <Select onValueChange={(value) => setPostForm({ ...postForm, channelId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a channel" />
                          </SelectTrigger>
                          <SelectContent>
                            {channels.filter(c => c.is_active).map((channel) => (
                              <SelectItem key={channel.id} value={channel.channel_id}>
                                {channel.channel_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scheduleContent">Content</Label>
                        <Textarea
                          id="scheduleContent"
                          placeholder="Enter your message..."
                          value={postForm.content}
                          onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="scheduleTime">Scheduled Time</Label>
                        <Input
                          id="scheduleTime"
                          type="datetime-local"
                          min={getMinDateTime()}
                          value={postForm.scheduledTime}
                          onChange={(e) => setPostForm({ ...postForm, scheduledTime: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsSchedulePostOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={schedulePost}>
                          Schedule Post
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No scheduled posts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            post.status === 'pending' ? 'default' :
                            post.status === 'sent' ? 'secondary' : 'destructive'
                          }>
                            {post.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(post.scheduled_time)}
                          </span>
                        </div>
                        <p className="text-sm">{post.content.slice(0, 100)}...</p>
                        <p className="text-xs text-muted-foreground">
                          Channel: {post.channel_id}
                        </p>
                      </div>
                      
                      {post.status === 'pending' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteScheduledPost(post.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}