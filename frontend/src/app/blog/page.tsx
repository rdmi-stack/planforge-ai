"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  Search,
  ArrowRight,
  Clock,
  Calendar,
  ChevronRight,
  Loader2,
  Sparkles,
  BookOpen,
  Cpu,
  Bot,
  GraduationCap,
  Building2,
  Mail,
  Rss,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/landing/navbar"

/* ──────────────────────────────────────────
   TYPES
   ────────────────────────────────────────── */

type Category =
  | "All"
  | "Product Updates"
  | "Engineering"
  | "AI & Agents"
  | "Tutorials"
  | "Company"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: Exclude<Category, "All">
  author: { name: string; initials: string }
  date: string
  readTime: string
  accent: string
}

/* ──────────────────────────────────────────
   DATA
   ────────────────────────────────────────── */

const CATEGORIES: { label: Category; icon: React.ElementType }[] = [
  { label: "All", icon: Rss },
  { label: "Product Updates", icon: Sparkles },
  { label: "Engineering", icon: Cpu },
  { label: "AI & Agents", icon: Bot },
  { label: "Tutorials", icon: GraduationCap },
  { label: "Company", icon: Building2 },
]

const CATEGORY_ACCENT: Record<Exclude<Category, "All">, string> = {
  "Product Updates": "from-forest to-forest-light",
  Engineering: "from-sky-500 to-blue-600",
  "AI & Agents": "from-emerald-500 to-teal-600",
  Tutorials: "from-amber-500 to-orange-600",
  Company: "from-rose-500 to-pink-600",
}

const CATEGORY_BG: Record<Exclude<Category, "All">, string> = {
  "Product Updates": "bg-forest/10 text-forest ring-forest/20",
  Engineering: "bg-sky-500/10 text-sky-700 ring-sky-500/20",
  "AI & Agents": "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  Tutorials: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  Company: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
}

const FEATURED_POST: BlogPost = {
  id: "featured",
  slug: "future-of-ai-powered-product-planning",
  title:
    "The Future of AI-Powered Product Planning: How Autonomous Agents Are Replacing Backlogs",
  excerpt:
    "Traditional product planning is broken. Backlogs grow endlessly, tickets go stale, and by the time a spec reaches engineering it is already outdated. We built PlanForge to change that \u2014 harnessing multi-agent orchestration to turn a single idea into a production-ready plan in minutes, not months.",
  category: "AI & Agents",
  author: { name: "Arjun Mehta", initials: "AM" },
  date: "Mar 24, 2026",
  readTime: "12 min read",
  accent: CATEGORY_ACCENT["AI & Agents"],
}

const POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "how-we-reduced-ai-agent-retries",
    title:
      "How We Reduced AI Agent Retries by 80% with Structured Planning",
    excerpt:
      "Unstructured prompts cause agents to spin. We share the planning middleware that slashed our retry rate and saved thousands in compute.",
    category: "Engineering",
    author: { name: "Priya Sharma", initials: "PS" },
    date: "Mar 20, 2026",
    readTime: "8 min read",
    accent: CATEGORY_ACCENT["Engineering"],
  },
  {
    id: "2",
    slug: "introducing-multi-agent-orchestration",
    title:
      "Introducing Multi-Agent Orchestration: Dispatch to 10 Agents at Once",
    excerpt:
      "Our new orchestration layer lets you fan out work across specialized AI agents \u2014 plan, code, test, and deploy in parallel.",
    category: "Product Updates",
    author: { name: "Marcus Chen", initials: "MC" },
    date: "Mar 17, 2026",
    readTime: "5 min read",
    accent: CATEGORY_ACCENT["Product Updates"],
  },
  {
    id: "3",
    slug: "prompt-engineering-playbook-for-ai-coding-agents",
    title:
      "The Prompt Engineering Playbook for AI Coding Agents",
    excerpt:
      "A practical guide to crafting prompts that produce clean, testable code from LLM-powered agents on the first pass.",
    category: "AI & Agents",
    author: { name: "Lena Okafor", initials: "LO" },
    date: "Mar 12, 2026",
    readTime: "10 min read",
    accent: CATEGORY_ACCENT["AI & Agents"],
  },
  {
    id: "4",
    slug: "from-idea-to-production-in-30-minutes",
    title:
      "From Idea to Production in 30 Minutes: A Step-by-Step Guide",
    excerpt:
      "Follow along as we take a raw feature idea through PlanForge and ship it to production \u2014 complete with tests and CI.",
    category: "Tutorials",
    author: { name: "Arjun Mehta", initials: "AM" },
    date: "Mar 8, 2026",
    readTime: "15 min read",
    accent: CATEGORY_ACCENT["Tutorials"],
  },
  {
    id: "5",
    slug: "why-ai-coding-tools-fail-without-a-plan",
    title:
      "Why AI Coding Tools Fail Without a Plan (And How to Fix It)",
    excerpt:
      "Copilot-style tools generate code fast, but without structured plans they produce fragile, untested output. Here is a better approach.",
    category: "AI & Agents",
    author: { name: "Priya Sharma", initials: "PS" },
    date: "Mar 3, 2026",
    readTime: "7 min read",
    accent: CATEGORY_ACCENT["AI & Agents"],
  },
  {
    id: "6",
    slug: "planforge-vs-manual-planning",
    title:
      "PlanForge vs. Manual Planning: A Real-World Comparison",
    excerpt:
      "We ran the same product sprint twice \u2014 once with PlanForge, once manually. The results surprised even us.",
    category: "Company",
    author: { name: "Marcus Chen", initials: "MC" },
    date: "Feb 27, 2026",
    readTime: "6 min read",
    accent: CATEGORY_ACCENT["Company"],
  },
]

/* ──────────────────────────────────────────
   ANIMATION HELPERS
   ────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ──────────────────────────────────────────
   COMPONENTS
   ────────────────────────────────────────── */

function CategoryBadge({
  category,
  size = "sm",
}: {
  category: Exclude<Category, "All">
  size?: "sm" | "md"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full ring-1 font-medium",
        CATEGORY_BG[category],
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      {category}
    </span>
  )
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.a
      href={`/blog/${post.slug}`}
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xs"
    >
      {/* Accent strip */}
      <div
        className={cn(
          "h-1.5 w-full bg-linear-to-r",
          post.accent
        )}
      />

      <div className="flex flex-1 flex-col gap-4 p-6">
        <CategoryBadge category={post.category} />

        <h3 className="text-lg font-semibold leading-snug text-navy transition group-hover:text-forest">
          {post.title}
        </h3>

        <p className="flex-1 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-forest to-forest-light text-xs font-bold text-white">
            {post.author.initials}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-navy">
              {post.author.name}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-light">
              <Calendar className="h-3 w-3" />
              {post.date}
              <span className="text-border">|</span>
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-light transition group-hover:translate-x-1 group-hover:text-forest" />
        </div>
      </div>
    </motion.a>
  )
}

function FeaturedCard() {
  const post = FEATURED_POST
  return (
    <motion.a
      href={`/blog/${post.slug}`}
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-white shadow-xs"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-teal-500/5 to-transparent" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/[0.05] blur-3xl" />

      <div className="relative grid gap-8 p-8 md:grid-cols-5 md:p-12">
        {/* Image placeholder */}
        <div className="flex items-center justify-center rounded-2xl border border-border bg-cream-dark/50 md:col-span-2 aspect-[4/3] md:aspect-auto">
          <div className="flex flex-col items-center gap-3 text-muted-light">
            <BookOpen className="h-12 w-12" />
            <span className="text-sm font-medium">Featured Article</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center gap-5 md:col-span-3">
          <div className="flex items-center gap-3">
            <CategoryBadge category={post.category} size="md" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-light">
              Featured
            </span>
          </div>

          <h2 className="text-2xl font-bold leading-tight text-navy transition group-hover:text-forest md:text-3xl lg:text-4xl">
            {post.title}
          </h2>

          <p className="max-w-xl text-base leading-relaxed text-muted">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
              {post.author.initials}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-navy">
                {post.author.name}
              </span>
              <span className="flex items-center gap-2 text-xs text-muted-light">
                {post.date}
                <span className="text-border">|</span>
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </div>
          </div>

          <div className="mt-1">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition group-hover:gap-3">
              Read Article
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </motion.a>
  )
}

function NewsletterCTA() {
  return (
    <Section className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl bg-navy"
      >
        <div className="absolute inset-0 bg-linear-to-br from-forest/20 via-transparent to-forest/10" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-forest/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-lime/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 px-8 py-16 text-center md:py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-forest to-forest-light">
            <Mail className="h-6 w-6 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Stay in the loop
          </h2>
          <p className="max-w-md text-base text-white/60">
            Get the latest on AI-powered product planning, new features, and
            engineering deep dives delivered to your inbox.
          </p>

          <div className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-lime/40 transition focus:border-lime/40 focus:ring-2"
            />
            <button className="rounded-xl bg-lime px-6 py-3 text-sm font-semibold text-navy shadow-xs transition hover:bg-lime-hover">
              Subscribe
            </button>
          </div>

          <p className="text-xs text-white/40">
            Join 5,000+ AI builders. No spam, unsubscribe anytime.
          </p>
        </div>
      </motion.div>
    </Section>
  )
}

function MiniFooter() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <span>&copy; {new Date().getFullYear()} PlanForge AI. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <Link href="/" className="transition hover:text-navy">
            Home
          </Link>
          <Link href="/privacy" className="transition hover:text-navy">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-navy">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────────────────────────────
   PAGE
   ────────────────────────────────────────── */

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All")
  const [search, setSearch] = useState("")

  const filtered =
    activeCategory === "All"
      ? POSTS
      : POSTS.filter((p) => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-cream text-navy">
      <Navbar variant="solid" />

      {/* ── Hero ── */}
      <Section className="pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-5 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-muted">
              <Rss className="h-3.5 w-3.5 text-forest" />
              Blog
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-navy sm:text-5xl lg:text-6xl">
              The PlanForge Blog
            </h1>

            <p className="max-w-2xl text-lg leading-relaxed text-muted">
              Insights on AI-powered product planning, agent orchestration, and
              shipping faster.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            variants={fadeUp}
            custom={1}
            className="mx-auto mt-10 max-w-xl"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search articles..."
                className="w-full rounded-2xl border border-border bg-white py-3.5 pl-11 pr-4 text-sm text-navy placeholder-muted-light outline-none ring-forest/30 shadow-xs transition focus:border-forest/30 focus:ring-2"
              />
            </div>
          </motion.div>

          {/* Category pills */}
          <motion.div
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2"
          >
            {CATEGORIES.map(({ label, icon: Icon }) => {
              const active = activeCategory === label
              return (
                <button
                  key={label}
                  onClick={() => setActiveCategory(label)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-forest/30 bg-forest/10 text-forest"
                      : "border-border bg-white text-muted hover:border-forest/20 hover:text-navy"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              )
            })}
          </motion.div>
        </div>
      </Section>

      {/* ── Featured Post ── */}
      {activeCategory === "All" && (
        <Section className="mx-auto max-w-6xl px-6 pb-16">
          <FeaturedCard />
        </Section>
      )}

      {/* ── Blog Grid ── */}
      <Section className="mx-auto max-w-6xl px-6 pb-16">
        <motion.div
          variants={stagger}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center gap-3 py-20 text-center"
          >
            <BookOpen className="h-10 w-10 text-muted-light" />
            <p className="text-muted">
              No posts in this category yet. Check back soon!
            </p>
          </motion.div>
        )}
      </Section>

      {/* ── Load More ── */}
      <Section className="flex justify-center px-6 pb-24">
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-8 py-3.5 text-sm font-semibold text-navy shadow-xs transition hover:border-forest/20 hover:text-forest"
        >
          <Loader2 className="h-4 w-4" />
          Load More Posts
        </motion.button>
      </Section>

      {/* ── Newsletter ── */}
      <NewsletterCTA />

      {/* ── Footer ── */}
      <MiniFooter />
    </div>
  )
}
