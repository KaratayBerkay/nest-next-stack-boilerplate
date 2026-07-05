# Phase 4 — Frontend feature parity (surface the phase 1–3 backend in the Next.js app)

> Execution tracker for the fourth phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-03 · Status: **done** (all 7 tasks implemented; verify steps pending browser loop)

Re-scope note (2026-07-03): phase 4 was queued as the cross-stack e2e suite
([phase3.md](phase3.md) queue); Berkay re-prioritized to **frontend feature parity** —
everything phases 1–3 built on the backend (Redis session snapshot, subscription-tier
RBAC, instant revocation, derived tokens + midnight cutoff, device handshake,
messaging-ws) exists as API surface but is invisible or half-wired in the Next.js app.
This phase makes the frontend actually *consume* it. The e2e suite moves down the
queue once more and will then cover these UI flows too. Builds on
[docs/backend/AUTH.md](../../backend/AUTH.md) and the phase 3 BFF plumbing.

## Current state (survey 2026-07-03)

What the frontend already has from phases 2–3 (BFF plumbing, done): five httpOnly
cookies set/cleared by the auth routes, `sessionTokenHeaders()` header fallbacks,
`/api/auth/token` quadruple, device handshake on boot, CSRF-echoed refresh/logout,
`AuthProvider` one-shot 401→refresh→retry **on initial load only**, `useMessaging`
speaking the 4-token first-message WS protocol.

What is missing — the gaps this phase closes:

1. **The enriched snapshot is never consumed.** Backend `me` serves
   `name`/`username`/`avatarUrl`/`locale`/`timezone` from the Redis hash (zero-PG),
   but `ME_QUERY` (`src/lib/graphql/queries.ts`) selects only `id/email/role/tier`.
   Concrete regression-shaped symptom: `V1Shell` renders `user.name` + avatar
   initials, so after any reload (rehydration via `/api/auth/me`) the shell degrades
   to the "User" fallback until the next login.
2. **Tier exists but has no UX.** `tier` is stored in the `User` type and rendered
   nowhere; there is no tier badge, no gated UI, no `premiumStats` consumer, no
   `setUserTier` admin surface; `(marketing)/pricing` is a static stub.
3. **Silent refresh only covers boot.** Every other fetch (`useNotifications` polls,
   feed/messages/find-friends pages, `useApi`) hard-fails on 401 — i.e. after every
   15-minute access-token expiry, after the UTC-midnight cutoff, and after a tier
   change (guard step 6 401s by design). The backend's whole recovery story assumes
   the client silently refreshes; the client mostly doesn't.
4. **Revocation is invisible.** Phase 2 built `revokeAllForUser` + the
   `user:{id}:sessions` reverse index and Postgres keeps 30d `Session` rows, but no
   resolver exposes them and the UI has no sessions/devices page, no
   "log out everywhere".
5. **Auth flash on SSR.** `AuthProvider` is client-only; every full page load renders
   the logged-out state first even though the BFF could resolve `me` server-side
   (zero-PG on the backend).

## Design

- **Snapshot is the identity source.** Widen `ME_QUERY` to the full
  `SessionUserPayload` (`id email role tier name username avatarUrl locale timezone`)
  and the frontend `User` type to match. After this, login/register (`AuthPayload.user`)
  and rehydration (`me`) produce the same rendered identity — no more field drift.
  `unread` intentionally stays on `unreadNotificationCount` polling (finding B
  precedent); the notification badge is already wired.
- **One client fetch wrapper, reactive-only refresh.** New `src/lib/api-client.ts`
  (client-side; `lib/backend.ts` stays server-only): `apiFetch(input, init)` that, on
  a 401, awaits a **single-flight** `POST /api/auth/refresh` (one shared in-flight
  promise — N concurrent 401s must trigger exactly one refresh) and retries the
  request once. Refresh failure dispatches an `auth:logout` event; `AuthProvider`
  listens and clears state. No proactive timers — the backend design is "401 → silent
  refresh recovers" (midnight, tier change, plain expiry all take the same path), so
  the client implements exactly that, everywhere instead of only at boot.
- **WS recovery follows the same path.** `useMessaging` already refetches
  `/api/auth/token` per reconnect attempt (2s backoff), but that route only *reads*
  cookies — after midnight the cookies are stale, the server answers `Auth failed`,
  and the hook reconnect-loops forever. Fix: on an auth-failure close, run one
  `apiFetch`-style refresh, then reconnect (fresh cookies → fresh token quadruple).
- **Tier gating mirrors the backend, enforcement stays on the backend.** New
  `src/lib/tier.ts`: ordered `FREE < BASIC < MEDIUM < PREMIUM` + `tierAtLeast()`,
  with a comment naming `nest-js-boilerplate/src/authorization/` as the source of
  truth. A `TierGate` component / `useMinTier` hook only controls *rendering*
  (hide/lock UI); every gated request still hits `@MinTier` server-side.
- **Sessions need a thin backend slice.** This is a frontend phase, but surfacing
  revocation requires two small additions to `auth.resolver.ts` (pattern: phase 3
  also carried its BFF counterpart work):
  - `mySessions` query (`SessionAuthGuard`): the caller's live Postgres `Session`
    rows joined with device info — `id, ip, userAgent, createdAt, expiresAt,
    current` (current = the hash's `sessionId`, attached to `req.user` by the guard);
  - `logoutOtherSessions` mutation (CSRF-guarded like `logout`): deletes the
    caller's other `Session` rows + `revokeAllForUser` minus the presented compound
    key (revoke-all, then re-write the current entry — simplest correct order).
  Redis stays the runtime truth; Postgres rows are the durable list being displayed.
- **SSR seed, not SSR auth rewrite.** A server helper `getSessionUser()` (wraps the
  existing `graphqlFetch` + `ssr-cookies` store) lets the root layout pass
  `initialUser` into `AuthProvider`, killing the logged-out flash. Client guards
  (`AuthGuard`) stay as-is. Route protection in `proxy.ts` is limited to a
  cookie-*presence* redirect for `/dashboard` (no token validation in middleware —
  the backend guard is the authority).
- **Admin surface is minimal.** One role-gated page (`/v1/[lang]/admin`) driving the
  existing `setUserTier` mutation via a new BFF route; user lookup reuses
  `/api/users/search`. Nav entry hidden for non-admins (render-only — backend
  `@Roles(ADMIN, SUPERADMIN)` enforces).
- **Tier-change UX = the silent refresh proof.** After an admin changes a user's
  tier, that user's next request 401s (rbac derivation check) → `apiFetch` silently
  refreshes → new rbac token minted from the new tier → the retried request succeeds
  and `me` re-fetch flips the badge. No re-login, no visible error — this is the
  end-to-end UI proof of the phase 3 semantics.

## Tasks

- [ ] **1. Consume the session snapshot** (`src/lib/graphql/queries.ts`,
  `features/auth/hooks/useAuth.tsx`, `app/api/auth/me/route.ts`)
  - [ ] Widen `ME_QUERY` to all `SessionUserPayload` fields; extend the frontend
    `User` type (`username`, `avatarUrl`, `locale`, `timezone`, `tier` required on
    rehydration); pass the fields through the `/api/auth/me` route
  - [ ] Render identity from the snapshot: `V1Shell` avatar uses `avatarUrl` (initials
    fallback), name no longer degrades after reload; `AuthStatus` shows name + email
  - [ ] Tier badge component (reuse `ui/Badge`) in the V1 shell user card + `AuthStatus`
  - [ ] Verify: login → reload → shell still shows name/avatar/tier (today it shows
    "User"); `me` remains zero-PG (no new backend queries — pg `log_statement` spot
    check); frontend unit tests updated and green
- [ ] **2. Silent refresh everywhere** (`src/lib/api-client.ts` + adopters)
  - [ ] `apiFetch`: 401 → single-flight refresh → one retry; refresh failure →
    `auth:logout` event; unit tests for the single-flight (N parallel 401s → one
    refresh call) and the retry/give-up paths
  - [ ] Adopt in `useApi`, `useNotifications`, `NotificationDropdown`, feed /
    messages / find-friends / notification pages, and any direct `fetch("/api/…")`
    caller (`git grep 'fetch("/api'` sweep); `AuthProvider` boot retry rewires onto
    the same helper and listens for `auth:logout`
  - [ ] `useMessaging`: auth-failure close → one refresh → reconnect (both WS effects,
    chat-room and DM); cap the retry so a truly dead session doesn't loop
  - [ ] Verify: scripted midnight simulation against the prod-mode stack (overwrite
    `user_token` cookie with a yesterday-derived value, as in the phase 3 e2e) →
    clicking through feed/notifications recovers with **no visible error and no
    re-login**; same for WS: connection re-authenticates after the rotation; killing
    the Session row server-side → UI lands in logged-out state (no infinite loop)
- [ ] **3. Tier gates + pricing + premium demo**
  - [ ] `src/lib/tier.ts` (`TIER_ORDER`, `tierAtLeast`, source-of-truth comment) +
    `TierGate`/`useMinTier` (children vs locked-state fallback); unit tests for the
    ordering
  - [ ] `(marketing)/pricing`: four tier cards; when logged in, highlight the current
    tier from `useAuth`
  - [ ] Premium demo page (`/v1/[lang]/premium`): calls `premiumStats` through a new
    BFF route (`graphqlFetch` + `sessionTokenHeaders` pattern); FREE user sees the
    locked `TierGate` fallback and — behind a "try anyway" button — the backend 403
    surfaced properly (proves enforcement is server-side)
  - [ ] Verify: FREE → locked + 403 on force-call; BASIC+ → stats render; unit tests
    green
- [ ] **4. Admin tier panel** (`/v1/[lang]/admin`)
  - [ ] BFF route `app/api/admin/set-tier/route.ts` → `setUserTier` mutation
    (existing `graphqlFetch` + `sessionTokenHeaders`)
  - [ ] Page: user search via `/api/users/search`, tier dropdown per result, submit →
    toast on success; page + nav entry hidden unless `role ∈ {ADMIN, SUPERADMIN}`
    (render-only; backend enforces)
  - [ ] Verify: as ADMIN, upgrade a FREE user → that user's **already-open** session
    flips its tier badge on its next action without re-login (task 2's silent refresh
    doing the phase 3 forced-refresh dance); as USER, the page is hidden and a forced
    POST returns the backend 403
- [ ] **5. Sessions & devices** (thin backend slice + UI)
  - [ ] Backend: `mySessions` query + `logoutOtherSessions` mutation per design
    (guard attaches `sessionId` to `req.user`; CSRF on the mutation; unit tests
    beside the existing auth specs)
  - [ ] BFF routes `app/api/auth/sessions/route.ts` (GET) and
    `app/api/auth/logout-others/route.ts` (POST, reuse the logout route's CSRF echo)
  - [ ] UI: sessions list on a new `/v1/[lang]/settings/sessions` page — device/UA,
    IP, created/expiry, "current" marker, one **Log out other sessions** button
    (`ConfirmDialog`)
  - [ ] Verify: log in from two browsers → page lists 2 rows with the right one
    marked current; "log out others" → browser B's next action lands logged-out
    (its refresh fails — Session row gone), `redis-cli` shows only browser A's
    `sess:*` key; backend unit suite still green
- [ ] **6. SSR seed + dashboard protection**
  - [ ] `getSessionUser()` server helper (`lib/backend.ts` or `lib/auth-ssr.ts`,
    using the `ssr-cookies` store + widened `ME_QUERY`); root layout fetches it and
    passes `initialUser` to `AuthProvider` (loading starts `false` when seeded)
  - [ ] `proxy.ts`: cookie-presence redirect to `/auth/login` for `/dashboard`
    (presence only — no verification in middleware)
  - [ ] Verify: logged-in hard reload of `/v1/…` shows the user card with **no
    logged-out flash** (throttled-network eyeball + no `LoadingAuth` frame); cookieless
    request to `/dashboard` redirects; SSR seed adds no Postgres load (me is
    snapshot-served)
- [ ] **7. Docs**
  - [ ] `docs/frontend/STATUS.md` + `TODO.md`: record the new surfaces (tier UX,
    sessions page, admin panel, silent refresh); check the two §16 boxes only if the
    verify steps here actually proved them, otherwise leave for the e2e phase
  - [ ] [docs/backend/AUTH.md](../../backend/AUTH.md): add the frontend-consumption
    section (silent-refresh contract, sessions surface, `mySessions`/
    `logoutOtherSessions`); root README feature table row
  - [ ] Verify: links resolve; `.env.example` ↔ `docker-compose.yml` parity untouched
    (no new env vars expected)

Stretch (not blocking DoD):

- `updateProfile` mutation (name/avatarUrl/locale/timezone) + the documented
  `rewriteFieldsForUser` hook point from phase 3 + a settings/profile page — closes
  the "profile update has no mutation" gap end-to-end.
- Locale/timezone actually driving the app: `locale` → default `[lang]` segment,
  `timezone` → date formatting in feed/messages.
- Rate-limit-aware BFF (`429`/`Retry-After` surfaced in `apiFetch`) — carried from
  [todo/03](../../todo/03-frontend.md) P2.

## Definition of done / verify

- [ ] Frontend unit suite green (including new `api-client`, `tier`, gate tests);
  backend suite green with the two new auth-resolver specs; lint + typecheck pass
- [ ] Browser loop against the compose stack: register → shell shows name + avatar +
  tier badge; hard reload → identity persists (snapshot-served, no flash); logout →
  clean guest state
- [ ] Silent-refresh proof: yesterday-derived `user_token` (scripted, prod-mode
  backend) → normal clicking recovers with no visible error; three concurrent 401ing
  requests trigger exactly one refresh (network tab / BFF logs)
- [ ] Tier loop entirely from the UI: admin panel upgrade → open session's badge flips
  on next action without re-login; premium page unlocks; downgrade re-locks; forced
  call as FREE surfaces the backend 403
- [ ] Sessions loop: two browsers, list shows both (current marked), "log out other
  sessions" revokes B live (Redis key gone, B's UI lands logged-out on next action)
- [ ] Messaging: WS re-authenticates after a token rotation without a page reload;
  friends-only DM behavior unchanged from phase 3
- [ ] Zero-PG hot paths unchanged: `me`, unread polling, WS connect still produce no
  SQL (pg `log_statement='all'` spot check — the new UI must not have added hidden
  Postgres reads)

## Phase queue (created when reached)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1 (done) | Foundations: README, .env.example, messaging-ws, delete ws-server, doc links | [phase1.md](phase1.md) |
| 2 (done, verified) | Redis auth: compound-key token store, instant revocation, subscription-tier RBAC | [phase2.md](phase2.md) |
| 3 (done, verified) | Redis session runtime snapshot: 4-token derived key, midnight cutoff, value v2, device handshake, messaging-ws wiring, refresh recovery | [phase3.md](phase3.md) |
| **4 (this)** | Frontend parity: snapshot-driven identity UI, tier UX + admin panel, silent refresh everywhere, sessions/devices page, SSR seed | [todo/03](../../todo/03-frontend.md) |
| 5 | Cross-stack e2e: `STACK=1` Playwright (auth round-trip, refresh, revocation, tier gates, SSR/CSR cookies, WS, messaging — now incl. the phase 4 UI flows) | [todo/01](../../todo/01-stack-integration.md) |
| 6 | Root CI: path-filtered app checks + compose smoke job + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 7 | Backend warts: negative-timer warning, duplicate `CreateCatDto`, Kafka first-boot race | [todo/02](../../todo/02-backend.md) |
| 8 | Compose hardening (healthchecks, pins, log rotation) + frontend k8s manifests | [todo/04](../../todo/04-devops.md) |
| 9 | Backlog: backend OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |
