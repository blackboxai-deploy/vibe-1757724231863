"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface AutoReply {
  id: number
  keyword: string
  response: string
  is_active: boolean
  match_type: 'exact' | 'contains' | 'starts_with' | 'regex'
  created_at: string
  updated_at: string
}

export function AutoReplies() {
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReply, setEditingReply] = useState<AutoReply | null>(null)
  
  const [formData, setFormData] = useState({
    keyword: '',
    response: '',
    matchType: 'contains' as 'exact' | 'contains' | 'starts_with' | 'regex'
  })

  useEffect(() => {
    fetchAutoReplies()
  }, [])

  const fetchAutoReplies = async () => {
    try {
      const response = await fetch('/api/bot/auto-replies')
      if (response.ok) {
        const data = await response.json()
        setAutoReplies(data)
      }
    } catch (error) {
      console.error('Failed to fetch auto-replies:', error)
      toast.error('Failed to load auto-replies')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.keyword.trim() || !formData.response.trim()) {
      toast.error('Keyword and response are required')
      return
    }

    try {
      const url = editingReply ? '/api/bot/auto-replies' : '/api/bot/auto-replies'
      const method = editingReply ? 'PUT' : 'POST'
      const body = editingReply 
        ? { id: editingReply.id, ...formData, isActive: true }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast.success(editingReply ? 'Auto-reply updated successfully' : 'Auto-reply created successfully')
        setIsDialogOpen(false)
        setEditingReply(null)
        setFormData({ keyword: '', response: '', matchType: 'contains' })
        fetchAutoReplies()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save auto-reply')
      }
    } catch (error) {
      toast.error('Failed to save auto-reply')
    }
  }

  const toggleReply = async (reply: AutoReply) => {
    try {
      const response = await fetch('/api/bot/auto-replies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reply.id,
          keyword: reply.keyword,
          response: reply.response,
          matchType: reply.match_type,
          isActive: !reply.is_active
        })
      })

      if (response.ok) {
        toast.success(`Auto-reply ${reply.is_active ? 'disabled' : 'enabled'}`)
        fetchAutoReplies()
      }
    } catch (error) {
      toast.error('Failed to toggle auto-reply')
    }
  }

  const deleteReply = async (id: number) => {
    try {
      const response = await fetch(`/api/bot/auto-replies?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Auto-reply deleted successfully')
        fetchAutoReplies()
      }
    } catch (error) {
      toast.error('Failed to delete auto-reply')
    }
  }

  const openEditDialog = (reply: AutoReply) => {
    setEditingReply(reply)
    setFormData({
      keyword: reply.keyword,
      response: reply.response,
      matchType: reply.match_type
    })
    setIsDialogOpen(true)
  }

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'exact': return 'bg-blue-100 text-blue-800'
      case 'contains': return 'bg-green-100 text-green-800'
      case 'starts_with': return 'bg-yellow-100 text-yellow-800'
      case 'regex': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading auto-replies...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Auto-Reply Rules</CardTitle>
              <CardDescription>
                Set up automated responses to specific keywords or patterns
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingReply(null)
                  setFormData({ keyword: '', response: '', matchType: 'contains' })
                }}>
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingReply ? 'Edit Auto-Reply Rule' : 'Create Auto-Reply Rule'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure when and how your bot should automatically respond to messages
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyword">Trigger Keyword/Pattern</Label>
                    <Input
                      id="keyword"
                      placeholder="hello, hi, help, etc."
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="matchType">Match Type</Label>
                    <Select value={formData.matchType} onValueChange={(value: any) => setFormData({ ...formData, matchType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains - matches if message contains keyword</SelectItem>
                        <SelectItem value="exact">Exact - matches if message equals keyword exactly</SelectItem>
                        <SelectItem value="starts_with">Starts with - matches if message starts with keyword</SelectItem>
                        <SelectItem value="regex">Regex - advanced pattern matching</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="response">Auto-Reply Response</Label>
                    <Textarea
                      id="response"
                      placeholder="Thank you for your message! How can I help you?"
                      value={formData.response}
                      onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingReply ? 'Update' : 'Create'} Rule
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {autoReplies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No auto-reply rules configured</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first rule to start automating responses
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {autoReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getMatchTypeColor(reply.match_type)}>
                        {reply.match_type.replace('_', ' ')}
                      </Badge>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {reply.keyword}
                      </code>
                      <Badge variant={reply.is_active ? 'default' : 'secondary'}>
                        {reply.is_active ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Response: {reply.response}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={reply.is_active}
                      onCheckedChange={() => toggleReply(reply)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(reply)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteReply(reply.id)}
                    >
                      Delete
                    </Button>
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