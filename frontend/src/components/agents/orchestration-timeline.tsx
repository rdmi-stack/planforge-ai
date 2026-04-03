"use client"

import { motion } from "framer-motion"
import { Bot, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type TimelineEvent = {
  id: string
  time: string
  agent: string
  task: string
  action: string
  status: "success" | "error" | "running" | "pending"
}

const STATUS_ICON = {
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success" },
  error: { icon: XCircle, color: "text-danger", bg: "bg-danger" },
  running: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500" },
  pending: { icon: Clock, color: "text-muted-light", bg: "bg-muted-light" },
}

type OrchestrationTimelineProps = {
  events?: TimelineEvent[]
}

export function OrchestrationTimeline({ events }: OrchestrationTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="mb-5 text-sm font-bold text-navy">Orchestration Timeline</h3>
        <div className="flex h-32 items-center justify-center text-sm text-muted">No activity yet</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="mb-5 text-sm font-bold text-navy">Orchestration Timeline</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {events.map((event, i) => {
            const s = STATUS_ICON[event.status]
            const Icon = s.icon
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-start gap-4 pl-10"
              >
                {/* Dot on timeline */}
                <div className={cn("absolute left-[10px] top-1 h-3 w-3 rounded-full border-2 border-white", s.bg)} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-navy">{event.task}</span>
                    <Icon className={cn("h-3.5 w-3.5", s.color, event.status === "running" && "animate-spin")} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      {event.agent}
                    </span>
                    <span>&middot;</span>
                    <span>{event.action}</span>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] text-muted-light">{event.time}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
