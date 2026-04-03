"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Network, Database, FileCode, Sparkles, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"

type Tab = "diagram" | "schema" | "api"

type ArchitectureResponse = {
  markdown: string
  sections?: Record<string, string>
  project_id: string
}

const TABS: { id: Tab; label: string; icon: React.ElementType; keywords: string[] }[] = [
  { id: "diagram", label: "System Diagram", icon: Network, keywords: ["system", "architecture", "infra", "deployment"] },
  { id: "schema", label: "Database Schema", icon: Database, keywords: ["schema", "database", "data model", "tables"] },
  { id: "api", label: "API Contracts", icon: FileCode, keywords: ["api", "endpoint", "contract", "websocket"] },
]

function pickSections(sections: Record<string, string>, keywords: string[]) {
  const matches = Object.entries(sections).filter(([title]) =>
    keywords.some((keyword) => title.toLowerCase().includes(keyword)),
  )

  return matches.length > 0 ? matches : Object.entries(sections)
}

export default function ArchitecturePage() {
  const params = useParams()
  const projectId = params.projectId as string
  const addToast = useToastStore.getState().addToast
  const [activeTab, setActiveTab] = useState<Tab>("diagram")
  const [aiGenerating, setAiGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [architecture, setArchitecture] = useState<ArchitectureResponse | null>(null)

  const fetchArchitecture = useCallback(async () => {
    try {
      const response = await apiClientAuth<{ data: ArchitectureResponse | null }>(`/projects/${projectId}/architecture`)
      setArchitecture(response.data)
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to load architecture", "error")
    } finally {
      setLoading(false)
    }
  }, [addToast, projectId])

  useEffect(() => {
    fetchArchitecture()
  }, [fetchArchitecture])

  const handleAiGenerate = async () => {
    setAiGenerating(true)
    try {
      const response = await apiClientAuth<{ data: ArchitectureResponse }>(`/projects/${projectId}/architecture/generate`, {
        method: "POST",
      })
      setArchitecture(response.data)
      addToast("Architecture generated successfully.", "success")
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to generate architecture", "error")
    } finally {
      setAiGenerating(false)
    }
  }

  const handleExport = () => {
    if (!architecture) {
      addToast("Generate architecture before exporting it.", "info")
      return
    }

    const blob = new Blob([JSON.stringify(architecture, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `architecture-${projectId}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const sections = useMemo(() => {
    const allSections = architecture?.sections ?? {}
    const fallbackMarkdown = architecture?.markdown?.trim()

    if (Object.keys(allSections).length > 0) {
      const tabConfig = TABS.find((tab) => tab.id === activeTab)
      return tabConfig ? pickSections(allSections, tabConfig.keywords) : Object.entries(allSections)
    }

    if (fallbackMarkdown) {
      return [["Generated Architecture", fallbackMarkdown]] as [string, string][]
    }

    return [] as [string, string][]
  }, [activeTab, architecture])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Architecture</h1>
          <p className="mt-1 text-sm text-muted">System design, database schema, and API contracts generated from your project context.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-forest/15 cursor-pointer disabled:opacity-60">
            {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {aiGenerating ? "Generating..." : architecture ? "Regenerate" : "AI Generate"}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-cream cursor-pointer">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-white p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                activeTab === tab.id ? "bg-navy text-white shadow-xs" : "text-muted hover:text-navy hover:bg-cream-dark",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
        {architecture && sections.length > 0 ? (
          <div className="rounded-xl border border-border bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-navy">
                  {TABS.find((tab) => tab.id === activeTab)?.label}
                </h2>
                <p className="text-[11px] text-muted">
                  Showing generated architecture content instead of static placeholders.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {sections.map(([title, content]) => (
                <section key={title} className="rounded-lg border border-border bg-cream/20 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-navy">{title}</h3>
                  <div className="prose prose-sm max-w-none text-navy prose-headings:text-navy prose-strong:text-navy prose-code:text-forest">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center">
            <h2 className="text-lg font-bold text-navy">No architecture generated yet</h2>
            <p className="mt-2 text-sm text-muted">
              Generate architecture after adding a project description, specs, or features so the output has useful product context.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
