"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_LINKS } from "@/lib/constants"

type NavbarProps = {
  /** "transparent" starts clear and gains bg on scroll (landing). "solid" always has bg. */
  variant?: "transparent" | "solid"
}

export function Navbar({ variant = "transparent" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (variant === "solid") return
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [variant])

  const showBg = variant === "solid" || scrolled

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        showBg
          ? "bg-cream/80 backdrop-blur-xl border-b border-border shadow-xs"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center gap-0.5">
            <div className="h-7 w-1.5 rounded-sm bg-forest" />
            <div className="h-5 w-1.5 rounded-sm bg-forest" />
            <div className="h-7 w-1.5 rounded-sm bg-forest" />
          </div>
          <span className="text-xl font-bold tracking-tight text-navy">
            PlanForge
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-navy"
              {...("external" in link && link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
              {"external" in link && link.external && <ExternalLink className="h-3 w-3" />}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-muted transition-colors hover:text-navy"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            Get started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-navy"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border bg-cream/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-cream-dark hover:text-navy"
                >
                  {link.label}
                  {"external" in link && link.external && <ExternalLink className="h-3 w-3" />}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-cream-dark hover:text-navy"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-navy px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
