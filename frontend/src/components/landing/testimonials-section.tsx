"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote, Twitter, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const TESTIMONIALS = [
  {
    quote:
      "PlanForge turned my weekend project into a production app. The spec it generated caught edge cases I never would have thought of — auth token refresh, race conditions in real-time sync, webhook retry logic. All handled before I wrote a line of code.",
    name: "Alex Chen",
    role: "Indie Hacker",
    company: "ShipFast",
    avatar: "AC",
    avatarBg: "bg-violet-500",
    metric: "3x",
    metricLabel: "faster to production",
    handle: "@alexbuilds",
  },
  {
    quote:
      "We went from 2-day planning sessions to 20-minute PlanForge specs. Our agents actually build what we want now. The feature decomposition alone saved us from shipping a half-baked MVP to our biggest client.",
    name: "Sarah Kim",
    role: "Product Manager",
    company: "DevStack Agency",
    avatar: "SK",
    avatarBg: "bg-blue-500",
    metric: "80%",
    metricLabel: "fewer agent retries",
    handle: "@sarahkim_pm",
  },
  {
    quote:
      "The codebase-aware planning is a game-changer. Tasks reference our actual file structure, naming conventions, and existing patterns. It's like having a senior architect who memorized our entire repo reviewing every prompt.",
    name: "Marcus Rodriguez",
    role: "CTO",
    company: "LaunchPad AI",
    avatar: "MR",
    avatarBg: "bg-emerald-500",
    metric: "0",
    metricLabel: "regressions shipped",
    handle: "@marcusdev",
  },
  {
    quote:
      "I'm non-technical and PlanForge made it possible for me to direct AI agents effectively. The smart questions helped me think through my product properly, and the generated tasks were specific enough that Cursor built exactly what I needed.",
    name: "Priya Patel",
    role: "Non-Technical Founder",
    company: "FinTrack",
    avatar: "PP",
    avatarBg: "bg-pink-500",
    metric: "1 week",
    metricLabel: "idea to launch",
    handle: "@priyabuilds",
  },
  {
    quote:
      "We onboarded PlanForge for our entire 12-person dev team. The shared templates and consistent task format means our AI output quality doesn't depend on who writes the prompt anymore. Total game changer for agency work.",
    name: "James Wright",
    role: "Engineering Lead",
    company: "Pixel Labs",
    avatar: "JW",
    avatarBg: "bg-amber-500",
    metric: "12",
    metricLabel: "devs onboarded in a day",
    handle: "@jwright_eng",
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const paginate = (dir: number) => {
    setDirection(dir)
    setActiveIndex((prev) =>
      dir === 1
        ? prev === TESTIMONIALS.length - 1 ? 0 : prev + 1
        : prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
    )
  }

  /* Auto-advance */
  useEffect(() => {
    const timer = setInterval(() => paginate(1), 6000)
    return () => clearInterval(timer)
  }, [activeIndex])

  const active = TESTIMONIALS[activeIndex]

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-forest/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header — unique horizontal layout with rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col items-center justify-between gap-6 sm:flex-row"
        >
          <div>
            <span className="mb-3 inline-block rounded-full border border-border bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted backdrop-blur-sm">
              Wall of Love
            </span>
            <h2 className="text-3xl font-black tracking-tight text-navy sm:text-4xl">
              Don&apos;t take our word for it.
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-2xl font-black text-navy">4.9</span>
                <span className="text-sm text-muted">/5</span>
              </div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted">from 400+ reviews</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Featured testimonial — large spotlight card ─── */}
        <div ref={containerRef} className="relative mb-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -60, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-navy/[0.04] lg:grid-cols-[1fr_340px]"
            >
              {/* Quote side */}
              <div className="relative p-8 sm:p-10 lg:p-12">
                {/* Large quote mark */}
                <Quote className="mb-6 h-10 w-10 text-lime/60" strokeWidth={1} />

                <blockquote className="mb-8 text-lg font-medium leading-relaxed text-navy sm:text-xl lg:text-[22px] lg:leading-[1.65]">
                  {active.quote}
                </blockquote>

                {/* Author row */}
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg",
                      active.avatarBg
                    )}
                  >
                    {active.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy">{active.name}</div>
                    <div className="text-xs text-muted">
                      {active.role} at {active.company}
                    </div>
                  </div>
                  <div className="ml-auto hidden items-center gap-1.5 text-xs text-muted-light sm:flex">
                    <Twitter className="h-3.5 w-3.5" />
                    {active.handle}
                  </div>
                </div>
              </div>

              {/* Metric side — full height colored panel */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center border-t border-border bg-cream/50 p-8 lg:border-t-0 lg:border-l"
                )}
              >
                <div className="mb-2 text-6xl font-black text-forest sm:text-7xl">
                  {active.metric}
                </div>
                <div className="text-sm font-medium uppercase tracking-wider text-muted">
                  {active.metricLabel}
                </div>
                <div className="mt-6 h-px w-16 bg-border" />
                <p className="mt-4 max-w-[200px] text-center text-xs leading-relaxed text-muted-light">
                  Real results from {active.name.split(" ")[0]}&apos;s team after switching to PlanForge
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <div className="absolute -bottom-6 right-6 flex gap-2 sm:bottom-auto sm:right-auto sm:-left-5 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col lg:-left-6">
            <button
              onClick={() => paginate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted shadow-sm transition-all hover:border-forest hover:text-navy hover:shadow-md cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => paginate(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted shadow-sm transition-all hover:border-forest hover:text-navy hover:shadow-md cursor-pointer"
              aria-label="Next testimonial"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ─── Thumbnail strip ─── */}
        <div className="flex items-center justify-center gap-3 pt-6">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.name}
              onClick={() => {
                setDirection(i > activeIndex ? 1 : -1)
                setActiveIndex(i)
              }}
              className={cn(
                "group flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all cursor-pointer",
                i === activeIndex
                  ? "border-forest bg-forest/5 shadow-sm"
                  : "border-transparent hover:border-border hover:bg-white"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white transition-transform",
                  t.avatarBg,
                  i === activeIndex && "scale-110"
                )}
              >
                {t.avatar}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium transition-colors sm:block",
                  i === activeIndex ? "text-navy" : "text-muted-light group-hover:text-muted"
                )}
              >
                {t.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* ─── Company logos strip ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-light">
            Trusted by teams at
          </span>
          {["ShipFast", "DevStack", "LaunchPad AI", "FinTrack", "Pixel Labs", "NexGen", "CodeCraft"].map((co) => (
            <span key={co} className="text-sm font-semibold text-navy/20 transition-colors hover:text-navy/40">
              {co}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
