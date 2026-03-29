"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const LABELS: Record<string, string> = {
  projects: "Projects",
  specs: "Specs",
  features: "Features",
  tasks: "Tasks",
  architecture: "Architecture",
  agents: "Agents",
  analytics: "Analytics",
  settings: "Settings",
  billing: "Billing",
  templates: "Templates",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/")
    const label = LABELS[segment] || decodeURIComponent(segment)
    const isLast = i === segments.length - 1
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      )

    return {
      label: isUuid ? "..." : label,
      href,
      isLast,
    }
  })

  if (crumbs.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      <Link
        href="/projects"
        className="flex items-center text-muted-light hover:text-navy transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-muted-light" />
          {crumb.isLast ? (
            <span className="font-medium text-navy text-sm">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted hover:text-navy transition-colors text-sm"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
