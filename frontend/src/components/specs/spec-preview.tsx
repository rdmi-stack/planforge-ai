"use client"

import { motion } from "framer-motion"
import {
  FileText,
  Users,
  Layers,
  CheckCircle2,
  Database,
  Network,
  Shield,
  Clock,
  Edit3,
  Download,
  Share2,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Spec } from "@/types/spec"

type SpecPreviewProps = {
  spec?: Partial<Spec>
}

const SPEC_SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    icon: FileText,
    content: "A comprehensive AI-powered product planning platform that takes natural language ideas, generates structured specs, decomposes features into atomic tasks, and dispatches them to AI coding agents.",
  },
  {
    id: "personas",
    title: "User Personas",
    icon: Users,
    items: [
      { name: "Alex — Indie Hacker", desc: "Solo builder shipping MVPs fast. Needs structured plans for AI agents." },
      { name: "Sarah — Product Manager", desc: "Agency PM managing multiple client projects. Needs consistency and speed." },
      { name: "Marcus — CTO", desc: "Engineering leader ensuring code quality. Needs codebase-aware planning." },
    ],
  },
  {
    id: "features",
    title: "Core Features",
    icon: Layers,
    items: [
      { name: "AI Planning Chat", desc: "Natural language ideation with smart follow-up questions" },
      { name: "Spec Generation", desc: "Complete PRD from conversation — goals, features, criteria" },
      { name: "Feature Decomposition", desc: "Hierarchical breakdown with dependency mapping" },
      { name: "Task Generation", desc: "Atomic agent-ready tasks with context-rich prompts" },
      { name: "Agent Orchestration", desc: "Multi-agent dispatch, validation, and retry" },
      { name: "Production Audit", desc: "12-point readiness check before shipping" },
    ],
  },
  {
    id: "acceptance",
    title: "Acceptance Criteria",
    icon: CheckCircle2,
    items: [
      { name: "Spec must be generated in < 30s" },
      { name: "Tasks must include file paths and conventions" },
      { name: "Agent prompts must achieve > 95% first-pass accuracy" },
      { name: "All user data encrypted at rest and in transit" },
      { name: "Support 100+ concurrent planning sessions" },
    ],
  },
  {
    id: "architecture",
    title: "Technical Architecture",
    icon: Network,
    content: "Next.js 16 frontend with Tailwind v4, FastAPI backend with PostgreSQL and Redis, Celery for async AI tasks, WebSocket for real-time collaboration.",
  },
  {
    id: "schema",
    title: "Database Schema",
    icon: Database,
    content: "Core entities: users, organizations, projects, specs, features, tasks, agent_runs, decision_log, templates, chat_sessions. All tables use UUID primary keys.",
  },
]

export function SpecPreview({ spec }: SpecPreviewProps) {
  return (
    <div className="rounded-xl border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy">
              {spec?.title || "Product Spec"}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span>v{spec?.version || 1}</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated 2h ago
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer">
            <Copy className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer">
            <Download className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest transition-colors cursor-pointer">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-border">
        {SPEC_SECTIONS.map((section, i) => {
          const Icon = section.icon
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-6 py-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-forest" />
                <h3 className="text-sm font-bold text-navy">{section.title}</h3>
              </div>

              {"content" in section && section.content && (
                <p className="text-sm leading-relaxed text-muted">{section.content}</p>
              )}

              {"items" in section && section.items && (
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      <div>
                        <span className="text-sm font-medium text-navy">
                          {"name" in item ? item.name : ""}
                        </span>
                        {"desc" in item && (
                          <span className="text-sm text-muted"> — {item.desc}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
