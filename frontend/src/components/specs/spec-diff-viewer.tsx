"use client"

import { motion } from "framer-motion"
import { GitCompare, Plus, Minus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

type DiffLine = {
  type: "added" | "removed" | "unchanged"
  content: string
}

type DiffBlock = {
  section: string
  lines: DiffLine[]
}

// Demo diff data — replace with real spec version comparison API
const DEMO_DIFF: DiffBlock[] = [
  {
    section: "Core Features",
    lines: [
      { type: "unchanged", content: "AI Planning Chat — Natural language ideation" },
      { type: "unchanged", content: "Spec Generation — Complete PRD from conversation" },
      { type: "removed", content: "Basic feature list — Simple bullet points" },
      { type: "added", content: "Feature Decomposition — Hierarchical breakdown with dependency mapping" },
      { type: "added", content: "Dependency Graph — Visual feature dependency visualization" },
      { type: "unchanged", content: "Task Generation — Atomic agent-ready tasks" },
      { type: "removed", content: "Manual agent dispatch" },
      { type: "added", content: "Multi-Agent Orchestration — Parallel dispatch with validation and retry" },
      { type: "added", content: "Production Readiness Audit — 12-point check before shipping" },
    ],
  },
  {
    section: "Acceptance Criteria",
    lines: [
      { type: "unchanged", content: "Spec must be generated in < 30s" },
      { type: "removed", content: "Tasks must include basic context" },
      { type: "added", content: "Tasks must include file paths, conventions, and codebase context" },
      { type: "added", content: "Agent prompts must achieve > 95% first-pass accuracy" },
      { type: "unchanged", content: "All user data encrypted at rest and in transit" },
      { type: "added", content: "Support 100+ concurrent planning sessions" },
    ],
  },
  {
    section: "Technical Architecture",
    lines: [
      { type: "removed", content: "Next.js frontend with basic API routes" },
      { type: "added", content: "Next.js 16 frontend with Tailwind v4 and App Router" },
      { type: "removed", content: "Express backend with MongoDB" },
      { type: "added", content: "FastAPI backend with MongoDB Atlas, Redis, and Celery" },
      { type: "added", content: "WebSocket support for real-time collaboration" },
    ],
  },
]

type SpecDiffViewerProps = {
  specId?: string
  projectId?: string
}

export function SpecDiffViewer({ specId, projectId }: SpecDiffViewerProps) {
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified")

  const stats = DEMO_DIFF.reduce(
    (acc, block) => {
      block.lines.forEach((line) => {
        if (line.type === "added") acc.added++
        if (line.type === "removed") acc.removed++
      })
      return acc
    },
    { added: 0, removed: 0 }
  )

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <GitCompare className="h-4 w-4 text-forest" />
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-md bg-cream-dark px-2 py-0.5 text-xs font-medium text-muted">
              v1
            </span>
            <ArrowRight className="h-3 w-3 text-muted-light" />
            <span className="rounded-md bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
              v2
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-success">
              <Plus className="h-3 w-3" />
              {stats.added} added
            </span>
            <span className="flex items-center gap-1 text-danger">
              <Minus className="h-3 w-3" />
              {stats.removed} removed
            </span>
          </div>

          <div className="flex rounded-lg border border-border p-0.5">
            {(["unified", "split"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer capitalize",
                  viewMode === mode ? "bg-navy text-white" : "text-muted hover:text-navy"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diff content */}
      <div className="divide-y divide-border">
        {DEMO_DIFF.map((block) => (
          <div key={block.section}>
            <div className="bg-cream/50 px-5 py-2">
              <span className="text-xs font-bold text-navy">{block.section}</span>
            </div>
            <div className="font-mono text-xs">
              {block.lines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 px-5 py-1.5",
                    line.type === "added" && "bg-success-light/30",
                    line.type === "removed" && "bg-danger-light/30"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 w-4 text-center font-bold",
                      line.type === "added" && "text-success",
                      line.type === "removed" && "text-danger",
                      line.type === "unchanged" && "text-muted-light"
                    )}
                  >
                    {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                  </span>
                  <span
                    className={cn(
                      line.type === "added" && "text-navy",
                      line.type === "removed" && "text-navy/50 line-through",
                      line.type === "unchanged" && "text-muted"
                    )}
                  >
                    {line.content}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
