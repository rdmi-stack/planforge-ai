"use client"

import { motion } from "framer-motion"
import {
  GripVertical,
  ChevronRight,
  MoreHorizontal,
  ListChecks,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Feature, FeatureStatus, MvpClassification } from "@/types/feature"

const STATUS_STYLES: Record<FeatureStatus, { label: string; dot: string; bg: string }> = {
  backlog: { label: "Backlog", dot: "bg-muted-light", bg: "bg-cream-dark text-muted" },
  planned: { label: "Planned", dot: "bg-blue-400", bg: "bg-blue-50 text-blue-600" },
  in_progress: { label: "In Progress", dot: "bg-amber-400", bg: "bg-amber-50 text-amber-600" },
  done: { label: "Done", dot: "bg-success", bg: "bg-success-light text-success" },
  cut: { label: "Cut", dot: "bg-muted-light", bg: "bg-cream-dark text-muted line-through" },
}

const MVP_STYLES: Record<MvpClassification, { label: string; color: string }> = {
  mvp: { label: "MVP", color: "bg-danger/10 text-danger ring-danger/20" },
  v1: { label: "V1", color: "bg-blue-50 text-blue-600 ring-blue-200" },
  v2: { label: "V2", color: "bg-violet-50 text-violet-600 ring-violet-200" },
  nice_to_have: { label: "Nice to Have", color: "bg-cream-dark text-muted ring-border" },
}

type FeatureCardProps = {
  feature: Feature
  onClick?: () => void
  compact?: boolean
}

export function FeatureCard({ feature, onClick, compact }: FeatureCardProps) {
  const status = STATUS_STYLES[feature.status]
  const mvp = MVP_STYLES[feature.mvpClassification]
  const tasksDone = feature.childFeatures.length

  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border border-border bg-white text-left transition-all hover:border-forest/20 hover:shadow-sm cursor-pointer",
        compact ? "px-3 py-2.5" : "px-4 py-3.5"
      )}
    >
      {/* Drag handle */}
      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-light opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className={cn("truncate font-semibold text-navy", compact ? "text-xs" : "text-sm")}>
            {feature.title}
          </h4>
          <span className={cn("shrink-0 rounded-full ring-1 px-2 py-0.5 text-[9px] font-bold", mvp.color)}>
            {mvp.label}
          </span>
        </div>

        {!compact && feature.description && (
          <p className="mt-1 line-clamp-1 text-xs text-muted">{feature.description}</p>
        )}

        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium", status.bg)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>

          {feature.effortEstimate && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {feature.effortEstimate}h
            </span>
          )}

          {feature.dependencies.length > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="h-3 w-3" />
              {feature.dependencies.length} dep
            </span>
          )}
        </div>
      </div>

      {/* Priority score */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black",
          feature.priorityScore >= 80 ? "bg-success/10 text-success" :
          feature.priorityScore >= 50 ? "bg-amber-50 text-amber-600" :
          "bg-cream-dark text-muted"
        )}>
          {feature.priorityScore}
        </div>
        <span className="text-[9px] text-muted-light">Score</span>
      </div>

      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-light opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  )
}
