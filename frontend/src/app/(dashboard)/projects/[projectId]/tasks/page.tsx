"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ListChecks,
  Plus,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
  Bot,
  Loader2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { KanbanBoard } from "@/components/tasks/kanban-board"
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel"
import { AgentDispatchButton } from "@/components/tasks/agent-dispatch-button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageSkeleton } from "@/components/shared/loading-skeleton"
import { apiClientAuth } from "@/lib/api-client"
import type { Task, TaskStatus } from "@/types/task"

type BackendTask = {
  id: string
  feature_id: string
  project_id: string
  title: string
  description: string
  prompt_text: string
  acceptance_criteria: string[]
  status: string
  sequence_order: number
  regression_risk: string
  estimated_minutes: number | null
  agent_type: string | null
  agent_run_id: string | null
  created_at: string
  updated_at: string
}

function mapBackendTask(t: BackendTask): Task {
  return {
    id: t.id,
    featureId: t.feature_id ?? "",
    projectId: t.project_id ?? "",
    title: t.title,
    description: t.description ?? "",
    promptText: t.prompt_text ?? "",
    acceptanceCriteria: t.acceptance_criteria ?? [],
    status: (t.status as TaskStatus) ?? "backlog",
    sequenceOrder: t.sequence_order ?? 0,
    regressionRisk: (t.regression_risk as Task["regressionRisk"]) ?? "low",
    estimatedMinutes: t.estimated_minutes,
    agentType: t.agent_type as Task["agentType"] ?? null,
    agentRunId: t.agent_run_id,
    createdAt: t.created_at ?? "",
    updatedAt: t.updated_at ?? "",
  }
}

export default function TasksPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [addingTask, setAddingTask] = useState(false)

  const fetchTasks = useCallback(async () => {
    try {
      setError(null)
      const data = await apiClientAuth<BackendTask[] | { data: BackendTask[] }>(
        `/projects/${projectId}/tasks`
      )
      const list = Array.isArray(data) ? data : (data.data ?? [])
      setTasks(list.map(mapBackendTask))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
    try {
      await apiClientAuth(`/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
      })
    } catch {
      // Revert on failure
      fetchTasks()
    }
  }

  const handleGenerateTasks = async () => {
    setGenerating(true)
    try {
      await apiClientAuth(`/projects/${projectId}/tasks/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      await fetchTasks()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate tasks. The backend endpoint may not be available yet.")
    } finally {
      setGenerating(false)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return
    setAddingTask(true)
    try {
      await apiClientAuth(`/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle.trim(), description: newTaskDesc.trim() }),
      })
      setNewTaskTitle("")
      setNewTaskDesc("")
      setShowAddDialog(false)
      await fetchTasks()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add task")
    } finally {
      setAddingTask(false)
    }
  }

  if (loading) {
    return <PageSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="text-sm font-medium text-danger">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchTasks() }}
            className="mt-3 text-xs font-medium text-danger underline hover:no-underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-navy">Task Board</h1>
          <p className="mt-1 text-sm text-muted">No tasks yet</p>
        </div>
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Generate tasks from specs or features using AI, or create them manually."
          action={
            <button
              onClick={handleGenerateTasks}
              disabled={generating}
              className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer disabled:opacity-60">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generating..." : "AI Generate Tasks"}
            </button>
          }
        />
      </div>
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
          <button
            onClick={handleGenerateTasks}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-forest/10 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer disabled:opacity-60">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Generating..." : "AI Generate Tasks"}
          </button>
          <AgentDispatchButton taskId="batch" projectId={projectId} />
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer">
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

      {/* Add Task Dialog */}
      {showAddDialog && (
        <>
          <div className="fixed inset-0 z-40 bg-navy/20" onClick={() => setShowAddDialog(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-navy">Add Task</h3>
                <button onClick={() => setShowAddDialog(false)} className="text-muted hover:text-navy cursor-pointer"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy">Title</label>
                  <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task title"
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-navy">Description</label>
                  <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Describe the task..." rows={3}
                    className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10 resize-none" />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowAddDialog(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleAddTask} disabled={addingTask || !newTaskTitle.trim()} className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer disabled:opacity-60">
                  {addingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {addingTask ? "Adding..." : "Add Task"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
