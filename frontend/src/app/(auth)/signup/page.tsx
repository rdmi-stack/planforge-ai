"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [agreed, setAgreed] = useState(false)

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length
  const strengthPercent = (passwordStrength / PASSWORD_RULES.length) * 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError("Please agree to the terms to continue.")
      return
    }
    setError("")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-black tracking-tight text-navy sm:text-3xl">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-muted">
          Start building smarter with AI-powered product planning.
        </p>
      </motion.div>

      {/* OAuth buttons */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-8 grid grid-cols-2 gap-3"
      >
        <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy transition-all hover:bg-cream hover:border-navy/10 cursor-pointer">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-navy transition-all hover:bg-cream hover:border-navy/10 cursor-pointer">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="my-7 flex items-center gap-3"
      >
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-light">or sign up with email</span>
        <div className="h-px flex-1 bg-border" />
      </motion.div>

      {/* Form */}
      <motion.form
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-light/30 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-navy">
            Full name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
              className="w-full rounded-xl border border-border bg-white py-3 pr-4 pl-10 text-sm text-navy outline-none placeholder:text-muted-light transition-all focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold text-navy">
            Work email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-xl border border-border bg-white py-3 pr-4 pl-10 text-sm text-navy outline-none placeholder:text-muted-light transition-all focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold text-navy">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength */}
          {password.length > 0 && (
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
                        rule.test(password)
                          ? "bg-success text-white"
                          : "bg-border text-transparent"
                      )}
                    >
                      <Check className="h-2 w-2" strokeWidth={3} />
                    </div>
                    <span
                      className={cn(
                        "text-[11px] transition-colors",
                        rule.test(password) ? "text-success" : "text-muted-light"
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

        {/* Terms checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={cn(
              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all cursor-pointer",
              agreed
                ? "border-forest bg-forest text-white"
                : "border-border hover:border-muted"
            )}
          >
            {agreed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </button>
          <span className="text-xs text-muted leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-forest hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-forest hover:underline">
              Privacy Policy
            </Link>
          </span>
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
              Create Account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Footer */}
      <motion.p
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mt-8 text-center text-sm text-muted"
      >
        Already have an account?{" "}
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
