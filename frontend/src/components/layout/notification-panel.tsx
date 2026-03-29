"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Bot,
  FileText,
  Layers,
  ListChecks,
  Sparkles,
  Clock,
  Trash2,
  CheckCheck,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationType = "success" | "error" | "info" | "agent" | "ai"

type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
  projectName?: string
}

const ICON_MAP: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  error: { icon: AlertCircle, color: "text-danger", bg: "bg-danger-light" },
  info: { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  agent: { icon: Bot, color: "text-violet-500", bg: "bg-violet-50" },
  ai: { icon: Sparkles, color: "text-forest", bg: "bg-forest/10" },
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "agent",
    title: "Agent completed task",
    message: "Claude Code finished \"Setup Google OAuth provider\" in 45 seconds.",
    time: "2 min ago",
    read: false,
    projectName: "PlanForge AI",
  },
  {
    id: "n2",
    type: "ai",
    title: "Spec generated",
    message: "AI generated \"User Management & Auth\" spec with 8 sections and 2,450 words.",
    time: "15 min ago",
    read: false,
    projectName: "PlanForge AI",
  },
  {
    id: "n3",
    type: "success",
    title: "Tasks auto-generated",
    message: "12 tasks created from \"Authentication\" feature decomposition.",
    time: "1 hour ago",
    read: false,
    projectName: "PlanForge AI",
  },
  {
    id: "n4",
    type: "error",
    title: "Agent failed",
    message: "Cursor failed on \"Dashboard layout\" — validation error. Retry queued.",
    time: "2 hours ago",
    read: true,
    projectName: "FinTrack Dashboard",
  },
  {
    id: "n5",
    type: "info",
    title: "Production audit complete",
    message: "Score: 94/100. 1 warning: edge case coverage needs improvement.",
    time: "3 hours ago",
    read: true,
    projectName: "PlanForge AI",
  },
  {
    id: "n6",
    type: "agent",
    title: "Batch dispatch complete",
    message: "4 of 5 tasks completed successfully. 1 retry in progress.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n7",
    type: "ai",
    title: "Feature decomposition ready",
    message: "18 features extracted from spec. 6 marked as MVP.",
    time: "Yesterday",
    read: true,
    projectName: "DevHire Platform",
  },
  {
    id: "n8",
    type: "success",
    title: "Welcome to PlanForge!",
    message: "Your account is set up. Create your first project to get started.",
    time: "2 days ago",
    read: true,
  },
]

type NotificationPanelProps = {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-navy/10"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-2xl shadow-navy/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-navy">Notifications</h2>
                  <p className="text-[11px] text-muted">
                    {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
              {/* Filter tabs */}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-cream/50 p-0.5">
                {(["all", "unread"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-md px-3 py-1 text-[11px] font-medium transition-all cursor-pointer capitalize",
                      filter === f
                        ? "bg-white text-navy shadow-xs"
                        : "text-muted hover:text-navy"
                    )}
                  >
                    {f}
                    {f === "unread" && unreadCount > 0 && (
                      <span className="ml-1 rounded-full bg-danger px-1.5 text-[9px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-forest hover:bg-forest/10 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-light hover:text-danger hover:bg-danger-light/30 transition-colors cursor-pointer"
                    title="Clear all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-dark text-muted">
                    <Bell className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 text-sm font-bold text-navy">
                    {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                  </h3>
                  <p className="text-xs text-muted">
                    {filter === "unread"
                      ? "You're all caught up! Switch to \"All\" to see past notifications."
                      : "Notifications about agent tasks, AI generation, and project updates will appear here."}
                  </p>
                </div>
              ) : (
                <div>
                  {displayed.map((notification, i) => {
                    const typeConfig = ICON_MAP[notification.type]
                    const Icon = typeConfig.icon

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => markRead(notification.id)}
                        className={cn(
                          "group relative flex gap-3 border-b border-border/50 px-5 py-4 transition-colors cursor-pointer",
                          !notification.read
                            ? "bg-forest/[0.02] hover:bg-forest/[0.04]"
                            : "hover:bg-cream/50"
                        )}
                      >
                        {/* Unread dot */}
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-forest" />
                        )}

                        {/* Icon */}
                        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", typeConfig.bg)}>
                          <Icon className={cn("h-4 w-4", typeConfig.color)} />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn("text-xs font-semibold", !notification.read ? "text-navy" : "text-navy/70")}>
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-muted-light opacity-0 group-hover:opacity-100 hover:text-danger transition-all cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted leading-relaxed line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-light">
                            <span className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {notification.time}
                            </span>
                            {notification.projectName && (
                              <>
                                <span>&middot;</span>
                                <span className="truncate">{notification.projectName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <button className="flex items-center gap-1.5 text-xs text-muted hover:text-navy transition-colors cursor-pointer">
                <Settings className="h-3 w-3" />
                Notification settings
              </button>
              <span className="text-[10px] text-muted-light">
                {notifications.length} total
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
