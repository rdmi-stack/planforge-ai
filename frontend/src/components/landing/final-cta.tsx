"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  ArrowRight,
  Rocket,
  Clock,
  CreditCard,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const PROMISES = [
  { icon: Clock, text: "Setup in 2 minutes" },
  { icon: CreditCard, text: "No credit card needed" },
  { icon: Zap, text: "First spec in 30 seconds" },
]

export function FinalCta() {
  const [email, setEmail] = useState("")
  const [hovered, setHovered] = useState(false)

  return (
    <section className="relative isolate overflow-hidden">
      {/* ─── Gradient background — cream to forest transition ─── */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-cream via-forest/[0.03] to-forest" />

      {/* Animated mesh orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-lime/15 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-lime/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-24 pb-32 sm:px-6 sm:pt-32 sm:pb-40 lg:px-8">
        {/* ─── Top — large text block ─── */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white/80 px-4 py-2 text-xs font-semibold text-forest shadow-xs backdrop-blur-sm"
          >
            <Rocket className="h-3.5 w-3.5" />
            Join 2,400+ AI Builders
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-navy sm:text-5xl lg:text-6xl"
          >
            Stop Wasting Time on
            <br />
            <span className="relative inline-block mt-1">
              <span className="relative z-10 text-white">Bad AI Prompts</span>
              <span className="absolute inset-x-0 bottom-0 -z-0 h-[65%] rounded-md bg-forest" />
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg"
          >
            PlanForge gives your AI agents the context they need to build
            production-grade code — on the first try, every time.
          </motion.p>
        </div>

        {/* ─── Email capture card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-12 max-w-lg"
        >
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
              "rounded-2xl border bg-white p-2 transition-all duration-500",
              hovered
                ? "border-forest/20 shadow-2xl shadow-forest/10"
                : "border-border shadow-xl shadow-navy/5"
            )}
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-xl bg-cream/60 px-5 py-4 text-sm text-navy outline-none placeholder:text-muted-light focus:bg-cream"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center justify-center gap-2 rounded-xl bg-navy px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-forest cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </div>
          </div>

          {/* Promises */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {PROMISES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-muted">
                <Icon className="h-3.5 w-3.5 text-forest" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Social proof ticker ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-col items-center"
        >
          <div className="flex -space-x-2">
            {[
              "bg-violet-500",
              "bg-blue-500",
              "bg-emerald-500",
              "bg-pink-500",
              "bg-amber-500",
              "bg-sky-500",
              "bg-rose-500",
              "bg-teal-500",
            ].map((bg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white",
                  bg
                )}
              >
                {String.fromCharCode(65 + i)}
                {String.fromCharCode(65 + ((i + 3) % 26))}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="h-3 w-3 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted">
                <span className="font-semibold text-navy">4.9/5</span> from 400+ reviews
              </span>
            </div>
            <p className="text-[11px] text-muted-light">
              Loved by indie hackers, agencies, and startup CTOs
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
