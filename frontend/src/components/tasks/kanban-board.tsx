"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskCard } from "./task-card"
import type { Task, TaskStatus } from "@/types/task"

type Column = {
  id: TaskStatus
  title: string
  color: string
  dotColor: string
}

const COLUMNS: Column[] = [
  { id: "backlog", title: "Backlog", color: "border-t-muted-light", dotColor: "bg-muted-light" },
  { id: "ready", title: "Ready", color: "border-t-blue-400", dotColor: "bg-blue-400" },
  { id: "in_progress", title: "In Progress", color: "border-t-amber-400", dotColor: "bg-amber-400" },
  { id: "in_review", title: "In Review", color: "border-t-violet-400", dotColor: "bg-violet-400" },
  { id: "done", title: "Done", color: "border-t-success", dotColor: "bg-success" },
]

type KanbanBoardProps = {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
}

export function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const getTasksByStatus = (status: TaskStatus) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDrop = (columnId: TaskStatus) => {
    if (draggedTask) {
      onStatusChange?.(draggedTask, columnId)
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnTasks = getTasksByStatus(column.id)
        const isOver = dragOverColumn === column.id

        return (
          <div
            key={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={() => handleDrop(column.id)}
            onDragLeave={() => setDragOverColumn(null)}
            className={cn(
              "flex w-[280px] shrink-0 flex-col rounded-xl border-t-2 bg-cream/40 transition-colors",
              column.color,
              isOver && "bg-forest/5 ring-1 ring-forest/20"
            )}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", column.dotColor)} />
                <span className="text-xs font-bold text-navy">{column.title}</span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-muted shadow-xs">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <button className="flex h-6 w-6 items-center justify-center rounded text-muted-light hover:text-navy transition-colors cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-6 w-6 items-center justify-center rounded text-muted-light hover:text-navy transition-colors cursor-pointer">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-2 px-2 pb-3 min-h-[100px]">
              <AnimatePresence>
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={() => {
                      setDraggedTask(null)
                      setDragOverColumn(null)
                    }}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      isDragging={draggedTask === task.id}
                    />
                  </div>
                ))}
              </AnimatePresence>

              {columnTasks.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-[11px] text-muted-light">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
