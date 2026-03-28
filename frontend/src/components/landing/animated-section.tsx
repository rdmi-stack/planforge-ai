"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type AnimatedSectionProps = {
  children: ReactNode
  className?: string
  delay?: number
  id?: string
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  id,
}: AnimatedSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay }}
      className={cn("px-4 sm:px-6 lg:px-8", className)}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  )
}
