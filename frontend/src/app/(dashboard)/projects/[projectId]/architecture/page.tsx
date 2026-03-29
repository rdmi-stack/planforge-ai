"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Network, Database, FileCode, Sparkles, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"
import { ArchDiagramViewer } from "@/components/architecture/arch-diagram-viewer"
import { SchemaDesigner } from "@/components/architecture/schema-designer"
import { ApiContractViewer } from "@/components/architecture/api-contract-viewer"

type Tab = "diagram" | "schema" | "api"

export default function ArchitecturePage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [activeTab, setActiveTab] = useState<Tab>("diagram")
  const [aiGenerating, setAiGenerating] = useState(false)

  const handleAiGenerate = async () => {
    setAiGenerating(true)
    try {
      await apiClientAuth(`/projects/${projectId}/architecture/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      useToastStore.getState().addToast("Architecture generated successfully!", "success")
    } catch (err) {
      useToastStore.getState().addToast(err instanceof Error ? err.message : "Failed to generate architecture. The backend endpoint may not be available yet.", "error")
    } finally {
      setAiGenerating(false)
    }
  }

  const handleExport = () => {
    const exportData = {
      projectId,
      exportedAt: new Date().toISOString(),
      activeTab,
      architecture: { diagram: "system-diagram-placeholder", schema: "database-schema-placeholder", api: "api-contracts-placeholder" },
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `architecture-${projectId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "diagram", label: "System Diagram", icon: Network },
    { id: "schema", label: "Database Schema", icon: Database },
    { id: "api", label: "API Contracts", icon: FileCode },
  ]

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Architecture</h1>
          <p className="mt-1 text-sm text-muted">System design, database schema, and API contracts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer disabled:opacity-60">
            {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {aiGenerating ? "Generating..." : "AI Generate"}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-white p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                activeTab === tab.id ? "bg-navy text-white shadow-xs" : "text-muted hover:text-navy hover:bg-cream-dark"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
        {activeTab === "diagram" && <ArchDiagramViewer />}
        {activeTab === "schema" && <SchemaDesigner />}
        {activeTab === "api" && <ApiContractViewer />}
      </motion.div>
    </div>
  )
}
