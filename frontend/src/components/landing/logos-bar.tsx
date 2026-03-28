"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const INTEGRATIONS = [
  {
    name: "Claude Code",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.3" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    name: "Cursor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    name: "Codex",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    name: "Windsurf",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M2 20C6 14 10 10 18 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 20C8 16 12 13 18 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
        <path d="M7 20C10 17 14 15 18 13" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.2" />
      </svg>
    ),
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    name: "GitHub Copilot",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
      </svg>
    ),
    color: "text-gray-800",
    bg: "bg-gray-50",
  },
  {
    name: "Replit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 8l6 4-6 4V8z" fill="currentColor" opacity="0.6" />
      </svg>
    ),
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
]

export function LogosBar() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-white/60 backdrop-blur-sm py-14 px-4 sm:px-6 lg:px-8">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-lime/40 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-light">
            Works seamlessly with your favorite AI coding tools
          </p>
        </motion.div>

        {/* Logo grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {INTEGRATIONS.map((integration, i) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -3, scale: 1.03 }}
              className="group relative flex flex-col items-center gap-3 rounded-xl border border-transparent bg-transparent px-4 py-5 transition-all duration-300 hover:border-border hover:bg-white hover:shadow-lg hover:shadow-navy/[0.03]"
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-b from-lime/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 transition-all duration-300 group-hover:border-transparent group-hover:shadow-md",
                  integration.bg,
                  integration.color
                )}
              >
                {integration.icon}
              </div>
              <span className="text-[13px] font-medium text-muted transition-colors group-hover:text-navy">
                {integration.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Bottom connector text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex items-center justify-center gap-2"
        >
          <div className="h-px w-8 bg-border" />
          <p className="text-xs text-muted-light">
            Export tasks to <span className="font-medium text-muted">any agent</span> with one click
          </p>
          <div className="h-px w-8 bg-border" />
        </motion.div>
      </div>

      {/* Subtle bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-forest/20 to-transparent" />
    </section>
  )
}
