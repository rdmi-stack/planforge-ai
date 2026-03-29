"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Layers,
  Plus,
  Sparkles,
  LayoutGrid,
  TreePine,
  ScatterChart,
  Network,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FeatureTree } from "@/components/features/feature-tree"
import { FeatureCard } from "@/components/features/feature-card"
import { PrioritizationMatrix } from "@/components/features/prioritization-matrix"
import { DependencyGraph } from "@/components/features/dependency-graph"
import type { Feature } from "@/types/feature"

const DEMO_FEATURES: Feature[] = [
  {
    id: "f1", projectId: "p1", specId: "s1", title: "Authentication & Authorization",
    description: "OAuth 2.0, email/password, RBAC with org-level permissions", priorityScore: 95,
    effortEstimate: 40, status: "done", parentFeatureId: null, sortOrder: 1,
    mvpClassification: "mvp", dependencies: [], createdAt: "", updatedAt: "",
    childFeatures: [
      { id: "f1-1", projectId: "p1", specId: "s1", title: "Google OAuth Provider", description: "", priorityScore: 90, effortEstimate: 8, status: "done", parentFeatureId: "f1", sortOrder: 1, mvpClassification: "mvp", dependencies: [], childFeatures: [], createdAt: "", updatedAt: "" },
      { id: "f1-2", projectId: "p1", specId: "s1", title: "GitHub OAuth Provider", description: "", priorityScore: 85, effortEstimate: 8, status: "done", parentFeatureId: "f1", sortOrder: 2, mvpClassification: "mvp", dependencies: [], childFeatures: [], createdAt: "", updatedAt: "" },
      { id: "f1-3", projectId: "p1", specId: "s1", title: "Role-Based Access Control", description: "", priorityScore: 88, effortEstimate: 16, status: "in_progress", parentFeatureId: "f1", sortOrder: 3, mvpClassification: "mvp", dependencies: ["f1-1"], childFeatures: [], createdAt: "", updatedAt: "" },
    ],
  },
  {
    id: "f2", projectId: "p1", specId: "s1", title: "AI Planning Engine",
    description: "Natural language planning chat with smart questions and spec generation", priorityScore: 92,
    effortEstimate: 60, status: "in_progress", parentFeatureId: null, sortOrder: 2,
    mvpClassification: "mvp", dependencies: ["f1"], createdAt: "", updatedAt: "",
    childFeatures: [
      { id: "f2-1", projectId: "p1", specId: "s1", title: "Planning Chat Interface", description: "", priorityScore: 90, effortEstimate: 20, status: "in_progress", parentFeatureId: "f2", sortOrder: 1, mvpClassification: "mvp", dependencies: [], childFeatures: [], createdAt: "", updatedAt: "" },
      { id: "f2-2", projectId: "p1", specId: "s1", title: "Smart Question Engine", description: "", priorityScore: 85, effortEstimate: 15, status: "planned", parentFeatureId: "f2", sortOrder: 2, mvpClassification: "mvp", dependencies: ["f2-1"], childFeatures: [], createdAt: "", updatedAt: "" },
    ],
  },
  {
    id: "f3", projectId: "p1", specId: "s1", title: "Spec Generation & Editor",
    description: "Rich text editor with AI-assisted spec writing and version control", priorityScore: 88,
    effortEstimate: 45, status: "in_progress", parentFeatureId: null, sortOrder: 3,
    mvpClassification: "mvp", dependencies: ["f2"], createdAt: "", updatedAt: "", childFeatures: [],
  },
  {
    id: "f4", projectId: "p1", specId: "s1", title: "Feature Decomposition",
    description: "Break epics into hierarchical features with dependency mapping", priorityScore: 82,
    effortEstimate: 30, status: "planned", parentFeatureId: null, sortOrder: 4,
    mvpClassification: "v1", dependencies: ["f3"], createdAt: "", updatedAt: "", childFeatures: [],
  },
  {
    id: "f5", projectId: "p1", specId: "s1", title: "Task Generation & Kanban",
    description: "Atomic task breakdown with agent-ready prompts and kanban board", priorityScore: 85,
    effortEstimate: 35, status: "planned", parentFeatureId: null, sortOrder: 5,
    mvpClassification: "v1", dependencies: ["f4"], createdAt: "", updatedAt: "", childFeatures: [],
  },
  {
    id: "f6", projectId: "p1", specId: "s1", title: "Agent Orchestration",
    description: "Multi-agent dispatch, parallel execution, validation, and retry", priorityScore: 78,
    effortEstimate: 50, status: "backlog", parentFeatureId: null, sortOrder: 6,
    mvpClassification: "v1", dependencies: ["f5"], createdAt: "", updatedAt: "", childFeatures: [],
  },
  {
    id: "f7", projectId: "p1", specId: "s1", title: "Billing & Subscriptions",
    description: "Stripe integration with usage-based billing and plan management", priorityScore: 70,
    effortEstimate: 25, status: "backlog", parentFeatureId: null, sortOrder: 7,
    mvpClassification: "v1", dependencies: ["f1"], createdAt: "", updatedAt: "", childFeatures: [],
  },
  {
    id: "f8", projectId: "p1", specId: "s1", title: "Codebase Analysis",
    description: "GitHub repo connection with architecture and convention detection", priorityScore: 65,
    effortEstimate: 40, status: "backlog", parentFeatureId: null, sortOrder: 8,
    mvpClassification: "v2", dependencies: ["f2"], createdAt: "", updatedAt: "", childFeatures: [],
  },
  {
    id: "f9", projectId: "p1", specId: "s1", title: "Real-time Collaboration",
    description: "WebSocket-based multi-user editing and presence indicators", priorityScore: 50,
    effortEstimate: 45, status: "backlog", parentFeatureId: null, sortOrder: 9,
    mvpClassification: "v2", dependencies: ["f3"], createdAt: "", updatedAt: "", childFeatures: [],
  },
  {
    id: "f10", projectId: "p1", specId: "s1", title: "Production Readiness Audit",
    description: "12-point audit with security, performance, and error handling checks", priorityScore: 55,
    effortEstimate: 20, status: "backlog", parentFeatureId: null, sortOrder: 10,
    mvpClassification: "v2", dependencies: ["f6"], createdAt: "", updatedAt: "", childFeatures: [],
  },
]

type ViewMode = "tree" | "cards" | "matrix" | "graph"

export default function FeaturesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("tree")
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  const allFeatures = DEMO_FEATURES.flatMap((f) => [f, ...f.childFeatures])

  const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: "tree", label: "Tree", icon: TreePine },
    { id: "cards", label: "Cards", icon: LayoutGrid },
    { id: "matrix", label: "Matrix", icon: ScatterChart },
    { id: "graph", label: "Graph", icon: Network },
  ]

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Features</h1>
          <p className="mt-1 text-sm text-muted">
            {DEMO_FEATURES.length} features &middot; {allFeatures.filter((f) => f.status === "done").length} completed
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer">
            <Sparkles className="h-4 w-4" />
            AI Decompose
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer">
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
              features={DEMO_FEATURES}
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
            {DEMO_FEATURES.map((f) => (
              <FeatureCard key={f.id} feature={f} onClick={() => setSelectedFeature(f)} />
            ))}
          </div>
        )}

        {viewMode === "matrix" && (
          <PrioritizationMatrix features={DEMO_FEATURES} onSelect={setSelectedFeature} />
        )}

        {viewMode === "graph" && (
          <DependencyGraph features={DEMO_FEATURES} />
        )}
      </motion.div>
    </div>
  )
}
