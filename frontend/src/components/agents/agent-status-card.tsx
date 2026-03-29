"use client"

import { motion } from "framer-motion"
import { Bot, Clock, CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentRun } from "@/types/agent"

const STATUS_STYLES = {
  queued: { icon: Clock, color: "text-muted", bg: "bg-cream-dark", label: "Queued" },
  running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-50", label: "Running", animate: true },
  completed: { icon: CheckCircle2, color: "text-success", bg: "bg-success-light", label: "Completed" },
  failed: { icon: XCircle, color: "text-danger", bg: "bg-danger-light", label: "Failed" },
  cancelled: { icon: XCircle, color: "text-muted", bg: "bg-cream-dark", label: "Cancelled" },
} as const

type AgentStatusCardProps = { run: AgentRun; taskTitle: string }

export function AgentStatusCard({ run, taskTitle }: AgentStatusCardProps) {
  const status = STATUS_STYLES[run.status]
  const Icon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", status.bg)}>
          <Icon className={cn("h-4 w-4", status.color, "animate" in status && status.animate && "animate-spin")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-navy">{taskTitle}</h4>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", status.bg, status.color)}>
              {status.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              {run.agentType.replace("_", " ")}
            </span>
            {run.retryCount > 0 && (
              <span className="flex items-center gap-1 text-amber-500">
                <RotateCcw className="h-3 w-3" />
                {run.retryCount} retries
              </span>
            )}
            {run.startedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(run.startedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
          </div>
          {run.status === "running" && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-dark">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/3 rounded-full bg-blue-400"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
