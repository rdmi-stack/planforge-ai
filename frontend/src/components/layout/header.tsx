"use client"

import { usePathname } from "next/navigation"
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"
import { Breadcrumbs } from "./breadcrumbs"

export function Header() {
  const { sidebarCollapsed, setSidebarCollapsed, setCommandPaletteOpen } =
    useUiStore()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
      {/* Left — breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer lg:hidden"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
        <Breadcrumbs />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
          title="Search (⌘K)"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* AI assist */}
        <button className="flex h-8 items-center gap-1.5 rounded-md bg-forest/10 px-2.5 text-forest hover:bg-forest/15 transition-colors cursor-pointer">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden text-xs font-medium sm:inline">AI</span>
        </button>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User menu */}
        <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-cream-dark transition-colors cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-white">
            RR
          </div>
          <ChevronDown className="hidden h-3 w-3 text-muted sm:block" />
        </button>
      </div>
    </header>
  )
}
