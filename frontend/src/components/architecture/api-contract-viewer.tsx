"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Endpoint = { method: string; path: string; description: string; response?: string }
type EndpointGroup = { name: string; endpoints: Endpoint[] }

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-blue-50 text-blue-600",
  POST: "bg-success-light text-success",
  PATCH: "bg-amber-50 text-amber-600",
  DELETE: "bg-danger-light text-danger",
  WS: "bg-violet-50 text-violet-600",
}

const API_GROUPS: EndpointGroup[] = [
  { name: "Auth", endpoints: [
    { method: "POST", path: "/api/v1/auth/login", description: "Login with email/password" },
    { method: "POST", path: "/api/v1/auth/register", description: "Create new account" },
    { method: "POST", path: "/api/v1/auth/refresh", description: "Refresh access token" },
  ]},
  { name: "Projects", endpoints: [
    { method: "GET", path: "/api/v1/projects", description: "List all projects" },
    { method: "POST", path: "/api/v1/projects", description: "Create a project" },
    { method: "GET", path: "/api/v1/projects/{id}", description: "Get project by ID" },
    { method: "PATCH", path: "/api/v1/projects/{id}", description: "Update project" },
    { method: "DELETE", path: "/api/v1/projects/{id}", description: "Delete project" },
  ]},
  { name: "AI & Planning", endpoints: [
    { method: "POST", path: "/api/v1/projects/{id}/chat", description: "AI planning chat (SSE)" },
    { method: "POST", path: "/api/v1/projects/{id}/generate-spec", description: "Generate spec from chat" },
    { method: "POST", path: "/api/v1/projects/{id}/features/decompose", description: "AI feature breakdown" },
    { method: "POST", path: "/api/v1/projects/{id}/tasks/generate", description: "Generate tasks from features" },
    { method: "POST", path: "/api/v1/projects/{id}/architecture/generate", description: "Generate architecture" },
  ]},
  { name: "Tasks & Agents", endpoints: [
    { method: "GET", path: "/api/v1/projects/{id}/tasks", description: "List tasks" },
    { method: "PATCH", path: "/api/v1/projects/{id}/tasks/{taskId}", description: "Update task" },
    { method: "POST", path: "/api/v1/projects/{id}/tasks/{taskId}/dispatch", description: "Dispatch to agent" },
    { method: "GET", path: "/api/v1/projects/{id}/tasks/{taskId}/agent-status", description: "Get agent status" },
  ]},
  { name: "Real-time", endpoints: [
    { method: "WS", path: "/api/v1/ws/project/{id}", description: "WebSocket collaboration" },
  ]},
]

export function ApiContractViewer() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["Auth", "Projects"]))
  const [copied, setCopied] = useState<string | null>(null)

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path)
    setCopied(path)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-bold text-navy">API Contracts</h3>
        <p className="text-[11px] text-muted">{API_GROUPS.reduce((a, g) => a + g.endpoints.length, 0)} endpoints</p>
      </div>

      {API_GROUPS.map((group) => (
        <div key={group.name} className="border-b border-border last:border-b-0">
          <button
            onClick={() => toggle(group.name)}
            className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-cream/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-navy">{group.name}</span>
              <span className="text-[10px] text-muted">({group.endpoints.length})</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", expanded.has(group.name) && "rotate-180")} />
          </button>

          <AnimatePresence>
            {expanded.has(group.name) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                {group.endpoints.map((ep) => (
                  <div key={ep.path} className="group flex items-center gap-3 border-t border-border/50 px-5 py-2.5 hover:bg-cream/20">
                    <span className={cn("shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold", METHOD_STYLES[ep.method])}>
                      {ep.method}
                    </span>
                    <span className="flex-1 font-mono text-xs text-navy truncate">{ep.path}</span>
                    <span className="hidden sm:block text-[11px] text-muted truncate max-w-[200px]">{ep.description}</span>
                    <button
                      onClick={() => copyPath(ep.path)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {copied === ep.path ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-light hover:text-navy" />
                      )}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
