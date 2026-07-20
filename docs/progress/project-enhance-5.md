# Project Enhance 5 — Full-Stack Senior Review: UI/UX, Next.js Architecture & NestJS Backend

> Fifth review pass in the `project-enhance-*` series. Scope: the **entire** stack —
> `next-js-boilerplate/` (~1,311 source files) reviewed twice, once as a senior UI/UX
> designer and once as a senior Next.js developer, then `nest-js-boilerplate/`
> (~570 real source files, excluding ~2,590 generated Prisma files) reviewed as a
> senior NestJS developer, split into core product domain and platform/infra.
>
> Produced 2026-07-20 by four parallel deep-research passes (see §3 — Methodology),
> each grounded in this repo's own prior audits (`project-enhance.md` through
> `project-enhance-4.md`) and normative docs (`AGENTS.md`, `docs/backend/AUTH.md`,
> `docs/backend/REALTIME.md`, the four ADRs, `docs/frontend/DESIGN_GUIDE.md`), so
> findings below are **net new** relative to what's already fixed or already
> tracked — each part opens with a "ground already covered, re-verified" note
> instead of silently re-deriving it. Every finding cites a file and line that was
> actually opened; the two headline P0s were independently re-verified by a second
> reader (me) before being written up here — see §3 for exactly what that covered.

---

## Table of Contents

1. [How to use this document](#1-how-to-use-this-document)
2. [Executive summary — cross-cutting priority board](#2-executive-summary--cross-cutting-priority-board)
3. [Methodology & what was independently verified](#3-methodology--what-was-independently-verified)

**PART I — Senior UI/UX Designer Review** (`next-js-boilerplate`)
4. [Scope, method & ground truth](#4-scope-method--ground-truth)
5. [Headline](#5-headline)
6. [UI/UX bugs](#6-uiux-bugs)
7. [UI/UX enhancements](#7-uiux-enhancements)
8. [Top 10 — UI/UX](#8-top-10--uiux)

**PART II — Senior Next.js Developer Review** (`next-js-boilerplate`)
9. [Executive read — what's already clean](#9-executive-read--whats-already-clean)
10. [P1 findings](#10-p1-findings-nextjs)
11. [P2 findings](#11-p2-findings-nextjs)
12. [P3 findings](#12-p3-findings-nextjs)
13. [Enhancements](#13-enhancements-nextjs)
14. [Top 10 — Next.js](#14-top-10--nextjs)

**PART III — Senior NestJS Developer Review** (`nest-js-boilerplate`)
*III.A — Core product domain*
15. [Status of the 7 previously-known issues](#15-status-of-the-7-previously-known-issues)
16. [Core-domain findings](#16-core-domain-findings)
17. [Core-domain enhancements](#17-core-domain-enhancements)

*III.B — Platform, infrastructure & the recipe-module sprawl*
18. [Config & secrets](#18-config--secrets)
19. [Security middleware stack](#19-security-middleware-stack)
20. [Caching & Redis](#20-caching--redis)
21. [Queues & brokers](#21-queues--brokers)
22. [Prisma schema & migrations](#22-prisma-schema--migrations)
23. [Health checks](#23-health-checks)
24. [Deployment (Dockerfile / k8s / compose)](#24-deployment-dockerfile--k8s--compose)
25. [CI (backend-ci.yml)](#25-ci-backend-ciyml)
26. [Test infra](#26-test-infra)
27. [Observability (logging / OTel)](#27-observability-logging--otel)
28. [Recipe-module sprawl](#28-recipe-module-sprawl)
29. [Platform enhancements](#29-platform-enhancements)
30. [Top 10 — NestJS (core + platform combined)](#30-top-10--nestjs-core--platform-combined)

**Synthesis**
31. [Cross-stack synthesis](#31-cross-stack-synthesis)
32. [Suggested execution order](#32-suggested-execution-order)

---

## 1. How to use this document

This is a **findings-only planning register**, matching the convention of
`project-enhance.md` through `-4.md` — nothing in this document has been
implemented. Each finding has a severity tag, exact file:line evidence, a
concrete "how to fix," and (where relevant) an "Enhancement" variant for
net-new capability rather than a bug fix.

**Severity scale**, applied consistently by all three review hats:
- **P0** — actively broken for real users/operators today, a security hole, or a
  hard CI blocker with no workaround.
- **P1** — clearly wrong or a documented-convention violation, no workaround,
  should be next after P0s.
- **P2** — real but bounded/edge-case, or a maintainability risk rather than a
  live bug.
- **P3** — polish, doc-accuracy, or low-blast-radius cleanup.
- **Enhancement** — not a bug; a net-new capability or pattern a senior
  reviewer would propose.

Each of the three review parts opens with a **"ground already covered"** note —
read that first if you're familiar with `project-enhance-2/3/4.md`, so you don't
re-litigate settled findings. Sections 15 and the "Executive read" in §9 also
list what was re-checked and found **already fixed** — don't re-open those.

If picking this up for implementation, start at §32 (suggested execution
order), which sequences every P0/P1 across all three parts by dependency, not
just by section number.

---

## 2. Executive summary — cross-cutting priority board

Four independent senior-level passes, plus one new finding surfaced by
cross-checking them against each other (§31), produced **75 bug findings**
(2 P0 · 17 P1 · 36 P2 · 20 P3) and **18 enhancement proposals** across the
two apps (counts re-verified by direct tally of every
`### [severity]`/`### [Enhancement]` heading in this document as of the
last revision — see §3).
The codebase is disciplined at the micro level (near-zero `any`, zero
`@ts-ignore`, tiny TODO count, a genuinely clean component library) — almost
everything below is an **architectural, completeness, or drift** issue, not
sloppiness. The table below is the subset a reader should see first; full
detail is in the numbered parts.

| # | Sev | Area | Finding | Section |
|---|-----|------|---------|---------|
| 1 | **P0** | Backend/Auth | No `refresh` mutation exists anywhere — every session is force-logged-out at UTC midnight, on any tier change, and after 15 min idle, with no recovery | [§16](#16-core-domain-findings) |
| 2 | **P0** | Backend/CI | `pnpm test:cov` is mathematically unpassable (3.19% vs a 55% floor) because coverage sweeps all 3,160 files incl. 2,590 generated — backend CI is red at HEAD | [§25](#25-ci-backend-ciyml) |
| 3 | P1 | Backend/Auth | `me` query silently drops `username`/`avatarUrl`/`locale`/`timezone` for every user (guard doesn't attach them) | [§16](#16-core-domain-findings) |
| 4 | P1 | Backend/Test | e2e suite is broken app-wide: shared `registerAndLogin` helper queries a `refreshToken` field that doesn't exist on `AuthPayload` | [§16](#16-core-domain-findings) |
| 5 | P1 | Backend/Ops | Documented log pipeline (Pino → Fluent Bit → ES) is dead at the source — no compose service sets the `fluentd` log driver, so ES indexes zero documents | [§27](#27-observability-logging--otel) |
| 6 | P1 | Backend/Data | Compose `migrate` service uses `db push --accept-data-loss` instead of `migrate deploy` — local/compose DBs never get the `pg_trgm`/GIN migrations that prod applies | [§22](#22-prisma-schema--migrations) |
| 7 | P1 | Backend/Ops | k8s `secret.example.yaml` omits the prod-required `ENCRYPTION_KEY` — following the example verbatim crash-loops the pod | [§18](#18-config--secrets) |
| 8 | P1 | Backend/Security | Global rate limiter is in-memory while `replicas: 2` — login/MFA brute-force limits are per-pod, not cluster-wide | [§19](#19-security-middleware-stack) |
| 9 | P1 | Frontend/Security | No app-wide CSP — only `/security/*` is covered, and the documented reason (PPR conflict) doesn't hold because `cacheComponents` is never actually enabled | [§10](#10-p1-findings-nextjs) |
| 10 | P1 | Frontend/Correctness | Frontend `ExceptionCode` map is missing 9 of the backend's 23 codes, with no parity guard — re-drifted after a prior fix | [§10](#10-p1-findings-nextjs) |
| 11 | P1 | Frontend/Convention | A real view (`messages/FreePageView.tsx`) calls `apiFetch` directly, the exact two-layer-pattern violation `AGENTS.md` forbids — and uses its own *canonical good example* as the thing it should have called instead | [§10](#10-p1-findings-nextjs) |
| 12 | P1 | Frontend/A11y | `text-white` hardcoded on `bg-brand` in 36 files fails WCAG AA contrast (~2.4:1–3.0:1) on 5 of 6 shipped themes | [§6](#6-uiux-bugs) |
| 13 | P1 | Frontend/A11y | Icon-only controls have no accessible name app-wide — the `IconButton` primitive that forces a label exists but has **0%** adoption in real views (26 files hand-roll raw `<button>`) | [§6](#6-uiux-bugs) |
| 14 | P1 | Frontend/A11y | Mobile nav drawer stays keyboard/screen-reader-reachable while visually closed; no focus trap, no Escape, no focus return — this is the app's primary navigation | [§6](#6-uiux-bugs) |
| 15 | P1 | Frontend/A11y | App shell has no `<main>` landmark or skip-link, and only 5 of ~150 pages render an `<h1>` | [§6](#6-uiux-bugs) |
| 16 | P1 | Frontend/i18n | Hardcoded English in real surfaces (`settings/sessions`, `messages/ChatView`) bypasses i18n entirely, unlike every sibling page | [§6](#6-uiux-bugs) |
| 17 | P2 | Frontend/i18n | Same hardcoded-English bug recurs in the login MFA sub-form specifically — `useMessages("auth")` is already imported two lines away | [§11](#11-p2-findings-nextjs) |

**Everything else** — 36 P2s and 20 P3s spanning cache-stampede protection,
Redis AUTH/TLS, the transactional-outbox being applied inconsistently, a
backend exception-code typo a unit test locks in as "tested" (§16), doc
drift in four separate documents, dead/never-run CI lanes, the multi-ORM
recipe sprawl's lack of a "what's canonical" statement, and a long tail of
component-consistency polish — is detailed in the numbered parts below, each
with its own Top 10.

---

## 3. Methodology & what was independently verified

Four parallel senior-persona research passes were run (general-purpose agents,
opus-level reasoning, read-only, no file edits): **UI/UX designer** and
**Next.js developer** over `next-js-boilerplate/`; **NestJS core-domain** and
**NestJS platform/infra** over `nest-js-boilerplate/` (the backend was split
in two because its real module count and its ORM/transport recipe-module
sprawl are each large enough to deserve full-depth treatment separately). Each
was briefed with: the exact prior `project-enhance-2/3/4.md` ground already
covered (so it wouldn't re-derive settled findings), the relevant normative
docs (`AGENTS.md`, ADRs, `AUTH.md`, `REALTIME.md`), and a set of specific
prior-session claims to re-verify against current code rather than trust
(e.g. the seven backend bugs listed in §15). All four were interrupted once by
a session-limit error mid-run and resumed from their own transcripts with an
explicit "don't skip anything, don't redo what you already finished"
instruction — each had already done 46–64 tool calls of real investigation
before the interruption, and the resumed runs report finishing every section
of their brief.

**What I (the synthesizer) independently re-verified myself, beyond trusting
the agents' citations**, because these are the two P0s the rest of the
document's priority ordering depends on:

- **The missing `refresh` mutation (§16, finding #1 in the priority board).**
  Grepped `nest-js-boilerplate/src/schema.gql`'s full `Mutation` block myself
  (confirmed no `refresh` field between `publishNotification` and `register`
  where it would alphabetically sort) and `auth.resolver.ts` (zero
  occurrences of "refresh"). Read `next-js-boilerplate/src/api/server/auth/refresh-token.ts`
  directly: it only re-`GET`s `/api/auth/token` and echoes back whatever
  cookies already exist — confirmed it cannot mint a new day-derived token,
  it isn't a real refresh path. Read `session-auth.guard.ts:60-159` directly:
  confirmed the hard `throw new UnauthorizedException('Daily token expired')`
  at step 3 and `'RBAC token expired or tier changed'` at step 6, both with
  no fallback. This finding is solid.
- **The absent app-wide CSP / `cacheComponents` claim (§10, priority-board
  #9).** Read `next-js-boilerplate/next.config.ts` in full myself: confirmed
  `experimental` contains only `hideLogsAfterAbort: true` — no
  `cacheComponents` anywhere — and confirmed the `headers()` block sets HSTS/
  X-Content-Type-Options/X-Frame-Options/Referrer-Policy/Permissions-Policy/
  COOP but no `Content-Security-Policy`. Matches `docs/frontend/STATUS.md`'s
  own "#59" gotcha admission that CSP is scoped to `/security/*` — but the
  *reason* given for that scoping doesn't hold if PPR was never turned on.
  This finding is solid.
- **The cross-referenced `EX_MFA_NOT_ENABLED` naming bug** (new finding,
  surfaced while cross-checking the frontend exception-code report against
  the backend — see §31): grepped both `mfa.service.ts:96` (throws the
  literal string `'EX_MFA_NOT_ENABLED'`) and `common/exceptions/exception-code.ts:10`
  (canonical value is `'EX_AUTH_MFA_NOT_ENABLED'`), and confirmed
  `mfa.service.spec.ts:249` asserts on the **wrong** value, which is why this
  was never caught — the test locks in the bug.

Everything else in this document carries the originating report's own
file:line citation but was not independently re-opened by a second reader.
Given the volume (~74 findings), that's a deliberate scope decision, not an
oversight — treat the rest as "high-confidence, single-reader-verified"
rather than "double-verified," and re-check file:line evidence at
implementation time the way this project always does before trusting a
completion claim.

---

# PART I — Senior UI/UX Designer Review

## 4. Scope, method & ground truth

Scope: `next-js-boilerplate/` visual, interaction, accessibility, and content
design. Architecture, performance, and testing are explicitly out of scope
here (Part II). The narrow onBlur-validation-logic and per-field-hint-copy
system that `project-enhance-4.md` covered in depth (§§18–23 of that doc,
closed as of commit `c849895`) is **not** re-audited — it was spot-checked
and confirmed still correct, then dropped:

> `features/forms/ui/TextField.tsx:23-26` still forwards `required` +
> `aria-required` + `hint`; `views/forms/api-key/PageContent.tsx:347` and
> `views/forms/editable-table/PageContent.tsx:321` still pass real i18n
> `description=` to `ConfirmDialog`; `editable-table` still renders
> `quantityHint` (`:184`).

**The known `data-{state}={bool}` presence-selector bug class** (an
unconditional `data-disabled={bool}` combined with a Tailwind
`data-[disabled]:` selector matches unconditionally regardless of the string
value, which caused a real production combobox bug once already — see this
project's memory) was checked across all five `data-*={}` sites in
`src/components/ui/**` and **does not recur harmfully**:
`dropdown-menu-trigger`, `select-trigger`, `tabs-trigger` all emit
discriminating string values (`open`/`closed`); `command-item.tsx:64` uses
the correct guarded form `data-disabled={disabled ? "" : undefined}`. One
cosmetic residue remains — see P3 "`command-item` renders an unused
`data-selected="false"`" below — but no CSS selector currently keys off it,
so there's no live regression.

Ground truth used: `docs/frontend/DESIGN_GUIDE.md` (366 lines) and
`next-js-boilerplate/CSS-IMPROVEMENTS.md` (623 lines), read in full as the
team's own prior design-system documentation, then checked against the
actual CSS/components. `next-js-boilerplate/components.md` for inventory
orientation.

## 5. Headline

The **component library** (`src/components/ui/**`, ~50 components) is
genuinely in good shape: **zero** raw Tailwind color utilities, **zero** raw
`dark:` classes, consistent `focus-visible:ring-2 focus-visible:ring-brand`
(28×/31×) and `disabled:opacity-50` (24×) recipes, proper `role`/`aria-live`
on toast, alert, field-info, form-error-banner. The problems concentrate in
**two layers above it**:

1. **The `views/**` demo-app layer** still ships pre-token-migration
   patterns — raw palette colors, `text-white` on brand, hand-rolled
   buttons/empty-states, one settings page with hardcoded English.
2. **The design-system *documentation*** (`DESIGN_GUIDE.md`,
   `CSS-IMPROVEMENTS.md`) describes an architecture (`.theme-*` classes,
   Ocean/Violet themes, independent color-vs-style axes, specific token
   hexes) that **does not exist** in the actual CSS. A team executing
   against these docs would build broken things.

The single most impactful concrete bug is **`text-white` hardcoded on
`bg-brand` across 36 files**, which fails WCAG AA contrast under 5 of the 6
shipped themes because the correct foreground token (`--brand-fg`) is near-
*black* in those themes, not white.

**Verified clean (non-findings, listed so the team doesn't re-chase them):**
no placeholder-as-label misuse in views (`grep '<input.*placeholder'
src/views` → 0, inputs go through `Input`/`TextField` + `Label`); all view
images use `next/image`, zero raw `<img>`; `Avatar` uses `object-cover`
(`avatar.tsx:65`); chat/messages have no fixed-px dimensions, so they reflow
cleanly; the shared `Table` wraps in `overflow-auto` (`table.tsx:8`); the
main nav is one shared `V1Nav` for both desktop and mobile; EN/TR *tone* is
good wherever i18n is actually used (e.g. TR reads naturally: "Bir şeyler
yanlış gitti", "Tekrar Dene") — the copy problem is strings bypassing i18n
entirely, not translation quality; and the core primitives (`Button`
`loading`→`Spinner`/`aria-busy`; `IconButton` requiring a `label`) are
well-built — the issue below is view-layer *adoption*, not primitive
quality.

## 6. UI/UX bugs

### [P1] `text-white` hardcoded on `bg-brand` — sub-AA contrast under 5 of 6 themes
**Where:** 36 files. Representative: `src/views/v1/[lang]/V1Header.tsx:37,62,69`;
`src/views/v1/[lang]/V1Sidebar.tsx:46`; `src/views/feed/FreeFeedList.tsx:221`;
`src/views/find-friends/FreeFindFriendsContent.tsx:103,116,153`;
`src/views/v1/[lang]/ProfileSection.tsx`, `MessageDropdown.tsx`, plus
`settings/**`, `feed/**`, `premium/**`, `chat-room/**`, `messages/**`,
`admin/**`. Full list: `grep -rEln 'bg-brand[^"]*text-white' src/views
src/components`.

**What's wrong:** Every primary/brand button, avatar, and CTA hardcodes
`text-white` on `bg-brand` instead of the semantic pair `bg-brand
text-brand-fg`. `--brand-fg` is defined per theme in `globals.css` and is
**not white** in most: dark `#0b0b1a` (`:44`), glass `#0b0b1a` (`:118`),
gradient `#0b0b1a` (`:188`), neon `#020617` (`:153`), shiny `#ffffff`
(`:83`). Because the runtime adds `.dark` for every non-light theme
(`useTheme.tsx:88`), these buttons render with white text on a light-ish
brand fill. Computed contrast (WCAG 2.x):
- Neon brand `#06b6d4` + `#ffffff` ≈ **2.4:1** (fails AA 4.5 and large-text
  3.0). With `--brand-fg` `#020617` it would be ≈ 7.7:1.
- Dark brand `#818cf8` + `#ffffff` ≈ **3.0:1** (fails normal-text AA 4.5).
  With `--brand-fg` `#0b0b1a` ≈ 6:1.

So the app's most important action color is unreadable-to-marginal on 4-5
themes.

**How to fix:** Two passes — not every hit is the same shape, so a blind
find/replace risks under- or over-fixing some sites.

1. **Enumerate every occurrence first**, not just the representative list
   above: `grep -rEn 'bg-brand[^"]*text-white|text-white[^"]*bg-brand'
   src/views src/components > /tmp/text-white-brand-hits.txt`, then work
   through the list file-by-file so nothing gets missed and nothing
   unrelated gets touched.
2. **Non-interactive badges/fills** — just swap the token in place, no
   structural change. E.g. `V1Header.tsx:37` (the logo-mark `<div
   className="bg-brand flex h-7 w-7 items-center justify-center rounded-lg
   text-[11px] font-bold text-white">`) and `:62` (`<Avatar
   className="bg-brand ring-border h-8 w-8 shrink-0 text-[11px] text-white
   ring-2" />`): change `text-white` → `text-brand-fg`, leave everything
   else untouched.
3. **Interactive CTAs built from raw `<a>`/`<button>`** — migrate to
   `Button` instead of only swapping the class, so they also pick up the
   `loading`/`aria-busy`/focus-ring/`active:translate-y-px` behavior called
   out separately below (same underlying files, one pass fixes both).
   `V1Header.tsx:67-72` is the clearest example:
   ```tsx
   // before
   <a
     href={LOGIN_PATH}
     className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
   >
     {t.signIn}
   </a>

   // after — Button's asChild (button.tsx:75-97) wraps the <a> without losing the anchor semantics
   <Button asChild variant="primary" size="sm">
     <a href={LOGIN_PATH}>{t.signIn}</a>
   </Button>
   ```
   Apply the same `asChild` pattern to `V1Sidebar.tsx:44-49`'s sign-in
   link and every other raw `bg-brand … text-white` CTA the grep turns up
   (e.g. `feed/FreeFeedList.tsx:221`'s `<Link className="bg-brand …
   text-white">`).
4. **Verify across all 6 themes, not just default** — toggle each
   `.style-*` theme (`light, dark, shiny, glass, neon, gradient`) via the
   theme switcher after the fix and visually confirm each swapped element.
   The bug only shows on 5 of 6 themes, so checking only the default theme
   post-fix would silently miss a regression on the other four.
5. Wire the "[Enhancement] Automated cross-theme contrast gate in CI"
   below once this pass is done, so a future PR pasting an old
   `bg-brand … text-white` snippet fails CI instead of shipping a 6th
   instance of this exact bug.

---

### [P1] Mobile sidebar drawer stays keyboard-focusable & AT-reachable when closed; no focus trap / Escape / focus-return
**Where:** `src/views/v1/[lang]/V1Sidebar.tsx:16-26`; opener/state in
`src/views/v1/[lang]/V1Shell.tsx:83-99,160-177`; toggle in
`V1Header.tsx:28-34`.

**What's wrong:** The closed sidebar is only *visually* hidden —
`sidebarOpen ? "translate-x-0" : "-translate-x-full"` on mobile (`:21`) and
`md:w-0 md:overflow-hidden md:opacity-0` on desktop (`:25`). It is never
`hidden`, `inert`, or `aria-hidden`, so all its nav links + the sign-in
button (`:44-49`) remain in the tab order and the accessibility tree while
off-screen. A keyboard user tabbing out of the header lands on invisible,
off-screen links with no visible focus. Additionally: the open drawer has
**no focus trap**, **no Escape-to-close** (only edge-swipe/drag/backdrop-
click, `V1Shell.tsx:95-131`), and **no focus return** to the toggle on
close. This is the app's primary navigation, so it affects every keyboard/SR
user on every page.

**How to fix:** Six coordinated changes across `V1Sidebar.tsx`,
`V1Shell.tsx`, and `V1Header.tsx` — the open/close state already lives in
`V1Shell` (`sidebarOpen`/`setSidebarOpen`, `V1Shell.tsx:83`, with
`open`/`close`/`toggle` callbacks already memoized at `:91-93`), so route
every new behavior through that existing state rather than duplicating it:

1. **`inert` when closed** — add the DOM attribute to `V1Sidebar.tsx`'s
   root `<aside>` (currently `:16-27`, only CSS transforms). React 19
   supports `inert` as a plain boolean prop:
   ```tsx
   <aside
     ref={ref}
     id="v1-sidebar"
     inert={!sidebarOpen}
     className={cn(/* unchanged */)}
   >
   ```
   This alone fixes the worse half of the bug — `inert` drops the whole
   subtree from both the tab order and the accessibility tree regardless
   of the `-translate-x-full`/`md:w-0` transform, so it can ship
   independently of steps 2-4 below if you want to land it first.
2. **Escape-to-close** — mirror the pattern already hand-rolled in
   `components/ui/popover/popover-content.tsx:107-127`, simplified (the
   sidebar has no nested portaled overlay to defer to, unlike the
   popover). Add next to `V1Shell.tsx`'s existing drag-handling
   `useEffect` (`:101-131`):
   ```tsx
   useEffect(() => {
     if (!sidebarOpen) return;
     const onKeyDown = (e: KeyboardEvent) => {
       if (e.key !== "Escape") return;
       close();
       toggleRef.current?.focus();
     };
     document.addEventListener("keydown", onKeyDown);
     return () => document.removeEventListener("keydown", onKeyDown);
   }, [sidebarOpen, close]);
   ```
3. **Focus return on every dismissal path, not just Escape** — the ref
   used above doesn't exist yet: add `const toggleRef =
   useRef<HTMLButtonElement>(null);` in `V1Shell`, thread it down as a new
   prop to `V1Header` (extend `V1HeaderProps`), and attach it to the
   hamburger `<button>` at `V1Header.tsx:28`. Then call
   `toggleRef.current?.focus()` from the two *other* existing dismissal
   paths too, so behavior is consistent everywhere: the backdrop-click
   handler (`V1Shell.tsx:165`, currently a bare `onClick={close}`) and
   `dragOnEnd`'s `close()` call (`V1Shell.tsx:58-66`, the swipe-to-close
   path).
4. **Focus trap while open — mobile only.** Desktop's `md:static` sidebar
   sits in normal document flow (`V1Sidebar.tsx:22`), not a modal overlay,
   so it must not trap. Gate the trap on the same `isTouch` flag
   `V1Shell.tsx:82` already computes: when `sidebarOpen` transitions true
   on touch, move focus to the sidebar's first nav link
   (`sidebarRef.current?.querySelector('a, button')?.focus()` in a new
   effect keyed on `sidebarOpen`), and cycle Tab/Shift+Tab between the
   sidebar's first and last focusable element while it's open. This step
   is more involved than 1-3; if you want to ship incrementally, `inert` +
   Escape + focus-return already close the worse defect (off-screen tab
   stops) and the trap can follow separately.
5. **`aria-expanded`/`aria-controls` on the toggle** —
   `V1Header.tsx:28-34` needs both the new ref from step 3 and the
   `sidebarOpen` value (not currently passed to `V1Header` — add it to
   `V1HeaderProps` alongside `toggle`):
   ```tsx
   <button
     ref={toggleRef}
     onClick={toggle}
     aria-expanded={sidebarOpen}
     aria-controls="v1-sidebar"
     className="text-muted hover:bg-surface-hover ml-3 rounded-lg p-1.5"
     aria-label={t.toggleSidebar}
   >
   ```
   (matches the `id="v1-sidebar"` added to the `<aside>` in step 1).
6. **Verify with keyboard only, then lock it in with a test:** open via
   the hamburger, confirm focus lands inside the sidebar, Tab through it,
   press Escape, confirm focus returns to the hamburger and nothing
   off-screen is reachable via further Tabs. Encode as a Playwright spec —
   `page.keyboard.press("Escape")` then `await
   expect(page.getByRole("button", { name: t.toggleSidebar
   })).toBeFocused()` — so this doesn't silently regress the next time the
   shell is touched.

---

### [P1] Hardcoded English strings bypass i18n in real user surfaces (untranslated & off-theme)
**Where:** `src/views/settings/sessions/FreePageView.tsx:95,100,102,111,115,155`;
`src/views/messages/ChatView.tsx:37,46`.

**What's wrong:** Unlike every sibling settings page (fully i18n'd via
`useMessages`) and unlike the load-error path in the same `ChatView` file
(`:140` correctly uses `t.failedToLoad`), these user-facing strings are
hardcoded English that never reach `messages/tr/**`, so Turkish users see
English. In the messaging send path: `ChatView.tsx:37`
`setMessageError(… ?? "Invalid message")` and `:46`
`setMessageError("Failed to send message. Try again.")`. In sessions, a raw
color rides along too:
- `:95` `<h2 className="text-brand text-sm font-semibold">Sessions & Devices</h2>`
- `:100` `className="text-xs text-red-600 … hover:text-red-700"` (raw
  palette)
- `:102` `Log out all other sessions`
- `:111` `Loading sessions...`  `:115` `No active sessions found.`
- `:155` `"Unknown device"`

Turkish users see English; the raw `text-red-600` ignores `--error`. (The
page is *partly* wired — `:88` uses `t.signInToManageSessions` — making the
gap look like an unfinished migration rather than intent.)

**How to fix:**
1. Add the 6 missing keys to `messages/en`'s `settings` namespace and the
   matching `messages/tr` file — e.g. `sessionsTitle`,
   `logOutAllOtherSessions`, `loadingSessions`, `noActiveSessions`,
   `unknownDevice`. The file already calls `useMessages` successfully for
   `t.signInToManageSessions` at `:88`, so the provider/namespace wiring
   is already correct — this is purely "add keys, then reference them,"
   not new plumbing.
2. Swap each literal for its key: `:95` `{t.sessionsTitle}`, `:102`
   `{t.logOutAllOtherSessions}`, `:111` `{t.loadingSessions}`, `:115`
   `{t.noActiveSessions}`, `:155` `{t.unknownDevice}`.
3. Same pattern for `ChatView.tsx:37,46` — add `invalidMessage`/
   `failedToSendMessage`-style keys under the `messages` namespace
   `ChatView` already uses for `t.failedToLoad` (`:140`), then
   `setMessageError(t.invalidMessage)` / `setMessageError(t.failedToSendMessage)`.
4. Replace `FreePageView.tsx:100`'s `text-red-600 … hover:text-red-700`
   with `text-error hover:text-error`. Check `button-styles.ts` for an
   existing destructive/ghost variant before hand-styling — if one exists,
   replace the raw `<button>` with `<Button variant="ghost">` (or whatever
   the destructive variant is named) instead of just swapping the color
   class.
5. Run `pnpm generate-i18n-types` after adding keys (regenerates the typed
   `t.*` accessors) and `pnpm check-duplicate-messages` to confirm no
   collisions with existing keys.
6. Guard the pass: `grep -rn '"[A-Z][a-z].*[a-z]\."' src/views/settings
   src/views/messages` (quoted, capitalized, sentence-like literals) to
   catch any sibling hardcoded strings in the same files beyond the 8
   named here — don't assume the count above is exhaustive for these two
   files' immediate neighbors.

---

### [P1] Raw status-color maps bypass semantic tokens in data views
**Where:** `src/views/admin/audit-logs/PageContent.tsx:17-24`
(`LEVEL_COLORS`); `src/views/forms/PageContent.tsx:10-14` (category badge
map); `src/views/admin/PageContent.tsx:68-69` (active/blocked status);
`src/views/(demos)/form/Form.tsx:65,73` (success/error banners).

**What's wrong:** These build status coloring from raw palette + `dark:`
pairs, e.g. audit-logs: `ERROR: "bg-red-100 text-red-700 dark:bg-red-900/30
dark:text-red-400"`, `WARN: "bg-yellow-100 …"`, `INFO: "bg-blue-100 …"`. The
design system has dedicated `--success/--warning/--error/--info` tokens and
the V0 design language in `globals.css:391-401` **explicitly forbids** this
("hardcoded palette (red-500, green-200, amber-*) is forbidden", "Status
tinting (soft): `bg-<status>/10 border-<status>/30 text-<status>`").
Because `.dark` is applied for shiny/glass/neon/gradient too, a
`bg-blue-100 dark:bg-blue-900/30` INFO badge renders off-palette on the
cyan-neon and purple-gradient themes.

**How to fix:**
1. Check `CSS-IMPROVEMENTS.md:267-270`'s claim first — confirm whether
   `Badge` already ships an `error|warning|info|success` variant today by
   reading `src/components/ui/badge/*` directly, rather than trusting the
   doc citation (this same document found `CSS-IMPROVEMENTS.md` materially
   stale elsewhere — see the DESIGN_GUIDE finding below — so verify, don't
   assume).
2. If it exists: replace each of the 4 hand-rolled maps
   (`audit-logs/PageContent.tsx:17-24`, `forms/PageContent.tsx:10-14`,
   `admin/PageContent.tsx:68-69`, `(demos)/form/Form.tsx:65,73`) with
   `<Badge variant={...}>`, using a small local lookup object per view
   that maps each source-specific enum (`ERROR|WARN|INFO|DEBUG`,
   `active|blocked`, category names, success/error) to the badge's 4
   variants — the point is the *color* now comes from the shared
   component, the per-view lookup just does enum→variant naming.
3. If `Badge` doesn't yet support status variants: add them once in its
   variant map using the exact soft-tint recipe `globals.css:391-401`
   specifies — `bg-error/10 text-error`, `bg-warning/10 text-warning`,
   `bg-info/10 text-info`, plus a neutral `bg-surface text-muted` for
   DEBUG/TRACE — then do step 2.
4. Delete the 4 local `*_COLORS`/category maps entirely once migrated —
   don't leave them as unused dead code a future edit might resurrect by
   copy-paste.
5. Land the ESLint restriction from the "`<StatusBadge>` + `<PageHeader>` +
   `<EmptyState>`" enhancement below (forbidding raw palette classes under
   `src/views/**`) right after this fix, so a 5th hand-rolled map can't
   quietly reappear.

---

### [P1] App shell has no `<main>` landmark, no skip-link, and most pages have no `<h1>`
**Where:** `src/views/v1/[lang]/V1Shell.tsx:179-183` (content region);
whole-repo: only **5** view files contain an `<h1>` (`grep -rln '<h1'
src/views` → plans, checkout, typography-demo, content-editor, post-detail).
Settings pages start at `<h2>` (`account:179`, `billing:179`, `general:155`,
`privacy:45`, `sessions:95`).

**What's wrong:** Primary content is wrapped in a bare `<section
className="surface …">` with no `role="main"`/`<main>` and no accessible
name, so screen-reader landmark navigation has no "main" target. There is no
skip-to-content link anywhere (`grep -rn skip` → none). And because the
shell provides no page `<h1>` and almost no page supplies one, heading order
on most pages effectively begins at `<h2>` — a WCAG 1.3.1 / 2.4.6 hierarchy
gap on the whole app.

**How to fix:**
1. `V1Shell.tsx:180`: change the tag from `<section className="surface
   flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 @sm:p-5">` to
   `<main id="main-content" className="...">` — same classes, just the
   semantic element; `<main>` is an automatic landmark, no `role="main"`
   needed on top of it.
2. Add a skip link as the first child inside `V1Shell`'s outermost `<div
   className="flex h-dvh flex-col">` (`:148`), before `<V1Header>`:
   ```tsx
   <a
     href="#main-content"
     className="bg-brand text-brand-fg sr-only rounded-md px-3 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100]"
   >
     {t.skipToContent}
   </a>
   ```
   (add `skipToContent` to the `v1-shell` messages namespace `V1Shell`
   already reads via `useMessages` at `:79`; note the `text-brand-fg`
   token here, not `text-white` — don't reintroduce the contrast bug from
   the finding above while fixing this one).
3. Build `<PageHeader title description actions>` as a new shared
   component under `src/components/ui/page-header/` (following this
   repo's existing `src/components/ui/<name>/<name>.tsx` folder
   convention), rendering `<h1 className="text-xl font-bold">` +
   `{description && <p className="text-muted text-sm">{description}</p>}`
   + an optional `actions` slot for page-level buttons.
4. Roll it out to the 5 settings sub-pages first (`account:179`,
   `billing:179`, `general:155`, `privacy:45`, `sessions:95` — all
   currently start at `<h2>` and share an almost-identical header shape
   today, making the swap mechanical), then extend to the rest of
   `src/views/**` opportunistically as pages are touched. A full one-shot
   sweep isn't required to close the WCAG landmark/heading gap itself —
   that's fixed by steps 1-2 alone — `<PageHeader>` rollout is the
   longer-tail consistency fix, and can land incrementally.
5. Verify with an automated pass, not just spot checks: `@axe-core/playwright`
   is already a devDependency — add (or extend an existing) e2e spec that
   runs axe against a handful of representative pages and asserts zero
   landmark/heading-order violations, so future pages can't quietly
   reintroduce the gap.

---

### [P1] Icon-only buttons across the app have no accessible name — `IconButton` primitive has 0% adoption
**Where:** `IconButton` (`src/components/ui/button/icon-button.tsx:24-25`,
which sets both `aria-label` and `title` from a required `label`) is used in
**0** real view files (`grep -rln IconButton src/views | grep -v /ui/` →
none). Instead 26 view files hand-roll raw `<button>` (`grep -rl '<button'
src/views | grep -v /ui/` → 26; top: `posts/[uuid]/PostDetailBaseView.tsx`,
`notification/FreePageView.tsx`, `forms/editable-table/PageContent.tsx`,
`chat-room/ChatRoomBaseView.tsx`, `v1/[lang]/MessageDropdown.tsx`).
`project-enhance-4.md` already recorded the forms gallery's icon buttons at
**zero** `aria-label`; this confirms it is app-wide, not gallery-local.

**What's wrong:** Icon-only controls (row duplicate/move/delete, chip-remove
`×`, dropdown triggers, message actions) expose no accessible name to
screen readers and, where they rely on `title`, nothing on touch. A
perfectly good accessible primitive that *forces* a label exists and is
simply never reached for.

**How to fix:**
1. `IconButton`'s actual signature (`icon-button.tsx:10-19`) is `{ icon,
   label, variant, size = "icon", className, loading, disabled, ...props
   }`, forwarding any remaining native button props (`onClick`, etc.) via
   `...props` — migration is close to a mechanical prop rename in most
   cases: `<button onClick={fn} className="..."><IconX /></button>`
   becomes `<IconButton icon={<IconX />} label={t.someLabel}
   onClick={fn} />`, dropping the hand-rolled className entirely (the
   component already supplies focus ring, `disabled:opacity-50`, and
   `active:translate-y-px`).
2. Work through the 26 files by call-site count, highest first:
   `posts/[uuid]/PostDetailBaseView.tsx`, `notification/FreePageView.tsx`,
   `forms/editable-table/PageContent.tsx`, `chat-room/ChatRoomBaseView.tsx`,
   `v1/[lang]/MessageDropdown.tsx`, then the remaining 21
   (`grep -rl '<button' src/views | grep -v /ui/` for the current full
   list).
3. Every migrated site needs a real, specific `label` string — resist
   passing `label=""` or a generic `"Action"` just to satisfy the type,
   since that would satisfy the linter without fixing the actual
   accessibility gap. Source it from the view's existing
   `useMessages(...)` namespace where possible; add new i18n keys (both
   `en`/`tr`) for icon buttons without obvious existing copy (e.g.
   `deleteRow`, `moveRowUp`, `moveRowDown`, `removeChip`).
4. Where a site currently sizes the icon itself (`size={16}` etc. on the
   icon element, not the button), keep that as-is — `IconButton` doesn't
   resize the icon you pass it, it only wraps it consistently; only the
   outer `<button>` → `<IconButton>` changes.
5. After migrating, run an axe pass (per the `<main>`-landmark fix above)
   against the pages with the highest icon-button density first
   (`editable-table`, `chat-room`) to catch anything the manual review
   missed.
6. Track completion via `grep -rl '<button' src/views | grep -v /ui/`
   returning only genuinely non-icon-only `<button>`s (ones with visible
   text content) — use that as the check rather than a fixed count, since
   new views may add hand-rolled buttons before the migration finishes.

---

### [P2] Primary/async actions bypass `Button`, losing the loading + `aria-busy` affordance
**Where:** raw brand CTAs at `find-friends/FreeFindFriendsContent.tsx:111-119`
(`await sendRequest` with no loading state), `settings/sessions/FreePageView.tsx:98-104`,
`feed/FreeFeedList.tsx:219-224` (`<Link>`), `v1/[lang]/V1Header.tsx:67-72`
(`<a>`). Note `Button loading` *is* adopted in some views (`settings/*`,
parts of `find-friends/*`) — so the pattern is inconsistent, not absent.

**What's wrong:** `Button` provides `loading`→`Spinner` + `disabled` +
`aria-busy` (`button.tsx:50,71-72,109-113`). Hand-rolled async buttons show
no spinner and stay clickable during the request (double-submit risk on
"Add friend" / "Revoke"), and drop the `ring-offset` focus ring and
`active:translate-y-px`.

**How to fix:**
1. `Button`'s `loading` prop (`button.tsx:50,71-72`: `disabled: disabled
   || loading` and `"aria-busy": loading || undefined` are wired at the
   shared-props level, and it renders a `Spinner` in place of `children`
   when loading) already does exactly what these call sites need — this
   is a drop-in swap, not new component work.
2. `find-friends/FreeFindFriendsContent.tsx:111-119`: wrap the existing
   `await sendRequest` handler in local pending state (a `useState<boolean>`
   per row/target, or a `Set` of in-flight target IDs if concurrent
   requests to different targets are possible), set it before the `await`
   and clear it in a `finally`, then render `<Button variant="primary"
   loading={isPending} onClick={handleSend}>`.
3. `settings/sessions/FreePageView.tsx:98-104` gets the same treatment.
   `feed/FreeFeedList.tsx:219-224` is currently a `<Link>`, not a button —
   first confirm whether this action is pure navigation (in which case
   `Button`'s `loading` doesn't apply, leave it a link) or fires a
   mutation before navigating (in which case it needs the same
   `isPending` treatment, not just a class change). `v1/[lang]/V1Header.tsx:67-72`
   is already being converted to `<Button asChild>` as part of the
   `text-white` fix above — do both edits in the same pass since they're
   the same call site.
4. Verify the double-submit risk is actually closed, not just visually
   hidden: click each action twice in rapid succession before and after
   the fix and confirm only one request fires — `disabled` deriving from
   `loading` should make the second click a no-op.

### [P2] Empty / loading / error states are hand-rolled and inconsistent; the `Empty` component is unused by real data views
**Where:** `src/components/ui/empty/empty.tsx` (a polished component:
icon/title/description/action) is used in only 3 views, 2 of them demos
(`grep -rln Empty src/views` → settings/billing, ui/empty, ui/pagination).
Real data views each hand-roll:
- Feed: `FreeFeedList.tsx:216-226` — `text-muted text-sm`, `py-12`, **no
  icon**, CTA is a raw `<Link className="bg-brand … text-white">` (not
  `Button`).
- Notification: `FreePageView.tsx:150-160` — `IconBell` + `text-muted
  text-xs`, `py-16`, no description; loading = `SkeletonMessage` (good).
- Friends: `FreeFindFriendsContent.tsx:88-92,141-144` — bare `<p
  className="text-muted py-8 text-center text-sm">`, no icon/action.
- Sessions: `FreePageView.tsx:111,115` — centered plain text, hardcoded
  English.
- Messages sidebar / chat: `MessagesSidebar.tsx:184-186`,
  `ChatView.tsx:143` — yet another bespoke empty layout.

**Error** states are the least consistent of the three: `ChatView.tsx:138-140`
renders load failure as a bare `<p className="text-error text-sm">` with
**no retry affordance**; `feed/FreeFeedList.tsx` surfaces no visible error
branch at all; meanwhile a polished `features/statics/error/ErrorPage.tsx`
exists but is only used at route level, never inline in a list view.

**What's wrong:** 5+ data views = 5 different empty layouts (icon/no-icon,
`text-xs`/`text-sm`/`text-[10px]`, `py-8`/`py-12`/`py-16`), inconsistent
loading (skeleton in notifications, plain `text-[10px]` in feed, plain text
in sessions), and inconsistent error (token text with no retry vs nothing).
The design system's own `Empty` + `skeleton-shapes` + `ErrorPage` are all
bypassed, and CTAs are hand-rolled.

**How to fix:**
1. `Empty`'s real signature (`empty.tsx:5-15`) is `{ icon, title,
   description, action, ...fontProps }`, rendering `py-12` spacing by
   default (`:24`) — every hand-rolled empty state
   (`FreeFeedList.tsx:216-226`, `notification/FreePageView.tsx:150-160`,
   `FreeFindFriendsContent.tsx:88-92,141-144`,
   `settings/sessions/FreePageView.tsx:111,115`,
   `MessagesSidebar.tsx:184-186`, `ChatView.tsx:143`) maps onto it
   directly: `icon` = a Tabler icon each view can import (feed and
   sessions currently have none — pick one, e.g. `IconInbox`/`IconUsers`),
   `title`/`description` = the existing copy (route through i18n where
   the hardcoded-English finding above applies), `action` = the existing
   CTA re-wrapped in `<Button variant="primary">`.
2. For loading, standardize on this repo's `skeleton-shapes` helpers —
   check `src/components/ui/skeleton/` for its sibling shapes (list-row,
   card, avatar-line, etc.) and pick the closest match per view, replacing
   the ad hoc `text-[10px]`/plain-text loading states currently in feed
   and sessions. `notification/FreePageView.tsx`'s existing
   `SkeletonMessage` usage is the reference to copy from.
3. Build the missing piece: extract a small `<ErrorState message onRetry>`
   from `features/statics/error/ErrorPage.tsx`'s existing markup/icon
   choice (reuse the visual language, just make it inline-sized instead of
   full-page) — icon + message + `<Button variant="secondary"
   onClick={onRetry}>{t.retry}</Button>`. Wire `onRetry` to each view's
   existing TanStack Query `refetch()` from the query that produced the
   error.
4. Migrate view-by-view, not as one giant PR — each of the 6 named views
   is an independent, low-risk swap; land them individually so a
   regression in one doesn't block the rest.
5. Broaden the sweep beyond the 6 named views:
   `grep -rln 'text-muted.*text-center\|py-12\|py-16' src/views` to find
   any other hand-rolled empty/loading states this review's manual pass
   didn't catch, and migrate those too. Track completion by the `Empty`
   usage count in `grep -rln Empty src/views` rising to match the real
   number of list/data views in the app.

---

### [P2] Mobile keyboard hints missing: `inputMode` used once app-wide, zero `type="tel"`
**Where:** `grep -rln inputMode src` → **1** hit total. `grep -rhoE
'type="(tel|email|number|search|url)"'` → `email` ×10, `number` ×3, `url`
×2, **`tel` ×0**. `src/components/ui/input-otp/InputOTP.tsx` sets no
`inputMode`. Checkout phone (`project-enhance-4.md` scope) is a plain text
`TextField`.

**What's wrong:** Numeric/phone/OTP fields don't declare
`inputMode`/`type="tel"`, so mobile browsers show the default alphabetic
keyboard for phone numbers, OTP codes, quantities, and postal codes.
`type="number"` (×3) additionally brings the known spinner/scroll-to-change
UX issues; `inputMode="numeric"` on a text input is the current best
practice.

**How to fix:**
1. `InputOTP`: add `inputMode="numeric" autoComplete="one-time-code"` to
   each underlying `<input>` it renders — `autoComplete="one-time-code"`
   additionally enables SMS auto-fill suggestions on iOS/Android, not just
   the numeric keypad.
2. Thread an optional `inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]`
   prop through `features/forms/ui/TextField.tsx` down to the underlying
   `<Input>`, defaulting to `undefined` (no behavior change for existing
   callers). Set it explicitly to `"tel"` at the phone field call site(s)
   (`grep -rln 'phone' src/views` for the full list beyond checkout);
   consider adding `type="tel"` there too for the additional browser
   affordances beyond keyboard type.
3. `editable-table`'s quantity/unit-price cells (raw `<input>`s per the
   related `quantityHint`/`unitPriceHint` finding in `project-enhance-4.md`):
   add `inputMode="decimal"` directly, or `"numeric"` for quantity
   specifically if the field's Zod schema never allows a fractional
   value — check the schema's constraints to decide which.
4. Replace the 3 existing `type="number"` fields with `type="text"
   inputMode="decimal"` (or `"numeric"`), letting the existing Zod numeric
   validation do the real enforcement. `type="number"` still silently
   accepts scientific notation (`1e10`) and lets the browser's built-in
   spin-button UI misfire on scroll — both avoided by the
   text+inputMode+Zod combination, which is the current best practice for
   numeric web inputs.
5. Regression guard: `grep -rln 'type="number"' src/views src/components`
   should return zero hits once this lands — keep the grep handy for
   future PRs rather than relying on review alone to catch a reintroduced
   instance.

---

### [P2] `admin/audit-logs` uses a raw `<table>` instead of the design-system `Table`
**Where:** `src/views/admin/audit-logs/PageContent.tsx:154-155` (`<div
className="overflow-x-auto"><table className="w-full text-left
text-xs">`).

**What's wrong:** The shared `components/ui/table/table.tsx` already
provides the `overflow-auto rounded-lg border` wrapper (`:8`),
`border-border`, `hover:bg-surface-hover`, and `data-[state=selected]` row
styling. The audit-logs view re-implements a bare table, so this central
admin data view diverges from every other table's look and loses the DS
row/hover treatment. (It does wrap in `overflow-x-auto`, so it isn't a
viewport-break — hence P2 not P1.)

**How to fix:**
1. Confirm the exact sub-component names `components/ui/table/table.tsx`
   exports (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
   `TableCell` or similar) before writing the replacement, then map
   `audit-logs/PageContent.tsx:154-155`'s raw `<table
   className="w-full text-left text-xs"><thead>...<tbody>...` onto them
   1:1 — the existing column structure and data don't change, only the
   wrapping elements do.
2. Delete the raw version's own `overflow-x-auto` wrapper `<div>` once
   migrated — `table.tsx:8`'s `overflow-auto rounded-lg border` wrapper
   replaces it and additionally adds the rounded-corner/border treatment
   every other table in the app has but this one currently lacks.
3. If the audit-log rows use level-based row styling, that likely
   combines with the `LEVEL_COLORS` finding above (adjacent lines in the
   same file) — fix both in one pass, routing selected/level-based
   styling through the table's own `data-[state=selected]` convention
   instead of a bespoke class.
4. Visual-diff before/after in both light and one non-default theme (this
   is a visual-parity fix more than a logic change, so eyeballing the
   result matters more than for most findings in this document).

---

### [P2] `text-muted` on `bg-surface` is borderline-below AA in light theme
**Where:** tokens in `globals.css:23,26` (`--muted:#737373`,
`--surface:#f5f5f5`); pattern is pervasive (card meta/captions/`Empty`
description use `text-muted`, subtle panels use `bg-surface`). E.g.
`Empty.tsx:32` `text-muted` inside surfaces.

**What's wrong:** Computed contrast `#737373` on `#f5f5f5` ≈ **4.35:1**,
under the 4.5:1 AA threshold for normal-size text (it clears 4.5 on pure
`--bg` white ≈ 4.75:1, so it only fails on the surface tint). Muted-on-
surface is the most common secondary-text combo in the app, so this is a
broad low-contrast risk for small text.

**How to fix:**
1. Before picking a fix, run the `tailwind-theming` skill's bundled WCAG
   contrast script across *all 6* themes for every foreground-on-background
   token pair (`{fg, muted, muted-fg, brand-fg, success-fg, ...}` ×
   `{bg, surface, brand, success, warning, error, info}`) — this specific
   pair was found by manual spot-check, not an exhaustive pass, so it's
   very likely not the only failing combination.
2. For each failing pair, prefer fixing the *token* over patching
   individual call sites. Here specifically: `--muted` on `--surface`
   fails but `--muted` on `--bg` passes (≈4.75:1), so there are two valid
   approaches — darken `--muted` globally (simplest, affects every
   current `text-muted` usage uniformly, but changes contrast where it
   already passes too), or route surface-specific usages to the
   already-defined-but-unused `--muted-fg` (`#52525b`) token instead (more
   surgical). The second is less disruptive since the token already
   exists — reusing it is a config-only change instead of a color
   redefinition.
3. Apply the chosen fix once in `globals.css`'s light-theme token block,
   not per-call-site — `text-muted` is used pervasively (card meta,
   captions, `Empty` descriptions, subtle panels), so a token-level fix
   propagates everywhere at once, whereas swapping individual call sites
   to `text-muted-fg` would need touching each one.
4. Wire the "[Enhancement] Automated cross-theme contrast gate in CI"
   below immediately after, so the systematic pass from step 1 becomes a
   standing check instead of a one-time audit that can silently go stale
   again.

---

### [P2] Sidebar toggle disclosure not announced; icon-only header controls partially covered
**Where:** `src/views/v1/[lang]/V1Header.tsx:28-34` (toggle has
`aria-label` but no `aria-expanded`/`aria-controls`), `:36-41` (brand button
opens the sidebar).

**What's wrong:** The hamburger toggle exposes a label but never its
expanded/collapsed state or the element it controls, so SR users can't tell
the drawer's state. Separately, the brand/logo button (`:36`) triggers
`open()` — a logo that opens a nav drawer instead of navigating home is an
unexpected affordance and duplicates the adjacent hamburger.

**How to fix:**
1. The `aria-expanded`/`aria-controls`/`id="v1-sidebar"` wiring is the
   same change already specced as step 5 of the mobile-sidebar
   focus-trap fix above — implement both P1 findings in one pass through
   `V1Header.tsx`/`V1Sidebar.tsx`, don't duplicate the work across two
   separate edits.
2. `V1Header.tsx:36-41`'s brand button changes from `<button
   onClick={open}>` to a real navigation link:
   ```tsx
   <Link href={`/v1/${lang}`} className="flex h-full items-center gap-2 px-4">
     <div className="bg-brand flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-brand-fg">
       V
     </div>
     <span className="text-sm font-semibold">{t.brand}</span>
   </Link>
   ```
   (`lang` is already destructured from `V1HeaderProps` at `:21`, so no
   new prop plumbing needed — just swap the element and handler; note
   `text-brand-fg`, not `text-white`, applying the token fix from the
   `text-white` finding above at the same call site).
3. Confirm `/v1/${lang}` is genuinely this shell's home route before
   wiring the link — `V1Nav.tsx:46,85` resolves its own home entry
   (`{ href: "", label: t.navHome, ... }`) to the same `base = /v1/${lang}`,
   so this matches, but verify against the actual route tree rather than
   assuming.
4. After the change the hamburger becomes the sidebar's only trigger —
   search `V1Header`'s `open` prop for any other consumer before removing
   its use on the brand button, in case something else still expects it.

### [P2] Primary nav mixes developer/demo surfaces with real app features
**Where:** `src/views/v1/[lang]/V1Nav.tsx:46-62`.

**What's wrong:** The single flat nav list interleaves real end-user
features (feed, share, users, chat-room, messages, find-friends, premium,
settings) with boilerplate/demo surfaces: `/ui` (component gallery, `:60`),
`/forms` (forms gallery, `:61`), and `/boom` labeled **"Error Test"**
(`:62`, `t.navErrorTest`, `IconAlertTriangle`). Shipping an "Error Test"
link and two internal galleries in the top-level user navigation is an
IA/first-impression problem for any real deployment, and there's no
grouping/sectioning to separate "app" from "demos". (Separately, the
back/forward/swipe `PAGE_REGISTRY` in `lib/navigation/page-registry.ts:11-31`
only registers 3 routes — home + the two users pages — so swipe-back is
inconsistent across the rest of the app.)

**How to fix:**
1. `V1Nav.tsx:45-64`'s `links` array currently interleaves everything in
   one flat list. Split it into `appLinks` (home, feed, share, users,
   chat-room, messages, find-friends, premium, settings, plus the
   conditional admin links at `:67-80`) and `demoLinks` (`/ui`, `/forms`,
   `/boom`, `/missing`), then render `demoLinks` inside a collapsed
   `<Collapsible>` (already exists at `components/ui/collapsible/`) below
   the app links, defaulting closed and labeled e.g.
   `t.navBoilerplateDemos`. Pure render-order change, no new state beyond
   the collapsible's own open/closed toggle.
2. Drop `/boom` ("Error Test") from user-facing nav entirely, per the
   finding's own framing — it's a dev tool, not end-user-relevant even
   collapsed. If it needs to stay reachable for manual QA, gate it the
   way the backend's `app.module.ts` gates recipe modules behind
   `LOAD_DEMO_MODULES`/`NODE_ENV==='development'` (see §28 and its §31
   cross-stack note) — e.g. only push it into `links` under
   `process.env.NODE_ENV === "development"`, mirroring that existing
   convention instead of inventing a new gating mechanism.
3. `/ui` and `/forms` can stay in the demo group (genuinely useful as
   living documentation for contributors), but should also get `robots: {
   index: false }` / sitemap exclusion per the Next.js review's demo-surface
   finding — fix both together, since nav grouping here and SEO exclusion
   there are the same underlying "demos aren't differentiated from the
   real app" problem seen from two angles.
4. `lib/navigation/page-registry.ts:11-31`'s `PAGE_REGISTRY` — make the
   scope decision explicit rather than leaving it accidentally partial.
   Either extend it to register every route in the new `appLinks` group
   (so swipe-back/forward works app-wide, matching user expectation once
   the nav no longer looks like a demo showcase), or, if swipe-back was
   deliberately scoped to the users flow only, add a comment at the
   registry recording that decision so a future contributor doesn't
   "helpfully" register everything without knowing why it wasn't already
   done.

---

### [P3] `DESIGN_GUIDE.md` & `CSS-IMPROVEMENTS.md` describe a theme architecture that does not exist
**Where:** `docs/frontend/DESIGN_GUIDE.md:9-38,105-144`;
`next-js-boilerplate/CSS-IMPROVEMENTS.md:58-160`; actual system
`src/app/globals.css:16-211`, `src/constants/theme.ts`, `src/hooks/useTheme.tsx`.

**What's wrong:** The docs are materially wrong about the live system:
- Both describe **`.theme-*` classes** and an **Ocean** and **Violet**
  theme. `grep -rn '\.theme-' src public` → **none**. The real system is a
  single `.style-*` axis of 6 themes (`light, dark, shiny, glass, neon,
  gradient`, `theme.ts`), and Ocean/Violet don't exist anywhere.
- `CSS-IMPROVEMENTS.md:67-97` "Add a new theme" tells you to write
  `.theme-mytheme` and `<html className="theme-mytheme">` — that would
  render **completely unstyled** (no `.theme-*` selector exists).
- `CSS-IMPROVEMENTS.md:102` claims the component-style axis is "an
  independent dimension from the color theme." It isn't: both are
  `.style-*` classes on the same `<html>`, and `useTheme.tsx:83-87` removes
  all and adds one — so you can't have "dark + glass"; picking glass
  replaces dark.
- DESIGN_GUIDE token hexes are stale: it lists light `--border:#e4e4e7`,
  `--surface:#fafafa`, `--muted:#71717a`; actual are `#d4d4d4`, `#f5f5f5`,
  `#737373` (`globals.css:23-27`). Dark `--bg` doc `#0a0a0a` vs actual
  `#000000`.
- DESIGN_GUIDE's entire "Color Conventions", "Dark Mode Pairing", "Sidebar
  Pattern", "Message Bubble" sections teach `bg-white dark:bg-zinc-900`,
  `text-blue-400`, `bg-zinc-100` — but the actual `ui/**` and `chat-room/`,
  `messages/` code uses semantic tokens and **zero** raw zinc/`dark:`
  (verified). The doc teaches the pattern the code deliberately abandoned.

**How to fix:**
1. **Decide (a) vs (b) first** — this is a product decision, not just a
   doc fix: either build the two-independent-axes `theme-*`/`style-*`
   split the docs already promise (same underlying work as the "make
   color-theme and component-style genuinely independent" enhancement
   below, just triggered from the docs side), or commit to the current
   single-axis reality and rewrite the docs to match it. Don't rewrite the
   docs to describe (b) if the team actually wants (a) — that just moves
   the drift instead of closing it.
2. Once decided, rewrite `DESIGN_GUIDE.md` §"Theming" (`:9-38`) and
   §"Color Conventions"/"Dark Mode Pairing" (`:103-144`) against the real
   `.style-*` list (`light, dark, shiny, glass, neon, gradient` from
   `src/constants/theme.ts`) — delete every Ocean/Violet reference, and
   replace the zinc/`dark:`-pairing guidance with the actual
   semantic-token convention (`bg-surface`, `text-fg`, `text-muted`, etc.)
   the real `ui/**` code follows.
3. Regenerate the token table from `globals.css:16-211` directly rather
   than hand-typing hex values again — a short script parsing the
   `@theme`/`:root` custom-property declarations into a markdown table
   makes this section self-updating and prevents the exact staleness this
   finding is about; worth building once, reusable for every future theme
   addition.
4. Fix `CSS-IMPROVEMENTS.md:67-97`'s "Add a new theme" instructions to
   match the real mechanism — test the corrected instructions by literally
   following them to add one throwaway theme locally before committing
   the doc change, so the doc is verified against real behavior, not
   re-guessed a second time.
5. Batch this with `AUTH.md`, `REALTIME.md`, and `docs/logging.md`'s drift
   points (§16 and §27's doc-drift findings) into one documentation-truth
   pass per §32 Phase E, rather than fixing this file in isolation — the
   root cause (no doc is contract-tested against the code it describes)
   is shared across all four, so fixing the process once (even just "add
   a doc-review checklist item to the PR template") is worth more than
   fixing four files independently. (See §31 — one of four independent
   doc-drift findings across all three review parts.)

### [P3] `command-item` renders an unused `data-selected="false"` attribute
**Where:** `src/components/ui/command/command-item.tsx:63`.

**What's wrong:** `data-selected={isSelected}` always renders the attribute
(`"true"`/`"false"`). No CSS selector reads `data-selected` (selected
styling is done via the JS `isSelected && "bg-surface"` at `:57` and
`aria-selected` at `:62`), so it's harmless today — but it's the exact shape
of the presence-selector bug class flagged in §4, a trap if anyone later
adds a `data-[selected]:` variant.

**How to fix:** Guard it rather than deleting it outright:
`data-selected={isSelected ? "" : undefined}` at `command-item.tsx:63`,
matching the exact guarded shape `data-disabled` already uses one line
below it (`:64`). Guarding — instead of removing the attribute entirely —
keeps the DOM hook available for a future `data-[selected]:` Tailwind
variant to be added safely later, which is presumably why it was written
in the first place; deleting it would remove the option rather than fix
the bug class it currently risks.

### [P3] `Breadcrumb` component is orphaned; deep pages give no location cue
**Where:** `src/components/ui/breadcrumb/` exists; `grep -rln Breadcrumb
src/views` outside its own demo → **none**.

**What's wrong:** Multi-level destinations (`settings/*`,
`admin/audit-logs`, `users/detail`, `posts/[uuid]`) render no breadcrumb, so
users have no "where am I / go up one level" affordance. A polished
component sits unused.

**How to fix:**
1. Check `components/ui/breadcrumb/`'s actual props (likely an array of
   `{label, href}` crumbs) before wiring call sites.
2. Derive the crumb array from existing route metadata rather than
   hand-building one per page, if `lib/navigation/` has anything reusable
   (`page-registry.ts` registers some route info per the swipe-back
   finding above — check whether it's reusable here, or whether a small
   new `ROUTE_LABELS` map keyed by path segment is simpler for the
   handful of pages that need this).
3. Fold breadcrumb rendering into the `<PageHeader>` component from the
   "app shell has no `<main>` landmark" fix above rather than integrating
   it separately per page — both are "top of page, above the content"
   concerns being introduced to the same page set (`settings/*`,
   `admin/*`, `users/detail`, `posts/[uuid]`), so one combined component
   means each page adds one new header, not two separate pieces.
4. Ship on the settings sub-pages first (same rollout order as
   `<PageHeader>`, for the same reason — most uniform existing shape),
   then admin/users/posts.

### [P3] Minor consistency residue
**Where / What:**
- `disabled:opacity-30` outlier — 1 site vs 24 `disabled:opacity-50`
  (`grep -rhoE 'disabled:opacity-[0-9]+' src/components/ui`). Pick one (V0
  says 50, `globals.css:389`). `DESIGN_GUIDE.md:285` documents
  `opacity-40`, which the code never uses — stale.
- Two live "design languages" coexist: `DESIGN_GUIDE.md`'s zinc/`dark:`
  pairing vs the `globals.css:365-402` V0 tokens-only language. New code
  follows V0; docs teach the old one. (Same root as the DESIGN_GUIDE
  finding above.)

**How to fix:** `grep -rn 'disabled:opacity-30' src/components/ui` to find
the one outlier site and change it to `disabled:opacity-50`, matching the
other 24 sites and the V0 spec at `globals.css:389`. Leave
`DESIGN_GUIDE.md:285`'s stale `opacity-40` reference for the broader
DESIGN_GUIDE rewrite above rather than editing it separately here — no
need to touch the same doc twice in two different findings.

## 7. UI/UX enhancements

### [Enhancement] Ship an icon-size scale token set
**Why:** `grep -rhoE 'size=\{[0-9]+\}' src/views` shows 7 ad-hoc icon sizes
(12/14/16/18/20/24/32) chosen per-call. There's a typography scale and a
spacing scale in `globals.css` but no icon-size scale, so icon rhythm
drifts view-to-view.

**How:**
1. Add the 4-step scale as CSS custom properties in `globals.css`'s
   `@theme` block, paired to the existing typography scale (e.g. `xs`↔the
   smallest text size, up to `lg`↔`text-lg`) so icon and text sizing stay
   visually proportional wherever they sit adjacent (nav items, button
   icons, list-row leading icons).
2. Build a thin `<Icon size="xs"|"sm"|"md"|"lg">` wrapper resolving to the
   numeric pixel value Tabler's `size` prop expects
   (`@tabler/icons-react` icons take a plain number) — a pass-through
   component, not a new icon set. Existing `<IconX />` usages become
   `<Icon as={IconX} size="md" />` or whatever shape best matches this
   repo's existing wrapper-component conventions.
3. Retrofit the views the 7-ad-hoc-sizes grep turned up first (highest
   visible drift), then make the wrapper the required path for new icon
   usage going forward — an ESLint rule forbidding a bare numeric
   `size={n}` on `@tabler/icons-react` imports outside the wrapper itself
   makes this durable instead of a one-time cleanup that drifts again.

### [Enhancement] One overlay foundation (or a documented decision matrix)
**Why:** The app ships four overlay engines: native `<dialog>`
(`dialog/dialog-content.tsx:91`), Radix (`sheet/sheet.tsx`,
`alert-dialog`), Vaul (`drawer/drawer.tsx`), and hand-rolled
(`popover/popover-content.tsx`), plus the fully bespoke shell sidebar
(§6). Each is individually fine, but focus-trap / Escape / focus-return /
animation semantics differ subtly, and the shell drawer got none of them.

**How:**
1. Extract `popover-content.tsx`'s existing Escape-handling (`:107-127`)
   and outside-click-handling (`:82-105`) `useEffect`s into a standalone
   `useDismissable({ open, onClose, contentRef, triggerRef })` hook under
   `src/hooks/`. Keep the popover's own handling of nested portaled layers
   (`data-portal-layer`, deferring Escape/outside-click to the innermost
   open layer) rather than simplifying it away — dialogs opened from
   within a popover, or vice versa, will hit that exact case.
2. Add a companion `useFocusTrap(containerRef, active)` hook (cycling
   Tab/Shift+Tab between the first/last focusable descendant while
   `active`) — nothing like this exists yet per this review, and the
   mobile-sidebar fix above needs exactly it.
3. Migrate `popover-content.tsx` itself onto the two new hooks first —
   this proves the extraction is behavior-preserving (any existing
   popover tests should stay green unmodified), not a rewrite. Then apply
   `useDismissable` to `dialog-content.tsx`, `sheet.tsx`, `alert-dialog`,
   `drawer.tsx`, and the shell sidebar — this last one directly
   *implements* the mobile-sidebar Escape/focus-return fix specced above,
   rather than that fix hand-rolling a 5th independent Escape listener.
4. Write the "overlay decision matrix" as a short table in this repo's
   component-conventions reference (`components.md` or the
   `ui-components` skill) — columns: primitive name, backing engine
   (native `<dialog>` / Radix / Vaul / hand-rolled), when to reach for it
   — so the next contributor adding an overlay picks the right one
   instead of hand-rolling a 5th engine.

### [Enhancement] `<StatusBadge>` + `<PageHeader>` + `<EmptyState>` as enforced primitives
**Why:** The three biggest consistency bugs above (raw status colors,
missing h1s/inconsistent settings headers, hand-rolled empty states) all
stem from *missing a canonical component*, so every view improvises.

**How:** Items (1)-(3) are the same components already fully specced in
the "raw status-color maps" (§6), "app shell has no `<main>`" (§6), and
"empty/loading/error inconsistent" (§6) fixes above — build them as part
of doing those three fixes, not as a separate pass. This entry exists to
name the recurring pattern once (three different consistency bugs, one
missing-canonical-component root cause each), and to specify the one
net-new piece those three don't already cover: the ESLint rule. Add a
custom rule (or configure an existing Tailwind-lint plugin if one's
already a dependency) flagging `bg-(red|blue|green|yellow|zinc)-\d+` and
`text-(red|blue|green|yellow|zinc)-\d+` literals under `src/views/**` —
scope it repo-wide rather than excluding `src/components/ui/**` (which is
already clean, so the rule should simply never fire there today; excluding
it outright would let a future regression in `ui/**` pass silently). Land
the rule *after* the three raw-palette findings above are fixed, not
before — turning it on first would fail CI on pre-existing violations with
no clear migration path.

### [Enhancement] Make color-theme and component-style genuinely independent (deliver what the docs promise)
**Why:** `CSS-IMPROVEMENTS.md` sells "pick a color theme AND a visual style
independently," which is a real, attractive capability — currently
impossible because both are one `.style-*` axis. Users can't get "dark +
glass."

**How:**
1. This is a genuine architecture change, not a small patch — scope it as
   its own tracked unit of work (its own `docs/progress/phaseN.md` per
   this project's established convention) rather than folding it into a
   quick doc fix, given the blast radius below.
2. Split the single `.style-*` class `useTheme.tsx:83-87` currently
   manages into two independent class dimensions on `<html>`:
   `theme-{light|dark}` for color tokens (`--bg`, `--surface`, `--fg`,
   `--muted`, `--border`, `--brand`, `--brand-fg`, status tokens) and
   `style-{default|shiny|glass|neon|gradient}` for effect tokens only
   (whatever `--comp-*`-prefixed tokens exist for shadows/blurs/gradients
   specifically). This means splitting `globals.css`'s current per-theme
   blocks into their color-token and effect-token halves — the largest
   single piece of work here, since each block currently defines both
   together.
3. `useTheme.tsx:83-87`'s "remove all, add one" logic becomes two
   independent toggles ("remove all `theme-*`, add one" and "remove all
   `style-*`, add one"). `useTheme.tsx:88`'s `.dark` class addition
   (currently applied for every non-light theme) needs rethinking too,
   since "dark" becomes one of just two `theme-*` values rather than
   something inferred from which of 6 themes is active.
4. `public/scripts/theme-init.js` (the no-flash cookie-read-on-boot
   script) needs to read and apply two cookies instead of one, in the
   same synchronous pre-hydration pass, to avoid a flash on either
   dimension independently.
5. Regression risk: audit every existing `.style-*`-scoped CSS rule to
   confirm it lands in the correct half (color vs effect) — getting this
   wrong could make a combination like "dark + glass" render with broken
   contrast rather than just "not implemented." Budget real visual QA
   across all `theme × style` = 2×5 = 10 combinations once done, not just
   the 6 that exist today.
6. If, after scoping, the cost doesn't look worth it relative to the
   doc-only alternative — correcting the docs to describe the single-axis
   reality instead (option (b) in the DESIGN_GUIDE fix above) — that's a
   legitimate outcome. This entry exists so the decision gets made
   deliberately, not by default.

### [Enhancement] Automated cross-theme contrast gate in CI
**Why:** The `text-white`/brand and `text-muted`/`bg-surface` findings
above are both contrast bugs that a human can't feasibly re-check across 6
themes × N token pairs by eye.

**How:**
1. Locate the `tailwind-theming` skill's bundled contrast-checker script
   and confirm it can run headlessly against a list of hex pairs without
   needing a browser — if it's currently interactive/manual-invocation
   only, adjust that first, since a CI gate needs a non-interactive exit
   code.
2. Generate the full pair list programmatically from `globals.css` rather
   than hand-typing it: parse each `.style-*` block's custom-property
   declarations, build every `{text-token}`-on-`{background-token}`
   combination actually co-occurring in the codebase (grep for adjacent
   `text-\S+`/`bg-\S+` class pairs, or just the full cross-product if the
   token count is small), and run the contrast check for all 6 themes.
3. Add it as a new CI step in `frontend-ci.yml` that fails the build on
   any pair scoring below 4.5:1 for normal text / 3:1 for large text or
   UI components. Run it once against current `main` first to establish
   the starting failure list — the `text-white`/`bg-brand` and
   `text-muted`/`bg-surface` findings above are two known failures it
   should catch — fix those, *then* make the gate blocking, so it starts
   from a clean baseline instead of immediately red.
4. Document the script's invocation in `CSS-IMPROVEMENTS.md` (once
   rewritten per the DESIGN_GUIDE fix above) so future token additions
   have an obvious "run this before merging" step.

## 8. Top 10 — UI/UX

1. **[P1]** `text-white` on `bg-brand` (36 files) → replace with
   `text-brand-fg`; fixes failing contrast (~2.4:1 neon, ~3.0:1 dark) on the
   app's primary action color across 5 themes.
2. **[P1]** Icon-only buttons have no accessible name app-wide — migrate the
   26 raw-`<button>` view files to the existing `IconButton` (0% adopted
   today, despite forcing an `aria-label`).
3. **[P1]** Mobile sidebar drawer: `inert`/`hidden` when closed, add
   focus-trap + Escape + focus-return — the primary nav is currently a
   keyboard/SR trap.
4. **[P1]** Hardcoded English bypasses i18n in real surfaces —
   `settings/sessions` (6 strings + raw `text-red-600`) and
   `messages/ChatView` (send errors); route through `useMessages` +
   `text-error`.
5. **[P1]** Replace raw status-color maps (audit-logs, forms, admin) with
   semantic token soft-tints / a `StatusBadge` — off-palette on 4 themes,
   violates the documented V0 design language.
6. **[P1]** Add `<main>` landmark + skip-link to `V1Shell`, and a single
   `<h1>` per page (only 5 pages have one today).
7. **[P3→high-impact]** Rewrite `DESIGN_GUIDE.md` + `CSS-IMPROVEMENTS.md` to
   the real `.style-*` system; delete fictional Ocean/Violet and the
   non-functional "add a theme" instructions before the team executes
   against them.
8. **[P2]** Systematize empty/loading/error via existing `Empty` +
   `skeleton-shapes` + an inline `ErrorState` (5+ data views hand-roll 5
   different ones; error states have no retry), and route async actions
   through `<Button loading>` (no spinner/double-submit guard today).
9. **[P2]** Mobile keyboards: add `inputMode`/`type="tel"` to OTP, phone,
   numeric fields (`inputMode` appears exactly once app-wide).
10. **[P2/Enh]** `admin/audit-logs` → DS `Table`; ship
    `<PageHeader>`/`<StatusBadge>`, an ESLint raw-palette ban on
    `src/views/**`, and a CI contrast gate (catches the `text-white`/brand
    and `text-muted`/`bg-surface` ~4.35:1 cases above).

---

# PART II — Senior Next.js Developer Review

Scope: `next-js-boilerplate/` architecture, rendering/data patterns,
performance, testing, security, and code quality. Next 16.2.9 (App Router +
Turbopack), React 19.2.4, TypeScript strict, Tailwind v4, TanStack
Query/Form, Zod v4.

## 9. Executive read — what's already clean

This is a genuinely disciplined codebase. Several things this review was
briefed to re-check are now **clean/fixed and should not be re-audited**:

- **The BFF status-code bug class is fully eradicated.** Swept all 58
  `src/app/api/**/route.ts` files: every error-shaped `NextResponse.json(...)`
  body carries a matching `{ status }` (verified `status-args >= exc-bodies`
  in every route; catch-alls `proxy/[...path]`, `rest/[...path]`,
  `messages/[...path]`, `upload`, `gql` all pass `{ status: res.status }`).
  No recurrence of the phase-13-era bug.
- **Server-component discipline is total.** Zero `page.tsx`/`layout.tsx`
  contain `"use client"` (grepped all ~150). Error boundaries (`error.tsx`,
  `global-error.tsx`, `not-found.tsx`) all delegate to
  `@/features/statics`. Suspense fallbacks are all `null` or extracted
  `@/fallbacks` components. Prop types are all in `src/types/` (zero inline
  `*Props`). No `window.location.search` anywhere.
- **e2e silent-false-green is largely mitigated.** `e2e/setup.spec.ts` now
  probes `/api/auth/me` and re-authenticates on 401/staleness;
  `scripts/check-e2e-env.mjs` fails loudly if the backend is unreachable
  (unless `CI_NO_BACKEND=1`). This project's memory of "stale auth → mass
  skips exit 0" is **no longer accurate** as of this pass.
- **TanStack Query hygiene is good.** Query keys are hierarchical
  (`["feed","list",...]`, `["notifications","dm-count"]`), invalidations use
  correct prefixes, `staleTime` choices are sensible. React `cache()`
  request-memoization is correctly used (`auth-ssr.ts:14`
  `getSessionUser`, `dedup.ts:17`). React Compiler is genuinely enabled
  (`next.config.ts:10 reactCompiler:true`, eslint rule at `error`, exactly
  one documented bailout). Auth cookies are hardened (`cookie.ts:47-49`).

Net-new findings below focus on architectural drift, convention violations
the current tooling can't catch, and completeness gaps. All 12 brief
sections were exercised with file:line evidence; the cleanly-passing areas
above (plus Suspense/fallback extraction, prop-type placement, query-key
correctness, React Compiler enablement, `React.cache` memoization, cookie
hardening, server-only boundary, e2e re-auth) are recorded here so they
aren't re-audited next round.

## 10. P1 findings (Next.js)

### [P1] Frontend exception-code map has drifted from the backend enum (14 of 23 codes) with no parity guard
**Where:** `src/lib/exception-handler.ts:3-17` (the `ExceptionCode` union)
and `:28-43` (`EXC_TO_SURFACE`), vs backend
`nest-js-boilerplate/src/common/exceptions/exception-code.ts:1-24`.

**What's wrong:** The backend `ExceptionCode` type defines **23** codes; the
frontend mirror defines **14**. The 9 codes the frontend cannot represent or
surface-map: `EX_AUTH_ACCOUNT_INACTIVE`, `EX_AUTH_INVALID_TOKEN`,
`EX_AUTH_WEAK_PASSWORD`, `EX_AUTH_MFA_EXPIRED`, `EX_AUTH_MFA_NOT_ENABLED`,
`EX_AUTH_MFA_INVALID_CODE`, `EX_CONFLICT_FOREIGN_KEY`,
`EX_CONFLICT_RELATION`, `EX_INCONSISTENT_DATA`. This is the exact "known
exception-surfacing gap" `project-enhance-4.md` flagged (was 8 missing,
patched, now 9 missing again — it re-drifted). `getSurface()` (`:45-52`)
falls back to `"toast"` + `console.warn` for unknowns, so it's not a crash,
but codes that *should* be field-scoped resolve wrong: `EX_AUTH_WEAK_PASSWORD`
and `EX_AUTH_MFA_INVALID_CODE` should be `"form-field"` (surface under the
password / OTP input) but become a floating toast. The FE `ExceptionCode`
type literally cannot be passed to `clientException()` (`:79-89`) for those
9 codes. Blast radius today is limited (see next finding — auth flows
hand-roll and don't call `getSurface`), but the map is the *documented*
central error architecture and will mis-surface the moment those flows are
wired to it. **See also §31 — the backend itself has a matching internal
naming bug on `EX_AUTH_MFA_NOT_ENABLED`, found while cross-checking this.**

**How to fix:**
1. `EXC_TO_SURFACE` (`exception-handler.ts:28-43`) is already declared
   `satisfies Record<ExceptionCode, ExceptionSurface>` — the "can't forget
   a surface" safety net already exists structurally; the only missing
   piece is the union itself. Add the 9 codes to `ExceptionCode`
   (`:3-17`): `EX_AUTH_ACCOUNT_INACTIVE`, `EX_AUTH_INVALID_TOKEN`,
   `EX_AUTH_WEAK_PASSWORD`, `EX_AUTH_MFA_EXPIRED`,
   `EX_AUTH_MFA_NOT_ENABLED`, `EX_AUTH_MFA_INVALID_CODE`,
   `EX_CONFLICT_FOREIGN_KEY`, `EX_CONFLICT_RELATION`,
   `EX_INCONSISTENT_DATA`. The moment these land, `tsc` fails on
   `EXC_TO_SURFACE` until each has a matching entry — the compile error
   does the missing-surface enforcement for you.
2. Suggested surfaces, matching this file's existing precedent (`:29-42`):
   `EX_AUTH_WEAK_PASSWORD` → `"form-field"`, `EX_AUTH_MFA_INVALID_CODE` →
   `"form-field"`, `EX_AUTH_MFA_EXPIRED` → `"toast"` (matches
   `EX_AUTH_ACCOUNT_LOCKED`'s existing toast treatment for an
   auth-state-not-user-input problem), `EX_AUTH_MFA_NOT_ENABLED` →
   `"toast"`, `EX_AUTH_ACCOUNT_INACTIVE` → `"full-page"` (matches
   `EX_FORBIDDEN`/`EX_TIER_INSUFFICIENT`'s existing "you can't be here"
   precedent), `EX_AUTH_INVALID_TOKEN` → `"toast"`,
   `EX_CONFLICT_FOREIGN_KEY`/`EX_CONFLICT_RELATION` → `"toast"` (matching
   `EX_CONFLICT_DUPLICATE`), `EX_INCONSISTENT_DATA` → `"toast"`.
3. Don't hand-maintain this list going forward — either (a) generate
   `src/lib/exception-codes.generated.ts` from the backend enum via a
   small `tsx` script wired into `prebuild` (same mechanism as
   `generate-i18n-types`; see the matching Enhancement below for the exact
   shape), or (b) at minimum add a Vitest test asserting both unions'
   string-literal sets are equal — the cheapest guard if a generator is
   more than this pass wants to take on.
4. Sequencing: do this *after* the backend's own `EX_MFA_NOT_ENABLED`
   naming fix (§16) lands, not before — mirroring the codes today would
   faithfully copy that typo into this union too.
5. Once landed, spot-check `clientException()` (`:79-89`) — its default
   `key` derivation (`error.${exc.toLowerCase().replace(/^ex_/,
   "client_")}`) will auto-generate a plausible key for each new code even
   without an explicit `key` argument, but confirm each auto-derived key
   actually resolves to real copy in `messages/{en,tr}` before shipping,
   rather than assuming the fallback pattern alone is sufficient.

### [P1] Real-app view bypasses the documented two-layer API pattern (`apiFetch` called directly in a view)
**Where:** `src/views/messages/FreePageView.tsx:15` (`import { apiFetch }
from "@/lib/api-client"`) and `:62` (`await apiFetch(\`${USERS_SEARCH_PREFIX}?q=...\`,
{ signal })`), inside `debouncedUserSearch`.

**What's wrong:** `AGENTS.md` ("API calls to `src/api/` (two-layer
pattern)") states: *"Never call `apiFetch`, `apiFetchJson`, or raw `fetch`
directly in views, components, hooks, or lib files."* This is the messages
feature — real app, not a demo. The irony: `AGENTS.md` uses **this exact
call** (`searchUsers`) as its canonical *good* example, and the
server/client layers already exist (`src/api/server/users/search.ts`,
`src/api/client/users/search.ts` exporting `searchUsersQueryOptions`). The
view reimplements debounced search with a raw `apiFetch` instead of
consuming the ready-made query options.

**How to fix:**
1. `searchUsersQueryOptions(q, take, skip)` (`api/client/users/search.ts:6-15`)
   already exists, with `queryKey: ["users", "search", q, take, skip"]`
   and `enabled: q.trim().length >= 3` — note the 3-character minimum, vs
   the hand-rolled `debouncedUserSearch`'s `val.length < 1` threshold
   (`FreePageView.tsx:55-56`, effectively "search from 1 character"). This
   is a real behavioral difference, not just an implementation swap:
   decide deliberately whether to keep 1-char UX (add a `minLength` param
   to the shared query-options function) or accept the 3-char minimum
   going forward (arguably better UX — fewer noisy single-letter result
   flashes). Don't let this change silently as a refactor side effect.
2. Replace the manual `setTimeout` + `AbortController` in
   `debouncedUserSearch` (`:46-72`) with `useQuery(searchUsersQueryOptions(debouncedQuery,
   take, skip))`, where `debouncedQuery` is a locally-debounced version of
   the raw input (TanStack Query's own de-duplication and internal abort
   handling replace the hand-rolled abort logic; only the *debounce delay
   before the query key changes* needs to stay client-side — check
   `src/hooks/` for an existing `useDebouncedValue`-style hook before
   writing a new one).
3. Confirm `searchUsersQueryOptions`'s return shape
   (`UserSearchResult`, from `api/server/users/search.ts`) matches or can
   be mapped to the `UserInfo[]` shape `FreePageView.tsx:38-43` currently
   reads from `data.items`. Update the consumers at `:265,268`
   (`findResults`/`setFindResults`) to read from `useQuery`'s `data`
   instead of local state, dropping the `findResults` state entirely once
   the query owns it.
4. Delete `debouncedUserSearch` (`:46-72`), the `searchTimerRef`/
   `searchAbortRef` refs, and the direct `apiFetch`/`USERS_SEARCH_PREFIX`
   imports (`:14-15`) once nothing in the file references them —
   `grep -n apiFetch src/views/messages/FreePageView.tsx` returning
   nothing is the actual completion signal (the `AGENTS.md` rule is about
   the import existing at all in a view, not just this one call site).

### [P1] No app-wide Content-Security-Policy — CSP exists only on `/security/*`, and the stated reason for that is void
**Where:** `next.config.ts:16-34` (`headers()` sets HSTS,
X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
Permissions-Policy, COOP — but **no** `Content-Security-Policy`); CSP is set
*only* inside `src/proxy.ts:169-183`, gated to
`pathname.startsWith("/security")`.

**What's wrong:** Every route except `/security/*` ships with **no CSP at
all** (feed, messages, settings, checkout, auth — the entire real app). The
proxy comment (`:164-168`) justifies scoping: *"A fresh nonce per request
forces dynamic rendering, which is incompatible with the app-wide
`cacheComponents: true` (PPR)."* But `cacheComponents` is **not actually
enabled** (see §11 below, independently re-verified in §3) — so that
incompatibility doesn't exist today, and a nonce-based (or even static) CSP
could be applied app-wide right now. XSS defense-in-depth is absent on 100%
of the real product surface.

**How to fix:**
1. Add a `Content-Security-Policy` header inside `next.config.ts`'s
   existing `headers()` array (`:16-34`) — it already returns one object
   with `source: "/(.*)"` covering every route, so the new header joins
   the existing HSTS/X-Content-Type-Options/etc. list, no new `headers()`
   block needed:
   ```ts
   {
     key: "Content-Security-Policy",
     value:
       "default-src 'self'; object-src 'none'; base-uri 'self'; " +
       "frame-ancestors 'none'; img-src 'self' blob: data: <asset-host>; " +
       "connect-src 'self' <ws-host>; upgrade-insecure-requests",
   },
   ```
   (derive `<asset-host>`/`<ws-host>` from the same env vars
   `next.config.ts`'s `HOSTNAMES` and `RealtimeProvider`'s WS URL already
   read — don't hardcode a literal hostname, matching how the rest of
   this config avoids doing so).
2. `script-src`/`style-src` need care: a strict app-wide policy without
   `'unsafe-inline'` will break any inline script/style the app currently
   relies on outside `/security/*` — audit `next/script` usage app-wide
   and specifically the `theme-init.js` `beforeInteractive` script
   (`docs/frontend/STATUS.md` already documents its existence) before
   shipping a strict policy; start with `script-src 'self'` plus explicit
   allowances rather than guessing what's needed.
3. Leave `src/proxy.ts:169-183`'s existing per-request nonce CSP in place
   for `/security/*` — this fix is additive (a baseline everywhere), not
   a replacement for the stronger scoped policy that route already has.
4. Test by actually loading the app with the new header active and
   watching the browser console for CSP violation reports across every
   major flow (auth, feed, messages, checkout) — a policy that looks
   correct in review can still break a specific inline handler or
   third-party script tag in practice, so this needs a real browser pass.
5. If PPR (`cacheComponents`) is enabled later per the finding below,
   revisit with a per-request `'strict-dynamic'` nonce matching
   `/security/*`'s existing pattern, since nonce-based CSP is strictly
   stronger once dynamic rendering is available app-wide.

## 11. P2 findings (Next.js)

### [P2] `cacheComponents: true` (PPR) is cited as an active invariant across the codebase but is never set
**Where:** `next.config.ts:13-15` — `experimental` contains only
`hideLogsAfterAbort: true`. No `cacheComponents` / `ppr` key anywhere. Yet
it's cited as active in `src/proxy.ts:98-101`, `:114-116`, `:164-168`
(multiple design rationales), `src/app/security/csp/page.tsx:35`, and a
`(demos)/ppr` demo exists.

**What's wrong:** Several nontrivial architectural decisions — locale
404/redirect gating done in the proxy instead of via `notFound()` in the
page, CSP scoping — are documented as *necessary workarounds for
`cacheComponents`*. With the flag off, those rationales are stale/misleading
(the proxy approach still works, but for a reason that no longer holds), and
the `(demos)/ppr` page does **not** actually demonstrate partial
prerendering (PPR requires the flag). A future maintainer reading
`proxy.ts` will believe an invariant that isn't real.

**How to fix:**
1. This is the same intent decision the CSP fix above already forces —
   resolve both findings together, since enabling `cacheComponents`
   changes the correct answer for both.
2. If PPR is desired: add `experimental: { cacheComponents: true }` to
   `next.config.ts:13-15` (currently only `hideLogsAfterAbort: true`),
   then manually exercise `(demos)/ppr` and confirm it now actually shows
   a static shell with streamed dynamic holes rather than rendering fully
   dynamic as it does today. Re-test the locale-404/redirect gating
   (`proxy.ts:98-101,114-116`) and CSP nonce scoping (`:164-168`) under
   the flag — both were apparently *designed* for `cacheComponents` being
   on, so this may be the first time they've actually run with it
   enabled since being written.
3. If not desired: correct the 3 comment blocks in `proxy.ts`
   (`:98-101`, `:114-116`, `:164-168`) to drop the `cacheComponents`
   justification and state the real reason for the current approach
   (once the false pretext is removed, "simpler to centralize in the
   proxy" is likely the honest answer, and that's a fine reason on its
   own). Fix `csp/page.tsx:35` too. For `(demos)/ppr`: add a clear
   "not yet enabled" caveat via the existing `DemoBadge` pattern if it
   supports one, or rename/relabel the route so it stops claiming to
   demonstrate a feature it doesn't.
4. Either way, record the outcome in `docs/frontend/STATUS.md`'s "#25
   runtimes"/"#59 CSP" gotcha entries, so the next reader doesn't have to
   re-derive this same investigation.

### [P2] The central exception-surface system is only adopted by the Forms Gallery demo; the real auth flows hand-roll ad-hoc code checks
**Where:** `getSurface`/`exceptionHandler` are consumed only under
`src/views/forms/*` and `src/lib/forms/blur-async-check.ts`. The real auth
surfaces bypass it: `src/features/auth/ui/register-form.tsx:43-51` does `if
(exc === "EX_AUTH_EMAIL_TAKEN" || field === "email")`;
`src/features/auth/ui/login-form.tsx:62-67` reads `err.field`/`err.msg`
manually.

**What's wrong:** There are two parallel error-handling philosophies. The
documented, tested "surface router" (`exception-handler.ts`) is wired into
the demo/gallery, while production auth reimplements exception→field
mapping with hardcoded string-literal comparisons. This is why the P1
map-drift above has low current blast radius — but it also means the real
app gets none of the map's benefits (consistent toast/field/full-page
routing, i18n key resolution via `exceptionHandler`). New auth error codes
require editing ad-hoc `if` chains in each form.

**How to fix:**
1. `register-form.tsx`'s `handleRegisterSubmit` catch block (`:39-51`)
   currently does:
   ```ts
   const exc = (err as { exc?: string; field?: string; msg?: string }).exc;
   const field = (err as { field?: string }).field;
   const msg = (err as { msg?: string }).msg;
   if (exc === "EX_AUTH_EMAIL_TAKEN" || field === "email") {
     setFieldErrors({ email: msg ?? t.errors.emailTaken });
   } else if (field) { /* ... */ } else { /* ... */ }
   ```
   Replace the `exc === "EX_AUTH_EMAIL_TAKEN"` literal branch with
   `getSurface(exc)`: when it resolves `"form-field"`, use
   `field`/`exceptionHandler(err, t)` the same way
   `api-key/PageContent.tsx:111-119` already does; keep the existing
   `field`-present fallback for anything `EXC_TO_SURFACE` doesn't cover.
   This removes the hardcoded code literal, so future codes added by the
   P1 fix above benefit automatically instead of needing a new `if`
   branch each time.
2. `login-form.tsx`'s two catch blocks (the main login handler and
   `handleMfaSubmit`, both reading `err.field`/`err.msg` manually today)
   get the same treatment.
3. Sequencing: do this *after* the P1 exception-code-map fix lands (9 new
   codes + surfaces), not before — otherwise `getSurface` would fall back
   to `"toast"` for `EX_AUTH_WEAK_PASSWORD`/`EX_AUTH_MFA_INVALID_CODE` and
   this migration would look like a regression (losing today's ad hoc
   field-scoping for those two) until the P1 fix catches up.
4. Verify both flows manually post-migration: trigger an email-taken
   registration and an invalid-credentials login, confirm the error still
   lands on the right field/surface — this is a refactor of working code,
   so behavior parity is the bar, not just "it compiles."

### [P2] Hardcoded English strings in the login MFA challenge sub-form (real auth surface, i18n available)
**Where:** `src/features/auth/ui/login-form.tsx:115` (`setMfaError("Enter
your 6-digit code")`), `:132` (`msg ?? "Invalid MFA code"`), `:144-145`
(`Enter the 6-digit code from your authenticator app for {email}.`), `:195`
(`Use a different account`).

**What's wrong:** The component already calls `useMessages("auth")`
(`:75`) and the surrounding login form is fully i18n'd (`t.form.login.*`),
but the MFA sub-form — clearly bolted on later — hardcodes English for its
helper text, error fallbacks, and account-switch link. Violates `AGENTS.md`
("Never hardcode English strings … use i18n where `MessagesProvider` is
available"). Turkish users hit English mid-flow.

**How to fix:**
1. `t.form.login.mfaTitle` (already used correctly on the MFA `<h2>`)
   proves the `auth.form.login.*` namespace exists and is wired — the
   remaining hardcoded strings just need to join it:
   - `:115` `setMfaError("Enter your 6-digit code")` →
     `setMfaError(t.form.login.mfaEnterCode)`.
   - `:132` `msg ?? "Invalid MFA code"` → `msg ?? t.form.login.mfaInvalidCode`.
   - `:144-145` (`Enter the 6-digit code from your authenticator app
     for {email}.`) → add `t.form.login.mfaCodeSentTo` with a `{email}`
     placeholder and reuse this same file's existing `.replace("{email}",
     ...)` interpolation pattern (already used for `t.signedInAs` at
     `:97`), rather than introducing a second interpolation convention in
     the same file.
   - The "Use a different account" link → `t.form.login.mfaUseDifferentAccount`.
2. Add all 4 new keys (`mfaEnterCode`, `mfaInvalidCode`, `mfaCodeSentTo`,
   `mfaUseDifferentAccount`) to both `messages/en` and `messages/tr`
   under the same `auth.form.login` path `mfaTitle` already lives at.
3. Run `pnpm generate-i18n-types` so the new keys typecheck through
   `I18nMessages["auth"]`, then `pnpm check-duplicate-messages`.
4. Regression guard specific to this file:
   `grep -n '"[A-Z][a-z].*"' src/features/auth/ui/login-form.tsx`
   post-fix should return nothing inside the MFA block.

### [P2] Vitest coverage thresholds are configured but never enforced — CI runs `pnpm test`, not `test:coverage`
**Where:** `vitest.config.ts:21-26` sets thresholds (statements 60 /
branches 50 / functions 55 / lines 60); `.github/workflows/frontend-ci.yml:103-104`
runs `pnpm test` (= `vitest run`, no `--coverage`).

**What's wrong:** The thresholds are dead config — nothing runs coverage in
CI, so they can never fail a build. A regression that drops coverage under
60% passes green.

**How to fix:**
1. Simplest fix: change `frontend-ci.yml`'s "Unit tests" step from `pnpm
   test` to `pnpm test:coverage` — `@vitest/coverage-v8` is already a
   devDependency, so no new tooling install, only the CI command changes.
2. Before making it blocking, run `pnpm test:coverage` locally to see
   current real coverage against the configured thresholds (60/50/55/60)
   — since nothing has ever enforced them, it's plausible current
   coverage is already below one or more. If so, either close the gaps
   first or temporarily lower the threshold to measured reality and
   ratchet up over time, rather than landing an immediate blocking gate
   that turns CI red on unrelated PRs (the same "don't leave a floor over
   a number that can't pass" principle the backend's own coverage-config
   finding elsewhere in this document runs into — see §25/§26).
3. If CI runtime is a real concern, keep `pnpm test` as the fast blocking
   step and add `pnpm test:coverage` as a separate non-blocking
   report-only job — but in that case, delete or clearly comment
   `vitest.config.ts:21-26`'s `thresholds` block so it stops implying an
   enforcement that isn't real; a dead threshold config is itself
   misleading, independent of which CI shape gets chosen.

### [P2] Entire BFF layer (58 server fns + 58 route handlers) has zero unit tests — the exact locus of the historical status-code bug
**Where:** `src/api/server/**` (58 files) and `src/app/api/**/route.ts` (58
routes) — no `*.test.ts` under either tree (all 41 test files are under
`src/lib`, `src/components`, `src/validators`, `src/views/forms`).

**What's wrong:** The BFF routes contain the error-mapping logic
(`graphqlErrorBody`, `{ status: body.statusCode }`, CSRF gating in
`posts/[id]/route.ts:48-64`, `try/catch → 502` in the catch-alls) that
previously shipped the status-code bug across 5 of 7 routes. It's currently
correct, but there's no test locking that in; the next new route can
silently reintroduce it. Validators are also thin: `auth/schema.ts`,
`messages/schema.ts`, `events/schema.ts` have no dedicated tests (only
`validators/forms/__tests__/inits.test.ts` exists).

**How to fix:**
1. Don't attempt full coverage of all 58 routes in one pass — start with
   one parametrized test file covering the highest-risk group (auth,
   billing, api-keys, since those gate money/access), prove the pattern,
   then extend route-by-route as a standing practice for new routes
   rather than a one-time backfill.
2. Pattern per route: mock whatever it calls internally
   (`graphqlFetch`/`getAccessToken`/`apiFetch`) to return both a success
   response and each documented error shape the route's mapping logic
   handles, then assert (a) success returns the expected status/body
   shape, and (b) on each error case, `res.status` matches the mapped
   `body.statusCode`. This second assertion is the one that would have
   caught the historical 5-of-7-routes bug — prioritize it over full
   response-body coverage.
3. Structure as one parametrized test (a `{route, mockError,
   expectedStatus}` table fed through `it.each`/`test.each`) rather than
   58 hand-written files — check existing specs for this repo's
   established `it.each` usage pattern before introducing a new shape.
4. Separately, add schema tests for `auth/schema.ts` covering edge cases
   (empty password, malformed email, oversized name) —
   `validators/forms/__tests__/inits.test.ts` is currently the only
   example of this repo's validator-testing convention to model from.
5. Once proven on auth/billing/api-keys, either keep extending to the
   remaining ~50 routes as time allows, or add "new route needs a status
   test" as a PR-template checklist item so coverage grows organically
   instead of needing a second dedicated backfill later.

### [P2] `check-duplicate-messages` script exists but never runs (not in CI, not in husky)
**Where:** `package.json` defines `check-duplicate-messages` (`tsx
scripts/check-duplicate-messages.ts`), but grep of `.github/` and
`.husky/` finds no reference. Only `generate-i18n-types` runs (via
`prebuild` → `build`).

**What's wrong:** Duplicate message keys across the growing `messages/`
tree can land undetected. Also, CI never verifies the *committed*
`src/generated/i18n-messages*.{d.ts,json}` are current: `typecheck` (CI
step 1) runs against committed generated types, and `build` (later)
regenerates them, but nothing runs `generate-i18n-types && git diff
--exit-code src/generated`. A PR that adds a key but forgets to regenerate
passes typecheck against stale-but-self-consistent types.

**How to fix:**
1. Add `- run: pnpm check-duplicate-messages` to `frontend-ci.yml` right
   after install, before `typecheck`/`test`/`build` — it's a static check
   with no build-artifact dependency, so it can fail fast, early.
2. Add a second step immediately after: `pnpm generate-i18n-types && git
   diff --exit-code src/generated` — regenerates the typed message
   accessors and fails if regeneration produces a diff against what's
   committed, catching "added a key, forgot to regenerate," which the
   current pipeline lets through (`typecheck` only checks the *committed*
   generated types are internally consistent, not that they're current).
3. Run both locally against current `main` before adding to CI, to
   confirm neither already fails on pre-existing drift — fix any existing
   duplicates/staleness first so the new steps start green.
4. Order matters: put the generated-types diff check before `typecheck`
   in the job if `typecheck`'s correctness depends on the generated types
   being current — otherwise a stale-but-internally-consistent generated
   file could pass `typecheck` and only get caught by the diff check
   afterward, a confusing failure order for whoever's PR trips it.

### [P2] The demo/reference surface ships to production and is advertised for indexing
**Where:** `src/app/sitemap.ts:5-40+` explicitly lists demo routes
(`/routing/*`, `/csr`, `/ssr`, `/ppr`, `/gallery`, `/form`, `/ws`,
`/dashboard`, `/data-fetching`, …); `src/app/robots.ts:8-11` disallows only
`/api/` and `allow: "/"` for everything else. The `(demos)` layout
(`src/app/(demos)/layout.tsx`) wraps demos in `AuthProvider` +
`RealtimeProvider` (opens a WS). Demo/reference routes also live outside
`(demos)`: all of `/v1/[lang]/ui/*` (~110 component-gallery pages),
`/routing/*`, `/gallery`, `/security/csp`, `/i18n`, `/demos`,
`(marketing)`.

**What's wrong:** A team deploying this boilerplate as a real product
inherits dozens of demo pages in the production bundle, crawlable and
enumerated in `sitemap.xml`, each opening realtime connections. `DemoBadge`
labels them visually but nothing env-gates or SEO-excludes them. They're
*isolated by folder* but not *isolated from production concerns* — the same
pattern as the backend's recipe-module sprawl (§28), just missing the
frontend-side half of the isolation.

**How to fix:**
1. `sitemap.ts:5-40+`: split the route list into `realAppRoutes` and
   `demoRoutes` arrays; only spread `demoRoutes` into the returned sitemap
   when `process.env.NEXT_PUBLIC_INCLUDE_DEMOS === "true"` (unset/false by
   default, so a standard prod build excludes them with no extra config
   needed).
2. `robots.ts:8-11`: change the blanket `allow: "/"` to explicitly
   `disallow` the demo path prefixes (`/routing`, `/ui`, `/gallery`,
   `/demos`, the `(demos)` group's actual URL prefixes, `/security/csp`,
   `/i18n`) when the flag is unset, keeping `allow: "/"` for real-app
   paths only.
3. For defense in depth beyond crawler-respecting bots, add `export const
   metadata = { robots: { index: false, follow: false } }` to each demo
   route's layout — covers a demo page getting linked from somewhere
   external despite being excluded from the sitemap.
4. `(demos)/layout.tsx`'s `AuthProvider`+`RealtimeProvider` wrapping
   (opening a WS per demo-route visit) is a separate concern from
   indexing — if demos are excluded from prod via the flag, also decide
   whether they should be route-guarded (404/redirect), not just
   unindexed, since an unindexed-but-still-live demo route with an open
   WebSocket is still a real per-visit resource cost if anyone finds the
   URL directly. A flag-gated server-side redirect in the demo layout
   itself, before `RealtimeProvider` mounts, closes this more completely
   than SEO exclusion alone.
5. Document the flag and the demo-route-group list (`(demos)`, `demos`,
   `routing`, `gallery`, `security`, `i18n`, `v1/[lang]/ui`) in
   `docs/frontend/STATUS.md`, which already documents the demo surface for
   discoverability — extend it rather than starting a second list
   elsewhere.

### [P2] Inline Zod schema defined in a view (validator-placement rule)
**Where:** `src/views/forms/field-states/PageContent.tsx:12` (`import { z
} from "zod"`) and `:93` (`onChange: z.string().min(3, "This field has an
error")`).

**What's wrong:** `AGENTS.md` ("Zod validators to `src/validators/`")
forbids inline schemas in component/view files. This is the one real
inline-schema violation in the app (the `forms/filters` and
`forms/checkout` hits are `import type { z }` only — type usage, not schema
definitions — and are compliant). The error string is also hardcoded
English.

**How to fix:**
1. Move `field-states/PageContent.tsx:93`'s inline
   `z.string().min(3, "This field has an error")` into
   `src/validators/forms/field-states.ts` (confirmed to already exist, per
   the `AGENTS.md` convention this file otherwise follows) as a named
   export — check the file's existing schema-naming pattern for siblings
   before naming the new one, so it stays consistent with what's already
   there.
2. Replace the hardcoded `"This field has an error"` message with an i18n
   key from whatever `forms` namespace `PageContent.tsx` already reads
   elsewhere — the Forms Gallery is otherwise fully i18n'd per
   `project-enhance-4.md`, so this one inline schema is the exception, not
   the rule, and a matching pattern almost certainly already exists
   nearby in the same file to copy from.
3. Drop the now-unused `import { z } from "zod"` at `:12` once the schema
   moves out — confirm no other inline `z.*` usage remains in the file
   first.

## 12. P3 findings (Next.js)

### [P3] `next.config.ts` image config: AVIF not enabled and `localhost` forced to https
**Where:** `next.config.ts:40-45` — `remotePatterns` maps every hostname
(including the default `localhost`) to `protocol: "https"`, and there's no
`images.formats`.

**What's wrong:** (1) No `formats` means Next serves only WebP (Next 16
default), leaving AVIF's ~20% additional savings on the table for a
boilerplate that's meant to showcase best practice. (2) `localhost` over
enforced `https` means a local http image source won't optimize (dev-only
edge case).

**How to fix:** In `next.config.ts:38-45`'s `images` block, add `formats:
["image/avif", "image/webp"]` alongside the existing `remotePatterns`. For
`localhost` specifically (currently mapped to `protocol: "https"` by the
same `.map()` as every other hostname, `:41-45`), either special-case it
to `protocol: "http"` inside the map function, or drop `localhost` from
the default `NEXT_PUBLIC_IMAGE_HOSTNAMES` list entirely (`:1-3`'s default
is `"picsum.photos,localhost"`) — `picsum.photos` already serves over
https, so check whether anything in local dev genuinely relies on an
`http://localhost/...` image source before removing it; the default
suggests it's currently unused.

### [P3] `apiFetch` used inside a hook, and a server fn static-imported into a client hook (convention deviations; both currently safe)
**Where:** `src/hooks/useApi.ts:1,11` (`useEcho` calls `apiFetch` directly
— used only by `views/demos/client-data/PageContent.tsx`, i.e. demo-scoped
but living in `src/hooks`); `src/lib/realtime/useRealtimeCoordination.ts:6`
static-imports `markMessagesReadServer` from `@/api/server/...` (`AGENTS.md`
wants server fns dynamic-imported via a client wrapper).

**What's wrong:** Both violate the two-layer/dynamic-import convention.
Impact is low because `@/lib/api-client` is `"use client"` and isomorphic
(just wraps `fetch` + a 401 event) — no secret leaks, no server-only code
bundled. Still, `useRealtimeCoordination`'s inline path (`:75`) marks-read
without invalidating `["notifications","dm-count"]`, whereas the canonical
`useMarkMessagesRead` (`api/client/messages/mark-read.ts:10-12`) and
`useMessageActions.markRead` (`api/client/messages/actions.ts:18-21`) do —
a minor cache-consistency divergence (self-heals via the 60s
`refetchInterval`).

**How to fix:**
1. `useApi.ts`'s `useEcho` (`:1,11`): create `src/api/client/echo/query.ts`
   wrapping the same `apiFetch` call behind `queryOptions` per the
   two-layer convention, then have `useEcho` call that instead — low risk
   given it's only consumed by one demo view.
2. `useRealtimeCoordination.ts:6`'s static import of
   `markMessagesReadServer`: rather than converting it to a dynamic
   import (which would only fix the convention violation), call the
   existing `useMarkMessagesRead` client wrapper directly instead of
   reimplementing a parallel path to the same server function — this
   fixes both this finding and the next one in a single edit.
3. `useMarkMessagesRead` (`api/client/messages/mark-read.ts:10-12`)
   already invalidates `["notifications","dm-count"]` on success, so
   routing `useRealtimeCoordination`'s inline path through it instead of
   its own direct call closes the convention violation and the
   cache-drift gap together, rather than fixing the import style and
   separately bolting on the missing invalidation.
4. Confirm post-fix that unread counts update immediately on mark-read
   rather than waiting up to 60s for the `refetchInterval` to self-heal —
   that's the actual user-visible improvement this fix delivers, worth
   checking explicitly rather than assuming the code change alone proves
   it.

### [P3] `tsconfig.json` strictness could go further; `scripts/` excluded from typecheck
**Where:** `tsconfig.json:7` has `strict: true` (good) but omits
`noUncheckedIndexedAccess`, `noImplicitOverride`,
`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`; `:33`
excludes `scripts`, so `generate-i18n-types.ts` / `check-duplicate-messages.ts`
are never typechecked by `pnpm typecheck`.

**What's wrong:** For a codebase with only 3 `any`s, `noUncheckedIndexedAccess`
in particular would catch real array/record access bugs (the realtime
frame handling in `useRealtimeCoordination.ts` casts `Record<string,
unknown>` heavily). The excluded build scripts can rot untyped.

**How to fix:**
1. Enable `noUncheckedIndexedAccess` and `noImplicitOverride` in
   `tsconfig.json:7` first, then run `pnpm typecheck` immediately to get
   the real fallout count before deciding whether to fix it in one pass or
   incrementally with tracked `// @ts-expect-error` markers — given only
   3 `any`s exist app-wide, fallout is likely small, but confirm rather
   than assume.
2. Prioritize fixing fallout in `useRealtimeCoordination.ts`'s
   `Record<string, unknown>` frame-handling casts specifically (the
   concrete place this flag would catch real bugs, not just noise) before
   treating the rest as low-priority cleanup.
3. Hold off on `exactOptionalPropertyTypes` and
   `noPropertyAccessFromIndexSignature` for a separate follow-up — they
   tend to have much larger fallout in codebases with many optional props
   (which this one, at 1,311 files, likely has), so bundling them with the
   "lowest-friction pair" above risks turning a small cleanup into a
   large one.
4. For `scripts/**`: first test whether removing the `exclude` entry at
   `tsconfig.json:33` lets the scripts typecheck cleanly under the main
   config as-is (simplest fix if it works). If not, add a dedicated
   `tsconfig.scripts.json` extending the base config, scoped to
   `scripts/**` (possibly with relaxed `module`/`target` if the scripts
   run under `tsx` with different assumptions than app code), and wire a
   `pnpm typecheck:scripts` step into CI alongside the main `pnpm
   typecheck`.

### [P3] The only 3 `any` casts are all in one demo file
**Where:** `src/views/forms/field-states/PageContent.tsx:113,125,143` —
`<FormFieldInfo field={field as any} />`.

**What's wrong:** These are the entire `any` budget of the app. They cast a
TanStack Form field to `FormFieldInfo`'s prop type. Justified-ish
(form-field generics are painful) but it's the reference gallery page
teaching the pattern.

**How to fix:**
1. Check `@tanstack/react-form`'s exported types first — recent versions
   export an `AnyFieldApi` type meant for exactly this "accept any
   field's API without fighting the full generic" case. If available,
   retyping `FormFieldInfoProps.field` to `AnyFieldApi` should let all 3
   casts (`field-states/PageContent.tsx:113,125,143`) drop with no other
   changes, since the prop type would already accept what's passed.
2. If `AnyFieldApi` isn't available in the installed version, fall back
   to a narrower local `FieldInfoLike` interface declaring only the
   properties `FormFieldInfo` actually reads off `field` (check its
   implementation for the exact set used) — type-safe without the full
   TanStack Form generic machinery, and more resilient to a future
   TanStack Form version changing its generic shape than depending on an
   internal-ish helper type.
3. After the fix, confirm `grep -rn ': any\b\|<any>\|as any\b' src/`
   returns zero hits app-wide (currently exactly 3, all here) — worth
   verifying explicitly, since this closes out the app's entire `any`
   budget in one change.

### [P3] Dead-code / duplication / orphan checks are advisory-only
**Where:** `.github/workflows/frontend-ci.yml:109-113` run `fallow
dead-code` and `fallow dupes` with `|| true` (never fail CI);
`.dependency-cruiser.js:34-54` sets `no-orphans` to `severity: "warn"`.

**What's wrong:** Orphaned modules and dead exports can accumulate without
gating. Given the large demo surface, orphan drift is plausible.

**How to fix:**
1. Run `pnpm depcruise src --config .dependency-cruiser.js` locally first
   to see the current real orphan count before flipping `no-orphans` from
   `warn` to `error` — confirm it's actually zero (the existing `pathNot`
   exclusions suggest it should be, but verify rather than assume before
   making it blocking).
2. Same for `fallow dead-code`/`fallow dupes` — run both locally, and
   either fix what they report before removing `|| true` from
   `frontend-ci.yml:109-113`, or, if the current count is nonzero but not
   worth fixing immediately, replace `|| true` with a ratcheting check (a
   small script comparing today's count against a committed baseline,
   failing only on an *increase*) — this lets the gate go live
   immediately without blocking on a full backlog cleanup first.
3. Land the stricter gates as their own PR, separate from any other
   change, so a CI failure from tightening these rules is unambiguously
   attributable to this fix rather than mixed in with unrelated work.

### [P3] Self-documented e2e cookie-shape limitation remains
**Where:** `e2e/setup.spec.ts` (the long comment block around the
`cookies.map(...)` url-only normalization).

**What's wrong:** The storageState is written url-only, which the browser
context needs but `request.newContext()` (pure API tests, e.g.
`admin-audit-logs.spec.ts`'s 401/403 checks) rejects — so those API-only
assertions may not run authenticated. It's a known Playwright shape
mismatch, honestly documented, not a regression.

**How to fix:**
1. In `e2e/setup.spec.ts`, after computing the existing url-only
   `storageState` for browser-context projects, also compute a second
   domain+path-shaped version (Playwright's `context.storageState()`
   supports both shapes — the difference is which cookie-matching fields
   get populated) and write it to a second file, e.g.
   `playwright/.auth/user-api.json`.
2. Update `admin-audit-logs.spec.ts` (and any other spec using
   `request.newContext()` for pure API assertions) to load
   `user-api.json` instead of the shared `user.json`, via
   `request.newContext({ storageState: ... })`.
3. Confirm the fix actually closes the gap, not just that tests still
   pass: run the previously-affected 401/403 checks and verify they now
   exercise the *authenticated* path — a not-actually-authenticated
   request could coincidentally still produce the expected 401/403 for
   the wrong reason, so check the request actually carries valid auth,
   not just that the assertion is green.
4. If this proves more involved than expected, filing the upstream
   Playwright issue already referenced in the existing code comment (and
   linking it from the spec) is a legitimate fallback — this is a
   framework-shape mismatch, not a bug in this app's own code.

## 13. Enhancements (Next.js)

### [Enhancement] Codify the AGENTS.md conventions as dependency-cruiser rules
**Why:** The repo documents 6 strict layering rules but only enforces
circular-deps and `lib → features` direction in `.dependency-cruiser.js`.
The two-layer API rule, zod-placement rule, and server-import rule are
unenforced — which is exactly why the P1 `messages/FreePageView`
`apiFetch` call, the P2 inline zod, and the P3 hook violations all shipped.
Tooling that already runs in CI (`pnpm depcruise`) can catch these
mechanically.

**How:**
1. Add three `forbidden` rules to `.dependency-cruiser.js`'s existing
   rules array (alongside the circular-deps/`lib→features` rules already
   there):
   - `from: ^src/(views|components|hooks)/` → `to: ^src/lib/api-client` =
     error (catches the `messages/FreePageView.tsx` P1 violation above,
     plus the `useApi.ts`/`useRealtimeCoordination.ts` P3 violations).
   - `from: pathNot ^src/validators/` → `to: path zod, dependencyTypesNot
     type-only` = error, with `src/lib/env.ts` excluded via an additional
     `pathNot` (catches the `field-states/PageContent.tsx` inline-schema
     violation).
   - `from: ^src/(views|components)/` → `to: ^src/api/server/` = error
     (forces the client-wrapper dynamic-import path).
2. Add each rule one at a time and run `pnpm depcruise src --config
   .dependency-cruiser.js` immediately after — expect it to flag the
   exact violations this document already found (confirms correct
   targeting) plus possibly others this manual review missed (a bonus
   find, not a false positive, if so).
3. Fix all 3 findings above first, *then* land the rules as blocking —
   same sequencing principle as the other new-gate proposals in this
   document: don't turn on a strict gate against a codebase that doesn't
   pass it yet.
4. `pnpm depcruise` already runs in CI, so no new CI wiring is needed —
   just the rule additions and the prerequisite fixes.

### [Enhancement] Generate the frontend `ExceptionCode` from the backend enum
**Why:** The P1 drift is a maintenance-by-hand problem. The i18n system
already proves the pattern works (`generate-i18n-types` in `prebuild`).

**How:**
1. `EXC_TO_SURFACE` (`exception-handler.ts:28-43`) already uses
   `satisfies Record<ExceptionCode, ExceptionSurface>` today — that
   type-safety mechanism already exists; the net-new work here is only
   the generator.
2. Add `scripts/generate-exception-codes.ts` (same shape as the existing
   `scripts/generate-i18n-types.ts`) that reads
   `../nest-js-boilerplate/src/common/exceptions/exception-code.ts`
   (relative cross-package path — both live in one monorepo per
   `pnpm-workspace.yaml`), extracts the string-literal union (a simple
   regex is likely sufficient given the source's flat `type ExceptionCode
   = 'A' | 'B' | ...` shape — a full TS AST parse is overkill for this),
   and emits `src/lib/exception-codes.generated.ts` exporting the
   matching union.
3. Change `exception-handler.ts:3-17` to re-export `ExceptionCode` from
   `./exception-codes.generated` instead of hand-declaring it —
   `EXC_TO_SURFACE`'s existing `satisfies` clause then automatically
   enforces a matching surface entry for every generated code, exactly as
   it already does for the hand-written list today.
4. Wire the new script into `prebuild` alongside the existing
   `generate-i18n-types` call, and add the same "regenerate + `git diff
   --exit-code`" CI check proposed elsewhere in this document for the
   i18n generator, applied to this generated file too — so a backend-only
   PR adding an exception code without regenerating the frontend mirror
   fails CI instead of silently drifting again.
5. Run this generator *after* the backend's `EX_MFA_NOT_ENABLED` fix
   (§16) lands — generating before would faithfully reproduce that typo
   into the new generated file.

### [Enhancement] Make performance budgets real
**Why:** Lighthouse runs in CI (`frontend-ci.yml:118-119`) but the custom
budgets are almost all `warn` (`lighthouserc.json:27-32`) so only CLS +
`lighthouse:recommended` errors gate. The `analyze` script (`ANALYZE=true
next build`) is never run in CI, and `project-enhance-2.md`'s PF-1 asked
for a documented bundle budget that still doesn't exist.

**How:**
1. Run `pnpm lighthouse:collect && pnpm lighthouse:assert` locally first
   to see current real LCP/TBT/TTI numbers before picking "realistic
   ceilings" — set the new `error` thresholds just above measured
   current-state, not an aspirational number from a scoring guide, then
   ratchet down over time as performance work lands (the same
   "measure-first" principle this document applies to the backend
   coverage threshold too).
2. Promote `largest-contentful-paint`, `total-blocking-time`,
   `interactive` from `warn` to `error` in `lighthouserc.json:27-32` at
   those measured ceilings.
3. Add a CI step running `pnpm analyze` (`ANALYZE=true next build`,
   already defined in `package.json`) and parsing `@next/bundle-analyzer`'s
   JSON stats output (check its exact output path/format under the
   `ANALYZE` flag before scripting against it) for the first-load JS size
   of a representative real route; fail the step if it exceeds a
   committed number in a small config file (e.g. `budget.json` with
   `{route: "/v1/en/feed", maxFirstLoadKb: N}`).
4. Same bootstrapping approach as step 1: measure current real first-load
   JS for `/v1/en/feed` first, set the initial budget slightly above that
   measured number — not below it, which would make the new CI step
   immediately red — then treat lowering the budget as a deliberate,
   tracked follow-up once real optimization work happens.

### [Enhancement] Separate "demo/reference" from "product" at the build level
**Why:** Ties together the sitemap/robots finding and the recipe-sprawl
finding on the backend side (§28) — same shape, both stacks.

**How:** This is the same `NEXT_PUBLIC_INCLUDE_DEMOS` flag and sitemap/
robots gating already fully specced in the "demo/reference surface ships
to production" P2 fix above — implement them together, not twice. The
net-new piece here is the "one-command prune" for teams that want to
physically delete the demo surface rather than gate it at runtime: since
the demo route groups are already cleanly foldered (`(demos)`, `demos`,
`routing`, `gallery`, `security`, `i18n`, `v1/[lang]/ui`), document (in
`docs/frontend/STATUS.md`, extending the list from the P2 fix) the exact
`rm -rf` command set plus any now-orphaned dependencies a full removal
would surface (`kafkajs` if only a demo route used it, unused API routes
under demo-only paths, etc.) — a checklist, not new code, so a production
fork can genuinely ship without the reference material rather than merely
hiding it behind a flag.

## 14. Top 10 — Next.js

1. **[P1]** Add a baseline app-wide CSP (`next.config.ts` headers) — the
   whole real app currently has none, and the PPR reason for omitting it is
   void.
2. **[P1]** Re-sync + guard the FE exception-code map against the backend
   enum (9 codes missing) — generate it or add a parity test.
3. **[P1]** Fix the two-layer violation in `views/messages/FreePageView.tsx`
   (use the existing `searchUsersQueryOptions`).
4. **[P2]** Adopt the central `getSurface`/`exceptionHandler` system in the
   real auth flows (register/login) instead of ad-hoc `exc === "..."`
   checks.
5. **[P2]** Resolve the `cacheComponents` mismatch — enable the flag or
   delete the stale rationale from `proxy.ts` / `csp/page.tsx` / the `/ppr`
   demo.
6. **[P2]** Enforce coverage (`pnpm test:coverage` in CI) and add BFF
   route/handler tests guarding the status-code bug class.
7. **[P2]** i18n the login MFA sub-form (4 hardcoded strings) + move the
   `field-states` inline zod to `validators/`.
8. **[P2]** Wire `check-duplicate-messages` + a `generated/` drift check
   into CI.
9. **[P2]** SEO/build-isolate the demo surface (sitemap/robots + optional
   env gate).
10. **[Enhancement]** Codify the unenforced `AGENTS.md` rules (api-layer,
    zod-placement, server-import) as dependency-cruiser `error` rules so
    #3/#7 can't recur.

---

# PART III — Senior NestJS Developer Review

Scope: `nest-js-boilerplate/` — NestJS 11, GraphQL (Apollo, code-first),
Prisma 7 as the canonical ORM, Redis-backed sessions. Split into **III.A —
core product domain** (auth, users, social features, messaging, billing —
the real app) and **III.B — platform/infrastructure** (config, security
middleware, caching, queues, deployment, CI, the multi-ORM recipe sprawl).

**Environment note (applies to both halves):** GraphQL is served code-first
via `GraphQLModule.forRoot<ApolloDriverConfig>` with `autoSchemaFile`
(`src/app.module.ts:92-94`) — **not** federation, despite a `federation/`
recipe module existing. The emitted `src/schema.gql` is authoritative and
was used to verify the live API surface throughout this review. The unit
suite is green (58/58 sampled specs, 330/330 full run per §25); the **e2e
suite is broken** (§15/§16); live infra (Postgres/Redis/ELK) was not running
at audit time for III.B, so those checks were traced statically except
where noted.

## III.A — Core product domain

**Scope covered:** `auth/`, `auth/oauth/`, `authorization/`, `users/`,
`profile/`, `session/`, `sessions/`, `devices/`, `mfa/`, `api-keys/`,
`post/`, `comment/`, `reactions/`, `friends/`, `messaging/`, `realtime/`,
`ws/`, `ws-adapter/`, `ws-enhancers/`, `notification/`, `push-notification/`,
`billing/` (+ `billing/stripe/`), `outbox/`, `upload/`, `team-members/`,
`mail/` (+ templates), the relevant slices of `common/`, `csrf/`,
`cookies/`, `cookies-ssr/`. Deliberately **not** deep-dived: the alt-ORM
(`mikro-orm/`, `sequelize/`, `typeorm/`, `mongoose/`), federation, gRPC,
microservices, and the ~20 smaller NestJS-docs recipe modules — covered
topically in III.B.

Ground truth: `docs/backend/AUTH.md` (token-quadruple/session/RBAC/device-
handshake protocol), `docs/backend/REALTIME.md` (WS transport/auth/page-
claim/presence spec), ADR-001 (Redis session auth), ADR-003 (transactional
outbox), ADR-004 (tier-based RBAC) — read in full and checked against the
actual implementing code in both directions (code more permissive than
documented = security concern; code stricter/different = doc now wrong).

## 15. Status of the 7 previously-known issues

Re-verified against current code, not assumed from prior claims:

1. **`resetPassword` `Boolean!`/`void` mismatch — FIXED.**
   `auth.resolver.ts:65-68` returns `Promise<boolean>`;
   `auth-registration.service.ts:209-267` returns `true`; schema
   `resetPassword(input): Boolean!`. No null-for-non-nullable path remains.
2. **`UsernameService` retry-suffix clamp — FIXED.**
   `username.service.ts:32` now does `base.slice(0, MAX_LENGTH -
   suffix.length) + suffix`, reserving room for the suffix before
   appending. Retry collisions produce a real suffixed candidate.
3. **`MailProcessor` template wiring — FIXED.** `mail.service.ts:27-51`
   persists `template`+`variables`; `mail.processor.ts:32-45` renders via
   `renderTemplate(email.template, email.variables)` and passes
   `html`/`text` to `transport.send()`; `templates/render.ts` has real
   `email-verification`/`password-reset`/`welcome-social` bodies. (One
   residual edge — see the "unknown mail template" finding below.)
4. **verify-email / password-reset backend end-to-end — WORKS.**
   `verifyEmail` (`auth-registration.service.ts:126-168`) consumes token in
   `$transaction`, sets `ACTIVE`. `requestPasswordReset` (:189-207)
   issues+emails; `resetPassword` (:209-267) consumes token, updates
   password, revokes all sessions — all transactional. (Frontend link
   status is out of this review's scope.)
5. **`FriendsModule` e2e boot failure — RESOLVED (not reproducible
   statically).** DI graph is sound: `AuthModule` imports `forwardRef(() =>
   FriendsModule)` (`auth.module.ts:20`); `FriendsModule` imports only
   `AuthContractsModule` (`friends.module.ts:10`), which has no back-edge;
   `PrismaModule` and `DataloaderModule` are `@Global()`. Decisive evidence:
   `suggestedFriends`/`type SuggestedFriend` are present in the committed
   `schema.gql` (lines 3433, 3838), and that file is emitted by
   `autoSchemaFile` at `AppModule` bootstrap — so `FriendsModule`
   instantiates successfully. (A full e2e boot is currently blocked by a
   *different* issue — #7 below / the P1 finding.)
6. **IP-change-dedup test-mock mismatch — FIXED; unit suite healthy.**
   `session-auth.guard.spec.ts` `mockTokenStore()` now includes both
   `extendTTL` and `updateFields` (lines 34-38, 57-61); the guard's
   IP-change branch calls `updateFields` (`session-auth.guard.ts:143`) and
   the spec's IP-change test passes. Sampled
   `(username|token-derivation|tier.guard|to-exception-response|token-store|session-auth.guard)`
   specs: 58/58 green.
7. **`refreshToken` on `AuthPayload` — STILL BROKEN.** See the P1 finding
   below. `AuthPayload` has no `refreshToken` field; the e2e helper + 2
   specs still query it, and there is no `refresh` mutation at all — this
   folds into the P0 finding, it's the same missing capability.

## 16. Core-domain findings

### [P0] No token refresh/reissue capability exists — every session becomes an unrecoverable forced re-login
*(Independently re-verified — see §3.)*

**Where:**
- Absent operation: no `refresh` in `src/schema.gql` (Mutation block lines
  2249-2273; a grep for `refresh` excluding `refreshToken` returns
  nothing), no `refresh` method in `auth.resolver.ts`, no reissue method in
  `auth-token.service.ts` (only `issueTokens`, called solely by
  login/register/oauth/mfa) or `auth-session.service.ts` (only
  `logout`/`revokePresentedKey`).
- Date-bound derivation: `token-derivation.service.ts:16-31` —
  `deriveUserToken`/`deriveRbacToken` both fold `dateOnly()` into the HMAC.
- Hard rejects with no recovery: `session-auth.guard.ts:89-93` (`throw
  'Daily token expired'`), `:120-127` (`throw 'RBAC token expired or tier
  changed'`), and JWT expiry at `:70-76`.
- BFF cannot recover: `next-js-boilerplate/src/app/api/auth/` has no
  `refresh` route; `refresh-token.ts` just re-`GET`s `/api/auth/token`,
  which echoes the *same* cookies (`app/api/auth/token/route.ts`).
- Documented as central but missing: `AUTH.md:43-46,121,178,190-196`
  (silent auto-refresh), `REALTIME.md:205-210` (WS auth-failure → `POST
  /api/auth/refresh`), ADR-004:27-31 (tier change → "silent 401 →
  auto-refresh → new tier active").

**What's wrong:** The session design assumes a `refresh` that revokes the
presented compound key and re-issues the four tokens. It does not exist.
Consequences, all with no recovery except full re-login:
- **Daily forced logout for 100% of users:** after UTC midnight,
  `deriveUserToken(userId)` (today) ≠ the `user_token` cookie minted
  yesterday → guard step 3 throws. `session-auth.guard.spec.ts:227-239`
  even asserts this rejection.
- **Any tier change bricks the session:**
  `rewriteFieldsForUser(userId,{tier})` (billing/admin) makes step-6
  `deriveRbacToken(userId, hash.tier)` ≠ presented rbac token → 401. This
  is exactly the flow ADR-004 says resolves via silent refresh.
- **15-min idle death:** Redis `SESSION_TTL` default `900s` sliding
  (`token-store.service.ts:33-34`); after 15 min idle the `HGETALL` misses
  → 401.

**How to fix:** Add the missing `refresh` mutation (CSRF-guarded, matching
`secure-cookies.e2e-spec.ts`'s existing expectations) in `AuthResolver`,
backed by a new `AuthSessionService.refresh(ctx)` that: (1) reads the
presented compound key from the refresh/device cookies, (2) validates the
opaque refresh token against the Postgres `Session` row (per AUTH.md
surface matrix line 178), (3) calls `authTokens.issueTokens(user, ctx,
device)` to mint a fresh quadruple with today's derivations, (4) revokes
the old compound key via `tokenStore.revoke`. Add the BFF `/api/auth/refresh`
route the docs already reference. **Until this lands, the app is unusable
past one UTC day** — this is the single highest-priority item in this
entire document.

---

### [P1] `me` query drops username/avatarUrl/locale/timezone for every user
**Where:** `session-auth.guard.ts:161-173` (`req.user` assignment) vs
`auth.resolver.ts:112-124` (`me` reads `user.username`, `user.avatarUrl`,
`user.locale ?? 'en'`, `user.timezone ?? 'UTC'`). The Redis read returns all
four (`token-store.service.ts:105-109`), and `JwtUser` declares them
(`auth.types.ts:12-17`).

**What's wrong:** The guard's `req.user` object attaches `name`, `friends`,
`unread`, `orgIds`, `teamIds` — but **not** `username`, `avatarUrl`,
`locale`, `timezone`. So `me` always returns `username=null`,
`avatarUrl=null`, `locale="en"`, `timezone="UTC"`, regardless of the user's
actual stored values. `AUTH.md:114` says `me` is "served entirely from this
snapshot" — the snapshot exists in Redis but is discarded in the mapping.
Every avatar/locale-aware client surface reading `me` is wrong.

**How to fix:** Add the four fields to the `session-auth.guard.ts:162-173`
object:
```ts
username: sessionUser.username,
avatarUrl: sessionUser.avatarUrl,
locale: sessionUser.locale,
timezone: sessionUser.timezone,
```
Add a `me`-shape assertion to `session-auth.guard.spec.ts` (it currently
only checks `userId`/`tier`).

### [P1] e2e suite is broken: `refreshToken` field + `refresh` mutation queried but neither exists
**Where:** `AuthPayload` (`auth.types.ts:98-130` and `schema.gql type
AuthPayload`) has `accessToken, rbacToken, deviceId, deviceToken,
userToken, user, mfaRequired, mfaToken` — **no `refreshToken`**. Consumers
that assume it:
- `test/utils/auth.ts:24,47,53,59` — the shared `registerAndLogin` helper
  selects `accessToken refreshToken user{...}`.
- `test/auth.e2e-spec.ts:98-109` — selects and asserts `refreshToken`.
- `test/secure-cookies.e2e-spec.ts:33-34,89,131-135` — queries `mutation {
  refresh { accessToken refreshToken } }` and asserts
  `data.refresh.refreshToken`.

**What's wrong:** `registerAndLogin` is the shared handshake for the
domain-resolver e2e specs; its GraphQL doc fails validation (`Cannot query
field "refreshToken" on type "AuthPayload"`), so every spec that logs in
via it fails before touching its own subject. `secure-cookies` additionally
references the nonexistent `refresh` mutation. This is why the e2e
workflow is red at HEAD.

**How to fix:** Two coordinated edits: (1) once the P0 `refresh` mutation
lands, the `refreshToken` value should be returned in the payload (or
delivered cookie-only and the tests updated). Simplest correct fix now:
drop `refreshToken` from `test/utils/auth.ts:44-60`,
`auth.e2e-spec.ts:98-109`, and the `refresh` assertions — the opaque
refresh token is an httpOnly cookie, not a body field. (2) Reconcile
`AUTH.md:19` which wrongly claims "all five values are returned in the
`AuthPayload` body" (see the doc-drift finding below).

---

### [P2] MFA "not enabled" exception code doesn't match the canonical enum — and a unit test locks in the wrong value
**Where:** `mfa.service.ts:96` throws `exc: 'EX_MFA_NOT_ENABLED'` (missing
the `AUTH_` segment); the canonical value in the `ExceptionCode` union type
is `'EX_AUTH_MFA_NOT_ENABLED'` (`common/exceptions/exception-code.ts:10`),
used correctly for the same logical condition at
`auth-login.service.ts:155`. `mfa.service.spec.ts:242-253` asserts on the
wrong value (`response: { exc: 'EX_MFA_NOT_ENABLED' }`, line 249), so the
test passes and looks like real coverage while actually encoding the bug.
Surfaced while cross-checking the frontend's exception-code report against
the backend enum (§31); independently re-verified — see §3.

**What's wrong:** `ExceptionCode` (`exception-code.ts:1-24`) is a plain
TypeScript string-literal union, not a runtime enum or a typed helper —
nothing at the `BadRequestException({...})`/`UnauthorizedException({...})`
call site enforces that a literal `exc:` string actually belongs to the
union, so this typo compiles cleanly and `tsc` was never going to catch
it. Consequence: any consumer that switches on `exc` — the frontend's
`EXC_TO_SURFACE` map, once the missing-9-codes P1 in §10 is fixed, or any
future backend logic keyed on exception code — will silently miss this
specific "disable MFA when it's already off" case and fall through to a
generic/unmapped branch instead of the field-scoped handling
`EX_AUTH_MFA_NOT_ENABLED` is supposed to get. Compounding it: the two throw
sites for what's conceptually the same "MFA not enabled" condition use two
*different* i18n keys — `mfa.service.ts:98` uses `key:
'mfa.errors.notEnabled'`, `auth-login.service.ts:157` uses `key:
'auth.errors.mfaNotEnabled'` — so even after the `exc` typo is fixed, a
client resolving UI copy off `key` would show different text depending on
which code path threw the logically-identical error.

**How to fix:**
1. `mfa.service.ts:96`: change `exc: 'EX_MFA_NOT_ENABLED'` →
   `exc: 'EX_AUTH_MFA_NOT_ENABLED'`.
2. `mfa.service.spec.ts:249`: change the assertion to `response: { exc:
   'EX_AUTH_MFA_NOT_ENABLED' }`. Run `pnpm test mfa.service` afterward —
   only the expected string changes, not the code path under test, so it
   should stay green.
3. Pick one i18n key for both throw sites — `auth.errors.mfaNotEnabled` is
   the better home, since the `mfa.service.ts` disable-path is really an
   auth-state precondition check, not an MFA-CRUD error. Update
   `mfa.service.ts:98` to `key: 'auth.errors.mfaNotEnabled'` and confirm
   that key already resolves wherever the backend's `key` field is
   consumed (grep the frontend i18n messages for `mfaNotEnabled` under the
   `auth` namespace — this is the one the frontend should already have if
   `auth-login.service.ts`'s throw is already wired to a working UI path).
4. Close the class of bug, not just this one instance: every exception
   throw site in the backend passes a raw object literal, so `exc` is
   nowhere type-linked to `ExceptionCode`. Add a small typed helper, e.g.
   ```ts
   export function appException(
     code: ExceptionCode,
     msg: string,
     key: string,
   ): { exc: ExceptionCode; msg: string; key: string } {
     return { exc: code, msg, key };
   }
   ```
   and route new throw sites through `throw new BadRequestException(appException('EX_...', ...))`
   so a future typo becomes a compile error (`code` is typed
   `ExceptionCode`) instead of a silently-wrong string. Retrofitting every
   existing throw site to use it is a larger follow-up, out of scope here
   — introducing the helper now stops new instances of this exact bug
   class.
5. Sequencing note: this is the concrete first step of §31's "exception-code
   mirror is broken on both sides" fix, and it feeds directly into §10's
   frontend `ExceptionCode`-parity fix and §13's "generate from backend
   enum" enhancement. Do this fix *before or alongside* those — a
   codegen/parity script run before this lands would faithfully reproduce
   the exact same typo into the generated frontend mirror.

---

### [P2] Transactional outbox applied inconsistently — tier changes & social notifications bypass it
**Where:** Only 3 emitters exist: `auth-login.service.ts`,
`auth-registration.service.ts`, `mfa.service.ts`. Writing side-effects
directly instead: `admin.resolver.ts:150-158` (`setUserTier` →
`auditLog.create` direct), `billing.service.ts:136-149,211-224` and
`stripe-webhook.controller.ts:126-144,207-217` (tier change →
`notification.create` direct), `comment.service.ts:58-63` (reply
notification direct), `messaging-friend.service.ts:34` (friend-request
notification direct, best-effort try/catch).

**What's wrong:** ADR-003:6-11 names "tier change" as a first-class outbox
use case with an at-least-once guarantee. These paths emit outside
`$transaction`, so a crash after the Postgres commit but before the
notification/audit write silently loses the event — the exact
inconsistency the outbox exists to prevent. (The Prisma writes themselves
are correctly transactional; it's the event that leaks.)

**How to fix:** Route tier changes and durable notifications through
`outbox.emit({...}, tx)` inside the existing `$transaction` blocks (e.g.
`billing.service.ts:101-129`, `admin.resolver.ts:144-158`), and let the
outbox poller fan out to notification/audit/WS, matching the auth paths.
Best-effort realtime frames can still fire directly for latency.

### [P2] Friends-only DM "no-Postgres hot path" is only half-implemented
**Where:** Guard attaches `req.user.friends` from Redis
(`session-auth.guard.ts:168`); friendship changes sync it
(`messaging-friend.service.ts:55-57` `rewriteFieldsForUser(userId,{friends})`).
But the send paths ignore it: `messaging.resolver.ts:47` calls
`ms.sendMessage(userId, recipientId, text)` with no `friends` arg, and
`messaging-ws.gateway.ts:83-87` likewise — so
`messaging-dm.service.ts:152-160` falls to `await areFriends(...)`, a
Postgres query per message.

**What's wrong:** `AUTH.md:243-248` promises the DM authorization check
reads the Redis `friends` field "no Postgres query on the DM authorization
hot path." Enforcement is still correct, but every DM does a redundant
`friendship.findFirst`. The optimization's write half is wired; the read
half is not. (WS sockets additionally never load `friends` onto the socket
in `handleAuth` — `realtime.gateway.ts:402-415`.)

**How to fix:** Pass the already-resolved list:
`ms.sendMessage(user.userId, input.recipientId, input.text, user.friends)`
in `messaging.resolver.ts:47`; in `messaging-ws.gateway.ts` store
`ws.friends = hash.friends` at auth (extend `AuthWs`) and pass it through
`handleDirectMessage`. `messaging-dm.service.sendMessage` already accepts
and prefers the `friends` array (`:152-153`).

### [P2] Unknown mail template silently sends a blank email
**Where:** `templates/render.ts:144-152` returns `{subject:'', html:'',
text:''}` for an unregistered template; `mail.processor.ts:33-45` then uses
`rendered?.subject ?? email.subject`.

**What's wrong:** `??` only falls back on null/undefined, not empty
string, so an unknown template yields `subject=''` and `html/text=''` →
`MailTransport.send` ships `<p></p>` with an empty subject rather than
falling back to the persisted `email.subject` or failing loudly. Any future
`enqueue({template:'new-thing'})` without a matching renderer emails blanks
with no error.

**How to fix:** In `render.ts:145-151` throw (or return `null`) for an
unknown template, and have `mail.processor.ts` treat a null render as "use
`email.subject` + a minimal body" or mark the row `FAILED` with a clear
`lastError`. Alternatively make the fallback truthiness-based:
`rendered?.subject || email.subject`.

---

### [P3] `project-tasks` `tasks` query returns all tasks with no per-user scoping
**Where:** `project-tasks.resolver.ts:20-23` → `tasks.findAll()` returns
every `Task` for any authenticated session (guarded by `SessionAuthGuard`
only).

**What's wrong:** No owner/tenant filter — any logged-in user sees all
tasks. The module is a real domain resolver (Task→Project→Org→User),
though its header comment frames it as an FK-depth/validator demo. If it's
meant as product surface, this is a horizontal data-exposure gap; if demo,
it should be labeled/gated.

**How to fix:** Scope `findAll` by `@CurrentUser().userId` (e.g. tasks in
the caller's orgs/teams, which the session hash already carries as
`orgIds`/`teamIds`), or explicitly mark the module demo-only and move it
out of the product surface.

### [P3] Doc drift — WS auth reply frame
**Where:** `REALTIME.md:22` documents `Server → Client: { type:
"auth-ok" }`, but the server sends `{ type: "authenticated" }`
(`realtime.gateway.ts:442`), which matches `AUTH.md:236`.

**How to fix:** Update `REALTIME.md` §2 to `authenticated` (and its §11
references), or standardize the emitted frame — the two docs disagree;
code + `AUTH.md` are the majority. (One of four independent doc-drift
findings across this review — see §31.)

### [P3] Doc drift — `AuthPayload` "five values" claim
**Where:** `AUTH.md:19` — "All five values are also returned in the
GraphQL `AuthPayload` body." Only four token fields exist there;
`refreshToken` is cookie-only (see the P1 e2e finding above).

**How to fix:** Correct `AUTH.md` to "four" and note the refresh token is
delivered as an httpOnly cookie / Postgres `Session`, not in the payload.

### [P3] Test-coverage gaps on high-value real-app files (zero sibling `.spec.ts`)
**Where:** Notable un-spec'd product code: `auth/auth-registration.service.ts`
(owns register + verify-email + password-reset), `auth/auth-login.service.ts`,
`auth/auth-token.service.ts`, `auth/auth-session.service.ts`,
`auth/session-hydration.service.ts`, `billing/billing.resolver.ts`,
`billing/stripe-webhook.controller.ts`, `billing/wallet.service.ts`,
`messaging/messaging-dm.service.ts` + `messaging-friend.service.ts` +
`messaging.resolver.ts`, `notification/notification.service`-adjacent
processors, `upload/*`, `users/users.service.ts`, `profile/profile.resolver.ts`.

**What's wrong:** The most security/billing-sensitive services (token
issuance, password reset, Stripe webhook, DM authorization) have no unit
coverage; regressions like the P0/P1 findings above would be caught by even
thin service-level specs.

**How to fix:** Prioritize specs for `auth-registration.service`,
`auth-token.service` (assert the issued quadruple + a future `refresh`),
`stripe-webhook.controller` (signature + tier propagation), and
`messaging-dm.service` (friends-only enforcement).

## 17. Core-domain enhancements

### [Enhancement] Ship the `refresh` operation the whole design assumes
**Why:** The P0 finding shows every subsystem (guard midnight cutoff,
ADR-004 tier propagation, REALTIME.md reconnect, e2e) is written against a
`refresh` that doesn't exist. This is the single highest-leverage addition
in this document.

**How:** `AuthResolver.refresh` (CSRF-guarded) → `AuthSessionService.refresh(ctx)`
validating the opaque refresh token against the Postgres `Session` row,
then `issueTokens` + revoke-old; add BFF `/api/auth/refresh`. Wire the
frontend `apiFetch` 401→refresh→retry to it.

### [Enhancement] Outbox retention/compaction job
**Why:** ADR-003:44 flags unbounded `OutboxEvent` growth; no reaper exists.

**How:** A scheduled `OutboxService` task deleting `PUBLISHED` rows older
than N days (`SELECT ... FOR UPDATE SKIP LOCKED` batch delete), configurable
retention.

### [Enhancement] Carry `friends` onto the WS socket at auth
**Why:** Completes the Redis-hash DM hot path and removes per-message
Postgres reads on both GraphQL and WS DM paths.

**How:** Set `ws.friends = hash.friends` in `realtime.gateway.ts:402-415`;
keep it fresh by having `rewriteFieldsForUser({friends})` also emit a
`friends-changed` frame the gateway applies to live sockets.

### [Enhancement] Contract test that pins the schema surface
**Why:** The missing `refresh`/`refreshToken` P0/P1 pair would have been
caught by a snapshot of `schema.gql`'s Mutation/AuthPayload.

**How:** A jest test importing the generated SDL and asserting the
presence of `refresh` and the exact `AuthPayload` field set; fail CI on
drift.

---

## III.B — Platform, infrastructure & the recipe-module sprawl

**Scope covered:** `config/`, the infra slice of `common/`, `middleware/`,
`throttle/`, `caching/`, `redis/`, `logging/`, `telemetry/`, `compression/`,
`vault/`, `broker-transports/`, `prisma/` (module + schema + migrations),
`outbox/` (mechanism), `health/`, `sse/`, `streaming/`, `versioning/`,
`als/`, `providers/`, plus deployment (`Dockerfile`, `k8s/`, `docker/`,
root `docker-compose.yml`), CI (`backend-ci.yml`), all 8 jest configs, and a
breadth pass over the ~25 NestJS-docs recipe modules (alt-ORMs, federation,
gRPC, microservices, custom-transport, and the smaller single-concept
recipes).

**Live-state note:** at audit time `docker ps` showed only `postgres`,
`redis`, `app`, `nextjs` running (`app`/`nextjs` **unhealthy**); the ELK
stack was **not** running, so live ES index counts could not be verified —
the logging pipeline was traced statically (§27). `pnpm test:cov` **was**
run locally (exit 1 — see §25).

Cross-references to `project-enhance-3.md`'s existing "Backend code audit"
section are marked `[enhance-3 XX]`.

## 18. Config & secrets

### [P1] k8s `secret.example.yaml` omits `ENCRYPTION_KEY`, which is required in production → prod boot aborts on Joi
**Where:** `nest-js-boilerplate/k8s/secret.example.yaml` (`stringData` has
`DATABASE_URL`/`JWT_SECRET`/`COOKIE_SECRET`/`CSRF_SECRET`/`RESEND_API_KEY`/
`VAPID_PRIVATE_KEY` — **no `ENCRYPTION_KEY`**);
`nest-js-boilerplate/src/config/env.validation.ts:30-34`;
`nest-js-boilerplate/k8s/configmap.yaml` sets `NODE_ENV: "production"`.

**What's wrong:** `ENCRYPTION_KEY: Joi.string().min(16).when('NODE_ENV', {
is: 'production', then: Joi.required() })`. The ConfigMap forces
`NODE_ENV=production`, so any deploy that follows `secret.example.yaml`
verbatim boots with `ENCRYPTION_KEY` unset and Joi `abortEarly:false`
throws at startup — the pod crash-loops. `COOKIE_SECRET` (also
prod-required, line 24-28) *is* present, so this is a silent one-key gap
that only surfaces at deploy time. `TOKEN_DERIVATION_SECRET` is likewise
absent (optional, so no crash, but see below).

**How to fix:** Add `ENCRYPTION_KEY: "CHANGE_ME"` (and
`TOKEN_DERIVATION_SECRET`) to `k8s/secret.example.yaml` `stringData`,
matching the required set in `env.validation.ts`. Add a CI/lint check that
diffs the Joi-required prod keys against `secret.example.yaml`.

### [P2] `TOKEN_DERIVATION_SECRET` is optional in every environment, including production
**Where:** `nest-js-boilerplate/src/config/env.validation.ts:29` —
`TOKEN_DERIVATION_SECRET: Joi.string().min(16).optional()`.

**What's wrong:** Every other security secret (`JWT_SECRET`, `CSRF_SECRET`,
prod `COOKIE_SECRET`/`ENCRYPTION_KEY`) is `required` or prod-`required`. If
`TOKEN_DERIVATION_SECRET` feeds any HMAC/derivation for device tokens and
is unset, the code silently degrades to an empty/undefined key rather than
fail-closed. (The consumer lives in the crypto/device area covered in
III.A; the validation gap itself is infra.)

**How to fix:** Promote to the same `.when('NODE_ENV', { is:'production',
then: Joi.required() })` shape as `ENCRYPTION_KEY`, so a missing derivation
secret aborts a prod boot instead of degrading.

### [P3] `database.config.ts` `registerAs('database')` namespace is never loaded — dead demo config
**Where:** `nest-js-boilerplate/src/config/database.config.ts:6`;
`nest-js-boilerplate/src/app.module.ts:82` — `ConfigModule.forRoot({
isGlobal: true, validationSchema, validationOptions })` has **no `load:`
array**.

**What's wrong:** The namespaced config is defined but never registered, so
`config.get('database.host')` returns `undefined` at runtime. It exists
only to demonstrate the `registerAs` pattern but isn't wired, so the
config-demo surface is misleading.

**How to fix:** Either add `load: [databaseConfig]` to
`ConfigModule.forRoot`, or annotate it clearly as an unwired doc-example.

**Positive:** Joi validation *is* enforced (`env.validation.ts` wired at
`app.module.ts:82`), JWT/CSRF secrets are `required` with `min(16)`, no
hardcoded weak JWT fallback in prod. Root `.env.example` is structure-only
(commented). The live root `.env` holding a Vault token was already
flagged `[enhance-3 LS-1]` and is still present (not re-deep-dived; secret
values not printed here).

## 19. Security middleware stack

### [P1] Global rate limiter uses in-memory storage while the app runs 2 replicas → limits are per-pod, not cluster-wide
**Where:** `nest-js-boilerplate/src/app.module.ts:129` —
`ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 120 }] })` (no
`storage:`); `nest-js-boilerplate/k8s/deployment.yaml:8` — `replicas: 2`.

**What's wrong:** `@nestjs/throttler` defaults to in-process memory
storage. With N replicas the effective limit is N×120/min and every
counter resets on pod restart/rollout. The security-sensitive per-route
overrides — login `@Throttle({default:{limit:10,ttl:60000}})` and
password-reset `@Throttle({default:{limit:5,ttl:300000}})` at
`nest-js-boilerplate/src/auth/auth.resolver.ts:27,56` — are therefore only
per-pod, materially weakening brute-force/enumeration protection behind a
load balancer.

**How to fix:** Configure a shared Redis store
(`ThrottlerModule.forRootAsync` with `storage: new
ThrottlerStorageRedisService(redis)` from
`@nest-lab/throttler-storage-redis`). Redis + `ioredis` are already
dependencies and `REDIS_CLIENT` is a global provider.

### [P2] CSRF guard appears on only one cookie-driven mutation — verify refresh AND logout are both covered
**Where:** `nest-js-boilerplate/src/csrf/csrf.guard.ts`; single usage at
`nest-js-boilerplate/src/auth/auth.resolver.ts:50` (`@UseGuards(CsrfGuard)`),
grep found no others.

**What's wrong:** The double-submit design is sound (guard on
cookie-authed mutations, bearer traffic untouched —
`csrf.middleware.ts:18-38`, `csrf.module.ts:6`). But only one mutation
carries the guard. If both `refresh` (once it exists — §16) and `logout`
(and any other endpoint relying on the ambient
`access_token`/`__Host-access_token` cookie) are state-changing, each must
carry it.

**How to fix:** Confirm every cookie-authenticated GraphQL mutation carries
`@UseGuards(CsrfGuard)`; consider a lightweight test asserting the
CSRF-sensitive operation set. Apply to the new `refresh` mutation from §16
when it's built.

**Positive / skim:** `helmet` CSP is prod-only by design (`main.ts:81` —
off in dev to keep Apollo Sandbox usable). CORS at `main.ts:93-95` derives
origins from `CORS_ORIGIN` (comma-split) or `false`, with
`credentials:true`; no wildcard-with-credentials footgun observed.

## 20. Caching & Redis

### [P2] `CacheAsideService.getOrFetch` has no stampede protection → thundering herd on hot-key expiry
**Where:** `nest-js-boilerplate/src/caching/cache-aside.service.ts:71-81`.

**What's wrong:** On a cache miss every concurrent caller runs `fetch()`
(no single-flight lock/`SET NX`), so when a hot key expires all in-flight
requests hit the backing store simultaneously. Also `getOrFetch` never
caches a legitimately-`null` fetch result (`cached !== null` at line 77),
so null/empty values re-query every time (no negative caching).

**How to fix:** Add a per-key single-flight lock (Redis `SET key <token>
NX PX <lock-ttl>`, or an in-process promise map keyed by `key`) around the
`fetch()`; sentinel-cache misses to add negative caching.

### [P2] Two competing cache abstractions coexist
**Where:** `@nestjs/cache-manager` (package.json dep) + the hand-rolled
`CacheAsideService` (ioredis). `[enhance-3 AR-3]` — still true.

**What's wrong:** Two ways to cache with different TTL/serialization
semantics invites drift and inconsistent invalidation.

**How to fix:** Pick one for real product paths (`CacheAsideService` is the
more capable, with `SCAN` invalidation); keep `cache-manager` only as a
labelled recipe.

**Positive:** `invalidate()` now uses cursor-based `SCAN` not blocking
`KEYS` (`cache-aside.service.ts:33-48`) — `[enhance-3 OB-5]` **resolved**.

### [P2] Redis clients and BullMQ never read `REDIS_PASSWORD`/TLS, though the k8s secret documents it
**Where:** `nest-js-boilerplate/src/redis/redis.module.ts:19,28` (`new
Redis({ host, port, lazyConnect })`); `nest-js-boilerplate/src/app.module.ts:86-89`
(BullMQ `connection: { host, port }`);
`nest-js-boilerplate/k8s/secret.example.yaml` comments `# REDIS_PASSWORD:
"CHANGE_ME"`.

**What's wrong:** Neither the two ioredis clients nor the BullMQ connection
factory reads `REDIS_PASSWORD` or any TLS option. Managed/prod Redis almost
always requires AUTH (and often TLS), so a real deployment cannot
authenticate — the documented secret is a no-op.

**How to fix:** Read `password: config.get('REDIS_PASSWORD')` (and optional
`tls: {}` when `REDIS_TLS==='true'`) in both the
`REDIS_CLIENT`/`REDIS_SUBSCRIBER` factories and the BullMQ
`forRootAsync` factory.

### [P3] `RedisHealthIndicator` uses the deprecated Terminus `HealthIndicator`/`HealthCheckError` API
**Where:** `nest-js-boilerplate/src/redis/redis-health.indicator.ts:11,21`.

**What's wrong:** Terminus 11 deprecates class-based `HealthIndicator` +
`HealthCheckError` in favor of `HealthIndicatorService`. Works today; will
warn/break on the next major.

**How to fix:** Migrate to `HealthIndicatorService.check(key).up()/down()`
when convenient.

## 21. Queues & brokers

### [P2] Kafka is recipe-only except `FrontendEventConsumer`, which defaults **on** while Kafka is not in the default stack
**Where:** `nest-js-boilerplate/src/outbox/frontend-event.consumer.ts` —
`this.config.get('FRONTEND_EVENTS_CONSUMER_ENABLED', 'true')` (default
**'true'** in code) and `KAFKA_BROKER ?? 'localhost:9092'`;
`docker-compose.yml:114-131` — Kafka is under `profiles: ["kafka","all"]`
(absent from a plain `docker compose up`); `k8s/configmap.yaml` sets
`FRONTEND_EVENTS_CONSUMER_ENABLED: "false"`.

**What's wrong:** Out of the box (code default true, no explicit env, no
Kafka service) the consumer connects to a non-existent broker and
retries/logs errors on every boot — matching `docs/todo/02-backend.md`'s
"Kafka consumer first-boot race … 'This server does not host this
topic-partition'". The main event pipeline is BullMQ/Redis, so Kafka is
effectively recipe + this one optional consumer.

**How to fix:** Flip the code default to `'false'` (opt-in), and when the
kafka profile is active add `admin.createTopics(['frontend-events'])` on
boot (or `app depends_on kafka: service_healthy`).

**Positive:** The **transactional outbox** is production-grade —
`nest-js-boilerplate/src/outbox/outbox.service.ts:88-171`: `FOR UPDATE
SKIP LOCKED` batch claim, stale-`PUBLISHING` reclaim (>5 min), dead-letter
cutoff, exponential backoff, correlation-id stamping. Real broker =
BullMQ→Redis (`outbox.module.ts:13`). The four `broker-transports/`/
`custom-transport/` recipes (RabbitMQ/NATS/MQTT/Redis/in-memory) are
cleanly recipe-only.

## 22. Prisma schema & migrations

### [P1] Compose `migrate` service uses `prisma db push --accept-data-loss`, diverging from `migrate deploy` everywhere else
**Where:** `docker-compose.yml:166` — `command:
["node_modules/.bin/prisma", "db", "push", "--accept-data-loss"]`; vs
`nest-js-boilerplate/Dockerfile:31` migrate target `CMD [... "migrate",
"deploy"]`, CI `backend-ci.yml:77` (`pnpm db:deploy` = `prisma migrate
deploy`), and `k8s/migrate-job.yaml:33` (`prisma migrate deploy`).

**What's wrong:** `db push` ignores the `prisma/migrations/` directory and
force-syncs the DB to `schema.prisma`, so local/compose environments never
exercise the migration files that CI and prod apply. The
`--accept-data-loss` flag is a standing footgun (the inline comment
documents a prior live-DB wipe between 2026-06-19 and 2026-07-17). Schema
drift between the two paths goes undetected locally.

**How to fix:** Change the compose `migrate` service to `prisma migrate
deploy` (same as prod) so all environments apply the same migrations; keep
`db push` only for an explicit throwaway "prototype" profile.

### [P1] Raw-SQL migrations (pg_trgm extension + GIN trigram indexes) are silently absent in the `db push` path
**Where:**
`nest-js-boilerplate/prisma/migrations/20260711000000_add_outbox_updatedat_and_pgtrgm/migration.sql`
(`CREATE EXTENSION IF NOT EXISTS pg_trgm;` + `CREATE INDEX ... USING gin
(title gin_trgm_ops)`);
`.../20260711000001_add_post_content_gin_index/migration.sql` (`... USING
gin (content gin_trgm_ops)`).

**What's wrong:** GIN-trigram indexes and the `pg_trgm` extension cannot be
expressed in `schema.prisma`, so they exist only in migration SQL. Because
compose uses `db push` (finding above), **local/compose databases never
get `pg_trgm` or the trigram indexes** — any post title/content substring
search either errors (`operator % unknown`) or silently seq-scans.
`schema.prisma` is therefore not the full source of truth for the local DB.

**How to fix:** Fixing the migrate-service divergence above resolves this.
Interim: document that trigram search requires `migrate deploy`; optionally
add a `prisma db execute` bootstrap for the extension in the compose path.

### [P2] Four migration folders use a non-standard 8-digit date prefix (hand-authored)
**Where:** `nest-js-boilerplate/prisma/migrations/20260701_add_device_ip/`,
`20260701_add_image_url/`, `20260701_add_post_notification_type/`,
`20260701_add_push_subscription/` (contents are simple hand-written `ALTER
TABLE`s, e.g. `20260701_add_device_ip/migration.sql`).

**What's wrong:** Prisma generates `YYYYMMDDHHMMSS_name` (14 digits). These
use `YYYYMMDD_name`, so they sort ambiguously against same-day 14-digit
folders like `20260701120000_add_device_token` (lexicographic `_` vs
digit), risking wrong apply order on a fresh DB.

**How to fix:** Rename to the full 14-digit timestamp form; verify apply
order on a clean database.

### [P3] `Post.coverImage Bytes?` stores raw image bytes in Postgres (redundant with `imageUrl`)
**Where:** `nest-js-boilerplate/prisma/schema.prisma:660` (`coverImage
Bytes?`) alongside `:661` (`imageUrl String?`). `[enhance-3 PR-4]` — still
true.

**How to fix:** Drop `coverImage`; images belong in MinIO/object storage
referenced by `imageUrl`.

### [P3] `Device` and `Notification` lack `updatedAt`
**Where:** `schema.prisma:379-394` (Device — `createdAt` only), `:775-791`
(Notification — `createdAt` only). `Friendship` (`:735-747`) now has
`@updatedAt`. `[enhance-3 PR-5]` — partially addressed.

**How to fix:** Add `updatedAt DateTime @updatedAt @db.Timestamptz(6)`
where mutation timestamps matter (Device trust/lastSeen; Notification
readAt).

**Positive:** The schema is genuinely high quality — every PK `uuid(7)`
(time-ordered), `timestamptz(6)` throughout, `Decimal` for money
(`Wallet`/`WalletTransaction` with `idempotencyKey @unique`), thorough FK +
composite indexing, and deliberate `onDelete` (Cascade for owned children,
SetNull for optional refs, Restrict for owners/creators). One latent note:
`User.email @unique` (`:243`) is case-sensitive (no `citext`) →
`A@x.com`/`a@x.com` can coexist as two accounts.

## 23. Health checks

**Positive:** `nest-js-boilerplate/src/health/health.controller.ts` —
liveness (`GET /health`) = heap only; readiness (`GET /health/ready`) =
**real** Prisma DB ping + Redis ping + heap (not a stub). k8s probes map
correctly: startup+liveness→`/health`, readiness→`/health/ready`
(`k8s/deployment.yaml:48-67`).

### [P2] Container/compose healthchecks probe liveness (`/health`), not readiness → "healthy" while DB/Redis are down
**Where:** `docker-compose.yml:184` (`curl -sf
http://localhost:3000/health`); `nest-js-boilerplate/Dockerfile:47-48`
(`HEALTHCHECK` → `/health`).

**What's wrong:** Both hit the liveness endpoint, which only checks heap. A
container with an unreachable database reports `healthy`, and compose
`depends_on: condition: service_healthy` for `app` is satisfied even when
the app can't serve.

**How to fix:** Point the compose/Docker healthchecks at `/health/ready`
(keep k8s liveness on `/health`).

### [P2] gRPC port (5050) has no health probe anywhere
**Where:** `main.ts:148-149` starts the gRPC microservice on 5050; compose
(`:184`) and k8s only probe HTTP. `docs/todo/02-backend.md` notes this.

**How to fix:** Add a gRPC health service (`grpc.health.v1.Health`) and a
probe, or document that gRPC liveness is inferred from the HTTP process.

## 24. Deployment (Dockerfile / k8s / compose)

### [P2] k8s docs and migrate-job reference `Dockerfile.prod`, which does not exist
**Where:** `nest-js-boilerplate/k8s/README.md:20-22` and
`nest-js-boilerplate/k8s/migrate-job.yaml:4` say `docker build -f
Dockerfile.prod --target migrate ...`; the repo has only
`nest-js-boilerplate/Dockerfile` (verified — no `Dockerfile.prod`).

**What's wrong:** Every documented k8s image-build command fails with
"Dockerfile.prod: no such file". Compose builds from the default
`Dockerfile`, so the two build stories disagree.

**How to fix:** Rename references to `Dockerfile`, or add a
`Dockerfile.prod` alias.

### [P2] Runtime image inherits build toolchain (build-essential, python3) from the base stage
**Where:** `nest-js-boilerplate/Dockerfile:1-9` (base installs `openssl
ca-certificates python3 build-essential`); `:33` `FROM base AS runtime`.
`[enhance-3 DK-1]` — still true.

**What's wrong:** The final runtime image inherits compilers/headers it
never uses, inflating size and attack surface.

**How to fix:** Split a lean `runtime-base` (only `openssl
ca-certificates`) from the `builder-base` that carries
`build-essential`/`python3`; base `runtime` on the lean one.

### [P2] `x-logging` compose anchor is defined but referenced by zero services → no log rotation, and the fluentd driver is never wired
**Where:** `docker-compose.yml:4-8` defines `&default-logging` (json-file,
`max-size:10m`, `max-file:3`); grep shows **no** `<<: *default-logging` and
**no** `logging:` block on any service.

**What's wrong:** (a) The rotation policy is dead — every container uses
the daemon default (unbounded json-file). (b) More importantly, no service
declares `logging: driver: fluentd` (see §27, OBS-1).

**How to fix:** Either apply `<<: *default-logging` to services (rotation)
or wire the fluentd driver on `app`/`nextjs` (observability) — see §27.

### [P3] ELK services have no compose `profiles:` (always-on) and `db push --accept-data-loss` remains the default local migrate
**Where:** `docker-compose.yml:222-270` (elasticsearch/kibana/fluent-bit —
no `profiles:`) vs brokers/mongo/kafka which are opt-in; `:166` `db push
--accept-data-loss`.

**What's wrong:** A plain `docker compose up` starts the heavy ELK trio
unconditionally (unlike other optional infra), and always runs the
data-loss-capable migrate. Inconsistent opt-in policy.

**How to fix:** Put ELK behind a `logging`/`observability` profile; see the
migrate-command finding in §22.

**Positive:** Dockerfile is a correct multi-stage build
(base→builder→pruner→migrate→runtime), non-root `USER node`, `pnpm prune
--prod`, `STOPSIGNAL SIGTERM`, cache-mounted pnpm store. k8s is hardened:
`runAsNonRoot`, `runAsUser 1000`, `drop:["ALL"]`, `seccompProfile
RuntimeDefault`, `readOnlyRootFilesystem` + `/tmp` emptyDir, startup/
liveness/readiness probes, `preStop sleep 10` drain,
`terminationGracePeriodSeconds 40`, resource requests/limits with
`NODE_OPTIONS=--max-old-space-size=384` under the 512Mi limit.
`configmap.yaml` provides `REDIS_HOST`/`DATABASE_HOST` so readiness pings
resolve. Compose `depends_on` graph for `app` (vault-init completed,
migrate completed, postgres healthy, redis healthy) is correct.

## 25. CI (`backend-ci.yml`)

### [P0] `pnpm test:cov` fails the coverage gate on every run → the whole `test` job is red, blocking `test:e2e`/fallow
**Where:** `.github/workflows/backend-ci.yml:81` (`- run: pnpm
test:cov`); `nest-js-boilerplate/package.json:227-238` jest
`collectCoverageFrom: ["**/*.(t|j)s"]` + `coverageThreshold.global
{statements:55, branches:40, functions:45, lines:55}`.

**What's wrong:** Verified locally — `pnpm test:cov` exits **1**:
```
Jest: Coverage for statements (3.37%) does not meet "global" threshold (55%)
Jest: Coverage for branches (7.45%) does not meet "global" threshold (40%)
Jest: Coverage for lines (3.19%) does not meet "global" threshold (55%)
Jest: Coverage for functions (1.06%) does not meet "global" threshold (45%)
Test Suites: 48 passed ... Tests: 330 passed ... [ELIFECYCLE] Command failed with exit code 1.
```
330 unit tests pass, but the coverage threshold is unreachable because
`collectCoverageFrom` sweeps all **3,160** `src/*.ts` files (incl. the
~2,400-file `src/@generated` Prisma output and ~90 recipe modules that have
only *e2e* coverage, which doesn't count toward this run) into the
denominator, while only 48 unit-spec suites execute. Since the `test:cov`
step precedes `test:e2e` (`:89`) and the fallow steps (`:83-87`), the whole
job stops here. This overshoots the old `[enhance-3 QG-1]` ("coverage
collected but never enforced"): a threshold was added, but at a value that
can never pass.

**How to fix:** Scope coverage to real-app code and set an honest floor.
Either narrow `collectCoverageFrom` to product dirs (exclude
`@generated/**`, `**/*.module.ts`, and the recipe modules) so the %
reflects tested code, or lower the threshold to just under measured reality
and ratchet up. Do not leave a 55% floor over a 3% codebase.

### [P2] Six of the eight jest configs are never run in CI
**Where:** `.github/workflows/backend-ci.yml` runs only `test:cov` (`:81`)
+ `test:e2e` (`:89`). The other configs — `test/jest-brokers.json`,
`jest-orms.json`, `jest-cli-plugin.json`, `jest-openapi-plugin.json`,
`jest-lazy-loading.json`, `jest-swc.json` (npm scripts
`package.json:29-33`) — have no CI gate. `jest-e2e.json` explicitly
excludes broker/orm/plugin/swc specs (`testPathIgnorePatterns`).

**What's wrong:** Those suites (Kafka/NATS/MQTT/RabbitMQ brokers, the 4 alt
ORMs, CLI/OpenAPI plugin transformers, lazy-loading, SWC build) can
silently rot — `[enhance-3 TE-3]` already caught mock drift breaking
suites. They also need infra (Kafka/Mongo) CI never provisions.

**How to fix:** Add an optional CI job (or nightly) with the required
service containers that runs the six configs, so recipe breakage is
caught.

### [P2] `docker-build` job builds the image but never scans or pushes it
**Where:** `.github/workflows/backend-ci.yml:91-98` — `docker build -t
nest-backend-ci .` only. `docs/todo/04-devops.md` (trivy/grype + SBOM,
GHCR push) still open.

**How to fix:** Add trivy/grype scan + SBOM and (on tag) a GHCR push, as
the devops TODO plans.

**Positive:** CI provisions real Postgres+Redis service containers, runs
`db:deploy` (so it *does* validate the migration files), pins the pnpm
version via `packageManager`, and uses `concurrency: cancel-in-progress`.

## 26. Test infra

### [P1] Coverage threshold (55/40/45/55) is fiction vs measured (3.19% lines / 1.06% functions)
**Where:** `nest-js-boilerplate/package.json:231-238`; measured via `pnpm
test:cov` (see §25) and independently from `coverage/lcov.info` (LH 2792 /
LF 87319 = 3.20%).

**What's wrong:** For a "reference" boilerplate the number is doubly
misleading: it neither reflects real coverage nor can it pass. Most
behaviour is proven by e2e specs (which this config doesn't count), and the
denominator is dominated by generated + recipe code.

**How to fix:** As §25 — scope `collectCoverageFrom`, exclude
`@generated`, and set a threshold at/just under real coverage of the
product modules. Consider a separate e2e-coverage lane if e2e is the
intended proof surface.

**Note:** All eight jest configs are internally valid and *runnable
locally* (each has an npm script); the gap is CI wiring (§25), not dead
files.

## 27. Observability (logging / OTel)

### [P1] The documented log pipeline is not wired at the source: no compose service uses the fluentd log driver, so Fluent Bit → ES receives nothing
**Where:** `docs/logging.md:11-14` describes "Pino → stdout → Docker
fluentd driver → Fluent Bit port 24224";
`nest-js-boilerplate/docker/fluent-bit/fluent-bit.conf:1,10-13` has only an
`[INPUT] Name forward / Port 24224` (expects the Docker fluentd driver).
`docker-compose.yml` has **no `logging: driver: fluentd`** on `app` (or any
service) — grep found only the unused `x-logging` anchor (§24) and the
fluent-bit `24224` port mapping.

**What's wrong:** This is the concrete root cause of the previously-observed
"ELK healthy but zero documents" (see this project's memory): the `app`
container ships stdout to Docker's default json-file driver, never to
Fluent Bit's forward input, so every ES index stays empty. Additionally,
`logging.config.ts:42-52` offers a `LOG_FILE` file-sink "for Fluent Bit to
tail," but `fluent-bit.conf` has **no `tail` input** — so that alternate
transport isn't consumed either. **Neither** documented path is actually
connected. (Could not verify live — ELK not running at audit time.)

**How to fix:** Add to the `app` (and `nextjs`) service:
```yaml
logging:
  driver: fluentd
  options:
    fluentd-address: "localhost:24224"
    tag: app        # frontend for nextjs
    fluentd-async: "true"
```
and add `app.depends_on.fluent-bit`. Then verify with `curl -s
localhost:9200/_cat/indices?v` and `_count` per index.

### [P2] `docs/logging.md` is stale — its categories/indices don't match the code or Fluent Bit
**Where:** `docs/logging.md:3,55,267` document categories
`session|exception|page|network|database|performance` and index
`exception-logs`. Actual emissions (grep `category:` in `src`) are
`session, payment, billing, websocket-exception, network, http-exception,
database, performance, application-exception` (e.g.
`throttle/http-throttler.guard.ts:39`, `csrf/csrf.guard.ts:26`), and
`fluent-bit.conf:55` routes
`http-exception|websocket-exception|application-exception|payment|billing`
to `*-logs`. The doc's rewrite rule `^(session|exception|page|...)$` would
not match a single real backend exception event.

**What's wrong:** The doc predates the exception-category split
(http/websocket/application) and the payment/billing categories; anyone
following it will build wrong Kibana queries. `fluent-bit.conf` is the
current truth. (Another of the four independent doc-drift findings across
this review — see §31.)

**How to fix:** Regenerate `docs/logging.md`'s category/index tables from
the actual emitted categories + `fluent-bit.conf` outputs.

### [P2] OpenTelemetry exports metrics only — no trace exporter/span processor — despite the doc claiming OTLP traces
**Where:** `nest-js-boilerplate/src/telemetry/otel-setup.ts:39-58`
constructs `NodeSDK` with a `metricReader` (`OTLPMetricExporter`) and
auto-instrumentations, but **no `traceExporter`/`spanProcessors`**; the doc
comment `:21-23` states "Traces are exported via OTLP/HTTP (default
collector at :4318)."

**What's wrong:** Auto-instrumentations produce spans, but with no span
processor configured they are only exported if
`OTEL_TRACES_EXPORTER`/`OTEL_EXPORTER_OTLP_ENDPOINT` env happen to be set —
the code path itself wires only metrics, so the "traces exported" claim
isn't guaranteed. The whole SDK is also gated behind `OTEL_ENABLED`
(`main.ts:37`, default off), and there is no Prometheus `/metrics` scrape
endpoint (the `docs/todo/02-backend.md` OTel item is otherwise now largely
done vs its "no OTel at all" baseline).

**How to fix:** Pass an explicit `traceExporter: new OTLPTraceExporter()`
(or `spanProcessors: [new BatchSpanProcessor(...)]`) to `NodeSDK`, or
correct the doc comment to "metrics only." Cross-check
`docs/backend/otel.md` when reconciling.

## 28. Recipe-module sprawl

### [P2] No discoverable "Prisma is canonical; the other 4 ORMs are reference-only" statement, and no backend recipe index
**Where:** grep for `canonical|reference-only|recipe modules|kitchen-sink`
across `README.md`, `AGENTS.md`, and `docs/**` returned nothing.
`docs/backend/README.md:1-9` lists only AUTH + a feature checklist + two
research docs. There is a `docs/frontend/STATUS.md` for the frontend demos
but **no backend equivalent**.

**What's wrong:** The `src/` tree ships five ORMs (Prisma +
mikro-orm/sequelize/typeorm/mongoose), Apollo Federation, gRPC,
microservices, custom-transport, plus dozens of single-concept recipes,
with nothing that tells a reader which is production-canonical vs demo.
This is exactly the frontend's `STATUS.md` pattern (§11) left unbuilt for
the backend — the same structural gap appears on both sides of the stack
(see §31).

**How to fix:** Add `docs/backend/STATUS.md` (mirroring
`docs/frontend/STATUS.md`) that lists each recipe module, its
docs.nestjs.com page, and a one-line "reference-only" tag, with an explicit
"Prisma is the canonical/production ORM; MikroORM/Sequelize/TypeORM/
Mongoose are reference implementations."

### [P3] `versioning` (and similar) recipe modules are inert in the running app
**Where:** `nest-js-boilerplate/src/versioning/versioning.module.ts:9-18`
— its own comment notes URI versioning needs `app.enableVersioning()` at
bootstrap; `main.ts` never calls it (grep) and `VersioningModule` isn't in
`app.module.ts`. It's reached only by `test/versioning.e2e-spec.ts`.

**What's wrong:** Consistent with the isolation pattern (test-only
recipes), but a reader browsing `src/versioning/*.controller.ts` sees
version metadata that does nothing in the real app. Same shape applies to
other e2e-only recipes.

**How to fix:** Note in the proposed `STATUS.md` which recipes are
"e2e-only, not mounted in the running app," so their inertness is expected
rather than surprising.

**Positive (isolation is clean):** The alternate ORMs, `federation/`,
`microservices/`, `custom-transport/`, `mvc/`, `fastify-perf/` are **not**
imported by `app.module.ts` (verified against the full file) — each is
exercised only by its own e2e spec that builds an isolated `Test` module,
so they cannot pollute or break the production graph. Demo modules that
*are* mountable are gated behind `LOAD_DEMO_MODULES==='true' ||
NODE_ENV==='development'` (`app.module.ts:199-204`), and `UsersModule`
(which "leaks passwordHash") is correctly inside that gate with a warning
comment (`:165`).

## 29. Platform enhancements

### [Enhancement] Add a backend `STATUS.md` recipe map mirroring the frontend
**Why:** The single biggest orientation gap — five ORMs and a dozen
transports with no canonical-vs-reference map.

**How:** Generate `docs/backend/STATUS.md` from `src/*/` +
`test/*.e2e-spec.ts`, one row per recipe: module, docs.nestjs.com link,
"mounted in app / e2e-only," "reference-only vs canonical." Link it from
the root README.

### [Enhancement] Shared-Redis rate limiting + a startup warning for known dev-default secrets
**Why:** Closes the per-pod throttler gap (§19) and the devops-TODO's "warn
when NODE_ENV=production with dev-default secrets."

**How:** Wire `ThrottlerStorageRedisService`; at bootstrap, if
`NODE_ENV==='production'` and any secret matches a known dev default (e.g.
`ci-*`, all-zeros `ENCRYPTION_KEY`), log a loud warning (or refuse to
boot).

### [Enhancement] Prisma seed script + one canonical migrate path
**Why:** `docs/todo/02-backend.md` wants `prisma db seed` (fresh stack
starts empty); combined with unifying compose on `migrate deploy` (§22)
this makes local == prod.

**How:** Add `prisma/seed.ts` (demo users/org/posts) and `prisma.seed`
config; switch the compose `migrate` service to `migrate deploy`.

### [Enhancement] Observability smoke test in CI
**Why:** The zero-documents pipeline break (§27) went unnoticed because
nothing asserts logs actually land in ES.

**How:** A compose-based integration test that boots app + fluent-bit + ES,
emits one request, and asserts `GET /http-exception-logs/_count > 0` (and a
couple of other indices).

### [Enhancement] Image scanning + SBOM + GHCR publish in backend CI
**Why:** `docker-build` currently only builds (§25); devops TODO wants
supply-chain gates.

**How:** Add trivy scan + `anchore/sbom-action`, and a tag-triggered GHCR
push of the runtime + migrate targets.

## 30. Top 10 — NestJS (core + platform combined)

1. **[P0]** Implement the missing `refresh` mutation + BFF route —
   sessions are otherwise unrecoverable after one UTC day, any tier change,
   or 15 min idle. (§16)
2. **[P0]** CI `test:cov` gate is unpassable (3.19% vs 55% over the whole
   kitchen-sink + `@generated`) → backend CI red at HEAD — scope
   `collectCoverageFrom` / set an honest threshold. (§25/§26)
3. **[P1]** Attach `username/avatarUrl/locale/timezone` in
   `SessionAuthGuard` so `me` returns real data. (§16)
4. **[P1]** Fix the e2e `refreshToken`/`refresh` drift so `registerAndLogin`
   (and every dependent spec) runs again. (§16)
5. **[P1]** Logging pipeline dead at the source — wire the fluentd driver
   so Fluent Bit/ES stop indexing zero docs. (§27)
6. **[P1]** Compose `migrate` uses `db push --accept-data-loss`, diverging
   from `migrate deploy`; raw-SQL pg_trgm/GIN migrations never apply
   locally. (§22)
7. **[P1]** k8s `secret.example.yaml` omits prod-required `ENCRYPTION_KEY`
   → prod boot aborts on Joi. (§18)
8. **[P1]** Global throttler is in-memory while `replicas: 2` →
   login/MFA brute-force limits are per-pod, not cluster-wide. (§19)
9. **[P2]** Route tier changes + durable notifications through the
   transactional outbox for ADR-003 consistency; Redis AUTH/TLS unwired.
   (§16, §20)
10. **[P2]** No discoverable "Prisma canonical / other ORMs reference-only"
    statement and no backend `STATUS.md`; `docs/logging.md` stale + OTel
    exports metrics-only despite the doc claiming traces. (§27, §28)

---

## 31. Cross-stack synthesis

Findings that only become visible by reading all four reports together —
none of the four individual passes could see these on their own, since each
was scoped to one side of the stack.

### The `refresh` gap is a two-sided contract failure, not just a backend bug
The frontend independently built `next-js-boilerplate/src/api/server/auth/refresh-token.ts`
as if a backend refresh capability existed, and `docs/backend/AUTH.md`,
`docs/backend/REALTIME.md`, and ADR-004 all describe a "silent auto-refresh"
contract in detail (§16) — but the backend mutation was never built, and the
frontend helper (confirmed in §3) only re-`GET`s the current session rather
than actually refreshing it. Both sides of the stack were designed against a
capability that exists only in documentation. This explains why it survived
undetected: unit tests are mocked and don't exercise the real HTTP/GraphQL
contract; the e2e suite that *would* exercise it fails for an unrelated
reason first (querying a field, `refreshToken`, that also doesn't exist —
see §16's "e2e suite is broken" finding) so it never gets far enough to
notice the missing mutation;
and interactive testing sessions are short enough that nobody hits the
UTC-midnight cutoff or a 15-minute idle gap by accident. **Fix once, on the
backend (§16/§17), and the frontend helper becomes correct automatically**
— no frontend code change is needed once a real `refresh` mutation exists,
since `refreshTokenServer` already has the right shape to call it.

### The exception-code mirror is broken on both sides, independently discovered
The Next.js review found the frontend's `ExceptionCode` union is missing 9
of the backend's 23 codes (§10). While verifying that finding, it also
surfaced — and this document's synthesis independently re-verified in §3 —
that the backend has its **own** internal inconsistency:
`mfa.service.ts:96` throws a literal `exc` string that doesn't match the
canonical enum value, and a unit test asserts on the wrong value too, so it
locks the bug in as "tested" rather than catching it (now written up as
its own formal finding — see §16's "MFA 'not enabled' exception code"
entry for the exact fix). Neither the core-domain nor the platform backend
review flagged this on its own (it's a one-character-class typo, easy to
miss without cross-checking against the frontend's mirror); it only
surfaced because the frontend reviewer diffed both sides — a concrete
demonstration of why the cross-stack synthesis pass in this section exists
at all, not just a nice-to-have. **Sequencing:** fix §16's finding first,
then build the frontend's "[Enhancement] Generate the frontend
`ExceptionCode` from the backend enum" (§13) — a single generator/
parity-test pair, run *after* the backend typo is fixed, prevents this
whole class of bug (drift *and* internal typos) from recurring on either
side going forward.

### Four independent documentation-drift findings — none of these docs are contract-tested against the code they describe
Every one of the four review passes found the team's own documentation
asserting something no longer (or never) true in code, with zero overlap
between which docs — meaning this isn't one stale file, it's a pattern
across the whole docs tree:
- **UI/UX (§6):** `DESIGN_GUIDE.md` + `CSS-IMPROVEMENTS.md` describe a
  `.theme-*` class architecture with Ocean/Violet themes that don't exist;
  the real system is a single `.style-*` axis.
- **Next.js (§10, §11):** `proxy.ts`'s CSP-scoping rationale and the
  `(demos)/ppr` page both assume `cacheComponents` is enabled; it isn't.
- **NestJS core (§16):** `REALTIME.md`'s documented `auth-ok` frame vs the
  code's actual `authenticated`; `AUTH.md`'s "five values in the payload"
  claim vs the actual four.
- **NestJS platform (§27):** `docs/logging.md`'s category/index table
  predates the http/websocket/application exception-category split and the
  payment/billing categories entirely.

None of these docs have any automated check that they still match the code
— they were each hand-written once and have decayed independently. Given
the volume, a single documentation-freshness pass (not a new tool, just an
edit pass across `DESIGN_GUIDE.md`, `CSS-IMPROVEMENTS.md`, `AUTH.md`,
`REALTIME.md`, `docs/logging.md`, `docs/backend/otel.md`) would resolve all
four at once and is cheap relative to everything else in this document —
see §32 Phase E.

### The "demo/recipe surface" pattern repeats on both sides, with complementary gaps
Both apps deliberately ship a large "implement every doc feature as working
code" surface alongside the real product — frontend's `(demos)/` +
`v1/[lang]/ui/*` gallery, backend's five-ORM + federation/gRPC/microservices
recipe sprawl. Each side solved half the isolation problem and left the
other half undone, in complementary ways:
- **Frontend** has a discoverability doc (`docs/frontend/STATUS.md` lists
  every demo) but **no production isolation** — demos ship to the prod
  bundle, get crawled via `sitemap.ts`, and open real WebSocket connections
  (§11).
- **Backend** has clean **production isolation** (recipe modules are
  verifiably absent from `app.module.ts`'s import graph, gated behind
  `LOAD_DEMO_MODULES`) but **no discoverability doc** — nothing tells a
  reader that Prisma is canonical and the other four ORMs are reference-only
  (§28).

Each side already solved the problem the other side has open — worth
fixing as a matched pair (§13 Enhancement + §29 Enhancement) rather than
two unrelated tickets, since the backend's `STATUS.md` proposal is
literally modeled on the frontend's existing one, and the frontend's
env-gating proposal is modeled on the backend's existing
`LOAD_DEMO_MODULES` pattern.

### A recurring theme across all four reports: the central/documented system exists, production code doesn't call it
This shape recurs at least three times independently: (1) frontend's
`getSurface`/`exceptionHandler` central error-router is only reached from
the Forms Gallery demo — real `register-form.tsx`/`login-form.tsx` hand-roll
`exc === "..."` checks instead (§11); (2) the `IconButton` primitive that
correctly forces an accessible `label` has **0%** adoption in real views —
26 files hand-roll raw `<button>` instead (§6); (3) the `Empty` component
with its polished icon/title/description/action API is used in only 3
views, all demos — 5+ real data views hand-roll 5 different empty-state
layouts (§6). In each case the *right* abstraction was already built and
is high quality — the gap is purely adoption in the views that came after
it, suggesting these primitives were built alongside one feature and never
back-filled or enforced elsewhere. A lint rule or dependency-cruiser rule
per case (already proposed individually in §7 and §13) would prevent this
from recurring a fourth time.

---

## 32. Suggested execution order

A single sequenced roadmap across all three review parts, ordered by
dependency and severity rather than by document section. Each item links
back to its full write-up; this list intentionally does not re-explain
anything already detailed above.

**Phase A — Stop the bleeding (both P0s; nothing below is fully trustworthy until these land)**
1. Backend: implement the `refresh` mutation + BFF `/api/auth/refresh`
   route (§16, §17 Enhancement). Highest-leverage single fix in this
   document — unblocks the e2e suite, fixes the daily-logout/tier-change/
   idle-timeout bugs, and matches a contract three separate docs already
   describe.
2. Backend: attach the four missing fields in `SessionAuthGuard` so `me`
   works (§16 P1) — small, mechanical, touches the same guard as #1.
3. Backend: fix the e2e `refreshToken`/`refresh` schema drift (§16 P1) —
   depends on #1's exact design (cookie-only vs body field).
4. Backend: scope `collectCoverageFrom` / set an honest coverage threshold
   so CI stops being red at HEAD on every run (§25, §26).

**Phase B — Security & production-readiness gaps**
5. Frontend: add a baseline app-wide CSP (§10 P1).
6. Backend: add `ENCRYPTION_KEY`/`TOKEN_DERIVATION_SECRET` to the k8s
   secret example and prod-require the latter (§18).
7. Backend: wire shared-Redis throttler storage for cluster-wide rate
   limiting (§19, §29 Enhancement).
8. Backend: wire Redis AUTH/TLS in both ioredis clients and BullMQ (§20).
9. Backend: switch compose `migrate` to `prisma migrate deploy` (§22) —
   unblocks the pg_trgm/GIN indexes matching what prod actually runs.

**Phase C — Correctness & data-integrity**
10. Fix the exception-code system on both sides in one pass: backend's
    `EX_MFA_NOT_ENABLED` typo + its wrong-asserting test (§16 P2), then
    generate/parity-test the frontend mirror (§10 P1, §13 Enhancement,
    §31).
11. Frontend: fix the `views/messages/FreePageView.tsx` two-layer
    violation (§10 P1).
12. Backend: route tier changes and durable notifications through the
    transactional outbox consistently (§16 P2).
13. Backend: wire the fluentd log driver so the logging pipeline actually
    reaches Elasticsearch (§27 P1).

**Phase D — Accessibility (one focused pass, high real-user impact)**
14. Frontend: `text-white` → `text-brand-fg` sweep, 36 files (§6 P1).
15. Frontend: migrate the 26 hand-rolled icon `<button>` files to
    `IconButton` (§6 P1).
16. Frontend: mobile sidebar `inert`/focus-trap/Escape/focus-return (§6
    P1).
17. Frontend: `<main>` landmark + skip-link + a `<PageHeader>` rollout for
    the missing `<h1>`s (§6 P1).

**Phase E — Documentation truth pass (cheap, prevents future misdirection; do as one batch since it's the same kind of edit four times)**
18. Rewrite `DESIGN_GUIDE.md` + `CSS-IMPROVEMENTS.md` to the real
    `.style-*` system (§6 P3, high-impact).
19. Fix `AUTH.md`'s "five values" claim and `REALTIME.md`'s `auth-ok` vs
    `authenticated` mismatch (§16 P3).
20. Regenerate `docs/logging.md`'s category/index table; correct or
    implement the OTel traces claim (§27 P2).
21. Add `docs/backend/STATUS.md` (§28, §29 Enhancement) alongside the
    frontend's demo-isolation fix (§11 P2, §13 Enhancement) as a matched
    pair.

**Phase F — Everything else**
The remaining ~30 P2s and ~20 P3s (component-consistency polish, cache-
stampede protection, deprecated Terminus API, migration-filename
normalization, the six never-run jest configs, image-scanning in CI, and
the rest) are fully detailed in their respective sections above and don't
block anything else in this list. Recommend tracking them the way this
project already tracks multi-session work — a `docs/progress/phaseN.md`
checkbox tracker per this project's established phased-roadmap convention —
rather than working the remaining ~50 items ad hoc.
