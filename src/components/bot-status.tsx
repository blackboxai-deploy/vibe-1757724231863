"use client"

import { Badge } from "@/components/ui/badge"

interface BotStatusProps {
  isActive: boolean
  uptime: string
}

export function BotStatus({ isActive, uptime }: BotStatusProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div 
          className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Online' : 'Offline'}
        </Badge>
      </div>
      
      {isActive && (
        <div className="text-sm text-muted-foreground">
          Uptime: {uptime}
        </div>
      )}
    </div>
  )
}