"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/landing/navbar"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  Users,
  Crown,
  Shield,
  Infinity,
  Headphones,
  Globe,
  Server,
  Lock,
  PhoneCall,
  FileKey,
  Blocks,
  MessageSquare,
  HelpCircle,
  CreditCard,
  Clock,
  Gift,
  Rocket,
  Building2,
  ChevronDown,
  CircleDollarSign,
  BarChart3,
  Layers,
  Bot,
  GitBranch,
  FileText,
  Terminal,
  ShieldCheck,
  Workflow,
  Brain,
  Gauge,
  Database,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ──────────────────────────────────────────
   DATA
   ────────────────────────────────────────── */

const TIERS = [
  {
    key: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    badge: null,
    description: "For side projects and trying PlanForge.",
    icon: Zap,
    cta: "Get Started Free",
    ctaStyle: "outline" as const,
    highlighted: false,
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 39,
    yearly: 32,
    badge: "Most Popular",
    description: "For builders shipping real products with AI.",
    icon: Sparkles,
    cta: "Start 14-Day Free Trial",
    ctaStyle: "primary" as const,
    highlighted: true,
  },
  {
    key: "team",
    name: "Team",
    monthly: 89,
    yearly: 72,
    badge: "Best Value",
    description: "For dev teams and agencies at scale.",
    icon: Users,
    cta: "Start Team Trial",
    ctaStyle: "outline" as const,
    highlighted: false,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthly: -1,
    yearly: -1,
    badge: null,
    description: "Custom solutions for large organizations.",
    icon: Crown,
    cta: "Talk to Sales",
    ctaStyle: "outline" as const,
    highlighted: false,
  },
]

type FeatureRow = {
  feature: string
  tooltip?: string
  free: string | boolean
  pro: string | boolean
  team: string | boolean
  enterprise: string | boolean
}

type FeatureCategory = {
  category: string
  icon: React.ElementType
  rows: FeatureRow[]
}

const COMPARISON: FeatureCategory[] = [
  {
    category: "Projects & Usage",
    icon: Layers,
    rows: [
      { feature: "Active projects", free: "2", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
      { feature: "AI generations / month", free: "30", pro: "500", team: "Unlimited", enterprise: "Unlimited" },
      { feature: "Chat messages / session", free: "20", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
      { feature: "Spec version history", free: "7 days", pro: "90 days", team: "1 year", enterprise: "Unlimited" },
      { feature: "File upload storage", free: "100 MB", pro: "5 GB", team: "50 GB", enterprise: "Custom" },
    ],
  },
  {
    category: "AI Planning",
    icon: Brain,
    rows: [
      { feature: "Basic spec generation", free: true, pro: true, team: true, enterprise: true },
      { feature: "Advanced PRD generation", free: false, pro: true, team: true, enterprise: true },
      { feature: "Smart clarifying questions", free: true, pro: true, team: true, enterprise: true },
      { feature: "Feature decomposition", free: false, pro: true, team: true, enterprise: true },
      { feature: "Dependency graph mapping", free: false, pro: true, team: true, enterprise: true },
      { feature: "ICE / RICE / MoSCoW scoring", free: false, pro: true, team: true, enterprise: true },
      { feature: "Architecture generation", free: false, pro: true, team: true, enterprise: true },
      { feature: "Database schema design", free: false, pro: true, team: true, enterprise: true },
      { feature: "API contract generation", free: false, pro: true, team: true, enterprise: true },
    ],
  },
  {
    category: "Agent Orchestration",
    icon: Bot,
    rows: [
      { feature: "Agent-ready prompt generation", free: "Basic", pro: "Advanced", team: "Advanced", enterprise: "Custom" },
      { feature: "Multi-agent dispatch", free: false, pro: true, team: true, enterprise: true },
      { feature: "Parallel agent execution", free: false, pro: "Up to 5", team: "Up to 20", enterprise: "Unlimited" },
      { feature: "Auto-validation & retry", free: false, pro: true, team: true, enterprise: true },
      { feature: "Real-time agent monitoring", free: false, pro: true, team: true, enterprise: true },
      { feature: "Custom agent configurations", free: false, pro: false, team: true, enterprise: true },
      { feature: "Private agent registry", free: false, pro: false, team: false, enterprise: true },
    ],
  },
  {
    category: "Codebase & Integrations",
    icon: GitBranch,
    rows: [
      { feature: "GitHub repo connection", free: false, pro: true, team: true, enterprise: true },
      { feature: "Codebase analysis", free: false, pro: true, team: true, enterprise: true },
      { feature: "Convention detection", free: false, pro: true, team: true, enterprise: true },
      { feature: "GitHub Enterprise / GitLab", free: false, pro: false, team: false, enterprise: true },
      { feature: "Jira / Linear sync", free: false, pro: false, team: "Add-on", enterprise: true },
      { feature: "Slack notifications", free: false, pro: false, team: true, enterprise: true },
      { feature: "Webhooks & API access", free: false, pro: false, team: true, enterprise: true },
    ],
  },
  {
    category: "Export & Output",
    icon: FileText,
    rows: [
      { feature: "Markdown export", free: true, pro: true, team: true, enterprise: true },
      { feature: "JSON export", free: true, pro: true, team: true, enterprise: true },
      { feature: "MCP export", free: false, pro: true, team: true, enterprise: true },
      { feature: "CLI copy-to-clipboard", free: false, pro: true, team: true, enterprise: true },
      { feature: "Custom export templates", free: false, pro: false, team: true, enterprise: true },
      { feature: "Bulk export / API", free: false, pro: false, team: true, enterprise: true },
    ],
  },
  {
    category: "Quality & Security",
    icon: ShieldCheck,
    rows: [
      { feature: "Production readiness audit", free: false, pro: true, team: true, enterprise: true },
      { feature: "Regression risk scoring", free: false, pro: true, team: true, enterprise: true },
      { feature: "Security vulnerability scan", free: false, pro: false, team: true, enterprise: true },
      { feature: "Compliance checks (OWASP)", free: false, pro: false, team: true, enterprise: true },
      { feature: "Custom audit rules", free: false, pro: false, team: false, enterprise: true },
    ],
  },
  {
    category: "Collaboration",
    icon: Users,
    rows: [
      { feature: "Team members", free: "1", pro: "1", team: "Up to 25", enterprise: "Unlimited" },
      { feature: "Shared workspaces", free: false, pro: false, team: true, enterprise: true },
      { feature: "Shared template library", free: false, pro: false, team: true, enterprise: true },
      { feature: "Decision log & comments", free: false, pro: true, team: true, enterprise: true },
      { feature: "Real-time collaboration", free: false, pro: false, team: true, enterprise: true },
      { feature: "Role-based permissions", free: false, pro: false, team: true, enterprise: true },
      { feature: "Activity & audit log", free: false, pro: false, team: true, enterprise: true },
      { feature: "Team velocity analytics", free: false, pro: false, team: true, enterprise: true },
    ],
  },
  {
    category: "Support & SLA",
    icon: Headphones,
    rows: [
      { feature: "Community Discord", free: true, pro: true, team: true, enterprise: true },
      { feature: "Email support", free: false, pro: "Priority", team: "Priority", enterprise: "Dedicated" },
      { feature: "Slack Connect support", free: false, pro: false, team: true, enterprise: true },
      { feature: "Dedicated success manager", free: false, pro: false, team: false, enterprise: true },
      { feature: "Onboarding & training", free: false, pro: false, team: "Self-serve", enterprise: "White-glove" },
      { feature: "Uptime SLA", free: false, pro: "99.5%", team: "99.9%", enterprise: "99.99%" },
      { feature: "Response time SLA", free: false, pro: false, team: "24h", enterprise: "1h" },
    ],
  },
  {
    category: "Security & Compliance",
    icon: Lock,
    rows: [
      { feature: "SSO / SAML", free: false, pro: false, team: true, enterprise: true },
      { feature: "SCIM provisioning", free: false, pro: false, team: false, enterprise: true },
      { feature: "SOC 2 Type II", free: true, pro: true, team: true, enterprise: true },
      { feature: "HIPAA compliance", free: false, pro: false, team: false, enterprise: true },
      { feature: "Custom data retention", free: false, pro: false, team: false, enterprise: true },
      { feature: "VPC / self-hosted deploy", free: false, pro: false, team: false, enterprise: true },
      { feature: "Dedicated infrastructure", free: false, pro: false, team: false, enterprise: true },
    ],
  },
]

const ENTERPRISE_LOGOS = ["Vercel", "Supabase", "Linear", "Resend", "Raycast", "Stripe"]

const FAQ = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes — upgrade, downgrade, or cancel anytime. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of your next billing cycle and your data is preserved.",
  },
  {
    q: "What counts as an AI generation?",
    a: "Each spec generation, feature decomposition, task breakdown, architecture generation, or production audit counts as one generation. Chat messages within planning sessions are free and unlimited on all plans.",
  },
  {
    q: "How does the 14-day trial work?",
    a: "You get full Pro or Team features for 14 days with no credit card required. If you don't upgrade, you're automatically moved to the Free plan. No data is lost — you just lose access to premium features.",
  },
  {
    q: "Do you offer discounts for startups?",
    a: "Yes! Early-stage startups (under $1M funding) get 50% off Pro or Team for the first year. Open-source maintainers get Pro free forever. Educators and students get 75% off. Contact us to apply.",
  },
  {
    q: "What happens if I hit my generation limit?",
    a: "We'll notify you at 80% and 100% usage. You can upgrade anytime to unlock more generations. On Free, you'll need to wait until the next billing cycle or upgrade. On Pro, you can purchase add-on packs of 100 generations for $9.",
  },
  {
    q: "Is my code and data secure?",
    a: "Absolutely. We never train AI models on your data. All code analysis is ephemeral — we don't store your source code. Data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II audited annually.",
  },
  {
    q: "Can I self-host PlanForge?",
    a: "Self-hosted and VPC deployment options are available on the Enterprise plan. This includes air-gapped environments, custom domains, and dedicated infrastructure. Contact our sales team for details.",
  },
  {
    q: "How do team seats work?",
    a: "On the Team plan, each seat costs $89/mo (or $72/mo annually). You can add or remove seats anytime. All team members share the workspace, templates, and analytics. Enterprise plans offer volume pricing.",
  },
]

/* ──────────────────────────────────────────
   COMPONENTS
   ────────────────────────────────────────── */

function CellValue({ value, highlighted }: { value: string | boolean; highlighted: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <div className={cn(
        "flex h-5 w-5 items-center justify-center rounded-full",
        highlighted ? "bg-lime/20 text-lime" : "bg-forest/10 text-forest"
      )}>
        <Check className="h-3 w-3" strokeWidth={3} />
      </div>
    ) : (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-border/40">
        <X className="h-3 w-3 text-muted-light" strokeWidth={2} />
      </div>
    )
  }
  return (
    <span className={cn(
      "text-sm font-medium",
      highlighted ? "text-white" : "text-navy"
    )}>
      {value}
    </span>
  )
}

/* ──────────────────────────────────────────
   PAGE
   ────────────────────────────────────────── */

export default function PricingPage() {
  const [yearly, setYearly] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(COMPARISON.map((_, i) => i))
  )

  const toggleCategory = (idx: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Nav bar ─── */}
      <Navbar variant="solid" />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-8 sm:px-6 sm:pt-32 sm:pb-12 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-lime/8 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-navy transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to home
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Pick the Plan That
              <br />
              <span className="text-forest">Fits Your Workflow</span>
            </h1>
            <p className="mt-5 text-base text-muted sm:text-lg">
              Every plan includes unlimited specs, AI planning chat, and community support.
              Scale up as your team and products grow.
            </p>
          </motion.div>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 inline-flex items-center rounded-full border border-border bg-white p-1 shadow-xs"
          >
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer",
                !yearly ? "bg-navy text-white shadow-sm" : "text-muted hover:text-navy"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer",
                yearly ? "bg-navy text-white shadow-sm" : "text-muted hover:text-navy"
              )}
            >
              Yearly
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                yearly ? "bg-lime text-navy" : "bg-cream-dark text-muted"
              )}>
                -20%
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Pricing cards ─── */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
          {TIERS.map((tier, i) => {
            const price = yearly ? tier.yearly : tier.monthly
            const Icon = tier.icon
            const isCustom = price === -1

            return (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className={cn(
                  "relative flex flex-col rounded-2xl transition-all",
                  tier.highlighted
                    ? "bg-navy text-white shadow-2xl shadow-navy/20 ring-1 ring-navy lg:-mt-3"
                    : "border border-border bg-white shadow-md shadow-navy/[0.03]"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-2.5 left-5">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm",
                      tier.highlighted ? "bg-lime text-navy" : "bg-navy text-white"
                    )}>
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      tier.highlighted ? "bg-white/10 text-lime" : "bg-cream-dark text-forest"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className={cn("text-base font-bold", tier.highlighted ? "text-white" : "text-navy")}>
                      {tier.name}
                    </h3>
                  </div>

                  <p className={cn("mb-4 text-xs leading-relaxed", tier.highlighted ? "text-white/50" : "text-muted")}>
                    {tier.description}
                  </p>

                  <div className="mb-1 flex items-baseline gap-1">
                    {isCustom ? (
                      <span className={cn("text-3xl font-black", tier.highlighted ? "text-white" : "text-navy")}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`${tier.key}-${yearly}`}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className={cn("text-3xl font-black tabular-nums", tier.highlighted ? "text-white" : "text-navy")}
                          >
                            ${price}
                          </motion.span>
                        </AnimatePresence>
                        {price > 0 ? (
                          <span className={cn("text-xs", tier.highlighted ? "text-white/40" : "text-muted")}>
                            /mo{tier.name === "Team" ? " / seat" : ""}
                          </span>
                        ) : (
                          <span className={cn("text-xs", tier.highlighted ? "text-white/40" : "text-muted")}>free</span>
                        )}
                      </>
                    )}
                  </div>
                  {yearly && price > 0 && (
                    <p className={cn("mb-3 text-[11px]", tier.highlighted ? "text-lime/60" : "text-forest/60")}>
                      Billed ${price * 12}/year &middot; Save ${(tier.monthly - tier.yearly) * 12}
                    </p>
                  )}
                  {(isCustom || (!yearly && price >= 0) || (yearly && price === 0)) && <div className="mb-3" />}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-all cursor-pointer",
                      tier.ctaStyle === "primary"
                        ? "bg-lime text-navy shadow-md shadow-lime/20 hover:shadow-lg"
                        : tier.highlighted
                          ? "border border-white/20 text-white hover:bg-white/10"
                          : "border border-border text-navy hover:bg-cream"
                    )}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-6 text-xs text-muted">
          {[
            { icon: Shield, text: "SOC 2 Type II" },
            { icon: CreditCard, text: "No credit card for trials" },
            { icon: Clock, text: "Cancel anytime" },
            { icon: Gift, text: "Startup & OSS discounts" },
          ].map(({ icon: TIcon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <TIcon className="h-3.5 w-3.5 text-muted-light" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Full feature comparison table ─── */}
      <section className="border-y border-border bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl font-black tracking-tight text-navy sm:text-3xl">
              Compare Every Feature
            </h2>
            <p className="mt-3 text-sm text-muted">
              A detailed breakdown of what&apos;s included in each plan.
            </p>
          </motion.div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Sticky column headers */}
              <div className="sticky top-[65px] z-20 grid grid-cols-[1fr_120px_120px_120px_120px] border-b border-border bg-cream/95 backdrop-blur-md py-3 sm:grid-cols-[1fr_140px_140px_140px_140px]">
                <div className="pl-4 text-[11px] font-bold uppercase tracking-wider text-muted-light">Feature</div>
                {TIERS.map((t) => (
                  <div
                    key={t.key}
                    className={cn(
                      "text-center text-xs font-bold",
                      t.highlighted ? "text-forest" : "text-navy"
                    )}
                  >
                    {t.name}
                    {t.highlighted && (
                      <span className="ml-1.5 inline-block rounded bg-lime/20 px-1 py-px text-[9px] text-forest">
                        Popular
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Categories */}
              {COMPARISON.map((cat, catIdx) => {
                const CatIcon = cat.icon
                const isExpanded = expandedCategories.has(catIdx)

                return (
                  <div key={cat.category}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(catIdx)}
                      className="flex w-full items-center gap-2.5 border-b border-border bg-cream-dark/40 px-4 py-3 text-left hover:bg-cream-dark/60 transition-colors cursor-pointer"
                    >
                      <CatIcon className="h-4 w-4 text-forest" strokeWidth={1.8} />
                      <span className="text-sm font-bold text-navy">{cat.category}</span>
                      <span className="text-[10px] text-muted-light">({cat.rows.length})</span>
                      <ChevronDown className={cn(
                        "ml-auto h-4 w-4 text-muted transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </button>

                    {/* Rows */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {cat.rows.map((row, rowIdx) => (
                            <div
                              key={row.feature}
                              className={cn(
                                "grid grid-cols-[1fr_120px_120px_120px_120px] items-center py-3 px-4 sm:grid-cols-[1fr_140px_140px_140px_140px]",
                                rowIdx < cat.rows.length - 1 && "border-b border-border/50"
                              )}
                            >
                              <span className="text-sm text-navy/80 pr-4">{row.feature}</span>
                              <div className="flex justify-center">
                                <CellValue value={row.free} highlighted={false} />
                              </div>
                              <div className="flex justify-center">
                                <CellValue value={row.pro} highlighted={true} />
                              </div>
                              <div className="flex justify-center">
                                <CellValue value={row.team} highlighted={false} />
                              </div>
                              <div className="flex justify-center">
                                <CellValue value={row.enterprise} highlighted={false} />
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Enterprise CTA ─── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-navy"
          >
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 h-[350px] w-[350px] rounded-full bg-lime/10 blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-forest/15 blur-[100px]" />
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              />
            </div>

            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                {/* Left */}
                <div className="max-w-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/10 px-3 py-1 text-[11px] font-bold text-lime">
                    <Crown className="h-3 w-3" />
                    Enterprise
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Built for Organizations
                    <br />
                    That Ship at Scale
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/50">
                    Custom pricing, advanced security, dedicated infrastructure, and white-glove support
                    for teams that need more than out-of-the-box.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex items-center justify-center gap-2 rounded-xl bg-lime px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-lime/20 transition-all hover:shadow-xl cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Talk to Sales
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </motion.button>
                    <button className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/5 cursor-pointer">
                      Book a Demo
                    </button>
                  </div>
                </div>

                {/* Right — feature list */}
                <div className="grid gap-4 sm:grid-cols-2 lg:max-w-md">
                  {[
                    { icon: Globe, text: "Unlimited everything" },
                    { icon: Server, text: "Self-hosted / VPC deploy" },
                    { icon: Lock, text: "HIPAA & custom compliance" },
                    { icon: FileKey, text: "SSO + SCIM provisioning" },
                    { icon: Blocks, text: "GitHub Enterprise, GitLab, Jira" },
                    { icon: PhoneCall, text: "Dedicated CSM + 1-hour SLA" },
                  ].map(({ icon: FIcon, text }) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-lime">
                        <FIcon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm text-white/70">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trusted by */}
              <div className="mt-12 border-t border-white/[0.06] pt-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/25">
                    Trusted by engineering teams at
                  </span>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    {ENTERPRISE_LOGOS.map((co) => (
                      <span key={co} className="text-sm font-bold text-white/10 hover:text-white/20 transition-colors">
                        {co}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Add-ons ─── */}
      <section className="border-y border-border bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-black tracking-tight text-navy">Add-ons & Extras</h2>
            <p className="mt-2 text-sm text-muted">Available on Pro and Team plans.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Gauge,
                name: "Extra Generations",
                price: "$9",
                unit: "per 100 generations",
                desc: "Top up when you need more AI generations without upgrading your plan.",
              },
              {
                icon: Database,
                name: "Extra Storage",
                price: "$5",
                unit: "per 10 GB / month",
                desc: "Additional file upload and spec attachment storage for larger projects.",
              },
              {
                icon: BarChart3,
                name: "Advanced Analytics",
                price: "$15",
                unit: "per month",
                desc: "Scope creep detection, velocity trends, estimation accuracy, and burndown charts.",
              },
              {
                icon: Bot,
                name: "Priority Agent Queue",
                price: "$19",
                unit: "per month",
                desc: "Skip the queue — your agent dispatches get processed first with dedicated compute.",
              },
              {
                icon: Workflow,
                name: "Jira / Linear Sync",
                price: "$12",
                unit: "per month",
                desc: "Two-way sync tasks and features with Jira, Linear, or Asana. Auto-create tickets.",
              },
              {
                icon: Mail,
                name: "White-Label Export",
                price: "$29",
                unit: "per month",
                desc: "Remove PlanForge branding from all exports. Add your logo to specs and reports.",
              },
            ].map((addon, i) => {
              const AIcon = addon.icon
              return (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-xl border border-border p-5 transition-all hover:border-forest/20 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-dark text-forest transition-colors group-hover:bg-forest/10">
                      <AIcon className="h-4 w-4" strokeWidth={1.8} />
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-navy">{addon.price}</span>
                      <span className="block text-[10px] text-muted">{addon.unit}</span>
                    </div>
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-navy">{addon.name}</h4>
                  <p className="text-xs leading-relaxed text-muted">{addon.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-black tracking-tight text-navy">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-muted">
              Can&apos;t find what you&apos;re looking for?{" "}
              <a href="#" className="font-medium text-forest hover:underline">Chat with our team</a>.
            </p>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-navy pr-4">{item.q}</span>
                  <div className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                    openFaq === i ? "border-forest bg-forest/5 rotate-45" : "border-border"
                  )}>
                    <span className="text-xs text-forest font-bold">+</span>
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-6 py-4">
                        <p className="text-sm leading-relaxed text-muted">{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="border-t border-border bg-cream-dark/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h3 className="text-xl font-black text-navy">Still not sure?</h3>
          <p className="mt-2 text-sm text-muted">
            Start with the free plan — no credit card required. Upgrade when you&apos;re ready.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-forest transition-colors"
            >
              <Rocket className="h-4 w-4" />
              Get Started Free
            </Link>
            <button className="flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-navy hover:bg-cream transition-colors cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              Talk to Sales
            </button>
          </div>
        </div>
      </section>

      {/* ─── Mini footer ─── */}
      <footer className="border-t border-border bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted">&copy; {new Date().getFullYear()} PlanForge AI, Inc.</p>
          <div className="flex gap-4 text-xs text-muted">
            <Link href="/privacy" className="hover:text-navy transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-navy transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-navy transition-colors">Security</Link>
            <Link href="/" className="hover:text-navy transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
