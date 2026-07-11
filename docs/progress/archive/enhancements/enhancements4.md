# Enhancements 4 — Boilerplate production readiness & feature completeness

> Planning tracker, written 2026-07-06. Scope: everything this stack needs to be a
> genuinely useful NestJS + Next.js **production boilerplate** that someone can fork and
> build a real business on — not just a docs-coverage showcase.
>
> Previous rounds fixed critical bugs (enhancements1), built Settings pages (enhancements2),
> and extracted auth from demos with live middleware (enhancements3). The `docs/todo/`
> roadmap covers stack integration, backend/frontend polish, devops, and docs maintenance.
> This round goes deeper: filling the feature gaps that distinguish a demo from a starter
> kit, improving developer experience, and hardening the patterns a boilerplate consumer
> will inherit.

## At a glance

| # | Area | Effort | Priority | What |
|---|------|--------|----------|------|
| A | **Monorepo tooling** | M | P1 | Turborepo, shared configs, root workspace, unified scripts |
| B | **Email production system** | M | P1 | Rich templates, preview UI, email preferences, welcome email, HTML design |
| C | **Admin dashboard** | L | P1 | Full user CRUD, content moderation, stats dashboard, activity feed |
| D | **Team/Organization UI** | M | P1 | Org creation flow, member management, team management frontend |
| E | **Audit log viewer** | S | P2 | Query resolver + frontend viewer for the existing outbox pipeline |
| F | **API key system** | M | P1 | ApiKey model, auth guard, management UI for programmatic access |
| G | **Notification hub** | M | P2 | Unified in-app notification center + push + email preference matrix |
| H | **File manager UI** | S | P2 | Grid/list browser for uploaded files, delete, search |
| I | **Testing templates** | M | P2 | Factories, seed scripts, component integration tests with MSW |
| J | **Mobile & PWA polish** | S | P2 | Offline fallback, splash screens, mobile nav review, iOS meta |
| K | **Onboarding & documentation** | M | **P0** | Quickstart script, architecture docs, deployment guides, ADRs |

## Survey — what the todo roadmap already covers (don't duplicate)

The `docs/todo/` roadmap and enhancements 1-3 already cover these — enhancement4 won't
re-plan them:

- **Cross-stack e2e suite** → `01-stack-integration.md` P0
- **Root README + `.env.example`** → `01-stack-integration.md` P0
- **Messaging WS compose service** → `01-stack-integration.md` P0
- **Root CI + compose smoke test** → `01-stack-integration.md` P1
- **Dev-mode compose** → `01-stack-integration.md` P1
- **Shared codegen pipeline** → `01-stack-integration.md` P2
- **Backend OTel + Prometheus** → `02-backend.md` P1
- **Backend secure-by-env cookies** → `02-backend.md` P1
- **Backend load testing** → `02-backend.md` P1
- **Prisma seed script** → `02-backend.md` P2
- **GraphQL persisted queries** → `02-backend.md` P2
- **Web Push end-to-end** → `03-frontend.md` P1 — half-built (infra exists, no preferences UI)
- **Error reporting (Sentry/GlitchTip)** → `03-frontend.md` P1
- **Quality budgets (a11y/perf)** → `03-frontend.md` P1
- **Compose hardening** → `04-devops.md` P1
- **Frontend k8s manifests** → `04-devops.md` P1
- **Image publishing + supply chain** → `04-devops.md` P1
- **Data lifecycle (backups, ILM, MinIO versioning)** → `04-devops.md` P2
- **Secrets & config** → `04-devops.md` P2
- **Docs repair** → `05-docs-maintenance.md`
- **CSP for v1 routes** → enhancements3.md D6 (deferred)

## A — Monorepo tooling (P1, M)

The two packages are independent workspaces with no root-level linking. A boilerplate
consumer inherits no shared tooling, no cached build pipeline, and no convention for
sharing code between frontend and backend.

### A1 — Root pnpm workspace + shared configs (S)

```yaml
# pnpm-workspace.yaml (root)
packages:
  - "nest-js-boilerplate"
  - "next-js-boilerplate"
  - "packages/*"
```

Shift shared dev dependencies (TypeScript, ESLint, Prettier) to the root. Create
`packages/tsconfig/base.json`, `packages/eslint-config/`, `packages/prettier-config/` so
both apps extend the same base — and boilerplate consumers have a clear pattern for
adding their own packages.

### A2 — Turborepo pipeline (M)

A `turbo.json` that caches:
- `build` — depends on `^build` (so backend codegen runs before frontend build)
- `test` — depends on `^build`, cached per-package
- `lint` — cached, runs ESLint + Prettier check
- `typecheck` — cached, runs `tsc --noEmit`

This replaces the current pattern of running per-package commands independently.
The root Makefile stays for docker-compose orchestration but `pnpm dev` / `pnpm build`
go through turbo.

### A3 — Shared contracts package (M, overlaps with 01-stack-integration P2)

A `packages/contracts/` workspace that holds:
- Shared TypeScript types for GraphQL fragments (codegen output consumed by frontend)
- Kafka event type definitions (currently duplicated informally)
- Zod schemas shared between frontend validation and backend DTO validation
- The Prisma client re-exported so the frontend can use `Pick` patterns on generated types

This is the same item as `01-stack-integration.md`'s P2, but elevated to P1 because
without it the two halves of the stack have no formal contract.

### A4 — Unified dev scripts (S)

```jsonc
// Root package.json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "generate": "turbo generate",
    "setup": "node scripts/setup.mjs",  // see K1
    "docker:up": "docker compose --profile all up -d --build",
    "docker:down": "docker compose down",
  }
}
```

## B — Email production system (P1, M)

The email infrastructure is already solid (BullMQ queue, Resend/SMTP transport, outbox
pattern). What's missing is the **template library** and **user-facing controls** a real
app needs.

### B1 — Rebuild email templates with a proper design (M)

Current templates (`mail/templates/render.ts`) are hand-crafted HTML strings. Replace
with a consistent brand system:

| Template | Status | Notes |
|----------|--------|-------|
| Email verification | ✅ Exists | Needs redesign to match app branding |
| Password reset | ✅ Exists | Needs redesign |
| Welcome (social login) | ✅ Exists | Needs redesign |
| Welcome (credential signup) | ❌ Missing | Only social-login welcome exists |
| Tier change confirmation | ❌ Missing | "You've been upgraded to PREMIUM" |
| New device notification | ❌ Missing | "Someone logged in from a new device" |
| Password changed | ❌ Missing | Confirmation email |
| Account deleted | ❌ Missing | Confirmation + data retention notice |

Each template should produce `{ subject, html, text }` matching the existing contract.

### B2 — Email preview in development (S)

Wire a `/mailpit` compose route or document how to use the existing Mailpit (port 8025
with `profile: mail`) for visual template review.

### B3 — Email preferences UI (M)

Backend:
- Prisma `EmailPreference` model: `userId`, `marketing`, `transactional`, `digest`
- `EmailPreferencesResolver` — `myEmailPreferences` query, `updateEmailPreferences` mutation

Frontend:
- New "Notifications" tab under Settings with toggle switches for each category
- Unsubscribe link in email footers

### B4 — Email verification reminder (S)

If a user registers but never verifies, send a second reminder after 24h, a third after
7d. Optionally gate BASIC+ features behind verified email (configurable).

## C — Admin dashboard (P1, L)

The current admin panel (`/v1/[lang]/admin`) is a single page with user search and
tier-setting. A production boilerplate needs a real admin section.

### C1 — Admin layout + sidebar (S)

An `/admin` route group with its own layout, sidebar navigation, and role-gating
(`@Roles(ADMIN, SUPERADMIN)`). Sidebar items:

- **Dashboard** — stats overview, charts
- **Users** — search, filter, ban/activate, role change, delete
- **Content** — posts and comments list, hide/delete
- **Audit Log** — read-only viewer (see E)
- **Settings** — site-wide configuration flags

### C2 — User management (M)

Backend:
- `adminUsers(filter, pagination)` query — search by email/name, filter by tier/role/status
- `adminUpdateUser(userId, input)` mutation — change role, ban/activate, verify email
- `adminDeleteUser(userId)` mutation — soft-delete with content anonymization

Frontend:
- User table with sortable columns
- Inline tier editor + role dropdown + status badge
- User detail panel: sessions, posts, comments, billing, audit events
- Confirm dialogs for destructive actions

### C3 — Content moderation (M)

Backend:
- `adminPosts(filter, pagination)` / `adminComments(filter, pagination)` queries
- `adminHidePost(id)` / `adminHideComment(id)` — soft-hide
- `adminDeletePost(id)` / `adminDeleteComment(id)` — hard delete

Frontend:
- Content tables with preview, single-click hide/show toggles
- Bulk selection + batch operations

### C4 — Dashboard analytics (M)

Backend:
- `adminDashboard()` query: signups today/week/month, active users, revenue summary
- Time-series data for 30-day charts

Frontend:
- Stat cards, line chart component, recent activity feed

## D — Team/Organization UI (P1, M)

The Prisma schema already has `Organization`, `Membership`, `Team`, `TeamMember`,
`Project`, and `Task` models. The backend has a `TeamMembersService` (create member,
rewrite Redis cache). There is **zero frontend UI** and no org creation/membership
management.

### D1 — Organization creation & settings (M)

Backend:
- `OrganizationService` — CRUD + `myOrganizations()` query
- `MembershipService` — invite, accept, reject, role change, remove

Frontend:
- `/settings/organizations` — list, detail page, invite form, pending invitations
- Accept/reject invite page (token from URL)

### D2 — Team management (S)

Backend:
- `TeamService` — CRUD for teams under an organization
- Team mutations: create, rename, delete, set leads

Frontend:
- Teams section in org detail page with tree/list view

### D3 — Org switcher in sidebar (S)

Sidebar `ProfileSection` gains an org switcher dropdown when user belongs to 2+ orgs.
Scope persisted in a cookie.

## E — Audit log viewer (P2, S)

The backend already has a full transactional outbox pipeline writing `AuditLog` rows.
There is **no query endpoint and no frontend viewer**.

### E1 — Audit log query resolver (S) ✅

Backend resolver in `src/authorization/audit-log.resolver.ts`:
- `auditLogs(where, orderBy, take, skip)` — returns paginated logs gated behind `@Roles(ADMIN, SUPERADMIN)`
- `auditLogCount(where)` — total count for pagination
- Uses auto-generated `AuditLogWhereInput`, `AuditLogOrderByWithRelationInput` types
- Default sort: `createdAt DESC`, max 100 per page

### E2 — Audit log viewer UI (S) ✅

Frontend BFF route + page:
- `src/app/api/admin/audit-logs/route.ts` — GET handler with query param filtering (action, level, entityType)
- `src/app/v1/[lang]/admin/audit-logs/page.tsx` — client component with:
  - Filterable table: timestamp, action badge, level badge, actor name, entity type, summary, IP
  - Action dropdown (all audit action types), level dropdown, entity type text filter
  - Pagination (prev/next, 50 per page)
  - Click-to-expand diff row showing JSON `before → after` side by side
  - Total count display
- Added Audit Log nav link to `V1Nav.tsx` (visible only to ADMIN/SUPERADMIN)

## F — API key system (P1, M)

A production API boilerplate needs programmatic access. Currently there is no way to
call the backend without going through the browser auth flow.

### F1 — ApiKey model + service (M)

Prisma model with: key prefix + argon2 hash, user, role, tier, scopes, expiry, enabled.

Service: `generate()`, `validate()`, `listForUser()`, `revoke()`, `update()`.

Guard: `ApiKeyGuard` — reads `Authorization: Bearer bp_...`, validates, attaches user.

### F2 — API key management UI (S)

`/settings/api-keys` tab: list keys, generate dialog (show once, copyable), revoke.

### F3 — Rate limiting for API keys (S)

Distinguish session vs API-key requests with different rate limit tiers in the throttler.

## G — Notification hub (P2, M)

### G1 — In-app notification center (M)

Enhance the existing notifications page with:
- Persisted history (existing `Notification` model)
- Badge count in sidebar/header via SSE or Redis unread counter
- Grouping by type, infinite scroll pagination

### G2 — Channel preference matrix (S)

Settings → Notifications page with per-category toggles (in-app/push/email).

### G3 — Notification history query (S)

Ensure a `myNotifications` GraphQL query exists backed by Postgres (not just realtime).

## H — File manager UI (P2, S)

### H1 — File listing and management (S)

Backend:
- `UploadService.listFiles()` — query MinIO or maintain a Postgres `UploadedFile` model
- `UploadService.deleteFile(key)` — remove from MinIO

Frontend:
- `/v1/[lang]/files` page with grid view, thumbnails, search, delete
- Click-to-copy URL for each image variant

### H2 — Drag-and-drop upload zone (S)

A reusable `<DropZone>` component with visual feedback, file validation, progress, error
display, keyboard accessibility.

## I — Testing templates (P2, M)

### I1 — Test factories for Prisma (S)

```ts
// test/factories/user.factory.ts
export async function createUser(prisma, overrides) { /* ... */ }
```

Same pattern for Post, Comment, Reaction, Friend, Notification, Organization, etc.

### I2 — MSW handlers for frontend tests (M)

Mock Service Worker handlers for all BFF routes so component tests run without backend.

### I3 — Component integration test examples (S)

One test per major route group demonstrating: loading, error, empty, happy, unauthenticated.

## J — Mobile & PWA polish (P2, S)

### J1 — Offline fallback (S)

Add `fetch` handler to service worker with cache-first strategy + `/offline` page.

### J2 — iOS meta tags (S)

`apple-mobile-web-app-capable`, `apple-touch-icon`, status bar style in root layout.

### J3 — Mobile navigation audit (S)

Review all pages at 375px: settings nav, admin table, chat, dialogs.

### J4 — PWA install prompt (S)

`useInstallPrompt()` hook for `beforeinstallprompt` event.

## K — Onboarding & documentation (P0, M)

A boilerplate is only as useful as its documentation. This is the highest-ROI item.

### K1 — Quickstart script (S)

```bash
node scripts/setup.mjs
```

A single script that:
1. Checks Node >= 20, pnpm >= 9, Docker
2. Runs `pnpm install`
3. Copies `.env.example` files if missing
4. Generates VAPID keys, JWT_SECRET, ENCRYPTION_KEY if missing
5. Runs `docker compose up -d` (core profile)
6. Runs Prisma migrations
7. Runs seed if available
8. Prints summary of running services + URLs

If Docker unavailable, falls back to documented manual steps.

### K2 — Architecture decision records (M)

Create `docs/adr/` with concise ADRs for key architectural choices:

| ADR | Title | Why |
|-----|-------|-----|
| 001 | Redis-backed session auth with compound key | Unusual auth model — document why and when to deviate |
| 002 | BFF proxy pattern (Next.js → NestJS) | Core architecture choice |
| 003 | Transactional outbox for audit/events | Pattern consumers inherit |
| 004 | Tier-based RBAC with Redis cache | Authorization model |
| 005 | Monorepo structure and workspace layout | How to add packages |

### K3 — Deployment guides (M)

Per-platform docs for: Docker compose (dev), Docker compose (prod), Kubernetes, Vercel +
Render/Fly, VPS single-node.

### K4 — Component API documentation (S)

Enhance `components.md` with props, variants, accessibility, and usage examples for each
UI component.

### K5 — Architecture overview diagram (S)

A Mermaid diagram in `docs/architecture.md` showing the full stack:
Browser → Next.js (RSC + CSR + SW) → BFF proxy → NestJS (GraphQL + REST + gRPC + WS)
→ Infrastructure (Postgres, Redis, MinIO, Kafka, ES).

## Decisions

- **D1 — Turborepo over Nx.** Simpler, no plugin API footguns, aligned with Vercel ecosystem.
- **D2 — MJML for email templates over hand-crafted HTML.** Compile at build time, cache in
  memory. If too heavy, split into one file per template with shared layout helpers.
- **D3 — ApiKey with argon2 hashing, same as passwords.** Full key shown once on creation.
  `keyPrefix` enables identification without exposing the hash. No lookup table needed at
  boilerplate scale.
- **D4 — Audit log viewer gated to ADMIN/SUPERADMIN.** Audit logs contain PII. The `level`
  field gates sensitive events from lower-role admins.
- **D5 — Org/team features are opt-in.** Org switcher only appears when user has 2+ orgs.
  Settings tab only visible if backend returns org queries.
- **D6 — Quickstart script catches common footguns.** Tests for: `logs/` permissions,
  `JWT_SECRET` missing, Kafka port mismatch, MinIO `mc` alias format.
- **D7 — File manager is a simple grid, not Google Drive.** No folders, sharing, or
  versioning. A single table with search + delete is enough. Keep P2 and minimal.
- **D8 — Audit log viewer uses auto-generated Prisma types directly** rather than custom
  DTOs. `AuditLogWhereInput`, `AuditLogOrderByWithRelationInput` are already generated —
  wire them straight into the resolver args for zero boilerplate.

## Prioritization guide

| Do first (P0) | Do next (P1) | Polish (P2) |
|---|---|---|
| K — Onboarding & documentation | A — Monorepo tooling | G — Notification hub |
| K1 — Quickstart script | B — Email production system | H — File manager UI |
| K5 — Architecture diagram | C — Admin dashboard | I — Testing templates |
| E — Audit log viewer ✅ | D — Team/Organization UI | J — Mobile & PWA polish |
| | F — API key system ✅ | |

## Verify loop (phase gate)

- [ ] `node scripts/setup.mjs` boots a working stack from a fresh clone on a clean machine
- [ ] `pnpm dev` → `turbo dev` starts both apps with hot reload
- [ ] `pnpm test` runs all backend + frontend tests via turbo cache
- [ ] New user receives a styled HTML welcome email (visible in Mailpit)
- [ ] Admin can search users, change roles, and hide a post from admin dashboard
- [ ] User can create an org, invite a member, and the member can accept
- [ ] User can generate an API key and use it to call a guarded mutation via `curl`
- [ ] User can browse uploaded files and delete one
- [ ] Audit log viewer shows login/signup/tier-change events with expandable diffs
- [ ] `pnpm lint` / `tsc --noEmit` green in both packages
- [ ] Mobile 375px viewport: Settings nav is usable, admin table scrolls, chat collapses
