import { create } from "zustand"
import type { Task, TaskStatus } from "@/types/task"

type TaskState = {
  tasks: Task[]
  isLoading: boolean

  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (id: string, status: TaskStatus) => void
  removeTask: (id: string) => void
  reorderTasks: (reordered: Task[]) => void
  setLoading: (loading: boolean) => void
  getTasksByStatus: (status: TaskStatus) => Task[]
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  moveTask: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  reorderTasks: (reordered) => set({ tasks: reordered }),
  setLoading: (isLoading) => set({ isLoading }),
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
}))
