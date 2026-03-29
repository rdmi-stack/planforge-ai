"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Settings,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"
import { Breadcrumbs } from "./breadcrumbs"

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Header() {
  const { data: session } = useSession()
  const { sidebarCollapsed, setSidebarCollapsed, setCommandPaletteOpen } =
    useUiStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const userInitials = getInitials(session?.user?.name)

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [userMenuOpen])

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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-cream-dark transition-colors cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-white">
              {userInitials}
            </div>
            <ChevronDown className={cn(
              "hidden h-3 w-3 text-muted sm:block transition-transform",
              userMenuOpen && "rotate-180"
            )} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-border bg-white py-1 shadow-lg shadow-navy/5 z-50">
              {/* User info */}
              <div className="border-b border-border px-4 py-3">
                <div className="text-sm font-medium text-navy">
                  {session?.user?.name || "User"}
                </div>
                <div className="text-xs text-muted truncate">
                  {session?.user?.email || ""}
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>

              {/* Sign out */}
              <div className="border-t border-border py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false)
                    signOut({ callbackUrl: "/login" })
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger-light/30 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
