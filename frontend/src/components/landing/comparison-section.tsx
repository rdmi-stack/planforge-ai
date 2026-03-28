"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  X,
  Check,
  AlertTriangle,
  Clock,
  Bug,
  RefreshCcw,
  Brain,
  ArrowRight,
  Shuffle,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Table-style comparison rows ─── */
const COMPARISONS = [
  {
    category: "Planning",
    old: "Copy-paste vague prompts from Notion docs",
    new: "AI-generated structured specs with acceptance criteria",
    icon: Brain,
  },
  {
    category: "Task Scoping",
    old: "\"Just build the auth\" — a single, impossible prompt",
    new: "15 atomic tasks, sequenced with dependency graph",
    icon: Target,
  },
  {
    category: "Context",
    old: "Agent has no idea about your codebase or stack",
    new: "Every prompt includes file paths, conventions, patterns",
    icon: Shuffle,
  },
  {
    category: "Failures",
    old: "Manually re-prompt 5-10 times per feature",
    new: "98% first-pass accuracy with auto-validation",
    icon: RefreshCcw,
  },
  {
    category: "Quality",
    old: "Prototype-grade code ships to production",
    new: "12-point production audit before any code ships",
    icon: Bug,
  },
  {
    category: "Speed",
    old: "2-3 days from idea to first working code",
    new: "Under 30 minutes from idea to deployed feature",
    icon: Clock,
  },
]

/* ─── Animated counter ─── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const [displayed, setDisplayed] = useState(0)

  return (
    <motion.span
      ref={ref}
      onViewportEnter={() => {
        let start = 0
        const step = value / 30
        const timer = setInterval(() => {
          start += step
          if (start >= value) {
            setDisplayed(value)
            clearInterval(timer)
          } else {
            setDisplayed(Math.floor(start))
          }
        }, 25)
      }}
      className="tabular-nums"
    >
      {displayed}
      {suffix}
    </motion.span>
  )
}

export function ComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-navy py-24 px-4 sm:py-32 sm:px-6 lg:px-8"
    >
      {/* Parallax background texture */}
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-danger/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-lime/8 blur-[120px]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header — no SectionHeader reuse, fully custom */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-danger-light">
            <AlertTriangle className="h-3 w-3" />
            The Problem
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-5 max-w-3xl text-center text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          AI Agents Are Powerful.
          <br />
          <span className="text-muted-light">Without a Plan, They&apos;re Chaos.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-16 max-w-xl text-center text-base text-muted-light"
        >
          See the difference structured planning makes at every stage of the development process.
        </motion.p>

        {/* ─── Comparison table ─── */}
        <div className="overflow-hidden rounded-2xl border border-border-dark bg-navy-light">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border-dark px-6 py-4 sm:grid-cols-[180px_1fr_1fr]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-light" />
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-danger/80">
              <div className="h-2 w-2 rounded-full bg-danger/50" />
              Without PlanForge
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-lime/80">
              <div className="h-2 w-2 rounded-full bg-lime/50" />
              With PlanForge
            </div>
          </div>

          {/* Rows */}
          {COMPARISONS.map((row, i) => {
            const Icon = row.icon
            return (
              <motion.div
                key={row.category}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "group grid grid-cols-[1fr_1fr_1fr] gap-x-4 px-6 py-5 transition-colors hover:bg-white/[0.03] sm:grid-cols-[180px_1fr_1fr]",
                  i < COMPARISONS.length - 1 && "border-b border-border-dark/50"
                )}
              >
                {/* Category */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border-dark bg-navy text-muted-light transition-colors group-hover:border-lime/20 group-hover:text-lime">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white/70 sm:text-sm">
                    {row.category}
                  </span>
                </div>

                {/* Old way */}
                <div className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-danger/60" />
                  <span className="text-xs text-white/40 leading-relaxed sm:text-sm">{row.old}</span>
                </div>

                {/* New way */}
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                  <span className="text-xs text-white/80 leading-relaxed sm:text-sm">{row.new}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ─── Impact stats ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { value: 98, suffix: "%", label: "First-Pass Success", color: "text-lime" },
            { value: 10, suffix: "x", label: "Faster Than Manual", color: "text-blue-400" },
            { value: 80, suffix: "%", label: "Fewer Agent Retries", color: "text-violet-400" },
            { value: 0, suffix: "", label: "Regressions Shipped", color: "text-emerald-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border-dark bg-white/[0.03] px-4 py-5 text-center backdrop-blur-sm"
            >
              <div className={cn("text-3xl font-black sm:text-4xl", stat.color)}>
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-[11px] font-medium text-muted-light">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <button className="group flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-navy transition-all hover:shadow-lg hover:shadow-lime/20 cursor-pointer">
            See PlanForge in action
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
