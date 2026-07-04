# Phase 13 — Phase 12 remediation + realtime UX fixes (count renewal, sender-name fallback, chat scroll-to-bottom)

> Execution tracker for the thirteenth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-04 · Status: **not started**. Planning only — no code written
> for this tracker yet, per the project's "plan phase N = write only phaseN.md"
> convention.

## Relationship to Phase 12

Phase 12 landed real implementation (commit `abb4218` + follow-ups `8a0f532`,
`b270b70`) but a 2026-07-04 control run found it's **not complete** — 8
lettered blocking findings (A–H), fully detailed with file:line evidence
inline in `phase12.md`'s per-task notes and consolidated in its "Control run
— 2026-07-04" section. This phase's **Stage A–C close out every one of those
findings**; rather than re-deriving that investigation, the tasks below cite
the phase12.md finding letter and give the concrete fix — read phase12.md
first if the "why" behind any of these isn't obvious from the one-line
summary here.

This phase also folds in **4 new bug reports** (Berkay, 2026-07-04) unrelated
to Phase 12's exception-handling scope: notification/DM unread counts not
reliably renewing, a friend's message rendering with a "?" instead of a name,
and chat windows missing a scroll-to-bottom control. Investigated fresh below
(Stage D–F) since none of these were on Phase 12's radar.

## New scope: realtime UX bug investigation (2026-07-04)

Static/code-level investigation (reading current HEAD, tracing the realtime
provider/gateway protocol end to end) — **not yet reproduced live**. Where a
root cause is directly evidenced by code, it's stated as fact; where it's the
leading hypothesis rather than a confirmed reproduction, it's flagged as
such. Recommend reproducing each live before/while fixing (T9–T11 verify
steps say so explicitly).

### Notification / DM unread count renewal

Reported: counts don't reliably update; asked for "an endpoint to renew
counts" and for WS to "stay connected" on other pages for renewal.

What's actually there, traced end to end:

- **The architecture is mostly right, and one early theory turned out
  wrong.** `RealtimeProvider` is mounted once, persistently, in
  `V1Shell.tsx` (`app/v1/[lang]/layout.tsx` renders `V1Shell` around
  `children` — it's the shared layout, not remounted per page), so the WS
  connection and its Web-Locks-elected "leader" tab persist across every
  `/v1/[lang]/*` page. `NotificationDropdown` (the bell badge) is rendered
  inside `V1Shell`, so it's mounted globally, not just on
  `notification`/`messages`. Service registration
  (`c.registerServices(["MESSAGE","NOTIFICATION"])`,
  `RealtimeProvider.tsx:469`) happens **unconditionally at connect time**,
  not gated by which page is currently claimed — so the initial hypothesis
  ("counts only push to whichever page you're viewing") is **not** what's
  happening; the plumbing to receive these pushes anywhere in the v1 shell
  already exists.
- **Real gap #1 — the renew handler can silently no-op.**
  `RealtimeProvider.tsx:250-256`, the `Notifications`/`Count` and `DmCount`
  cases:
  ```ts
  if (frame.type === "Count") {
    if (qc.getQueryData(["notifications", "count"]) !== undefined)
      qc.setQueryData(["notifications", "count"], frame.value);
  }
  ```
  If the query cache has no entry yet for that key (e.g. right after mount,
  before `useUnreadNotificationCount()`'s first fetch resolves, or if
  TanStack Query ever garbage-collects it), the incoming push is dropped on
  the floor — no `setQueryData` (which would create the entry) and no
  `invalidateQueries` fallback. In the common case this window is small
  (shell mounts immediately, WS auth takes at least one round trip), but
  it's a real race, not a hypothetical one.
- **Real gap #2 — zero polling fallback; 100% push-reliant.** Both count
  hooks (`useNotifications.ts:41-66`) set `staleTime: 30_000` and
  disable `refetchOnWindowFocus`, with **no `refetchInterval`**. The only
  resync mechanism is `resyncAfterConnect()` (`RealtimeProvider.tsx:339-363`),
  which unconditionally invalidates the count queries — but it only fires
  on a WS **(re)connect** event. A dropped-but-not-formally-closed
  connection (the classic reverse-proxy idle-timeout failure mode — worth
  flagging given prod traffic runs through an external openresty proxy,
  per this project's prod-deploy notes) would leave the client
  showing `"open"` with no further renew frames ever arriving, and nothing
  would notice or recover. This is the most likely explanation for counts
  going stale "on other pages" even though the plumbing is theoretically
  page-agnostic: it's not about *which page*, it's about *whether the one
  shared connection is actually still flowing data*, which today is only
  self-healed by a full reconnect.
- **The endpoints Berkay asked for already exist** —
  `/api/notifications/unread-count` and `/api/messages/unread-count`
  (`useNotifications.ts:44,58`) — they're just never polled; only fetched
  once per mount/staleTime window. The fix is to actually use them as a
  renewal mechanism, not to build new ones.

### Sender display-name fallback (the "?" avatar bug)

Reported: a newly-added friend's message shows a "?" badge instead of a
name.

Root cause, confirmed directly (not just hypothesized):

- **`User.name` is nullable, and one code path forgets to fall back.**
  `messaging.service.ts:110-135`, `getConversations()`'s return type is
  explicitly `user: { id, email, name: string | null, avatar }` — a
  friend who never set a display name genuinely has `name: null` in
  Postgres. The REST response returns that raw `null`, no fallback
  applied.
- **`initials()` (`lib/initials.ts:1-9`) deliberately renders `"?"` for any
  falsy name** — `(name || "?").trim()`, this is correct, designed
  behavior for *some* fallback, just not a friendly one for an otherwise
  normal user.
- **The live-update paths (WS) already know to fall back — inconsistently,
  in three separate places:** `messaging-ws.gateway.ts:91`
  (`name: ws.userName || 'Unknown'`), `messaging.controller.ts:203`
  (`name: user.name || user.email || 'Unknown'`), and
  `realtime.gateway.ts:301` (`ws.userName = hash.name || hash.email ||
  'Unknown'`, cached at WS-auth time from the Redis session hash). Three
  different sources of truth (JWT claims, Redis session hash, and a
  per-connection cached value), three slightly different fallback chains,
  and **the REST path that first populates the page is the one place with
  no fallback at all.**
- **Net effect:** a friend with `name: null` shows correctly once a live
  WS `Conversation` renew frame has updated their entry (since those paths
  fall back to email/`'Unknown'`), but reverts to a bare "?" on the next
  page load/refresh, because `useConversations()`'s REST fetch
  (`useConversations.ts:16-19`) re-populates the cache from the raw,
  un-fallback'd backend response. This matches "arrives with a question
  mark" better as an on-reload symptom than a first-message-instant one —
  worth confirming live which moment Berkay is actually seeing, but the
  underlying inconsistency is real either way and worth fixing regardless
  of which exact moment triggers it.
- Likely affects more than just conversations: `getFriends()`,
  `getFriendRequests()`, and anywhere else a bare `User.name` reaches a
  REST response probably has the same gap — worth a repo-wide sweep, not
  just the one call site found here.

### Chat scroll-to-bottom button

Reported: chat windows need a scroll-to-bottom control when viewing older
messages.

- **`useAutoScroll` (`hooks/useAutoScroll.ts`) already does half the job.**
  It auto-scrolls to the newest message on arrival (`useLayoutEffect`
  watching `items`) and exposes a working `scrollToBottom()` — used today
  only to snap down right after *sending* a message
  (`messages/page.tsx`'s `handleSend`, `chat-room/page.tsx`'s
  `handleSend`).
- **Nothing tracks whether the user has scrolled away from the bottom, and
  no button renders `scrollToBottom()` for the reader.** Both
  `messages/page.tsx` and `chat-room/page.tsx` render their message list in
  a plain `overflow-y-auto` div with no scroll listener at all. A user who
  scrolls up to read history gets no affordance to jump back down, and
  worse, `useAutoScroll`'s existing effect will keep yanking them to the
  bottom on every new incoming message *while they're mid-read* (it has no
  "user is not at the bottom, don't autoscroll" guard either) — so this is
  actually two related gaps, not one.

## Decisions

- **D1 — Shared `displayName()` helper, backend-only.** No shared package
  exists between the two apps (confirmed in Phase 12's own survey), so this
  is backend-only: one function,
  `src/common/utils/display-name.ts` exporting
  `displayName(user: {name?: string | null; email: string}): string` →
  `user.name?.trim() || user.email`. Used at every REST/WS/GraphQL call
  site that currently ad hoc's a `name || email || 'Unknown'`-shaped
  fallback (or, worse, doesn't). Dropping the literal `'Unknown'` fallback
  in favor of always having a real `email` to fall back to — `email` is
  non-optional on `JwtUser`/`SessionUser`/the Prisma `User` model, so
  `'Unknown'` should never actually be reachable; keeping it as a
  same-function last-resort (`user.name?.trim() || user.email ||
  'Unknown'`) is still cheap insurance.
- **D2 — Count renewal: fix the guard, add a polling floor, don't rebuild
  the push path.** Three independent, additive changes rather than a
  redesign: (1) `dispatchRenew`'s `Notifications`/`Count`/`DmCount` cases
  drop the `!== undefined` guard and call `setQueryData` unconditionally
  (creates the cache entry if absent, same as the `Messages`/`Conversation`
  case already does correctly); (2) `useUnreadNotificationCount()`/
  `useDmUnreadCount()` gain a `refetchInterval` (60s — cheap, single-number
  endpoints, already built) as a self-healing floor independent of WS
  health; (3) `useConnectionState()`'s transition into `"online"` (i.e. a
  fresh `"open"` status, not just staying open) triggers the same
  invalidation `resyncAfterConnect()` already does, so recovering from a
  drop resyncs counts even if the reconnect path is ever hit differently
  than expected.
- **D3 — Scroll-to-bottom: one hook, one small component, two call
  sites.** Extend `useAutoScroll` (not a new parallel hook) to also track
  proximity to bottom via a scroll listener on the scrollable container
  (or an `IntersectionObserver` on the existing `bottomRef` sentinel,
  consistent with the pattern already used for infinite-scroll-up in
  `LoadEarlierButton`) and expose `isAtBottom`. Add a small
  `<ScrollToBottomButton>` (floating, bottom-right of the message list,
  visible only when `!isAtBottom`) used identically in both
  `messages/page.tsx` and `chat-room/page.tsx`. Auto-scroll-on-new-message
  gets a guard: only auto-scroll if the user was already at (or very near)
  the bottom when the new message arrived, matching how most chat UIs
  behave (don't yank a reader away from history they're actively reading).

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stages A–C (Phase 12 remediation)
have no cross-dependency on D–F and can land in either order; D depends on
nothing new; E (display-name) touches the same messaging files as some of
Stage A/B, land Stage A/B first to avoid rebase churn; F is fully
independent (frontend-only, two page files).

### Stage A — Phase 12 remediation: backend

- [ ] **T1 (S) — Fix filter shadowing (phase12.md Finding A).** Remove the
  class-level `@UseFilters(HttpExceptionFilter)` from
  `messaging.controller.ts:34` so the controller's exceptions flow through
  the global `APP_FILTER` like every other real route.
  *Verify:* a thrown exception from any messaging REST endpoint (e.g.
  friend-request to a non-existent user) now returns
  `{statusCode,exc,msg,key}`, not the old `{statusCode,timestamp,path,message}`
  shape.

### Stage B — Phase 12 remediation: BFF

- [ ] **T2 (M) — BFF shape sweep (phase12.md Finding D).** Make
  `login`/`register` routes return the computed `{exc,msg,key}` body
  instead of discarding it for `{error:message}`; migrate the 5 remaining
  hand-rolled routes (`posts/[id]`, `comments/[id]`, `reactions`,
  `users/search`, `admin/set-tier`) onto the unified shape, using the
  already-extended 8-code `graphqlErrorStatus()`.
  *Verify:* all 7 routes' error responses match `{statusCode,exc,msg,key}`;
  indistinguishable from a `proxy/[...path]` response to a frontend caller.

### Stage C — Phase 12 remediation: frontend

- [ ] **T3 (S) — Fix the `premium/page.tsx` regression (Finding B).**
  Replace the hand-rolled `bg-red-50`/`text-red-700` div (lines 82-86) with
  a real `Toast`, resolved via `exceptionHandler`.
  *Verify:* triggering the stats-fetch failure path shows a Toast, no bare
  red div left; grep confirms no ad hoc error-text pattern remains in the
  file.
- [ ] **T4 (M) — Wire `<ConnectionUnstable>` for real + grace window
  (Finding E).** Actually render `<ConnectionUnstable>` in
  `messages/page.tsx` and `chat-room/page.tsx` (currently imported, never
  rendered — confirmed by their own lint warnings); route its copy through
  `exceptionHandler`/`clientException` instead of hardcoded English; add a
  short grace-window debounce to `useConnectionState()` so a `"backoff"`
  blip doesn't immediately flip to `"unstable"`.
  *Verify:* kill the realtime backend — `messages`, `chat-room`, and the ws
  demo all show one consistent, localized unstable state after the grace
  window (not immediately); restore it — all clear together.
- [ ] **T5 (M) — Migrate `find-friends`/`posts/[uuid]` (Finding F).**
  `useSuspenseQuery` + `<Suspense fallback={<Skeleton/>}>` +
  `loading.tsx`, same pattern as the already-correct `feed/page.tsx`;
  handle `find-friends`'s `enabled:!!user` nuance per phase12.md's D10.1
  note (Suspense boundary below the auth-resolved check, not on the query
  itself).
  *Verify:* throttled network on both pages shows a sized `Skeleton`
  immediately, never a blank screen or `find-friends`' old
  looks-empty-but-loading state.
- [ ] **T6 (S) — Skeleton/loading.tsx for `admin`/`share` (Finding G).**
  *Verify:* grep sweep — both pages now have either an inline
  `Skeleton`-based boundary or a sibling `loading.tsx`.
- [ ] **T7 (S) — Small-fixes bundle (Finding H).** Add the missing
  `ExceptionCode` import in `exception-handler.test.ts:130` (currently
  breaks `pnpm typecheck` repo-wide); delete orphaned
  `src/lib/forms/auth-options.ts` (zero importers, builds the TanStack-Form
  path D12 rejected); wire `AccessDenied.tsx` to import `PRICING_PATH`
  instead of hardcoding `"/pricing"`; add i18n entries + `t.*` usage for
  `login-form.tsx`/`register-form.tsx`'s remaining hardcoded strings
  ("Loading...", "Signed in as", "Role:", "Status:").
  *Verify:* `pnpm typecheck` passes repo-wide; `auth-options.ts` gone;
  `AccessDenied` CTA still routes to `/pricing`; grep finds no more
  hardcoded English in the two auth form files.
- [ ] **T8 (L) — Form/backend field-error unification (Finding C).** The
  most involved item carried over from Phase 12. Reshape
  `validation/auth.ts` from a bag of individual field schemas
  (`loginFormSchema`/`registerFormSchema`) into one composed `z.object()`
  per form, matching D12's original `generateAuthLoginSchema(tr)`/
  `generateAuthRegisterSchema(tr)` naming; change both forms' error state
  from one generic string to per-field; change `useAuth.tsx`'s
  `login`/`register` to use `apiFetchJson` (not raw `fetch()` +
  `throw new Error(data.error)`) so `exc`/`fields`/`key` survive to the
  form; change the register BFF route to return the structured shape
  (depends on T2) so a real `EX_AUTH_EMAIL_TAKEN` reaches the same
  per-field state a client-side Zod failure would populate.
  *Verify:* submit with an empty email → inline `tr.errors.emailRequired`
  under the email field, no round-trip; submit a real duplicate email → the
  server's `EX_AUTH_EMAIL_TAKEN` renders in the same spot, same styling —
  the exact phase12.md T24 verify step, now actually passing.

### Stage D — Notification/DM unread count renewal hardening

- [ ] **T9 (M) — Harden count renewal (D2).** Remove the `!== undefined`
  guard in `dispatchRenew`'s `Notifications`/`Count`/`DmCount` cases
  (`RealtimeProvider.tsx:250-256`) so a push always lands; add
  `refetchInterval: 60_000` to `useUnreadNotificationCount()`/
  `useDmUnreadCount()` as a polling floor; invalidate both count queries
  whenever `useConnectionState()`/`useRealtimeStatus()` transitions into
  `"open"`, not only inside the existing WS-library-level
  `resyncAfterConnect()`.
  *Verify (reproduce live first):* with the app running, have a second
  test user DM the primary user while the primary user is on `/feed` (not
  `/messages`) — confirm the bell badge increments without navigating
  away. Then simulate a stalled-but-not-closed connection (e.g. block the
  WS port at the OS/firewall level without closing the tab) — confirm the
  count still reaches correctness within the 60s poll floor even with zero
  frames arriving.

### Stage E — Sender display-name consistency

- [ ] **T10 (M) — `displayName()` helper + sweep (D1).** Add
  `src/common/utils/display-name.ts`; replace the three divergent ad hoc
  fallbacks (`messaging-ws.gateway.ts:91,184,234,274`,
  `messaging.controller.ts:203`, `realtime.gateway.ts:301`) with calls to
  it; apply the same helper to `getConversations()`'s Prisma-shaped
  response (`messaging.service.ts:110-135`) so the REST path is no longer
  the odd one out; sweep `getFriends()`/`getFriendRequests()` for the same
  raw-nullable-`name` gap.
  *Verify (reproduce live first):* create a test user with `name: null`,
  friend the primary user, send a message from the null-name user, then
  **reload** the primary user's `/messages` page (the REST-refetch path
  that reproduces the bug per the investigation above) — conversation
  entry shows the email-derived fallback, not "?".

### Stage F — Chat scroll-to-bottom button

- [ ] **T11 (M) — `isAtBottom` tracking + `<ScrollToBottomButton>` (D3).**
  Extend `useAutoScroll` with scroll/intersection tracking and an
  `isAtBottom` return value; guard the existing auto-scroll-on-new-message
  effect to only fire when already at the bottom; add
  `<ScrollToBottomButton>` (new, small, shared) to both
  `messages/page.tsx` and `chat-room/page.tsx`, wired to the existing
  `scrollToBottom()`.
  *Verify:* in either chat surface, scroll up into history, send/receive a
  new message — view stays put (no yank) and the button appears; click it
  → smooth-scrolls to the latest message; button disappears once at the
  bottom.

## Verify loop (phase gate)

- [ ] **Phase 12 close-out:** all 8 lettered findings (A–H) from
  phase12.md's control run pass their now-updated verify steps; phase12.md
  itself gets its checkboxes flipped and Status line updated to
  "complete" as part of closing this phase (mirroring phase3.md's
  control-run → fix → re-verify-run shape).
- [ ] **Count renewal:** a DM/notification arriving while the recipient is
  on an unrelated v1 page updates the bell badge without navigating away
  or reloading; a poll-only recovery (WS artificially stalled) still
  self-heals within the polling floor.
- [ ] **Display name:** no real user with a null `name` renders as a bare
  "?" anywhere sender identity is shown (conversations list, notification
  bell, chat-room roster) — email fallback shows instead, consistently
  across REST-loaded and WS-pushed paths.
- [ ] **Scroll-to-bottom:** present and working in both `messages` and
  `chat-room`; auto-scroll no longer yanks a user reading history.
- [ ] **No regressions:** Phase 9/10/12 realtime loops (DM-unread bell
  aggregate, 3-state badge, feed live renew, connection-unstable states)
  still behave after Stage D/E's changes to the same shared files.
- [ ] **Live control run** (not just static/code-level, per the
  project's established convention) against freshly rebuilt containers
  before marking this phase complete — this phase's own findings (T9/T10)
  explicitly depend on live reproduction to confirm, and Phase 12's
  static-only pass was already flagged as insufficient on its own.

## Phase queue (updated 2026-07-04)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache | [phase8.md](phase8.md) |
| 9 (done, 14/15 code tasks) | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | [phase9.md](phase9.md) |
| 10 (mostly landed) | Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence + stability, transport-state UX — T11 broken, T4/T15 carried to 11 | [phase10.md](phase10.md) |
| 11 (parked — plan only, tasks open) | Phase 10 remediation: post-detail live-renew fix (allowlist + context churn), close-out bookkeeping, verification gate, residual UX — deferred in favor of Phase 12, resume after | [phase11.md](phase11.md) |
| 12 (implemented, not gate-clean) | Exception handling: unified backend error contract, frontend `exceptionHandler` + i18n resolver, dedicated connection-unstable + access-denied pages, loading skeletons for every HTTP/WS-awaited page, `generateZodSchema(tr)` + nested `form`/`errors` i18n for real auth forms — see phase12.md's "Follow-up"/Control run for what's left | [phase12.md](phase12.md) |
| **13 (this file)** | Phase 12 remediation (8 lettered findings) + notification/DM unread count renewal hardening + sender display-name consistency + chat scroll-to-bottom button | this file |
| 14 (was 13) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops | [todo/01](../todo/01-stack-integration.md) |
| 15 (was 14) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 16 (was 15) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 17 (was 16) | Backlog: OTel/metrics, remaining push polish, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases 13-16 were renumbered +1 (now 14-17) to insert this
Phase 12 remediation + realtime UX phase. -->
