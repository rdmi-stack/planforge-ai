"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeyRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiPost, ApiError } from "@/lib/api-client"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: "easeOut" },
  }),
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await apiPost("/auth/forgot-password", { email })
      setSent(true)
    } catch (err) {
      if (err instanceof ApiError) {
        // Even on error we show success to avoid email enumeration,
        // unless the backend explicitly returns a user-facing message.
        if (err.status === 422) {
          setError(err.detail)
        } else {
          setSent(true)
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Back link */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <Link
                href="/login"
                className="mb-8 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-navy transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cream-dark border border-border">
                <KeyRound className="h-5 w-5 text-forest" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-navy sm:text-3xl">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Enter the email address associated with your account and
                we&apos;ll send you a link to reset your password.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="mt-8 space-y-4"
            >
              {error && (
                <div className="rounded-lg border border-danger/20 bg-danger-light/30 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-xs font-semibold text-navy">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-border bg-white py-3 pr-4 pl-10 text-sm text-navy outline-none placeholder:text-muted-light transition-all focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? {} : { scale: 1.01 }}
                whileTap={loading ? {} : { scale: 0.99 }}
                className={cn(
                  "group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all cursor-pointer",
                  loading
                    ? "bg-navy/70 text-white/70"
                    : "bg-navy text-white hover:bg-forest shadow-lg shadow-navy/10"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Help text */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 rounded-xl border border-border bg-cream/50 p-4"
            >
              <p className="text-xs text-muted leading-relaxed">
                <span className="font-semibold text-navy">Tip: </span>
                Check your spam folder if you don&apos;t see the email within a
                few minutes. The link expires after 1 hour.
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* ─── Success state ─── */
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            {/* Animated check */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-success-light border border-success/20"
            >
              <CheckCircle2 className="h-8 w-8 text-success" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black tracking-tight text-navy"
            >
              Check your email
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-3 text-sm text-muted leading-relaxed"
            >
              We&apos;ve sent a password reset link to
              <br />
              <span className="font-semibold text-navy">{email}</span>
            </motion.p>

            {/* Email preview mock */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-8 max-w-[320px] overflow-hidden rounded-xl border border-border bg-white shadow-lg shadow-navy/5"
            >
              <div className="flex items-center gap-2 border-b border-border bg-cream/50 px-4 py-2.5">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-danger/40" />
                  <div className="h-2 w-2 rounded-full bg-amber-400/40" />
                  <div className="h-2 w-2 rounded-full bg-success/40" />
                </div>
                <span className="text-[10px] text-muted">Inbox</span>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/10">
                    <div className="flex items-center gap-px">
                      <div className="h-3 w-0.5 rounded-sm bg-forest" />
                      <div className="h-2 w-0.5 rounded-sm bg-forest" />
                      <div className="h-3 w-0.5 rounded-sm bg-forest" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-navy">PlanForge</span>
                      <span className="text-[10px] text-muted-light">Just now</span>
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-navy/80">
                      Reset your password
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-light truncate">
                      Click the link below to set a new password for your account...
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 space-y-3"
            >
              <button
                onClick={() => {
                  setSent(false)
                  setEmail("")
                }}
                className="text-sm font-medium text-forest hover:text-forest-light transition-colors cursor-pointer"
              >
                Didn&apos;t receive it? Try again
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-light">
                <span>&middot;</span>
                <Link
                  href="/login"
                  className="font-medium text-muted hover:text-navy transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
