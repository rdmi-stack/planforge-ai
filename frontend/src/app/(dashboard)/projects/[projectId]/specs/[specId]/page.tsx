"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Eye, Edit3, GitCompare, History, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { SpecEditor } from "@/components/specs/spec-editor"
import { SpecPreview } from "@/components/specs/spec-preview"
import { SpecDiffViewer } from "@/components/specs/spec-diff-viewer"
import { PlanningChat } from "@/components/chat/planning-chat"

type Tab = "edit" | "preview" | "diff" | "chat"

const DEMO_CONTENT = `<h1>User Management & Authentication</h1>
<h2>Overview</h2>
<p>A comprehensive authentication system supporting OAuth 2.0 (Google, GitHub), email/password, and role-based access control for a multi-tenant SaaS platform.</p>
<h2>User Personas</h2>
<ul>
<li><strong>Admin</strong> — Manages team members, billing, and project settings</li>
<li><strong>Developer</strong> — Creates and manages projects, runs AI planning sessions</li>
<li><strong>Viewer</strong> — Read-only access to specs and task boards</li>
</ul>
<h2>Core Requirements</h2>
<ol>
<li>OAuth 2.0 with Google and GitHub providers</li>
<li>Email/password authentication with email verification</li>
<li>Role-based access: owner, admin, member, viewer</li>
<li>Organization-level settings and member management</li>
<li>Session management with JWT (15-min access, 7-day refresh)</li>
</ol>
<h2>Acceptance Criteria</h2>
<ul>
<li>Login flow completes in under 2 seconds</li>
<li>Password reset email sent within 30 seconds</li>
<li>All auth endpoints rate-limited to prevent brute force</li>
<li>Tokens stored in httpOnly cookies, never in localStorage</li>
</ul>`

export default function SpecDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [activeTab, setActiveTab] = useState<Tab>("preview")
  const [title, setTitle] = useState("User Management & Authentication")

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "preview", label: "Preview", icon: Eye },
    { id: "edit", label: "Edit", icon: Edit3 },
    { id: "diff", label: "Diff", icon: GitCompare },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
  ]

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <FileText className="h-3.5 w-3.5" />
          <span>Spec</span>
          <span>&middot;</span>
          <span>v3</span>
          <span>&middot;</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-success-light text-success ring-1 ring-success/20 px-2 py-0.5 text-[10px] font-semibold">
            Approved
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-navy">{title}</h1>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border bg-white p-1 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                activeTab === tab.id
                  ? "bg-navy text-white shadow-xs"
                  : "text-muted hover:text-navy hover:bg-cream-dark"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "preview" && <SpecPreview spec={{ title, version: 3 }} />}
        {activeTab === "edit" && (
          <SpecEditor
            initialContent={DEMO_CONTENT}
            title={title}
            projectId={projectId}
            onTitleChange={setTitle}
          />
        )}
        {activeTab === "diff" && <SpecDiffViewer />}
        {activeTab === "chat" && <PlanningChat projectId={projectId} />}
      </motion.div>
    </div>
  )
}
