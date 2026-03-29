"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  FileText,
  Layers,
  ListChecks,
  Bot,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  Activity,
  Plus,
  Network,
  TrendingUp,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const PROJECT = {
  name: "PlanForge AI",
  description: "AI-powered product planning platform with multi-agent orchestration.",
  status: "active" as const,
  updatedAt: "2026-03-28T14:30:00Z",
}

const STATS = [
  { label: "Specs", value: "3", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", href: "specs" },
  { label: "Features", value: "18", icon: Layers, color: "text-violet-600", bg: "bg-violet-50", href: "features" },
  { label: "Tasks", value: "32/47", icon: ListChecks, color: "text-emerald-600", bg: "bg-emerald-50", href: "tasks" },
  { label: "Agents", value: "4 active", icon: Bot, color: "text-pink-600", bg: "bg-pink-50", href: "agents" },
]

const RECENT_ACTIVITY = [
  { action: "Task completed", detail: "Setup auth middleware", time: "2 hours ago", icon: CheckCircle2, color: "text-success" },
  { action: "Spec updated", detail: "User Management PRD v3", time: "4 hours ago", icon: FileText, color: "text-blue-500" },
  { action: "Agent dispatched", detail: "Stripe webhook handler → Claude Code", time: "5 hours ago", icon: Bot, color: "text-violet-500" },
  { action: "Feature added", detail: "Real-time notifications", time: "Yesterday", icon: Layers, color: "text-amber-500" },
  { action: "Task blocked", detail: "OAuth callback — waiting on API key", time: "Yesterday", icon: AlertCircle, color: "text-danger" },
  { action: "Architecture updated", detail: "Added Redis caching layer", time: "2 days ago", icon: Network, color: "text-teal-500" },
]

const QUICK_ACTIONS = [
  { label: "Start AI Chat", desc: "Plan new features", icon: Sparkles, color: "bg-forest text-white" },
  { label: "Generate Tasks", desc: "From existing specs", icon: Zap, color: "bg-navy text-white" },
  { label: "Run Audit", desc: "Production readiness", icon: Activity, color: "bg-violet-600 text-white" },
  { label: "Add Feature", desc: "Manual entry", icon: Plus, color: "bg-cream-dark text-navy" },
]

export default function ProjectOverviewPage() {
  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-navy">
                {PROJECT.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Active
              </span>
            </div>
            <p className="mt-1 max-w-lg text-sm text-muted">{PROJECT.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted">
              <GitBranch className="h-3.5 w-3.5 text-success" />
              Connected
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                href={stat.href}
                className="group flex items-center gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:border-forest/20 hover:shadow-md"
              >
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.bg)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-black text-navy">{stat.value}</div>
                  <div className="text-xs text-muted">{stat.label}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-light opacity-0 transition-all group-hover:opacity-100 group-hover:text-forest" />
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <h2 className="mb-4 text-sm font-bold text-navy">Quick Actions</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border bg-white p-4 text-left transition-all hover:border-forest/20 hover:shadow-sm cursor-pointer"
                >
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", action.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-navy">{action.label}</div>
                    <div className="text-[11px] text-muted">{action.desc}</div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-light opacity-0 transition-all group-hover:opacity-100" />
                </button>
              )
            })}
          </div>

          {/* Progress summary */}
          <div className="mt-4 rounded-xl border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy">Overall Progress</h3>
              <span className="text-sm font-black text-forest">68%</span>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-cream-dark">
              <div className="h-full w-[68%] rounded-full bg-linear-to-r from-forest to-lime" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Done", value: 32, color: "text-success" },
                { label: "In Progress", value: 8, color: "text-blue-500" },
                { label: "Remaining", value: 7, color: "text-muted" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-cream/50 py-2">
                  <div className={cn("text-lg font-black", s.color)}>{s.value}</div>
                  <div className="text-[10px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy">Recent Activity</h2>
            <button className="text-xs font-medium text-forest hover:text-forest-light transition-colors cursor-pointer">
              View all
            </button>
          </div>

          <div className="rounded-xl border border-border bg-white">
            {RECENT_ACTIVITY.map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 transition-colors hover:bg-cream/30",
                    i < RECENT_ACTIVITY.length - 1 && "border-b border-border"
                  )}
                >
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-dark")}>
                    <Icon className={cn("h-4 w-4", item.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-navy">{item.action}</div>
                    <div className="truncate text-xs text-muted">{item.detail}</div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-light">{item.time}</span>
                </div>
              )
            })}
          </div>

          {/* Velocity chart placeholder */}
          <div className="mt-4 rounded-xl border border-border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-forest" />
                <h3 className="text-sm font-bold text-navy">Task Velocity</h3>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                +23% this week
              </span>
            </div>
            {/* Chart placeholder */}
            <div className="flex h-32 items-end justify-between gap-2">
              {[35, 48, 42, 65, 58, 72, 80].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                  className={cn(
                    "flex-1 rounded-t-md",
                    i === 6 ? "bg-forest" : "bg-cream-dark"
                  )}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-light">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
