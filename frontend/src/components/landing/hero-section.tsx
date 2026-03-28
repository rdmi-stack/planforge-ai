"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import {
  Sparkles,
  ArrowRight,
  Zap,
  FileText,
  ListTree,
  Send,
  CheckCircle2,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Typing placeholder animation ─── */
const PLACEHOLDERS = [
  "Build me a SaaS dashboard with Stripe billing...",
  "Create an AI chatbot with RAG and memory...",
  "Design a multi-tenant project management app...",
  "Build a real-time collaboration tool like Figma...",
  "Create an e-commerce platform with inventory...",
]

function useTypingPlaceholder() {
  const [text, setText] = useState("")
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const phrase = PLACEHOLDERS[phraseIndex]
    const speed = isDeleting ? 25 : 45
    const pauseEnd = 2000
    const pauseStart = 400

    if (!isDeleting && charIndex === phrase.length) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseEnd)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && charIndex === 0) {
      const timeout = setTimeout(() => {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
      }, pauseStart)
      return () => clearTimeout(timeout)
    }

    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1))
      setText(phrase.slice(0, charIndex + (isDeleting ? -1 : 1)))
    }, speed)
    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex])

  return text
}

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const float = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 3 + i * 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }),
}

/* ─── Avatars for social proof ─── */
const AVATARS = [
  { initials: "AC", bg: "bg-violet-500" },
  { initials: "SK", bg: "bg-blue-500" },
  { initials: "MR", bg: "bg-emerald-500" },
  { initials: "JP", bg: "bg-orange-500" },
  { initials: "LW", bg: "bg-pink-500" },
]

/* ─── Floating workflow cards ─── */
const WORKFLOW_STEPS = [
  { icon: FileText, label: "Spec Generated", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
  { icon: ListTree, label: "12 Tasks Created", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
  { icon: Send, label: "Dispatched to Agent", color: "text-violet-500", bg: "bg-violet-50", border: "border-violet-100" },
  { icon: CheckCircle2, label: "Build Complete", color: "text-lime", bg: "bg-lime/10", border: "border-lime/20" },
]

export function HeroSection() {
  const typingText = useTypingPlaceholder()
  const [inputValue, setInputValue] = useState("")
  const [inputFocused, setInputFocused] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left - rect.width / 2) / 40)
    mouseY.set((e.clientY - rect.top - rect.height / 2) / 40)
  }

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8"
    >
      {/* ─── Ambient background ─── */}
      <div className="pointer-events-none absolute inset-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #0F1729 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Primary glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.12, 0.18, 0.12],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-lime blur-[150px]"
        />
        {/* Secondary glow */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.06, 0.1, 0.06],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] left-[20%] h-[400px] w-[400px] rounded-full bg-forest blur-[120px]"
        />
        {/* Accent glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[20%] right-[15%] h-[350px] w-[350px] rounded-full bg-blue-400 blur-[130px]"
        />
        {/* Radial fade at edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-cream)_75%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
        {/* ─── Pill badge ─── */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <span className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted backdrop-blur-md shadow-xs transition-all hover:border-lime/40 hover:shadow-lime/10">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
            </span>
            Now in Public Beta
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </motion.div>

        {/* ─── Headline ─── */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 max-w-4xl text-[2.75rem] font-black leading-[1.05] tracking-[-0.035em] text-navy sm:text-6xl md:text-7xl lg:text-[5.25rem]"
        >
          Build Like a{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Top Developer</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className="absolute bottom-1 left-0 z-0 h-3 w-full origin-left bg-lime/40 sm:bottom-2 sm:h-4"
            />
          </span>
          <br />
          <span className="bg-linear-to-r from-forest via-forest-light to-forest bg-clip-text text-transparent">
            Ship 10x Faster
          </span>
        </motion.h1>

        {/* ─── Subtitle ─── */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg md:text-xl"
        >
          PlanForge is the{" "}
          <span className="font-semibold text-navy">AI Product Planner</span>{" "}
          that helps you shape ideas, plan features, and scope tasks that your
          AI coding tools{" "}
          <span className="underline decoration-lime decoration-2 underline-offset-4 font-medium text-navy">
            can build right the first time
          </span>
          .
        </motion.p>

        {/* ─── CTA Input ─── */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 w-full max-w-2xl"
        >
          <div
            className={cn(
              "relative flex flex-col sm:flex-row items-stretch rounded-2xl border bg-white overflow-hidden transition-all duration-300",
              inputFocused
                ? "border-forest/30 shadow-xl shadow-forest/5 ring-2 ring-forest/10"
                : "border-border shadow-lg shadow-navy/5 hover:shadow-xl hover:border-border"
            )}
          >
            {/* Input icon */}
            <div className="flex items-center gap-3 flex-1 px-5">
              <div className="shrink-0 text-muted-light">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="18" rx="1.5" />
                  <rect x="14" y="3" width="7" height="18" rx="1.5" />
                </svg>
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className="w-full py-4 sm:py-5 text-[15px] sm:text-base bg-transparent outline-none text-navy"
                  placeholder=""
                />
                {/* Typing placeholder */}
                {!inputValue && !inputFocused && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[15px] sm:text-base text-muted-light">
                    {typingText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                      className="ml-px inline-block h-[18px] w-[2px] bg-muted-light"
                    />
                  </span>
                )}
                {inputFocused && !inputValue && (
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[15px] sm:text-base text-muted-light">
                    Describe what you want to build...
                  </span>
                )}
              </div>
            </div>
            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-navy px-7 py-4 sm:py-5 text-[15px] sm:text-base font-semibold text-white transition-all hover:bg-navy-light shrink-0 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Start
            </motion.button>
          </div>

          {/* Sub-CTA */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <span className="text-sm text-muted">
              Free to try &middot; No credit card required
            </span>
            <span className="hidden sm:block h-3 w-px bg-border" />
            <button className="flex items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-light transition-colors">
              <Play className="h-3 w-3 fill-forest" />
              Watch demo
            </button>
          </div>
        </motion.div>

        {/* ─── Social proof row ─── */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
        >
          {/* Avatar stack */}
          <div className="flex items-center">
            {AVATARS.map((avatar, i) => (
              <div
                key={avatar.initials}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream text-[11px] font-bold text-white",
                  avatar.bg,
                  i > 0 && "-ml-2.5"
                )}
              >
                {avatar.initials}
              </div>
            ))}
            <div className="flex -ml-2.5 h-9 w-9 items-center justify-center rounded-full border-2 border-cream bg-cream-dark text-[10px] font-semibold text-muted">
              +2k
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-sm font-semibold text-navy">4.9</span>
            <span className="text-sm text-muted">&middot; Loved by 2,400+ AI builders</span>
          </div>
        </motion.div>

        {/* ─── Floating workflow cards ─── */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 w-full"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.label}
                  custom={i}
                  variants={float}
                  animate="animate"
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3.5 backdrop-blur-sm bg-white/80",
                    step.border
                  )}
                >
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", step.bg)}>
                    <Icon className={cn("h-4 w-4", step.color)} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-navy truncate">{step.label}</p>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
                      <motion.div
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.3, ease: "easeOut" }}
                        className={cn("h-full rounded-full", step.bg.replace("/10", ""), `bg-current ${step.color}`)}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ─── Product preview mockup ─── */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-12 w-full"
        >
          <div className="relative mx-auto max-w-4xl">
            {/* Browser chrome */}
            <div className="rounded-t-xl border border-b-0 border-border bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-danger/60" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="mx-auto flex h-7 w-72 items-center justify-center rounded-md bg-cream-dark px-3">
                  <span className="text-[11px] text-muted">app.planforge.ai/projects/my-saas</span>
                </div>
              </div>
            </div>

            {/* App mockup */}
            <div className="overflow-hidden rounded-b-xl border border-border bg-white">
              <div className="flex">
                {/* Sidebar mock */}
                <div className="hidden w-52 shrink-0 border-r border-border bg-cream/50 p-4 sm:block">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <div className="h-4 w-1 rounded-sm bg-forest" />
                      <div className="h-3 w-1 rounded-sm bg-forest" />
                      <div className="h-4 w-1 rounded-sm bg-forest" />
                    </div>
                    <span className="text-xs font-bold text-navy">PlanForge</span>
                  </div>
                  {["Projects", "Specs", "Features", "Tasks", "Agents"].map((item, i) => (
                    <div
                      key={item}
                      className={cn(
                        "mb-1 rounded-lg px-3 py-2 text-xs font-medium",
                        i === 3 ? "bg-forest/10 text-forest" : "text-muted"
                      )}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content mock */}
                <div className="flex-1 p-5 sm:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-navy">Task Board</div>
                      <div className="text-[11px] text-muted">My SaaS App &middot; 12 tasks</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-md bg-lime/20 px-2.5 py-1 text-[10px] font-semibold text-forest">
                        <Zap className="mr-1 inline h-3 w-3" />
                        AI Generated
                      </div>
                    </div>
                  </div>

                  {/* Kanban columns */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { title: "To Do", count: 4, cards: ["Setup auth flow", "Create DB schema", "API routes"] },
                      { title: "In Progress", count: 3, cards: ["Dashboard layout", "Stripe integration"] },
                      { title: "Done", count: 5, cards: ["Project scaffold", "CI/CD pipeline"] },
                    ].map((col) => (
                      <div key={col.title} className="rounded-lg bg-cream/60 p-2.5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-navy">{col.title}</span>
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-border text-[9px] font-bold text-muted">
                            {col.count}
                          </span>
                        </div>
                        {col.cards.map((card) => (
                          <div
                            key={card}
                            className="mb-1.5 rounded-md bg-white p-2 text-[10px] text-navy shadow-xs border border-border/50"
                          >
                            {card}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glow behind mockup */}
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-linear-to-b from-lime/5 via-transparent to-transparent blur-xl" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
