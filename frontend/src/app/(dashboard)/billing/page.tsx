"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CreditCard, Check, ArrowUpRight, Receipt, Sparkles, TrendingUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"

type SubscriptionData = {
  plan: string
  status: string
  current_period_end: string | null
  generations_used: number
  generations_limit: number
}

const PLAN_PRICES: Record<string, number> = { free: 0, pro: 39, team: 99 }

export default function BillingPage() {
  const router = useRouter()
  const addToast = useToastStore.getState().addToast
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const data = await apiClientAuth<SubscriptionData>("/billing/subscription")
        setSubscription(data)
      } catch {
        useToastStore.getState().addToast("Failed to load billing data", "error")
        setSubscription({ plan: "free", status: "active", current_period_end: null, generations_used: 0, generations_limit: 30 })
      } finally {
        setLoading(false)
      }
    }
    fetchSubscription()
  }, [])

  const handleChangePlan = async (plan: "pro" | "team") => {
    try {
      const data = await apiClientAuth<{ url: string; session_id: string }>("/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing: "monthly" }),
      })
      router.push(data.url)
    } catch {
      useToastStore.getState().addToast("Failed to start checkout", "error")
    }
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return
    setCanceling(true)
    try {
      const data = await apiClientAuth<{ status: string; message: string }>("/billing/cancel", { method: "POST" })
      addToast(data.message, "info")
      setSubscription((prev) => prev ? { ...prev, status: "canceled" } : prev)
    } catch {
      addToast("Failed to cancel subscription", "error")
    } finally {
      setCanceling(false)
    }
  }

  if (loading || !subscription) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    )
  }

  const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
  const price = PLAN_PRICES[subscription.plan] ?? 0
  const generationsLimit = subscription.generations_limit === -1 ? "Unlimited" : subscription.generations_limit
  const usagePct = subscription.generations_limit > 0
    ? Math.round((subscription.generations_used / subscription.generations_limit) * 100)
    : 0
  const nextInvoiceText = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Not scheduled"

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
                <span className="rounded-full bg-forest px-3 py-0.5 text-xs font-bold text-white">{planName}</span>
                <span className="text-xs text-muted">Current Plan</span>
                {subscription.status === "canceled" && (
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">Canceled</span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-black text-navy">${price}</span>
                <span className="text-sm text-muted">/month</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {subscription.current_period_end
                  ? `Billed in-app \u00b7 Current term ends ${nextInvoiceText}`
                  : "Free tier"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleChangePlan("pro")}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-navy hover:bg-cream transition-colors cursor-pointer">
                Change Plan
              </button>
              {subscription.plan !== "team" && (
                <button
                  onClick={() => handleChangePlan("team")}
                  className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-forest transition-colors cursor-pointer">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Upgrade to Team
                </button>
              )}
              {subscription.plan !== "free" && subscription.status !== "canceled" && (
                <button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs font-medium text-danger hover:bg-danger/5 transition-colors cursor-pointer disabled:opacity-50">
                  {canceling ? "Canceling..." : "Cancel"}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Usage */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-forest" /> AI Generations</span>
              <span className="text-xs font-bold text-navy">{subscription.generations_used}/{generationsLimit}</span>
            </div>
            {subscription.generations_limit > 0 && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-cream-dark">
                <div className={cn("h-full rounded-full transition-all", usagePct > 80 ? "bg-danger" : usagePct > 60 ? "bg-amber-400" : "bg-forest")} style={{ width: `${usagePct}%` }} />
              </div>
            )}
            <p className="mt-2 text-[11px] text-muted">
              {subscription.generations_limit === -1
                ? "Unlimited generations on Team plan"
                : `${subscription.generations_limit - subscription.generations_used} remaining this month`}
            </p>
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
          <div className="rounded-lg border border-border bg-cream/30 px-4 py-3">
            <div className="text-sm font-medium text-navy">Stripe customer portal is not connected yet.</div>
            <p className="mt-1 text-[11px] text-muted">
              The billing screen now reflects your real plan state, but card storage and invoice downloads still need a live Stripe integration before they can be sold as self-serve billing features.
            </p>
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy"><Receipt className="h-4 w-4 text-forest" /> Invoices</h3>
          </div>
          <div className="px-5 py-6">
            <div className="rounded-lg border border-dashed border-border bg-cream/20 p-4">
              <div className="text-sm font-medium text-navy">No downloadable invoices available yet</div>
              <p className="mt-1 text-[11px] text-muted">
                Invoice history will appear here once the checkout flow is backed by a real payment processor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
