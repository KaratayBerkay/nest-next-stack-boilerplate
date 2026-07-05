# Phase 11 — Phase 10 remediation: post-detail live renew fix, close-out bookkeeping, verification gate

> Execution tracker for the eleventh phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-04 · Status: **not started**

Scope note (2026-07-04): This is a **remediation / close-out** phase, not a new
feature phase. The Phase 10 verification found that the bulk of Phase 10 landed
and both apps build clean, but one user-facing feature is **broken**
(post-detail live renew) and two required stages never ran (docs/bookkeeping,
the formal gate). Per the roadmap workflow we do not open new scope until the
current phase closes — so Phase 11 exists solely to carry Phase 10 across the
line. Naming follows the repo convention `docs/progress/phaseN.md`
(`phase11.md`, no hyphen) so the phase-queue links stay consistent. No code was
written for this tracker (planning only).

## Carried from Phase 10 (verified state)

For the record, these Phase 10 tasks are **done and verified in code** (builds +
lint green, evidence below): T1 lint pin, T2 polish sweep, T3 `/api/auth/token`
repoint, T5 DM-unread → bell aggregate, T6 open-thread read-clear + decrement,
T9 N-user room deliver/echo, T10 feed topic watch, T12 feed/post renew key,
T13 loading-until-stable (messages), T14 3-state badge. T7 (room presence) and
T8 (first-arrival stability) are **functionally working with a spec deviation**
(see D1/D2). What follows is the broken feature, the two unrun stages, and the
residual deviations.

Build/lint evidence (2026-07-04, local):
- frontend `pnpm lint` → **0 errors**, 9 pre-existing warnings; `next build` → clean.
- backend `nest build` (with `DATABASE_URL` set) → clean; `prisma generate`
  fails only when `DATABASE_URL` is absent (known env requirement).
- backend `tsc --noEmit` → **errors in `test/secure-cookies.e2e-spec.ts`** (see C3).

## Critical finding — post-detail live renew is broken (was Phase 10 T11)

Spec (Phase 10 F2/T11): on `/v1/{lang}/posts/{uuid}`, a like/comment/edit from
another client must update the detail view live (no hot-reload). It does not.
Two independent root causes:

- **B1 — Topic allowlist rejects UUID post ids (root cause).** `Post.id` is
  `@default(uuid(7)) @db.Uuid` (`schema.prisma:633`) → hyphenated (e.g.
  `0192f9a0-8b1e-7def-8a3c-1234567890ab`). The topic allowlist is
  `TOPIC_ALLOWLIST = /^(feed|post:[a-z0-9]+)$/` in **two** places
  (`realtime-client.ts:9`, `realtime.gateway.ts:48`); `[a-z0-9]+` excludes `-`.
  Verified: `.test("post:<uuid>")` → **false**. So the client `watch("post:<uuid>")`
  at `posts/[uuid]/page.tsx:57` is **silently dropped** before send
  (`realtime-client.ts:118`), and an explicit watch that did reach the server
  would be rejected (`realtime.gateway.ts:377`). The feed page is unaffected
  (`"feed"` matches), which is exactly why feed renews and post does not.
- **B2 — Unmemoized context value churns effects; `unwatch` tears down the
  claim-based watch (amplifier).** The provider returns a fresh object literal
  every render (`RealtimeProvider.tsx:701–715`) and re-renders on every
  `setStatus` (idle→connecting→authenticating→open). Consumer effects keyed on
  `[realtime, …]` (post `posts/[uuid]/page.tsx:54–59`, feed `feed/page.tsx:31–34`,
  chat-room presence `chat-room/page.tsx:40–76`) re-run on each transition; each
  cleanup fires `unwatch(...)`. `unwatch` is **not** allowlist-gated on the
  client (`realtime-client.ts:123–126`), so the post `unwatch("post:<uuid>")`
  reaches the server and removes the watcher that the page-claim path added —
  while the re-run `watch(...)` is dropped by B1. Net: after the socket settles
  the viewer is **not** in the `post:<uuid>` topic, so `emitToTopic('post:<id>')`
  (`post.service.ts:105,128`, `comment.service.ts:68,99,126`,
  `reactions.service.ts:38,60,88`) never reaches it.
- **B3 — Redundant dual subscription (design smell).** Post/feed are subscribed
  **twice**: by the explicit `watch()` in the page **and** by the page-claim →
  topic translation added this phase (`realtime.gateway.ts:544–551`,
  `addToTopicWatch`, which bypasses the allowlist). Two owners with different
  allowlist behaviour is what makes B1+B2 interact badly. Pick one owner.

Note: with **B1 fixed alone**, the post page behaves exactly like the (working)
feed page — the churn becomes self-healing (cleanup `unwatch` + re-run `watch`
both delivered, ending subscribed). B1 is therefore the required correctness
fix; B2/B3 are defense-in-depth + cleanup.

## Critical finding — close-out stages never ran

- **C1 — Docs + bookkeeping not done (was Phase 10 T4).** `phase9.md` still
  reads "Status: not started" with **0/24 boxes ticked** (`phase9.md:5`);
  `phase10.md` still reads "not started / planning only" though 5 commits of its
  work are in `main`; `REALTIME.md` (`docs/backend/REALTIME.md`, mtime 07-03,
  pre-Phase-10) has **no** sections for the `DmCount` renew, feed/post
  topic-watch, connection-state mapping, room-presence frames, or the push
  `dmCount` field.
- **C2 — Formal verification gate not run (was Phase 10 T15).** Local builds +
  lint are green (above), but the two-user dev-stack walk of the four new loops
  and the prod deploy + Phase 7 gate re-walk are unproven. The gate cannot pass
  while B1 is open.
- **C3 — Backend test typecheck error blocks a green backend gate.**
  `tsc --noEmit` fails in `test/secure-cookies.e2e-spec.ts` — `Property 'session'
  does not exist on type 'PrismaService'` (5 sites). Looks pre-existing (removed
  model), not a Phase 10 regression, but it prevents C2's "backend unit tests +
  typecheck green" claim. `nest build` (src only) is unaffected.

## Residual deviations (functional, lower priority)

- **D1 — Room presence: `online-users` snapshot not subscribed (Phase 10 T7).**
  `chat-room/page.tsx:40–76` subscribes `room-counts`/`user-joined`/`user-left`
  only. The member list is populated by the `user-joined` self-echo on join, so
  it works, but the backend also sends an `online-users` snapshot
  (`realtime.gateway.ts:341,415`) that the client ignores. Either consume it for
  a deterministic initial snapshot, or drop it from the spec and document that
  the self-echo is the source of truth.
- **D2 — Chat-room "loading until room socket live" not applied (Phase 10 T8).**
  The messages page gates its thread behind `connecting` (`messages/page.tsx:514`);
  the chat-room page renders immediately with only the connecting badge
  (`chat-room/page.tsx:91`). CR1's claim-replay is handled; the loading state is
  the missing half.
- **D3 — Offline affordance shows "connecting" (Phase 10 T13).** In `offline`
  (`idle`/`down`) the messages thread renders with the input disabled and the
  placeholder set to `t.connecting` (`messages/page.tsx:626`) rather than a real
  offline state.
- **D4 — 3-state badge duplicated inline, not shared (Phase 10 T14 decision).**
  The `connectionState` derivation + ring badge are copy-pasted in
  `messages/page.tsx:247–287` and `chat-room/page.tsx:91–123`; the decision
  called for a shared derivation + presence-ring component.

## Decisions

- **Post-detail fix (B1–B3).** (1) Widen the `post:` branch of `TOPIC_ALLOWLIST`
  to accept uuid(7) ids in **both** files, byte-identical — recommended strict
  form `post:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`
  (`@db.Uuid` is lowercase; a looser `post:[a-z0-9-]+` also works). This is the
  required correctness fix. (2) Stop the effect churn by memoizing the provider
  context value, or (robust) splitting a stable commands context from the status
  context, so `watch`/`unwatch` effects never re-run on status transitions. (3)
  Settle a single subscription owner: keep the explicit page `watch()/unwatch()`
  (clear, symmetric lifecycle) and treat the page-claim topic translation as the
  fallback — or the inverse — but document which one owns it.
- **Bookkeeping (C1).** Reconcile trackers with git truth: tick `phase9.md`'s 14
  landed boxes + set status; tick `phase10.md`'s landed boxes and set its status
  to reflect what shipped vs. what carried here; update `REALTIME.md` for every
  new frame/field.
- **Gate (C2/C3).** Fix or quarantine the `secure-cookies` test typecheck first
  so "backend green" is honest, then run the full walk **after** Stage A + D
  land so one gate covers everything.
- **Residuals (D1–D4).** Treat as P2 polish; land before the gate walk so the
  gate exercises the final UX, but none block the phase if explicitly deferred.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day. Suggested order: **A (critical, unblocks the
gate) → D (cheap UX polish) → B (docs, reflect final state) → C (gate last)**.

### Stage A — Critical: post-detail live renew

- [ ] **T1 (S) — Widen topic allowlist for UUID post ids (B1).** Update
  `TOPIC_ALLOWLIST` in `realtime-client.ts:9` **and** `realtime.gateway.ts:48`
  to accept uuid(7) `post:` topics; keep the two regexes identical. No other
  topic is affected (`feed` already matches).
  *Verify:* in a node repl the new regex `.test("post:<uuid>")` → true and still
  rejects `post:` + `../` / spaces / empty; `next build` + `nest build` clean.
- [ ] **T2 (S) — Stop context-value effect churn (B2).** Memoize the
  `RealtimeContext` value (deps: `status` + the already-stable callbacks), or
  split a stable commands context from the status context so topic effects don't
  depend on `status` identity. Also removes the wasteful chat-room presence
  re-subscribe on every status change.
  *Verify:* on the post page, log `watch`/`unwatch` sends across a connect cycle
  → no unwatch/watch storm; exactly one live `post:<uuid>` watch after settle.
- [ ] **T3 (S) — Single subscription owner (B3).** Choose the explicit page
  `watch()/unwatch()` **or** the page-claim topic translation as the sole owner
  for `feed`/`post`; remove/annotate the other so there is one code path.
  *Verify:* grep confirms one owner; navigate feed→post→feed → exactly one topic
  watch per mounted page, none leaked after unmount.
- [ ] **T4 (S) — Post-detail live-renew end-to-end (closes B1–B3).** With T1–T3
  in, confirm the detail view renews.
  *Verify (two browsers):* A on `/v1/en/posts/<uuid>`, B likes/comments that
  post → A's counts update **< 1 s with no reload**; A navigates away/back →
  exactly one watch, none leaked; unknown/garbage topics still rejected.

### Stage B — Close-out bookkeeping + docs (C1)

- [ ] **T5 (S) — Reconcile phase trackers with git.** Tick `phase9.md`'s 14
  landed boxes and set its status; tick `phase10.md`'s landed boxes (T1–T3, T5,
  T6, T9, T10, T12, T13, T14) and set its status to "mostly landed — T11 + T4 +
  T15 carried to phase 11"; leave T7/T8 marked partial.
  *Verify:* every ticked box maps to a commit; no box claims work not in `main`.
- [ ] **T6 (S) — Update `REALTIME.md`.** Add/align: the `DmCount` renew frame
  (`renew:'Notifications', type:'DmCount', value`), feed/post topic-watch +
  page-claim translation, the 6-state→`offline|connecting|online` mapping, the
  room-presence frames (`room-counts`/`user-joined`/`user-left`/`online-users`),
  and the push `dmCount` field; confirm §6b `peerId`/`delivered-ack` and the
  delivered row from Phase 9 are present.
  *Verify:* doc matches code on every frame name/field; queue tables agree
  across phase8/9/10/11.

### Stage C — Verification gate (C2, C3)

- [ ] **T7 (S) — Fix/quarantine backend test typecheck (C3).** Repoint
  `test/secure-cookies.e2e-spec.ts` off the removed `PrismaService.session`
  model (rename to the current model or drop the dead assertions) so
  `tsc --noEmit` and the test suite are green.
  *Verify:* backend `tsc --noEmit` clean; `pnpm test` (or the e2e suite) runs
  without the `session` type error.
- [ ] **T8 (M) — Verification sweep + prod gate (C2).** Backend build + unit
  tests + lint; frontend clean `next build` + typecheck + lint. Dev-stack
  two-user walk of the four loops (DM unread everywhere, chat presence +
  stability, **feed/post live renew** — now including the post-detail case,
  3-state badge) plus the Phase 9 loops. Then deploy to eys.gen.tr and re-run
  the **Phase 7 gate walk** with navigation.
  *Verify:* all green; post-detail renews live in prod; ≥ 5 client-side
  navigations per browser with the badge never dropping to offline while the
  backend is up.

### Stage D — Residual UX deviations (P2)

- [ ] **T9 (S) — `online-users` snapshot or spec drop (D1).** Either subscribe
  `online-users` for a deterministic initial member/online snapshot, or remove
  it from the T7 spec and document the `user-joined` self-echo as the source.
  *Verify:* first paint of `/chat-room` shows the correct member list without
  waiting for the next join/leave.
- [ ] **T10 (S) — Chat-room loading-until-stable (D2).** Mirror the messages
  page: render a skeleton while `connecting`, the live room once `online`.
  *Verify:* cold-load `/chat-room?room=tech` shows a skeleton then the live room,
  not an immediate empty room + connecting badge.
- [ ] **T11 (S) — Offline affordance (D3).** In `offline` (`idle`/`down`) show a
  real offline state/placeholder instead of `t.connecting`.
  *Verify:* kill the backend → messages input reads "disconnected", not
  "connecting".
- [ ] **T12 (S) — Extract shared connection badge (D4).** Pull the
  `connectionState` derivation + ring badge into a shared hook/component consumed
  by both `messages/page.tsx` and `chat-room/page.tsx`.
  *Verify:* one source of truth; both pages cycle red → breathing green → solid
  green identically on backend kill/restore.

## Verify loop (phase gate)

- [ ] **Post-detail:** two browsers — a like/comment/edit from B renews A's
  detail view **< 1 s, no reload**; exactly one `post:<uuid>` watch per mount,
  none leaked; garbage topics rejected; feed still renews (no regression).
- [ ] **Bookkeeping:** `phase9.md` + `phase10.md` boxes/status reflect git;
  `REALTIME.md` matches code on every frame/field.
- [ ] **Gate:** backend build + tests + lint green (no `session` type error);
  frontend clean build + typecheck + lint; two-user dev walk of all loops;
  prod redeploy + Phase 7 walk green.
- [ ] **Residuals:** chat-room member snapshot correct on first paint;
  chat-room shows a loading state; offline reads "disconnected"; the badge is a
  single shared component.
- [ ] **No regressions:** pushed-domain `useState` grep over `src/app/v1` still
  zero; no `addEventListener`/`setInterval`/`setTimeout`/`IntersectionObserver`
  without paired cleanup; no `fetch`/`apiFetch` in `useEffect`; DM-unread bell
  aggregate + 3-state badge (Phase 10 T5/T6/T14) still behave.

## Deploy notes (prod = eys.gen.tr)

External openresty proxy fronts `/ws` — probe with `curl --http1.1`;
`NEXT_PUBLIC_REALTIME_WS_URL` and `NEXT_PUBLIC_VAPID_PUBLIC_KEY` are baked at
build time — any change requires a frontend image rebuild; root `.env` is
uncommitted on the server; backend build needs `DATABASE_URL` present (a missing
var fails `prisma generate` in prebuild before any TS compiles); use the two WS
test users for the E2E walks.

## Phase queue (updated 2026-07-04)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache | [phase8.md](phase8.md) |
| 9 (done, 14/15 code tasks) | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | [phase9.md](phase9.md) |
| 10 (mostly landed) | Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence + stability, transport-state UX — **T11 broken, T4/T15 carried to 11** | [phase10.md](phase10.md) |
| **11 (this file)** | Phase 10 remediation: post-detail live-renew fix (allowlist + context churn), close-out bookkeeping, verification gate, residual UX | this file |
| 12 (was 11) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../../todo/01-stack-integration.md) |
| 13 (was 12) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 14 (was 13) | Backend warts + compose hardening + k8s | [todo/02](../../todo/02-backend.md), [todo/04](../../todo/04-devops.md) |
| 15 (was 14) | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |

<!-- Downstream phases 12–15 were renumbered +1 to insert this remediation phase. -->
