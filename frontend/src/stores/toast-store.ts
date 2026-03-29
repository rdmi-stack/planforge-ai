import { create } from "zustand"

export type ToastType = "success" | "error" | "info" | "warning"

export type Toast = {
  id: string
  message: string
  type: ToastType
  createdAt: number
}

type ToastStore = {
  toasts: Toast[]
  addToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

let toastCounter = 0

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = `toast-${++toastCounter}-${Date.now()}`
    const toast: Toast = { id, message, type, createdAt: Date.now() }

    set((state) => ({
      toasts: [...state.toasts.slice(-2), toast],
    }))

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
