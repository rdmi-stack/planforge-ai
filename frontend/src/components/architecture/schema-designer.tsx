"use client"

import { motion } from "framer-motion"
import { Database, Key, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Column = { name: string; type: string; pk?: boolean; fk?: string }
type Table = { name: string; columns: Column[] }

const TABLES: Table[] = [
  { name: "users", columns: [
    { name: "id", type: "UUID", pk: true },
    { name: "email", type: "VARCHAR(255)" },
    { name: "name", type: "VARCHAR(100)" },
    { name: "password_hash", type: "TEXT" },
    { name: "plan", type: "ENUM" },
    { name: "org_id", type: "UUID", fk: "organizations.id" },
  ]},
  { name: "projects", columns: [
    { name: "id", type: "UUID", pk: true },
    { name: "name", type: "VARCHAR(200)" },
    { name: "status", type: "ENUM" },
    { name: "org_id", type: "UUID", fk: "organizations.id" },
    { name: "owner_id", type: "UUID", fk: "users.id" },
    { name: "github_repo_url", type: "TEXT" },
  ]},
  { name: "specs", columns: [
    { name: "id", type: "UUID", pk: true },
    { name: "project_id", type: "UUID", fk: "projects.id" },
    { name: "title", type: "VARCHAR(300)" },
    { name: "content_json", type: "JSONB" },
    { name: "status", type: "ENUM" },
    { name: "version", type: "INTEGER" },
  ]},
  { name: "tasks", columns: [
    { name: "id", type: "UUID", pk: true },
    { name: "project_id", type: "UUID", fk: "projects.id" },
    { name: "feature_id", type: "UUID", fk: "features.id" },
    { name: "title", type: "VARCHAR(300)" },
    { name: "status", type: "ENUM" },
    { name: "prompt_text", type: "TEXT" },
    { name: "agent_type", type: "ENUM" },
  ]},
]

export function SchemaDesigner() {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="mb-5 text-sm font-bold text-navy">Database Schema</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {TABLES.map((table, i) => (
          <motion.div
            key={table.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-lg border border-border overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-navy px-3 py-2">
              <Database className="h-3.5 w-3.5 text-lime" />
              <span className="font-mono text-xs font-bold text-white">{table.name}</span>
            </div>
            <div className="divide-y divide-border">
              {table.columns.map((col) => (
                <div key={col.name} className="flex items-center gap-2 px-3 py-1.5">
                  {col.pk ? (
                    <Key className="h-3 w-3 text-amber-500" />
                  ) : col.fk ? (
                    <Link2 className="h-3 w-3 text-blue-400" />
                  ) : (
                    <div className="h-3 w-3" />
                  )}
                  <span className="font-mono text-[11px] font-medium text-navy">{col.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-light">{col.type}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
