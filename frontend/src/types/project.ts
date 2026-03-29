export type ProjectStatus = "active" | "archived" | "draft"

export type Project = {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  githubRepoUrl: string | null
  techStack: string[]
  orgId: string
  ownerId: string
  specCount: number
  featureCount: number
  taskCount: number
  completedTaskCount: number
  createdAt: string
  updatedAt: string
}

export type ProjectCreate = {
  name: string
  description?: string
  templateId?: string
  githubRepoUrl?: string
  techStack?: string[]
}

export type ProjectUpdate = Partial<ProjectCreate> & {
  status?: ProjectStatus
}
