"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Globe, Server, Database, Cpu, Wifi, Cloud, Shield, Layers } from "lucide-react"

type ArchNode = {
  id: string
  label: string
  sublabel: string
  icon: React.ElementType
  color: string
  bg: string
  x: number
  y: number
  connections: string[]
}

const NODES: ArchNode[] = [
  { id: "client", label: "Next.js Frontend", sublabel: "App Router + Tailwind v4", icon: Globe, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", x: 15, y: 15, connections: ["api-gw"] },
  { id: "api-gw", label: "FastAPI Gateway", sublabel: "REST + WebSocket", icon: Server, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", x: 50, y: 15, connections: ["auth", "ai-svc", "db", "cache"] },
  { id: "auth", label: "Auth Service", sublabel: "JWT + OAuth 2.0", icon: Shield, color: "text-violet-600", bg: "bg-violet-50 border-violet-200", x: 85, y: 10, connections: [] },
  { id: "ai-svc", label: "AI Engine", sublabel: "Claude + Instructor", icon: Cpu, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", x: 50, y: 50, connections: ["queue"] },
  { id: "queue", label: "Celery Workers", sublabel: "Redis Broker", icon: Layers, color: "text-pink-600", bg: "bg-pink-50 border-pink-200", x: 85, y: 50, connections: [] },
  { id: "db", label: "PostgreSQL", sublabel: "Primary Database", icon: Database, color: "text-sky-600", bg: "bg-sky-50 border-sky-200", x: 25, y: 80, connections: [] },
  { id: "cache", label: "Redis", sublabel: "Cache + Pub/Sub", icon: Wifi, color: "text-red-500", bg: "bg-red-50 border-red-200", x: 60, y: 80, connections: [] },
  { id: "storage", label: "S3 / R2", sublabel: "File Storage", icon: Cloud, color: "text-teal-600", bg: "bg-teal-50 border-teal-200", x: 85, y: 82, connections: [] },
]

export function ArchDiagramViewer() {
  const nodeMap = new Map(NODES.map((n) => [n.id, n]))

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="mb-5 text-sm font-bold text-navy">System Architecture</h3>
      <div className="relative h-[420px] w-full rounded-lg bg-cream/30 border border-border/50 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full">
          {NODES.flatMap((node) =>
            node.connections.map((targetId) => {
              const target = nodeMap.get(targetId)
              if (!target) return null
              return (
                <motion.line
                  key={`${node.id}-${targetId}`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.25 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  x1={`${node.x + 6}%`} y1={`${node.y + 5}%`}
                  x2={`${target.x}%`} y2={`${target.y + 5}%`}
                  stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4"
                  className="text-muted-light"
                />
              )
            })
          )}
        </svg>

        {NODES.map((node, i) => {
          const Icon = node.icon
          return (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 180 }}
              className={cn("absolute rounded-xl border px-4 py-3 shadow-xs cursor-pointer hover:shadow-md transition-shadow", node.bg)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", node.color)} />
                <div>
                  <div className="text-[11px] font-bold text-navy whitespace-nowrap">{node.label}</div>
                  <div className="text-[9px] text-muted whitespace-nowrap">{node.sublabel}</div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
