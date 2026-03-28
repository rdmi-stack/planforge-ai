"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
  Mail,
  Twitter,
  Linkedin,
  Link2,
  Check,
  BookOpen,
  Quote,
  Lightbulb,
  TrendingDown,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/landing/navbar"

/* ──────────────────────────────────────────
   TYPES
   ────────────────────────────────────────── */

type Category =
  | "Product Updates"
  | "Engineering"
  | "AI & Agents"
  | "Tutorials"
  | "Company"

interface RelatedPost {
  slug: string
  title: string
  excerpt: string
  category: Category
  date: string
  readTime: string
}

/* ──────────────────────────────────────────
   DATA
   ────────────────────────────────────────── */

const CATEGORY_BG: Record<Category, string> = {
  "Product Updates": "bg-forest/10 text-forest ring-forest/20",
  Engineering: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  "AI & Agents": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  Tutorials: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  Company: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
}

const CATEGORY_ACCENT: Record<Category, string> = {
  "Product Updates": "from-forest to-forest-light",
  Engineering: "from-sky-500 to-blue-600",
  "AI & Agents": "from-emerald-500 to-teal-600",
  Tutorials: "from-amber-500 to-orange-600",
  Company: "from-rose-500 to-pink-600",
}

const RELATED_POSTS: RelatedPost[] = [
  {
    slug: "multi-agent-orchestration",
    title: "Introducing Multi-Agent Orchestration: Dispatch to 10 Agents at Once",
    excerpt:
      "Our new orchestration layer lets you fan out work across specialized AI agents — plan, code, test, and deploy in parallel.",
    category: "Product Updates",
    date: "Mar 17, 2026",
    readTime: "5 min read",
  },
  {
    slug: "prompt-engineering-playbook",
    title: "The Prompt Engineering Playbook for AI Coding Agents",
    excerpt:
      "A practical guide to crafting prompts that produce clean, testable code from LLM-powered agents on the first pass.",
    category: "AI & Agents",
    date: "Mar 12, 2026",
    readTime: "10 min read",
  },
  {
    slug: "idea-to-production-30-minutes",
    title: "From Idea to Production in 30 Minutes: A Step-by-Step Guide",
    excerpt:
      "Follow along as we take a raw feature idea through PlanForge and ship it to production — complete with tests and CI.",
    category: "Tutorials",
    date: "Mar 8, 2026",
    readTime: "15 min read",
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
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
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
   SHARE BUTTONS
   ────────────────────────────────────────── */

function ShareButtons() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silently
    }
  }

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      "How We Reduced AI Agent Retries by 80% with Structured Planning — by @PlanForgeAI"
    )
    const url = encodeURIComponent(window.location.href)
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank"
    )
  }

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-sm text-muted-light">Share</span>
      <button
        onClick={shareOnTwitter}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-cream-dark text-muted transition hover:border-forest/20 hover:text-navy"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        onClick={shareOnLinkedIn}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-cream-dark text-muted transition hover:border-forest/20 hover:text-navy"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </button>
      <button
        onClick={handleCopy}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition",
          copied
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-border bg-cream-dark text-muted hover:border-forest/20 hover:text-navy"
        )}
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied!
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" />
            Copy Link
          </>
        )}
      </button>
    </div>
  )
}

/* ──────────────────────────────────────────
   CATEGORY BADGE
   ────────────────────────────────────────── */

function CategoryBadge({
  category,
  size = "sm",
}: {
  category: Category
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

/* ──────────────────────────────────────────
   RELATED POST CARD
   ────────────────────────────────────────── */

function RelatedCard({
  post,
  index,
}: {
  post: RelatedPost
  index: number
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white"
      >
        <div
          className={cn(
            "h-1.5 w-full bg-linear-to-r",
            CATEGORY_ACCENT[post.category]
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

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="flex items-center gap-2 text-xs text-muted-light">
              <Calendar className="h-3 w-3" />
              {post.date}
              <span className="text-muted-light">|</span>
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-light transition group-hover:translate-x-1 group-hover:text-forest" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ──────────────────────────────────────────
   NEWSLETTER CTA
   ────────────────────────────────────────── */

function NewsletterCTA() {
  return (
    <Section className="mx-auto max-w-4xl px-6 py-20">
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-3xl border border-border bg-navy"
      >
        <div className="absolute inset-0 bg-linear-to-br from-forest/5 via-transparent to-lime/5" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-forest/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-lime/5 blur-3xl" />

        <div className="relative flex flex-col items-center gap-5 px-8 py-14 text-center md:py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-forest to-forest-light">
            <Mail className="h-5 w-5 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Enjoyed this post?
          </h2>
          <p className="max-w-md text-base text-white/70">
            Get engineering deep dives and product updates delivered straight to
            your inbox. No fluff, just signal.
          </p>

          <div className="mt-1 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 rounded-xl border border-border bg-cream-dark px-4 py-3 text-sm text-white placeholder-muted-light outline-none ring-forest/30 transition focus:border-forest/30 focus:ring-2"
            />
            <button className="rounded-xl bg-linear-to-r from-forest to-forest-light px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:brightness-110">
              Subscribe
            </button>
          </div>

          <p className="text-xs text-white/50">
            Join 5,000+ AI builders. Unsubscribe anytime.
          </p>
        </div>
      </motion.div>
    </Section>
  )
}

/* ──────────────────────────────────────────
   MINI FOOTER
   ────────────────────────────────────────── */

function MiniFooter() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <span>
          &copy; {new Date().getFullYear()} PlanForge AI. All rights reserved.
        </span>
        <div className="flex items-center gap-6">
          <Link href="/" className="transition hover:text-navy">
            Home
          </Link>
          <Link href="/blog" className="transition hover:text-navy">
            Blog
          </Link>
          <Link href="/pricing" className="transition hover:text-navy">
            Pricing
          </Link>
          <Link href="#" className="transition hover:text-navy">
            Privacy
          </Link>
          <Link href="#" className="transition hover:text-navy">
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

export default function BlogArticlePage() {
  return (
    <div className="min-h-screen bg-cream text-navy">
      <Navbar variant="solid" />

      {/* ── Article Header ── */}
      <Section className="pt-28 pb-8 md:pt-32">
        <div className="mx-auto max-w-3xl px-6">
          {/* Back link */}
          <motion.div variants={fadeUp}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Category */}
          <motion.div variants={fadeUp} custom={1} className="mt-6">
            <CategoryBadge category="Engineering" size="md" />
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            custom={2}
            className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl md:text-5xl"
          >
            How We Reduced AI Agent Retries by 80% with Structured Planning
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={3}
            className="mt-4 text-lg leading-relaxed text-muted md:text-xl"
          >
            Unstructured prompts cause agents to spin in circles. Here is the
            planning middleware we built that slashed our retry rate and saved
            thousands in compute costs.
          </motion.p>

          {/* Author row */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-blue-600 text-sm font-bold text-white">
                PS
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-navy">
                  Priya Sharma
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-light">
                  Staff Engineer
                  <span className="text-muted">|</span>
                  <Calendar className="h-3 w-3" />
                  Mar 20, 2026
                  <span className="text-muted">|</span>
                  <Clock className="h-3 w-3" />
                  8 min read
                </span>
              </div>
            </div>

            <ShareButtons />
          </motion.div>
        </div>
      </Section>

      {/* ── Hero Image Placeholder ── */}
      <Section className="mx-auto max-w-4xl px-6 pb-12">
        <motion.div variants={fadeUp}>
          <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden rounded-2xl border border-border bg-linear-to-br from-sky-500/20 via-blue-600/10 to-forest/20">
            <div className="absolute inset-0 bg-navy/5" />
            <div className="relative flex flex-col items-center gap-3 text-muted">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-forest to-forest-light">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-light">
                PlanForge AI
              </span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-muted-light">
            Visualization of the structured planning pipeline that reduced
            agent retries from an average of 4.7 to under 1.0 per task.
          </p>
        </motion.div>
      </Section>

      {/* ── Article Body ── */}
      <Section className="mx-auto max-w-3xl px-6 pb-16">
        <motion.div variants={fadeUp} className="space-y-8">
          {/* Intro */}
          <p className="text-lg leading-[1.8] text-navy/80">
            At PlanForge, our AI agents generate project plans, write code, and
            run test suites autonomously. But six months ago, we had a problem:
            nearly half of all agent runs required multiple retries before
            producing an acceptable result. Each retry burned tokens, added
            latency, and degraded the user experience. We needed a fundamentally
            different approach.
          </p>

          <p className="text-lg leading-[1.8] text-navy/80">
            This post walks through the engineering journey from identifying the
            root cause of excessive retries to building a structured planning
            layer that sits between user intent and agent execution. The result
            was an 80% reduction in retries, a 3x improvement in first-pass
            success rate, and over $47,000 saved in monthly compute costs.
          </p>

          {/* H2 */}
          <h2 className="pt-4 text-2xl font-bold text-navy">
            The Problem: Agents Without a Plan
          </h2>

          <p className="text-lg leading-[1.8] text-navy/80">
            When we first launched PlanForge, our agent pipeline was
            straightforward. A user would describe a feature, and we would pass
            that description directly to a coding agent with a system prompt
            containing the project context. The agent would generate code, we
            would run tests, and if they failed, we would retry with the error
            output appended to the conversation.
          </p>

          <p className="text-lg leading-[1.8] text-navy/80">
            This worked for simple tasks. But as our users tackled more complex
            features — multi-file changes, database migrations, API integrations
            — the retry rate climbed. We instrumented everything and discovered
            a troubling pattern: agents were not failing because they lacked
            capability, they were failing because they lacked structure. Without
            an explicit plan, they would make contradictory decisions across
            files, miss edge cases, or generate code that satisfied one
            requirement while breaking another.
          </p>

          {/* Metric highlight */}
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-white px-8 py-8 text-center">
            <div className="flex items-center gap-2 text-muted-light">
              <TrendingDown className="h-5 w-5 text-sky-400" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Before Structured Planning
              </span>
            </div>
            <span className="mt-2 text-5xl font-extrabold text-navy">
              4.7
            </span>
            <span className="text-base text-muted">
              average retries per agent task
            </span>
            <div className="mt-4 h-px w-24 bg-cream-dark" />
            <span className="mt-4 text-5xl font-extrabold text-emerald-400">
              0.9
            </span>
            <span className="text-base text-muted">
              after shipping the planning middleware
            </span>
          </div>

          {/* H2 */}
          <h2 className="pt-4 text-2xl font-bold text-navy">
            Designing the Planning Middleware
          </h2>

          <p className="text-lg leading-[1.8] text-navy/80">
            The core insight was simple: before an agent writes any code, it
            should produce an explicit, structured plan that we can validate
            programmatically. This is not a new idea in software engineering —
            we write design documents before building features — but it was
            missing from our agent pipeline. We set out to build a planning
            middleware that sits between the user&apos;s intent and the execution
            agent.
          </p>

          <p className="text-lg leading-[1.8] text-navy/80">
            The planning phase generates a JSON-structured document that
            includes: the files to be created or modified, the dependencies
            between them, the expected function signatures, the test cases to
            satisfy, and a step-by-step execution order. Critically, this plan
            is validated against the existing codebase before any code
            generation begins. If the plan references a file that does not exist
            or proposes a function signature that conflicts with an existing
            interface, we catch it immediately.
          </p>

          {/* Bulleted list */}
          <div className="space-y-3 pl-1">
            <p className="text-lg font-semibold text-navy">
              Key properties of a well-structured agent plan:
            </p>
            <ul className="space-y-2.5 text-lg leading-[1.8] text-navy/80">
              <li className="flex gap-3">
                <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                <span>
                  <strong className="text-navy">Decomposed steps</strong> —
                  each step maps to exactly one file change, making rollback
                  trivial and progress observable
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                <span>
                  <strong className="text-navy">Dependency ordering</strong>{" "}
                  — steps declare their dependencies, so the executor processes
                  them in the correct topological order
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                <span>
                  <strong className="text-navy">
                    Pre-declared contracts
                  </strong>{" "}
                  — function signatures, type definitions, and API schemas are
                  specified upfront, preventing cross-file inconsistencies
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                <span>
                  <strong className="text-navy">
                    Test criteria baked in
                  </strong>{" "}
                  — each step includes the specific assertion that must pass,
                  giving the agent a clear success condition
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-[10px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sky-400" />
                <span>
                  <strong className="text-navy">
                    Validation checkpoints
                  </strong>{" "}
                  — the plan is validated against the live codebase AST before
                  execution begins
                </span>
              </li>
            </ul>
          </div>

          {/* H2 */}
          <h2 className="pt-4 text-2xl font-bold text-navy">
            The Prompt Architecture
          </h2>

          <p className="text-lg leading-[1.8] text-navy/80">
            The planning agent receives a carefully constructed prompt that
            includes the user&apos;s feature description, the relevant file tree,
            existing type definitions, and a schema for the plan output format.
            Here is a simplified version of the planning prompt:
          </p>

          {/* Code block */}
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-cream-dark px-4 py-2.5">
              <span className="text-xs font-medium text-muted-light">
                planning-prompt.txt
              </span>
              <span className="rounded-md bg-cream-dark px-2 py-0.5 text-xs text-muted-light">
                prompt
              </span>
            </div>
            <pre className="overflow-x-auto bg-navy p-5 text-sm leading-relaxed">
              <code className="text-white/80">
{`You are a planning agent for a software project.

Given the feature description and project context below,
produce a structured execution plan in JSON format.

FEATURE: {feature_description}

PROJECT CONTEXT:
- File tree: {file_tree}
- Existing types: {type_definitions}
- Test framework: {test_config}

OUTPUT SCHEMA:
{
  "steps": [
    {
      "id": "step_1",
      "action": "create | modify",
      "file": "src/services/auth.ts",
      "description": "Add OAuth2 token refresh logic",
      "depends_on": [],
      "contracts": {
        "exports": ["refreshToken(token: string): Promise<Token>"],
        "imports": ["Token from @/types"]
      },
      "test_criteria": "refreshToken returns new token when expired"
    }
  ],
  "execution_order": ["step_1", "step_2", ...]
}

RULES:
- Each step must touch exactly ONE file.
- Declare all function signatures before referencing them.
- Steps must be ordered so dependencies are resolved first.
- Include test criteria for every step.`}
              </code>
            </pre>
          </div>

          <p className="text-lg leading-[1.8] text-navy/80">
            The structured output schema is the key enabler. By constraining
            the planning agent to a well-defined JSON format, we can validate
            the plan programmatically, check for circular dependencies, and
            verify that every referenced file and type actually exists in the
            codebase. This catches a huge class of errors before any code
            generation happens.
          </p>

          {/* Blockquote */}
          <div className="relative rounded-2xl border border-border bg-cream-dark/50 px-8 py-7">
            <Quote className="absolute right-6 top-6 h-8 w-8 text-cream-dark" />
            <blockquote className="relative text-lg italic leading-[1.8] text-navy/80">
              &ldquo;The biggest unlock was realizing that LLMs are dramatically
              better at following a plan than creating one on the fly. Separating
              planning from execution turned our agents from unreliable
              assistants into dependable team members.&rdquo;
            </blockquote>
            <p className="mt-4 text-sm font-medium text-muted">
              — Arjun Mehta, Co-founder &amp; CTO, PlanForge AI
            </p>
          </div>

          {/* H2 */}
          <h2 className="pt-4 text-2xl font-bold text-navy">
            Validation Before Execution
          </h2>

          <p className="text-lg leading-[1.8] text-navy/80">
            Once the planning agent produces a plan, it passes through three
            validation stages before a single line of code is generated. First,
            schema validation ensures the JSON matches our expected structure and
            all required fields are present. Second, dependency validation builds
            a directed acyclic graph from the step dependencies and checks for
            cycles. Third, codebase validation parses the existing project AST
            and verifies that every file reference, import path, and type
            reference in the plan resolves correctly.
          </p>

          <p className="text-lg leading-[1.8] text-navy/80">
            This three-stage validation catches approximately 35% of planning
            errors before they would have become code generation failures. In
            those cases, the planning agent is asked to revise its plan with
            specific feedback about what went wrong. This is a much cheaper
            retry than re-generating an entire codebase change — a plan revision
            typically costs 500-800 tokens compared to 5,000-15,000 tokens for
            a code generation retry.
          </p>

          {/* H2 */}
          <h2 className="pt-4 text-2xl font-bold text-navy">
            Results and Impact
          </h2>

          <p className="text-lg leading-[1.8] text-navy/80">
            We rolled out the structured planning middleware in a staged
            deployment over two weeks in January 2026. The impact was immediate
            and dramatic. Average retries per task dropped from 4.7 to 0.9 — an
            80% reduction. First-pass success rate climbed from 22% to 68%.
            Median task completion time decreased by 40%, and our monthly
            compute bill dropped by $47,000. Users also reported higher
            confidence in agent outputs because they could inspect the plan
            before execution.
          </p>

          <p className="text-lg leading-[1.8] text-navy/80">
            Perhaps the most surprising finding was the effect on complex,
            multi-file tasks. These had previously been our worst-performing
            category, with retry rates often exceeding 8 per task. With
            structured planning, multi-file tasks actually performed better
            than single-file tasks — likely because the explicit dependency
            ordering prevented the cross-file inconsistencies that had been
            the primary source of failures.
          </p>

          {/* H2 */}
          <h2 className="pt-4 text-2xl font-bold text-navy">
            Lessons Learned
          </h2>

          <p className="text-lg leading-[1.8] text-navy/80">
            Building this system taught us several lessons that apply broadly to
            anyone building with AI agents. The most important is that
            constraining an LLM&apos;s output format is not limiting — it is
            liberating. When the model knows exactly what structure to produce,
            it can focus its capacity on the content quality rather than
            formatting decisions. Similarly, separating planning from execution
            creates a natural checkpoint where humans (or automated validators)
            can intervene before expensive downstream work begins.
          </p>

          <p className="text-lg leading-[1.8] text-navy/80">
            We also learned that the planning prompt itself requires
            iteration. Our initial version produced plans that were either too
            granular (one step per line of code) or too coarse (one step per
            feature). Finding the right level of abstraction — one step per file
            change — took several rounds of experimentation. We ultimately
            settled on including three to four example plans in the prompt to
            calibrate the granularity, and this in-context learning approach
            proved more effective than any amount of instructional text.
          </p>

          {/* Key Takeaway box */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-8 py-7">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/[0.06] blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                  Key Takeaway
                </span>
              </div>
              <p className="mt-4 text-lg leading-[1.8] text-navy">
                AI agents perform dramatically better when you separate planning
                from execution. A structured plan — validated against your
                codebase before a single line of code is generated — eliminates
                the class of cross-file inconsistency errors that cause the
                majority of agent retries. This is not just an optimization; it
                is an architectural pattern that should be the default for any
                production agent system.
              </p>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ── Author Bio Card ── */}
      <Section className="mx-auto max-w-3xl px-6 pb-16">
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-white p-8 sm:flex-row sm:items-start"
        >
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-blue-600 text-xl font-bold text-white">
            PS
          </div>
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-navy">Priya Sharma</h3>
            <p className="text-sm font-medium text-sky-400">
              Staff Engineer at PlanForge AI
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Priya leads the agent infrastructure team at PlanForge, where she
              focuses on reliability and performance of AI-powered code
              generation pipelines. Previously, she built distributed systems at
              Stripe and contributed to the Go compiler toolchain.
            </p>
            <a
              href="https://twitter.com/priyasharma"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-sky-400"
            >
              <Twitter className="h-3.5 w-3.5" />
              Follow on Twitter
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </motion.div>
      </Section>

      {/* ── Related Posts ── */}
      <Section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div variants={fadeUp} className="mb-10">
          <h2 className="text-2xl font-bold text-navy md:text-3xl">
            Continue Reading
          </h2>
          <p className="mt-2 text-base text-muted">
            More from the PlanForge engineering blog
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {RELATED_POSTS.map((post, i) => (
            <RelatedCard key={post.slug} post={post} index={i} />
          ))}
        </motion.div>
      </Section>

      {/* ── Newsletter ── */}
      <NewsletterCTA />

      {/* ── Footer ── */}
      <MiniFooter />
    </div>
  )
}
