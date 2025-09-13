"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardsProps {
  totalUsers: number
  totalMessages: number
  todayMessages: number
}

export function StatsCards({ totalUsers, totalMessages, todayMessages }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <div className="text-2xl">👥</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Registered bot users
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <div className="text-2xl">💬</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Messages processed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
          <div className="text-2xl">📈</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayMessages.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Messages today
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
          <div className="text-2xl">⚡</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">98.5%</div>
          <p className="text-xs text-muted-foreground">
            Bot availability
          </p>
        </CardContent>
      </Card>
    </div>
  )
}