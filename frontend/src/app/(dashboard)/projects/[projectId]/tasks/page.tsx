"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ListChecks,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel"
import { AgentDispatchButton } from "@/components/tasks/agent-dispatch-button"
import type { Task, TaskStatus } from "@/types/task"

const DEMO_TASKS: Task[] = [
  {
    id: "t1", featureId: "f1", projectId: "p1", title: "Setup Google OAuth provider",
    description: "Configure NextAuth.js with Google OAuth credentials and callback URL.",
    promptText: "## Context\nYou are working on a Next.js 16 app with NextAuth v5.\n\n## Task\nSetup Google OAuth provider in app/api/auth/[...nextauth]/route.ts\n\n## Requirements\n- Configure Google provider with client ID/secret from env vars\n- Setup callback URL handling\n- Create user record on first login",
    acceptanceCriteria: ["Google login button works", "User record created on first login", "Session persisted across page loads"],
    status: "done", sequenceOrder: 1, regressionRisk: "low", estimatedMinutes: 30,
    agentType: "claude_code", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t2", featureId: "f1", projectId: "p1", title: "Setup GitHub OAuth provider",
    description: "Add GitHub as an OAuth provider alongside Google.",
    promptText: "## Task\nAdd GitHub OAuth provider to the existing NextAuth configuration.\n\n## Requirements\n- Add GitHub provider with env vars\n- Handle email scope for users without public email",
    acceptanceCriteria: ["GitHub login works", "Handles users without public email"],
    status: "done", sequenceOrder: 2, regressionRisk: "low", estimatedMinutes: 20,
    agentType: "claude_code", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t3", featureId: "f1", projectId: "p1", title: "Implement RBAC middleware",
    description: "Create role-based access control with owner, admin, member, viewer roles.",
    promptText: "## Task\nImplement RBAC middleware for the FastAPI backend.\n\n## Requirements\n- Define roles: owner, admin, member, viewer\n- Create Depends() for role checking\n- Apply to all protected routes",
    acceptanceCriteria: ["Roles enforced on all endpoints", "Owner can manage billing", "Viewer is read-only"],
    status: "in_progress", sequenceOrder: 3, regressionRisk: "high", estimatedMinutes: 60,
    agentType: "claude_code", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t4", featureId: "f2", projectId: "p1", title: "Create planning chat endpoint",
    description: "SSE streaming endpoint for AI planning conversation.",
    promptText: "## Task\nCreate POST /api/v1/projects/{id}/chat endpoint with SSE streaming.\n\n## Requirements\n- Accept messages array\n- Stream Claude responses via text/event-stream\n- Include project context in system prompt",
    acceptanceCriteria: ["Streams response in real-time", "Handles conversation history", "Rate limited to 20/min"],
    status: "in_progress", sequenceOrder: 4, regressionRisk: "medium", estimatedMinutes: 45,
    agentType: "cursor", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t5", featureId: "f2", projectId: "p1", title: "Build smart questions engine",
    description: "Generate contextual follow-up questions based on user's idea description.",
    promptText: "## Task\nBuild the smart questions service in backend/app/services/.\n\n## Requirements\n- Analyze user input for gaps\n- Generate 3-5 targeted questions\n- Cover: users, scale, auth, data, integrations",
    acceptanceCriteria: ["3-5 questions per input", "Questions are specific, not generic", "Edge cases covered"],
    status: "ready", sequenceOrder: 5, regressionRisk: "low", estimatedMinutes: 35,
    agentType: "claude_code", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t6", featureId: "f3", projectId: "p1", title: "Build Tiptap spec editor component",
    description: "Rich text editor with toolbar for spec writing.",
    promptText: "## Task\nCreate SpecEditor component with Tiptap.\n\n## Requirements\n- Toolbar: bold, italic, headings, lists, code blocks\n- Save/load content as HTML\n- AI generate button in toolbar",
    acceptanceCriteria: ["All formatting options work", "Content saves correctly", "Responsive layout"],
    status: "ready", sequenceOrder: 6, regressionRisk: "low", estimatedMinutes: 40,
    agentType: null, agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t7", featureId: "f3", projectId: "p1", title: "Implement spec version history",
    description: "Track changes between spec versions with diff view.",
    promptText: "## Task\nAdd version tracking to specs with diff comparison.\n\n## Requirements\n- Create spec_versions table\n- Generate diff JSON on save\n- Side-by-side diff viewer component",
    acceptanceCriteria: ["Versions saved on each edit", "Diff shows added/removed", "Can restore old versions"],
    status: "ready", sequenceOrder: 7, regressionRisk: "medium", estimatedMinutes: 50,
    agentType: "codex", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t8", featureId: "f4", projectId: "p1", title: "Create feature decomposition service",
    description: "AI service to break specs into hierarchical features.",
    promptText: "## Task\nBuild feature_decomposer.py service.\n\n## Requirements\n- Takes spec content as input\n- Outputs hierarchical feature tree\n- Each feature has: title, description, MVP classification, effort estimate",
    acceptanceCriteria: ["Produces valid feature hierarchy", "MVP/V1/V2 classification", "Effort estimates included"],
    status: "backlog", sequenceOrder: 8, regressionRisk: "medium", estimatedMinutes: 55,
    agentType: "claude_code", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t9", featureId: "f5", projectId: "p1", title: "Build kanban board component",
    description: "Drag-and-drop kanban board for task management.",
    promptText: "## Task\nCreate KanbanBoard component with drag-and-drop.\n\n## Requirements\n- Columns: Backlog, Ready, In Progress, In Review, Done\n- Drag cards between columns\n- Column task counts",
    acceptanceCriteria: ["Drag and drop works", "Status updates on drop", "Responsive on tablet+"],
    status: "backlog", sequenceOrder: 9, regressionRisk: "low", estimatedMinutes: 45,
    agentType: null, agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t10", featureId: "f6", projectId: "p1", title: "Create agent orchestrator service",
    description: "Multi-agent dispatch with validation and retry logic.",
    promptText: "## Task\nBuild agent_orchestrator.py in backend/app/services/.\n\n## Requirements\n- Dispatch tasks to configured agents\n- Validate output against acceptance criteria\n- Retry up to 3 times on failure\n- Track agent_runs status",
    acceptanceCriteria: ["Dispatches to correct agent", "Validates output", "Retries on failure", "Tracks run history"],
    status: "backlog", sequenceOrder: 10, regressionRisk: "high", estimatedMinutes: 90,
    agentType: "claude_code", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t11", featureId: "f7", projectId: "p1", title: "Setup Stripe integration",
    description: "Connect Stripe for subscription billing with webhooks.",
    promptText: "## Task\nSetup Stripe billing.\n\n## Requirements\n- Create Stripe customers on signup\n- Checkout session for plan upgrades\n- Webhook handler for subscription events",
    acceptanceCriteria: ["Checkout flow works", "Webhooks handle all events", "Plan changes reflected immediately"],
    status: "backlog", sequenceOrder: 11, regressionRisk: "medium", estimatedMinutes: 60,
    agentType: "windsurf", agentRunId: null, createdAt: "", updatedAt: "",
  },
  {
    id: "t12", featureId: "f8", projectId: "p1", title: "Build GitHub repo analyzer",
    description: "Analyze connected GitHub repos for tech stack and conventions.",
    promptText: "## Task\nBuild codebase_analyzer.py.\n\n## Requirements\n- Clone/fetch repo contents via GitHub API\n- Detect tech stack from package.json, pyproject.toml, etc.\n- Extract naming conventions and file structure",
    acceptanceCriteria: ["Detects framework, language, DB", "Maps file structure", "Runs in under 30s"],
    status: "backlog", sequenceOrder: 12, regressionRisk: "low", estimatedMinutes: 50,
    agentType: "claude_code", agentRunId: null, createdAt: "", updatedAt: "",
  },
]

export default function TasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState(DEMO_TASKS)

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
  }

  const statusCounts = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-navy">Task Board</h1>
          <p className="mt-1 text-sm text-muted">
            {statusCounts.total} tasks &middot; {statusCounts.done} done &middot; {statusCounts.inProgress} in progress
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer">
            <Sparkles className="h-4 w-4" />
            AI Generate Tasks
          </button>
          <AgentDispatchButton taskId="batch" />
          <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 rounded-xl border border-border bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-muted">Sprint Progress</span>
          <span className="font-bold text-navy">
            {Math.round((statusCounts.done / statusCounts.total) * 100)}% complete
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
          <div
            className="h-full rounded-full bg-linear-to-r from-forest to-lime transition-all duration-500"
            style={{ width: `${(statusCounts.done / statusCounts.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Kanban */}
      <KanbanBoard
        tasks={tasks}
        onTaskClick={setSelectedTask}
        onStatusChange={handleStatusChange}
      />

      {/* Task detail panel */}
      <AnimatePresence>
        {selectedTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="fixed inset-0 z-40 bg-navy/20"
            />
            <TaskDetailPanel
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
