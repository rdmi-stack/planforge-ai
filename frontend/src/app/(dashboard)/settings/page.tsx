"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Bell, Key, Globe, Shield, Save, Loader2, Check, GitBranch, Bot, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState("Ranjit Rajput")
  const [email] = useState("ranjit@planforge.ai")
  const [showApiKey, setShowApiKey] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, browser: true, agentComplete: true, weeklyDigest: false })

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-navy">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account, integrations, and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Profile */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy"><User className="h-4 w-4 text-forest" /> Profile</h3>
          <div className="space-y-4 rounded-xl border border-border bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-lg font-bold text-white">RR</div>
              <button className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-navy hover:bg-cream transition-colors cursor-pointer">Change Avatar</button>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy">Email</label>
              <input type="email" value={email} disabled className="w-full rounded-lg border border-border bg-cream/50 px-4 py-2.5 text-sm text-muted" />
              <p className="mt-1 text-[11px] text-muted-light">Contact support to change your email.</p>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy"><Bell className="h-4 w-4 text-forest" /> Notifications</h3>
          <div className="space-y-3 rounded-xl border border-border bg-white p-6">
            {[
              { key: "email" as const, label: "Email notifications", desc: "Get notified about project updates" },
              { key: "browser" as const, label: "Browser push", desc: "Desktop notifications for real-time events" },
              { key: "agentComplete" as const, label: "Agent completions", desc: "Notify when agents finish tasks" },
              { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of project activity" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-1">
                <div>
                  <div className="text-sm font-medium text-navy">{item.label}</div>
                  <div className="text-xs text-muted">{item.desc}</div>
                </div>
                <button
                  onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
                  className={cn("relative h-6 w-10 rounded-full transition-colors cursor-pointer", notifications[item.key] ? "bg-forest" : "bg-border")}
                >
                  <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform", notifications[item.key] ? "translate-x-4.5" : "translate-x-0.5")} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* API Keys */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy"><Key className="h-4 w-4 text-forest" /> API Keys</h3>
          <div className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-border bg-cream/50 px-4 py-2.5 font-mono text-sm text-muted">
                {showApiKey ? "pf_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4" : "pf_live_••••••••••••••••••••••••"}
              </div>
              <button onClick={() => setShowApiKey(!showApiKey)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:text-navy transition-colors cursor-pointer">
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button className="mt-3 text-xs font-medium text-forest hover:text-forest-light transition-colors cursor-pointer">Regenerate API Key</button>
          </div>
        </section>

        {/* Integrations */}
        <section>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-navy"><Globe className="h-4 w-4 text-forest" /> Integrations</h3>
          <div className="space-y-3">
            {[
              { name: "GitHub", icon: GitBranch, connected: true, desc: "Connected as @ranjitrajput" },
              { name: "Claude Code", icon: Bot, connected: true, desc: "API key configured" },
              { name: "Cursor", icon: Bot, connected: false, desc: "Not connected" },
              { name: "Slack", icon: Bell, connected: false, desc: "Not connected" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-dark"><Icon className="h-4 w-4 text-forest" /></div>
                    <div>
                      <div className="text-sm font-semibold text-navy">{item.name}</div>
                      <div className="text-[11px] text-muted">{item.desc}</div>
                    </div>
                  </div>
                  <button className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer", item.connected ? "border border-success/30 text-success hover:bg-success-light/30" : "border border-border text-navy hover:bg-cream")}>
                    {item.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Save */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-cream pt-4 pb-2">
          {saved && <span className="flex items-center gap-1 text-xs font-medium text-success"><Check className="h-3.5 w-3.5" /> Saved</span>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest transition-colors cursor-pointer">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
