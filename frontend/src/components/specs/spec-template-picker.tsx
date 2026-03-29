"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Rocket,
  ShoppingCart,
  Bot,
  BarChart3,
  Users,
  Globe,
  Smartphone,
  Database,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SpecTemplate = {
  id: string
  name: string
  description: string
  sections: string[]
  icon: React.ElementType
  color: string
  bgColor: string
}

const TEMPLATES: SpecTemplate[] = [
  {
    id: "saas",
    name: "SaaS Application",
    description: "Complete spec for a subscription-based software product with auth, billing, and dashboard.",
    sections: ["Overview", "User Personas", "Core Features", "Auth & Billing", "API Design", "Database Schema", "Acceptance Criteria"],
    icon: Rocket,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Two-sided marketplace with vendor management, listings, search, and transactions.",
    sections: ["Overview", "User Personas (Buyer/Seller)", "Listings", "Search & Discovery", "Payments", "Reviews", "Admin"],
    icon: ShoppingCart,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "ai-tool",
    name: "AI-Powered Tool",
    description: "LLM-based application with chat interface, model management, and usage tracking.",
    sections: ["Overview", "AI Capabilities", "Chat Interface", "Model Config", "Usage & Billing", "Data Privacy", "API"],
    icon: Bot,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "dashboard",
    name: "Analytics Dashboard",
    description: "Data visualization platform with charts, reports, real-time metrics, and exports.",
    sections: ["Overview", "Data Sources", "Visualizations", "Reports", "Alerts", "Permissions", "Export"],
    icon: BarChart3,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "social",
    name: "Social Platform",
    description: "Community-driven app with profiles, feeds, messaging, and content moderation.",
    sections: ["Overview", "User Profiles", "Content Feed", "Messaging", "Notifications", "Moderation", "Growth"],
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "api-service",
    name: "API Service",
    description: "Developer-facing API with authentication, rate limiting, docs, and SDKs.",
    sections: ["Overview", "Endpoints", "Auth (API Keys/OAuth)", "Rate Limiting", "Webhooks", "SDK Design", "Docs"],
    icon: Database,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
]

type SpecTemplatePickerProps = {
  onSelect: (templateId: string) => void
  selected?: string
}

export function SpecTemplatePicker({ onSelect, selected }: SpecTemplatePickerProps) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-navy">Choose a Template</h3>
          <p className="mt-0.5 text-xs text-muted">
            Pick a starting point — every section is fully editable.
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-forest/10 px-3 py-1.5 text-xs font-medium text-forest hover:bg-forest/15 transition-colors cursor-pointer">
          <Sparkles className="h-3.5 w-3.5" />
          AI Suggest
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => {
          const Icon = template.icon
          const isSelected = selected === template.id
          return (
            <motion.button
              key={template.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelect(template.id)}
              className={cn(
                "group flex flex-col rounded-xl border p-5 text-left transition-all cursor-pointer",
                isSelected
                  ? "border-forest bg-forest/5 shadow-md ring-1 ring-forest/20"
                  : "border-border bg-white hover:border-forest/20 hover:shadow-sm"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", template.bgColor)}>
                  <Icon className={cn("h-5 w-5", template.color)} />
                </div>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                )}
              </div>

              <h4 className="mb-1 text-sm font-bold text-navy">{template.name}</h4>
              <p className="mb-3 text-xs text-muted leading-relaxed">{template.description}</p>

              <div className="mt-auto flex flex-wrap gap-1">
                {template.sections.slice(0, 4).map((section) => (
                  <span
                    key={section}
                    className="rounded-md bg-cream-dark px-1.5 py-0.5 text-[9px] font-medium text-muted"
                  >
                    {section}
                  </span>
                ))}
                {template.sections.length > 4 && (
                  <span className="rounded-md bg-cream-dark px-1.5 py-0.5 text-[9px] font-medium text-muted-light">
                    +{template.sections.length - 4}
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
