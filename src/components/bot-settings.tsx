"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface BotSettings {
  botToken: string
  webhookUrl: string
  welcomeMessage: string
  helpMessage: string
  enableWelcomeMessage: boolean
  enableLogging: boolean
  rateLimitEnabled: boolean
  maxMessagesPerMinute: number
}

export function BotSettings() {
  const [settings, setSettings] = useState<BotSettings>({
    botToken: '',
    webhookUrl: '',
    welcomeMessage: 'Welcome to our bot! 🤖 Use /help to see available commands.',
    helpMessage: 'Available commands:\n/start - Get started\n/help - Show this help\n/settings - Your settings\n/about - About this bot',
    enableWelcomeMessage: true,
    enableLogging: true,
    rateLimitEnabled: true,
    maxMessagesPerMinute: 20
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/bot/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, ...data })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/bot/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const testWebhook = async () => {
    try {
      const response = await fetch('/api/bot/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: settings.webhookUrl })
      })
      
      if (response.ok) {
        toast.success('Webhook test successful')
      } else {
        toast.error('Webhook test failed')
      }
    } catch (error) {
      toast.error('Webhook test failed')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bot Configuration</CardTitle>
          <CardDescription>
            Configure your Telegram bot settings and API credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                placeholder="Enter your bot token from @BotFather"
                value={settings.botToken}
                onChange={(e) => setSettings({ ...settings, botToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Get your bot token from @BotFather on Telegram
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="webhookUrl"
                  placeholder="https://yourdomain.com/api/bot/webhook"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                />
                <Button variant="outline" onClick={testWebhook}>
                  Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                URL where Telegram will send updates
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Messages</h3>
            
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                placeholder="Enter welcome message for new users"
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpMessage">Help Message</Label>
              <Textarea
                id="helpMessage"
                placeholder="Enter help message with available commands"
                value={settings.helpMessage}
                onChange={(e) => setSettings({ ...settings, helpMessage: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Features</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Welcome Message</Label>
                <p className="text-sm text-muted-foreground">
                  Send welcome message to new users
                </p>
              </div>
              <Switch
                checked={settings.enableWelcomeMessage}
                onCheckedChange={(checked) => setSettings({ ...settings, enableWelcomeMessage: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Activity Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all bot activities and messages
                </p>
              </div>
              <Switch
                checked={settings.enableLogging}
                onCheckedChange={(checked) => setSettings({ ...settings, enableLogging: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Limit message rate to prevent spam
                </p>
              </div>
              <Switch
                checked={settings.rateLimitEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, rateLimitEnabled: checked })}
              />
            </div>

            {settings.rateLimitEnabled && (
              <div className="space-y-2">
                <Label htmlFor="maxMessages">Max Messages Per Minute</Label>
                <Input
                  id="maxMessages"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxMessagesPerMinute}
                  onChange={(e) => setSettings({ ...settings, maxMessagesPerMinute: parseInt(e.target.value) || 20 })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={fetchSettings}>
              Reset
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}