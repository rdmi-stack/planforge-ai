"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  MoreHorizontal,
  FileText,
  Layers,
  ListChecks,
  Clock,
  GitBranch,
  Star,
  Archive,
  Trash2,
  Settings,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Project } from "@/types/project"
import { useState } from "react"

const STATUS_CONFIG = {
  active: { label: "Active", dot: "bg-success", bg: "bg-success/10 text-success" },
  draft: { label: "Draft", dot: "bg-amber-400", bg: "bg-amber-50 text-amber-600" },
  archived: { label: "Archived", dot: "bg-muted-light", bg: "bg-cream-dark text-muted" },
} as const

type ProjectCardProps = {
  project: Project
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const status = STATUS_CONFIG[project.status]
  const progress =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative"
    >
      <Link
        href={`/projects/${project.id}`}
        className="block rounded-2xl border border-border bg-white p-6 transition-all hover:border-forest/20 hover:shadow-lg hover:shadow-navy/[0.04]"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="truncate text-base font-bold text-navy group-hover:text-forest transition-colors">
                {project.name}
              </h3>
            </div>
            <p className="line-clamp-2 text-xs text-muted leading-relaxed">
              {project.description || "No description"}
            </p>
          </div>

          {/* Status badge */}
          <span
            className={cn(
              "ml-3 shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
              status.bg
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        {/* Tech stack tags */}
        {project.techStack.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-cream-dark px-2 py-0.5 text-[10px] font-medium text-muted"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="rounded-md bg-cream-dark px-2 py-0.5 text-[10px] font-medium text-muted-light">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted">Progress</span>
            <span className="text-[11px] font-bold text-navy">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dark">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progress === 100 ? "bg-success" : progress > 0 ? "bg-forest" : "bg-transparent"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <FileText className="h-3.5 w-3.5 text-muted-light" />
            <span className="font-medium text-navy">{project.specCount}</span>
            specs
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Layers className="h-3.5 w-3.5 text-muted-light" />
            <span className="font-medium text-navy">{project.featureCount}</span>
            features
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <ListChecks className="h-3.5 w-3.5 text-muted-light" />
            <span className="font-medium text-navy">
              {project.completedTaskCount}/{project.taskCount}
            </span>
            tasks
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-light">
            <Clock className="h-3 w-3" />
            Updated {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
          {project.githubRepoUrl && (
            <div className="flex items-center gap-1 text-[11px] text-muted-light">
              <GitBranch className="h-3 w-3" />
              Connected
            </div>
          )}
        </div>
      </Link>

      {/* Context menu button */}
      <div className="absolute right-3 top-3">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-light opacity-0 transition-all hover:bg-cream-dark hover:text-navy group-hover:opacity-100 cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-white py-1 shadow-xl shadow-navy/10">
              {[
                { label: "Settings", icon: Settings, href: `/projects/${project.id}/settings` },
                { label: "Star project", icon: Star },
                { label: "Archive", icon: Archive },
                { label: "Delete", icon: Trash2, danger: true },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                    "danger" in item && item.danger
                      ? "text-danger hover:bg-danger-light/30"
                      : "text-muted hover:bg-cream-dark hover:text-navy"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
