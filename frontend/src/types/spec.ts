export type SpecStatus = "draft" | "in_review" | "approved" | "archived"

export type Spec = {
  id: string
  projectId: string
  title: string
  content: Record<string, unknown>
  status: SpecStatus
  version: number
  parentSpecId: string | null
  createdAt: string
  updatedAt: string
}

export type SpecVersion = {
  id: string
  specId: string
  versionNumber: number
  content: Record<string, unknown>
  diff: Record<string, unknown> | null
  createdBy: string
  createdAt: string
}

export type SpecCreate = {
  title: string
  content?: Record<string, unknown>
  parentSpecId?: string
}
