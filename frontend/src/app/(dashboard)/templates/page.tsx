"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookTemplate, Search, Rocket, ShoppingCart, Bot, BarChart3, Users, Database, Smartphone, Globe, ArrowRight, Star, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

type Template = { id: string; name: string; desc: string; icon: React.ElementType; color: string; bg: string; category: string; stars: number; usedBy: string }

const TEMPLATES: Template[] = [
  { id: "saas", name: "SaaS Application", desc: "Auth, billing, dashboard, user management, and API. Everything for a subscription business.", icon: Rocket, color: "text-violet-600", bg: "bg-violet-50", category: "Popular", stars: 842, usedBy: "1.2K" },
  { id: "marketplace", name: "Two-Sided Marketplace", desc: "Vendor management, listings, search, payments, reviews, and admin panel.", icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50", category: "Popular", stars: 634, usedBy: "890" },
  { id: "ai-tool", name: "AI-Powered Tool", desc: "LLM chat interface, model management, usage tracking, and API access.", icon: Bot, color: "text-blue-600", bg: "bg-blue-50", category: "Popular", stars: 921, usedBy: "1.5K" },
  { id: "dashboard", name: "Analytics Dashboard", desc: "Data visualizations, reports, real-time metrics, alerts, and CSV export.", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50", category: "Data", stars: 456, usedBy: "670" },
  { id: "social", name: "Social Platform", desc: "Profiles, feeds, messaging, notifications, content moderation, and growth tools.", icon: Users, color: "text-pink-600", bg: "bg-pink-50", category: "Consumer", stars: 378, usedBy: "520" },
  { id: "api", name: "API Service", desc: "REST endpoints, API keys, rate limiting, webhooks, SDK generation, and docs.", icon: Database, color: "text-teal-600", bg: "bg-teal-50", category: "Developer", stars: 512, usedBy: "740" },
  { id: "mobile", name: "Mobile App Backend", desc: "Push notifications, offline sync, media uploads, and cross-platform API.", icon: Smartphone, color: "text-orange-600", bg: "bg-orange-50", category: "Mobile", stars: 289, usedBy: "410" },
  { id: "cms", name: "Content Management", desc: "Rich text editor, media library, SEO tools, multi-language, and publishing workflow.", icon: Globe, color: "text-sky-600", bg: "bg-sky-50", category: "Content", stars: 345, usedBy: "490" },
]

const CATEGORIES = ["All", "Popular", "Data", "Consumer", "Developer", "Mobile", "Content"]

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  const filtered = TEMPLATES.filter((t) => {
    if (category !== "All" && t.category !== category) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-navy">Templates</h1>
        <p className="mt-1 text-sm text-muted">Start from a proven blueprint. Every template is fully customizable.</p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
            className="w-full rounded-lg border border-border bg-white py-2 pr-3 pl-9 text-sm text-navy outline-none placeholder:text-muted-light focus:border-forest/30 focus:ring-2 focus:ring-forest/10" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer", category === cat ? "bg-navy text-white shadow-xs" : "border border-border text-muted hover:text-navy hover:border-muted-light")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((template, i) => {
          const Icon = template.icon
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group flex flex-col rounded-xl border border-border bg-white p-5 transition-all hover:border-forest/20 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", template.bg)}>
                  <Icon className={cn("h-5 w-5", template.color)} />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {template.stars}
                </div>
              </div>
              <h3 className="mb-1 text-sm font-bold text-navy group-hover:text-forest transition-colors">{template.name}</h3>
              <p className="mb-4 flex-1 text-xs text-muted leading-relaxed">{template.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-light">{template.usedBy} projects</span>
                <button className="flex items-center gap-1 rounded-lg bg-cream-dark px-3 py-1.5 text-[11px] font-medium text-navy hover:bg-forest/10 hover:text-forest transition-colors cursor-pointer">
                  Use Template <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
