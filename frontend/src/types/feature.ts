export type FeatureStatus = "backlog" | "planned" | "in_progress" | "done" | "cut"
export type MvpClassification = "mvp" | "v1" | "v2" | "nice_to_have"
export type PriorityLevel = "critical" | "high" | "medium" | "low"

export type Feature = {
  id: string
  projectId: string
  specId: string | null
  title: string
  description: string
  priorityScore: number
  effortEstimate: number | null
  status: FeatureStatus
  parentFeatureId: string | null
  sortOrder: number
  mvpClassification: MvpClassification
  dependencies: string[]
  childFeatures: Feature[]
  createdAt: string
  updatedAt: string
}

export type FeatureCreate = {
  title: string
  description?: string
  parentFeatureId?: string
  mvpClassification?: MvpClassification
}

export type FeatureUpdate = Partial<FeatureCreate> & {
  status?: FeatureStatus
  sortOrder?: number
  priorityScore?: number
}
