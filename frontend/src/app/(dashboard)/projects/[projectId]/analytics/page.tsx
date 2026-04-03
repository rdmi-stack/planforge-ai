"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"
import type { Task } from "@/types/task"
import type { Feature } from "@/types/feature"

type VelocityData = {
  project_id: string
  period_days: number
  total_tasks: number
  completed: number
  velocity_per_day: number
  completion_percentage: number
  status_breakdown: Record<string, number>
  remaining_effort_hours: number
}

type ScopeCreepData = {
  project_id: string
  total_features: number
  mvp_features: number
  non_mvp_features: number
  total_tasks: number
  total_effort_hours: number
  scope_ratio: number
  scope_status: string
}

type WeekBucket = { week: string; planned: number; done: number }

type CategoryBucket = { name: string; total: number; done: number; color: string }

type RecentCompletion = { task: string; when: string; featureTitle: string }

const CATEGORY_COLORS = [
  "bg-success",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
]

function getWeekLabel(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const weekNum = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  return `W${weekNum}`
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return "Yesterday"
  return `${diffDay}d ago`
}

export default function AnalyticsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [loading, setLoading] = useState(true)

  const [velocity, setVelocity] = useState<VelocityData | null>(null)
  const [scopeCreep, setScopeCreep] = useState<ScopeCreepData | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [features, setFeatures] = useState<Feature[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [velRes, scopeRes, tasksRes, featuresRes] = await Promise.allSettled([
          apiClientAuth<{ data: VelocityData }>(`/analytics/velocity?project_id=${projectId}`),
          apiClientAuth<{ data: ScopeCreepData }>(`/analytics/scope-creep?project_id=${projectId}`),
          apiClientAuth<{ data: Task[] }>(`/projects/${projectId}/tasks`),
          apiClientAuth<{ data: Feature[] }>(`/projects/${projectId}/features`),
        ])

        if (velRes.status === "fulfilled") setVelocity(velRes.value.data)
        else useToastStore.getState().addToast("Failed to load velocity data", "error")

        if (scopeRes.status === "fulfilled") setScopeCreep(scopeRes.value.data)
        else useToastStore.getState().addToast("Failed to load scope data", "error")

        if (tasksRes.status === "fulfilled") {
          const taskData = tasksRes.value.data ?? tasksRes.value
          setTasks(Array.isArray(taskData) ? taskData : [])
        }

        if (featuresRes.status === "fulfilled") {
          const featData = featuresRes.value.data ?? featuresRes.value
          setFeatures(Array.isArray(featData) ? featData : [])
        }
      } catch {
        useToastStore.getState().addToast("Failed to load analytics", "error")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [projectId])

  // Compute metrics
  const totalTasks = velocity?.total_tasks ?? tasks.length
  const doneCount = velocity?.completed ?? tasks.filter((t) => t.status === "done").length
  const inProgressCount = velocity?.status_breakdown?.in_progress ?? tasks.filter((t) => t.status === "in_progress").length
  const completionPct = velocity?.completion_percentage ?? (totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0)
  const scopeRatio = scopeCreep?.scope_ratio ?? 0
  const scopePct = scopeRatio > 0 ? Math.round((scopeRatio - 1) * 100) : 0

  const metrics = [
    { label: "Tasks Completed", value: `${doneCount}/${totalTasks}`, change: `${completionPct}% complete`, trend: "up" as const, icon: ListChecks, color: "text-success", bg: "bg-success-light" },
    { label: "In Progress", value: String(inProgressCount), change: `${totalTasks - doneCount - inProgressCount} remaining`, trend: "up" as const, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Scope Creep", value: `${scopePct}%`, change: scopeCreep?.scope_status ?? "unknown", trend: scopePct > 20 ? "down" as const : "up" as const, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Remaining Effort", value: `${velocity?.remaining_effort_hours ?? 0}h`, change: `${velocity?.velocity_per_day ?? 0} tasks/day`, trend: "up" as const, icon: Target, color: "text-violet-600", bg: "bg-violet-50" },
  ]

  // Velocity chart: group tasks by week based on updatedAt
  const velocityData: WeekBucket[] = (() => {
    if (tasks.length === 0) return []
    const weekMap = new Map<string, { planned: number; done: number }>()
    for (const t of tasks) {
      const weekLabel = getWeekLabel(new Date(t.updatedAt ?? t.createdAt))
      const bucket = weekMap.get(weekLabel) ?? { planned: 0, done: 0 }
      bucket.planned += 1
      if (t.status === "done") bucket.done += 1
      weekMap.set(weekLabel, bucket)
    }
    return Array.from(weekMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-8)
      .map(([week, data]) => ({ week, ...data }))
  })()

  // Category breakdown: group by feature title
  const categoryBreakdown: CategoryBucket[] = (() => {
    if (features.length === 0 && tasks.length === 0) return []
    const featureMap = new Map<string, { id: string; title: string }>()
    for (const f of features) {
      featureMap.set(f.id, { id: f.id, title: f.title })
    }
    const catMap = new Map<string, { total: number; done: number }>()
    for (const t of tasks) {
      const featureName = featureMap.get(t.featureId)?.title ?? "Uncategorized"
      const bucket = catMap.get(featureName) ?? { total: 0, done: 0 }
      bucket.total += 1
      if (t.status === "done") bucket.done += 1
      catMap.set(featureName, bucket)
    }
    return Array.from(catMap.entries()).map(([name, data], i) => ({
      name,
      ...data,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
  })()

  // Recent completions: done tasks sorted by updatedAt desc, take 5
  const recentCompletions: RecentCompletion[] = (() => {
    const doneTasks = tasks.filter((t) => t.status === "done")
    doneTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    const featureMap = new Map<string, string>()
    for (const f of features) featureMap.set(f.id, f.title)
    return doneTasks.slice(0, 5).map((t) => ({
      task: t.title,
      when: timeAgo(t.updatedAt),
      featureTitle: featureMap.get(t.featureId) ?? "—",
    }))
  })()

  const maxVelocity = velocityData.length > 0 ? Math.max(...velocityData.map((d) => Math.max(d.planned, d.done))) : 1

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-navy">Analytics</h1>
        <p className="mt-1 text-sm text-muted">Track velocity, scope, and agent performance.</p>
      </div>

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
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

          {velocityData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted">No task data yet</div>
          ) : (
            <div className="flex h-48 items-end gap-3">
              {velocityData.map((d, i) => (
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
          )}
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h2 className="mb-5 text-sm font-bold text-navy">By Feature Area</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted">No features yet</div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => {
                const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0
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
          )}
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
        {recentCompletions.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-sm text-muted">No completed tasks yet</div>
        ) : (
          recentCompletions.map((item, i) => (
            <div key={i} className={cn("flex items-center gap-4 px-5 py-3", i < recentCompletions.length - 1 && "border-b border-border/50")}>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-light">
                <ListChecks className="h-3.5 w-3.5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-navy">{item.task}</span>
              </div>
              <span className="text-xs text-muted">{item.featureTitle}</span>
              <span className="text-[11px] text-muted-light">{item.when}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
