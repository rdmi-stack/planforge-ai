"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Bot,
  ChevronDown,
  Check,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import type { AgentType } from "@/types/task"

const AGENTS: { id: AgentType; name: string; desc: string; color: string }[] = [
  { id: "claude_code", name: "Claude Code", desc: "Best for complex logic", color: "bg-orange-50 text-orange-600" },
  { id: "cursor", name: "Cursor", desc: "Fast UI components", color: "bg-sky-50 text-sky-600" },
  { id: "codex", name: "Codex", desc: "API & backend tasks", color: "bg-emerald-50 text-emerald-600" },
  { id: "windsurf", name: "Windsurf", desc: "Full-stack changes", color: "bg-teal-50 text-teal-600" },
]

type AgentDispatchButtonProps = {
  taskId: string
  projectId?: string
  onDispatch?: (taskId: string, agent: AgentType) => void
  disabled?: boolean
}

export function AgentDispatchButton({ taskId, projectId, onDispatch, disabled }: AgentDispatchButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentType>("claude_code")
  const [dispatching, setDispatching] = useState(false)
  const [dispatched, setDispatched] = useState(false)

  const handleDispatch = async () => {
    setDispatching(true)
    try {
      if (projectId) {
        await apiClientAuth(`/projects/${projectId}/tasks/${taskId}/dispatch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_type: selectedAgent }),
        })
      }
      onDispatch?.(taskId, selectedAgent)
      setDispatched(true)
      setOpen(false)
      setTimeout(() => setDispatched(false), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to dispatch task. The backend endpoint may not be available yet.")
    } finally {
      setDispatching(false)
    }
  }

  if (dispatched) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2.5 text-sm font-medium text-success"
      >
        <Check className="h-4 w-4" />
        Dispatched!
      </motion.div>
    )
  }

  return (
    <div className="relative">
      <div className="flex">
        <button
          onClick={handleDispatch}
          disabled={disabled || dispatching}
          className={cn(
            "flex items-center gap-2 rounded-l-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
            dispatching
              ? "bg-forest/70 text-white/70"
              : "bg-forest text-white hover:bg-forest-light"
          )}
        >
          {dispatching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {dispatching ? "Dispatching..." : "Dispatch"}
        </button>
        <button
          onClick={() => setOpen(!open)}
          disabled={disabled || dispatching}
          className="flex items-center rounded-r-lg border-l border-white/20 bg-forest px-2 text-white hover:bg-forest-light transition-colors cursor-pointer"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-border bg-white p-2 shadow-xl"
            >
              <div className="mb-2 px-2 py-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                  Select Agent
                </span>
              </div>

              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer",
                    selectedAgent === agent.id
                      ? "bg-forest/10"
                      : "hover:bg-cream-dark"
                  )}
                >
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", agent.color)}>
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-navy">{agent.name}</div>
                    <div className="text-[10px] text-muted">{agent.desc}</div>
                  </div>
                  {selectedAgent === agent.id && (
                    <Check className="h-4 w-4 shrink-0 text-forest" />
                  )}
                </button>
              ))}

              <div className="mt-2 border-t border-border pt-2 px-2">
                <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted hover:text-navy transition-colors cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI recommend best agent
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
