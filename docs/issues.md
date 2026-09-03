# Issues found while writing docs

Every row here was found *while documenting* something, not via a dedicated audit — that's the
point of tracking this alongside the docs themselves. Add a row the moment something looks wrong;
don't wait for a doc to be "finished."

**2026-08-29:** entries resolved by the late-August fix passes (`b98fac8a`, `aa04a418`,
`3d134472`, `8bc54f55`, `1901ef25`, `f1277f77`) have been removed from this register — their
full writeups live in git history (`git show f1277f77:docs/issues.md`). Everything below is
still open, or not yet re-verified against the current code.

**2026-08-30:** full re-verification of every remaining row against current code. 11 more
entries removed as fixed: 9 had already been resolved by the same late-August passes but were
missed by the 08-29 purge (`FE-004`, `FE-005`, `FE-015`, `BE-024`, `MOB-004`, `MOB-015`,
`MOB-023`, `CROSS-017`, `CROSS-025`, plus `CROSS-022`'s web half), and 2 were fixed this pass:
`CROSS-044` (GraphQL `User.role`/`status` now redacted for non-admin, non-owner viewers via
`UserPrivacyResolver`) and `CROSS-022`'s mobile half (Flutter push taps now route the three
`rtc-*` kinds like web's `sw.js` instead of dumping on the notification page). Every row still
below was individually re-confirmed against source on this date.

**2026-09-01 (Live QA):** first live, manual pass over the Flutter app on two real devices (two
emulators, two real accounts messaging/calling each other), rather than a source-reading audit.
It produced eleven findings (`MOB-030` through `MOB-040`); ten were fixed in the same session and
have since been purged from this register (see 2026-09-03 below) — only `MOB-034` remains, because
its fix is a local, gitignored `.env` value rather than a code change (`Status: verified`). Areas
swept clean with no findings this pass: chat-room switching/presence/attachment upload, API key
create/view/revoke, and the forgot-password flow. Not reached: live streams, a full register-flow
submission.

**2026-09-03:** purge of every `fixed` entry. Removed: the ten fixed Live-QA findings above
(`MOB-030`–`MOB-033`, `MOB-035`–`MOB-040`); the 2026-09-02 Flutter security-audit batch
(`CROSS-032` OAuth claim + PKCE binding, `MOB-041`–`MOB-048`), which had detail sections but had
never been added to the summary table; and `CROSS-045`/`MOB-049`, which were still labelled
`verified` but had been closed by that same batch (`CROSS-045` by `CROSS-032`'s binding, `MOB-049`
by `MOB-041`/`MOB-042`) — re-confirmed against source before removal. Unlike the 08-29 purge, none
of these 21 entries had been committed when they were removed (`3736c9b3`, HEAD at the time,
predates all of them), so their writeups are not in git history. `BE-029` (`fixed (deploy
pending)`) is kept deliberately until the pushed fix is actually deployed.

**2026-09-03 (fix pass):** 17 more entries fixed and removed the same day, each with a regression
test (backend 998, next-js 1080, tanstack 1090, Flutter 638 green; the 2 remaining web failures are
the pre-existing pages-gallery ones). Backend: `BE-030` (MFA step-up — re-enrolling while MFA is on
needs a current TOTP/backup code via `enrollMfa(currentCode)`, the completed rotation retires the
old factor, and `trustCurrentDevice` only works for a session that passed the second factor moments
ago — a one-shot Redis marker `verifyLoginMfa` leaves behind), `BE-031` (meeting removal is now a
ban: Redis removed-set checked in `joinMeeting`, re-kick on the `participant_joined` webhook, token
TTL bounded by the meeting's duration cap, web + Flutter render the "removed" screen on a
`EX_MEETING_REMOVED` rejoin), `BE-032` (email verification only promotes `PENDING_VERIFICATION`),
`BE-033` (`AuthPayload.user` is null while `mfaRequired`; both web apps + Flutter no longer read it),
`BE-034` (`@IsTimeZone` on `UpdateProfileInput`), `BE-035` (atomic `INCR` attempt counter on its own
key, OTP deadline never refreshed by a wrong guess), `BE-009` (`POST /csrf/echo` 404s in production;
stays as the e2e self-test target), `BE-004` (already resolved — `validatePasswordStrength` is now
blocklist-only). Cross-app: `CROSS-046` (WS `attachments[]` validated against the REST
`MessageAttachmentDto`; web `AttachmentPreview.serveUrl` returns null instead of throwing),
`MOB-034` (backend `LIVEKIT_URL` → `livekitUrl` on every join result + `rtc:accepted` frame; Flutter
and both web apps prefer it over their compile-time copy), `FE-002` (demo signup action moved next to
its only caller under `views/(demos)/form/`), `FE-012` (already resolved — buffered upload route
forwards scope headers; test added), `CROSS-013` (both halves already resolved — dead files gone on
web and mobile), `MOB-016` (chat-room widget's unreachable DM branch removed; unknown rooms fall back
to `general`), `CROSS-026` (mobile deep link is `?room=` like web; legacy `/chat/:id` claim mapping
dropped), `CROSS-038` (Flutter landing page links About; web already did), `CROSS-023` (mobile
auto-marks notifications read on open, like web). Partially fixed and still listed: `CROSS-019`
(language now applied on save; timezone half open), `BE-019` (3DS reason distinguished; no recovery
flow), `BE-036` (compose now binds Redis to `127.0.0.1` — not yet applied to the running host).

**ID scheme:** `BE-###` backend-only · `FE-###` frontend-only · `MOB-###` mobile-only ·
`CROSS-###` spans ≥2 apps (parity gaps, shared-architecture/doc-accuracy notes).
**Severity:** `HIGH` / `MED` / `LOW` / `INFO` (`INFO` = documentation-clarity note, not a bug).
**Status:** `found` (reported, not yet independently confirmed) → `verified` (reproduced/confirmed
against source) → `fixed` | `wontfix`.

## Summary table

| ID | Severity | Area | Summary | Status | Found in |
|---|---|---|---|---|---|
| [BE-002](#be-002) | MED | Backend | `users/` (demo, leaks passwordHash) vs `profile/` (real) naming trap | verified | Phase 0 |
| [CROSS-002](#cross-002) | MED | Backend + Frontend + Mobile | `project-tasks` + `team-members` are real `CORE_MODULES` with no frontend/mobile consumer — confirmed structural, not just an unbuilt page | verified | Phase 0, verified Phase 2b |
| [CROSS-003](#cross-003) | INFO | Backend + Frontend + Mobile | No real backend API versioning exists; frontend's "v1" is a frontend-only URL convention | verified | Phase 0 |
| [BE-008](#be-008) | INFO | Backend | `MfaFactor`'s schema has WebAuthn columns; `MfaService` only ever implements TOTP | verified | Phase 1b |
| [CROSS-019](#cross-019) | LOW | Frontend + Mobile | Settings timezone persists on both platforms but is read back by neither — dates render in the device/browser zone regardless *(language half fixed 2026-09-03: web now applies the saved locale on save)* | verified (partial) | Phase 2a |
| [BE-014](#be-014) | INFO | Backend | 4 of 9 `NotificationType` enum values have no producer anywhere in current backend code | verified | Phase 3a |
| [BE-015](#be-015) | LOW | Backend | `myPushSubscriptions` GraphQL query has no caller on either platform | verified | Phase 3a |
| [CROSS-024](#cross-024) | LOW | Frontend + Mobile | Chat-room has no reply-to-message and no delete-message capability at all, on any surface | verified | Phase 3b |
| [BE-019](#be-019) | LOW | Backend | A Stripe 3DS/SCA decline is now a distinct `authentication_required` reason, but neither client offers a recovery path (no PaymentIntent `client_secret` round-trip) and web shows the raw reason code | verified (partial) | Phase 4a |
| [CROSS-035](#cross-035) | LOW | Frontend + Backend | The "Premium" nav page is not a subscription page — it's a live NestJS tier-gate tech demo with no role check, reachable by any paid user | verified | Phase 4b |
| [BE-023](#be-023) | LOW | Backend | `VaultService` (`@Global()`) has zero consumers anywhere in the app — the real vault-read path bypasses it entirely | verified | Phase 5a |
| [BE-025](#be-025) | LOW | Backend | `cookies/` (demo) vs `common/cookies/` (real) — a fourth confirmed module-naming collision trap | verified | Phase 5a |
| [CROSS-031](#cross-031) | MED | Frontend + Mobile + Backend | Tier feature copy exists in four divergent hardcoded sets (web pricing, web plans, backend seed/config, mobile plans Dart) — no single source of truth | verified | Phase 4a *(entry reconstructed 2026-08-29 — was referenced by 8 docs but never written)* |
| [CROSS-039](#cross-039) | INFO | Frontend + Mobile | Both platforms' admin role-gate is client-side-only at the render layer (at different points); real mutations are correctly backend-gated regardless | verified | Phase 5b |
| [BE-026](#be-026) | LOW | Backend | `Post.category`/`Post.tags` have zero application-code references anywhere in `src/post/` — not even in a DTO | verified | schema.md |
| [BE-027](#be-027) | LOW | Backend | The `Follow` model has zero application-code references anywhere in `src/` — no module queries or writes it | verified | schema.md |
| [BE-028](#be-028) | LOW | Backend | 9 `User` columns/relations (`referredBy` self-relation, `birthDate`, `quietHoursStart`, `interests`, `metadata`, `preferences`, `phoneNumber`, `phoneVerified`, `reputation`) have zero application-code references anywhere | verified | schema.md |
| [BE-029](#be-029) | HIGH | Backend | Stripe webhook id-codec 400 fix is committed + pushed (`3736c9b3`) but **not yet deployed** — until it ships, every real Stripe webhook is still rejected in prod; hard deadline 2026-09-08 | fixed (deploy pending) | Security audit 2026-09-02 |
| [BE-036](#be-036) | MED | Backend (deploy) | Deploy-host Redis (the session store) is published on `0.0.0.0:6379` with no `requirepass` — `docker-compose.yml` now binds it to `127.0.0.1` (2026-09-03), but the running container is unchanged until `redis` is recreated | fixed (apply pending) | Security audit 2026-09-02 |

## Details

### BE-002

**Severity:** MED · **Area:** Backend · **Status:** verified
**Summary:** `users/` module (`DEMO_MODULES`, explicit source comment "demo CRUD module — leaks
passwordHash; must not run in production") sits right next to `profile/` (the real user/account
module) with a confusable name. Reading source by name alone, it's easy to grab `users/`.
**Evidence:** [`nest-js-boilerplate/src/users/`](../nest-js-boilerplate/src/users/) vs
[`nest-js-boilerplate/src/profile/`](../nest-js-boilerplate/src/profile/).
**Notes:** called out explicitly at the top of
[backend/social-content/profile/README.md](./backend/social-content/profile/README.md) (Phase 2) and
in [backend/_reference/excluded-modules.md](./backend/_reference/excluded-modules.md) (Phase 5).

### CROSS-002

**Severity:** MED · **Area:** Backend + Frontend + Mobile · **Status:** verified
**Summary:** `project-tasks` and `team-members` are real, always-on `CORE_MODULES` with no frontend
page or mobile screen consuming their GraphQL operations anywhere — confirmed by grepping both client
codebases directly for the operation names (`teamMembers`, `createTeamMember`, `tasks`, `createTask`),
not just their absence from the page-route inventory. This is structural, not just "nobody built a
page yet": the wider `Organization` → `Team`/`Project` → `Task` data model has **no API surface of
its own anywhere** — no resolver/controller exists for `Organization`, `Team`, or `Project`, and
`prisma/seed.ts` never creates any of the three, so `createTeamMember`'s `teamId` and `createTask`'s
`projectId` can never resolve to a real row without direct DB manipulation even if a frontend were
built today.
**Evidence:** [`nest-js-boilerplate/src/project-tasks/`](../nest-js-boilerplate/src/project-tasks/),
[`nest-js-boilerplate/src/team-members/`](../nest-js-boilerplate/src/team-members/) vs the absence of
either in `next-js-boilerplate/src/app/v1/[lang]/**` or `flutter-boilerplate/lib/views/**`; both
resolvers carry source comments framing themselves as NestJS-feature/validator proof modules (e.g.
"proves the `@MinLength`/`@MaxLength` validators auto-generated from the Prisma schema"), matching the
pattern this repo's own `implement-nestjs-feature` skill produces elsewhere. Two naive-grep hits
(`views/forms/advanced/TeamMembers.tsx`, a forms-gallery demo field array; `views/ui/avatar/examples.tsx`,
a hardcoded avatar-showcase array) were checked directly and are unrelated.
**Notes:** Likely product intent was a technical proof-of-concept rather than a user-facing feature —
a product/roadmap call, not a docs one. Documented in
[backend/social-content/README.md](./backend/social-content/README.md#known-issues),
[backend/social-content/team-members/README.md](./backend/social-content/team-members/README.md#known-issues),
[backend/social-content/project-tasks/README.md](./backend/social-content/project-tasks/README.md#known-issues).

### CROSS-003

**Severity:** INFO · **Area:** Backend + Frontend + Mobile · **Status:** verified
**Summary:** No real backend API versioning scheme exists — `main.ts` never calls
`enableVersioning()` or `setGlobalPrefix()`, and the `versioning/` module directory is unreachable
recipe code (not in `CORE_MODULES` or `DEMO_MODULES`). The frontend's `v1` URL segment is a
**frontend-only** convention, unrelated to any backend version. Not a bug, but a real confusion risk
if left undocumented — someone could reasonably assume a coordinated backend `/v2` exists, or that
bumping the frontend's `v1` implies a backend version bump.
**Evidence:** [`nest-js-boilerplate/src/main.ts`](../nest-js-boilerplate/src/main.ts) (no versioning
call) vs [`next-js-boilerplate/src/app/v1/`](../next-js-boilerplate/src/app/v1/).
**Notes:** documented explicitly in [backend/README.md](./backend/README.md),
[frontend/v1/README.md](./frontend/v1/README.md), and [architecture.md](./architecture.md).

### BE-008

**Severity:** INFO · **Area:** Backend · **Status:** verified
**Summary:** `MfaFactor`'s Prisma model has WebAuthn columns (`credentialId`, `publicKey`, `counter`,
`transports`) and `MfaMethod` is an enum implying multiple factor types, but `MfaService`
hard-codes `method: 'TOTP'` everywhere — no WebAuthn code exists.
**Evidence:** [`nest-js-boilerplate/prisma/schema.prisma`](../nest-js-boilerplate/prisma/schema.prisma)
`MfaFactor` model vs. [`nest-js-boilerplate/src/mfa/mfa.service.ts`](../nest-js-boilerplate/src/mfa/mfa.service.ts)
(`method: 'TOTP'` literal throughout); `grep -rn "WebAuthn\|FIDO2" nest-js-boilerplate/src/mfa` → empty.
**Notes:** Not necessarily a bug — may simply be unbuilt, forward-provisioned schema. Documented in
[backend/identity-access/mfa/README.md](./backend/identity-access/mfa/README.md#known-issues).

### CROSS-019

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified (partial)
**Summary:** *Language half fixed 2026-09-03:* Settings → General's Language field now takes effect
on web too — `saveSettings` hands the persisted locale to the page's `applyLocale`, which sets the
lang cookie and navigates to the same pathname under the new `/{lang}/` segment via the shared
`lib/i18n/lang-routing.ts` helpers the header `LangSwitcher` also uses (both web apps; mobile already
applied it live). *Still open:* timezone persists on both platforms but is read back by neither —
both apps derive the "real" timezone live from the OS/browser at render time, and none of the
date-formatting helpers accept a user-chosen zone. Making `profile.timezone` drive rendering is a
cross-cutting change (every `formatDate*`/`Intl` call on web + Dart's local `DateTime` on mobile),
and arguably a product decision (device-local vs. profile zone), so it was left for a dedicated pass.
**Evidence:** `grep -rn "\.locale\b" next-js-boilerplate/src` (excluding Intl/date noise) shows
exactly one read of `user.locale` app-wide,
[`views/settings/general/FreePageView.tsx#L52`](../next-js-boilerplate/src/views/settings/general/FreePageView.tsx),
pre-fill only. Mobile's [`views/settings/general/page_view.dart`](../flutter-boilerplate/lib/views/settings/general/page_view.dart)
additionally calls `ref.read(localeProvider.notifier).setLocale(...)` — the same provider
`app/app.dart#L115`'s root `MaterialApp` watches. `grep -rn "\.timezone\b"` across both trees shows it
captured at login/register and read back only for pre-fill, never for date/time formatting on either
platform — both instead use `Intl.DateTimeFormat().resolvedOptions().timeZone`
([`lib/date-time.ts#L174`](../next-js-boilerplate/src/lib/date-time.ts)) / Dart's local `DateTime`.
**Notes:** Documented in [backend/social-content/profile/README.md](./backend/social-content/profile/README.md),
[frontend/v1/settings/general/page.md](./frontend/v1/settings/general/page.md),
[mobile/v1/settings/general/screen.md](./mobile/v1/settings/general/screen.md).

### BE-014

**Severity:** INFO · **Area:** Backend · **Status:** verified
**Summary:** 4 of the 9 `NotificationType` enum values have no producer anywhere in current backend
code.
**Evidence:** `nest-js-boilerplate/prisma/schema.prisma#L192-201` defines `NotificationType {MENTION
COMMENT REACTION FOLLOW FRIEND_REQUEST POST SYSTEM BILLING SECURITY}`. Exhaustively grepping every
real call site of `NotificationService.create()` shows only `COMMENT`, `REACTION`, `FRIEND_REQUEST`,
`POST`, and `BILLING` are ever written; `grep -rn "type: '<VALUE>'"` for each of `MENTION`, `FOLLOW`,
`SYSTEM`, `SECURITY` returns zero matches for all four.
**Notes:** Same shape as [BE-008](#be-008) (`MfaFactor`'s unused WebAuthn columns) — likely
forward-provisioned schema. `SECURITY` in particular reads like an obvious intended use (e.g.
new-device-login alerts) never wired up. Documented in
[notification/README.md](./backend/messaging-realtime/notification/README.md#who-creates-a-notification-and-when).

### BE-015

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `push-notification`'s `myPushSubscriptions` GraphQL query (list a user's registered Web
Push subscriptions) has no caller on either platform.
**Evidence:** `grep -rn "myPushSubscriptions"` across both `next-js-boilerplate/src` and
`flutter-boilerplate/lib` returns zero matches. Frontend only ever calls the two mutations
(`subscribePush`/`unsubscribePush`); mobile calls neither (see `CROSS-021`).
**Notes:** Users can subscribe/unsubscribe but have no UI anywhere to see or manage a list of their
own registered push subscriptions/devices. Documented in
[push-notification/endpoints.md](./backend/messaging-realtime/push-notification/endpoints.md#known-issues).

### CROSS-024

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Chat-room has no reply-to-message and no delete-message capability at all, on any
surface — structurally absent, not a per-platform gap.
**Evidence:** `RoomMessage`/`RoomMessageAttachment` (`prisma/schema.prisma#L947-976`) have no
reply-target or soft-delete (`deletedAt`) columns at all, unlike `Message`. `saveRoomMessage()` takes
no `replyToId` parameter. A repo-wide `grep -rn "deleteRoomMessage\|delete-room"` returns zero
matches — no delete-room-message endpoint exists on REST, GraphQL, or WS. Both platforms' chat-room
UI sends no `replyToId` and renders no delete/reply affordance.
**Notes:** Distinct from `CROSS-006` (DM reply-to present backend-side, missing only on
Flutter) — this is a structural absence across the entire stack, so not a cross-platform parity bug
in the usual sense, but a real feature gap relative to 1:1 messaging. Documented in
[chat-room page.md](./frontend/v1/chat-room/page.md#known-issues-affecting-this-page) and
[chat-room screen.md (mobile)](./mobile/v1/chat-room/screen.md#confirmed-gaps-vs-web-found-while-documenting-this-screen).

### BE-019

**Severity:** LOW · **Area:** Backend · **Status:** verified (partial)
**Summary:** A Stripe `authentication_required` (3DS/SCA) decline on the subscription charge is now
a distinct reason, but neither client offers a recovery path for it, and web surfaces the raw reason
code as the error text.
**Evidence:** `stripe-payment.provider.ts`'s `createSubscription` catch block maps `"insufficient
funds"` / `"card_declined"` / `"authentication_required"` substrings to `insufficient_funds` /
`declined` / `authentication_required` (re-checked 2026-09-03 — the third branch exists now);
anything else still falls through to `subscription_failed`. The web BFF (`api/billing/subscribe`)
returns that reason verbatim as `msg` with `key: "billing.errors.declined"`, a key no messages file
defines, so the user reads `authentication_required` literally.
`stripe/stripe.service.ts`'s `createSubscription` passes `off_session: true` (a deliberate pattern —
verify via SetupIntent first, charge off-session after — but one that doesn't *guarantee* the
off-session charge itself never needs authentication). Neither `StripeCardForm.tsx` (web) nor
`page_content.dart`'s `_handleSubscribe` (mobile) has any UI branch for "please complete verification
with your bank."
**Notes:** Plausible, not confirmed-live (no reproduction, no incident evidence) — same evidentiary
bar as `BE-004` (resolved). Documented in
[billing/stripe.md](./backend/billing-usage/billing/stripe.md#known-issues).

### CROSS-035

**Severity:** LOW · **Area:** Frontend + Backend · **Status:** verified
**Summary:** The "Premium" page (a real nav item on both platforms) is not a subscription-status page
at all — it's a live NestJS `@MinTier()`/RBAC demo, tier-gated only (no role check), so any
sufficiently-paid user, not just staff, can see platform-wide aggregate stats.
**Evidence:** `AdminResolver.premiumStats`/`.growthStats` (`authorization/admin.resolver.ts#L206-233`)
carry no `@Roles()`, only `@MinTier()`. Already independently flagged by Phase 1b —
`authorization/endpoints.md` titles both entries *"(demo tier gate)"* and their "Used by" fields
already read *"`v1/premium` (billing-usage territory, Phase 4, not yet documented)"*, a placeholder
written in anticipation of this exact phase.
**Notes:** Not a security hole (data is low-sensitivity, `revenue` is a fabricated
`totalUsers*9.99`) — a documentation/design-clarity finding matching the [CROSS-002](#cross-002)
precedent, but *live and reachable* through real nav, unlike that precedent's orphaned modules.
`authorization/endpoints.md`'s two "Used by" lines should be updated to point at
`frontend/v1/premium/page.md` and `mobile/v1/premium/screen.md` (identity-access is a different
phase's territory, not touched here). Documented in
[frontend/v1/premium/page.md](./frontend/v1/premium/page.md) and
[mobile/v1/premium/screen.md](./mobile/v1/premium/screen.md).

### BE-023

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `VaultService` is provided and exported globally by `VaultModule` but has zero real
consumers. The only vault-secret path actually exercised in the running app is the unrelated
standalone `loadVaultSecrets()` function, called directly from `main.ts` before
`NestFactory.create()`, which duplicates similar logic without using this class.
**Evidence:** `grep -rln "VaultService" nest-js-boilerplate/src` → only `vault/vault.module.ts` and
`vault/vault.service.ts`.
**Notes:** Not necessarily worth fixing — a reasonable general-purpose utility to keep for a future
on-demand secret read. Documented in
[backend/platform-core/vault/README.md](./backend/platform-core/vault/README.md), referenced from
[backend/platform-core/README.md](./backend/platform-core/README.md).

### BE-025

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `cookies/` (`DEMO_MODULES`-gated `CookiesModule`/`CookiesController`, a NestJS
cookie-recipe demo) sits alongside the real, always-on `common/cookies/` (the cookie-hardening
options factory backing every real session cookie) with a confusable name.
**Evidence:** `nest-js-boilerplate/src/cookies/cookies.module.ts` vs.
`nest-js-boilerplate/src/common/cookies/cookie.factory.ts`.
**Notes:** The fourth instance of this pattern found across this whole documentation effort (after
`users/`↔`profile/` = [BE-002](#be-002); `session/`↔`sessions/` and `tasks/`↔`project-tasks/`
re-confirmed this phase). Called out atop
[backend/platform-core/common/cookies/README.md](./backend/platform-core/common/cookies/README.md)
and in [backend/_reference/excluded-modules.md](./backend/_reference/excluded-modules.md)'s
naming-collisions section.

### CROSS-039

**Severity:** INFO · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Both platforms gate `/admin` and `/admin/audit-logs` with exactly one client-side
check, just applied at different points. Web: no server-side (SSR) role check in `page.tsx` or the
shared `v1/[lang]/layout.tsx`; `isAdmin` is computed inside the `"use client"` `PageContent`
component itself, substituting `AccessDeniedPage` for a non-admin. Mobile: a `GoRouter` `redirect:`
callback (`requireAdmin()`) evaluated before the screen builds, reading the same locally-cached
role — but the screen widgets themselves have zero redundant check, unlike web's component-level
one. Neither is a data-exposure bug: the real actions are correctly backend-gated independently —
`setUserTier`/`auditLogs`/`auditLogCount` all carry `@Roles(ADMIN, SUPERADMIN)` on the backend,
web's `set-tier` BFF route additionally re-checks role server-side itself, and mobile's mutation
goes straight to the already-guarded GraphQL endpoint.
**Evidence:** `next-js-boilerplate/src/views/admin/PageContent.tsx` (`isAdmin` client-side) vs.
`next-js-boilerplate/src/app/v1/[lang]/layout.tsx` (auth-only) vs.
`flutter-boilerplate/lib/app/router.dart` (`requireAdmin()`, whose own comment states it mirrors
web's role check as client-side defense-in-depth) vs.
`flutter-boilerplate/lib/views/admin/page_view.dart` (no in-widget role branch) vs.
`next-js-boilerplate/src/app/api/admin/set-tier/route.ts` (explicit server-side `me.role` re-check
before forwarding).
**Notes:** A documentation-clarity/architecture-consistency finding, not a bug — both platforms are
client-side-only at different layers, with correct backend enforcement underneath either way.
Mobile's ready-built equivalent of web's `AccessDeniedPage` in `lib/features/statics/` (formerly
dead code — `MOB-028`, since resolved and removed from this register) has been wired in via
`app/router.dart` and the admin screen, closing the one real asymmetry (no in-widget fallback). Documented in [frontend/v1/admin/page.md](./frontend/v1/admin/page.md) and
[mobile/v1/admin/screen.md](./mobile/v1/admin/screen.md).

### BE-026

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `Post.categoryId`/`Post.category` and `Post.tags` (a `Category` relation and an implicit
`Tag[]` m2m) are real, fully-formed Prisma relations on `Post` — but `src/post/` never references
`category`/`tag` anywhere, not in `post.service.ts`, `post.resolver.ts`, nor any DTO. Unlike
`BE-011` (`coverImage`, wired end-to-end backend-side but unused by either frontend), these
two fields aren't reachable from the API at all — no mutation can set them, no query can select them.
**Evidence:** `grep -n "categoryId\|category\|tags\|Tag" nest-js-boilerplate/src/post/**/*.ts` — zero
matches outside the Prisma-generated types. `Category` and `Tag` themselves are equally unreferenced
project-wide (`grep -rlE "\.(category|tag)\.(findUnique|findMany|create)\(" nest-js-boilerplate/src`
— zero matches, `@generated` aside).
**Notes:** Likely the same "rich domain model for exercising NestJS + GraphQL + Postgres" pattern
the schema's own header comment describes — modeling a category tree (self-relation) and an implicit
m2m as a Prisma-feature showcase, never wired to the one module that could plausibly use them. Not a
functional bug (nothing tries to use these fields and fails); a schema/application-code mismatch a
consumer of this boilerplate should know about before assuming `Category`/`Tag` do anything. See
[schema.md § Post](./schema.md#post).

### BE-027

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `Follow` (`{followerId, followingId}`, two FKs to `User`) has zero application-code
references anywhere in `src/` — no module creates, queries, or deletes a `Follow` row. `friends/`
(the real, `CORE_MODULES`-wired social-graph module) implements the entire friend-request lifecycle
against `Friendship` only; `Follow` sits unused alongside it.
**Evidence:** `grep -rlE "\.follow\.(findUnique|findMany|create|delete)\(" nest-js-boilerplate/src`
— zero matches (`@generated` aside). No resolver/controller field of type `Follow`/`Follow[]`
anywhere.
**Notes:** Same "unwired schema-showcase model" shape as [BE-026](#be-026) (`Category`/`Tag`) — see
that entry's note on the schema header comment's stated intent. Distinct from
[CROSS-002](#cross-002) (`Organization`/`Team`/`Project`): those three at least have one real
consumer each (`team-members`/`project-tasks`) connecting to a pre-existing row, just no creation
path; `Follow` has no consumer at all, anywhere, for either read or write. See
[schema.md § Friends](./schema.md#friends).

### BE-028

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** 9 distinct fields/relations on `User` — the single most shared model in the schema —
have zero application-code references anywhere in `src/`: the `referredById`/`referredBy`/
`referrals` self-relation (referral graph), `birthDate`, `quietHoursStart`, `interests`, `metadata`,
`preferences`, `phoneNumber`, `phoneVerified`, and `reputation`.
**Evidence:** Project-wide `grep -rn "\b<field>\b" nest-js-boilerplate/src --include="*.ts"`
(excluding `@generated/` and `*.spec.ts`) for each of the 9 names returned zero real hits. The one
near-hit, `notification/notification.service.ts:60`, is a defensive comment noting raw Prisma rows
*can* carry a `reputation` BigInt that would crash `JSON.stringify` — not an actual read of the
field. `phoneNumber` has a live `@Validator.IsPhoneNumber()` annotation in the schema itself but no
DTO anywhere accepts a phone number.
**Notes:** Same root cause as [BE-026](#be-026)/[BE-027](#be-027) — schema fields scaffolded (per
`schema.prisma`'s own "rich domain model for exercising NestJS + GraphQL + Postgres" header comment)
but never wired to a feature. Column-level rather than table-level, so it doesn't warrant its own
`_reference/excluded-modules.md` entry, but a consumer of this boilerplate building phone-verification,
referral tracking, or quiet-hours notification suppression should know these columns are placeholders,
not partially-built features. See [schema.md § User](./schema.md#user).

### CROSS-031

**Severity:** MED · **Apps:** Frontend + Mobile + Backend · **Status:** verified (Phase 4a)

*(Reconstructed 2026-08-29: this entry was cross-referenced by the plans/pricing/billing docs on
both platforms but its detail section was never actually written into this file.)*

**Summary:** the subscription tiers' feature copy has **no single source of truth** — at least four
independently-hardcoded sets exist: web's marketing pricing page, web's `v1/plans` `TierCard` copy,
the backend's own tier definitions, and mobile's plans screen (a fourth set inlined in Dart). They
already disagree in wording and can silently disagree in substance after any one-sided edit.

**Evidence:** see the referencing docs —
[frontend/v1/plans/page.md](./frontend/v1/plans/page.md),
[frontend/pricing/page.md](./frontend/pricing/page.md),
[mobile/v1/plans/screen.md](./mobile/v1/plans/screen.md), and both `billing-funnel.md` hubs.

### BE-029

**Severity:** HIGH · **Area:** Backend · **Status:** fixed (deploy pending)
**Summary:** The fix for the global id-codec interceptor 400ing every real Stripe webhook is
committed and pushed (`3736c9b3`) but has **not been deployed to production**. Until it ships, prod
still rejects every genuine Stripe webhook with "Invalid id" on the `evt_...` payload before the
signature check runs — so subscription/billing state driven by webhooks keeps drifting. Hard
deadline **2026-09-08** (Stripe's retry/cutoff window for the undelivered events).
**Evidence:** Root-caused and fixed 2026-09-02; the interceptor now skips the Stripe webhook route
before attempting id decoding, with a regression test. Committed + pushed but not yet on the running
deployment (see memory `stripe-webhook-id-codec-400-fix-2026-09-02`).
**Fix direction:** operational only — deploy the pushed commit before 2026-09-08 and confirm a live
webhook is accepted. No further code change required.

### BE-036

**Severity:** MED · **Area:** Backend (deploy) · **Status:** fixed (apply pending)
**Summary:** On the deployment host, Redis — which is the authoritative session store — is published
on all interfaces with no password. Anyone able to reach the host on its LAN can read every session
hash (`sess:*`) or write an `oauth:profile:<state>` key and then call `loginWithOAuth` to
impersonate any user.
**Evidence:** `docker-compose.yml` `redis` service runs `redis-server --appendonly yes` (no
`--requirepass`) with `ports: ["6379:6379"]`; the host has a routable LAN address. `PING` succeeds
with no auth from the host. (Not internet-exposed behind the current NAT, but LAN-exposed.)
**Fix direction:** operational — drop the public port binding (bind to `127.0.0.1:6379` or rely on
the compose network only) and/or set `requirepass` via Vault. No application code change.
**2026-09-03:** `docker-compose.yml` now publishes `127.0.0.1:6379:6379` (same treatment
`redis-commander` already had). Not yet applied: the running `boilers-redis-1` keeps its old binding
until the service is recreated (`docker compose up -d redis` — Redis only; do not restart `app`
without a rebuilt image, see the migrate-service trap). `requirepass` is still unset; the backend
already honours `REDIS_PASSWORD` if one is ever added via Vault.

