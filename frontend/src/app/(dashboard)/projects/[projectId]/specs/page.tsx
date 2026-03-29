"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  Edit3,
  Eye,
  MoreHorizontal,
  Search,
  Sparkles,
  GitCompare,
  Archive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"

type DemoSpec = {
  id: string
  title: string
  status: "draft" | "in_review" | "approved"
  version: number
  updatedAt: string
  sections: number
  wordCount: number
}

const DEMO_SPECS: DemoSpec[] = [
  {
    id: "spec-1",
    title: "User Management & Authentication",
    status: "approved",
    version: 3,
    updatedAt: "2026-03-28T10:00:00Z",
    sections: 8,
    wordCount: 2450,
  },
  {
    id: "spec-2",
    title: "Billing & Subscription System",
    status: "in_review",
    version: 2,
    updatedAt: "2026-03-27T15:30:00Z",
    sections: 6,
    wordCount: 1820,
  },
  {
    id: "spec-3",
    title: "Real-time Collaboration Engine",
    status: "draft",
    version: 1,
    updatedAt: "2026-03-26T09:00:00Z",
    sections: 4,
    wordCount: 980,
  },
]

const STATUS_MAP = {
  draft: { label: "Draft", color: "bg-amber-50 text-amber-600 ring-amber-200" },
  in_review: { label: "In Review", color: "bg-blue-50 text-blue-600 ring-blue-200" },
  approved: { label: "Approved", color: "bg-success-light text-success ring-success/20" },
}

export default function SpecsPage() {
  const [search, setSearch] = useState("")

  const filtered = DEMO_SPECS.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Specs</h1>
          <p className="mt-1 text-sm text-muted">
            {DEMO_SPECS.length} specifications &middot; Product requirements and architecture docs
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer">
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            New Spec
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search specs..."
          className="w-full rounded-lg border border-border bg-white py-2 pr-3 pl-9 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
        />
      </div>

      {/* Spec list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((spec, i) => {
            const statusConfig = STATUS_MAP[spec.status]
            return (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`specs/${spec.id}`}
                  className="group flex items-center gap-5 rounded-xl border border-border bg-white px-5 py-4 transition-all hover:border-forest/20 hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-navy group-hover:text-forest transition-colors">
                        {spec.title}
                      </h3>
                      <span className={cn("shrink-0 inline-flex rounded-full ring-1 px-2 py-0.5 text-[10px] font-semibold", statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span>v{spec.version}</span>
                      <span>&middot;</span>
                      <span>{spec.sections} sections</span>
                      <span>&middot;</span>
                      <span>{spec.wordCount.toLocaleString()} words</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(spec.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
                      title="Compare versions"
                    >
                      <GitCompare className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No specs yet"
          description="Create a spec manually or let AI generate one from your project description."
          action={
            <button className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer">
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </button>
          }
        />
      )}
    </div>
  )
}
