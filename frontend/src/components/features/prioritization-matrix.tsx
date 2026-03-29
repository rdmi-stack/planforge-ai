"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Feature } from "@/types/feature"

type PrioritizationMatrixProps = {
  features: Feature[]
  onSelect: (feature: Feature) => void
}

export function PrioritizationMatrix({ features, onSelect }: PrioritizationMatrixProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="mb-5 text-sm font-bold text-navy">Impact vs Effort Matrix</h3>

      <div className="relative aspect-square max-w-lg mx-auto">
        {/* Grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px rounded-xl overflow-hidden border border-border">
          <div className="bg-success/5 p-3">
            <span className="text-[10px] font-bold text-success">Quick Wins</span>
            <p className="text-[9px] text-muted mt-0.5">High impact, low effort</p>
          </div>
          <div className="bg-blue-50 p-3">
            <span className="text-[10px] font-bold text-blue-600">Big Bets</span>
            <p className="text-[9px] text-muted mt-0.5">High impact, high effort</p>
          </div>
          <div className="bg-cream-dark p-3">
            <span className="text-[10px] font-bold text-muted">Fill-ins</span>
            <p className="text-[9px] text-muted mt-0.5">Low impact, low effort</p>
          </div>
          <div className="bg-danger/5 p-3">
            <span className="text-[10px] font-bold text-danger">Money Pits</span>
            <p className="text-[9px] text-muted mt-0.5">Low impact, high effort</p>
          </div>
        </div>

        {/* Feature dots */}
        {features.slice(0, 12).map((f, i) => {
          const effort = (f.effortEstimate || 20) / 100
          const impact = f.priorityScore / 100
          return (
            <motion.button
              key={f.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
              onClick={() => onSelect(f)}
              className="absolute group cursor-pointer"
              style={{
                left: `${Math.min(Math.max(effort * 100, 8), 92)}%`,
                bottom: `${Math.min(Math.max(impact * 100, 8), 92)}%`,
                transform: "translate(-50%, 50%)",
              }}
              title={f.title}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-md ring-2 ring-white transition-transform group-hover:scale-125",
                  f.mvpClassification === "mvp" ? "bg-danger" :
                  f.mvpClassification === "v1" ? "bg-blue-500" :
                  f.mvpClassification === "v2" ? "bg-violet-500" : "bg-muted"
                )}
              >
                {f.priorityScore}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block">
                <div className="whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[10px] text-white shadow-lg">
                  {f.title}
                </div>
              </div>
            </motion.button>
          )
        })}

        {/* Axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-semibold text-muted">
          Effort →
        </div>
        <div className="absolute -left-6 top-0 bottom-0 flex items-center">
          <span className="text-[10px] font-semibold text-muted -rotate-90">Impact →</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {[
          { label: "MVP", color: "bg-danger" },
          { label: "V1", color: "bg-blue-500" },
          { label: "V2", color: "bg-violet-500" },
          { label: "Nice to Have", color: "bg-muted" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
            <span className="text-[10px] text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
