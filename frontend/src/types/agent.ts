export type AgentRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled"

export type AgentRun = {
  id: string
  taskId: string
  agentType: string
  status: AgentRunStatus
  startedAt: string | null
  completedAt: string | null
  outputLog: string
  validationResult: {
    passed: boolean
    checks: { name: string; passed: boolean; message: string }[]
  } | null
  retryCount: number
}

export type DecisionLog = {
  id: string
  projectId: string
  decision: string
  reasoning: string
  alternatives: string[]
  madeBy: string
  createdAt: string
}

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export type ChatSession = {
  id: string
  projectId: string
  userId: string
  messages: ChatMessage[]
  sessionType: "planning" | "refinement" | "architecture"
  createdAt: string
}
