"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Feature } from "@/types/feature"

type DependencyGraphProps = {
  features: Feature[]
}

type GraphNode = {
  id: string
  title: string
  status: string
  x: number
  y: number
  deps: string[]
}

const GRAPH_NODES: GraphNode[] = [
  { id: "f1", title: "Auth System", status: "done", x: 10, y: 20, deps: [] },
  { id: "f2", title: "User Profiles", status: "done", x: 10, y: 55, deps: ["f1"] },
  { id: "f3", title: "Org Management", status: "in_progress", x: 35, y: 15, deps: ["f1", "f2"] },
  { id: "f4", title: "Billing", status: "in_progress", x: 35, y: 50, deps: ["f1"] },
  { id: "f5", title: "Project CRUD", status: "done", x: 35, y: 80, deps: ["f2", "f3"] },
  { id: "f6", title: "Spec Editor", status: "in_progress", x: 60, y: 20, deps: ["f5"] },
  { id: "f7", title: "AI Planner", status: "planned", x: 60, y: 50, deps: ["f5", "f6"] },
  { id: "f8", title: "Task Generator", status: "planned", x: 60, y: 80, deps: ["f7"] },
  { id: "f9", title: "Agent Dispatch", status: "backlog", x: 85, y: 35, deps: ["f7", "f8"] },
  { id: "f10", title: "Production Audit", status: "backlog", x: 85, y: 70, deps: ["f8", "f9"] },
]

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  done: { bg: "bg-success/10", border: "border-success/30", text: "text-success" },
  in_progress: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-600" },
  planned: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-600" },
  backlog: { bg: "bg-cream-dark", border: "border-border", text: "text-muted" },
}

export function DependencyGraph({ features }: DependencyGraphProps) {
  const nodeMap = new Map(GRAPH_NODES.map((n) => [n.id, n]))

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy">Dependency Graph</h3>
        <div className="flex gap-3">
          {[
            { label: "Done", color: "bg-success" },
            { label: "In Progress", color: "bg-amber-400" },
            { label: "Planned", color: "bg-blue-400" },
            { label: "Backlog", color: "bg-muted-light" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={cn("h-2 w-2 rounded-full", l.color)} />
              <span className="text-[10px] text-muted">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[340px] w-full overflow-hidden rounded-lg bg-cream/30 border border-border/50">
        {/* Connection lines */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          {GRAPH_NODES.map((node) =>
            node.deps.map((depId) => {
              const dep = nodeMap.get(depId)
              if (!dep) return null
              return (
                <motion.line
                  key={`${depId}-${node.id}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  x1={`${dep.x + 5}%`}
                  y1={`${dep.y + 3}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y + 3}%`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-muted-light"
                  strokeDasharray="4 3"
                />
              )
            })
          )}
        </svg>

        {/* Nodes */}
        {GRAPH_NODES.map((node, i) => {
          const style = STATUS_COLORS[node.status] || STATUS_COLORS.backlog
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
              className={cn(
                "absolute rounded-lg border px-3 py-2 shadow-xs cursor-pointer transition-shadow hover:shadow-md",
                style.bg,
                style.border
              )}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span className={cn("text-[11px] font-semibold whitespace-nowrap", style.text)}>
                {node.title}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
