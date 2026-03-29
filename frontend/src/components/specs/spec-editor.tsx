"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Minus,
  Sparkles,
  Save,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAuthToken } from "@/lib/api-client"
import { useState } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

type ToolbarButtonProps = {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick: () => void
}

function ToolbarButton({ icon: Icon, label, active, onClick }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer",
        active
          ? "bg-forest/10 text-forest"
          : "text-muted hover:bg-cream-dark hover:text-navy"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />
}

type SpecEditorProps = {
  initialContent?: string
  onSave?: (content: string) => void
  title?: string
  onTitleChange?: (title: string) => void
  projectId?: string
}

export function SpecEditor({
  initialContent = "",
  onSave,
  title = "",
  onTitleChange,
  projectId,
}: SpecEditorProps) {
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleAIGenerate = async () => {
    if (!editor || !projectId) return
    setGenerating(true)
    try {
      const token = await getAuthToken()
      const prompt = title
        ? `Generate a comprehensive product spec for: "${title}". Include sections: Overview, User Personas, Core Features, Acceptance Criteria, Technical Architecture, and Database Schema.`
        : "Generate a comprehensive product spec. Include sections: Overview, User Personas, Core Features, Acceptance Criteria, Technical Architecture, and Database Schema."

      const res = await fetch(`${API_BASE}/api/v1/projects/${projectId}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: prompt }),
      })

      if (!res.ok) throw new Error("AI generation failed")

      const reader = res.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6).trim())
              if (parsed.content) {
                accumulated += parsed.content
                editor.commands.setContent(
                  accumulated
                    .split("\n")
                    .map((line) => {
                      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`
                      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`
                      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`
                      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`
                      if (line.startsWith("**") && line.endsWith("**")) return `<p><strong>${line.slice(2, -2)}</strong></p>`
                      if (line.trim() === "") return "<p></p>"
                      return `<p>${line}</p>`
                    })
                    .join("")
                )
              }
            } catch {
              continue
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI generation failed"
      editor.commands.setContent(`<p><em>Error: ${msg}. Please try again.</em></p>`)
    } finally {
      setGenerating(false)
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing your spec... Use AI to generate sections, or write manually.",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none outline-none min-h-[400px] px-8 py-6 text-navy",
      },
    },
  })

  const handleSave = async () => {
    if (!editor) return
    setSaving(true)
    onSave?.(editor.getHTML())
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
  }

  if (!editor) return null

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white overflow-hidden">
      {/* Title input */}
      <div className="border-b border-border px-8 py-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          placeholder="Untitled Spec"
          className="w-full text-xl font-black text-navy outline-none placeholder:text-muted-light"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border px-4 py-2 overflow-x-auto">
        <ToolbarButton
          icon={Bold}
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={Heading1}
          label="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          icon={Heading2}
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={Heading3}
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={List}
          label="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Ordered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Code}
          label="Code Block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          icon={Minus}
          label="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={Undo}
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={Redo}
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        />

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-forest/10 px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {generating ? "Generating..." : "AI Generate"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest transition-colors cursor-pointer"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-6 py-2 text-[11px] text-muted-light">
        <span>{editor.storage.characterCount?.characters?.() ?? 0} characters</span>
        <span>Last saved: just now</span>
      </div>
    </div>
  )
}
