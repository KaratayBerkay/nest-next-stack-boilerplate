# Project Enhance 3 — Bug Audit & Refactoring Targets

> **Rev 2 — 2026-07-19.** Static analysis audit of both stacks using fallow (dead-code,
> health/complexity, security candidates) plus manual review of lint, typecheck,
> and test results. Supersedes the now-closed [project-enhance-2.md](project-enhance-2.md).
>
> **Rev 3 — 2026-07-20.** Added §14: CI/CD, repo tooling, frontend & GraphQL
> audit — 23 findings, roadmap rows 57–79. Headline: **main is red on both
> workflows at HEAD.** Frontend CI dies at the prettier check — 387 drifted
> files, red since 2026-07-13, so no later gate has run on main (CI-0) — and
> two more failures are latent behind it: the Lighthouse binary is not a
> dependency of any package (CI-1) and e2e runs browser projects CI never
> installs (CI-2). Backend CI fails at `pnpm test`: 4 spec suites with drifted
> mocks (TE-3). Git hooks are dead at the monorepo root (GH-1), which is how
> the drift accumulated. GraphQL: verified no mock queries — every frontend
> operation is a live backend query (GQ-1) — but ~28 route handlers keep
> inline documents outside the central catalog (GQ-3).
>
> **Baseline:** `tsc` clean · `lint` clean (0 errors both stacks) · 40/40 test files
> passing (268/268 tests after ResizeObserver fix) · 10 fallow security candidates
> (3 actionable, 7 false positives after review + fixes) · 3+ high-complexity functions ·
> 7 circular-dependency groups.

---

## Table of Contents

1. [How to use this doc](#1-how-to-use-this-doc)
2. [Critical: fixed this session](#2-critical-fixed-this-session)
3. [Security candidates (P1, needs verification)](#3-security-candidates-p1-needs-verification)
4. [Dead-code cleanup (P2, manual)](#4-dead-code-cleanup-p2-manual)
5. [Complexity hotspots (P2)](#5-complexity-hotspots-p2)
6. [Circular dependencies (P2)](#6-circular-dependencies-p2)
7. [Test gaps (P2)](#7-test-gaps-p2)
8. [Backend lint warnings (P3)](#8-backend-lint-warnings-p3)
9. [Documentation drift (P3)](#9-documentation-drift-p3)
10. [Compose hardening (P3)](#10-compose-hardening-p3)
11. [Roadmap](#11-roadmap)
12. [Backend code audit — deep-dive findings](#12-backend-code-audit--deep-dive-findings)
13. [Roadmap (updated)](#13-roadmap-updated)
14. [Rev 3 — CI/CD, tooling, frontend & GraphQL audit](#14-rev-3--cicd-tooling-frontend--graphql-audit)

- [Appendix: Fallow auto-fix lessons](#appendix-fallow-auto-fix-lessons)

---

## 1. How to use this doc

Each finding lists **file:line**, **what** the issue is, **why** it matters, and
**how** to fix it. Items marked ✅ were fixed in Rev 2. Remaining items are
ordered by priority within each section.

---

## 2. Critical: fixed this session

### ✅ CR-1 — Open redirect in OAuth callback

**File:** `nest-js-boilerplate/src/auth/oauth/oauth.controller.ts`

**Fix applied:** Added `isSafeRedirect()` guard that validates all redirect
targets against `FRONTEND_URL` origin. Applied to both the `initiate` endpoint
(validates `redirect_uri` before storing in Redis) and the `callback` endpoint
(validates before every `res.redirect()` call). Fallow still flags this as a
candidate (static analysis can't see runtime guards), but the vulnerability is
closed.

**Verification:** `isSafeRedirect("http://evil.com", "http://localhost:3000")`
returns `false`; `isSafeRedirect("/auth/callback", "http://localhost:3000")`
returns `true`; `isSafeRedirect("http://localhost:3000/auth/callback", ...)`
returns `true`.

### ✅ CR-2 — Header injection in request-context

**File:** `nest-js-boilerplate/src/logging/request-context.ts`

**Fix applied:** Added `sanitizeHeaderValue()` that strips `\r` and `\n`
characters before using any user-supplied header value (`x-request-id`,
`x-correlation-id`) in `res.setHeader()`.

### ✅ CR-3 — ResizeObserver polyfill for jsdom tests

**File:** `next-js-boilerplate/vitest.setup.ts`

**Fix applied:** Added a no-op `ResizeObserver` mock class so that
combobox, select, and other components that create resize observers don't
throw `ResizeObserver is not defined` in jsdom. This resolved 9 previously
failing tests across `combobox.test.tsx` and `select.test.tsx`, bringing both
test files from ❌ to ✅.

**Result:** 40/40 test files passing, 268/268 tests passing.

---

## 3. Security candidates (P1, needs verification)

### S-1 — SSRF in OAuth token exchange

**Files:**
- `nest-js-boilerplate/src/auth/oauth/oauth.service.ts:146`
- `nest-js-boilerplate/src/auth/oauth/oauth.service.ts:216`

**What:** Two `fetch()` calls with non-literal URLs built from OAuth provider
configuration. Fallow flags these as SSRF candidates.

**Assessment:** False positive. The URLs (`provider.tokenUrl`,
`provider.userinfoUrl`) come from the hardcoded `oauthProviders` config object,
not from user input. The only user input is `code` and `state`, which do not
affect the URL. Neither URL is attacker-controlled.

**Next:** Suppress with `// fallow-ignore-next-line security-sink` on each call.

### S-2 — SSRF in vault services

**Files:**
- `nest-js-boilerplate/src/vault/vault.service.ts:25`
- `nest-js-boilerplate/src/vault/vault-loader.ts:17`

**What:** `fetch()` calls where the URL is built from `VAULT_ADDR` env var.

**Assessment:** Low risk / false positive. `VAULT_ADDR` is infrastructure config,
not user input. If an attacker controls `VAULT_ADDR`, they already have arbitrary
code execution.

**Next:** Suppress with `// fallow-ignore-next-line security-sink`. No code change.

### S-3 — Prototype pollution via RxJS merge

**File:** `nest-js-boilerplate/src/sse/sse.controller.ts:23`

**What:** Fallow flags a non-literal source passed to `merge()` — but this is
RxJS `merge()`, a utility that combines observables, not an object merge.
This is a false positive.

**Next:** Suppress with `// fallow-ignore-next-line security-sink`. No code change.

### S-4 — Header injection (now suppressed by runtime guard)

**File:** `nest-js-boilerplate/src/logging/request-context.ts:47`

**Fix applied:** `sanitizeHeaderValue()` strips CR/LF before `res.setHeader()`.
See CR-2 above. Fallow still flags because it can't trace the sanitization.

---

## 4. Dead-code cleanup (P2, manual)

### DC-1 — Frontend unused exports

**Estimated 28 dead-export items.** Fallow auto-fix (`fallow fix --yes`) ran but
was **too aggressive** — it removed exports still consumed through barrel files
(`index.ts`). All auto-fix changes were reverted.

**Lesson:** `fallow fix` cannot correctly handle barrel re-export patterns.
Dead-code cleanup must be done manually.

**How to fix:**
1. Run `npx fallow dead-code --unused-exports --format json --quiet`
2. Review each item manually
3. Delete exports only after confirming no barrel file or re-export references them

### DC-2 — Backend unused exports

**Estimated 33 dead-export items.** Fallow auto-fix ran but the `package.json`
changes were destructive (removed/reordered legitimate dependencies). All
changes reverted.

**How to fix:** Same manual approach as DC-1. Do not use `fallow fix` on
the backend.

### DC-3 — Dead test plugin transformers

**Files:**
- `nest-js-boilerplate/test/openapi-plugin.transformer.js`
- `nest-js-boilerplate/test/graphql-plugin.transformer.js`

**What:** All exports (`name`, `version`, `factory`) are 100% dead. These were
part of the NestJS CLI plugin system.

**How to fix:** Verify no tsconfig or Jest config references them, then delete:
```bash
grep -rl "openapi-plugin\|graphql-plugin" nest-js-boilerplate/ --include='*.json' --include='*.ts'
rm nest-js-boilerplate/test/openapi-plugin.transformer.js nest-js-boilerplate/test/graphql-plugin.transformer.js
```

---

## 5. Complexity hotspots (P2)

### CX-1 — `realtime.gateway.ts` — massive file, complex handler

**File:** `nest-js-boilerplate/src/realtime/realtime.gateway.ts` (1019 LOC)

**Hot functions:**
- `handlePage` (line 603) — cognitive complexity **39** (threshold: 30)
- Anonymous arrow (line 116) — line count **85**

**Impact:** 16 files depend on this gateway. High complexity makes it hard to
reason about event flows and increases risk of WS-specific bugs.

**How to fix:**
1. Extract room-join/leave logic into a `RoomManager` class
2. Extract `handlePage` event routing into per-event handler files
3. Target: reduce cognitive complexity of each function to ≤ 20

### CX-2 — `toExceptionResponse` — complex error mapping

**File:** `nest-js-boilerplate/src/common/exceptions/to-exception-response.ts:46`

**Hot function:** cognitive complexity **33**

**How to fix:** Replace if-else chain with `Map<Predicate, Handler>` strategy
pattern.

### CX-3 — `auth.service.ts` — multiple complex auth flows

**File:** `nest-js-boilerplate/src/auth/auth.service.ts` (700+ LOC)

**Hot functions:**
- `loginWithOAuth` — 109 lines
- `login` — 92 lines
- `issueTokens` — 64 lines

**How to fix:** Split into `AuthRegistrationService`, `AuthLoginService`,
`AuthTokenService`, `AuthSessionService`.

### CX-4 — `messaging.service.ts` — large service

**File:** `nest-js-boilerplate/src/messaging/messaging.service.ts` (722 LOC)

**Hot functions:**
- `getConversations` — 109 lines
- `sendFriendRequest` — 82 lines

**How to fix:** Split into `MessagingRoomService`, `MessagingDmService`,
`MessagingFriendService`.

---

## 6. Circular dependencies (P2)

Fallow detected **7 circular-dependency groups** in the backend. None are
runtime-breaking (NestJS handles DI cycles), but they hinder refactoring.

### CD-1 — Auth ↔ Friends module cycle

**Cycle:** `auth.module.ts` ↔ `friends.module.ts`

**Impact:** 19 files depend on `auth.module.ts`. Highest-impact cycle.

**How to fix:** Extract an `AuthContractsModule` (interfaces/types only) that
both modules can import.

### CD-2/3/4 — Entity cycles (expected)

- Federation: `post.entity.ts` ↔ `user.entity.ts`
- TypeORM: `user.entity.ts` ↔ `photo.entity.ts`
- Media: `media.model.ts` ↔ `movie.model.ts` / `podcast.model.ts`

**Assessment:** These are ORM bidirectional relations and GraphQL
interface/implementation cycles — expected patterns. Suppress with annotations.

### CD-5 — Circular-dependency demo module

**Cycle:** `common.service.ts` ↔ `cats.service.ts`

**Assessment:** Intentional demo code. No action needed.

---

## 7. Test gaps (P2)

### TG-1 — ✅ ResizeObserver polyfill (fixed)

See ✅ CR-3 above.

### TG-2 — Backend spec-type warnings

**Files:** Multiple `.spec.ts` files in `nest-js-boilerplate/src/` and `test/`

**Count:** 187 warnings — all `@typescript-eslint/no-unsafe-argument` in test
code using `as any` mocks and `@typescript-eslint/no-floating-promises` for
fire-and-forget promises.

**How to fix:** Add inline eslint suppressions or type the mocks. Low priority.

### TG-3 — No unit tests for complex functions

**Files:** `realtime.gateway.ts`, `auth.service.ts`, `to-exception-response.ts`

**How to fix:** After extracting functions (see §5), add unit tests. Priority
ties to the extract-refactor work.

---

## 8. Backend lint warnings (P3)

### LW-1 — `no-unsafe-argument` in spec files

**Count:** ~170 warnings across 30+ spec files — all from `as any` mocks passed
to NestJS/Prisma typed parameters.

### LW-2 — `no-floating-promises` in runtime files

**Files:** `messaging.service.ts`, `realtime.gateway.ts`, `minio.service.ts`,
`mock-payment.provider.spec.ts`

**Count:** ~10 warnings — all from fire-and-forget notifications or log calls.

**How to fix:** Add `void` prefix for intentionally fire-and-forget promises.

---

## 9. Documentation drift (P3)

### DM-1 — Backend README references missing files

**File:** `docs/backend/README.md`

**What:** Lists `STATUS.md`, `TODO.md`, `progress/README.md`,
`research/claude-code-ecosystem-2026.md`, `research/nestjs-stack-2026-gotchas.md`,
`../.claude/`, `../CLAUDE.md` — none exist in the monorepo.

**How to fix:** Trim to existing files only.

### DM-2 — Gitignore note in frontend README

**File:** `docs/frontend/README.md`

**What:** Says "the whole `docs/` folder is gitignored" — no longer true.

**How to fix:** Delete the sentence.

### DM-3 — No `docs/README.md` index

**What:** No top-level docs index. Users must guess the tree structure.

**How to fix:** Create `docs/README.md` with links to backend, frontend, skills,
ADR, and progress docs.

---

## 10. Compose hardening (P3)

### CP-1 — Kafka healthcheck

**File:** `docker-compose.yml`

**How to fix:**
```yaml
kafka:
  healthcheck:
    test: ["CMD-SHELL", "kafka-broker-api-versions.sh --bootstrap-server localhost:9092 || exit 1"]
    interval: 15s
    timeout: 10s
    retries: 15
    start_period: 30s
```

### CP-2 — Pin minio images

**File:** `docker-compose.yml`

**What:** `minio/minio` and `minio/mc` use `latest` — the only unpinned images.

**How to fix:**
```yaml
image: minio/minio:RELEASE.2025-02-07T23-21-09Z
image: minio/mc:RELEASE.2025-01-18T00-21-00Z
```

---

## 11. Roadmap

| Seq | Item | Section | Prio | Effort | Status |
|---|---|---|---|---|---|
| 1 | Open redirect fix | CR-1 | P0 | S | ✅ Done |
| 2 | Header injection fix | CR-2 | P0 | S | ✅ Done |
| 3 | ResizeObserver polyfill | TG-1 | P0 | S | ✅ Done |
| 4 | Suppress false-positive fallow security findings | S-1/2/3/4 | P1 | S | Pending |
| 5 | Manual dead-code cleanup (frontend) | DC-1 | P2 | M | Pending |
| 6 | Manual dead-code cleanup (backend) | DC-2 | P2 | M | Pending |
| 7 | Remove dead test plugin transformers | DC-3 | P2 | S | Pending |
| 8 | Refactor realtime.gateway.ts | CX-1 | P2 | L | Pending |
| 9 | Refactor to-exception-response.ts | CX-2 | P2 | M | Pending |
| 10 | Split auth.service.ts | CX-3 | P2 | L | Pending |
| 11 | Split messaging.service.ts | CX-4 | P2 | M | Pending |
| 12 | Break auth↔friends module cycle | CD-1 | P2 | M | Pending |
| 13 | Suppress intentional ORM cycles | CD-2/3/4 | P2 | S | Pending |
| 14 | Suppress backend spec lint warnings | LW-1/2 | P3 | S | Pending |
| 15 | Fix backend README references | DM-1 | P3 | S | Pending |
| 16 | Fix gitignore note in frontend README | DM-2 | P3 | S | Pending |
| 17 | Create docs/README.md index | DM-3 | P3 | S | Pending |
| 18 | Kafka healthcheck in compose | CP-1 | P3 | S | Pending |
| 19 | Pin minio images | CP-2 | P3 | S | Pending |

---

## 12. Backend code audit — deep-dive findings

> This section captures items surfaced by manual code review — not from static
> analysis — organized by priority.

### 12.1 Critical: live secrets on filesystem

#### 🔴 LS-1 — Live Vault token in `.env`

**File:** `nest-js-boilerplate/.env`

**What:** Contains a live `VAULT_TOKEN` for `vault.eys.gen.tr`. Despite `.gitignore`
coverage, the file exists on disk and could leak through Docker build context,
CI artifacts, or `rsync`/`tar` operations during deployment.

**Next:** Rotate the token immediately. Remove it from the `.env` file and
retrieve at runtime only from the secrets manager.

#### 🔴 LS-2 — Hardcoded Stripe/VAPID keys in docker-compose

**File:** `docker-compose.yml`

**What:** Live-looking Stripe publishable key (`pk_test_...`), VAPID keys, and
`app.eys.gen.tr` URLs are hardcoded in the compose file. These should reference
environment variables.

**How to fix:** Replace with `${STRIPE_PUBLISHABLE_KEY}` style variables and
document which env vars are required.

---

### 12.2 Architecture & DRY violations (P1)

#### AR-1 — Duplicate `ensureWallet()` implementation

**Files:**
- `src/billing/billing.service.ts:293-301`
- `src/billing/stripe-webhook.controller.ts:237-245`

**What:** Identical `ensureWallet()` private method appears in two places.
Extract to a `WalletService`.

#### AR-2 — Duplicate DM delivery logic

**Files:**
- `src/messaging/messaging.controller.ts:180-256`
- `src/messaging/messaging-ws.gateway.ts:78-148`

**What:** The REST POST and WebSocket handler both send DMs with nearly
identical post-send logic (emitToPage, emitToService, push fallback).
Extract to `MessagingService.deliverDirectMessage()`.

#### AR-3 — Two caching abstractions

**Files:**
- `src/caching/cache-aside.service.ts` — custom Redis-based
- `src/messaging/messaging.service.ts:51` — `@nestjs/cache-manager`

**What:** Two different caching strategies with different APIs and error
behavior. The cache-manager wrapper may throw; `CacheAsideService` silently
swallows errors.

**How to fix:** Pick one. `CacheAsideService` is more full-featured
(getOrFetch, invalidation) — deprecate `@nestjs/cache-manager`.

#### AR-4 — In-memory room state lost on restart

**File:** `src/messaging/messaging.service.ts:47`

**What:** `private rooms = new Map<string, Map<string, RoomMember>>()` — a
plain JS Map. On process restart, all chat room memberships reset to empty.
The `RealtimeGateway` has Redis presence mirroring, but `MessagingService`
rooms have no such backup.

**How to fix:** Back room state in Redis with `SADD room:{room}:members`.
At minimum, store member counts for survivability.

#### AR-5 — `MessagingService` violates SRP

**File:** `src/messaging/messaging.service.ts` (722 LOC)

**What:** Mixes chat rooms, friendships, DMs, and user search in one class.
The in-memory `rooms` Map (line 47) is mutable global state.

**How to fix:** Split into `MessagingDmService`, `MessagingRoomService`
(Redis-backed), `MessagingFriendService`. Already noted in CX-4 but the scope
is larger than captured there.

#### AR-6 — `EncryptionKey` validation mismatch

**Files:**
- `src/config/env.validation.ts:30` — marks `ENCRYPTION_KEY` as optional
- `src/common/crypto/crypto.service.ts:23` — calls `getOrThrow` at init

**What:** App starts successfully, then crashes at `CryptoService` init time —
confusing 500 on the first encrypted request rather than a clear boot failure.

**How to fix:** Make `ENCRYPTION_KEY` required in the Joi schema.

#### AR-7 — `VAPID_EMAIL` vs `VAPID_SUBJECT` mismatch

**Files:**
- `src/config/env.validation.ts:39` — validates `VAPID_EMAIL`
- `src/push-notification/push-notification.service.ts:19` — reads `VAPID_SUBJECT`

**What:** Two different env var names for the same configuration. Setting
`VAPID_EMAIL` does nothing.

**How to fix:** Align the names in validation and service.

---

### 12.3 Security hardening (P1)

#### SE-1 — No password strength validation

**File:** `src/auth/auth.service.ts:74`

**What:** `register()` calls `hash(input.password)` with zero validation.
No minimum length, no complexity check.

**How to fix:** Add validation (min 8 chars, reject common passwords) in both
`register()` and `resetPassword()`.

#### SE-2 — Unbounded pagination

**File:** `src/messaging/messaging.controller.ts:169-177`

**What:** `take ? parseInt(take, 10) : 30` without upper bound — a client can
request `take=999999`, causing massive DB queries.

**How to fix:** `const parsedTake = take ? Math.min(parseInt(take, 10), 100) : 30`

#### SE-3 — `Math.random()` for socket IDs

**File:** `src/realtime/realtime.gateway.ts:434-438`

**What:** Socket ID uses `Math.random()` instead of a cryptographically secure
source. `CryptoService` already provides `randomToken()`.

**How to fix:** Replace with `this.crypto.randomToken(8)`.

#### SE-4 — `ASYNC_PROVIDER_TOKEN` exposed in barrel

**File:** `src/async-providers/index.ts`

**What:** Exports `ASYNC_PROVIDER_TOKEN = 'ASYNC_PROVIDER'` as a public symbol.
Not security-critical but unnecessary API surface exposure.

---

### 12.4 Observability & reliability (P2)

#### OB-1 — Silent Redis failures in RealtimeGateway

**File:** `src/realtime/realtime.gateway.ts` — multiple locations

**What:** Redis pub/sub/subscribe/expire calls use `.catch(() => {})` in at
least 12 locations. Every Redis failure is silently swallowed.

**How to fix:** Create `safeRedisPublish()` that increments a failure counter
and logs errors. Expose via health check.

#### OB-2 — Silent async failure in friend notifications

**File:** `src/messaging/messaging.service.ts:58-80`

**What:** `notifyFriendEvent()` is a void async IIFE with `logger.warn()`
in its catch block. No monitoring or alerting when notifications fail.

**How to fix:** Replace with BullMQ queue-based delivery. At minimum, log as
`error` level and increment a counter.

#### OB-3 — Un-awaited bucket creation in MinioService

**File:** `src/upload/minio.service.ts:35`

**What:** `this.ensureBucket()` called without `await` in `onModuleInit()`.
If a file upload arrives before the bucket is created, it fails. The method
also silently catches all errors (line 59).

**How to fix:** `await this.ensureBucket()` and remove the bare catch.

#### OB-4 — Only 2/6 Prisma error codes mapped

**File:** `src/common/exceptions/to-exception-response.ts:85-101`

**What:** Only `P2002` (unique) and `P2025` (not found) are handled. `P2003`
(foreign key), `P2014` (relation violation), `P2023` (inconsistent data) fall
to generic 500.

**How to fix:** Add mappings for `P2003`, `P2014`, `P2023`.

#### OB-5 — `KEYS` pattern in cache invalidation

**File:** `src/caching/cache-aside.service.ts:35`

**What:** `this.redis.keys(pattern)` is O(N) and blocks Redis. On production
with many keys, this is a Redis anti-pattern.

**How to fix:** Use `SCAN` or Redis Sets as cache tags.

#### OB-6 — Unvalidated Redis pub/sub frames

**File:** `src/realtime/realtime.gateway.ts:235-251`

**What:** `JSON.parse(raw)` destructures with an inline type but never validates
the shape. Malformed messages silently fail in `catch {}`.

**How to fix:** Add Zod validation for the pub/sub frame schema.

#### OB-7 — 4 DB queries on every login

**File:** `src/auth/session-hydration.service.ts:25-38`

**What:** `hydrate()` runs friends, notifications, memberships, and team
queries sequentially (parallelized with `Promise.all` but still 4 separate
round-trips).

**How to fix:** Use Prisma `include` to fetch related counts in one query,
or lazy-load expensive hydration fields.

---

### 12.5 Testing gaps beyond TG-3 (P2)

#### TE-1 — No tests for 10+ critical services

| Critical untested service | Risk |
|---|---|
| `billing/stripe-webhook.controller.ts` | **HIGH** — payment webhook, revenue-critical |
| `billing/stripe-payment.provider.ts` | **HIGH** — subscription creation |
| `messaging/messaging.controller.ts` | **HIGH** — 50% of messaging surface |
| `messaging/messaging-ws.gateway.ts` | **HIGH** — WebSocket messaging handlers |
| `users/users.service.ts` | **HIGH** — core domain |
| `project-tasks/project-tasks.service.ts` | MEDIUM |
| `team-members/team-members.service.ts` | MEDIUM |
| `upload/minio.service.ts` | MEDIUM |
| `upload/image.service.ts` | MEDIUM |
| `profile/profile.service.ts` | MEDIUM |

#### TE-2 — Missing unit tests for internal modules

| Module | Source files | Risk |
|---|---|---|
| `prisma/` | 2 files | **HIGH** — core data layer |
| `common/exceptions/` | 2+ files | **HIGH** — shared error handling |
| `users/` | 3 files | **HIGH** — core domain |
| `caching/` | 5 files | MEDIUM |
| `broker-transports/` | 6 files | MEDIUM |
| `cqrs/` | 9 files | MEDIUM |
| `vault/` | 3 files | MEDIUM |

---

### 12.6 Type system & config (P2)

#### TS-1 — Missing exception codes in union type

**File:** `src/common/exceptions/exception-code.ts`

**What:** The `ExceptionCode` union defines 11 codes, but 7+ more are used at
runtime (`EX_AUTH_INVALID_TOKEN`, `EX_AUTH_ACCOUNT_INACTIVE`,
`EX_AUTH_MFA_EXPIRED`, `EX_PROFILE_USERNAME_TAKEN`, etc.).

**How to fix:** Audit the codebase for all thrown exception codes and add to
the union.

#### TS-2 — Fragile inline TTL parsing

**File:** `src/auth/token-store.service.ts:33-46`

**What:** TTL parsing regex `^(\d+)([smhd])$` is done inline. No unit test,
no edge-case handling for `0s`, empty string, overflow.

**How to fix:** Extract to `parseDurationToSeconds()` utility with tests.

#### TS-3 — Hardcoded price map

**File:** `src/billing/billing.service.ts:252-257`

**What:** `priceCents` map from tier to cents is hardcoded. Changing prices
requires a code deployment.

**How to fix:** Move to env vars or database: `PRICE_BASIC=999`.

---

### 12.7 ESLint & TypeScript strictness (P2)

#### ES-1 — `no-explicit-any` is completely disabled

**File:** `eslint.config.mjs`

**What:** `'@typescript-eslint/no-explicit-any': 'off'`. Any-typed parameters,
return values, and variables are never flagged.

**How to fix:** Change to `['warn', { ignoreRestArgs: true }]`.

#### ES-2 — `no-floating-promises` is warn, should be error

**File:** `eslint.config.mjs`

**How to fix:** Change to `'error'`.

#### ES-3 — `no-unsafe-argument` is warn, should be error

**File:** `eslint.config.mjs`

**How to fix:** Change to `'error'`.

#### ES-4 — Wrong `sourceType` in eslint config

**File:** `eslint.config.mjs:20`

**What:** `sourceType: 'commonjs'` for a project using ESM `import`/`export`.

**How to fix:** Change to `'module'`.

#### ES-5 — Missing lint rules

**File:** `eslint.config.mjs`

**Missing rules:**
- `@typescript-eslint/no-misused-promises` — catches `if (promise)` bugs
- `@typescript-eslint/no-throw-literal` — catches `throw 'string'`
- `@typescript-eslint/no-unused-expressions` — prevents dead code
- `@typescript-eslint/prefer-nullish-coalescing` — modernizes `||` → `??`
- `@typescript-eslint/prefer-optional-chain` — modernizes `&&` → `?.`

#### ES-6 — `strict: true` not used in tsconfig

**File:** `tsconfig.json`

**What:** Uses individual strict flags (`strictNullChecks: true`) instead of
the `"strict": true` umbrella. Missing: `noUnusedLocals`, `noUnusedParameters`,
`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`.

**How to fix:** Enable `"strict": true` and fix new errors.

---

### 12.8 Docker & deployment (P2)

#### DK-1 — Unnecessary build deps in Dockerfile

**File:** `Dockerfile:12`

**What:** `python3 make g++` installed for native module compilation. No
dependency in `package.json` requires native compilation — Prisma provides
prebuilt binaries, argon2 uses `@node-rs/argon2`.

**How to fix:** Remove the native build dependencies. Saves ~150MB per layer.

#### DK-2 — `prisma generate` before `COPY . .`

**File:** `Dockerfile:17`

**What:** `RUN mkdir -p src` exists as a workaround because `prisma generate`
runs before the source is copied. Move generation after copy.

#### DK-3 — Missing `*.tsbuildinfo` in `.dockerignore`

**File:** `.dockerignore`

**How to fix:** Add `*.tsbuildinfo`.

#### DK-4 — k8s migration job uses `pnpm exec prisma`

**File:** `k8s/migrate-job.yaml`

**What:** The migration image's `CMD` uses `node_modules/.bin/prisma`, but the
Job overrides with `pnpm exec prisma` — `pnpm` may not be available in the
runtime image.

**How to fix:** Align command with Dockerfile's `CMD`.

#### DK-5 — Missing k8s secrets in example

**File:** `k8s/secret.example.yaml`

**Missing entries:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `VAULT_TOKEN`, `VAULT_ADDR`.

**How to fix:** Add placeholder entries for all required runtime secrets.

#### DK-6 — Missing k8s config entries

**File:** `k8s/configmap.yaml`

**Missing:** `CORS_ORIGIN`, `OTEL_ENABLED`.

#### DK-7 — No PodDisruptionBudget in k8s

**File:** `k8s/deployment.yaml`

**What:** With 2 replicas and no PDB, voluntary disruptions (node drains) can
take all pods down simultaneously.

**How to fix:** Add `PodDisruptionBudget` with `minAvailable: 1`.

---

### 12.9 Prisma schema issues (P3)

#### PR-1 — Missing cascading deletes

**File:** `prisma/schema.prisma`

**What:** `Organization.owner`, `Project.createdBy`, `Task.createdBy` have no
`onDelete` — defaults to `NoAction`, which prevents deleting users who own
resources.

**How to fix:** Add `onDelete: SetNull` or `onDelete: Cascade` depending on
business logic.

#### PR-2 — Missing composite indexes

**File:** `prisma/schema.prisma`

**Missing:**
- `@@index([userId, type])` on `Reaction`
- `@@index([followerId, createdAt])` on `Follow`
- `@@index([createdAt])` on `OutboxEvent`

#### PR-3 — No `@@map` / `@map` for snake_case conventions

**File:** `prisma/schema.prisma`

**What:** Defaults to camelCase in Postgres. Raw SQL queries against the DB
require quoting or camelCase column names.

#### PR-4 — `Post.coverImage` stores raw bytes

**File:** `prisma/schema.prisma`

**What:** `coverImage Bytes?` stores image data in the database. S3/MinIO
pattern is preferred — `imageUrl` field already exists.

#### PR-5 — No updatedAt on Device, Notification, Friendship

**File:** `prisma/schema.prisma`

**What:** Inconsistent with the schema convention that most models have
`updatedAt`.

---

### 12.10 Code quality (P3)

#### CQ-1 — Duplicate condition in `RealtimeGateway`

**File:** `src/realtime/realtime.gateway.ts:652-653`

**What:** `if (ws.page && ws.page)` — duplicate check, copy-paste artifact.

#### CQ-2 — Tests access private members via type casts

**File:** `src/realtime/realtime.gateway.spec.ts` and others

**What:** Multiple spec files cast to `unknown as { ... }` to access private
members. These break if the private member is renamed.

**How to fix:** Extract tested logic to public/internal methods or use the
`@suites/unit` library (already in devDeps) for proper dependency mocking.

#### CQ-3 — `@suites/unit` not used despite being installed

**File:** `package.json` devDependencies

**What:** `@suites/unit` is installed but no spec file imports it. The
deprecated `automock/` directory exists as an alternative.

**How to fix:** Either adopt `@suites/unit` across new tests or remove the
unused dependency.

---

## 13. Roadmap (updated)

> Rev 3 appended rows 57–79 — findings in
> [§14](#14-rev-3--cicd-tooling-frontend--graphql-audit), table in
> [§14.6](#146-roadmap-additions-rev-3).

| Seq | Item | Section | Prio | Effort | Status |
|---|---|---|---|---|---|
| 1 | Open redirect fix | CR-1 | P0 | S | ✅ Done |
| 2 | Header injection fix | CR-2 | P0 | S | ✅ Done |
| 3 | ResizeObserver polyfill | TG-1 | P0 | S | ✅ Done |
| 4 | **Remove live Vault token from .env** | LS-1 | 🛑 **CRIT** | S | **Urgent** |
| 5 | **Remove live API keys from docker-compose** | LS-2 | 🛑 **CRIT** | S | **Urgent** |
| 6 | Suppress false-positive fallow security findings | S-1/2/3/4 | P1 | S | Pending |
| 7 | Duplicate `ensureWallet()` extract | AR-1 | P1 | S | Pending |
| 8 | Duplicate DM delivery extract | AR-2 | P1 | S | Pending |
| 9 | Unify caching abstraction | AR-3 | P1 | M | Pending |
| 10 | Password strength validation | SE-1 | P1 | S | Pending |
| 11 | Unbounded pagination fix | SE-2 | P1 | S | Pending |
| 12 | Fix ENCRYPTION_KEY validation mismatch | AR-6 | P1 | S | Pending |
| 13 | Fix VAPID_EMAIL name mismatch | AR-7 | P1 | S | Pending |
| 14 | Silent Redis failure handling | OB-1 | P2 | M | Pending |
| 15 | Silent friend notification failure | OB-2 | P2 | M | Pending |
| 16 | Await MinIO bucket creation | OB-3 | P2 | S | Pending |
| 17 | Map more Prisma error codes | OB-4 | P2 | S | Pending |
| 18 | `KEYS` → `SCAN` in cache invalidation | OB-5 | P2 | S | Pending |
| 19 | Secure socket ID generation | SE-3 | P2 | S | Pending |
| 20 | Refactor realtime.gateway.ts | CX-1 | P2 | L | Pending |
| 21 | Refactor to-exception-response.ts | CX-2 | P2 | M | Pending |
| 22 | Split auth.service.ts | CX-3 | P2 | L | Pending |
| 23 | Split messaging.service.ts / SRP | CX-4 / AR-5 | P2 | L | Pending |
| 24 | Back room state in Redis | AR-4 | P2 | M | Pending |
| 25 | Break auth↔friends module cycle | CD-1 | P2 | M | Pending |
| 26 | 4 DB queries on login optimization | OB-7 | P2 | M | Pending |
| 27 | Add missing exception codes to union | TS-1 | P2 | S | Pending |
| 28 | Extract TTL parsing utility | TS-2 | P2 | S | Pending |
| 29 | Move price map to config | TS-3 | P2 | S | Pending |
| 30 | Tighten ESLint rules (any, promises, unsafe-arg) | ES-1/2/3 | P2 | M | Pending |
| 31 | Fix eslint sourceType | ES-4 | P2 | S | Pending |
| 32 | Add missing ESLint rules | ES-5 | P2 | M | Pending |
| 33 | Enable tsconfig strict | ES-6 | P2 | M | Pending |
| 34 | Dockerfile: remove unnecessary build deps | DK-1 | P2 | S | Pending |
| 35 | Dockerfile: move prisma generate after COPY | DK-2 | P2 | S | Pending |
| 36 | Add tests for stripe-webhook, users, etc. | TE-1 | P2 | L | Pending |
| 37 | Add unit tests for prisma, common modules | TE-2 | P2 | M | Pending |
| 38 | Prisma schema: cascading deletes | PR-1 | P2 | S | Pending |
| 39 | Prisma schema: composite indexes | PR-2 | P3 | S | Pending |
| 40 | Fix k8s migration job command | DK-4 | P3 | S | Pending |
| 41 | Add missing k8s secrets/config | DK-5/6 | P3 | S | Pending |
| 42 | Add PodDisruptionBudget | DK-7 | P3 | S | Pending |
| 43 | Add `*.tsbuildinfo` to .dockerignore | DK-3 | P3 | S | Pending |
| 44 | Fix duplicate condition in RealtimeGateway | CQ-1 | P3 | S | Pending |
| 45 | Fix private member access in tests | CQ-2 | P3 | S | Pending |
| 46 | Adopt or remove @suites/unit | CQ-3 | P3 | S | Pending |
| 47 | Manual dead-code cleanup (frontend) | DC-1 | P2 | M | Pending |
| 48 | Manual dead-code cleanup (backend) | DC-2 | P2 | M | Pending |
| 49 | Remove dead test plugin transformers | DC-3 | P2 | S | Pending |
| 50 | Suppress intentional ORM cycles | CD-2/3/4 | P2 | S | Pending |
| 51 | Suppress backend spec lint warnings | LW-1/2 | P3 | S | Pending |
| 52 | Fix backend README references | DM-1 | P3 | S | Pending |
| 53 | Fix gitignore note in frontend README | DM-2 | P3 | S | Pending |
| 54 | Create docs/README.md index | DM-3 | P3 | S | Pending |
| 55 | Kafka healthcheck in compose | CP-1 | P3 | S | Pending |
| 56 | Pin minio images | CP-2 | P3 | S | Pending |

---

## 14. Rev 3 — CI/CD, tooling, frontend & GraphQL audit

> Manual review of the GitHub workflows, repo tooling (hooks, lockfiles,
> dependabot), e2e infrastructure, the frontend security spine, and the
> frontend↔backend GraphQL wiring — areas §12 did not cover (it was
> backend-only). All findings verified against the working tree and the latest
> main CI runs on 2026-07-20.

### 14.1 CI pipeline (P1 — CI-0 is today's red; CI-1/CI-2 are latent behind it)

#### 🔴 CI-0 — Frontend CI red since 2026-07-13: prettier drift blocks every later gate

**File:** `.github/workflows/frontend-ci.yml` (`pnpm format:check` step)

**What:** Every Frontend CI run on main fails in under 2 minutes at the format
check — **387 files** of prettier drift (verified locally 2026-07-20; largely
tailwind class-sort). Because verify is one serial job, unit tests, contrast,
build, Lighthouse, and e2e have not executed on main since 2026-07-13. CI-1
and CI-2 below are latent failures sitting behind this one.

**How to fix:** One `pnpm format` commit in `next-js-boilerplate/`. Drift this
large means the pre-commit hook never ran — GH-1 is the recurrence guard.

#### 🔴 CI-1 — Lighthouse step can never run: binary is not a dependency

**Files:**

- `.github/workflows/frontend-ci.yml:103` — `run: pnpm lighthouse:ci`
- `next-js-boilerplate/package.json:25-28` — scripts invoke a `lighthouse-ci` binary
- `next-js-boilerplate/lighthouserc.json:5-6`

**What:** No package in the repo provides a `lighthouse-ci` (or `lhci`) binary —
it appears in no `package.json` and no `node_modules/.bin`. The CI step fails
with "command not found" on every run. Separately, `lighthouserc.json` sets
both `staticDistDir` and `startServerCommand`; LHCI does not use both
(`staticDistDir` takes precedence), so even with the binary installed the
intended `pnpm start -p 4000` server would never boot and the four `/v1/en/*`
URLs could not be served.

**How to fix:** Add `@lhci/cli` as a devDependency and change the scripts to
`lhci collect|assert|upload`; delete `staticDistDir` from `lighthouserc.json`
(keep `startServerCommand`). Or drop the step and scripts until perf budgets
are actually wanted.

#### 🔴 CI-2 — e2e runs browser projects CI never installs

**Files:**

- `.github/workflows/frontend-ci.yml:106` — installs chromium only
- `.github/workflows/frontend-ci.yml:154` — `pnpm test:e2e` (unscoped, all projects)
- `next-js-boilerplate/playwright.config.ts` — declares chromium, firefox, webkit, mobile-chrome

**What:** CI installs only Chromium, but the unscoped `pnpm test:e2e` also runs
the firefox and webkit projects — each fails with "Executable doesn't exist".
(mobile-chrome is a Pixel 7 profile on the Chromium binary, so it is fine.)

**How to fix:** Scope the CI run
(`pnpm test:e2e --project=chromium --project=mobile-chrome`) or install all
browsers (`playwright install --with-deps`, ~2–3 min slower). Scoping plus an
optional scheduled full-matrix job is the usual trade.

#### CI-3 — Backend suite runs twice per CI run

**File:** `.github/workflows/backend-ci.yml:77-78`

**What:** `pnpm test` followed by `pnpm test:cov` executes the full Jest suite
twice back-to-back.

**How to fix:** Drop line 77 — `test:cov` runs the same suite with coverage.

#### CI-4 — Node version drift across the toolchain

**What:**

- Backend `engines.node >= 24`; backend CI uses Node 24 ✓
- Frontend CI verify job starts on Node 22 (`frontend-ci.yml:68`), then
  switches to 24 mid-job for the backend steps (`:108-111`)
- Frontend/root `engines.node >= 20`, while the frontend Dockerfile builds on
  `node:24.18.0-alpine`
- Frontend `@types/node` is `^20` (`package.json:78`) while every runtime that
  matters is 22/24

**How to fix:** Run the whole verify job on Node 24 (deleting the mid-job
switch), raise frontend/root engines to `>=24` to match the Dockerfile, bump
`@types/node` to `^24`.

#### CI-5 — Workflow hygiene: no concurrency cancellation; stale comment

**What:** Neither workflow declares a `concurrency` group, so stacked pushes
run every stale build to completion. And the docker-build comment at
`frontend-ci.yml:166` still describes the verify job as "backend-less" — the
job has booted a real backend since the workflow was reworked.

**How to fix:** Add to both workflows:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

and update the comment.

---

### 14.2 Supply chain & repo automation (P1/P2)

#### SC-1 — Dependabot misses root, actions, and docker ecosystems

**File:** `.github/dependabot.yml`

**What:** Covers npm in the two app directories only. Not covered: the root
workspace (`/` — root `package.json` + `packages/*`), `github-actions`
(checkout / setup-node / pnpm action pins), and `docker` (base images in both
Dockerfiles and docker-compose).

**How to fix:** Add the three missing `updates:` entries.

#### SC-2 — No secret scanning or dependency audit in CI

**What:** §12.1 found live secrets on disk (LS-1/LS-2) — but nothing in CI
would catch the next one. There is no gitleaks/trufflehog workflow, no
`pnpm audit` gate, no CodeQL.

**How to fix:** Add a secret-scan job (gitleaks-action) on push/PR — the
mechanized guard for the LS-class findings. Add
`pnpm audit --prod --audit-level high` (or osv-scanner) as a soft gate first.
CodeQL js/ts is optional on top.

#### GH-1 — Git hooks are dead: husky lives below the git root

**Files:**

- `next-js-boilerplate/.husky/` — commit-msg, pre-commit, pre-push
- `next-js-boilerplate/package.json` — `prepare: husky`, lint-staged config

**What:** The git dir is the monorepo root, but husky and its `prepare` script
live only in the frontend package. `git config core.hooksPath` is unset and
`.git/hooks` contains only samples — so commitlint, lint-staged, and the
pre-push hook never fire for anyone. Dead weight that looks like protection.

**How to fix:** Install husky from the repo root (root `prepare` script,
`.husky/` at root) and have each hook delegate into the packages, e.g.
`pnpm --dir next-js-boilerplate exec lint-staged`. Verify
`git config core.hooksPath` is set after `pnpm install`.

#### GH-2 — Three lockfiles, no sync guard

**Files:** `pnpm-lock.yaml` (root), `nest-js-boilerplate/pnpm-lock.yaml`,
`next-js-boilerplate/pnpm-lock.yaml`

**What:** The root workspace declares both apps, yet each app keeps its own
`pnpm-workspace.yaml` + lockfile "for isolated dev" (root
`pnpm-workspace.yaml` comment). Two resolution universes: CI installs from the
per-app lockfiles, local root dev writes the root lockfile. Nothing checks
they resolve the same versions — drift is silent until CI behaves differently
from local.

**How to fix:** Either drop the per-app lockfiles (CI installs from root with
`--filter`), or add a CI step running `pnpm install --frozen-lockfile` in all
three roots so drift fails loudly.

---

### 14.3 Quality gates & e2e infrastructure (P1/P2)

#### QG-1 — Coverage is collected but never enforced

**Files:**

- `next-js-boilerplate/vitest.config.ts:13` — coverage block has no `thresholds`
- `nest-js-boilerplate/package.json` — jest config has no `coverageThreshold`

**What:** Backend CI runs `test:cov`, frontend CI runs plain `test` — and in
both stacks no threshold exists, so coverage can drop to zero without failing
anything. §12.5 documents 10+ untested critical services; without a ratchet
the number only grows.

**How to fix:** Add thresholds pinned at today's actuals (ratchet upward
later), switch frontend CI to `test:coverage`, upload both reports as
artifacts.

#### 🔴 TE-3 — 4 backend spec suites broken at HEAD (16 tests): mock drift

**Files:**

- `nest-js-boilerplate/src/profile/profile.service.spec.ts`
- `nest-js-boilerplate/src/notification/notification.service.spec.ts`
- `nest-js-boilerplate/src/comment/comment.service.spec.ts`
- `nest-js-boilerplate/src/realtime/realtime.gateway.spec.ts`

**What:** This is why Backend CI is red — it fails at `pnpm test`
(CI: 4 suites / 16 tests failed, 317 passed; reproduced locally). Two shapes:
`Cannot read properties of undefined (reading 'invalidate')` — the service
under test gained a cache dependency whose mock the spec never provides — and
`this.redis.publish is not a function` — the gateway spec's redis mock lacks
`publish`. The CQ-2 pattern in action: hand-rolled partial mocks drift
silently when constructor dependencies change. Supersedes the Rev 2 baseline
claim that the suites were green.

**How to fix:** Add the missing members to the mocks (cache `invalidate`,
redis `publish`). Adopting `@suites/unit` (CQ-3), which auto-mocks every
constructor dependency, would eliminate this failure class.

#### 🔴 EE-1 — Stale auth state mass-skips the e2e suite with exit 0

**File:** `next-js-boilerplate/playwright.config.ts:7,19` —
`storageState: "playwright/.auth/user.json"`

**What:** Observed incident (2026-07): an expired `playwright/.auth/user.json`
made authenticated specs skip en masse and the run still exited 0 — a green
signal with almost nothing tested. The setup project writes the state but
nothing validates it before the suite trusts it.

**How to fix:** In the setup project, probe an authenticated endpoint with the
saved state and re-login when it fails. Then add a skip-budget gate: emit the
JSON reporter and fail CI when skipped > N (e.g. `jq` over the report in a
final step).

#### EE-2 — e2e env check verifies a variable, not a backend

**File:** `next-js-boilerplate/scripts/check-e2e-env.mjs:2`

**What:** `REQUIRED` is just `["NEXT_PUBLIC_APP_URL"]`. A booted-but-backendless
environment passes the check and produces the EE-1 signature (mass skips) —
the bare `next dev` webServer has no compose env, so auth can never succeed in
that mode.

**How to fix:** Also probe the backend (`GET {APP_URL}/health`, the same check
frontend-ci uses) and exit with the compose hint when unreachable, unless
`CI_NO_BACKEND=1`.

#### EE-3 — Local e2e runs a dev server; CI runs the prod build

**File:** `next-js-boilerplate/playwright.config.ts:49`

**What:** Locally the webServer is `next dev`; CI runs `next build` +
`next start`. Under `cacheComponents`/PPR the two behave differently — exactly
what the `rendering-*.spec.ts` files assert. A spec can pass locally and fail
in CI, or the reverse.

**How to fix:** Support `E2E_PROD=1` locally (webServer command switches to
`next build && next start`) and document it as the pre-push flow for
rendering-sensitive changes.

---

### 14.4 Frontend hardening (P2/P3)

#### FE-1 — Deployment hostnames hardcoded in source

**Files:**

- `next-js-boilerplate/next.config.ts:42,46` — `app.eys.gen.tr`,
  `minio.eys.gen.tr` in `images.remotePatterns`
- `next-js-boilerplate/src/proxy.ts:31` — `img-src … https://minio.eys.gen.tr`
  in the CSP

**What:** Same class as LS-2: one deployment's hostnames baked into boilerplate
source. Forks ship a CSP and image allowlist pointing at eys.gen.tr.

**How to fix:** Drive both from env (e.g. `NEXT_PUBLIC_ASSET_HOST`) with
localhost defaults; keep picsum for the demo pages.

#### FE-2 — Request-id reflected without validation

**File:** `next-js-boilerplate/src/proxy.ts:58-61`

**What:** Incoming `x-request-id` / `x-correlation-id` values are reflected
into the response header and flow into logs/traces unbounded. Node's header
API rejects CRLF (so no CR-2-style injection), but an attacker-supplied
arbitrary-length string is still accepted as the canonical request id.

**How to fix:** Accept only `^[A-Za-z0-9._-]{1,128}$`; otherwise fall through
to the existing `crypto.randomUUID()` fallback.

#### FE-3 — Missing Cross-Origin-Opener-Policy

**File:** `next-js-boilerplate/next.config.ts:11`

**What:** The global header set (HSTS, nosniff, frame deny, referrer,
permissions) lacks COOP, leaving `window.opener` linkage open.

**How to fix:** Add `Cross-Origin-Opener-Policy: same-origin`. Evaluate
COEP/CORP separately — `require-corp` would break the allowed remote images.

#### FE-4 — `proxy.ts` — 223 security-critical lines, zero unit tests

**File:** `next-js-boilerplate/src/proxy.ts`

**What:** The proxy is the frontend's security spine — auth gating for
`/v1/{lang}` and `/dashboard`, CSP builder, locale negotiation, version
canonicalization, request-id propagation. Only e2e slices cover it
(`routing-proxy.spec.ts`, `security-csp.spec.ts`); no vitest file imports it.
The redirect matrix (version × lang × cookie) is exactly the kind of logic
that regresses silently.

**How to fix:** Extract the pure parts (`buildCsp`, the redirect decision) and
unit-test them; `NextRequest` can be constructed directly in vitest for the
rest. This is the frontend counterpart of §12.5 — worth a fuller frontend
test-gap audit as follow-up.

#### CP-3 — `app` and `nextjs` compose services have no healthcheck

**File:** `docker-compose.yml:162,181`

**What:** Infra services have healthchecks (postgres, redis, rabbitmq,
elasticsearch, fluent-bit, minio — kafka pending as CP-1) but the two
first-party services don't. `depends_on: service_healthy` can't gate on them,
and the external prod proxy can route to a booted-but-unready container.
mongo and nats also lack checks (lower value).

**How to fix:** `app`: curl `http://localhost:3000/health` (endpoint already
exists — frontend-ci probes it). `nextjs`: curl `/`. Wire `depends_on`
conditions accordingly.

---

### 14.5 GraphQL wiring — no mocks found; keep it that way (P2/P3)

#### GQ-1 — Audit result: every frontend GraphQL operation is a live backend query

**Files:** `next-js-boilerplate/src/lib/graphql/queries.ts`,
`next-js-boilerplate/src/lib/backend.ts:247` (`graphqlFetch`)

**Verified 2026-07-20:**

- The central catalog holds 15 documents (ME, POSTS, POST, notifications,
  post/comment/reaction mutations) — every one is imported by a live caller
  and sent via `graphqlFetch` to `backendBaseUrl() + /graphql`. No dead docs.
- 42 files call `graphqlFetch`; none stub, intercept, or fabricate responses.
  There is no MSW layer and no mock resolver in runtime code.
- `src/fallbacks/` is Suspense loading skeletons, not data mocks. Static
  datasets in gallery/demo `PageContent` views are presentation-only demos and
  exempt from this rule.
- `src/data/` is an **empty directory** — delete it so it doesn't grow into a
  mock-data dumping ground.

**Rule going forward:** a PR must not introduce hardcoded response-shaped data
into `src/app/v1/**`, `src/services/**`, or `src/api/**`. Any mock found later
converts to a real backend query with this checklist:

1. **Schema first** — add or extend the `@Query`/`@Mutation` on the relevant
   NestJS resolver and serve real data from the service layer; never fabricate
   the shape in the frontend.
2. Add the document to `src/lib/graphql/queries.ts` (UPPER_SNAKE constant,
   minimal field selection).
3. Call it with `graphqlFetch<T>()` from the server component / route handler
   and surface errors — no `.catch(() => empty)` (see GQ-2).
4. Type `T` to match the selection exactly (until codegen from GQ-3 lands).
5. Delete the mock and its imports in the same PR; grep for the old symbol to
   confirm nothing still references it.

#### GQ-2 — Silent empty-success fallbacks fake a healthy backend

**Files:**

- `next-js-boilerplate/src/app/v1/[lang]/feed/page.tsx:32`
- `next-js-boilerplate/src/app/v1/[lang]/posts/[uuid]/page.tsx:55`

**What:** Both pages wrap `graphqlFetch` in
`.catch(() => ({ data: undefined, … }))` — the only mock-shaped behavior found
in the app: on any backend/GraphQL failure they fabricate an empty success, so
an outage renders as an empty feed or a missing post instead of an error. The
user cannot distinguish "no posts yet" from "backend down".

**How to fix:** Remove the fabricating catch; log the failure and render an
explicit degraded state (route `error.tsx` or an inline notice). Reserve
`notFound()` for a true `post: null` with no `errors` array.

#### GQ-3 — ~28 route handlers keep inline GraphQL documents outside the catalog

**Files:** `next-js-boilerplate/src/app/api/**` — auth (10 handlers), billing
(4), sessions (3), profile (3), api-keys (2), admin (2), push (2), premium,
users; e.g. `src/app/api/api-keys/route.ts:7-21`

**What:** 42 files call `graphqlFetch` but only 14 import from
`src/lib/graphql/queries.ts` — the rest define their documents inline. All are
real backend queries (verified), but there is no single audit point for the
GQ-1 rule, field selections duplicate, and the hand-written `graphqlFetch<T>`
generics are never checked against the backend schema.

**How to fix:** Move inline documents into `src/lib/graphql/` (per-domain
files are fine). Then evaluate GraphQL Code Generator against the backend SDL
(the backend already ships an `sdl-generator` module) so `T` comes from the
schema instead of hand-typing.

---

### 14.6 Roadmap additions (Rev 3)

| Seq | Item | Section | Prio | Effort | Status |
|---|---|---|---|---|---|
| 57 | Format the frontend tree (387 drifted files) — unreds Frontend CI | CI-0 | P1 | S | Pending |
| 58 | Fix 4 backend spec suites (cache/redis mock drift) — unreds Backend CI | TE-3 | P1 | S | Pending |
| 59 | Fix or drop Lighthouse CI step (missing binary + config conflict) | CI-1 | P1 | S | Pending |
| 60 | Scope CI e2e to installed browsers | CI-2 | P1 | S | Pending |
| 61 | Auth-state freshness check + skip-budget gate | EE-1 | P1 | M | Pending |
| 62 | Secret-scan + dependency-audit workflows | SC-2 | P1 | M | Pending |
| 63 | Drop duplicate backend test run | CI-3 | P2 | S | Pending |
| 64 | Align Node 24 (CI, engines, @types/node) | CI-4 | P2 | S | Pending |
| 65 | Activate git hooks at repo root | GH-1 | P2 | S | Pending |
| 66 | Lockfile sync guard (3 lockfiles) | GH-2 | P2 | S | Pending |
| 67 | Coverage thresholds in both stacks | QG-1 | P2 | M | Pending |
| 68 | Backend health probe in e2e env check | EE-2 | P2 | S | Pending |
| 69 | Env-driven deployment hostnames | FE-1 | P2 | S | Pending |
| 70 | Unit tests for proxy.ts | FE-4 | P2 | M | Pending |
| 71 | Extend dependabot (root, actions, docker) | SC-1 | P2 | S | Pending |
| 72 | Fix silent empty-success GraphQL fallbacks (feed, post detail) | GQ-2 | P2 | S | Pending |
| 73 | Centralize inline GraphQL docs; evaluate SDL codegen | GQ-3 | P2 | M | Pending |
| 74 | Workflow hygiene (concurrency, stale comment) | CI-5 | P3 | S | Pending |
| 75 | Prod-parity e2e mode (E2E_PROD) | EE-3 | P3 | M | Pending |
| 76 | Validate request-id charset/length | FE-2 | P3 | S | Pending |
| 77 | Add COOP header | FE-3 | P3 | S | Pending |
| 78 | Healthchecks for app/nextjs compose services | CP-3 | P3 | S | Pending |
| 79 | No-mock GraphQL protocol; delete empty src/data | GQ-1 | P3 | S | Pending |

---

## Appendix: Fallow auto-fix lessons

The `fallow fix --yes` command was used but **reverted entirely** because it
was too aggressive for this codebase:

1. **Removed exports still used through barrel files** (`index.ts` re-exports).
   Fallow cannot trace barrel re-exports correctly.
2. **Reordered and removed entries from `package.json`** — moved dependencies
   around and dropped legitimate packages (e.g., `babel-plugin-react-compiler`,
   `amqp-connection-manager`, `@grpc/grpc-js`).
3. **Changed `export` to `const`** on components that are consumed through
   barrel files, breaking 5+ typecheck errors across the frontend.

**Recommendation:** Run `npx fallow dead-code --format json` for the audit of
what's unused, but **never** use `fallow fix --yes` on this monorepo. Handle
each dead-code item manually.
