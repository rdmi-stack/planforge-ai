"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Loader2,
  Check,
  CheckCircle2,
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

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
]

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(newPassword)).length
  const strengthPercent = (passwordStrength / PASSWORD_RULES.length) * 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Missing reset token. Please use the link from your email.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (passwordStrength < PASSWORD_RULES.length) {
      setError("Please meet all password requirements.")
      return
    }

    setLoading(true)

    try {
      await apiPost("/auth/reset-password", {
        token,
        new_password: newPassword,
      })
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-navy sm:text-3xl">
            Password updated
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-forest shadow-lg shadow-navy/10"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-black tracking-tight text-navy sm:text-3xl">
          Set new password
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter your new password below. Make sure it meets all the requirements.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        custom={1}
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

        {/* New Password */}
        <div>
          <label
            htmlFor="new-password"
            className="mb-1.5 block text-xs font-semibold text-navy"
          >
            New password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              className="w-full rounded-xl border border-border bg-white py-3 pr-11 pl-10 text-sm text-navy outline-none placeholder:text-muted-light transition-all focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-light hover:text-navy transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password strength */}
          {newPassword.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 space-y-2"
            >
              <div className="flex gap-1">
                {PASSWORD_RULES.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-300",
                      i < passwordStrength
                        ? passwordStrength === PASSWORD_RULES.length
                          ? "bg-success"
                          : passwordStrength >= 2
                            ? "bg-amber-400"
                            : "bg-danger"
                        : "bg-border"
                    )}
                  />
                ))}
              </div>
              <div className="space-y-1">
                {PASSWORD_RULES.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded-full transition-colors",
                        rule.test(newPassword)
                          ? "bg-success text-white"
                          : "bg-border text-transparent"
                      )}
                    >
                      <Check className="h-2 w-2" strokeWidth={3} />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] transition-colors",
                        rule.test(newPassword) ? "text-success" : "text-muted-light"
                      )}
                    >
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-xs font-semibold text-navy"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className={cn(
                "w-full rounded-xl border bg-white py-3 pr-11 pl-10 text-sm text-navy outline-none placeholder:text-muted-light transition-all focus:ring-2",
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? "border-danger/40 focus:border-danger/50 focus:ring-danger/10"
                  : "border-border focus:border-forest/30 focus:ring-forest/10"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-light hover:text-navy transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
            <p className="mt-1.5 text-[11px] text-danger">
              Passwords do not match
            </p>
          )}
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
              Reset Password
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Footer */}
      <motion.p
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-8 text-center text-sm text-muted"
      >
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-forest hover:text-forest-light transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
