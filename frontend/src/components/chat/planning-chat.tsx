"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Sparkles,
  Paperclip,
  StopCircle,
  FileText,
  Layers,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatMessage } from "./chat-message"
import { SmartQuestionCard } from "./smart-question-card"
import type { ChatMessage as ChatMessageType } from "@/types/agent"

const INITIAL_MESSAGES: ChatMessageType[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm your AI planning assistant. Tell me about the product or feature you want to build, and I'll help you create a comprehensive spec.\n\nYou can describe your idea at any level — from a rough concept to detailed requirements. I'll ask smart follow-up questions to fill in the gaps.",
    timestamp: new Date().toISOString(),
  },
]

const SMART_QUESTIONS = [
  "What's the primary problem this solves for users?",
  "Who are the target users? (developers, non-technical, enterprise?)",
  "What authentication method do you need? (email, OAuth, SSO?)",
  "Should this support real-time collaboration?",
  "What's the launch timeline? (MVP in weeks, full product in months?)",
]

type PlanningChatProps = {
  projectId?: string
}

export function PlanningChat({ projectId }: PlanningChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showQuestions, setShowQuestions] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setShowQuestions(false)
    setIsStreaming(true)

    // Simulate AI response
    const aiMsg: ChatMessageType = {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, aiMsg])

    const response =
      "Great context! Let me think through the architecture for this.\n\nBased on what you've described, I'd recommend the following approach:\n\n**Authentication**: OAuth 2.0 with Google and GitHub providers, plus email/password as fallback. This covers both developer and non-technical user flows.\n\n**Database**: PostgreSQL for relational data with Redis for caching and real-time pub/sub.\n\n**Key Considerations**:\n• Role-based access control (owner, admin, member)\n• Webhook support for third-party integrations\n• Rate limiting on AI generation endpoints\n\nShall I proceed with generating the full spec? Or would you like to refine any of these decisions first?"

    // Simulate streaming
    for (let i = 0; i < response.length; i++) {
      await new Promise((r) => setTimeout(r, 8))
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: response.slice(0, i + 1),
          }
        }
        return updated
      })
    }

    setIsStreaming(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-white overflow-hidden transition-all",
        expanded ? "fixed inset-4 z-50 shadow-2xl" : "h-[600px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">AI Planner</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              {isStreaming ? "Thinking..." : "Ready"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-7 items-center gap-1.5 rounded-md bg-cream-dark px-2.5 text-[11px] font-medium text-muted hover:text-navy transition-colors cursor-pointer">
            <FileText className="h-3 w-3" />
            Generate Spec
          </button>
          <button className="flex h-7 items-center gap-1.5 rounded-md bg-cream-dark px-2.5 text-[11px] font-medium text-muted hover:text-navy transition-colors cursor-pointer">
            <Layers className="h-3 w-3" />
            Decompose
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-cream-dark hover:text-navy transition-colors cursor-pointer"
          >
            {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
      >
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}

        {/* Smart questions */}
        {showQuestions && !isStreaming && (
          <SmartQuestionCard
            questions={SMART_QUESTIONS}
            onSelect={(q) => sendMessage(q)}
          />
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-cream/30 px-4 py-3 pr-10 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light hover:text-navy transition-colors cursor-pointer"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>

          {isStreaming ? (
            <button
              type="button"
              onClick={() => setIsStreaming(false)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors cursor-pointer"
            >
              <StopCircle className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors cursor-pointer",
                input.trim()
                  ? "bg-forest text-white hover:bg-forest-light"
                  : "bg-cream-dark text-muted-light"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </form>

        <p className="mt-2 text-center text-[10px] text-muted-light">
          AI responses may not be perfect. Always review generated specs before using.
        </p>
      </div>
    </div>
  )
}
