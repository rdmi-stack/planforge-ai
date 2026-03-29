"use client"

import { memo, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/types/agent"

type ChatMessageProps = {
  message: ChatMessageType
  isStreaming?: boolean
}

function ChatMessageInner({ message, isStreaming }: ChatMessageProps) {
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
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h3 className="mt-4 mb-2 text-base font-bold text-navy first:mt-0">{children}</h3>
                  ),
                  h2: ({ children }) => (
                    <h4 className="mt-3 mb-1.5 text-sm font-bold text-navy first:mt-0">{children}</h4>
                  ),
                  h3: ({ children }) => (
                    <h5 className="mt-2 mb-1 text-sm font-semibold text-navy first:mt-0">{children}</h5>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-navy">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-navy/80">{children}</em>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes("language-")
                    if (isBlock) {
                      return (
                        <div className="my-2 overflow-hidden rounded-lg border border-border">
                          <div className="flex items-center justify-between bg-navy px-3 py-1.5">
                            <span className="text-[10px] font-medium text-white/50">
                              {className?.replace("language-", "") || "code"}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(String(children))
                              }}
                              className="text-[10px] text-white/40 hover:text-white/70 cursor-pointer"
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="overflow-x-auto bg-navy/95 p-3 text-[12px] leading-relaxed text-white/80">
                            <code>{children}</code>
                          </pre>
                        </div>
                      )
                    }
                    return (
                      <code className="rounded bg-cream-dark px-1.5 py-0.5 text-[12px] font-mono text-forest" {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => <>{children}</>,
                  blockquote: ({ children }) => (
                    <blockquote className="my-2 border-l-2 border-forest/30 pl-3 text-navy/70 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest underline underline-offset-2 hover:text-forest-light"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="my-2 overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-xs">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-border bg-cream-dark px-3 py-1.5 text-left text-[11px] font-semibold text-navy">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-border/50 px-3 py-1.5 text-navy/80">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="my-3 border-border" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Streaming cursor */}
          {isStreaming && isAssistant && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-forest" />
          )}
        </div>

        {/* Actions (assistant only) */}
        {isAssistant && !isStreaming && message.content && (
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

export const ChatMessage = memo(ChatMessageInner)
