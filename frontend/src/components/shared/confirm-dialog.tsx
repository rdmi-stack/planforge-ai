"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-navy/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-white p-6 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted hover:text-navy transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            {variant === "danger" && (
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <AlertTriangle className="h-5 w-5" />
              </div>
            )}

            {/* Content */}
            <h3 className="text-lg font-bold text-navy">{title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {description}
            </p>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-cream transition-colors cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors cursor-pointer",
                  variant === "danger"
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-navy hover:bg-forest"
                )}
              >
                {loading ? "..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
