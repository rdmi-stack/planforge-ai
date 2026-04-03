"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Eye, Edit3, GitCompare, MessageSquare, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { SpecEditor } from "@/components/specs/spec-editor"
import { SpecPreview } from "@/components/specs/spec-preview"
import { SpecDiffViewer } from "@/components/specs/spec-diff-viewer"
import { PlanningChat } from "@/components/chat/planning-chat"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"
import type { Spec } from "@/types/spec"

type Tab = "edit" | "preview" | "diff" | "chat"

/**
 * Convert a spec content dict to HTML string for the editor.
 * If content is null/undefined, returns empty string.
 */
function specContentToHtml(content: Record<string, unknown> | null | undefined): string {
  if (!content) return ""
  // If the content has an "html" key, use it directly
  if (typeof content.html === "string") return content.html
  // If the content has a "text" key, wrap in a paragraph
  if (typeof content.text === "string") return `<p>${content.text}</p>`
  // Fallback: render as formatted JSON
  return `<pre>${JSON.stringify(content, null, 2)}</pre>`
}

export default function SpecDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const specId = params.specId as string
  const addToast = useToastStore((s) => s.addToast)

  const [spec, setSpec] = useState<Spec | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("preview")
  const [title, setTitle] = useState("")

  useEffect(() => {
    let cancelled = false

    async function fetchSpec() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiClientAuth<{ data: Spec }>(
          `/projects/${projectId}/specs/${specId}`
        )
        if (cancelled) return
        const fetched = data.data ?? (data as unknown as Spec)
        setSpec(fetched)
        setTitle(fetched.title)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Failed to load spec"
        setError(message)
        addToast(message, "error")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSpec()
    return () => { cancelled = true }
  }, [projectId, specId, addToast])

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "preview", label: "Preview", icon: Eye },
    { id: "edit", label: "Edit", icon: Edit3 },
    { id: "diff", label: "Diff", icon: GitCompare },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    )
  }

  if (error || !spec) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle className="h-8 w-8 text-danger mb-3" />
        <h2 className="text-lg font-bold text-navy mb-1">Failed to load spec</h2>
        <p className="text-sm text-muted">{error || "Spec not found"}</p>
      </div>
    )
  }

  const statusLabel = spec.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <FileText className="h-3.5 w-3.5" />
          <span>Spec</span>
          <span>&middot;</span>
          <span>v{spec.version}</span>
          <span>&middot;</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-light text-success ring-1 ring-success/20 px-2 py-0.5 text-[10px] font-semibold">
            {statusLabel}
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-navy">{title}</h1>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-white p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                activeTab === tab.id
                  ? "bg-navy text-white shadow-xs"
                  : "text-muted hover:text-navy hover:bg-cream-dark"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "preview" && <SpecPreview spec={{ title, version: spec.version }} />}
        {activeTab === "edit" && (
          <SpecEditor
            initialContent={specContentToHtml(spec.content)}
            title={title}
            projectId={projectId}
            onTitleChange={setTitle}
          />
        )}
        {activeTab === "diff" && <SpecDiffViewer specId={specId} projectId={projectId} />}
        {activeTab === "chat" && <PlanningChat projectId={projectId} />}
      </motion.div>
    </div>
  )
}
