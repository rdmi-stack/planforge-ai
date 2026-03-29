"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FolderKanban,
  GitBranch,
  Layers,
  Check,
  Loader2,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"

type CreateProjectDialogProps = {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const TEMPLATES = [
  { id: "blank", name: "Blank Project", desc: "Start from scratch", icon: "📝" },
  { id: "saas", name: "SaaS App", desc: "Auth, billing, dashboard", icon: "🚀" },
  { id: "marketplace", name: "Marketplace", desc: "Multi-vendor platform", icon: "🛒" },
  { id: "ai-tool", name: "AI Tool", desc: "LLM-powered application", icon: "🤖" },
  { id: "mobile", name: "Mobile App", desc: "Cross-platform mobile", icon: "📱" },
  { id: "api", name: "API Service", desc: "REST/GraphQL backend", icon: "⚡" },
]

const TECH_OPTIONS = [
  "Next.js", "React", "Vue", "Svelte", "Nuxt",
  "FastAPI", "Django", "Express", "Rails", "Spring",
  "PostgreSQL", "MongoDB", "Supabase", "Firebase",
  "Tailwind", "TypeScript", "Python", "Go", "Rust",
  "Docker", "AWS", "Vercel", "Railway",
]

export function CreateProjectDialog({ open, onClose, onCreated }: CreateProjectDialogProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [template, setTemplate] = useState("blank")
  const [techStack, setTechStack] = useState<string[]>([])
  const [githubUrl, setGithubUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const totalSteps = 3

  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  const handleCreate = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      await apiClientAuth("/projects", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: description || undefined,
          github_repo_url: githubUrl || undefined,
          tech_stack: techStack.length > 0 ? techStack : undefined,
        }),
        headers: { "Content-Type": "application/json" },
      })
      onClose()
      resetForm()
      onCreated?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create project"
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setName("")
    setDescription("")
    setTemplate("blank")
    setTechStack([])
    setGithubUrl("")
  }

  const canNext =
    (step === 1 && name.trim().length > 0) ||
    step === 2 ||
    step === 3

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-navy/30 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-[101] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-navy">Create Project</h2>
                  <p className="text-xs text-muted">
                    Step {step} of {totalSteps}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted hover:text-navy transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-cream-dark">
              <div
                className="h-full bg-forest transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Name & Description */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-navy">
                        Project Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My SaaS App"
                        autoFocus
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-navy">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what you want to build in a few sentences..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                      />
                    </div>

                    {/* Tip */}
                    <div className="flex items-start gap-2.5 rounded-xl bg-lime/10 border border-lime/20 px-4 py-3">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      <p className="text-xs text-forest leading-relaxed">
                        Don&apos;t worry about being detailed here. The AI planner will
                        ask smart follow-up questions to flesh out your idea.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Template & Tech Stack */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-navy">
                        Start from a template
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {TEMPLATES.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTemplate(t.id)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all cursor-pointer",
                              template === t.id
                                ? "border-forest bg-forest/5 shadow-sm"
                                : "border-border hover:border-muted-light hover:bg-cream/50"
                            )}
                          >
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-xs font-semibold text-navy">{t.name}</span>
                            <span className="text-[10px] text-muted">{t.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-navy">
                        Tech Stack <span className="text-muted-light">(optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {TECH_OPTIONS.map((tech) => (
                          <button
                            key={tech}
                            onClick={() => toggleTech(tech)}
                            className={cn(
                              "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                              techStack.includes(tech)
                                ? "border-forest bg-forest/10 text-forest"
                                : "border-border text-muted hover:border-muted-light hover:text-navy"
                            )}
                          >
                            {techStack.includes(tech) && (
                              <Check className="mr-1 inline h-3 w-3" />
                            )}
                            {tech}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: GitHub & Review */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-navy">
                        GitHub Repository <span className="text-muted-light">(optional)</span>
                      </label>
                      <div className="relative">
                        <GitBranch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username/repo"
                          className="w-full rounded-xl border border-border bg-white py-3 pr-4 pl-10 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted">
                        Connect a repo for codebase-aware planning. PlanForge will analyze your architecture.
                      </p>
                    </div>

                    {/* Review summary */}
                    <div className="rounded-xl border border-border bg-cream/50 p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-light">
                        Project Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted">Name</span>
                          <span className="text-xs font-medium text-navy">{name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted">Template</span>
                          <span className="text-xs font-medium text-navy">
                            {TEMPLATES.find((t) => t.id === template)?.name}
                          </span>
                        </div>
                        {techStack.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-xs text-muted">Stack</span>
                            <span className="text-xs font-medium text-navy">
                              {techStack.slice(0, 3).join(", ")}
                              {techStack.length > 3 && ` +${techStack.length - 3}`}
                            </span>
                          </div>
                        )}
                        {githubUrl && (
                          <div className="flex justify-between">
                            <span className="text-xs text-muted">Repo</span>
                            <span className="text-xs font-medium text-forest truncate max-w-[200px]">
                              {githubUrl.replace("https://github.com/", "")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl bg-forest/5 border border-forest/10 px-4 py-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      <p className="text-xs text-forest leading-relaxed">
                        After creating, the AI planner will start a conversation to
                        refine your idea and generate a complete product spec.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="mx-6 mb-2 rounded-lg bg-danger/10 px-4 py-2 text-xs font-medium text-danger">
                {errorMsg}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <button
                onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
                className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-navy transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {step > 1 ? "Back" : "Cancel"}
              </button>

              {step < totalSteps ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canNext}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                    canNext
                      ? "bg-navy text-white hover:bg-forest"
                      : "bg-cream-dark text-muted-light"
                  )}
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-light transition-colors cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {loading ? "Creating..." : "Create & Start Planning"}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
