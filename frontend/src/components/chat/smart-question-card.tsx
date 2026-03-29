"use client"

import { motion } from "framer-motion"
import { Lightbulb, ArrowRight, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type SmartQuestionCardProps = {
  questions: string[]
  onSelect: (question: string) => void
}

export function SmartQuestionCard({ questions, onSelect }: SmartQuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-lime/30 bg-lime/5 p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-lime/20 text-forest">
          <Lightbulb className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-bold text-forest">
          Smart Questions — click to answer
        </span>
      </div>

      <div className="space-y-2">
        {questions.map((question, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(question)}
            className="group flex w-full items-start gap-2.5 rounded-lg border border-border bg-white px-3 py-2.5 text-left transition-all hover:border-forest/20 hover:shadow-sm cursor-pointer"
          >
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-light group-hover:text-forest transition-colors" />
            <span className="flex-1 text-xs text-navy leading-relaxed">
              {question}
            </span>
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-light opacity-0 transition-all group-hover:opacity-100 group-hover:text-forest" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
