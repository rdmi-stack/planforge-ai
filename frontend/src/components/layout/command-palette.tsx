"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  FolderKanban,
  FileText,
  ListChecks,
  Settings,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  CreditCard,
  Bot,
  Layers,
  Hash,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/stores/ui-store"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"

type CommandItem = {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  action: () => void
  category: string
  keywords?: string[]
}

export function CommandPalette() {
  const router = useRouter()
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useKeyboardShortcuts({
    "mod+k": () => setCommandPaletteOpen(!commandPaletteOpen),
  })

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "new-project",
        label: "New Project",
        description: "Create a new project",
        icon: Plus,
        action: () => router.push("/projects"),
        category: "Actions",
        keywords: ["create", "add"],
      },
      {
        id: "ai-chat",
        label: "Open AI Planner",
        description: "Start an AI planning session",
        icon: Sparkles,
        action: () => {},
        category: "Actions",
        keywords: ["chat", "plan", "generate"],
      },
      {
        id: "projects",
        label: "Projects",
        description: "View all projects",
        icon: FolderKanban,
        action: () => router.push("/projects"),
        category: "Navigation",
      },
      {
        id: "templates",
        label: "Templates",
        description: "Browse project templates",
        icon: Hash,
        action: () => router.push("/templates"),
        category: "Navigation",
      },
      {
        id: "specs",
        label: "Specs",
        description: "View project specs",
        icon: FileText,
        action: () => {},
        category: "Navigation",
      },
      {
        id: "features",
        label: "Features",
        description: "View feature tree",
        icon: Layers,
        action: () => {},
        category: "Navigation",
      },
      {
        id: "tasks",
        label: "Task Board",
        description: "Open kanban board",
        icon: ListChecks,
        action: () => {},
        category: "Navigation",
      },
      {
        id: "agents",
        label: "Agents",
        description: "View agent orchestration",
        icon: Bot,
        action: () => {},
        category: "Navigation",
      },
      {
        id: "analytics",
        label: "Analytics",
        description: "View project analytics",
        icon: BarChart3,
        action: () => {},
        category: "Navigation",
      },
      {
        id: "settings",
        label: "Settings",
        description: "Account settings",
        icon: Settings,
        action: () => router.push("/settings"),
        category: "Settings",
      },
      {
        id: "billing",
        label: "Billing",
        description: "Manage your subscription",
        icon: CreditCard,
        action: () => router.push("/billing"),
        category: "Settings",
      },
    ],
    [router]
  )

  const filtered = useMemo(() => {
    if (!query) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q))
    )
  }, [query, commands])

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [filtered])

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const runCommand = (cmd: CommandItem) => {
    setCommandPaletteOpen(false)
    cmd.action()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      runCommand(filtered[selectedIndex])
    } else if (e.key === "Escape") {
      setCommandPaletteOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 z-[100] bg-navy/30 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-navy/10"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-light" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-light"
              />
              <kbd className="rounded border border-border bg-cream-dark px-1.5 py-0.5 text-[10px] font-medium text-muted">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-light">
                  No results found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-light">
                      {category}
                    </div>
                    {items.map((cmd) => {
                      const flatIndex = filtered.indexOf(cmd)
                      const Icon = cmd.icon
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => runCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer",
                            flatIndex === selectedIndex
                              ? "bg-forest/10 text-forest"
                              : "text-muted hover:bg-cream-dark"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{cmd.label}</div>
                            {cmd.description && (
                              <div className="truncate text-xs text-muted-light">
                                {cmd.description}
                              </div>
                            )}
                          </div>
                          {flatIndex === selectedIndex && (
                            <ArrowRight className="h-3 w-3 shrink-0 text-forest" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <div className="flex items-center gap-3 text-[10px] text-muted-light">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-light">
                <Sparkles className="h-3 w-3" />
                PlanForge
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
