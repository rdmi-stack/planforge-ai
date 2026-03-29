"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  FolderKanban,
  ArrowUpDown,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProjectCard } from "@/components/projects/project-card"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { useDebounce } from "@/hooks/use-debounce"
import { apiClientAuth } from "@/lib/api-client"
import type { Project } from "@/types/project"

type BackendProject = {
  id: string
  name: string
  description: string | null
  status: string
  owner_id: string
  org_id: string
  tech_stack: string[] | null
  github_repo_url: string | null
  created_at: string
  updated_at: string
}

function mapBackendProject(p: BackendProject): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: (p.status as Project["status"]) || "active",
    githubRepoUrl: p.github_repo_url,
    techStack: p.tech_stack ?? [],
    orgId: p.org_id ?? "",
    ownerId: p.owner_id ?? "",
    specCount: 0,
    featureCount: 0,
    taskCount: 0,
    completedTaskCount: 0,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

type FilterStatus = "all" | "active" | "draft" | "archived"
type ViewMode = "grid" | "list"

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  // Auto-open create dialog from sidebar "New Project" or templates "Use Template"
  useEffect(() => {
    if (searchParams.get("new") === "true" || searchParams.get("template")) {
      setCreateOpen(true)
    }
  }, [searchParams])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const debouncedSearch = useDebounce(search, 250)

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setError(null)
      const data = await apiClientAuth<BackendProject[] | { data: BackendProject[] }>("/projects")
      const list = Array.isArray(data) ? data : (data.data ?? [])
      setProjects(list.map(mapBackendProject))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load projects"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleProjectCreated = () => {
    fetchProjects()
  }

  const filtered = projects.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false
    if (
      debouncedSearch &&
      !p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      !p.description?.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
      return false
    return true
  })

  const counts = {
    all: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    draft: projects.filter((p) => p.status === "draft").length,
    archived: projects.filter((p) => p.status === "archived").length,
  }

  if (loading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm font-medium text-danger">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchProjects() }}
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
          <h1 className="text-2xl font-black tracking-tight text-navy">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted">
            {projects.length} projects &middot; {projects.reduce((a, p) => a + p.taskCount, 0)} total tasks
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-border bg-white py-2 pr-3 pl-9 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filters */}
          <div className="flex items-center rounded-lg border border-border bg-white p-0.5">
            {(["all", "active", "draft", "archived"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer capitalize",
                  filterStatus === s
                    ? "bg-navy text-white shadow-xs"
                    : "text-muted hover:text-navy"
                )}
              >
                {s}
                <span className="ml-1 text-[10px] opacity-60">{counts[s]}</span>
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-border bg-white p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                viewMode === "grid" ? "bg-cream-dark text-navy" : "text-muted-light hover:text-navy"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-1.5 transition-colors cursor-pointer",
                viewMode === "list" ? "bg-cream-dark text-navy" : "text-muted-light hover:text-navy"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Project grid / list */}
      {filtered.length > 0 ? (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              : "space-y-3"
          )}
        >
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title={search ? "No projects found" : "No projects yet"}
          description={
            search
              ? `No projects matching "${search}". Try a different search term.`
              : "Create your first project to start planning with AI."
          }
          action={
            !search ? (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create First Project
              </button>
            ) : undefined
          }
        />
      )}

      {/* Create dialog */}
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  )
}
