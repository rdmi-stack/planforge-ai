"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Sparkles,
  ArrowRight,
  Infinity,
  Shield,
  Headphones,
  Building2,
  Zap,
  Crown,
  Users,
  Globe,
  Lock,
  Server,
  PhoneCall,
  FileKey,
  Blocks,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

const TIERS = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    badge: null,
    description: "Perfect for trying PlanForge on a side project.",
    icon: Zap,
    features: [
      { text: "2 active projects", included: true },
      { text: "30 AI generations / month", included: true },
      { text: "Basic spec generation", included: true },
      { text: "Markdown & JSON export", included: true },
      { text: "Community Discord access", included: true },
      { text: "Feature decomposition", included: false },
      { text: "Agent orchestration", included: false },
      { text: "Codebase analysis", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started Free",
    ctaStyle: "outline" as const,
    highlighted: false,
  },
  {
    name: "Pro",
    monthly: 39,
    yearly: 32,
    badge: "Most Popular",
    description: "For builders shipping real products with AI agents.",
    icon: Sparkles,
    features: [
      { text: "Unlimited projects", included: true },
      { text: "500 AI generations / month", included: true },
      { text: "Advanced spec + PRD generation", included: true },
      { text: "All export formats (MCP, CLI, MD)", included: true },
      { text: "Full feature decomposition", included: true },
      { text: "Multi-agent orchestration", included: true },
      { text: "GitHub codebase analysis", included: true },
      { text: "Production readiness audit", included: true },
      { text: "Priority email support", included: true },
    ],
    cta: "Start 14-Day Free Trial",
    ctaStyle: "primary" as const,
    highlighted: true,
  },
  {
    name: "Team",
    monthly: 89,
    yearly: 72,
    badge: "Best Value",
    description: "For dev teams and agencies collaborating at scale.",
    icon: Users,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited AI generations", included: true },
      { text: "Up to 25 team members", included: true },
      { text: "Shared workspace & templates", included: true },
      { text: "Team analytics & velocity tracking", included: true },
      { text: "Admin controls & permissions", included: true },
      { text: "SSO / SAML authentication", included: true },
      { text: "Custom agent configurations", included: true },
      { text: "Dedicated Slack support + SLA", included: true },
    ],
    cta: "Start Team Trial",
    ctaStyle: "outline" as const,
    highlighted: false,
  },
]

const ENTERPRISE_FEATURES = [
  { icon: Globe, title: "Unlimited Everything", desc: "No caps on projects, generations, users, or workspaces." },
  { icon: Server, title: "Self-Hosted / VPC Deploy", desc: "Run PlanForge on your own infrastructure or private cloud." },
  { icon: Lock, title: "Advanced Security", desc: "SOC 2 Type II, HIPAA-ready, custom data retention policies." },
  { icon: FileKey, title: "SSO + SCIM Provisioning", desc: "Okta, Azure AD, Google Workspace — auto user management." },
  { icon: Blocks, title: "Custom Integrations", desc: "Private GitHub Enterprise, GitLab, Bitbucket, Jira, Linear." },
  { icon: PhoneCall, title: "Dedicated Success Manager", desc: "Named CSM, onboarding, quarterly reviews, 1-hour SLA." },
]

const FAQ = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes — upgrade, downgrade, or cancel anytime. Changes take effect at the start of your next billing cycle. Downgrades preserve your data, you just lose access to premium features.",
  },
  {
    q: "What counts as an AI generation?",
    a: "Each spec generation, feature decomposition, task breakdown, or architecture generation counts as one generation. Chat messages within a planning session are free and unlimited on all plans.",
  },
  {
    q: "Do you offer discounts for startups?",
    a: "Yes! Early-stage startups with under $1M in funding qualify for 50% off Pro or Team for the first year. Open-source maintainers get Pro free. Contact us to apply.",
  },
  {
    q: "How does the 14-day trial work?",
    a: "You get full Pro or Team features for 14 days. No credit card required to start. If you don't upgrade, you'll be moved to the Free plan — no data is lost.",
  },
  {
    q: "Is my code and data secure?",
    a: "Absolutely. We never train AI models on your data. All code analysis is ephemeral and encrypted in transit (TLS 1.3) and at rest (AES-256). SOC 2 Type II audited annually.",
  },
]

export function PricingSection() {
  const [yearly, setYearly] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section id="pricing" className="relative bg-cream-dark/40 py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <h2 className="text-3xl font-black tracking-tight text-navy sm:text-4xl lg:text-5xl">
            Simple Pricing. No Surprises.
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Start free, scale when your product takes off.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-border bg-white p-1 shadow-xs">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer",
                !yearly ? "bg-navy text-white shadow-sm" : "text-muted hover:text-navy"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-all cursor-pointer",
                yearly ? "bg-navy text-white shadow-sm" : "text-muted hover:text-navy"
              )}
            >
              Yearly
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors",
                  yearly ? "bg-lime text-navy" : "bg-cream-dark text-muted"
                )}
              >
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* ─── Pricing cards ─── */}
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {TIERS.map((tier, i) => {
            const price = yearly ? tier.yearly : tier.monthly
            const Icon = tier.icon

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative flex flex-col rounded-3xl transition-all",
                  tier.highlighted
                    ? "bg-navy text-white shadow-2xl shadow-navy/20 ring-1 ring-navy lg:-mt-4 lg:mb-0"
                    : "border border-border bg-white shadow-lg shadow-navy/[0.03]"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-6">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold shadow-sm",
                        tier.highlighted ? "bg-lime text-navy" : "bg-navy text-white"
                      )}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan header */}
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        tier.highlighted ? "bg-white/10 text-lime" : "bg-cream-dark text-forest"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={cn("text-lg font-bold", tier.highlighted ? "text-white" : "text-navy")}>
                        {tier.name}
                      </h3>
                      <p className={cn("text-xs", tier.highlighted ? "text-white/50" : "text-muted")}>
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-1 flex items-baseline gap-1.5">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${tier.name}-${yearly}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "text-5xl font-black tabular-nums",
                          tier.highlighted ? "text-white" : "text-navy"
                        )}
                      >
                        ${price}
                      </motion.span>
                    </AnimatePresence>
                    {price > 0 ? (
                      <div className={cn("text-sm", tier.highlighted ? "text-white/40" : "text-muted")}>
                        <span>/month</span>
                        {tier.name === "Team" && <span className="block text-xs">per seat</span>}
                      </div>
                    ) : (
                      <span className={cn("text-sm", tier.highlighted ? "text-white/40" : "text-muted")}>
                        forever free
                      </span>
                    )}
                  </div>

                  {/* Yearly savings callout */}
                  {yearly && price > 0 && (
                    <p className={cn("mb-4 text-xs", tier.highlighted ? "text-lime/70" : "text-forest/70")}>
                      Save ${(tier.monthly - tier.yearly) * 12}/year with annual billing
                    </p>
                  )}
                  {(!yearly || price === 0) && <div className="mb-4" />}

                  {/* Divider */}
                  <div className={cn("mb-6 h-px", tier.highlighted ? "bg-white/10" : "bg-border")} />

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2.5">
                        {f.included ? (
                          <div
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                              tier.highlighted ? "bg-lime/20 text-lime" : "bg-forest/10 text-forest"
                            )}
                          >
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-border/50 text-muted-light">
                            <span className="text-[8px]">—</span>
                          </div>
                        )}
                        <span
                          className={cn(
                            "text-sm",
                            f.included
                              ? tier.highlighted ? "text-white/80" : "text-navy/80"
                              : tier.highlighted ? "text-white/25" : "text-muted-light"
                          )}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all cursor-pointer",
                      tier.ctaStyle === "primary"
                        ? "bg-lime text-navy shadow-md shadow-lime/20 hover:shadow-lg hover:shadow-lime/30"
                        : tier.highlighted
                          ? "border border-white/20 text-white hover:bg-white/10"
                          : "border border-border text-navy hover:bg-cream hover:border-forest/20"
                    )}
                  >
                    {tier.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ─── Trust strip ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted"
        >
          {[
            { icon: Shield, text: "SOC 2 Type II compliant" },
            { icon: Infinity, text: "Unlimited specs on all plans" },
            { icon: Headphones, text: "Cancel anytime, no lock-in" },
          ].map(({ icon: TIcon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <TIcon className="h-3.5 w-3.5 text-muted-light" />
              {text}
            </div>
          ))}
        </motion.div>

        {/* ─── Enterprise section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl border border-border bg-white">
            {/* Top accent */}
            <div className="h-1 w-full bg-linear-to-r from-forest via-lime to-forest" />

            <div className="p-8 sm:p-10 lg:p-12">
              {/* Header row */}
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-navy to-forest text-white shadow-lg">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black tracking-tight text-navy">Enterprise</h3>
                      <span className="rounded-full bg-forest/10 px-3 py-0.5 text-[11px] font-bold text-forest">
                        Custom Pricing
                      </span>
                    </div>
                    <p className="mt-1 max-w-md text-sm text-muted leading-relaxed">
                      For organizations that need advanced security, compliance, dedicated infrastructure,
                      and white-glove onboarding for large teams.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group flex items-center justify-center gap-2 rounded-xl bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy/10 transition-all hover:bg-forest cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Talk to Sales
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-cream cursor-pointer">
                    Book a Demo
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="my-8 h-px bg-border" />

              {/* Feature grid */}
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {ENTERPRISE_FEATURES.map((feat, i) => {
                  const FIcon = feat.icon
                  return (
                    <motion.div
                      key={feat.title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-dark text-forest">
                        <FIcon className="h-4 w-4" strokeWidth={1.8} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-navy">{feat.title}</h4>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted">{feat.desc}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Trusted by logos */}
              <div className="mt-10 rounded-xl bg-cream/60 border border-border/50 px-6 py-5">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-light">
                    Trusted by engineering teams at
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
                    {["Vercel", "Supabase", "Linear", "Resend", "Raycast"].map((co) => (
                      <span key={co} className="text-sm font-bold text-navy/15 transition-colors hover:text-navy/30">
                        {co}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── FAQ ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 mx-auto max-w-2xl"
        >
          <h3 className="mb-8 text-center text-xl font-bold text-navy">
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-navy pr-4">{item.q}</span>
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
                      openFaq === i ? "border-forest bg-forest/5 rotate-45" : "border-border"
                    )}
                  >
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
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
