"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Bot, Play, Pause, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"
import { AgentStatusCard } from "@/components/agents/agent-status-card"
import { OrchestrationTimeline } from "@/components/agents/orchestration-timeline"
import type { TimelineEvent } from "@/components/agents/orchestration-timeline"
import type { AgentRun } from "@/types/agent"

type AgentRunItem = { run: AgentRun; task_title: string }

function buildTimelineEvents(items: AgentRunItem[]): TimelineEvent[] {
  return items.map((item, i) => {
    const run = item.run
    let action = "Queued"
    let status: TimelineEvent["status"] = "pending"

    if (run.status === "completed") {
      const duration =
        run.startedAt && run.completedAt
          ? `${Math.round((new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s`
          : ""
      action = duration ? `Completed in ${duration}` : "Completed"
      status = "success"
    } else if (run.status === "failed") {
      action = run.retryCount > 0 ? `Failed after ${run.retryCount} retries` : "Failed"
      status = "error"
    } else if (run.status === "running") {
      action = "Running..."
      status = "running"
    } else if (run.status === "queued") {
      action = "Queued"
      status = "pending"
    }

    const time = run.startedAt
      ? new Date(run.startedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "\u2014"

    return {
      id: run.id ?? String(i),
      time,
      agent: run.agentType.replace("_", " "),
      task: item.task_title,
      action,
      status,
    }
  })
}

export default function AgentsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [dispatching, setDispatching] = useState(false)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [runs, setRuns] = useState<AgentRunItem[]>([])

  useEffect(() => {
    async function fetchRuns() {
      setLoading(true)
      try {
        const data = await apiClientAuth<AgentRunItem[]>(`/projects/${projectId}/agent-runs`)
        setRuns(Array.isArray(data) ? data : [])
      } catch {
        useToastStore.getState().addToast("Failed to load agent runs", "error")
        setRuns([])
      } finally {
        setLoading(false)
      }
    }
    fetchRuns()
  }, [projectId])

  // Compute stats from real data
  const totalRuns = runs.length
  const completedRuns = runs.filter((r) => r.run.status === "completed").length
  const failedRuns = runs.filter((r) => r.run.status === "failed").length
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0

  const avgTimeSecs = (() => {
    const durations = runs
      .filter((r) => r.run.startedAt && r.run.completedAt)
      .map((r) => (new Date(r.run.completedAt!).getTime() - new Date(r.run.startedAt!).getTime()) / 1000)
    if (durations.length === 0) return 0
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
  })()

  const stats = [
    { label: "Total Runs", value: String(totalRuns), icon: Bot, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Success Rate", value: `${successRate}%`, icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
    { label: "Avg Time", value: `${avgTimeSecs}s`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Failed", value: String(failedRuns), icon: XCircle, color: "text-danger", bg: "bg-danger-light" },
  ]

  const handleDispatchAll = async () => {
    setDispatching(true)
    try {
      const queuedTasks = runs.filter((r) => r.run.status === "queued")
      for (const item of queuedTasks) {
        try {
          await apiClientAuth(`/projects/${projectId}/tasks/${item.run.taskId}/dispatch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent_type: item.run.agentType }),
          })
        } catch {
          // Individual dispatch may fail
        }
      }
      useToastStore.getState().addToast(`Dispatched ${queuedTasks.length} queued task(s).`, "success")
    } catch (err) {
      useToastStore.getState().addToast(err instanceof Error ? err.message : "Failed to dispatch tasks", "error")
    } finally {
      setDispatching(false)
    }
  }

  const handlePauseQueue = () => {
    setPaused(!paused)
  }

  const timelineEvents = buildTimelineEvents(runs)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Agent Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Monitor and manage AI coding agent runs.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDispatchAll}
            disabled={dispatching || paused || runs.filter((r) => r.run.status === "queued").length === 0}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer disabled:opacity-60">
            {dispatching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {dispatching ? "Dispatching..." : "Dispatch All Ready"}
          </button>
          <button
            onClick={handlePauseQueue}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              paused
                ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-border bg-white text-navy hover:bg-cream"
            )}>
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume Queue" : "Pause Queue"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-white p-4"
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.bg)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <div className="text-xl font-black text-navy">{stat.value}</div>
                <div className="text-[11px] text-muted">{stat.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {runs.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <Bot className="mx-auto h-10 w-10 text-muted-light" />
          <h3 className="mt-3 text-sm font-bold text-navy">No Agent Runs Yet</h3>
          <p className="mt-1 text-xs text-muted">Dispatch tasks to coding agents to see their status here.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active runs */}
          <div>
            <h2 className="mb-4 text-sm font-bold text-navy">Agent Runs</h2>
            <div className="space-y-3">
              {runs.map((item) => (
                <AgentStatusCard key={item.run.id} run={item.run} taskTitle={item.task_title} />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="mb-4 text-sm font-bold text-navy">Activity</h2>
            <OrchestrationTimeline events={timelineEvents} />
          </div>
        </div>
      )}
    </div>
  )
}
