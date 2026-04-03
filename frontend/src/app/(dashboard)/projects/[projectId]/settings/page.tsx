"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { ProjectSettingsForm } from "@/components/projects/project-settings-form"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"
import type { Project } from "@/types/project"

type BackendProject = {
  id: string
  name: string
  description: string | null
  status: string
  github_repo_url: string | null
  tech_stack: string[]
  org_id: string
  owner_id: string
  spec_count: number
  feature_count: number
  task_count: number
  completed_task_count: number
  created_at: string
  updated_at: string
}

function mapBackendProject(bp: BackendProject): Project {
  return {
    id: bp.id,
    name: bp.name,
    description: bp.description,
    status: bp.status as Project["status"],
    githubRepoUrl: bp.github_repo_url,
    techStack: bp.tech_stack ?? [],
    orgId: bp.org_id,
    ownerId: bp.owner_id,
    specCount: bp.spec_count ?? 0,
    featureCount: bp.feature_count ?? 0,
    taskCount: bp.task_count ?? 0,
    completedTaskCount: bp.completed_task_count ?? 0,
    createdAt: bp.created_at,
    updatedAt: bp.updated_at,
  }
}

export default function ProjectSettingsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const addToast = useToastStore((s) => s.addToast)

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchProject() {
      setLoading(true)
      setError(null)
      try {
        const data = await apiClientAuth<{ data: BackendProject }>(
          `/projects/${projectId}`
        )
        if (cancelled) return
        const bp = data.data ?? (data as unknown as BackendProject)
        setProject(mapBackendProject(bp))
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Failed to load project"
        setError(message)
        addToast(message, "error")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProject()
    return () => { cancelled = true }
  }, [projectId, addToast])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <AlertCircle className="h-8 w-8 text-danger mb-3" />
        <h2 className="text-lg font-bold text-navy mb-1">Failed to load project</h2>
        <p className="text-sm text-muted">{error || "Project not found"}</p>
      </div>
    )
  }

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
        <ProjectSettingsForm project={project} />
      </div>
    </div>
  )
}
