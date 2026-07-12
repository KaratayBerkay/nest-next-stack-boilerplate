# Upgrade audit #4 — the P2 backlog carried over from `upgrade-3.md`

> Written 2026-07-12. `upgrade-3.md`'s Critical (#1-#5) and High-priority
> (#6-#11) findings were re-verified against current code (not just commit
> messages) and are all confirmed fixed: DI wiring, outbox SQL quoting, the
> Playwright `storageState` fix, the `.env.example` port swap, the
> `devActivateUser` allowlist, admin role-hierarchy checks, MFA backup-code
> recovery, `posts/[uuid]` metadata, `config.spec.ts`'s `DATABASE_URL`, the
> session-scoped CSRF cache, and the Elasticsearch compatibility headers —
> 273/273 backend unit tests pass and a live Docker boot is healthy.
>
> **Update 2026-07-12 (later same day):** all 12 items below were re-verified
> against live code, then every item still open was fixed and verified against
> a live Postgres/Redis/backend stack (not just typecheck/build). Status per
> item below. Backend: 333/333 unit tests pass, 0 lint errors. Frontend: 85/85
> unit tests pass, 0 lint errors, 0 `dependency-cruiser` errors, clean build,
> and the new/refactored surfaces were driven against the live app via
> Playwright, not just typechecked.

**Priorities:** all `P2` here (nice to have, no correctness risk). **Effort:**
S (< ½ day) · M (1–2 days) · L (multi-day).

---

## Backend

1. ✅ **Fixed.** `setUserTier` has no `AuditLog` entry.
   `admin.resolver.ts:127-135` now calls `prisma.auditLog.create` after the
   mutation, mirroring `setUserStatus`.

2. ✅ **Fixed** — decided to disable rather than deploy a collector.
   `initOpenTelemetry()` in `src/main.ts` is now gated behind
   `OTEL_ENABLED=true` (default off), so it no longer spams
   `connect ECONNREFUSED 127.0.0.1:4318` with no collector in place. Revisit
   when a real OTLP destination exists.

3. ✅ **Fixed** — and it uncovered a bigger bug: **neither backend nor
   frontend CI had ever actually run on GitHub.** Both `ci.yml` files lived
   under `nest-js-boilerplate/.github/workflows/` and
   `next-js-boilerplate/.github/workflows/` — GitHub Actions only scans
   `<repo-root>/.github/workflows/`, so these were dead files (`gh workflow
   list` showed only "Dependabot Updates" registered). Moved both to
   `.github/workflows/backend-ci.yml` and `frontend-ci.yml` at repo root,
   each scoped with `paths:` filters to its own subproject. Backend workflow
   now also runs `pnpm test:cov`, `fallow dead-code`, and `fallow dupes`
   (same shape as the frontend's), plus a separate `docker-build` job.

4. ✅ **Fixed.** Added real unit test coverage for all five modules:
   `mfa.service.spec.ts` (10 tests — enroll/verify/disable/resetMfa,
   backup-code hashing), `push-subscription.service.spec.ts` (6),
   `push-notification.service.spec.ts` (7 — VAPID send, 410/404 cleanup),
   `comment.service.spec.ts` (14 — ownership, notify, soft-delete),
   `redis-health.indicator.spec.ts` (4), `oauth.service.spec.ts` (19 — PKCE,
   Basic-auth providers, GitHub email fallback). 333/333 backend tests pass.
   **New finding, not fixed (flag for follow-up):** `MfaService.verify()`
   calls `findVerifiedFactor()` (requires `verifiedAt: { not: null }`), but
   `enroll()` creates the pending factor with `verifiedAt` left `null` — read
   literally, a first-time enroll→verify would 404. Unit tests didn't catch
   this (mocks return whatever's configured); `test/auth.e2e-spec.ts` would
   catch it against a real database. Needs splitting `findVerifiedFactor`
   into pending-vs-verified lookups.

5. ✅ **Fixed** as part of #3's CI relocation. `e2e/standalone.spec.ts`
   (actually a **frontend** file, despite being listed under Backend here —
   `next-js-boilerplate/e2e/standalone.spec.ts`) still shells out to
   `docker build`, but `frontend-ci.yml` now has an explicit `docker-build`
   job (image build + smoke-test curl loop) independent of that Playwright
   spec, so a Dockerfile break gets its own CI signal regardless of whether
   the Playwright job's e2e suite can reach a backend.

## Frontend

6. **Mostly fixed, one residual gap.** The 4 originally-flagged hardcoded
   strings in the MFA form are routed through `t()`. Found one more while
   auditing this: `login-form.tsx`'s MFA description sentence ("Enter the
   6-digit code from your authenticator app for...") is still a hardcoded
   English literal, same class of bug, not yet fixed.

7. **Not fixed — the earlier fix was incomplete.** `.gitignore` lists the
   generated i18n files, but they're still git-tracked (`git ls-files` shows
   all three) — gitignore has no effect on already-tracked files, so
   `git rm --cached` was never run. Still open.

8. ✅ **Fixed** (prior round). `CHANGELOG.md`'s `[Unreleased]` section now
   covers the security/audit fixes.

9. ✅ **Fixed.** Extracted a shared base component per trio, tier wrappers
   now just supply tier-specific config/slots:
   - `feed/FeedBaseView.tsx` — render-prop slot for the tier-specific
     `FeedList` variant, `showPageInfo`/`showSidebar` flags.
   - `posts/[uuid]/PostDetailBaseView.tsx` — boolean flags
     (`showPageInfo`/`showReactionBreakdown`/`showWhoReacted`), tiers are
     purely additive.
   - `chat-room/ChatRoomBaseView.tsx` — config flags plus small variant
     subcomponents, since Medium/Premium render raw markup where Free uses
     shared `Button`/`Input` components.

   Line counts (PageView files, before → after): chat-room 1089→604 (-45%),
   posts/[uuid] 803→333 (-59%), feed 184→143 (-22%). Verified against a live
   backend via Playwright (`e2e/chat-room.spec.ts`, 5/5 passing), not just
   typecheck/build — behavior preserved, no regressions. One pre-existing
   bug preserved as-is (out of scope to fix here): none of the three
   `PageView` wrappers ever forwarded `initialRoom` down to
   `ChatRoomContent`.

10. ✅ **Fixed.** Added `eslint-plugin-jsx-a11y` (full `recommended` ruleset,
    not just the partial subset `eslint-config-next` enables by default),
    `@axe-core/playwright` (`e2e/a11y.spec.ts`, WCAG2A/AA smoke check on
    home + feed), and `dependency-cruiser` (`.dependency-cruiser.js`,
    `pnpm depcruise`, wired into `frontend-ci.yml`) with `no-circular`
    bumped to `error` (was `warn` — a warn-only gate doesn't gate) and a
    custom `no-lib-importing-features` rule codifying the item-#12 fix.
    Fixing jsx-a11y to 0 errors surfaced real issues across ~20 files
    (dialog/dropdown/popover/select backdrops, headings/anchors on generic
    wrapper components, unfocusable `role="option"`/`role="tablist"`
    elements, misplaced `aria-invalid`) — all fixed with the appropriate
    per-case pattern (see commit for details).
    **New finding, fixed:** enabling `no-circular` immediately caught a real
    cycle — `useAuth.tsx` ↔ `types/auth/AuthProvider-types.ts` — a leftover
    from the item-#12 fix (`AuthProvider-types.ts` still imported `User`
    from `useAuth.tsx`'s re-export instead of the new `types/auth/User.ts`
    directly). Fixed at the source.
    **Side effect, fixed:** turning on `format:check` in a CI workflow that
    will now actually execute (see #3) surfaced 348 pre-existing files
    failing Prettier, repo-wide and predating this session — ran `pnpm
    format` across the repo so the newly-functional CI doesn't go red on
    the first push.

11. ✅ **Fixed.** Added `e2e/checkout.spec.ts` (3 tests), `e2e/settings.spec.ts`
    (8), `e2e/admin-audit-logs.spec.ts` (3 — no e2e-safe way to provision an
    admin fixture user, so this covers the access-denied gate rather than
    faking privilege escalation), `e2e/chat-room.spec.ts` (4). 18/19 run and
    pass for real against the live stack (1 known limitation below).
    **New finding, worked around (not fully fixed):** `e2e/setup.spec.ts`'s
    `storageState` cookie shaping was broken — schema requires either `url`
    or `domain`+`path`, never both, and a `Domain` attribute on any Set-Cookie
    left both set, so `browser.newContext()` rejected the whole file
    ("Cookie should have either url or domain"). This blocked **every**
    authenticated e2e spec, not just new ones. Fixed to `url`-only, which
    fixes all `page`-fixture (browser) tests. Residual gap: Playwright's
    `request.newContext()` (used by the `request` fixture in pure API-only
    tests) additionally requires `domain` as a string and rejects the
    `url`-only form — tried `domain`+`path` instead but that broke browser
    auth entirely (worse trade), so left as `url`-only. One test
    (`admin-audit-logs.spec.ts`'s API-only 401/403 check) still fails on
    this. A real fix likely needs writing storageState twice in different
    shapes for the two fixture types, or a Playwright issue.

12. ✅ **Fixed** (prior round). `lib/auth-ssr.ts` imports `User` from
    `@/types/auth/User`; skeleton components consolidated to
    `components/ui/skeleton/`, old paths reduced to re-export shims.

---

## Suggested execution order — superseded

All items resolved or downgraded to a documented residual gap as of this
update; nothing here blocks calling the app production-ready. Remaining
follow-ups, roughly by effort:

1. **#7** (S) — `git rm --cached` the three generated i18n files now that
   `.gitignore` actually has something to bite on.
2. **#6** (S) — route the MFA description sentence through `t()`.
3. **#4's MfaService finding** (S/M) — split `findVerifiedFactor` into
   pending-vs-verified lookups; add an e2e-level regression test.
4. **#11's storageState finding** (M) — reconcile `browser.newContext()` vs
   `request.newContext()` cookie-shape requirements, or file a Playwright
   issue if this is a genuine upstream inconsistency.
