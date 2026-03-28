"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  MessageSquare,
  FileText,
  LayoutGrid,
  Rocket,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedSection } from "./animated-section"
import { SectionHeader } from "./section-header"

const STEPS = [
  {
    number: 1,
    title: "Describe Your Idea",
    description:
      "Tell PlanForge what you want to build in plain language. Our AI asks 3-5 smart clarifying questions to eliminate unknowns, define constraints, and nail edge cases — before a single line of code is written.",
    icon: MessageSquare,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    glowColor: "violet",
    tag: "30 seconds",
    preview: (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-cream/50 px-4 py-3">
          <p className="text-[12px] text-navy/80 leading-relaxed">
            &ldquo;I want to build a project management tool with real-time collaboration,
            kanban boards, and AI-powered task suggestions for dev teams&rdquo;
          </p>
        </div>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100">
            <Sparkles className="h-3 w-3 text-violet-600" />
          </div>
          <div className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-[11px] text-navy/70 leading-relaxed">
            What&apos;s the expected team size? Do you need SSO or just email auth? Should boards support custom workflows or fixed columns?
          </div>
        </div>
      </div>
    ),
  },
  {
    number: 2,
    title: "Generate Your Spec",
    description:
      "Get a complete PRD with user personas, feature list, acceptance criteria, technical architecture, and database schema — all structured and editable. No more blank-page syndrome.",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    glowColor: "blue",
    tag: "~15 seconds",
    preview: (
      <div className="space-y-2">
        {[
          { section: "User Personas", status: "done" },
          { section: "Core Features (12)", status: "done" },
          { section: "Acceptance Criteria", status: "done" },
          { section: "Tech Architecture", status: "done" },
          { section: "Database Schema", status: "done" },
          { section: "API Contracts", status: "done" },
        ].map((item, i) => (
          <motion.div
            key={item.section}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between rounded-md border border-border/50 bg-white px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-[11px] font-medium text-navy/80">{item.section}</span>
            </div>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-success">Complete</span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    number: 3,
    title: "Break Into Tasks",
    description:
      "Features automatically decompose into atomic, sequenced tasks. Each task includes an agent-ready prompt with full context, acceptance criteria, file paths, and dependency awareness.",
    icon: LayoutGrid,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    glowColor: "emerald",
    tag: "Auto-sequenced",
    preview: (
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "To Do", count: 6, color: "bg-border" },
          { label: "Ready", count: 4, color: "bg-amber-400" },
          { label: "Done", count: 2, color: "bg-success" },
        ].map((col) => (
          <div key={col.label} className="rounded-md bg-cream/60 p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-navy/60">{col.label}</span>
              <span className="text-[9px] font-bold text-muted">{col.count}</span>
            </div>
            {Array.from({ length: Math.min(col.count, 3) }).map((_, j) => (
              <div key={j} className="mb-1 rounded bg-white border border-border/40 px-2 py-1.5 shadow-xs">
                <div className="mb-1 h-1.5 w-3/4 rounded-full bg-navy/10" />
                <div className="h-1 w-1/2 rounded-full bg-navy/5" />
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    number: 4,
    title: "Dispatch & Ship",
    description:
      "Send tasks to Claude Code, Cursor, or Codex with one click. Monitor all agents in real-time, auto-validate outputs, and retry on failure. Go from plan to production in minutes, not weeks.",
    icon: Rocket,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    glowColor: "pink",
    tag: "One click",
    preview: (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="font-semibold text-navy">Deployment Progress</span>
          <span className="font-bold text-success">12/12 tasks</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full rounded-full bg-linear-to-r from-pink-500 via-violet-500 to-success"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-success/20 bg-success-light/30 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-navy">All tasks complete</div>
            <div className="text-[10px] text-muted">Production audit passed &middot; Ready to deploy</div>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-navy py-1.5 text-[10px] font-semibold text-white">
            <Rocket className="h-3 w-3" /> Deploy Now
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-border bg-white py-1.5 text-[10px] font-medium text-navy">
            View Report
          </div>
        </div>
      </div>
    ),
  },
]

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const Icon = step.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* Connector arrow (not on last step) */}
      {index < STEPS.length - 1 && (
        <div className="absolute -bottom-10 left-1/2 z-10 hidden -translate-x-1/2 lg:block">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white shadow-sm"
          >
            <ArrowDown className="h-3.5 w-3.5 text-muted" />
          </motion.div>
        </div>
      )}

      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border bg-white transition-all duration-500 hover:shadow-xl hover:shadow-navy/[0.06]",
          step.borderColor
        )}
      >
        {/* Top accent bar */}
        <div className={cn("h-1 w-full", step.bgColor)} />

        <div className="grid gap-0 lg:grid-cols-2">
          {/* Content side */}
          <div className="p-7 sm:p-8">
            {/* Step number + tag */}
            <div className="mb-5 flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black",
                  step.bgColor,
                  step.color
                )}
              >
                {String(step.number).padStart(2, "0")}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-cream-dark px-3 py-1">
                <Zap className="h-3 w-3 text-lime" />
                <span className="text-[11px] font-medium text-muted">{step.tag}</span>
              </div>
            </div>

            {/* Title + description */}
            <h3 className="mb-3 text-xl font-bold tracking-tight text-navy sm:text-2xl">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted sm:text-[15px]">
              {step.description}
            </p>

            {/* Icon badge */}
            <div className="mt-6 flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
                  step.bgColor,
                  step.color
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium text-muted-light">
                Step {step.number} of {STEPS.length}
              </span>
            </div>
          </div>

          {/* Preview side */}
          <div className="border-t border-border/50 bg-cream/30 p-6 sm:p-7 lg:border-t-0 lg:border-l">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-light">
                Preview
              </span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-success font-medium">Live</span>
              </div>
            </div>
            {step.preview}
          </div>
        </div>

        {/* Background glow on hover */}
        <div
          className={cn(
            "pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-30",
            step.bgColor
          )}
        />
      </div>
    </motion.div>
  )
}

export function HowItWorksSection() {
  return (
    <AnimatedSection className="bg-white py-24 sm:py-32 border-y border-border">
      <SectionHeader
        overline="How It Works"
        headline="Four Steps from Idea to Shipped Code"
        subtitle="A structured pipeline that turns vague ideas into production-ready implementations — with AI doing the heavy lifting at every stage."
      />

      <div className="space-y-16 lg:space-y-12">
        {STEPS.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>

      {/* Bottom connector */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-14 flex flex-col items-center text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime shadow-lg shadow-lime/20">
          <CheckCircle2 className="h-6 w-6 text-navy" />
        </div>
        <p className="mt-4 text-lg font-bold text-navy">
          Your app is live.
        </p>
        <p className="mt-1 text-sm text-muted">
          Average time from idea to deployed code: <span className="font-semibold text-forest">under 30 minutes</span>.
        </p>
      </motion.div>
    </AnimatedSection>
  )
}
