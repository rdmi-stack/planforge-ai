"use client"

import { motion } from "framer-motion"
import {
  GripVertical,
  Clock,
  Bot,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, RegressionRisk, AgentType } from "@/types/task"

const RISK_STYLES: Record<RegressionRisk, { color: string; label: string }> = {
  low: { color: "text-success", label: "Low" },
  medium: { color: "text-amber-500", label: "Med" },
  high: { color: "text-danger", label: "High" },
}

const AGENT_STYLES: Record<AgentType, { label: string; color: string }> = {
  claude_code: { label: "Claude", color: "bg-orange-50 text-orange-600" },
  cursor: { label: "Cursor", color: "bg-sky-50 text-sky-600" },
  codex: { label: "Codex", color: "bg-emerald-50 text-emerald-600" },
  windsurf: { label: "Windsurf", color: "bg-teal-50 text-teal-600" },
  manual: { label: "Manual", color: "bg-cream-dark text-muted" },
}

type TaskCardProps = {
  task: Task
  onClick?: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const risk = RISK_STYLES[task.regressionRisk]
  const agent = task.agentType ? AGENT_STYLES[task.agentType] : null

  return (
    <motion.div
      layout
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-lg border bg-white p-3 transition-all",
        isDragging
          ? "border-forest shadow-lg shadow-forest/10 ring-1 ring-forest/20"
          : "border-border hover:border-forest/20 hover:shadow-sm"
      )}
    >
      {/* Title */}
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-light opacity-0 group-hover:opacity-100 transition-opacity" />
        <h4 className="flex-1 text-xs font-semibold text-navy leading-snug">
          {task.title}
        </h4>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="mt-1.5 ml-5.5 line-clamp-2 text-[11px] text-muted leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Meta row */}
      <div className="mt-3 ml-5.5 flex flex-wrap items-center gap-2">
        {/* Agent badge */}
        {agent && (
          <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-semibold", agent.color)}>
            <Bot className="mr-0.5 inline h-2.5 w-2.5" />
            {agent.label}
          </span>
        )}

        {/* Time estimate */}
        {task.estimatedMinutes && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted">
            <Clock className="h-2.5 w-2.5" />
            {task.estimatedMinutes}m
          </span>
        )}

        {/* Risk */}
        {task.regressionRisk !== "low" && (
          <span className={cn("flex items-center gap-0.5 text-[10px] font-medium", risk.color)}>
            <AlertTriangle className="h-2.5 w-2.5" />
            {risk.label}
          </span>
        )}

        {/* Acceptance criteria count */}
        {task.acceptanceCriteria.length > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-muted-light">
            <MessageSquare className="h-2.5 w-2.5" />
            {task.acceptanceCriteria.length}
          </span>
        )}

        {/* Order badge */}
        <span className="ml-auto text-[9px] font-mono text-muted-light">
          #{task.sequenceOrder}
        </span>
      </div>
    </motion.div>
  )
}
