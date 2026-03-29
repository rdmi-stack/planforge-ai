export type TaskStatus = "backlog" | "ready" | "in_progress" | "in_review" | "done" | "blocked"
export type AgentType = "claude_code" | "cursor" | "codex" | "windsurf" | "manual"
export type RegressionRisk = "low" | "medium" | "high"

export type Task = {
  id: string
  featureId: string
  projectId: string
  title: string
  description: string
  promptText: string
  acceptanceCriteria: string[]
  status: TaskStatus
  sequenceOrder: number
  regressionRisk: RegressionRisk
  estimatedMinutes: number | null
  agentType: AgentType | null
  agentRunId: string | null
  createdAt: string
  updatedAt: string
}

export type TaskCreate = {
  title: string
  description?: string
  featureId: string
  agentType?: AgentType
}

export type TaskUpdate = Partial<TaskCreate> & {
  status?: TaskStatus
  sequenceOrder?: number
  promptText?: string
  acceptanceCriteria?: string[]
}
