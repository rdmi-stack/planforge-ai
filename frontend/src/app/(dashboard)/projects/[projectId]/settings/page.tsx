"use client"

import { ProjectSettingsForm } from "@/components/projects/project-settings-form"
import type { Project } from "@/types/project"

const DEMO_PROJECT: Project = {
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
}

export default function ProjectSettingsPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-navy">
          Project Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Configure your project, integrations, and danger zone.
        </p>
      </div>

      <div className="max-w-2xl">
        <ProjectSettingsForm project={DEMO_PROJECT} />
      </div>
    </div>
  )
}
