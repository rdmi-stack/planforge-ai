"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Toast as ToastData, ToastType } from "@/stores/toast-store"
import { useToastStore } from "@/stores/toast-store"

const ICON_MAP: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const STYLE_MAP: Record<ToastType, string> = {
  success: "border-success/30 bg-success-light/60 text-success",
  error: "border-danger/30 bg-danger-light/60 text-danger",
  info: "border-blue-300/30 bg-blue-50/60 text-blue-700",
  warning: "border-amber-300/30 bg-amber-50/60 text-amber-700",
}

export function Toast({ toast }: { toast: ToastData }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const Icon = ICON_MAP[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
        STYLE_MAP[toast.type]
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="ml-2 shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}
