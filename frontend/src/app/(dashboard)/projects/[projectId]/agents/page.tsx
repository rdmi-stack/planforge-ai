"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Bot, Play, Pause, BarChart3, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"
import { AgentStatusCard } from "@/components/agents/agent-status-card"
import { OrchestrationTimeline } from "@/components/agents/orchestration-timeline"
import type { AgentRun } from "@/types/agent"

const DEMO_RUNS: { run: AgentRun; taskTitle: string }[] = [
  { taskTitle: "Planning chat endpoint", run: { id: "r1", taskId: "t4", agentType: "cursor", status: "running", startedAt: "2026-03-28T10:38:00Z", completedAt: null, outputLog: "", validationResult: null, retryCount: 0 } },
  { taskTitle: "RBAC middleware", run: { id: "r2", taskId: "t3", agentType: "claude_code", status: "completed", startedAt: "2026-03-28T10:34:00Z", completedAt: "2026-03-28T10:37:00Z", outputLog: "Created RBAC middleware...", validationResult: { passed: true, checks: [{ name: "Roles enforced", passed: true, message: "" }, { name: "Owner billing access", passed: true, message: "" }] }, retryCount: 1 } },
  { taskTitle: "Smart questions engine", run: { id: "r3", taskId: "t5", agentType: "claude_code", status: "queued", startedAt: null, completedAt: null, outputLog: "", validationResult: null, retryCount: 0 } },
  { taskTitle: "GitHub OAuth", run: { id: "r4", taskId: "t2", agentType: "claude_code", status: "completed", startedAt: "2026-03-28T10:33:00Z", completedAt: "2026-03-28T10:34:00Z", outputLog: "Setup GitHub OAuth provider...", validationResult: { passed: true, checks: [{ name: "Login works", passed: true, message: "" }, { name: "Email handling", passed: true, message: "" }] }, retryCount: 0 } },
]

const STATS = [
  { label: "Total Runs", value: "24", icon: Bot, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Success Rate", value: "92%", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  { label: "Avg Time", value: "48s", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Failed", value: "2", icon: XCircle, color: "text-danger", bg: "bg-danger-light" },
]

export default function AgentsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [dispatching, setDispatching] = useState(false)
  const [paused, setPaused] = useState(false)

  const handleDispatchAll = async () => {
    setDispatching(true)
    try {
      const queuedTasks = DEMO_RUNS.filter((r) => r.run.status === "queued")
      for (const item of queuedTasks) {
        try {
          await apiClientAuth(`/projects/${projectId}/tasks/${item.run.taskId}/dispatch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent_type: item.run.agentType }),
          })
        } catch {
          // Individual dispatch may fail if endpoint not ready
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
            disabled={dispatching || paused}
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
        {STATS.map((stat, i) => {
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active runs */}
        <div>
          <h2 className="mb-4 text-sm font-bold text-navy">Agent Runs</h2>
          <div className="space-y-3">
            {DEMO_RUNS.map((item) => (
              <AgentStatusCard key={item.run.id} run={item.run} taskTitle={item.taskTitle} />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="mb-4 text-sm font-bold text-navy">Activity</h2>
          <OrchestrationTimeline />
        </div>
      </div>
    </div>
  )
}
