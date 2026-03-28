export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs", external: true },
] as const

export const INTEGRATIONS = [
  { name: "Claude Code" },
  { name: "Cursor" },
  { name: "OpenAI Codex" },
  { name: "Windsurf" },
  { name: "Replit" },
  { name: "GitHub Copilot" },
] as const

export type Feature = {
  icon: string
  title: string
  description: string
}

export const FEATURES: Feature[] = [
  {
    icon: "brain",
    title: "AI Planning Chat",
    description:
      "Describe your idea in plain English. PlanForge asks smart clarifying questions, then generates a complete product spec with edge cases covered.",
  },
  {
    icon: "list-tree",
    title: "Feature Decomposition",
    description:
      "Automatically breaks epics into features, stories, and atomic tasks with dependency mapping and sequencing built in.",
  },
  {
    icon: "terminal",
    title: "Agent-Ready Prompts",
    description:
      "Every task comes with a context-rich prompt optimized for Claude Code, Cursor, or Codex — so agents build right the first time.",
  },
  {
    icon: "git-branch",
    title: "Codebase Awareness",
    description:
      "Connect your GitHub repo. PlanForge analyzes your existing code so every plan fits your architecture, conventions, and file structure.",
  },
  {
    icon: "workflow",
    title: "Multi-Agent Orchestration",
    description:
      "Dispatch tasks to multiple AI coding agents in parallel. Built-in validation, retry logic, and progress tracking across all agents.",
  },
  {
    icon: "shield-check",
    title: "Production Readiness Audit",
    description:
      "Built-in checks ensure your AI-generated code handles errors, security, performance, and edge cases before it ships.",
  },
]

export type Step = {
  number: number
  title: string
  description: string
}

export const STEPS: Step[] = [
  {
    number: 1,
    title: "Describe Your Idea",
    description:
      "Tell PlanForge what you want to build in plain language. Our AI asks the right questions to eliminate unknowns and edge cases.",
  },
  {
    number: 2,
    title: "Generate Your Spec",
    description:
      "Get a complete PRD with user personas, features, acceptance criteria, and technical architecture — in seconds.",
  },
  {
    number: 3,
    title: "Break Into Tasks",
    description:
      "Features automatically decompose into atomic, sequenced tasks with agent-ready prompts and dependency graphs.",
  },
  {
    number: 4,
    title: "Dispatch to Agents",
    description:
      "Send tasks to Claude Code, Cursor, or Codex with full context. Monitor progress and validate outputs in real-time.",
  },
]

export type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
  metric: string
  metricLabel: string
  initials: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "PlanForge turned my weekend project into a production app. The spec it generated caught edge cases I never would have thought of.",
    name: "Alex Chen",
    role: "Indie Hacker",
    company: "ShipFast",
    metric: "3x",
    metricLabel: "faster planning",
    initials: "AC",
  },
  {
    quote:
      "We went from 2-day planning sessions to 20-minute PlanForge specs. Our agents actually build what we want now.",
    name: "Sarah Kim",
    role: "Product Manager",
    company: "DevStack Agency",
    metric: "80%",
    metricLabel: "fewer agent retries",
    initials: "SK",
  },
  {
    quote:
      "The codebase-aware planning is a game-changer. Tasks reference our actual file structure, conventions, and patterns.",
    name: "Marcus Rodriguez",
    role: "CTO",
    company: "LaunchPad AI",
    metric: "0",
    metricLabel: "regressions shipped",
    initials: "MR",
  },
]

export type PricingTier = {
  name: string
  price: number
  yearlyPrice: number
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    description: "For side projects and exploration",
    features: [
      "3 projects",
      "50 AI generations / month",
      "Basic spec generation",
      "Export to Markdown",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 29,
    yearlyPrice: 23,
    description: "For serious builders shipping fast",
    features: [
      "Unlimited projects",
      "500 AI generations / month",
      "Full feature decomposition",
      "Agent orchestration",
      "Codebase analysis",
      "Priority support",
      "All export formats",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: 79,
    yearlyPrice: 63,
    description: "For agencies and dev teams",
    features: [
      "Everything in Pro",
      "Multi-user collaboration",
      "Shared templates library",
      "Admin controls & analytics",
      "SSO integration",
      "Dedicated support",
      "Custom agent configs",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Console", href: "/dashboard" },
      { label: "Documentation", href: "/docs" },
      { label: "CLI Tool", href: "/docs/cli" },
      { label: "MCP Integration", href: "/docs/mcp" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Templates", href: "/templates" },
      { label: "Community", href: "/community" },
      { label: "GitHub", href: "https://github.com/planforge" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Security", href: "/security" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
] as const

export const WITHOUT_PLANFORGE = [
  "Vague prompts lead to wrong implementations",
  "Changes in one place break three others",
  "No dependency awareness between features",
  "Endless back-and-forth with AI agents",
  "Prototype-grade code ships to production",
  "Hours wasted on planning docs nobody reads",
]

export const WITH_PLANFORGE = [
  "Structured specs eliminate all ambiguity",
  "Dependency graphs prevent regressions",
  "Atomic tasks with full codebase context",
  "One-shot agent execution with validation",
  "Production-grade code from the start",
  "Living specs that evolve with your product",
]
