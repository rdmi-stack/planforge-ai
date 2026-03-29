"use client"

import { motion } from "framer-motion"
import { Sparkles, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { ChatMessage as ChatMessageType } from "@/types/agent"

type ChatMessageProps = {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
          isUser
            ? "bg-forest text-white"
            : "bg-linear-to-br from-violet-500 to-purple-600 text-white"
        )}
      >
        {isUser ? "You" : <Sparkles className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={cn("max-w-[80%] min-w-0", isUser && "text-right")}>
        <div
          className={cn(
            "inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-forest text-white"
              : "rounded-tl-sm bg-white border border-border text-navy"
          )}
        >
          {/* Render content with basic markdown-like formatting */}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Streaming cursor */}
          {isStreaming && isAssistant && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-forest" />
          )}
        </div>

        {/* Actions (assistant only) */}
        {isAssistant && !isStreaming && (
          <div className="mt-1.5 flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-light hover:text-navy transition-colors cursor-pointer"
              title="Copy"
            >
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded text-muted-light hover:text-navy transition-colors cursor-pointer"
              title="Good response"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded text-muted-light hover:text-navy transition-colors cursor-pointer"
              title="Bad response"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded text-muted-light hover:text-navy transition-colors cursor-pointer"
              title="Regenerate"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Timestamp */}
        <div className={cn("mt-1 text-[10px] text-muted-light", isUser && "text-right")}>
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  )
}
