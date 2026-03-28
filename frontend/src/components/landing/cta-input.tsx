"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type CtaInputProps = {
  variant?: "light" | "dark"
  placeholder?: string
  buttonText?: string
}

export function CtaInput({
  variant = "light",
  placeholder = "Describe the feature you need to build...",
  buttonText = "Start Planning",
}: CtaInputProps) {
  const [value, setValue] = useState("")

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "flex flex-col sm:flex-row items-stretch rounded-2xl border overflow-hidden shadow-lg",
          variant === "light"
            ? "border-border bg-white"
            : "border-border-dark bg-navy-light"
        )}
      >
        <div className="flex items-center gap-3 flex-1 px-5">
          <div
            className={cn(
              "shrink-0",
              variant === "light" ? "text-muted" : "text-muted-light"
            )}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "flex-1 py-4 sm:py-5 text-base bg-transparent outline-none placeholder:text-muted-light",
              variant === "light" ? "text-navy" : "text-white"
            )}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 bg-lime px-6 py-4 sm:py-5 text-base font-semibold text-navy transition-colors hover:bg-lime-hover shrink-0 cursor-pointer sm:rounded-none"
        >
          <Sparkles className="h-4 w-4" />
          {buttonText}
        </motion.button>
      </div>
      <p
        className={cn(
          "mt-3 text-center text-sm",
          variant === "light" ? "text-muted" : "text-muted-light"
        )}
      >
        Free to try &middot; No credit card required
      </p>
    </div>
  )
}
