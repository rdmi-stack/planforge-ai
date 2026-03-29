"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type EmptyStateProps = {
  icon: React.ElementType
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-cream/30 px-8 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-dark text-muted">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 text-base font-bold text-navy">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted">{description}</p>
      {action}
    </motion.div>
  )
}
