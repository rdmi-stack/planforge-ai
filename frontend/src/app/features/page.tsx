"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Code2,
  Cpu,
  FileText,
  GitBranch,
  GitMerge,
  Globe,
  Layers,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Network,
  Play,
  Rocket,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  TreePine,
  TriangleAlert,
  Workflow,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/landing/navbar"

/* ═══════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ═══════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgba(26,58,42,0.03)_1px,_transparent_1px),linear-gradient(to_bottom,_rgba(26,58,42,0.03)_1px,_transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp}>
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-forest"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-4 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl lg:text-6xl"
          >
            Everything You Need to{" "}
            <span className="bg-linear-to-r from-forest via-forest-light to-forest bg-clip-text text-transparent">
              Plan, Build, and Ship
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl"
          >
            PlanForge is the AI planning engine that turns raw ideas into production-ready
            code. From spec generation to multi-agent dispatch, every step is automated,
            auditable, and built for real engineering teams.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-forest-light hover:shadow-xl"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-7 py-3.5 text-sm font-semibold text-navy shadow-xs transition-all hover:border-forest/30 hover:shadow-md">
              <Play className="h-4 w-4 text-forest" />
              Watch Demo
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 2 — CORE FEATURE DEEP DIVES
   ═══════════════════════════════════════════ */

/* --- Visual Mocks ------------------------------------------------- */

function ChatMock() {
  const msgs = [
    {
      from: "ai",
      text: "What problem does your product solve? Who is the primary user?",
    },
    {
      from: "user",
      text: "We need an internal tool for sales teams to auto-generate proposals from CRM data.",
    },
    {
      from: "ai",
      text: "Got it. What CRM are you using? And should the proposals follow a specific template, or generate dynamically?",
    },
    {
      from: "user",
      text: "HubSpot. Dynamic generation based on deal stage, but we have a brand guide for formatting.",
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white">
          <Brain className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-navy">AI Planning Chat</span>
        <span className="ml-auto rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
          Active
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
              m.from === "ai"
                ? "self-start bg-cream-dark text-navy"
                : "self-end bg-forest text-white"
            )}
          >
            {m.text}
          </div>
        ))}
        <div className="mt-1 flex items-center gap-1.5 self-start">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest [animation-delay:150ms]" />
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-forest [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function SpecDocMock() {
  const sections = [
    { label: "Overview", status: "complete" },
    { label: "User Stories", status: "complete" },
    { label: "Functional Requirements", status: "complete" },
    { label: "API Contracts", status: "complete" },
    { label: "Data Model", status: "generating" },
    { label: "Non-Functional Reqs", status: "pending" },
  ]

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white">
          <FileText className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-navy">Generated PRD</span>
        <span className="ml-auto text-[10px] text-muted">v2.1 &middot; Auto-saved</span>
      </div>
      <div className="space-y-2">
        {sections.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2"
          >
            {s.status === "complete" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : s.status === "generating" ? (
              <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-forest border-t-transparent" />
            ) : (
              <CircleDot className="h-4 w-4 shrink-0 text-muted-light" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                s.status === "pending" ? "text-muted-light" : "text-navy"
              )}
            >
              {s.label}
            </span>
            {s.status === "complete" && (
              <span className="ml-auto text-[10px] text-muted">Done</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-cream-dark p-3">
        <p className="text-[10px] font-semibold text-forest mb-1">Overview</p>
        <p className="text-[10px] leading-relaxed text-muted">
          This product is an internal sales enablement tool that auto-generates branded
          proposals from HubSpot CRM deal data. It targets sales teams of 10-50 reps
          handling enterprise deals...
        </p>
      </div>
    </div>
  )
}

function DependencyGraphMock() {
  const nodes = [
    { id: "auth", label: "Auth Module", x: 50, y: 10, status: "done" },
    { id: "db", label: "Database Schema", x: 10, y: 40, status: "done" },
    { id: "api", label: "API Layer", x: 55, y: 40, status: "active" },
    { id: "ui", label: "UI Components", x: 35, y: 70, status: "pending" },
    { id: "integrations", label: "Integrations", x: 75, y: 70, status: "pending" },
  ]

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white">
          <Network className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-navy">Dependency Graph</span>
        <span className="ml-auto text-[10px] text-muted">5 features &middot; 7 links</span>
      </div>

      <div className="relative h-52 overflow-hidden rounded-lg bg-cream-dark">
        {/* Edges (simplified with absolute divs) */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="50" y1="18" x2="20" y2="40" stroke="#B8FF3C" strokeWidth="0.5" />
          <line x1="50" y1="18" x2="55" y2="38" stroke="#B8FF3C" strokeWidth="0.5" />
          <line x1="20" y1="48" x2="40" y2="68" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="55" y1="48" x2="40" y2="68" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="55" y1="48" x2="75" y2="68" stroke="#E5E7EB" strokeWidth="0.5" strokeDasharray="2,2" />
        </svg>

        {nodes.map((node) => (
          <div
            key={node.id}
            className={cn(
              "absolute flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[9px] font-semibold shadow-xs -translate-x-1/2",
              node.status === "done"
                ? "border-success/30 bg-success-light text-success"
                : node.status === "active"
                ? "border-forest/30 bg-white text-forest"
                : "border-border bg-white text-muted"
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            {node.status === "done" && <Check className="h-2.5 w-2.5" />}
            {node.status === "active" && <div className="h-2 w-2 animate-pulse rounded-full bg-forest" />}
            {node.label}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-success" /> Complete
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-forest" /> In Progress
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-border" /> Pending
        </span>
      </div>
    </div>
  )
}

function TaskPromptMock() {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white">
          <Terminal className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-navy">Generated Task</span>
        <span className="ml-auto rounded-full bg-lime/30 px-2 py-0.5 text-[10px] font-semibold text-forest">
          Agent-Ready
        </span>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border/50 p-3">
          <p className="text-[10px] font-semibold text-forest mb-1">Task #14 — Create User Auth API</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[9px] font-medium text-muted">backend</span>
            <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[9px] font-medium text-muted">auth</span>
            <span className="rounded-full bg-cream-dark px-2 py-0.5 text-[9px] font-medium text-muted">priority: high</span>
          </div>
          <p className="text-[10px] leading-relaxed text-muted">
            Implement JWT-based authentication with refresh token rotation. Include
            signup, login, logout, and password reset endpoints.
          </p>
        </div>

        <div className="rounded-lg bg-navy p-3">
          <p className="mb-1.5 text-[9px] font-semibold text-lime">Agent Prompt Preview</p>
          <div className="font-mono text-[9px] leading-relaxed text-white/70">
            <p>Create the auth API module in /src/api/auth/</p>
            <p className="mt-1">Requirements:</p>
            <p>- POST /auth/signup with email validation</p>
            <p>- POST /auth/login returning JWT + refresh</p>
            <p>- POST /auth/refresh for token rotation</p>
            <p>- Use bcrypt for hashing, zod for validation</p>
            <p className="mt-1 text-lime/60">// Convention: follow existing error handler pattern in /src/middleware/</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentDashboardMock() {
  const agents = [
    { name: "Claude Code", task: "Auth API", progress: 87, status: "running" },
    { name: "Cursor Agent", task: "Dashboard UI", progress: 62, status: "running" },
    { name: "Codex", task: "DB Migrations", progress: 100, status: "done" },
    { name: "Claude Code", task: "Test Suite", progress: 34, status: "running" },
  ]

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white">
          <Cpu className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-navy">Agent Orchestrator</span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          4 agents active
        </span>
      </div>

      <div className="space-y-2.5">
        {agents.map((a, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-forest" />
                <span className="text-[10px] font-semibold text-navy">{a.name}</span>
              </div>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                  a.status === "done"
                    ? "bg-success-light text-success"
                    : "bg-lime/20 text-forest"
                )}
              >
                {a.status === "done" ? "Complete" : `${a.progress}%`}
              </span>
            </div>
            <p className="text-[9px] text-muted mb-1.5">{a.task}</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dark">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  a.status === "done"
                    ? "bg-success"
                    : "bg-linear-to-r from-forest to-lime"
                )}
                style={{ width: `${a.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditScorecardMock() {
  const checks = [
    { label: "Type safety — no `any` types", pass: true },
    { label: "Error handling on all endpoints", pass: true },
    { label: "Auth middleware applied", pass: true },
    { label: "Rate limiting configured", pass: false },
    { label: "Input validation with Zod", pass: true },
    { label: "Test coverage > 80%", pass: true },
    { label: "Environment variables secured", pass: true },
    { label: "CORS policy defined", pass: false },
  ]
  const passed = checks.filter((c) => c.pass).length

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-xs font-semibold text-navy">Production Audit</span>
        <span className="ml-auto text-[10px] font-semibold text-forest">
          {passed}/{checks.length} passed
        </span>
      </div>

      {/* Score ring */}
      <div className="mb-3 flex items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="4" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#22C55E"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(passed / checks.length) * 175.9} 175.9`}
            />
          </svg>
          <span className="absolute text-sm font-bold text-navy">
            {Math.round((passed / checks.length) * 100)}%
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-navy">Almost Production Ready</p>
          <p className="text-[10px] text-muted">
            2 issues to resolve before deployment
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[10px]",
              c.pass ? "text-navy" : "bg-danger-light/50 text-danger"
            )}
          >
            {c.pass ? (
              <Check className="h-3 w-3 shrink-0 text-success" />
            ) : (
              <TriangleAlert className="h-3 w-3 shrink-0 text-danger" />
            )}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* --- Feature Data ------------------------------------------------- */

const FEATURES = [
  {
    id: "ai-chat",
    icon: MessageSquare,
    title: "AI Planning Chat",
    headline: "Describe Your Idea. We'll Ask the Right Questions.",
    description:
      "Start with a rough concept and our AI planning assistant guides you through structured discovery. It asks clarifying questions about scope, users, edge cases, and technical constraints — turning vague ideas into actionable requirements in minutes, not days.",
    bullets: [
      {
        icon: Lightbulb,
        label: "Smart Clarification",
        text: "AI detects ambiguity and probes for specifics before generating anything",
      },
      {
        icon: Layers,
        label: "Context Awareness",
        text: "Understands your existing codebase, stack, and conventions",
      },
      {
        icon: GitBranch,
        label: "Branching Decisions",
        text: "Surfaces trade-offs and lets you choose architecture direction",
      },
      {
        icon: Sparkles,
        label: "Iterative Refinement",
        text: "Chat evolves your plan — add constraints, pivot scope, drill deeper anytime",
      },
    ],
    visual: ChatMock,
  },
  {
    id: "spec-gen",
    icon: FileText,
    title: "Spec & PRD Generation",
    headline: "Production-Grade Specs, Generated in Seconds.",
    description:
      "Once the planning chat converges, PlanForge auto-generates a complete Product Requirements Document. Every section — from user stories to API contracts to data models — is structured, versioned, and ready for engineering review.",
    bullets: [
      {
        icon: FileText,
        label: "Full PRD Structure",
        text: "Overview, user stories, functional reqs, API contracts, data models, and NFRs",
      },
      {
        icon: Search,
        label: "Gap Detection",
        text: "AI identifies missing requirements and edge cases before you ship the spec",
      },
      {
        icon: Code2,
        label: "Technical Depth",
        text: "Includes schema definitions, endpoint signatures, and validation rules",
      },
    ],
    visual: SpecDocMock,
  },
  {
    id: "decomposition",
    icon: TreePine,
    title: "Feature Decomposition & Dependency Mapping",
    headline: "Break Down Complexity. See the Full Picture.",
    description:
      "PlanForge automatically decomposes features into atomic, implementable units and maps their dependencies. The interactive graph shows what can be parallelized, what blocks what, and the optimal build order for your team.",
    bullets: [
      {
        icon: Network,
        label: "Auto Dependency Detection",
        text: "AI infers relationships between features — data flows, shared modules, API contracts",
      },
      {
        icon: Workflow,
        label: "Critical Path Analysis",
        text: "See the fastest path to MVP and identify bottleneck features",
      },
      {
        icon: Zap,
        label: "Parallelization Hints",
        text: "Know which features can be built simultaneously by different agents or developers",
      },
      {
        icon: ListChecks,
        label: "Smart Prioritization",
        text: "ICE, RICE, and MoSCoW scoring applied automatically to every feature",
      },
    ],
    visual: DependencyGraphMock,
  },
  {
    id: "task-gen",
    icon: Terminal,
    title: "Agent-Ready Task Generation",
    headline: "Tasks So Detailed, AI Agents Can Execute Them Autonomously.",
    description:
      "Every task generated by PlanForge includes a structured prompt, file targets, convention notes, and acceptance criteria. They're engineered to be directly dispatchable to AI coding agents like Claude Code, Cursor, or Codex — with zero manual prompt crafting.",
    bullets: [
      {
        icon: Bot,
        label: "Prompt Engineering Built-In",
        text: "Each task includes an optimized agent prompt with context, constraints, and examples",
      },
      {
        icon: Code2,
        label: "Convention Aware",
        text: "Prompts reference your existing code patterns, file structure, and naming conventions",
      },
      {
        icon: CheckCircle2,
        label: "Acceptance Criteria",
        text: "Clear pass/fail conditions so validation can be automated",
      },
    ],
    visual: TaskPromptMock,
  },
  {
    id: "orchestration",
    icon: Cpu,
    title: "Multi-Agent Orchestration",
    headline: "Dispatch to Multiple AI Agents in Parallel.",
    description:
      "PlanForge doesn't just generate tasks — it dispatches them. Connect your preferred AI coding agents and watch them work in parallel. Real-time progress tracking, automatic validation, and smart retry logic keep everything moving forward.",
    bullets: [
      {
        icon: Zap,
        label: "Parallel Execution",
        text: "Run up to 20 agents simultaneously on non-blocking tasks",
      },
      {
        icon: LayoutDashboard,
        label: "Live Dashboard",
        text: "Real-time progress, logs, and status for every running agent",
      },
      {
        icon: Shield,
        label: "Auto-Validation",
        text: "Output is checked against acceptance criteria; failed tasks auto-retry with refined prompts",
      },
      {
        icon: GitMerge,
        label: "Smart Merging",
        text: "Agent outputs are validated for conflicts before merging into your branch",
      },
    ],
    visual: AgentDashboardMock,
  },
  {
    id: "audit",
    icon: ShieldCheck,
    title: "Production Readiness Audit",
    headline: "Ship with Confidence. Every Time.",
    description:
      "Before code leaves PlanForge, it runs through a comprehensive production readiness audit. Type safety, error handling, security patterns, test coverage, and more — all checked automatically so nothing slips through to production.",
    bullets: [
      {
        icon: Check,
        label: "30+ Automated Checks",
        text: "Security, performance, accessibility, error handling, and code quality all validated",
      },
      {
        icon: TriangleAlert,
        label: "Issue Prioritization",
        text: "Critical vs. advisory findings so you know exactly what to fix first",
      },
      {
        icon: Rocket,
        label: "One-Click Remediation",
        text: "AI generates fix tasks for every failed check — dispatch and resolve in minutes",
      },
    ],
    visual: AuditScorecardMock,
  },
]

function CoreFeatures() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {FEATURES.map((feat, idx) => {
          const isReversed = idx % 2 !== 0
          const Visual = feat.visual

          return (
            <motion.div
              key={feat.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className={cn(
                "mb-24 flex flex-col items-center gap-12 last:mb-0 lg:flex-row lg:gap-16",
                isReversed && "lg:flex-row-reverse"
              )}
            >
              {/* Content */}
              <div className="w-full lg:w-1/2">
                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white">
                    <feat.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-forest">
                    {feat.title}
                  </span>
                </motion.div>

                <motion.h2
                  variants={fadeUp}
                  className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl"
                >
                  {feat.headline}
                </motion.h2>

                <motion.p
                  variants={fadeUp}
                  className="mt-4 text-base leading-relaxed text-muted"
                >
                  {feat.description}
                </motion.p>

                <motion.ul variants={stagger} className="mt-6 space-y-4">
                  {feat.bullets.map((b, bi) => (
                    <motion.li
                      key={bi}
                      variants={fadeUp}
                      className="flex gap-3"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lime/20 text-forest">
                        <b.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy">
                          {b.label}
                        </p>
                        <p className="text-sm text-muted">{b.text}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Visual */}
              <motion.div
                variants={fadeUp}
                className="w-full lg:w-1/2"
              >
                <Visual />
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 3 — INTEGRATIONS
   ═══════════════════════════════════════════ */

const INTEGRATIONS = [
  {
    name: "Claude Code",
    desc: "Dispatch tasks directly to Anthropic's CLI agent",
    icon: Terminal,
  },
  {
    name: "Cursor",
    desc: "Push agent-ready prompts into Cursor AI",
    icon: Code2,
  },
  {
    name: "OpenAI Codex",
    desc: "Multi-model support with Codex integration",
    icon: Cpu,
  },
  {
    name: "GitHub",
    desc: "Repo analysis, PR creation, and branch management",
    icon: GitBranch,
  },
  {
    name: "Vercel",
    desc: "One-click preview deployments for generated code",
    icon: Globe,
  },
  {
    name: "Linear",
    desc: "Sync features and tasks to Linear projects",
    icon: Layers,
  },
  {
    name: "Jira",
    desc: "Export and sync with Jira epics and stories",
    icon: LayoutDashboard,
  },
  {
    name: "Slack",
    desc: "Real-time build notifications and alerts",
    icon: MessageSquare,
  },
  {
    name: "GitLab",
    desc: "Full CI/CD pipeline integration",
    icon: GitMerge,
  },
  {
    name: "VS Code",
    desc: "Extension for inline planning and task preview",
    icon: Code2,
  },
]

function Integrations() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-cream via-cream-dark/30 to-cream" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-wider text-forest"
          >
            Integrations
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl"
          >
            Works With Your Stack
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-base text-muted">
            PlanForge plugs into the tools you already use — from AI agents to version
            control to project management.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {INTEGRATIONS.map((int, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group relative rounded-xl border border-border bg-white p-4 text-center shadow-xs transition-all hover:border-forest/20 hover:shadow-md"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cream-dark text-forest transition-colors group-hover:bg-forest group-hover:text-white">
                <int.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-navy">{int.name}</p>
              <p className="mt-1 text-[11px] leading-snug text-muted">{int.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 4 — STATS BAR
   ═══════════════════════════════════════════ */

const STATS = [
  { value: "50K+", label: "Tasks Generated" },
  { value: "98%", label: "First-Pass Accuracy" },
  { value: "10x", label: "Faster Planning" },
  { value: "2,400+", label: "Builders" },
]

function StatsBar() {
  return (
    <section className="relative py-16">
      <div className="absolute inset-0 -z-10 bg-navy" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(184,255,60,0.12),transparent)]" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 gap-8 sm:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="text-center"
            >
              <p className="text-3xl font-extrabold text-lime sm:text-4xl lg:text-5xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm font-medium text-white/60">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 5 — CTA
   ═══════════════════════════════════════════ */

function CtaSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-cream to-forest" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(184,255,60,0.08),transparent)]" />

      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm"
          >
            <Rocket className="h-7 w-7 text-lime" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Ready to Build Smarter?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-md text-base text-white/70"
          >
            Join thousands of developers who ship faster with AI-powered planning. Free
            to start, no credit card required.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-8 py-4 text-sm font-bold text-navy shadow-lg transition-all hover:bg-lime-hover hover:shadow-xl"
            >
              Get Started Free
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-xs text-white/40"
          >
            No credit card required &middot; 2 free projects &middot; Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   SECTION 6 — MINI FOOTER
   ═══════════════════════════════════════════ */

function MiniFooter() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} PlanForge AI. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xs text-muted transition-colors hover:text-navy">
            Home
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-muted transition-colors hover:text-navy"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-muted transition-colors hover:text-navy"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════
   PAGE EXPORT
   ═══════════════════════════════════════════ */

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar variant="solid" />
      <Hero />
      <CoreFeatures />
      <Integrations />
      <StatsBar />
      <CtaSection />
      <MiniFooter />
    </main>
  )
}
