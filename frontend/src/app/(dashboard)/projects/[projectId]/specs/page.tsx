"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"

type BackendSpec = {
  id: string
  project_id: string
  title: string
  content: Record<string, unknown> | null
  status: string
  version: number
  parent_spec_id: string | null
  created_at: string
  updated_at: string
}

type DisplaySpec = {
  id: string
  title: string
  status: "draft" | "in_review" | "approved"
  version: number
  updatedAt: string
  sections: number
  wordCount: number
}

function mapBackendSpec(s: BackendSpec): DisplaySpec {
  const content = s.content ?? {}
  const contentStr = JSON.stringify(content)
  const wordCount = contentStr.split(/\s+/).length
  const sections = Object.keys(content).length

  return {
    id: s.id,
    title: s.title,
    status: (s.status as DisplaySpec["status"]) ?? "draft",
    version: s.version ?? 1,
    updatedAt: s.updated_at,
    sections,
    wordCount,
  }
}

const STATUS_MAP = {
  draft: { label: "Draft", color: "bg-amber-50 text-amber-600 ring-amber-200" },
  in_review: { label: "In Review", color: "bg-blue-50 text-blue-600 ring-blue-200" },
  approved: { label: "Approved", color: "bg-success-light text-success ring-success/20" },
}

export default function SpecsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string

  const [search, setSearch] = useState("")
  const [specs, setSpecs] = useState<DisplaySpec[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [creating, setCreating] = useState(false)
  const [generating, setGenerating] = useState(false)

  const fetchSpecs = useCallback(async () => {
    try {
      setError(null)
      const data = await apiClientAuth<BackendSpec[] | { data: BackendSpec[] }>(
        `/projects/${projectId}/specs`
      )
      const list = Array.isArray(data) ? data : (data.data ?? [])
      setSpecs(list.map(mapBackendSpec))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load specs")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchSpecs()
  }, [fetchSpecs])

  const handleCreateSpec = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const result = await apiClientAuth<BackendSpec>(`/projects/${projectId}/specs`, {
        method: "POST",
        body: JSON.stringify({ title: newTitle.trim() }),
        headers: { "Content-Type": "application/json" },
      })
      setShowNewDialog(false)
      setNewTitle("")
      router.push(`/projects/${projectId}/specs/${result.id}`)
    } catch (err) {
      useToastStore.getState().addToast(err instanceof Error ? err.message : "Failed to create spec", "error")
    } finally {
      setCreating(false)
    }
  }

  const handleAIGenerate = async () => {
    setGenerating(true)
    try {
      const result = await apiClientAuth<BackendSpec>(`/projects/${projectId}/specs`, {
        method: "POST",
        body: JSON.stringify({ title: "AI Generated Spec" }),
        headers: { "Content-Type": "application/json" },
      })
      router.push(`/projects/${projectId}/specs/${result.id}`)
    } catch (err) {
      useToastStore.getState().addToast(err instanceof Error ? err.message : "Failed to generate spec", "error")
    } finally {
      setGenerating(false)
    }
  }

  const filtered = specs.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm font-medium text-danger">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchSpecs() }}
            className="mt-3 text-xs font-medium text-danger underline hover:no-underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Specs</h1>
          <p className="mt-1 text-sm text-muted">
            {specs.length} specifications &middot; Product requirements and architecture docs
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "AI Generate"}
          </button>
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer"
          >
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
            const statusConfig = STATUS_MAP[spec.status] ?? STATUS_MAP.draft
            return (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/projects/${projectId}/specs/${spec.id}`}
                  className="group flex items-center gap-5 rounded-xl border border-border bg-white px-5 py-4 transition-all hover:border-forest/20 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
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
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors">
                      <Eye className="h-4 w-4" />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors">
                      <GitCompare className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={search ? "No specs found" : "No specs yet"}
          description={
            search
              ? `No specs matching "${search}".`
              : "Create a spec manually or let AI generate one from your project description."
          }
          action={
            !search ? (
              <div className="flex gap-2">
                <button
                  onClick={handleAIGenerate}
                  disabled={generating}
                  className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate with AI"}
                </button>
                <button
                  onClick={() => setShowNewDialog(true)}
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  New Spec
                </button>
              </div>
            ) : undefined
          }
        />
      )}

      {/* New Spec Dialog */}
      <AnimatePresence>
        {showNewDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewDialog(false)}
              className="fixed inset-0 z-[100] bg-navy/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-navy">New Spec</h3>
                <button onClick={() => setShowNewDialog(false)} className="text-muted hover:text-navy cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-semibold text-navy">Spec Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., User Authentication PRD"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreateSpec()}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowNewDialog(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSpec}
                  disabled={creating || !newTitle.trim()}
                  className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-forest transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {creating ? "Creating..." : "Create Spec"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
