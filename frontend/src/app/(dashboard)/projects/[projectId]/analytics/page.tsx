"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  ListChecks,
  AlertTriangle,
  Target,
  Zap,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

const METRICS = [
  { label: "Tasks Completed", value: "32", change: "+8 this week", trend: "up", icon: ListChecks, color: "text-success", bg: "bg-success-light" },
  { label: "Avg Completion Time", value: "4.2h", change: "-1.3h vs last week", trend: "up", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Scope Creep", value: "12%", change: "+3% this sprint", trend: "down", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Agent Success Rate", value: "94%", change: "+6% improvement", trend: "up", icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
]

const VELOCITY_DATA = [
  { week: "W1", planned: 8, done: 6 },
  { week: "W2", planned: 10, done: 9 },
  { week: "W3", planned: 12, done: 11 },
  { week: "W4", planned: 10, done: 10 },
  { week: "W5", planned: 14, done: 12 },
  { week: "W6", planned: 12, done: 8 },
  { week: "W7", planned: 15, done: 14 },
  { week: "W8", planned: 13, done: 0 },
]

const CATEGORY_BREAKDOWN = [
  { name: "Authentication", total: 8, done: 8, color: "bg-success" },
  { name: "AI Planning", total: 12, done: 7, color: "bg-blue-500" },
  { name: "Spec Editor", total: 6, done: 4, color: "bg-violet-500" },
  { name: "Task Board", total: 8, done: 5, color: "bg-amber-500" },
  { name: "Agent System", total: 10, done: 3, color: "bg-pink-500" },
  { name: "Billing", total: 3, done: 1, color: "bg-teal-500" },
]

const RECENT_COMPLETIONS = [
  { task: "Setup Google OAuth", time: "45s", agent: "Claude Code", when: "2h ago" },
  { task: "Setup GitHub OAuth", time: "30s", agent: "Claude Code", when: "2h ago" },
  { task: "Dashboard layout", time: "1m 20s", agent: "Cursor", when: "3h ago" },
  { task: "RBAC middleware", time: "55s", agent: "Claude Code", when: "3h ago" },
  { task: "Database migrations", time: "25s", agent: "Codex", when: "Yesterday" },
]

export default function AnalyticsPage() {
  const maxVelocity = Math.max(...VELOCITY_DATA.map((d) => Math.max(d.planned, d.done)))

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-navy">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Track velocity, scope, and agent performance.</p>
      </div>

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-white p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", m.bg)}>
                  <Icon className={cn("h-4 w-4", m.color)} />
                </div>
                {m.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger" />
                )}
              </div>
              <div className="text-2xl font-black text-navy">{m.value}</div>
              <div className="mt-0.5 text-[11px] text-muted">{m.label}</div>
              <div className={cn("mt-1 text-[10px] font-medium", m.trend === "up" ? "text-success" : "text-danger")}>
                {m.change}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Velocity chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-forest" />
              Task Velocity
            </h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-forest" /> Completed</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cream-dark" /> Planned</span>
            </div>
          </div>

          <div className="flex h-48 items-end gap-3">
            {VELOCITY_DATA.map((d, i) => (
              <div key={d.week} className="flex flex-1 flex-col items-center gap-1">
                <div className="relative flex w-full items-end justify-center gap-1" style={{ height: "180px" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.planned / maxVelocity) * 100}%` }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="w-3 rounded-t bg-cream-dark"
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.done / maxVelocity) * 100}%` }}
                    transition={{ duration: 0.4, delay: i * 0.05 + 0.1 }}
                    className={cn("w-3 rounded-t", d.done >= d.planned ? "bg-forest" : "bg-amber-400")}
                  />
                </div>
                <span className="text-[10px] text-muted">{d.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-5 text-sm font-bold text-navy">By Feature Area</h2>
          <div className="space-y-4">
            {CATEGORY_BREAKDOWN.map((cat) => {
              const pct = Math.round((cat.done / cat.total) * 100)
              return (
                <div key={cat.name}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-navy">{cat.name}</span>
                    <span className="text-muted">{cat.done}/{cat.total}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn("h-full rounded-full", cat.color)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent completions */}
      <div className="mt-6 rounded-xl border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-bold text-navy flex items-center gap-2">
            <Zap className="h-4 w-4 text-lime" />
            Recent Completions
          </h2>
        </div>
        {RECENT_COMPLETIONS.map((item, i) => (
          <div key={i} className={cn("flex items-center gap-4 px-5 py-3", i < RECENT_COMPLETIONS.length - 1 && "border-b border-border/50")}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-light">
              <ListChecks className="h-3.5 w-3.5 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-navy">{item.task}</span>
            </div>
            <span className="text-xs text-muted">{item.agent}</span>
            <span className="text-xs font-mono text-forest">{item.time}</span>
            <span className="text-[11px] text-muted-light">{item.when}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
