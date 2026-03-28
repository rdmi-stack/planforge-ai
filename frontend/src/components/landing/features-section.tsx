"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  ListTree,
  Terminal,
  GitBranch,
  Workflow,
  ShieldCheck,
  ArrowRight,
  MessageSquareText,
  Layers3,
  Code2,
  FolderGit2,
  Bot,
  ScanEye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedSection } from "./animated-section"
import { SectionHeader } from "./section-header"

type Feature = {
  icon: React.ElementType
  accentIcon: React.ElementType
  title: string
  description: string
  detail: string
  color: string
  bgColor: string
  borderColor: string
  preview: React.ReactNode
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    accentIcon: MessageSquareText,
    title: "AI Planning Chat",
    description:
      "Describe your idea in plain English. PlanForge asks smart clarifying questions, then generates a complete product spec.",
    detail: "Catches 95% of edge cases you'd miss",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
    preview: (
      <div className="space-y-3">
        <div className="flex gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">AI</div>
          <div className="rounded-xl rounded-tl-sm bg-violet-50 border border-violet-100 px-3.5 py-2.5 text-[12px] text-navy/80 leading-relaxed">
            What authentication method do you need? Also, should the billing support per-seat pricing or flat-rate?
          </div>
        </div>
        <div className="flex gap-2.5 justify-end">
          <div className="rounded-xl rounded-tr-sm bg-forest/5 border border-forest/10 px-3.5 py-2.5 text-[12px] text-navy/80 leading-relaxed">
            OAuth with Google + GitHub, per-seat billing with annual discount
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/10 text-[10px] font-bold text-forest">U</div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">AI</div>
          <div className="rounded-xl rounded-tl-sm bg-violet-50 border border-violet-100 px-3.5 py-2.5 text-[12px] text-navy/80 leading-relaxed">
            <span className="font-medium text-violet-600">Generating spec...</span> Including SSO flow, Stripe subscription lifecycle, and seat management API.
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: ListTree,
    accentIcon: Layers3,
    title: "Feature Decomposition",
    description:
      "Automatically breaks epics into features, stories, and atomic tasks with dependency mapping and sequencing.",
    detail: "From 1 idea to 50+ atomic tasks in seconds",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    preview: (
      <div className="space-y-2">
        {[
          { label: "Epic: User Management", indent: 0, type: "epic" },
          { label: "Feature: Authentication", indent: 1, type: "feature" },
          { label: "Story: OAuth2 Login Flow", indent: 2, type: "story" },
          { label: "Task: Setup Google OAuth provider", indent: 3, type: "task" },
          { label: "Task: Create auth callback handler", indent: 3, type: "task" },
          { label: "Task: Implement session middleware", indent: 3, type: "task" },
          { label: "Story: Role-Based Access Control", indent: 2, type: "story" },
          { label: "Feature: User Profiles", indent: 1, type: "feature" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2"
            style={{ paddingLeft: `${item.indent * 16}px` }}
          >
            <div className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              item.type === "epic" ? "bg-red-400" :
              item.type === "feature" ? "bg-blue-400" :
              item.type === "story" ? "bg-amber-400" : "bg-emerald-400"
            )} />
            <span className={cn(
              "text-[11px]",
              item.type === "epic" ? "font-semibold text-navy" :
              item.type === "task" ? "text-muted" : "font-medium text-navy/70"
            )}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    icon: Terminal,
    accentIcon: Code2,
    title: "Agent-Ready Prompts",
    description:
      "Every task comes with a context-rich prompt optimized for Claude Code, Cursor, or Codex — so agents build right the first time.",
    detail: "98% first-pass accuracy with generated prompts",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    preview: (
      <div className="rounded-lg bg-navy p-3.5 font-mono text-[10.5px] leading-relaxed">
        <div className="text-muted-light mb-1.5"># Agent Prompt — Task 7/12</div>
        <div className="text-emerald-400 mb-2">## Context</div>
        <div className="text-gray-400 mb-2">
          You are working on <span className="text-amber-300">my-saas-app</span>, a Next.js 15 project with Tailwind v4 and Supabase.
        </div>
        <div className="text-emerald-400 mb-1">## Task</div>
        <div className="text-gray-300 mb-2">
          Create the Stripe webhook handler at <span className="text-sky-300">app/api/webhooks/stripe/route.ts</span>
        </div>
        <div className="text-emerald-400 mb-1">## Acceptance Criteria</div>
        <div className="text-gray-400">
          <span className="text-gray-500">-</span> Handle <span className="text-amber-300">checkout.session.completed</span><br/>
          <span className="text-gray-500">-</span> Verify webhook signature<br/>
          <span className="text-gray-500">-</span> Update user plan in database
        </div>
      </div>
    ),
  },
  {
    icon: GitBranch,
    accentIcon: FolderGit2,
    title: "Codebase Awareness",
    description:
      "Connect your GitHub repo. PlanForge analyzes your existing code so every plan fits your architecture and conventions.",
    detail: "Reads your codebase before generating any plan",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
    preview: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-[11px]">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-medium text-navy">Connected: </span>
          <span className="text-muted font-mono">acme/my-saas-app</span>
        </div>
        <div className="space-y-1.5 rounded-lg border border-border bg-cream/50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-light mb-2">Detected Stack</div>
          {[
            { label: "Next.js 15", tag: "Framework" },
            { label: "Tailwind v4", tag: "Styling" },
            { label: "Supabase", tag: "Database" },
            { label: "TypeScript", tag: "Language" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[11px] text-navy/80">{item.label}</span>
              <span className="rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[9px] font-medium text-orange-600">{item.tag}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-muted">147 files analyzed &middot; 23 components mapped</div>
      </div>
    ),
  },
  {
    icon: Workflow,
    accentIcon: Bot,
    title: "Multi-Agent Orchestration",
    description:
      "Dispatch tasks to multiple AI coding agents in parallel. Built-in validation, retry logic, and progress tracking.",
    detail: "Run 10 agents simultaneously with smart sequencing",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-100",
    preview: (
      <div className="space-y-2">
        {[
          { agent: "Claude Code", task: "Auth middleware", status: "complete", progress: 100 },
          { agent: "Cursor", task: "Dashboard layout", status: "running", progress: 68 },
          { agent: "Codex", task: "API routes", status: "running", progress: 42 },
          { agent: "Claude Code", task: "Stripe integration", status: "queued", progress: 0 },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-white px-3 py-2">
            <div className={cn(
              "h-2 w-2 rounded-full shrink-0",
              item.status === "complete" ? "bg-success" :
              item.status === "running" ? "bg-blue-500 animate-pulse" : "bg-border"
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-navy truncate">{item.task}</span>
                <span className="text-[9px] text-muted ml-2 shrink-0">{item.agent}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    item.status === "complete" ? "bg-success" :
                    item.status === "running" ? "bg-blue-500" : "bg-border"
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: ShieldCheck,
    accentIcon: ScanEye,
    title: "Production Readiness Audit",
    description:
      "Built-in checks ensure your AI-generated code handles errors, security, performance, and edge cases.",
    detail: "12-point audit before any code ships",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    preview: (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-navy">Production Score</span>
          <span className="text-[13px] font-black text-success">94/100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "94%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-linear-to-r from-success to-lime"
          />
        </div>
        <div className="mt-2 space-y-1.5">
          {[
            { check: "Error handling", pass: true },
            { check: "Input validation", pass: true },
            { check: "SQL injection prevention", pass: true },
            { check: "Rate limiting", pass: true },
            { check: "Edge case coverage", pass: false },
            { check: "Load testing", pass: true },
          ].map((item) => (
            <div key={item.check} className="flex items-center gap-2">
              <div className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white",
                item.pass ? "bg-success" : "bg-amber-400"
              )}>
                {item.pass ? "✓" : "!"}
              </div>
              <span className="text-[11px] text-navy/70">{item.check}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export function FeaturesSection() {
  const [active, setActive] = useState(0)

  return (
    <AnimatedSection id="features" className="py-24 sm:py-32">
      <SectionHeader
        overline="What PlanForge Does"
        headline="Stop Prompting Blind. Start Planning Smart."
        subtitle="Every feature designed to close the gap between what you imagine and what AI agents actually build."
      />

      {/* ─── Desktop: Interactive showcase ─── */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Feature list (left) */}
        <div className="col-span-5 space-y-2">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            const isActive = active === i
            return (
              <motion.button
                key={feature.title}
                onClick={() => setActive(i)}
                whileHover={{ x: 4 }}
                className={cn(
                  "group flex w-full items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-300 cursor-pointer",
                  isActive
                    ? `${feature.borderColor} bg-white shadow-lg shadow-navy/[0.04]`
                    : "border-transparent hover:border-border hover:bg-white/60"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                    isActive
                      ? `${feature.bgColor} ${feature.color}`
                      : "bg-cream-dark text-muted group-hover:bg-cream group-hover:text-navy"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h3
                    className={cn(
                      "text-sm font-bold transition-colors",
                      isActive ? "text-navy" : "text-navy/70 group-hover:text-navy"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-0.5 text-xs leading-relaxed transition-colors",
                      isActive ? "text-muted" : "text-muted-light"
                    )}
                  >
                    {feature.description}
                  </p>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2 flex items-center gap-1.5"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-success" />
                      <span className="text-[11px] font-medium text-forest">
                        {feature.detail}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Preview panel (right) */}
        <div className="col-span-7 relative">
          <div className="sticky top-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "rounded-2xl border p-6 bg-white shadow-xl shadow-navy/[0.06]",
                  FEATURES[active].borderColor
                )}
              >
                {/* Preview header */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        FEATURES[active].bgColor,
                        FEATURES[active].color
                      )}
                    >
                      {(() => {
                        const AccentIcon = FEATURES[active].accentIcon
                        return <AccentIcon className="h-4 w-4" strokeWidth={2} />
                      })()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy">
                        {FEATURES[active].title}
                      </h4>
                      <p className="text-[11px] text-muted">Live preview</p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      FEATURES[active].bgColor,
                      FEATURES[active].color
                    )}
                  >
                    Interactive
                  </div>
                </div>

                {/* Divider */}
                <div className={cn("mb-5 h-px", FEATURES[active].borderColor.replace("border", "bg"))} />

                {/* Preview content */}
                <div className="min-h-[260px]">
                  {FEATURES[active].preview}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Background glow */}
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-linear-to-br from-lime/5 via-transparent to-forest/5 blur-xl" />
          </div>
        </div>
      </div>

      {/* ─── Mobile/Tablet: Card grid ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all hover:shadow-lg hover:shadow-navy/[0.04]",
                feature.borderColor
              )}
            >
              {/* Accent corner */}
              <div className={cn("absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-30", feature.bgColor)} />

              <div
                className={cn(
                  "relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-all",
                  feature.bgColor,
                  feature.color
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="relative mb-1.5 text-base font-bold text-navy">
                {feature.title}
              </h3>
              <p className="relative text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
              <div className="relative mt-3 flex items-center gap-1.5 text-[11px] font-medium text-forest">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                {feature.detail}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ─── Bottom stats bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-border bg-white p-6"
      >
        {[
          { value: "50K+", label: "Tasks Generated" },
          { value: "98%", label: "First-Pass Accuracy" },
          { value: "10x", label: "Faster Planning" },
          { value: "< 30s", label: "Spec Generation" },
        ].map((stat, i) => (
          <div key={stat.label} className={cn(
            "text-center py-2",
            i < 3 && "sm:border-r sm:border-border"
          )}>
            <div className="text-2xl font-black text-navy sm:text-3xl">{stat.value}</div>
            <div className="mt-1 text-xs font-medium text-muted">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </AnimatedSection>
  )
}
