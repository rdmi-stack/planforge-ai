# CLAUDE.md — PlanForge AI (BrainGrid Killer)
# AI Product Planning & Development Command Center

## PROJECT IDENTITY

- **Product Name**: PlanForge AI
- **Tagline**: "From idea to production-ready code, autonomously."
- **What it does**: AI-powered product planning platform that takes natural language ideas, generates specs/PRDs, breaks features into atomic tasks, and dispatches them to AI coding agents (Claude Code, Cursor, Codex, etc.) — with codebase awareness, multi-agent orchestration, and production readiness built in.
- **Target Users**: AI builders, non-technical founders, indie hackers, dev agencies, product managers
- **Competitive Target**: BrainGrid AI (dominate and surpass)

---

## TECH STACK — EXACT VERSIONS

### Frontend
- **Framework**: Next.js 16.2 (App Router, Turbopack default, proxy.ts instead of middleware.ts, Cache Components with `use cache`)
- **Language**: TypeScript 5.7+ (strict mode)
- **Styling**: Tailwind CSS v4.2 (CSS-first config via `@theme` directives, NO `tailwind.config.js`, use `@import "tailwindcss"` in CSS)
- **UI Components**: shadcn/ui (latest, installed via CLI into `src/components/ui/`)
- **State Management**: Zustand v5 for client state, React Server Components for server state
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: Tiptap v2 (for spec/PRD editor)
- **Drag & Drop**: dnd-kit (for task reordering, kanban boards)
- **Charts**: Recharts (for dashboards and analytics)
- **Icons**: Lucide React
- **Animations**: Framer Motion v11

### Backend
- **Framework**: FastAPI 0.135.2
- **Language**: Python 3.13
- **ASGI Server**: Uvicorn with uvloop
- **Validation**: Pydantic v2.12+
- **ORM**: SQLAlchemy 2.0 (async) + Alembic for migrations
- **Database**: PostgreSQL 16 (primary), Redis 7 (caching, queues, sessions)
- **Task Queue**: Celery 5 with Redis broker (for async AI generation, agent orchestration)
- **WebSockets**: FastAPI WebSocket + Redis Pub/Sub (real-time collaboration, agent status)
- **Auth**: NextAuth.js v5 on frontend → JWT tokens validated by FastAPI backend
- **File Storage**: AWS S3 / Cloudflare R2
- **Search**: PostgreSQL full-text search (pg_trgm) — upgrade to Meilisearch if needed later
- **AI**: Anthropic Claude API (primary), OpenAI API (fallback), structured output via instructor library

### Infrastructure
- **Package Manager (frontend)**: pnpm
- **Package Manager (backend)**: uv (NOT pip, NOT poetry)
- **Monorepo Structure**: Single repo, two top-level dirs: `frontend/` and `backend/`
- **Containerization**: Docker + Docker Compose for local dev
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (frontend) + Railway/Render (backend) or AWS ECS

---

## PROJECT STRUCTURE
```
planforge/
├── CLAUDE.md                          # THIS FILE
├── docker-compose.yml                 # Local dev orchestration
├── .env.example                       # Environment variables template
├── .gitignore
│
├── frontend/                          # Next.js 16.2 App
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── proxy.ts                       # NOT middleware.ts — Next.js 16 uses proxy.ts
│   ├── app.css                        # Global CSS with @import "tailwindcss" and @theme
│   │
│   ├── src/
│   │   ├── app/                       # App Router pages
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx         # Dashboard shell with sidebar
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx       # Projects list
│   │   │   │   │   └── [projectId]/
│   │   │   │   │       ├── page.tsx   # Project overview
│   │   │   │   │       ├── specs/
│   │   │   │   │       │   ├── page.tsx
│   │   │   │   │       │   └── [specId]/page.tsx
│   │   │   │   │       ├── features/
│   │   │   │   │       │   ├── page.tsx
│   │   │   │   │       │   └── [featureId]/page.tsx
│   │   │   │   │       ├── tasks/
│   │   │   │   │       │   ├── page.tsx         # Kanban board view
│   │   │   │   │       │   └── [taskId]/page.tsx
│   │   │   │   │       ├── architecture/page.tsx
│   │   │   │   │       ├── agents/page.tsx      # Agent orchestration dashboard
│   │   │   │   │       ├── settings/page.tsx
│   │   │   │   │       └── analytics/page.tsx
│   │   │   │   ├── templates/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── billing/page.tsx
│   │   │   └── api/
│   │   │       └── auth/[...nextauth]/route.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components (DO NOT EDIT)
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── breadcrumbs.tsx
│   │   │   │   └── command-palette.tsx
│   │   │   ├── projects/
│   │   │   │   ├── project-card.tsx
│   │   │   │   ├── create-project-dialog.tsx
│   │   │   │   └── project-settings-form.tsx
│   │   │   ├── specs/
│   │   │   │   ├── spec-editor.tsx          # Tiptap rich text editor
│   │   │   │   ├── spec-preview.tsx
│   │   │   │   ├── spec-diff-viewer.tsx
│   │   │   │   └── spec-template-picker.tsx
│   │   │   ├── features/
│   │   │   │   ├── feature-tree.tsx         # Hierarchical feature view
│   │   │   │   ├── feature-card.tsx
│   │   │   │   ├── prioritization-matrix.tsx
│   │   │   │   └── dependency-graph.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── kanban-board.tsx
│   │   │   │   ├── task-card.tsx
│   │   │   │   ├── task-detail-panel.tsx
│   │   │   │   └── agent-dispatch-button.tsx
│   │   │   ├── chat/
│   │   │   │   ├── planning-chat.tsx        # AI planning conversation
│   │   │   │   ├── chat-message.tsx
│   │   │   │   └── smart-question-card.tsx
│   │   │   ├── architecture/
│   │   │   │   ├── arch-diagram-viewer.tsx
│   │   │   │   ├── schema-designer.tsx
│   │   │   │   └── api-contract-viewer.tsx
│   │   │   ├── agents/
│   │   │   │   ├── agent-status-card.tsx
│   │   │   │   ├── agent-output-viewer.tsx
│   │   │   │   └── orchestration-timeline.tsx
│   │   │   └── shared/
│   │   │       ├── loading-skeleton.tsx
│   │   │       ├── empty-state.tsx
│   │   │       ├── error-boundary.tsx
│   │   │       └── confirm-dialog.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api-client.ts          # Typed fetch wrapper for FastAPI backend
│   │   │   ├── auth.ts                # NextAuth config
│   │   │   ├── utils.ts               # cn() helper, formatters
│   │   │   ├── constants.ts
│   │   │   └── validators.ts          # Zod schemas (shared with forms)
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-project.ts
│   │   │   ├── use-specs.ts
│   │   │   ├── use-tasks.ts
│   │   │   ├── use-websocket.ts
│   │   │   ├── use-debounce.ts
│   │   │   └── use-keyboard-shortcuts.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── project-store.ts       # Zustand
│   │   │   ├── chat-store.ts
│   │   │   ├── task-store.ts
│   │   │   └── ui-store.ts            # Sidebar state, modals, etc.
│   │   │
│   │   └── types/
│   │       ├── project.ts
│   │       ├── spec.ts
│   │       ├── feature.ts
│   │       ├── task.ts
│   │       ├── agent.ts
│   │       └── api.ts                 # API response types matching FastAPI schemas
│   │
│   └── public/
│       ├── logo.svg
│       └── og-image.png
│
├── backend/                           # FastAPI Application
│   ├── pyproject.toml                 # uv project config
│   ├── uv.lock
│   ├── alembic.ini
│   ├── Dockerfile
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app factory, CORS, lifespan
│   │   ├── config.py                  # Pydantic Settings (env vars)
│   │   ├── database.py                # Async SQLAlchemy engine + session
│   │   ├── dependencies.py            # FastAPI Depends() — auth, db session, rate limit
│   │   │
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base model with id, created_at, updated_at
│   │   │   ├── user.py
│   │   │   ├── organization.py
│   │   │   ├── project.py
│   │   │   ├── spec.py
│   │   │   ├── spec_version.py
│   │   │   ├── feature.py
│   │   │   ├── task.py
│   │   │   ├── agent_run.py
│   │   │   ├── template.py
│   │   │   └── decision_log.py
│   │   │
│   │   ├── schemas/                   # Pydantic v2 request/response schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── project.py
│   │   │   ├── spec.py
│   │   │   ├── feature.py
│   │   │   ├── task.py
│   │   │   ├── agent.py
│   │   │   ├── chat.py
│   │   │   └── common.py              # Pagination, error responses
│   │   │
│   │   ├── api/                       # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py          # Aggregates all v1 routes
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── specs.py
│   │   │   │   ├── features.py
│   │   │   │   ├── tasks.py
│   │   │   │   ├── chat.py            # AI planning chat endpoint (streaming)
│   │   │   │   ├── agents.py          # Agent dispatch & status
│   │   │   │   ├── architecture.py
│   │   │   │   ├── templates.py
│   │   │   │   ├── analytics.py
│   │   │   │   └── webhooks.py
│   │   │   └── ws/
│   │   │       ├── __init__.py
│   │   │       └── collaboration.py   # WebSocket handlers
│   │   │
│   │   ├── services/                  # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── ai_planner.py          # Core AI: idea → spec → features → tasks
│   │   │   ├── spec_generator.py      # PRD/spec generation with Claude
│   │   │   ├── feature_decomposer.py  # Epic → feature → story → task breakdown
│   │   │   ├── task_generator.py      # Atomic task + prompt generation
│   │   │   ├── prioritizer.py         # ICE/RICE/MoSCoW scoring engine
│   │   │   ├── architecture_engine.py # System design, schema, API contract generation
│   │   │   ├── agent_orchestrator.py  # Multi-agent dispatch, validation, retry
│   │   │   ├── codebase_analyzer.py   # GitHub repo analysis for codebase-aware planning
│   │   │   ├── production_checker.py  # Production readiness audit
│   │   │   ├── template_engine.py     # Template matching and customization
│   │   │   ├── export_service.py      # Export to MCP, CLI, clipboard, markdown
│   │   │   └── billing_service.py     # Stripe integration
│   │   │
│   │   ├── ai/                        # AI/LLM integration layer
│   │   │   ├── __init__.py
│   │   │   ├── client.py              # Anthropic + OpenAI client wrapper
│   │   │   ├── prompts/               # Prompt templates (Jinja2)
│   │   │   │   ├── spec_generation.j2
│   │   │   │   ├── feature_breakdown.j2
│   │   │   │   ├── task_prompt.j2
│   │   │   │   ├── smart_questions.j2
│   │   │   │   ├── architecture.j2
│   │   │   │   ├── production_audit.j2
│   │   │   │   └── prioritization.j2
│   │   │   ├── structured_output.py   # instructor library for typed AI responses
│   │   │   └── token_tracker.py       # Usage tracking per user/org
│   │   │
│   │   ├── workers/                   # Celery async tasks
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py
│   │   │   ├── ai_tasks.py            # Long-running AI generation
│   │   │   ├── agent_tasks.py         # Agent dispatch and monitoring
│   │   │   ├── export_tasks.py
│   │   │   └── analytics_tasks.py
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── security.py            # JWT decode/verify, password hashing
│   │       ├── rate_limiter.py        # Redis-based rate limiting
│   │       ├── pagination.py
│   │       └── github_client.py       # GitHub API for repo analysis
│   │
│   ├── migrations/                    # Alembic migrations
│   │   ├── env.py
│   │   └── versions/
│   │
│   └── tests/
│       ├── conftest.py
│       ├── test_api/
│       ├── test_services/
│       └── test_ai/
│
└── shared/                            # Shared constants, enums (referenced by both)
    └── enums.py                       # Task status, priority levels, etc.
```

---

## CODING CONVENTIONS

### General
- NEVER use `any` in TypeScript. Always define proper types.
- NEVER use `console.log` in production code. Use structured logging.
- Every file should have a single responsibility.
- Keep functions under 50 lines. Extract helpers.
- Use early returns to reduce nesting.
- Comments explain WHY, not WHAT. Code should be self-documenting.

### Frontend (Next.js 16.2 + TypeScript)

#### App Router Rules
- Use Server Components by default. Add `"use client"` ONLY when needed (interactivity, hooks, browser APIs).
- Use `proxy.ts` (NOT `middleware.ts`) for auth redirects and request interception. Export function named `proxy`, NOT `middleware`.
- Use Cache Components with `"use cache"` directive for data that should be cached. Do NOT use the old `experimental.ppr` flag.
- Data fetching in Server Components: use `async` component functions with direct `fetch()` or server-side service calls.
- For mutations: use Server Actions (`"use server"` functions).
- File naming: `kebab-case.tsx` for components, `kebab-case.ts` for utilities.
- Route groups: use `(groupName)` folders for layout grouping without URL impact.

#### Tailwind CSS v4.2 Rules
- NO `tailwind.config.js` or `tailwind.config.ts` file. All config goes in CSS.
- Global CSS file starts with `@import "tailwindcss";` then `@theme { }` block for custom tokens.
- Use `@theme` for custom colors, fonts, spacing, breakpoints as CSS custom properties.
- Use v4 canonical class names: `bg-linear-to-r` (NOT `bg-gradient-to-r`), `shrink-0` (NOT `flex-shrink-0`).
- Dark mode: use `@media (prefers-color-scheme: dark)` by default. If class-based needed, configure explicitly.
- Use CSS variables for theming: `var(--color-primary-500)` instead of `theme()` function.

#### Component Patterns
```tsx
// CORRECT: Server Component (default)
export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await getProject(params.projectId)
  return <ProjectView project={project} />
}

// CORRECT: Client Component (only when needed)
"use client"
import { useState } from "react"
export function TaskKanban({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  // ...
}
```

#### API Client Pattern
```typescript
// src/lib/api-client.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function apiClient<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options || {}
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions?.headers,
    },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new ApiError(res.status, error.detail || "Request failed")
  }
  return res.json()
}
```

### Backend (FastAPI + Python 3.13)

#### FastAPI Patterns
- Use `async def` for ALL route handlers. No sync handlers.
- Use dependency injection via `Depends()` for auth, db sessions, rate limiting.
- All routes return Pydantic v2 schemas, never raw dicts.
- Use `APIRouter` with prefix and tags for every route group.
- Streaming responses for AI generation: use `StreamingResponse` with `text/event-stream`.
- Error responses: use `HTTPException` with structured detail messages. Define custom exception handlers in `main.py`.

#### File Patterns
```python
# CORRECT: Route handler
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectList
from app.services.ai_planner import AIPlannerService
from app.dependencies import get_current_user, get_db

router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await ProjectService(db).create(user_id=user.id, data=data)
    return project
```
```python
# CORRECT: Pydantic v2 schema
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    template_id: UUID | None = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime
```
```python
# CORRECT: SQLAlchemy 2.0 async model
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
import uuid

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))

    owner: Mapped["User"] = relationship(back_populates="projects")
    specs: Mapped[list["Spec"]] = relationship(back_populates="project", cascade="all, delete-orphan")
```

#### Python Style
- Use `|` union syntax, not `Union[]` or `Optional[]`: `str | None` not `Optional[str]`.
- Use `from __future__ import annotations` is NOT needed in Python 3.13.
- Type hints on EVERY function signature. No untyped functions.
- Use `pathlib.Path` not `os.path`.
- Use `httpx` for external HTTP calls (async), not `requests`.
- Use `structlog` for logging, not `print()` or `logging`.
- Naming: `snake_case` for everything except classes (`PascalCase`).

---

## DATABASE SCHEMA (Core Tables)
```sql
-- All tables use UUID primary keys, created_at, updated_at

users (id, email, name, password_hash, avatar_url, plan, org_id)
organizations (id, name, slug, plan, stripe_customer_id)
org_members (id, org_id, user_id, role)  -- roles: owner, admin, member

projects (id, org_id, owner_id, name, description, status, github_repo_url, tech_stack_json, created_at)

specs (id, project_id, title, content_json, status, version, parent_spec_id)
spec_versions (id, spec_id, version_number, content_json, diff_json, created_by, created_at)

features (id, project_id, spec_id, title, description, priority_score, effort_estimate, status, parent_feature_id, sort_order, mvp_classification)
feature_dependencies (id, feature_id, depends_on_feature_id)

tasks (id, feature_id, project_id, title, description, prompt_text, acceptance_criteria_json, status, sequence_order, regression_risk, estimated_minutes, agent_type, agent_run_id)

agent_runs (id, task_id, agent_type, status, started_at, completed_at, output_log, validation_result, retry_count)

decision_log (id, project_id, decision, reasoning, alternatives_json, made_by, created_at)

templates (id, name, category, description, spec_template_json, architecture_json, is_public, created_by)

chat_sessions (id, project_id, user_id, messages_json, session_type, created_at)
```

---

## API DESIGN

### URL Structure
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/refresh

GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{id}
PATCH  /api/v1/projects/{id}
DELETE /api/v1/projects/{id}

POST   /api/v1/projects/{id}/chat                    # AI planning chat (SSE streaming)
POST   /api/v1/projects/{id}/generate-spec            # Generate full spec from chat
GET    /api/v1/projects/{id}/specs
GET    /api/v1/projects/{id}/specs/{specId}
GET    /api/v1/projects/{id}/specs/{specId}/versions   # Version history
POST   /api/v1/projects/{id}/specs/{specId}/diff       # Compare versions

GET    /api/v1/projects/{id}/features
POST   /api/v1/projects/{id}/features/decompose        # AI feature breakdown
PATCH  /api/v1/projects/{id}/features/{featureId}
POST   /api/v1/projects/{id}/features/prioritize       # AI prioritization

GET    /api/v1/projects/{id}/tasks
POST   /api/v1/projects/{id}/tasks/generate             # AI task generation from features
PATCH  /api/v1/projects/{id}/tasks/{taskId}
POST   /api/v1/projects/{id}/tasks/{taskId}/dispatch     # Send to coding agent
GET    /api/v1/projects/{id}/tasks/{taskId}/agent-status

POST   /api/v1/projects/{id}/architecture/generate       # AI architecture generation
GET    /api/v1/projects/{id}/architecture
POST   /api/v1/projects/{id}/production-check            # Production readiness audit

POST   /api/v1/projects/{id}/export/{format}             # Export: mcp, cli, markdown, json

GET    /api/v1/templates
GET    /api/v1/templates/{id}

GET    /api/v1/analytics/velocity
GET    /api/v1/analytics/scope-creep

WS     /api/v1/ws/project/{id}                           # Real-time collaboration
```

### Response Format
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Error Format
```json
{
  "detail": "Project not found",
  "error_code": "PROJECT_NOT_FOUND",
  "status_code": 404
}
```

---

## AI INTEGRATION PATTERNS

### Planning Chat Flow
1. User describes what they want to build (natural language)
2. AI asks 3-5 smart clarifying questions (edge cases, constraints, users, scale)
3. User answers → AI generates structured spec
4. Spec includes: goals, user personas, features list, tech recommendations, constraints, acceptance criteria
5. User reviews/edits spec → AI decomposes into features → features into tasks
6. Tasks include agent-ready prompts with full context

### Prompt Engineering Rules
- Store all prompts as Jinja2 templates in `backend/app/ai/prompts/`
- Every prompt includes: system context, project context, current codebase context (if connected), output format instructions
- Use structured output via `instructor` library — AI responses are always Pydantic models
- Temperature: 0.3 for specs/tasks (deterministic), 0.7 for brainstorming/questions
- Always include examples in prompts (few-shot)
- Token tracking per user per request for billing

### AI Model Usage
```python
# Primary: Claude for all generation
SPEC_MODEL = "claude-sonnet-4-20250514"
TASK_MODEL = "claude-sonnet-4-20250514"
ARCHITECTURE_MODEL = "claude-sonnet-4-20250514"
CHAT_MODEL = "claude-sonnet-4-20250514"

# Fallback: OpenAI if Claude is down
FALLBACK_MODEL = "gpt-4o"
```

---

## SECURITY RULES

- NEVER commit `.env` files. Use `.env.example` as template.
- NEVER expose API keys in frontend code. All AI calls go through backend.
- NEVER trust client-side data. Validate EVERYTHING with Pydantic on backend.
- Use parameterized queries ONLY (SQLAlchemy handles this). Never raw SQL string interpolation.
- Rate limit all AI endpoints: 20 requests/minute for free tier, 100 for paid.
- CORS: whitelist specific frontend origins only.
- JWT tokens: 15-minute access tokens, 7-day refresh tokens. Store refresh tokens in httpOnly cookies.
- All user-generated content (spec text, task descriptions) must be sanitized before rendering.
- Row-level security: users can ONLY access their own org's projects. Check `org_id` on EVERY query.

---

## PERFORMANCE RULES

### Frontend
- Use React Server Components for all data-heavy pages. Minimize client JS.
- Use `"use cache"` directive on components that fetch slow data.
- Lazy load heavy components: `dynamic(() => import(...), { ssr: false })` for editors, diagrams.
- Images: use `next/image` with proper `width`/`height`. Never unoptimized.
- Bundle size: keep page JS under 200KB. Check with `next build` output.

### Backend
- Use async everywhere. Never block the event loop.
- Database: use connection pooling (SQLAlchemy async pool). Max 20 connections.
- Redis: cache frequently accessed data (project metadata, user preferences). TTL 5 minutes.
- AI responses: stream via SSE. Never make user wait for full generation.
- Pagination: cursor-based for large datasets, offset for simple lists.
- Background tasks: use Celery for anything taking > 3 seconds (full spec generation, architecture diagrams, agent orchestration).

---

## TESTING REQUIREMENTS

### Frontend
- Unit tests: Vitest + React Testing Library for components
- E2E: Playwright for critical flows (create project → generate spec → create tasks → export)
- Test files: co-located as `component-name.test.tsx`

### Backend
- Unit tests: pytest + pytest-asyncio
- API tests: httpx AsyncClient with TestClient
- Test database: use PostgreSQL test container (testcontainers-python)
- Minimum coverage: 80% on services/, 60% on api/
- Test files: in `backend/tests/` mirroring source structure

---

## GIT CONVENTIONS

### Branch Naming
```
feature/project-creation-flow
fix/spec-version-diff-bug
refactor/task-generation-service
chore/upgrade-nextjs-16.2
```

### Commit Messages
```
feat(specs): add version diffing with side-by-side view
fix(tasks): prevent duplicate task generation on retry
refactor(ai): extract prompt templates to Jinja2 files
docs: update API documentation for agent endpoints
chore: upgrade FastAPI to 0.135.2
```

---

## ENVIRONMENT VARIABLES
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-chars>
NEXTAUTH_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=postgresql+asyncpg://planforge:password@localhost:5432/planforge
REDIS_URL=redis://localhost:6379/0
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
JWT_SECRET=<random-64-chars>
CORS_ORIGINS=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...
CELERY_BROKER_URL=redis://localhost:6379/1
S3_BUCKET=planforge-uploads
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## BUILD & RUN COMMANDS

### Local Development
```bash
# Start all services
docker-compose up -d  # PostgreSQL, Redis

# Backend
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
pnpm install
pnpm dev    # Starts on :3000, Turbopack is default in Next.js 16

# Celery worker
cd backend
uv run celery -A app.workers.celery_app worker --loglevel=info
```

### Production Build
```bash
# Frontend
cd frontend
pnpm build   # Turbopack is default, no --turbopack flag needed
pnpm start

# Backend
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## IMPORTANT REMINDERS FOR CLAUDE CODE

1. **Next.js 16 uses `proxy.ts` NOT `middleware.ts`**. The export is `proxy()` not `middleware()`.
2. **Tailwind v4 has NO config JS file**. Use `@import "tailwindcss"` and `@theme {}` in CSS.
3. **Tailwind v4 class renames**: `bg-linear-to-r` not `bg-gradient-to-r`, `shrink-0` not `flex-shrink-0`, `shadow-xs` not `shadow-sm`.
4. **FastAPI uses Pydantic v2 syntax**: `model_config = ConfigDict(...)` not `class Config:`.
5. **SQLAlchemy 2.0 style**: `Mapped[]` annotations, not `Column()` legacy style.
6. **Python 3.13**: `str | None` not `Optional[str]`. No `from __future__ import annotations` needed.
7. **Use `uv`** for Python packages, NOT pip or poetry.
8. **All AI calls through backend**. Frontend NEVER calls Anthropic/OpenAI directly.
9. **SSE streaming** for all AI generation endpoints. Never synchronous.
10. **UUID primary keys** on all tables. Never auto-increment integers.
