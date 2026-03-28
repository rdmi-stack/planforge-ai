"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh]">
      {/* ─── Left panel — branding ─── */}
      <div className="relative hidden w-[480px] shrink-0 overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-between xl:w-[540px]">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full bg-lime blur-[140px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-forest-light blur-[120px]"
          />
        </div>

        {/* Top — logo */}
        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex items-center gap-0.5">
              <div className="h-7 w-1.5 rounded-sm bg-lime" />
              <div className="h-5 w-1.5 rounded-sm bg-lime/60" />
              <div className="h-7 w-1.5 rounded-sm bg-lime" />
            </div>
            <span className="text-xl font-bold text-white">PlanForge</span>
          </Link>
        </div>

        {/* Center — value prop */}
        <div className="relative z-10 px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl">
              From idea to
              <br />
              production code,
              <br />
              <span className="text-lime">autonomously.</span>
            </h2>
            <p className="mt-5 max-w-[340px] text-sm leading-relaxed text-white/50">
              Join 2,400+ AI builders who plan smarter and ship faster with
              PlanForge&apos;s AI-powered planning engine.
            </p>
          </motion.div>

          {/* Testimonial card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.04] p-5 backdrop-blur-sm"
          >
            <p className="text-sm leading-relaxed text-white/60 italic">
              &ldquo;PlanForge turned my weekend project into a production app.
              The spec caught edge cases I never would have thought of.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                AC
              </div>
              <div>
                <div className="text-xs font-semibold text-white/80">Alex Chen</div>
                <div className="text-[11px] text-white/30">Indie Hacker, ShipFast</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom — stats */}
        <div className="relative z-10 p-10">
          <div className="flex gap-8">
            {[
              { value: "50K+", label: "Tasks" },
              { value: "98%", label: "Accuracy" },
              { value: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-lg font-black text-lime">{stat.value}</div>
                <div className="text-[11px] text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right panel — form area ─── */}
      <div className="flex flex-1 flex-col">
        {/* Mobile logo bar */}
        <div className="flex items-center justify-between p-5 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <div className="h-5 w-1 rounded-sm bg-forest" />
              <div className="h-3.5 w-1 rounded-sm bg-forest" />
              <div className="h-5 w-1 rounded-sm bg-forest" />
            </div>
            <span className="text-lg font-bold text-navy">PlanForge</span>
          </Link>
        </div>

        {/* Form content — centered */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
