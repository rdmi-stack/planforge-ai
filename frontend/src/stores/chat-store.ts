import { create } from "zustand"
import type { ChatMessage } from "@/types/agent"

type ChatState = {
  messages: ChatMessage[]
  isStreaming: boolean
  sessionId: string | null

  addMessage: (message: ChatMessage) => void
  appendToLastMessage: (content: string) => void
  setMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
  setStreaming: (streaming: boolean) => void
  setSessionId: (id: string | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  sessionId: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  appendToLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          content: last.content + content,
        }
      }
      return { messages }
    }),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [], sessionId: null }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setSessionId: (sessionId) => set({ sessionId }),
}))
