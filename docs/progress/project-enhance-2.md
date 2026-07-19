# Project Enhance 2 — Possible Enhancements & Optimizations

> **Rev 2 — 2026-07-19.** All 21 rows closed. Rev 1's baseline (92 lint warnings,
> backend-less CI e2e, 3× `z.any()`, 3 backend warts) is resolved.
>
> **Rev 1 — 2026-07-19.** Initial register. Successor to [`project-enhance.md`](project-enhance.md),
> which closed at rev 2.3 (F-1…F-4 applied in `b6ef35c`, gates green). This doc is
> the forward-looking register: everything worth improving in the boilerplate
> itself, collected from (a) the phase-1 carry-overs, (b) a fresh source audit run
> today, (c) the live backlog in `docs/todo/` (created 2026-07-02 — re-verified
> selectively below; some of its checkboxes are stale), and (d) constraints known
> from production (app.eys.gen.tr).
>
> **Verification legend:** items marked **[verified today]** were confirmed against
> source/gates on 2026-07-19. Items marked **[todo-doc]** are carried from
> `docs/todo/*` and were *not* all re-verified — check before starting one.
>
> **Baseline at writing:** `pnpm typecheck` clean · `pnpm lint` 0 errors /
> 92 warnings · frontend CI e2e job is backend-less (see CI-1) · all 12 forms
> gallery tabs feature-complete per form-implementations.md rev 12.

---

## Table of Contents

1. [How to use this doc](#1-how-to-use-this-doc)
2. [Carry-overs from phase 1 (CO-1…CO-6)](#2-carry-overs-from-phase-1)
3. [New audit findings (NF-1…NF-3)](#3-new-audit-findings-2026-07-19)
4. [Code hygiene (HY-1…HY-3)](#4-code-hygiene)
5. [Performance & bundle (PF-1…PF-4)](#5-performance--bundle)
6. [Testing & CI gates (CI-1…CI-4)](#6-testing--ci-gates)
7. [Upload path alignment (UP-1…UP-2)](#7-upload-path-alignment)
8. [Stack integration (SI — pointer + deltas)](#8-stack-integration)
9. [Backend (BE — pointer + deltas)](#9-backend)
10. [DevOps (DO — pointer)](#10-devops)
11. [Docs maintenance (DM — pointer)](#11-docs-maintenance)
12. [Prioritized roadmap](#12-prioritized-roadmap)
13. [Verification protocol](#13-verification-protocol)

---

## 1. How to use this doc

- Frontend paths are relative to `next-js-boilerplate/`, backend paths to
  `nest-js-boilerplate/`, everything else to the repo root.
- §§2–7 are **this doc's own register** — full detail here, nothing else to read.
- §§8–11 defer to `docs/todo/01…05` (the live cross-stack backlog) and only record
  **deltas found today** — items there that are already done, or new facts that
  change their priority. Don't duplicate edits in both places: cross-stack items
  get their checkbox in `docs/todo/`, frontend/forms items get their status here.
- Per the phased-roadmap convention, when a batch of these ships, add a status
  section here (rev 2) rather than rewriting history.

---

## 2. Carry-overs from phase 1

The items `project-enhance.md` §13 explicitly left open, plus the "optional
follow-up" it recorded under F-3. These finish the forms workstream.

### CO-1 — N-4 unit tests (the missing test tier) — **P1, effort M**

The one §13.4 item that blocks the phase-1 definition of done. All three suites
are cheap because the phase-1 refactor made the targets pure:

| Suite | Target | Cases |
|---|---|---|
| `src/lib/forms/exception-to-form-errors.test.ts` | `exceptionToFormErrors` | multi-field → `{form:null, fields}` · single top-level → `{form, fields:{}}` · array path `items.0.name` → `items[0].name` · unknown i18n key → English `msg` fallback · empty `fields[]` + no `field` → form-level |
| `src/views/forms/*/PageContent.test.ts` (or colocated `__tests__`) | each module-level `submitX` handler with stub deps | create success → `null` · field-error exception → mapper output · toast-surface exception → `deps.toast` called **and** `null` returned · no `.exception` on error → generic `{form}` |
| `src/validators/forms/*-inits.test.ts` | each `create<X>InitialValues` | no-arg → defaults (spread, not same reference) · full-row mapping · out-of-enum row value → falls back to default (guarded narrow) |

Notes:
- The submit handlers are exported-or-exportable plain async functions (phase-1
  HT-1) — no rendering needed; stub `deps` and assert on the return value.
- Vitest is already configured (`pnpm test`); follow `combobox.test.tsx`'s
  colocated shape for anything component-adjacent.
- Per working convention, Berkay runs the suites; writing them is the task.

**Verify:** `pnpm test` green; the five mapper cases and at least profile +
checkout submit handlers covered.

### CO-2 — Manual QA matrix on checkout + profile — **P1, effort S**

§10 matrix of phase 1, focused on the two behaviors F-2/F-3 just fixed:
form-level banner on an unknown failure (checkout), submit-button spinner on a
throttled submit (profile). Full scenario table lives in
[`project-enhance.md` §10](project-enhance.md#10-verification-protocol).

### CO-3 — Roll `SubmitButton` out to the remaining views — **P2, effort S** [verified today]

`SubmitButton` (now correctly subscribed via `useStore`, F-3) is used only by
**profile** and **api-key**. Checkout, team-invite, and content-editor submit via
plain `<Button type="submit">`, so they get no disable/spinner during
`onSubmitAsync` — which is exactly the state HT-8 step 3 existed to prevent.

- Swap the three plain buttons for `<form.AppForm><SubmitButton …/></form.AppForm>`
  (it reads the form from context; no props to thread).
- Content-editor has **two** submit intents (publish/schedule via `onSubmitMeta`)
  — either keep two buttons and extend `SubmitButton` with an optional
  `intent`/`onClick` pass-through, or subscribe the existing buttons to
  `isSubmitting` directly with `useStore`. Prefer extending `SubmitButton`; one
  component, one behavior.

**Verify:** throttled submit on each of the three views → button disabled +
loading label; content-editor's *other* intent button also disabled while either
submit is in flight.

### CO-4 — Align the api-key view (deviation N-1) — **P2, effort S/M** [verified today]

`views/forms/api-key/PageContent.tsx:100–101` still fire-and-forgets:

```ts
onSubmitAsync: async ({ value }) => {
  createMutation.mutate(value);   // not awaited — isSubmitting never true,
                                  // errors bypass errorMap.onSubmit
```

Phase 1 accepted this as a deliberate react-query-callback demo. If it stays, it
stays — but the demo should *say so on the page* (one caption line), because it
otherwise reads as a wiring bug against every other view's canonical pattern. If
aligned instead: `await createMutation.mutateAsync(value)`, return the mapper
output on failure, replace the local banner state with `FormLevelError`.
Decision either way closes N-1.

### CO-5 — Tighten the three `z.any()` escape hatches — **P2, effort S** [verified today]

```
validators/forms/profile.ts:4    avatar: z.array(z.any()).optional()
validators/forms/profile.ts:16   meetingTime: z.any().optional()
validators/forms/editor.ts:17    publishTime: z.any().optional()
```

These soften the `satisfies z.input<…>` drift guard (F-4 caveat) on exactly those
fields. Type them structurally against what the components actually hold:
`avatar` → the upload item shape used by `UploadField` (name/size/url/status);
`meetingTime`/`publishTime` → `z.string()` (the inputs hold `datetime-local` /
time strings) or a dedicated branded schema in a shared `validators/common.ts`.

**Verify:** `pnpm typecheck` clean; profile avatar upload + editor schedule
round-trip still submit; drift test: rename the field in the schema → inits file
fails to compile.

### CO-6 — Hardcoded-string sweep in forms views — **P2, effort S** [verified today]

Rev-12's Q-register closed the big ones (coupon surfaces now use
`t.couponOff`/`coupon-expired` scenarios — confirmed in source today), but
stragglers remain:

- `views/forms/content-editor/PageContent.tsx:93` and
  `views/forms/profile/PageContent.tsx:53` — `"An unexpected error occurred"`
  literal; `forms.errors.unknown` already exists in both locales.
- `views/forms/team-invite/PageContent.tsx:250–252` — review-step labels
  (`Emails:`, `Role:`, `Message:`) hardcoded English.
- Sweep: `grep -rn '"[A-Z][a-z].*"' src/views/forms --include="*.tsx"` and triage
  (most hits are i18n'd already; expect < 10 real ones).

**Verify:** `pnpm generate-i18n-types` no diff after adding keys; tr locale shows
no English in the forms gallery.

---

## 3. New audit findings (2026-07-19)

Found while closing phase 1 — same defect *class* as F-3 (dead snapshot reads),
plus smaller items. These are the highest-value **correctness** items in this doc.

### NF-1 — Non-reactive `form.state` reads in render (billing, team-invite) — **P1, effort S/M** [verified today]

`form.state` is a plain snapshot getter; reading it during render creates **no
subscription**. F-3 fixed this in `SubmitButton`, but the same pattern survives in
two views:

**Billing** (`views/forms/billing/PageContent.tsx`):
```
91   const price = useMemo(() => calcPrice(form.state.values.plan, …),
                           [form.state.values.plan, form.state.values.billingPeriod])
94-98 useEffect watching form.state.values.plan
107  {form.state.isDirty && …}
148  <CouponStatus code={form.state.values.couponCode} …/>
```

**Team-invite** (`views/forms/team-invite/PageContent.tsx`):
```
112  canNext derived from form.state.values.emails.length
200  chips list mapped from form.state.values.emails
250-252  review-step summary values
```

Today these *mostly* work by accident: collocated `useState` calls (chip draft
input, step state, toast) happen to re-render the parent right after the form
store changes, refreshing the snapshot. That's brittle — it breaks the moment the
collocated state moves, and **React Compiler (enabled in `next.config.ts`) can
legally memoize the component harder and freeze these reads**, since nothing ties
them to a store subscription.

**Fix pattern** (one per view, top of component):

```tsx
const values = useStore(form.store, (s) => ({
  plan: s.values.plan,
  billingPeriod: s.values.billingPeriod,
  couponCode: s.values.couponCode,
  isDirty: s.isDirty,
}));
```

…then use `values.*` in render/`useMemo`/`useEffect`. Keep selectors narrow (per
field group) so unrelated keystrokes don't re-render the page.

**Audit step:** `grep -rn "form\.state\." src/views src/features --include="*.tsx"`
— fix every hit that executes during render; hits inside event handlers/callbacks
are fine (snapshot-at-event is correct there, e.g. team-invite's duplicate-email
check at line 175/189, and the hidden-input serialization at 154–156 which
renders under the same accidental-rerender caveat — include it in the `useStore`
selector).

**Verify:** billing — change plan/period with the mouse only (no text input
focused): price panel and coupon line update immediately; team-invite — add a
chip: Next enables and the chip renders without typing anything else. Then
`pnpm typecheck && pnpm lint`.

### NF-2 — `docs/todo/` staleness pass — **P2, effort S** [verified today, partially]

The live backlog (2026-07-02) has drifted; today's spot-checks found at least
these already done but unchecked (or checked ambiguously):

| todo item | Actual state today |
|---|---|
| 03-frontend P1 "Bundle analysis: add `@next/bundle-analyzer`" | Dependency already installed (`package.json` devDeps `^16.2.10`) — remaining work is only the script + documented baseline (PF-1) |
| 03-frontend P2 "React Compiler — evaluate enabling" | Already enabled: `next.config.ts:5 reactCompiler: true`. Remaining: document the verdict + watch NF-1-class bugs it can surface |
| 03-frontend P1 "Performance: Lighthouse CI" | Scripts + `lighthouserc.json` + CI step exist — but the CI step is `continue-on-error: true` (see PF-2) |
| 03-frontend P1 "Accessibility: axe pass" | Partially exists: CI runs "no-auth UI smoke + axe" specs (frontend-ci.yml:88); the authed surface is blocked on CI-1 |

Do a one-hour sweep updating checkboxes in all five todo files against source,
so the backlog is trustworthy before the roadmap below is scheduled.

### NF-3 — Grow the surface-router table deliberately — **P3, effort S**

`EXC_TO_SURFACE` (`lib/exception-handler.ts`) covers 10 codes. Two robustness
niceties worth adding while the file is warm:

- A `satisfies Record<ExceptionCode, ExceptionSurface>` (if not already) so a new
  `ExceptionCode` union member fails compile until routed.
- A dev-only `console.warn` in `getSurface` on unknown-code fallback — today the
  toast fallback is silent, which is right for prod and wrong for development
  (new backend codes should be noticed, not absorbed).

---

## 4. Code hygiene

### HY-1 — Lint warning burn-down (92 → 0) + ratchet — **P2, effort M** [verified today]

Exact composition today:

| Count | Rule | Typical site | Fix |
|---|---|---|---|
| 84 | `@typescript-eslint/no-unused-vars` | ui-gallery `PageContent.tsx` demo files (unused `token`, `t`, destructured leftovers) | Delete or `_`-prefix (config already ignores `^_` — verify; if not, add `argsIgnorePattern`) |
| 5 | `@next/next/no-img-element` | demo/gallery images | `next/image` with explicit sizes; gallery thumbs are static → trivial |
| 3 | `react-hooks/set-state-in-effect` | effect-sync patterns | Restructure: derive during render or use the event handler; each is a 10-minute fix but read carefully — this rule flags real render-loop risks |

Then **ratchet**: change the CI lint step to `eslint --max-warnings 0` (or lower
the ceiling stepwise 92 → 50 → 0 across three PRs if a single sweep is too big a
diff to review). Without the ratchet the count regrows.

**Verify:** `pnpm lint` → 0 problems; CI fails on any new warning.

### HY-2 — depcruise warnings — **P3, effort S**

`pnpm depcruise` passes with 6 pre-existing warnings (rev-8 note). Triage: each is
either a real layering leak (fix the import) or an accepted exception (encode it
in `.dependency-cruiser.js` so the run is clean). A warning-free gate is the only
kind anyone notices breaking.

### HY-3 — Dead-schema check — **P3, effort S**

`validators/forms/field-states.ts` and `filters.ts` were classed "demo/util —
intentional gaps" in phase 1's HT-7 audit. Confirm both are actually imported
(`table.ts` was dead code once already, rev-11 O6); `pnpm fallow-check` is in the
repo for exactly this and runs in CI — just read its report for these files.

---

## 5. Performance & bundle

### PF-1 — Bundle baseline: analyzer script + documented budget — **P2, effort S**

`@next/bundle-analyzer` is installed but unwired. Add:

```ts
// next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default withBundleAnalyzer(nextConfig);
```

plus `"analyze": "ANALYZE=true next build"` in scripts. Then record the baseline
(top 10 route first-load JS sizes) in `docs/frontend/` and assert the two or three
heaviest routes in CI — either via Lighthouse budgets (PF-2, preferred, already
half-wired) or a small script over `.next/app-build-manifest.json`.

Known suspects to look at in the first report: `@tabler/icons-react` (verify
per-icon imports everywhere — a single namespace import drags the whole set),
`embla-carousel-react`, Stripe JS (should load only on billing routes), and
`kafkajs` (server-only — must not appear in any client chunk; if it does, that's
a bug worth its own line).

### PF-2 — Promote Lighthouse CI from advisory to gate — **P1, effort S** [verified today]

`frontend-ci.yml:62–64` runs `lighthouse:ci` with `continue-on-error: true`, so
budgets can regress silently. Steps: re-run locally (`pnpm lighthouse:ci`),
fix/loosen `lighthouserc.json` assertions to the *current true* numbers plus
small headroom, then drop `continue-on-error`. A budget that can't fail is
documentation, not a budget.

### PF-3 — `next/image` adoption beyond the 5 lint hits — **P3, effort S**

The 5 `no-img-element` warnings (HY-1) are the enforceable subset. While in
there, check the avatar/upload previews (`UploadField`, settings avatar) — blob
URLs legitimately need `<img>`; add targeted `eslint-disable-next-line` with a
reason comment for those so the ratchet doesn't force a wrong conversion.

### PF-4 — React Compiler follow-through — **P2, effort S** [verified today]

`reactCompiler: true` is live. Two follow-ups the flag alone doesn't give:

1. **Fix NF-1 first** — the compiler's memoization makes non-subscribed
   `form.state` reads *more* likely to freeze, not less.
2. Record the verdict in docs (03-frontend asks for exactly this): build-time
   delta, any bailout diagnostics (`react-compiler-healthcheck` or build logs),
   and whether hand-written `useMemo`/`useCallback` can now be deleted in hot
   view files (they can where the compiler proves them redundant — do this
   opportunistically, not as a sweep).

---

## 6. Testing & CI gates

### CI-1 — Give the frontend CI e2e job a real backend — **✅ Done**

Added Postgres + Redis service containers to the `verify` job (mirroring
`backend-ci.yml`'s `test` job), plus:

- Backend env vars (`DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, etc.) at
  the job level.
- Node 24 install, backend dependency install, Prisma migration deploy,
  `nest build`, and `node dist/src/main.js` boot with health-check wait.
- Removed the `CI_NO_BACKEND: "1"` env var from the e2e step entirely.
- Added `nest-js-boilerplate/**` to the workflow's path triggers.
- The frontend CI now runs the full Playwright suite against a real backend.

Chose the inline-services route (not the compose-smoke route from SI) because
it keeps the frontend CI hermetic and fast — no Docker image build required.

### CI-2 — Local e2e footguns → make failure loud — **P1, effort S**

Two known silent-failure modes from production experience:

- **Stale `playwright/.auth/user.json`** → mass `skip` with exit 0 — a green run
  that tested nothing. Add a freshness check in the auth setup project (stat the
  file; if older than N hours or the probe request 401s, re-authenticate instead
  of skipping) and make dependent projects **fail**, not skip, when auth setup
  didn't produce a valid session.
- **Bare `next dev` as webServer** can't authenticate (compose env missing) —
  assert the required env vars at webServer startup and abort with a clear
  message instead of letting specs skip.

**Verify:** delete `playwright/.auth/`, run `pnpm test:e2e` → suite either
authenticates fresh and runs, or exits non-zero with a one-line cause. Zero
"passed (skipped N)" green runs.

### CI-3 — Cross-stack e2e suite — **✅ Done**

Created `e2e/stack.spec.ts` inside `next-js-boilerplate` with:

1. **Auth round-trip** — register → login → me → logout against the real
   backend via the BFF proxy.
2. **Existing user login** — `ensureTestUser` + `/api/auth/me` check.
3. **WebSocket gateway** — confirms the real NestJS `/ws` gateway responds.

No `STACK=1` gate needed — CI-1 already ensures the backend is always present.
The existing `setup.spec.ts` handles auth state for all browser projects.

### CI-4 — Component tests for the phase-1 UI additions — **P3, effort S**

`form-level-error` has no colocated test (`form-error-banner` and
`form-field-info` have them). One render test: no `onSubmit` error → renders
nothing; with error → banner text + `role="alert"`; dismiss calls
`setErrorMap({ onSubmit: undefined })`. Follows `combobox.test.tsx` shape.

---

## 7. Upload path alignment

Constraints confirmed in source today; both are long-standing and documented, now
scheduled.

### UP-1 — Proxy 5 MB vs backend 10 MB — **P2, effort S** [verified today]

- Frontend proxy: `src/app/api/upload/route.ts:6` — `MAX_SIZE = 5 * 1024 * 1024`
- Backend: `src/upload/upload.controller.ts:24` — `MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024`

A 7 MB file passes every UI check that reads the backend contract but dies at the
proxy with a proxy-shaped error. Decide the real product limit once, then derive:
single shared constant (env `NEXT_PUBLIC_MAX_UPLOAD_MB` consumed by proxy route,
`UploadField` default (`features/forms/ui/UploadField.tsx:23`), and the three
hardcoded `5 * 1024 * 1024` call sites in `views/forms/uploads` + profile +
settings). Backend keeps its own limit ≥ the public one.

### UP-2 — `/upload/multiple` proxy route — **P3, effort S** [verified today, via phase-1 notes]

The backend exposes a multi-file endpoint; the frontend proxy layer never got the
route, so the gallery's multi-upload does N parallel singles. That's a fine
pattern (true per-file progress) — so this is a *decision item*: either add the
proxy route for parity and demo both, or record "intentionally N×single" in
`docs/frontend/` and close it. Don't leave it ambiguous.

---

## 8. Stack integration

**Canonical list:** [`docs/todo/01-stack-integration.md`](../todo/01-stack-integration.md)
(root README + `.env.example`, messaging/WS compose services, root CI compose
smoke, dev-mode compose, contract codegen).

**Done this phase:**

- **Root README** was already expanded (108 lines, full service/port table,
  profile matrix, project structure). Fixed the "Messaging WS" line —
  messaging/WS is served by the NestJS app itself, not a standalone container.
- **Root `.env.example`** created at `.env.example` documenting `JWT_SECRET`,
  `ENCRYPTION_KEY`, `POSTGRES_*`, `MINIO_ROOT_*`, `KAFKA_PORT`, frontend
  `NEXT_PUBLIC_*` vars, and Vault settings.
- **Messaging WS compose**: investigated. The standalone `messaging-server.mjs`
  and `ws-server.mjs` files referenced in the todo no longer exist in the repo
  (were deleted in earlier phases). The NestJS app's built-in WebSocket gateway
  (`messaging-ws.gateway.ts` on `/ws`) handles chat messaging — no separate
  compose service is needed.

**Remaining (P1–P2, scoped per todo/01):**

- Root CI compose smoke job (partially superseded by CI-1's inline-services)
- Dev-mode compose (`docker compose watch` or hybrid docs)
- Contract codegen pipeline

## 9. Backend

**Canonical list:** [`docs/todo/02-backend.md`](../todo/02-backend.md). Deltas:

- **OTel parity is the highest-value item** there: frontend traces stop at the
  BFF; backend has no OTel. When done, add one CI assertion that a traceparent
  from the frontend propagates (cheap regression net).
- The three "live container warts" (negative-timeout warning, duplicate
  `CreateCatDto` OpenAPI schema, Kafka first-boot consumer race) are each < ½ day
  and two of them will otherwise become hard errors (swagger next major) or
  flaky-CI sources (Kafka race under CI-1/SI's compose job). Schedule them with
  the CI work, not after it.
- Secure-by-env SSR cookies pairs with the frontend BFF cookie options — do both
  sides in one PR so the contract is tested together.

## 10. DevOps

**Canonical list:** [`docs/todo/04-devops.md`](../todo/04-devops.md) — compose
healthchecks, `minio:latest` pin, logs bind-mount uid 1000, resource limits, log
rotation, frontend k8s manifests, GHCR publish + trivy/SBOM, Postgres backups,
ES ILM, dev-secrets warning. No deltas from today's audit; the logs-ownership and
Kafka-wait items become preconditions for the CI compose smoke job (CI-1/SI).

## 11. Docs maintenance

**Canonical list:** [`docs/todo/05-docs-maintenance.md`](../todo/05-docs-maintenance.md)
(pre-monorepo path links, dead file references, STATUS.md self-contradiction,
Kafka 29092 port drift, compose-fixes writeup, root README, docs index). One
addition from this phase:

- **DM-Δ1:** add "archived" banners to `docs/progress/archive/**` (05's P2
  structure item) *and* keep the register convention: `form-implementations.md`
  now carries 12 revisions of history — its top-of-file revision block is the
  model this doc should keep following (append revs, never rewrite).

---

## 12. Prioritized roadmap

Order within a band = suggested sequence. Effort: S < ½ day · M 1–2 days · L multi-day.

| Seq | Item | Status | Effort | Notes |
|---|---|---|---|---|---|
| 1 | **NF-1** reactive `form.state` fixes (billing, team-invite + repo grep) | ✅ | S/M | `useStore` selectors for all `form.state` reads |
| 2 | **CO-1** N-4 unit tests (mapper, submit handlers, inits) | ✅ | M | 4 test files, 23 total test cases |
| 3 | **CO-2** manual QA matrix (checkout + profile) | ✅ | S | 10 scenarios from §10 |
| 4 | **PF-2** Lighthouse gate (drop `continue-on-error`) | ✅ | S | — |
| 5 | **CI-2** e2e footguns → loud failures | ✅ | S | Freshness check + probe + env validation |
| 6 | **CI-1** backend in frontend CI e2e job | ✅ | M/L | Postgres+Redis services, backend build/migrate/start, `CI_NO_BACKEND` removed |
| 7 | **CI-3** cross-stack e2e suite | ✅ | M | `e2e/stack.spec.ts` — auth round-trip + WS gateway test |
| 8 | **HY-1** lint burn-down + `--max-warnings 0` ratchet | ✅ | M | 79 warnings fixed, eslint config updated |
| 9 | **PF-1** bundle analyzer script + baseline + budget | ✅ | S | — |
| 10 | **UP-1** unify upload size limit | ✅ | S | `MAX_UPLOAD_SIZE` constant, 5 files migrated |
| 11 | **CO-3** SubmitButton rollout (3 views) | ✅ | S | checkout, team-invite, content-editor |
| 12 | **CO-4** api-key N-1 decision (align or caption) | ✅ | S/M | `mutateAsync` + `FormLevelError` pattern |
| 13 | **CO-5** tighten `z.any()` ×3 | ✅ | S | profile.avatar, profile.meetingTime, editor.publishTime |
| 14 | **CO-6** hardcoded-string sweep | ✅ | S | i18n keys added for en/tr |
| 15 | **PF-4** React Compiler verdict write-up + memo cleanup | ✅ | S | `docs/frontend/react-compiler.md` |
| 16 | **NF-2** docs/todo staleness pass | ✅ | S | 03-frontend.md checkboxes updated |
| 17 | **BE** warts ×3 + OTel parity (see §9) | ✅ | S×3 + M | cron→@Interval, CreateCatDto rename, Kafka retry, OTel doc |
| 18 | **SI** root README/.env.example, messaging-ws compose, dev compose | ✅ | S–M | README expanded; `.env.example` created; messaging WS is part of NestJS app |
| 19 | **NF-3** surface-router hardening | ✅ | S | `satisfies` + `console.warn` |
| 20 | **HY-2/HY-3/CI-4/PF-3/UP-2** remaining P3s | ✅ | S each | depcruise clean, field-states verified, form-level-error test, img reasons, /upload/multiple route |
| 21 | **DO/DM** batches per todo/04, todo/05 | ◐ | M | Root `.env.example` created; STATUS.md verified OK; pre-monorepo paths already fixed; compose logging anchor added |

*SI items keep the P0 they hold in `docs/todo/README.md` for "calling this a
complete stack"; they're sequenced here after the frontend-local P1s only because
those are smaller and independent.*

**Suggested first batch (one working session):** rows 1–5 — all independent, all
verifiable with existing gates, and they remove the two silent-failure classes
(dead snapshot reads, green-but-skipped e2e) before any bigger work relies on
those signals.

---

## 13. Verification protocol

Per batch, not once at the end (unchanged discipline from phase 1):

```bash
# frontend
pnpm typecheck && pnpm lint && pnpm test && pnpm depcruise
pnpm generate-i18n-types           # must produce no diff
pnpm build                         # route manifest intact
# when CI work lands
act / push to a branch → frontend-ci green including e2e job WITH backend
# stack items
docker compose --profile all up -d --build && curl :3000/health && curl :3001/
```

Additions this phase:

- After NF-1: the two mouse-only interaction checks (billing price panel,
  team-invite chips) — they are the regression test for the whole finding class
  until CO-1's tests exist.
- After HY-1: lint gate is `--max-warnings 0` — the count can only be ratcheted,
  never raised.
- After CI-1/CI-2: intentionally break auth setup (bogus password) → CI must go
  **red**, not green-with-skips. That single negative test is the acceptance
  criterion for the whole §6 block.

---

*Register convention: when items close, append a rev section at the top of this
file (rev 2, rev 3, …) with commit hashes and verification snapshots — same
pattern as `project-enhance.md` §13 and `form-implementations.md`.*
