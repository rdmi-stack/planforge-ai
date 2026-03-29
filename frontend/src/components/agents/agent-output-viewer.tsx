"use client"

import { useState } from "react"
import { Check, X, Copy, CheckCircle2, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AgentRun } from "@/types/agent"

type AgentOutputViewerProps = { run: AgentRun }

export function AgentOutputViewer({ run }: AgentOutputViewerProps) {
  const [copied, setCopied] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-forest" />
          <span className="text-xs font-bold text-navy">Agent Output</span>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(run.outputLog); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
          className="flex items-center gap-1 rounded-md bg-cream-dark px-2 py-1 text-[10px] font-medium text-muted hover:text-navy transition-colors cursor-pointer"
        >
          {copied ? <CheckCircle2 className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto bg-navy p-4 font-mono text-[11px] leading-relaxed text-white/80 whitespace-pre-wrap">
        {run.outputLog || "No output yet..."}
      </div>

      {run.validationResult && (
        <div className="border-t border-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className={cn("text-xs font-bold", run.validationResult.passed ? "text-success" : "text-danger")}>
              {run.validationResult.passed ? "✓ Validation Passed" : "✗ Validation Failed"}
            </span>
          </div>
          <div className="space-y-1.5">
            {run.validationResult.checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2">
                {check.passed ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <X className="h-3.5 w-3.5 text-danger" />
                )}
                <span className="text-xs text-muted">{check.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
