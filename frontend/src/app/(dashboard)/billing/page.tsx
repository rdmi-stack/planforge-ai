"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, Check, ArrowUpRight, Receipt, Download, Sparkles, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const CURRENT_PLAN = { name: "Pro", price: 39, period: "month", generations: { used: 312, limit: 500 } }

const INVOICES = [
  { id: "INV-2026-03", date: "Mar 1, 2026", amount: "$39.00", status: "Paid" },
  { id: "INV-2026-02", date: "Feb 1, 2026", amount: "$39.00", status: "Paid" },
  { id: "INV-2026-01", date: "Jan 1, 2026", amount: "$39.00", status: "Paid" },
  { id: "INV-2025-12", date: "Dec 1, 2025", amount: "$29.00", status: "Paid" },
]

export default function BillingPage() {
  const router = useRouter()
  const usagePct = Math.round((CURRENT_PLAN.generations.used / CURRENT_PLAN.generations.limit) * 100)

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-navy">Billing</h1>
        <p className="mt-1 text-sm text-muted">Manage your subscription, usage, and invoices.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Current plan */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-forest/20 bg-forest/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-forest px-3 py-0.5 text-xs font-bold text-white">{CURRENT_PLAN.name}</span>
                <span className="text-xs text-muted">Current Plan</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-navy">${CURRENT_PLAN.price}</span>
                <span className="text-sm text-muted">/{CURRENT_PLAN.period}</span>
              </div>
              <p className="mt-1 text-xs text-muted">Billed monthly &middot; Next invoice Apr 1, 2026</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/pricing")}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-navy hover:bg-cream transition-colors cursor-pointer">
                Change Plan
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-forest transition-colors cursor-pointer">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Upgrade to Team
              </button>
            </div>
          </div>
        </motion.div>

        {/* Usage */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-forest" /> AI Generations</span>
              <span className="text-xs font-bold text-navy">{CURRENT_PLAN.generations.used}/{CURRENT_PLAN.generations.limit}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
              <div className={cn("h-full rounded-full transition-all", usagePct > 80 ? "bg-danger" : usagePct > 60 ? "bg-amber-400" : "bg-forest")} style={{ width: `${usagePct}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-muted">{CURRENT_PLAN.generations.limit - CURRENT_PLAN.generations.used} remaining this month &middot; Resets Apr 1</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-forest" />
              <span className="text-xs font-bold text-navy">Usage Trend</span>
            </div>
            <div className="flex h-16 items-end gap-1">
              {[45, 62, 38, 71, 55, 80, 65, 72, 90, 68, 85, 78].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.03 }}
                  className={cn("flex-1 rounded-t", i === 11 ? "bg-forest" : "bg-cream-dark")} />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">Daily generation count — last 12 days</p>
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy"><CreditCard className="h-4 w-4 text-forest" /> Payment Method</h3>
          <div className="flex items-center justify-between rounded-lg border border-border bg-cream/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-12 items-center justify-center rounded bg-navy text-[10px] font-bold text-white">VISA</div>
              <div>
                <div className="text-sm font-medium text-navy">&middot;&middot;&middot;&middot; &middot;&middot;&middot;&middot; &middot;&middot;&middot;&middot; 4242</div>
                <div className="text-[11px] text-muted">Expires 12/2028</div>
              </div>
            </div>
            <button onClick={() => alert("Stripe integration coming soon")} className="text-xs font-medium text-forest hover:text-forest-light transition-colors cursor-pointer">Update</button>
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy"><Receipt className="h-4 w-4 text-forest" /> Invoices</h3>
          </div>
          {INVOICES.map((inv, i) => (
            <div key={inv.id} className={cn("flex items-center justify-between px-5 py-3", i < INVOICES.length - 1 && "border-b border-border/50")}>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted">{inv.id}</span>
                <span className="text-xs text-navy">{inv.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-navy">{inv.amount}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
                  <Check className="h-3 w-3" /> {inv.status}
                </span>
                <button onClick={() => alert("Download coming soon")} className="text-muted-light hover:text-navy transition-colors cursor-pointer"><Download className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
