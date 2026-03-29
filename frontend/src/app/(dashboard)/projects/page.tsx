"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  FolderKanban,
  ArrowUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProjectCard } from "@/components/projects/project-card"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { useDebounce } from "@/hooks/use-debounce"
import type { Project } from "@/types/project"

const DEMO_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "PlanForge AI",
    description: "AI-powered product planning platform with multi-agent orchestration, spec generation, and codebase awareness.",
    status: "active",
    githubRepoUrl: "https://github.com/planforge/planforge",
    techStack: ["Next.js", "FastAPI", "PostgreSQL", "Tailwind", "Redis"],
    orgId: "org-1",
    ownerId: "user-1",
    specCount: 3,
    featureCount: 18,
    taskCount: 47,
    completedTaskCount: 32,
    createdAt: "2026-02-15T10:00:00Z",
    updatedAt: "2026-03-28T14:30:00Z",
  },
  {
    id: "proj-2",
    name: "FinTrack Dashboard",
    description: "Personal finance tracking app with bank sync, budgeting, and AI insights.",
    status: "active",
    githubRepoUrl: "https://github.com/user/fintrack",
    techStack: ["React", "Supabase", "Tailwind", "Plaid API"],
    orgId: "org-1",
    ownerId: "user-1",
    specCount: 2,
    featureCount: 12,
    taskCount: 28,
    completedTaskCount: 28,
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-03-20T09:15:00Z",
  },
  {
    id: "proj-3",
    name: "DevHire Platform",
    description: "Technical hiring platform with AI screening, live coding challenges, and team collaboration.",
    status: "active",
    githubRepoUrl: null,
    techStack: ["Next.js", "Prisma", "PostgreSQL", "OpenAI"],
    orgId: "org-1",
    ownerId: "user-1",
    specCount: 1,
    featureCount: 8,
    taskCount: 15,
    completedTaskCount: 3,
    createdAt: "2026-03-01T12:00:00Z",
    updatedAt: "2026-03-27T16:45:00Z",
  },
  {
    id: "proj-4",
    name: "Content Engine",
    description: "AI content generation and management system for marketing teams.",
    status: "draft",
    githubRepoUrl: null,
    techStack: ["Vue", "Django", "MongoDB"],
    orgId: "org-1",
    ownerId: "user-1",
    specCount: 0,
    featureCount: 0,
    taskCount: 0,
    completedTaskCount: 0,
    createdAt: "2026-03-25T11:00:00Z",
    updatedAt: "2026-03-25T11:00:00Z",
  },
  {
    id: "proj-5",
    name: "E-commerce Starter",
    description: "Multi-vendor marketplace template with Stripe Connect, inventory management, and admin dashboard.",
    status: "archived",
    githubRepoUrl: "https://github.com/user/ecom",
    techStack: ["Next.js", "Stripe", "PostgreSQL"],
    orgId: "org-1",
    ownerId: "user-1",
    specCount: 2,
    featureCount: 14,
    taskCount: 35,
    completedTaskCount: 35,
    createdAt: "2025-11-01T10:00:00Z",
    updatedAt: "2026-01-15T08:00:00Z",
  },
]

type FilterStatus = "all" | "active" | "draft" | "archived"
type ViewMode = "grid" | "list"

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const debouncedSearch = useDebounce(search, 250)

  const filtered = DEMO_PROJECTS.filter((p) => {
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
    all: DEMO_PROJECTS.length,
    active: DEMO_PROJECTS.filter((p) => p.status === "active").length,
    draft: DEMO_PROJECTS.filter((p) => p.status === "draft").length,
    archived: DEMO_PROJECTS.filter((p) => p.status === "archived").length,
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
            {DEMO_PROJECTS.length} projects &middot; {DEMO_PROJECTS.reduce((a, p) => a + p.taskCount, 0)} total tasks
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
      <CreateProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
