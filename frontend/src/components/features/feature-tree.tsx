"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Layers, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Feature, FeatureStatus } from "@/types/feature"

const STATUS_DOT: Record<FeatureStatus, string> = {
  backlog: "bg-muted-light",
  planned: "bg-blue-400",
  in_progress: "bg-amber-400",
  done: "bg-success",
  cut: "bg-muted-light",
}

const MVP_COLOR: Record<string, string> = {
  mvp: "text-danger",
  v1: "text-blue-500",
  v2: "text-violet-500",
  nice_to_have: "text-muted-light",
}

type TreeNodeProps = {
  feature: Feature
  depth: number
  onSelect: (feature: Feature) => void
  selectedId?: string
}

function TreeNode({ feature, depth, onSelect, selectedId }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = feature.childFeatures.length > 0
  const isSelected = selectedId === feature.id

  return (
    <div>
      <button
        onClick={() => onSelect(feature)}
        className={cn(
          "group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-all cursor-pointer",
          isSelected
            ? "bg-forest/10 text-forest"
            : "hover:bg-cream-dark text-navy"
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-light hover:text-navy cursor-pointer"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
            <Circle className="h-2 w-2 text-muted-light" fill="currentColor" />
          </div>
        )}

        {/* Status dot */}
        <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[feature.status])} />

        {/* Title */}
        <span className={cn(
          "flex-1 truncate text-sm",
          isSelected ? "font-semibold" : "font-medium",
          feature.status === "cut" && "line-through text-muted-light"
        )}>
          {feature.title}
        </span>

        {/* MVP badge */}
        <span className={cn("text-[10px] font-bold uppercase", MVP_COLOR[feature.mvpClassification])}>
          {feature.mvpClassification === "nice_to_have" ? "N2H" : feature.mvpClassification.toUpperCase()}
        </span>

        {/* Score */}
        <span className="w-6 text-right text-[10px] font-bold text-muted">{feature.priorityScore}</span>
      </button>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {feature.childFeatures.map((child) => (
              <TreeNode
                key={child.id}
                feature={child}
                depth={depth + 1}
                onSelect={onSelect}
                selectedId={selectedId}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type FeatureTreeProps = {
  features: Feature[]
  onSelect: (feature: Feature) => void
  selectedId?: string
}

export function FeatureTree({ features, onSelect, selectedId }: FeatureTreeProps) {
  return (
    <div className="rounded-xl border border-border bg-white py-2">
      <div className="mb-2 flex items-center justify-between px-4 py-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-forest" />
          <span className="text-xs font-bold text-navy">Feature Tree</span>
        </div>
        <span className="text-[10px] text-muted">{features.length} top-level</span>
      </div>

      <div className="px-1">
        {features.map((feature) => (
          <TreeNode
            key={feature.id}
            feature={feature}
            depth={0}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ))}
      </div>
    </div>
  )
}
