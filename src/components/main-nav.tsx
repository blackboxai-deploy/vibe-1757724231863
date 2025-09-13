"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

export function MainNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">TB</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              Telegram Bot Manager
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/analytics"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Analytics
            </Link>
            <Link
              href="/logs"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Logs
            </Link>
          </nav>
          
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Button variant="ghost" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}