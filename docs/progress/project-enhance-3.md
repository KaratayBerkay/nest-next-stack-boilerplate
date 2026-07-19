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
