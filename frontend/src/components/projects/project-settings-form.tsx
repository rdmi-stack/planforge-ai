"use client"

import { useState } from "react"
import {
  Save,
  Loader2,
  GitBranch,
  Trash2,
  AlertTriangle,
  Check,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClientAuth } from "@/lib/api-client"
import { useToastStore } from "@/stores/toast-store"
import type { Project } from "@/types/project"

type ProjectSettingsFormProps = {
  project: Project
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || "")
  const [githubUrl, setGithubUrl] = useState(project.githubRepoUrl || "")
  const [status, setStatus] = useState(project.status)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addToast = useToastStore((s) => s.addToast)

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClientAuth(`/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          description: description || null,
          github_repo_url: githubUrl || null,
          status,
        }),
      })
      setSaved(true)
      addToast("Project settings saved", "success")
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save settings"
      addToast(message, "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* General */}
      <section>
        <h3 className="mb-4 text-sm font-bold text-navy">General</h3>
        <div className="space-y-4 rounded-xl border border-border bg-white p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy">
              Status
            </label>
            <div className="flex gap-2">
              {(["active", "draft", "archived"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-xs font-medium transition-all cursor-pointer capitalize",
                    status === s
                      ? "border-forest bg-forest/10 text-forest"
                      : "border-border text-muted hover:border-muted-light"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GitHub */}
      <section>
        <h3 className="mb-4 text-sm font-bold text-navy">GitHub Integration</h3>
        <div className="space-y-4 rounded-xl border border-border bg-white p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy">
              Repository URL
            </label>
            <div className="relative">
              <GitBranch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full rounded-lg border border-border bg-white py-2.5 pr-4 pl-10 text-sm text-navy outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted">
              PlanForge will analyze your codebase for architecture-aware planning.
            </p>
          </div>

          {githubUrl && (
            <div className="flex items-center gap-2 rounded-lg bg-success-light/30 border border-success/20 px-4 py-2.5">
              <Check className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-success">Repository connected</span>
            </div>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h3 className="mb-4 text-sm font-bold text-danger">Danger Zone</h3>
        <div className="rounded-xl border border-danger/20 bg-danger-light/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-navy">Delete Project</h4>
              <p className="mt-0.5 text-xs text-muted">
                Permanently delete this project and all its specs, features, and tasks.
                This action cannot be undone.
              </p>
            </div>
            <button className="shrink-0 flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger hover:text-white transition-colors cursor-pointer">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </section>

      {/* Save bar */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-cream pt-4 pb-2">
        {saved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-success">
            <Check className="h-3.5 w-3.5" />
            Changes saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest transition-colors cursor-pointer"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  )
}
