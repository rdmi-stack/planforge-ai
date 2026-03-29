"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Layers,
  Plus,
  Sparkles,
  LayoutGrid,
  TreePine,
  ScatterChart,
  Network,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToastStore } from "@/stores/toast-store"
import { FeatureTree } from "@/components/features/feature-tree"
import { FeatureCard } from "@/components/features/feature-card"
import { PrioritizationMatrix } from "@/components/features/prioritization-matrix"
import { DependencyGraph } from "@/components/features/dependency-graph"
import { EmptyState } from "@/components/shared/empty-state"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { apiClientAuth } from "@/lib/api-client"
import type { Feature } from "@/types/feature"

type BackendFeature = {
  id: string
  project_id: string
  spec_id: string | null
  title: string
  description: string
  priority_score: number
  effort_estimate: number | null
  status: string
  parent_feature_id: string | null
  sort_order: number
  mvp_classification: string
  dependencies: string[]
  child_features?: BackendFeature[]
  created_at: string
  updated_at: string
}

function mapBackendFeature(f: BackendFeature): Feature {
  return {
    id: f.id,
    projectId: f.project_id ?? "",
    specId: f.spec_id,
    title: f.title,
    description: f.description ?? "",
    priorityScore: f.priority_score ?? 0,
    effortEstimate: f.effort_estimate,
    status: (f.status as Feature["status"]) ?? "backlog",
    parentFeatureId: f.parent_feature_id,
    sortOrder: f.sort_order ?? 0,
    mvpClassification: (f.mvp_classification as Feature["mvpClassification"]) ?? "v1",
    dependencies: f.dependencies ?? [],
    childFeatures: (f.child_features ?? []).map(mapBackendFeature),
    createdAt: f.created_at ?? "",
    updatedAt: f.updated_at ?? "",
  }
}

type ViewMode = "tree" | "cards" | "matrix" | "graph"

export default function FeaturesPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [viewMode, setViewMode] = useState<ViewMode>("tree")
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [decomposing, setDecomposing] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newFeatureTitle, setNewFeatureTitle] = useState("")
  const [newFeatureDesc, setNewFeatureDesc] = useState("")
  const [addingFeature, setAddingFeature] = useState(false)

  const fetchFeatures = useCallback(async () => {
    try {
      setError(null)
      const data = await apiClientAuth<BackendFeature[] | { data: BackendFeature[] }>(
        `/projects/${projectId}/features`
      )
      const list = Array.isArray(data) ? data : (data.data ?? [])
      setFeatures(list.map(mapBackendFeature))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load features")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchFeatures()
  }, [fetchFeatures])

  const handleDecompose = async () => {
    setDecomposing(true)
    try {
      await apiClientAuth(`/projects/${projectId}/features/decompose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      await fetchFeatures()
    } catch (err) {
      useToastStore.getState().addToast(err instanceof Error ? err.message : "Failed to decompose features. The backend endpoint may not be available yet.", "error")
    } finally {
      setDecomposing(false)
    }
  }

  const handleAddFeature = async () => {
    if (!newFeatureTitle.trim()) return
    setAddingFeature(true)
    try {
      await apiClientAuth(`/projects/${projectId}/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newFeatureTitle.trim(), description: newFeatureDesc.trim() }),
      })
      setNewFeatureTitle("")
      setNewFeatureDesc("")
      setShowAddDialog(false)
      await fetchFeatures()
    } catch (err) {
      useToastStore.getState().addToast(err instanceof Error ? err.message : "Failed to add feature", "error")
    } finally {
      setAddingFeature(false)
    }
  }

  const allFeatures = features.flatMap((f) => [f, ...f.childFeatures])

  const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: "tree", label: "Tree", icon: TreePine },
    { id: "cards", label: "Cards", icon: LayoutGrid },
    { id: "matrix", label: "Matrix", icon: ScatterChart },
    { id: "graph", label: "Graph", icon: Network },
  ]

  if (loading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm font-medium text-danger">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchFeatures() }}
            className="mt-3 text-xs font-medium text-danger underline hover:no-underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (features.length === 0) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-navy">Features</h1>
          <p className="mt-1 text-sm text-muted">No features yet</p>
        </div>
        <EmptyState
          icon={Layers}
          title="No features yet"
          description="Decompose your specs into features using AI, or add them manually."
          action={
            <button
              onClick={handleDecompose}
              disabled={decomposing}
              className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer disabled:opacity-60">
              {decomposing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {decomposing ? "Decomposing..." : "AI Decompose"}
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Features</h1>
          <p className="mt-1 text-sm text-muted">
            {features.length} features &middot; {allFeatures.filter((f) => f.status === "done").length} completed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDecompose}
            disabled={decomposing}
            className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer disabled:opacity-60">
            {decomposing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {decomposing ? "Decomposing..." : "AI Decompose"}
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Feature
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-white p-1 w-fit">
        {views.map((view) => {
          const Icon = view.icon
          return (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                viewMode === view.id
                  ? "bg-navy text-white shadow-xs"
                  : "text-muted hover:text-navy hover:bg-cream-dark"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {view.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {viewMode === "tree" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <FeatureTree
              features={features}
              onSelect={setSelectedFeature}
              selectedId={selectedFeature?.id}
            />
            {selectedFeature ? (
              <div className="rounded-xl border border-border bg-white p-5 space-y-4">
                <h3 className="text-base font-bold text-navy">{selectedFeature.title}</h3>
                <p className="text-sm text-muted">{selectedFeature.description}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-cream/50 p-3">
                    <span className="text-muted-light">Priority</span>
                    <div className="mt-1 text-lg font-black text-navy">{selectedFeature.priorityScore}</div>
                  </div>
                  <div className="rounded-lg bg-cream/50 p-3">
                    <span className="text-muted-light">Effort</span>
                    <div className="mt-1 text-lg font-black text-navy">{selectedFeature.effortEstimate || "—"}h</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
                <div>
                  <Layers className="mx-auto h-8 w-8 text-muted-light" />
                  <p className="mt-2 text-xs text-muted">Select a feature to view details</p>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === "cards" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.id} feature={f} onClick={() => setSelectedFeature(f)} />
            ))}
          </div>
        )}

        {viewMode === "matrix" && (
          <PrioritizationMatrix features={features} onSelect={setSelectedFeature} />
        )}

        {viewMode === "graph" && (
          <DependencyGraph features={features} />
        )}
      </motion.div>

      {/* Add Feature Dialog */}
      {showAddDialog && (
        <>
          <div className="fixed inset-0 z-40 bg-navy/20" onClick={() => setShowAddDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-navy">Add Feature</h3>
                <button onClick={() => setShowAddDialog(false)} className="text-muted hover:text-navy cursor-pointer"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy">Title</label>
                  <input type="text" value={newFeatureTitle} onChange={(e) => setNewFeatureTitle(e.target.value)} placeholder="Feature title"
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy">Description</label>
                  <textarea value={newFeatureDesc} onChange={(e) => setNewFeatureDesc(e.target.value)} placeholder="Describe the feature..." rows={3}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10 resize-none" />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowAddDialog(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleAddFeature} disabled={addingFeature || !newFeatureTitle.trim()} className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer disabled:opacity-60">
                  {addingFeature ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {addingFeature ? "Adding..." : "Add Feature"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
