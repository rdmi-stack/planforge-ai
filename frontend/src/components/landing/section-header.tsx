"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  overline: string
  headline: string
  subtitle?: string
  align?: "center" | "left"
  dark?: boolean
}

export function SectionHeader({
  overline,
  headline,
  subtitle,
  align = "center",
  dark = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "mb-16",
        align === "center" && "text-center",
        align === "left" && "text-left"
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest",
          dark
            ? "border-border-dark text-muted-light"
            : "border-border text-muted"
        )}
      >
        {overline}
      </span>
      <h2
        className={cn(
          "mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl",
          dark ? "text-white" : "text-navy"
        )}
      >
        {headline}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mx-auto mt-4 max-w-2xl text-lg",
            dark ? "text-muted-light" : "text-muted",
            align === "left" && "mx-0"
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
