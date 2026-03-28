"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Github, Twitter, Linkedin, Youtube, Mail, MapPin, Grip } from "lucide-react"
import { cn } from "@/lib/utils"
import { FOOTER_COLUMNS } from "@/lib/constants"

const SOCIALS = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
]

const BADGES = [
  "SOC 2 Type II",
  "GDPR Compliant",
  "99.9% Uptime",
]

export function Footer() {
  return (
    <footer className="relative bg-navy">
      {/* Top decorative line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-lime/30 to-transparent" />

      {/* ─── Newsletter bar ─── */}
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
          <div>
            <h4 className="text-base font-bold text-white">
              Stay ahead of the AI development curve
            </h4>
            <p className="mt-1 text-sm text-muted-light">
              Weekly insights on AI-powered product planning. No spam.
            </p>
          </div>
          <div className="flex w-full max-w-sm items-stretch gap-2">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-muted-light focus:border-lime/30 focus:ring-1 focus:ring-lime/20"
            />
            <button className="shrink-0 rounded-lg bg-lime px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-lime-hover cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main footer grid ─── */}
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand column — takes 2 cols */}
          <div className="lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <div className="flex items-center gap-0.5 transition-transform group-hover:scale-105">
                <div className="h-7 w-1.5 rounded-sm bg-lime" />
                <div className="h-5 w-1.5 rounded-sm bg-lime/60" />
                <div className="h-7 w-1.5 rounded-sm bg-lime" />
              </div>
              <span className="text-xl font-bold text-white">PlanForge</span>
            </Link>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-muted">
              AI-powered product planning that turns your ideas into
              production-ready code. Built for the builders who ship.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex gap-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-muted transition-all hover:border-lime/20 hover:bg-lime/10 hover:text-lime"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Compliance badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {BADGES.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-muted-light"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
                    >
                      <span className="h-px w-0 bg-lime transition-all group-hover:w-2" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="mt-14 border-t border-white/[0.06] pt-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Left */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <p className="text-xs text-muted">
                &copy; {new Date().getFullYear()} PlanForge AI, Inc.
              </p>
              <span className="hidden text-muted/30 sm:inline">&middot;</span>
              <div className="flex gap-4 text-xs text-muted">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link href="/security" className="hover:text-white transition-colors">Security</Link>
              </div>
            </div>

            {/* Right — status + tech */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                All systems operational
              </div>
              <span className="text-muted/20">&middot;</span>
              <span className="text-[11px] text-muted/40">
                Crafted for builders who ship
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
