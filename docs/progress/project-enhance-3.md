# Project Enhance 3 — Bug Audit & Refactoring Targets

> **Rev 2 — 2026-07-19.** Static analysis audit of both stacks using fallow (dead-code,
> health/complexity, security candidates) plus manual review of lint, typecheck,
> and test results. Supersedes the now-closed [project-enhance-2.md](project-enhance-2.md).
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
