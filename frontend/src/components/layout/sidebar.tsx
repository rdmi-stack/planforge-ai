"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Layers,
  ListChecks,
  Bot,
  Network,
  BarChart3,
  Settings,
  CreditCard,
  BookTemplate,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  HelpCircle,
  LogOut,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const MAIN_NAV: NavItem[] = [
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Templates", href: "/templates", icon: BookTemplate },
]

const PROJECT_NAV: NavItem[] = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Specs", href: "/specs", icon: FileText },
  { label: "Features", href: "/features", icon: Layers },
  { label: "Tasks", href: "/tasks", icon: ListChecks, badge: "12" },
  { label: "Architecture", href: "/architecture", icon: Network },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

const BOTTOM_NAV: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Billing", href: "/billing", icon: CreditCard },
]

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { sidebarCollapsed, setSidebarCollapsed, setCommandPaletteOpen } =
    useUiStore()

  const userName = session?.user?.name || "User"
  const userInitials = getInitials(session?.user?.name)

  // Detect if we're inside a project
  const projectMatch = pathname.match(/^\/projects\/([^/]+)/)
  const projectId = projectMatch?.[1]
  const inProject = Boolean(projectId)

  const isActive = (href: string) => {
    if (inProject && href === "") return pathname === `/projects/${projectId}`
    const fullPath = inProject ? `/projects/${projectId}${href}` : href
    return pathname === fullPath || pathname.startsWith(fullPath + "/")
  }

  const navItems = inProject ? PROJECT_NAV : MAIN_NAV

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-border bg-white transition-all duration-300",
        sidebarCollapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* ─── Logo ─── */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/projects" className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <div className="h-6 w-1.5 rounded-sm bg-forest" />
            <div className="h-4 w-1.5 rounded-sm bg-forest" />
            <div className="h-6 w-1.5 rounded-sm bg-forest" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-base font-bold text-navy">PlanForge</span>
          )}
        </Link>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ─── Search / Command Palette trigger ─── */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-cream/50 px-3 py-2 text-xs text-muted-light transition-colors hover:border-muted-light hover:bg-cream cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* ─── New Project button ─── */}
      <div className="px-3 pt-3">
        {sidebarCollapsed ? (
          <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest text-white hover:bg-forest-light transition-colors cursor-pointer mx-auto">
            <Plus className="h-4 w-4" />
          </button>
        ) : (
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-light cursor-pointer">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {inProject && !sidebarCollapsed && (
          <div className="mb-3 flex items-center gap-2 px-2">
            <Link
              href="/projects"
              className="text-[11px] font-medium text-muted hover:text-navy transition-colors"
            >
              Projects
            </Link>
            <span className="text-muted-light">/</span>
            <span className="truncate text-[11px] font-semibold text-navy">
              My SaaS App
            </span>
          </div>
        )}

        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            const href = inProject
              ? `/projects/${projectId}${item.href}`
              : item.href

            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-forest/10 text-forest"
                    : "text-muted hover:bg-cream-dark hover:text-navy",
                  sidebarCollapsed && "justify-center px-0"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-forest" : "text-muted-light group-hover:text-navy"
                  )}
                  strokeWidth={active ? 2 : 1.5}
                />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-lime/20 px-2 py-0.5 text-[10px] font-bold text-forest">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ─── Bottom section ─── */}
      <div className="border-t border-border px-3 py-3 space-y-0.5">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-cream-dark hover:text-navy",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-light" strokeWidth={1.5} />
              {!sidebarCollapsed && item.label}
            </Link>
          )
        })}

        {/* User */}
        <div
          className={cn(
            "mt-2 flex items-center gap-3 rounded-lg px-3 py-2",
            sidebarCollapsed && "justify-center px-0"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
            {userInitials}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-navy">
                {userName}
              </div>
              <div className="truncate text-[11px] text-muted">
                {session?.user?.email || "Pro Plan"}
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-cream-dark hover:text-navy cursor-pointer",
              sidebarCollapsed && "justify-center px-0"
            )}
            title={sidebarCollapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0 text-muted-light" strokeWidth={1.5} />
            {!sidebarCollapsed && "Sign out"}
          </button>
        )}
      </div>
    </aside>
  )
}
