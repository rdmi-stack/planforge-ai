"use client"

import { motion } from "framer-motion"
import {
  X,
  Bot,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Play,
  Edit3,
  Trash2,
  ExternalLink,
  Terminal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/task"
import { useState } from "react"

type TaskDetailPanelProps = {
  task: Task
  onClose: () => void
}

const STATUS_OPTIONS = [
  { value: "backlog", label: "Backlog" },
  { value: "ready", label: "Ready" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
] as const

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  const copyPrompt = () => {
    navigator.clipboard.writeText(task.promptText)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-white shadow-2xl shadow-navy/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-cream-dark px-2 py-0.5 font-mono text-[10px] text-muted">
            #{task.sequenceOrder}
          </span>
          <span className="text-xs text-muted">Task Detail</span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Title & description */}
          <div>
            <h2 className="text-lg font-bold text-navy">{task.title}</h2>
            {task.description && (
              <p className="mt-2 text-sm text-muted leading-relaxed">{task.description}</p>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">Status</span>
              <select
                defaultValue={task.status}
                className="mt-1 block w-full rounded-md border border-border bg-cream/30 px-2 py-1.5 text-xs font-medium text-navy outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">Agent</span>
              <div className="mt-1 flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-muted" />
                <span className="text-xs font-medium text-navy capitalize">
                  {task.agentType?.replace("_", " ") || "Not assigned"}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">Estimate</span>
              <div className="mt-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted" />
                <span className="text-xs font-medium text-navy">
                  {task.estimatedMinutes ? `${task.estimatedMinutes} min` : "No estimate"}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border p-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">Risk</span>
              <div className="mt-1 flex items-center gap-1.5">
                <AlertTriangle className={cn(
                  "h-3.5 w-3.5",
                  task.regressionRisk === "high" ? "text-danger" :
                  task.regressionRisk === "medium" ? "text-amber-500" : "text-success"
                )} />
                <span className="text-xs font-medium text-navy capitalize">{task.regressionRisk}</span>
              </div>
            </div>
          </div>

          {/* Acceptance criteria */}
          {task.acceptanceCriteria.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-bold text-navy">Acceptance Criteria</h3>
              <ul className="space-y-2">
                {task.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    <span className="text-xs text-muted leading-relaxed">{ac}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Agent prompt */}
          {task.promptText && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-navy flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  Agent Prompt
                </h3>
                <button
                  onClick={copyPrompt}
                  className="flex items-center gap-1 rounded-md bg-cream-dark px-2 py-1 text-[10px] font-medium text-muted hover:text-navy transition-colors cursor-pointer"
                >
                  {copiedPrompt ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  {copiedPrompt ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="rounded-lg bg-navy p-4 font-mono text-[11px] leading-relaxed text-white/80 overflow-x-auto">
                {task.promptText}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <button className="flex items-center gap-1.5 text-xs text-danger hover:text-danger/80 transition-colors cursor-pointer">
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-navy hover:bg-cream transition-colors cursor-pointer">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-xs font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer">
            <Play className="h-3.5 w-3.5" />
            Dispatch to Agent
          </button>
        </div>
      </div>
    </motion.div>
  )
}
