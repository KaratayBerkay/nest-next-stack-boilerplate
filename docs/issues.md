# Issues found while writing docs

Every row here was found *while documenting* something, not via a dedicated audit — that's the
point of tracking this alongside the docs themselves. Add a row the moment something looks wrong;
don't wait for a doc to be "finished."

**ID scheme:** `BE-###` backend-only · `FE-###` frontend-only · `MOB-###` mobile-only ·
`CROSS-###` spans ≥2 apps (parity gaps, shared-architecture/doc-accuracy notes).
**Severity:** `HIGH` / `MED` / `LOW` / `INFO` (`INFO` = documentation-clarity note, not a bug).
**Status:** `found` (reported, not yet independently confirmed) → `verified` (reproduced/confirmed
against source) → `fixed` | `wontfix`.

## Summary table

| ID | Severity | Area | Summary | Status | Found in |
|---|---|---|---|---|---|
| [BE-001](#be-001) | HIGH | Backend | gRPC transport starts unconditionally in prod; its only handler is demo-gated off | verified | Phase 0 |
| [CROSS-004](#cross-004) | HIGH | Backend + Docs | Old ADR-006/E2EE.md describe a client-side X3DH/Double-Ratchet E2EE system that was deliberately replaced 2026-08-04; docs were never marked superseded | verified | Phase 0 |
| [BE-002](#be-002) | MED | Backend | `users/` (demo, leaks passwordHash) vs `profile/` (real) naming trap | verified | Phase 0 |
| [CROSS-001](#cross-001) | MED | Frontend + Mobile | Flutter messaging has no favorites/groups sidebar feature | verified | Phase 0 |
| [CROSS-002](#cross-002) | MED | Backend + Frontend + Mobile | `project-tasks` + `team-members` are real `CORE_MODULES` with no frontend/mobile consumer — confirmed structural, not just an unbuilt page | verified | Phase 0, verified Phase 2b |
| [CROSS-005](#cross-005) | MED | Backend + Docs | Old AUTH.md/REALTIME.md describe a first-message WS auth protocol removed 2026-08-03; real mechanism is cookie-based upgrade auth | verified | Phase 0 |
| [BE-003](#be-003) | LOW–MED | Backend | REST `sendMessage` response includes an internal `delivery` field that the GraphQL `sendMessage` mutation deliberately strips | verified | Phase 0 |
| [MOB-001](#mob-001) | LOW | Mobile | Dead file `lib/views/security/csp/nonce_panel.dart` | verified | Phase 0 |
| [FE-001](#fe-001) | — | Frontend | `constants/routes.ts` `FIND_FRIENDS_PATH`/`FRIENDS_PATH` — checked, not a bug | verified — wontfix | Phase 0 |
| [CROSS-003](#cross-003) | INFO | Backend + Frontend + Mobile | No real backend API versioning exists; frontend's "v1" is a frontend-only URL convention | verified | Phase 0 |
| [BE-005](#be-005) | MED | Backend | `GET /auth/oauth/:provider/profile` has no auth guard despite its own doc comment claiming one; also dead code | verified | Phase 1a |
| [CROSS-009](#cross-009) | MED | Frontend + Mobile | Web's MFA login challenge has no backup-code UI path; Flutter's does (mobile ahead of web) | verified | Phase 1a |
| [CROSS-010](#cross-010) | MED | Frontend + Mobile | Flutter's register screen has no social-login option; web's does | verified | Phase 1a |
| [CROSS-011](#cross-011) | MED | Frontend + Mobile | Password reveal-toggle + live complexity checklist (commit d4fee7ce) never ported to Flutter | verified | Phase 1a |
| [MOB-002](#mob-002) | MED | Mobile | `currentUserProvider` defined twice in Flutter with incompatible types; one copy is dead | verified | Phase 1a |
| [BE-004](#be-004) | LOW | Backend | `validatePasswordStrength()`'s length/variety checks are unreachable dead code — the DTO validator is already stricter | verified | Phase 1a |
| [CROSS-008](#cross-008) | LOW | Backend + Frontend + Mobile | `GET /auth/oauth/providers` is dead; web and mobile each hardcode an identical provider list instead | verified | Phase 1a |
| [FE-002](#fe-002) | LOW | Frontend | Dead `signup.ts` server action sits inside `features/auth/actions/`, used only by an unrelated forms-gallery demo | verified | Phase 1a |
| [FE-004](#fe-004) | LOW | Frontend | `getMeRawServer()`'s declared response type doesn't match what `/api/auth/me` actually returns | verified | Phase 1a |
| [FE-005](#fe-005) | LOW | Frontend | `meQueryOptions()` has zero callers anywhere in the app | verified | Phase 1a |
| [FE-003](#fe-003) | INFO | Docs (self-correction) | This effort's own Phase-0 research called `src/views/auth/` "a 1-file stub" — the one file is a real, complete page, not a stub | verified | Phase 1a |
| [FE-006](#fe-006) | — | Frontend | `/api/auth/token` vs `/api/auth/refresh` — checked, confusable names but not a bug | verified — wontfix | Phase 1a |
| [CROSS-012](#cross-012) | MED | Backend + Frontend + Mobile | `updateApiKey` is fully implemented and BFF-proxied on web, but has no UI trigger on either platform | verified | Phase 1b |
| [CROSS-014](#cross-014) | MED | Docs (self-correction) | Mobile's security screen IS routed under `settings/security` — earlier research's "top-level, not nested" claim was wrong | verified | Phase 1b |
| [BE-006](#be-006) | LOW | Backend | `AdminResolver.createAuditLog()` is a dead duplicate of the real outbox-based audit logger; never called | verified | Phase 1b |
| [BE-008](#be-008) | INFO | Backend | `MfaFactor`'s schema has WebAuthn columns; `MfaService` only ever implements TOTP | verified | Phase 1b |
| [BE-009](#be-009) | LOW | Backend | `POST /csrf/echo` (a CSRF self-test route) has no caller anywhere | verified | Phase 1b |
| [FE-007](#fe-007) | LOW | Frontend | `settings/security/mfa-handlers.ts` is a dead duplicate of the real inline MFA handlers in `PageContent.tsx` | verified | Phase 1b |
| [CROSS-013](#cross-013) | LOW | Frontend + Mobile | Same "scaffolded-then-inlined, original left behind" dead-code pattern independently on both platforms in the api-keys screen | verified | Phase 1b |
| [CROSS-015](#cross-015) | — | Docs (cross-agent coordination) | Located the mobile caller of `changePassword` that Phase 1a's pass reported as "not found" | verified | Phase 1b |
| [CROSS-006](#cross-006) | MED | Frontend + Mobile | Flutter messaging has no reply-to-message feature at all (no field, no UI, no action) | verified | Phase 0 |
| [CROSS-007](#cross-007) | MED | Docs (self) | Earlier research in this same effort mis-classified Flutter's REST-shaped calls as BFF-routed; `messages` vertical has zero Next.js involvement for either call shape | verified | Phase 0 |
| [CROSS-016](#cross-016) | MED | Frontend + Mobile | `users/list`+`detail` are 100% hardcoded demo content on web; mobile's identically-named screens are a real, live, admin-gated feature | verified | Phase 2a |
| [MOB-003](#mob-003) | HIGH | Mobile | User-detail screen ignores its `userId` route param — always fetches/shows the caller's own profile | verified | Phase 2a |
| [MOB-004](#mob-004) | LOW | Mobile | Dead, unreachable bare `/v1/:lang/users` route — no tap handler, no navigational caller | verified | Phase 2a |
| [FE-008](#fe-008) | MED | Frontend | Friends page hardcodes `/v1/en/` in all navigation instead of the active locale | verified | Phase 2a |
| [CROSS-017](#cross-017) | LOW | Frontend + Mobile | Web's `SuggestedFriendsPanel` has no "Add Friend" button at all; Flutter's does | verified | Phase 2a |
| [CROSS-018](#cross-018) | HIGH | Frontend + Mobile | Mobile over-gates find-friends by tier far beyond what the backend/web actually require | verified | Phase 2a |
| [MOB-005](#mob-005) | LOW | Mobile | Dead files `search_utils.dart` + `pagination_bar.dart` in find-friends | verified | Phase 2a |
| [MOB-006](#mob-006) | LOW | Mobile | Dead widgets `account_avatar_section.dart` + `settings_select.dart` in settings | verified | Phase 2a |
| [CROSS-019](#cross-019) | MED | Frontend + Mobile | Settings language/timezone persist correctly but don't (fully) take effect — language only live on mobile, timezone unused by either | verified | Phase 2a |
| [MOB-007](#mob-007) | HIGH | Mobile | `friendRequestsProvider` field-name mismatch throws for every real pending friend request | verified | Phase 2a |
| [FE-009](#fe-009) | MED | Frontend | Web's post-detail query never selects `reactionBreakdown`/`whoReacted`, so both always render empty | verified | Phase 2b |
| [FE-010](#fe-010) | LOW | Frontend | `MediumFeedList.tsx` is a byte-for-byte duplicate of `FreeFeedList.tsx` | verified | Phase 2b |
| [MOB-008](#mob-008) | MED | Mobile | A fully-built, more-complete mobile post-detail implementation is dead; the live router uses a simpler stub with no edit/delete | verified | Phase 2b |
| [MOB-009](#mob-009) | MED | Mobile | Mobile's `PostStatsSidebar` "Load Stats" button is a silent no-op — callback never wired at either call site | verified | Phase 2b |
| [MOB-010](#mob-010) | LOW | Mobile | Dead types `post_summary.dart` / `post_media.dart` | verified | Phase 2b |
| [BE-010](#be-010) | INFO | Backend | `comment`/`reactions` modules import `PostModule` but never inject `PostService` | verified | Phase 2b |
| [BE-011](#be-011) | INFO | Backend | `Post.coverImage` is fully wired end-to-end but no real UI on either platform ever sets it | verified | Phase 2b |
| [MOB-011](#mob-011) | MED | Mobile | Mobile's `PostCard` never wires edit/delete callbacks into `PostHeader` — edit permanently disabled, delete a silent no-op | verified | Phase 2b |
| [CROSS-020](#cross-020) | HIGH | Backend + Mobile | GraphQL `myNotifications` doesn't redact a `hideAvatar` actor's `avatarUrl` — live leak on mobile, latent on web | verified | Phase 3a |
| [CROSS-021](#cross-021) | HIGH | Backend + Mobile | Mobile push notifications (FCM) are non-functional end-to-end — three separate broken code paths | verified | Phase 3a |
| [BE-016](#be-016) | HIGH | Backend | VIP chat room (`vip-lounge`) has no backing DB row on either platform — first message in it fails | verified | Phase 3b |
| [BE-012](#be-012) | MED | Backend | `NotificationController`'s entire REST surface has zero real callers on either platform | verified | Phase 3a |
| [CROSS-022](#cross-022) | MED | Frontend + Mobile | In-app vs. push-notification click targets resolve to different pages for the same notification kinds, on both platforms | verified | Phase 3a |
| [BE-017](#be-017) | MED | Backend | Attachment `url`s are re-linked to a new message/room-message with no check the uploader is the sender or the upload was scoped to that conversation | verified | Phase 3b |
| [MOB-014](#mob-014) | MED | Mobile | Mobile chat-room's `useNativeControls` flag is threaded through 6 files and read in none of them | verified | Phase 3b |
| [MOB-015](#mob-015) | MED | Mobile | Mobile chat-room hardcodes several UI strings despite matching, already-populated ARB localization keys | verified | Phase 3b |
| [CROSS-027](#cross-027) | MED | Mobile | Mobile's shared `AttachmentPreview` widget never surfaces server-generated thumbnails — always fetches the full original | verified | Phase 3b |
| [CROSS-028](#cross-028) | MED | Mobile | Mobile has no attachment-gallery ("all uploads") feature anywhere — resolves a Phase 0 "unconfirmed" flag | verified | Phase 3b |
| [BE-014](#be-014) | INFO | Backend | 4 of 9 `NotificationType` enum values have no producer anywhere in current backend code | verified | Phase 3a |
| [BE-015](#be-015) | LOW | Backend | `myPushSubscriptions` GraphQL query has no caller on either platform | verified | Phase 3a |
| [BE-013](#be-013) | LOW | Backend | `messaging.controller.ts`/`messaging-ws.gateway.ts` each inject `PushNotificationService` and never call it | verified | Phase 3a |
| [MOB-012](#mob-012) | LOW | Mobile | `dm_unread_count.dart` (notifications) sends the same query as the in-app unread-count file, not a DM-specific one | verified | Phase 3a |
| [MOB-013](#mob-013) | LOW | Mobile | Mobile notifications API has two dead-code duplicates, one containing an invalid GraphQL query | verified | Phase 3a |
| [CROSS-023](#cross-023) | LOW | Frontend + Mobile | Web auto-marks all notifications read on page load; mobile has no equivalent, requires explicit tap | verified | Phase 3a |
| [FE-011](#fe-011) | LOW | Frontend | Dead `useMarkNotificationRead` hook sits unused alongside the real mark-read implementation | verified | Phase 3a |
| [CROSS-024](#cross-024) | LOW | Frontend + Mobile | Chat-room has no reply-to-message and no delete-message capability at all, on any surface | verified | Phase 3b |
| [FE-012](#fe-012) | LOW | Frontend | Buffered multipart upload BFF route never forwards upload-scope headers; dead code today | verified | Phase 3b |
| [CROSS-025](#cross-025) | LOW | Mobile | Mobile chat-room never calls `GET /api/rooms`; hardcodes its room list instead | verified | Phase 3b |
| [MOB-016](#mob-016) | LOW | Mobile | Mobile's chat-room widget is dual-purposed as a second, unreachable 1:1 DM implementation | verified | Phase 3b |
| [CROSS-026](#cross-026) | LOW | Frontend + Mobile | Web's and mobile's own chat-room deep-link query param names don't match each other | verified | Phase 3b |
| [MOB-017](#mob-017) | LOW | Mobile | Mobile's attachment upload call never sends an upload-scope parameter — lands in the wrong storage folder | verified | Phase 3b |
| [CROSS-030](#cross-030) | HIGH | Frontend + Backend | Every paid↔paid tier change from web checkout 400s with a misleading "payment method required" error before reaching the backend; works correctly on mobile | verified | Phase 4a |
| [BE-020](#be-020) | MED | Backend | A brand-new subscription's first billing-history row can permanently show $0.00 with no invoice link if the confirming webhook is delayed or never arrives | verified | Phase 4a |
| [BE-018](#be-018) | MED | Backend | The Stripe webhook endpoint has no throttle exemption and shares the app's global rate limit — a burst can make Stripe treat deliveries as failed | verified | Phase 4a |
| [BE-022](#be-022) | MED | Backend | Upload-storage quota is displayed on both platforms but never enforced server-side — the enforcement function exists and is never called | verified | Phase 4b |
| [CROSS-033](#cross-033) | MED | Frontend + Mobile | Mobile has no client-side equivalent of web's storage-limit notice; the real, server-enforced message-storage cap is only discoverable via a raw failed send | verified | Phase 4b |
| [MOB-023](#mob-023) | MED | Mobile | Mobile's live Premium growth-stats view permanently shows 0/0.0% for two fields with no backend counterpart; two real fetched fields are never displayed | verified | Phase 4b |
| [FE-013](#fe-013) | LOW–MED | Frontend | Web's Plans page shows self-referential feature bullets on the Medium and Premium cards ("Everything in Medium" shown on the Medium card itself) | verified | Phase 4a |
| [BE-019](#be-019) | LOW | Backend | Nothing distinguishes a Stripe 3DS/SCA decline from any other subscription-charge failure; neither client offers a recovery path for it | verified | Phase 4a |
| [BE-021](#be-021) | INFO | Backend | `Wallet`/`WalletTransaction`'s balance and peer-transfer schema is fully modeled but entirely unused — billing only uses it as a bookkeeping anchor | verified | Phase 4a |
| [FE-014](#fe-014) | LOW | Frontend | The checkout BFF route unconditionally publishes an event literally named "subscription upgraded" for every outcome, including cancellations; zero consumers | verified | Phase 4a |
| [MOB-018](#mob-018) | INFO | Mobile | Mobile's `PlanSummaryCard` widget has a fully-built feature-list rendering branch its one call site never populates | verified | Phase 4a |
| [MOB-019](#mob-019) | LOW | Mobile | A mobile checkout file is a one-line re-export shim with zero importers anywhere in the app | verified | Phase 4a |
| [CROSS-032](#cross-032) | MED | Frontend + Mobile | Mobile never handles the live `tier-changed` WebSocket frame the backend pushes on every tier change; web does | verified | Phase 4a |
| [MOB-020](#mob-020) | LOW | Mobile | A mobile settings-billing widget (`PaymentMethods`) is fully built and never imported — the fifth recurrence of this effort's dead-parallel-implementation pattern | verified | Phase 4b |
| [MOB-021](#mob-021) | LOW | Mobile | Mobile's invoice-history badge always renders "warning," never "success," due to a status-string mismatch with what the backend actually writes | verified | Phase 4b |
| [FE-015](#fe-015) | LOW | Frontend | Web's billing-address "Cancel" button visibly reads "Cancel subscription" due to an always-true i18n fallback | verified | Phase 4b |
| [CROSS-035](#cross-035) | LOW | Frontend + Backend | The "Premium" nav page is not a subscription page — it's a live NestJS tier-gate tech demo with no role check, reachable by any paid user | verified | Phase 4b |
| [MOB-022](#mob-022) | LOW | Mobile | 7 of 8 files in mobile's `premium/` vertical are dead code — the largest dead-parallel-implementation cluster found in this effort, though functionally equivalent | verified | Phase 4b |
| [MOB-024](#mob-024) | LOW | Mobile | A VAT number entered on mobile settings/billing is saved correctly but never displayed back once the address form closes | verified | Phase 4b |
| [BE-023](#be-023) | LOW | Backend | `VaultService` (`@Global()`) has zero consumers anywhere in the app — the real vault-read path bypasses it entirely | verified | Phase 5a |
| [CROSS-036](#cross-036) | INFO | Docs (self-correction) | This effort's own "4 file-level demo-gated-but-live exceptions" claim undercounted by one; a 5th (`exception-filters/`'s global filter) found verifying Phase 5 | verified | Phase 5a |
| [CROSS-037](#cross-037) | INFO | Backend + Docs | Two backend source files still doc-comment-reference `docs/backend/research/logger.md`, deleted in this effort's own Phase 0 rewrite | verified | Phase 5a |
| [BE-024](#be-024) | LOW | Backend | `DataloaderService.getPostLoader()` is fully implemented with zero callers; its sibling `getUserLoader()` is genuinely used | verified | Phase 5a |
| [BE-025](#be-025) | LOW | Backend | `cookies/` (demo) vs `common/cookies/` (real) — a fourth confirmed module-naming collision trap | verified | Phase 5a |
| [MOB-025](#mob-025) | HIGH | Mobile | Admin user-search calls a backend/BFF route that has never existed — every search errors visibly | verified | Phase 5b |
| [CROSS-038](#cross-038) | LOW | Frontend + Mobile | The About page has no discoverable in-app nav link on either platform | verified | Phase 5b |
| [MOB-026](#mob-026) | LOW | Mobile | 4 of the app-shell inventory's files are dead code — `V1Header` reimplements all of them inline instead | verified | Phase 5b |
| [MOB-027](#mob-027) | LOW | Mobile | `lib/views/fallbacks/` (19 files) is an entirely dead, confusingly-named twin of the real `lib/fallbacks/` tree | verified | Phase 5b |
| [MOB-028](#mob-028) | MED | Mobile | `lib/features/statics/` (7 widgets) is entirely unwired — no error/not-found/unauthorized fallback UI exists live anywhere | verified | Phase 5b |
| [MOB-029](#mob-029) | LOW | Mobile | `lib/views/common/share_sheet/` is fully built and entirely dead | verified | Phase 5b |
| [CROSS-039](#cross-039) | INFO | Frontend + Mobile | Both platforms' admin role-gate is client-side-only at the render layer (at different points); real mutations are correctly backend-gated regardless | verified | Phase 5b |
| [BE-026](#be-026) | LOW | Backend | `Post.category`/`Post.tags` have zero application-code references anywhere in `src/post/` — not even in a DTO | verified | schema.md |
| [BE-027](#be-027) | LOW | Backend | The `Follow` model has zero application-code references anywhere in `src/` — no module queries or writes it | verified | schema.md |
| [BE-028](#be-028) | LOW | Backend | 9 `User` columns/relations (`referredBy` self-relation, `birthDate`, `quietHoursStart`, `interests`, `metadata`, `preferences`, `phoneNumber`, `phoneVerified`, `reputation`) have zero application-code references anywhere | verified | schema.md |
| [CROSS-040](#cross-040) | HIGH | Backend + Frontend + Infra(?) | 1:1 RTC calls always get cancelled ~5-10s after the callee accepts — invite/ringing/accept signaling all work, but a server-detected WebSocket disconnect (caller's or callee's, not consistently one side) fires `handleDisconnect`'s ringing-call-cancel path before either client ever reaches "connected." Root cause not isolated: app-level realtime reconnect bug vs. external proxy WS handling | verified | Live testing pass, 2026-08-27 |
| [CROSS-044](#cross-044) | LOW | Backend | GraphQL `users(search)` is only session-gated, not role-gated — any authenticated user can already request another user's `role`/`status` (admin/banned/etc.) directly, bypassing any admin-only UI gating | verified | Found while fixing BE-007, 2026-08-27 |

## Details

### BE-001

**Severity:** HIGH · **Area:** Backend · **Status:** verified
**Summary:** `main.ts` unconditionally starts the gRPC hybrid transport on `:5050` via
`internalGrpcOptions()`, but `GrpcModule`/`InternalController` are gated behind `DEMO_MODULES` (off
in production, on whenever `NODE_ENV=development`). In production, this means a gRPC listener
starts with **zero registered handlers**.
**Evidence:** [`nest-js-boilerplate/src/main.ts`](../nest-js-boilerplate/src/main.ts) (unconditional
transport start) vs [`nest-js-boilerplate/src/app.module.ts`](../nest-js-boilerplate/src/app.module.ts)
(`GrpcModule` in `DEMO_MODULES`) vs [`nest-js-boilerplate/src/grpc/`](../nest-js-boilerplate/src/grpc/).
**Notes:** documented file-level (not directory-level) in
[backend/_reference/demo-gated-but-live.md](./backend/_reference/demo-gated-but-live.md) (Phase 5).
Needs a real decision: either gate the transport start the same way the module is gated, or register
a minimal always-on handler. Flag to the team explicitly — this is a behavioral gap, not just a doc
curiosity.

### CROSS-004

**Severity:** HIGH · **Area:** Backend + Docs · **Status:** verified
**Summary:** The now-deleted `docs/adr/006-e2ee-chat-protocol.md` and `docs/backend/E2EE.md` (both
dated 2026-08-03) describe a full client-side E2EE protocol: X3DH handshake, Double Ratchet, sender
keys, safety numbers, per-device IndexedDB key storage, and a `src/e2ee/` module with `/api/e2ee/*`
endpoints. E2EE.md's own consequences section claimed **"Server/DB compromise exposes no message
content."** None of this exists in the current codebase. A same-repo doc,
`docs/restructure-wire-encryption.md` (approved 2026-08-04, one day later), explicitly documents
replacing that whole system with a **trusted-server, per-session transport-encryption** model — its
own risk section states plainly: *"Server can read messages — inherent to the chosen model; win is
wire + at-rest opacity and a ~10x smaller crypto codebase."* The shipped system
(`nest-js-boilerplate/src/wire-crypto/`) is: (1) a session/device-scoped shared-secret handshake
(`POST /api/crypto/handshake`) encrypting WS frames in transit (protects against network observers),
and (2) at-rest encryption of message bodies using a key the **server derives from its own
`MESSAGE_STORAGE_MASTER_KEY`/`ENCRYPTION_KEY`** (`StorageCryptoService.encryptForStorage`) —
protects a raw DB/backup leak, but *not* server/process compromise, since the server can always
re-derive the key. Neither ADR-006 nor E2EE.md was ever marked superseded.
**Evidence:** [`nest-js-boilerplate/src/wire-crypto/wire-crypto.controller.ts`](../nest-js-boilerplate/src/wire-crypto/wire-crypto.controller.ts),
[`nest-js-boilerplate/src/wire-crypto/storage-crypto.service.ts`](../nest-js-boilerplate/src/wire-crypto/storage-crypto.service.ts) —
compare against the deleted ADR-006/E2EE.md (recoverable via `git show HEAD~1:docs/adr/006-e2ee-chat-protocol.md`
before this rewrite's deletion commit) and the still-present migration record at the repo's
`docs/restructure-wire-encryption.md` path in that same pre-rewrite revision. Confirmed no `e2ee/`
module exists (`find nest-js-boilerplate/src -iname "*e2ee*"` → empty) and no X3DH/Double-Ratchet
code exists frontend-side (`grep -r "X3DH\|DoubleRatchet" next-js-boilerplate/src` → empty); the
frontend's only crypto hook, `useSessionCrypto.ts`, deals exclusively in `WireEnvelopeV2` (the
transport-layer format), never a message-content E2EE envelope.
**Notes:** this was a **deliberate, user-approved architecture change**, not an accident — the
concern is purely that the old docs kept asserting a security property (server/DB compromise ⇒ no
content exposure) the live system doesn't have, for over two weeks, in a doc that called itself
"Single source of truth." The new
[backend/messaging-realtime/wire-crypto/README.md](./backend/messaging-realtime/wire-crypto/README.md)
documents the real, current system only.

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

### CROSS-001

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Web's messages sidebar has a favorites/groups filter-pill feature (recent addition —
`git log` shows "Messages sidebar: filter pills + favorites + groups") with **zero Flutter
equivalent**. `grep -i favorite` across Flutter's messaging views/api returns nothing; web has
dedicated `favorite.ts`/`unfavorite`/`rooms.ts`/`conversation-attachments.ts` BFF routes and a
`MessagesSidebarFilterBar.tsx` component with no Flutter-side counterpart at all.
**Evidence:** [`next-js-boilerplate/src/views/messages/MessagesSidebarFilterBar.tsx`](../next-js-boilerplate/src/views/messages/MessagesSidebarFilterBar.tsx),
[`next-js-boilerplate/src/app/api/messages/favorite/route.ts`](../next-js-boilerplate/src/app/api/messages/favorite/route.ts)
vs [`flutter-boilerplate/lib/views/messages/`](../flutter-boilerplate/lib/views/messages/) (no
matching widget) and [`flutter-boilerplate/lib/api/server/messages/`](../flutter-boilerplate/lib/api/server/messages/)
(no `favorite.dart`).
**Notes:** referenced from
[backend/messaging-realtime/messaging/README.md](./backend/messaging-realtime/messaging/README.md#known-issues),
[frontend/v1/messages/page.md](./frontend/v1/messages/page.md#known-issues-affecting-this-page), and
[mobile/v1/messages/screen.md](./mobile/v1/messages/screen.md#widgets) — all three sides of the
gap point at this one row.

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

### CROSS-005

**Severity:** MED · **Area:** Backend + Docs · **Status:** verified
**Summary:** The now-deleted `docs/backend/AUTH.md` and `docs/backend/REALTIME.md` both describe
WebSocket authentication as a **first-message protocol**: client connects, then sends
`{type:"auth", tokens:{accessToken, rbacToken, deviceToken, userToken}}`, server replies
`{type:"authenticated"}`. The real `RealtimeGateway` authenticates entirely during the **WS upgrade
handshake**, before a socket is even created: `verifyUpgrade()` reads the four session cookies
directly off `req.headers.cookie`, validates via `SessionValidatorService`, and accepts/rejects the
upgrade — `authWs.send({type:'authenticated', sessionId})` is sent unconditionally right after
`connection` fires, with no wait for any client-sent auth message. `handleMessage`'s dispatch table
(`register`/`watch`/`unwatch`/`page`/registered handlers) has no `'auth'` case at all — confirmed via
`grep -rn "type.*===.*'auth'"` across `src/realtime` and `src/messaging`, zero matches.
**Evidence:** [`nest-js-boilerplate/src/realtime/realtime.gateway.ts`](../nest-js-boilerplate/src/realtime/realtime.gateway.ts)
(`verifyUpgrade`, the `connection` handler, `handleMessage`). `git log -S"verifyUpgrade"` dates the
cookie-based rewrite to 2026-08-03 ("refactor(auth): unify session validation into
SessionValidatorService"); `REALTIME.md` was still edited three days later (2026-08-06, an unrelated
upload-related change) without the WS-auth section being corrected.
**Notes:** the new
[backend/messaging-realtime/realtime/README.md](./backend/messaging-realtime/realtime/README.md) and
[backend/identity-access/auth/README.md](./backend/identity-access/auth/README.md) document the real
cookie-based upgrade mechanism only. This is the same failure mode as CROSS-004 (a normative doc not
updated when the mechanism it describes changed) — worth treating as a pattern, not two unrelated
one-offs, when deciding how future doc maintenance should work.

### BE-003

**Severity:** LOW–MED · **Area:** Backend · **Status:** verified
**Summary:** `MessagingService.sendAndDeliverMessage()` resolves `{ message, delivery }`. The REST
controller (`messaging.controller.ts`, `POST /api/conversations/:userId/messages`) returns this
**whole object** — including `delivery`, an internal WS-fan-out payload shape
(`{recipientPayload, senderPayload}`) — directly as the HTTP response body. The GraphQL resolver
(`messaging.resolver.ts`, `sendMessage` mutation) explicitly unwraps the same call and returns only
`result.message`, with an inline comment noting `delivery` is "irrelevant to the GraphQL caller."
**Evidence:** [`messaging.controller.ts#L245-L265`](../nest-js-boilerplate/src/messaging/messaging.controller.ts)
vs [`messaging.resolver.ts#L59-L80`](../nest-js-boilerplate/src/messaging/messaging.resolver.ts).
**Notes:** looks like an unintentional leak of an internal shape through the public REST response
rather than a deliberate API design choice (there's no comment on the REST side explaining why the
extra field is intentional, unlike the GraphQL side's explicit "irrelevant" comment). Low severity
because `delivery` doesn't appear to carry sensitive data beyond what's already in the frame content
itself — but it's inconsistent with the GraphQL contract for the same action and worth a second look
before deciding `wontfix` vs a real fix (narrow the REST response to `{ message }}` for parity).

### MOB-001

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** `lib/views/security/csp/nonce_panel.dart` is dead code — CSP nonces are a web-only
concept (Flutter's own `router.dart` documents this exclusion in a header comment listing web-only
Next.js features with no Flutter route). `grep -rn "NoncePanel"` outside the file itself returns
nothing.
**Evidence:** [`flutter-boilerplate/lib/views/security/csp/nonce_panel.dart`](../flutter-boilerplate/lib/views/security/csp/nonce_panel.dart).
**Notes:** candidate for deletion; not documented as a real screen in
`mobile/_reference/showcase-index.md` (Phase 5).

### FE-001

**Severity:** n/a · **Area:** Frontend · **Status:** verified — wontfix
**Summary:** `constants/routes.ts` defines `FIND_FRIENDS_PATH = "/find-friends"` and
`FRIENDS_PATH = "/friends"` as bare route *segments*, not full paths — both real call sites
(`views/v1/[lang]/V1Nav.tsx` and `views/messages/MessagesSidebarFilterBar.tsx`, both encountered
while building the Phase 0 messaging pilot) correctly prepend `/v1/${lang}` before using them
(`` `${base}${href}` `` in `V1Nav.tsx`, `` `/v1/${lang}${FIND_FRIENDS_PATH}` `` in
`MessagesSidebarFilterBar.tsx`). Originally flagged as a tentative lead purely from the constant's
name looking like a full path; checking both grep-confirmed call sites (there are no others) shows
it isn't.
**Evidence:** [`next-js-boilerplate/src/views/v1/[lang]/V1Nav.tsx#L44,89`](../next-js-boilerplate/src/views/v1/[lang]/V1Nav.tsx),
[`next-js-boilerplate/src/views/messages/MessagesSidebarFilterBar.tsx#L37`](../next-js-boilerplate/src/views/messages/MessagesSidebarFilterBar.tsx).
**Notes:** closed during Phase 0 itself — the only two call sites were both directly relevant to the
messaging pilot, so no need to defer this to Phase 2.

### CROSS-006

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Web's messaging supports replying to a specific message (quoted preview in
[ReplyBanner](./frontend/v1/messages/components/reply-banner.md), rendered inline on
[ChatMessageBubble](./frontend/v1/messages/components/chat-message-bubble.md), backed by
`replyToId`/`replyTo` end-to-end). Flutter's `ChatMessage` type has **no `replyTo` field at all**,
`ChatMessageBubble`'s context menu offers only delete-for-me/delete-for-everyone (no reply entry),
and `grep -rli "reply"` across `views/messages`, `api/client/messages`, `api/server/messages`, and
`types/messages` returns zero matches.
**Evidence:** [`flutter-boilerplate/lib/types/messages/message.dart`](../flutter-boilerplate/lib/types/messages/message.dart)
(no `replyTo` field) vs
[`next-js-boilerplate/src/types/messages/ChatView-types.ts`](../next-js-boilerplate/src/types/messages/ChatView-types.ts)
(`ReplyPreview` type) and
[`nest-js-boilerplate/src/messaging/models/reply-preview.model.ts`](../nest-js-boilerplate/src/messaging/models/reply-preview.model.ts)
(the backend model both REST and GraphQL expose).
**Notes:** unlike [CROSS-001](#cross-001) (a recent web-only sidebar feature), reply-to is a
core message-composition feature present on every backend surface — this is a larger parity gap
than the favorites/groups one. Referenced from
[mobile/v1/messages/screen.md](./mobile/v1/messages/screen.md) and
[mobile/v1/messages/widgets/chat-message-bubble.md](./mobile/v1/messages/widgets/chat-message-bubble.md).

### CROSS-007

**Severity:** MED · **Area:** Docs (self-correction) · **Status:** verified
**Summary:** While writing this same Phase 0 pilot, a background research pass (run before any file
in this doc set was written) reported that Flutter's `messages` vertical is "100% REST-via-BFF" —
i.e. that its REST-shaped `lib/api/server/messages/*.dart` calls go through the same Next.js BFF
route handlers the web browser uses. Reading the actual files directly while writing the mobile docs
shows this is false: `friends.dart` calls `_dio.get('/api/friends')` — the path the **backend's own**
`messaging.controller.ts` natively serves (`@Controller('api')`, `@Get('friends')`) — not the
frontend's differently-namespaced BFF route (`MESSAGES_FRIENDS_URL = "/api/messages/friends"`, per
[`next-js-boilerplate/src/constants/api/urls.ts`](../next-js-boilerplate/src/constants/api/urls.ts)).
The same pattern holds for every REST-shaped file in this vertical (`friend_requests.dart`,
`accept_friend_request.dart`, `decline_friend_request.dart`, `send_friend_request.dart`,
`room_messages.dart`, `dm_unread_count.dart`, `upload_attachment.dart`) — all hit backend-native
paths. Combined with the vertical's 5 direct-GraphQL files (also confirmed, and also missed by the
original pass, which searched specifically for `gql_helper.dart` usage and didn't catch the 5 files
here that hand-roll `_dio.post('/graphql', ...)` without that helper), **the entire `messages`
vertical has zero Next.js involvement in its mobile network calls** — not a REST/GraphQL split
across a BFF boundary, as previously documented.
**Evidence:** [`flutter-boilerplate/lib/api/server/messages/friends.dart`](../flutter-boilerplate/lib/api/server/messages/friends.dart)
vs [`nest-js-boilerplate/src/messaging/messaging.controller.ts`](../nest-js-boilerplate/src/messaging/messaging.controller.ts)
(`@Get('friends')`) vs
[`next-js-boilerplate/src/constants/api/urls.ts`](../next-js-boilerplate/src/constants/api/urls.ts)
(`MESSAGES_FRIENDS_URL`, a different path).
**Notes:** this is not a code bug — it's a correction to documentation produced earlier in this same
effort, before any per-vertical file was actually written. [`conventions.md § 9`](./conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)
and [`architecture.md`](./architecture.md#bff-proxy-pattern--nextjs-sits-between-the-browser-and-the-backend)
have been corrected; the original "~24 REST-via-BFF / ~55 direct-GraphQL" file counts themselves may
still be roughly accurate as a count of *shapes*, but the assumption that the REST-shaped subset
routes through the BFF does not hold and must be re-checked per vertical, not assumed, in every later
phase — this is exactly the kind of claim [conventions.md § 11](./conventions.md#11-old-reference-docs-are-a-lead-not-a-source-of-truth)
warns about, this time from research produced inside this same effort rather than a pre-existing doc.

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

### BE-005

**Severity:** MED · **Area:** Backend · **Status:** verified
**Summary:** `OAuthController.getProfile` (`GET /auth/oauth/:provider/profile`) has no auth guard at
all — no `@UseGuards`, no class-level guard on `OAuthController` either — directly contradicting its
own doc comment: *"Requires an authenticated session so the state token cannot be used by
unauthorized parties."* It is also dead: nothing in current frontend or mobile code calls it —
`loginWithOAuth` retrieves the OAuth profile itself, server-to-server, via the same
`OAuthService.retrieveProfile` this delegates to (the fix for a since-resolved account-takeover bug
that used to trust a client-supplied profile directly). Anyone who obtains or guesses a valid,
not-yet-consumed `state` value (10-minute Redis TTL, single read) can pull that profile's email/
name/provider-account-id from this endpoint with zero authentication.
**Evidence:** [`nest-js-boilerplate/src/auth/oauth/oauth.controller.ts#L161-L170`](../nest-js-boilerplate/src/auth/oauth/oauth.controller.ts)
(comment vs. code) — confirmed dead via `grep -rn "oauth/.*\/profile\|getProfile\b"` across
`next-js-boilerplate/src` and `flutter-boilerplate/lib` (zero matches) and `grep -rn
"retrieveProfile" nest-js-boilerplate/src` (only `auth.service.ts` and tests call it, server-side).
**Notes:** Not rated HIGH because it's dead code with no legitimate discovery path today (an
attacker needs a valid unexpired `state`, which in practice they'd only have as the flow's own
initiator) — but the comment/code mismatch is real and would mislead whoever adds a caller later
assuming the guard exists. Cleanest fix is probably deletion (the endpoint serves no purpose
`loginWithOAuth` doesn't already cover server-side) rather than adding the guard back — a product
call, not a docs one. Documented in
[backend/identity-access/auth/endpoints.md § Get a stored OAuth profile](./backend/identity-access/auth/endpoints.md#get-a-stored-oauth-profile).

### CROSS-009

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** The backend's `verifyLoginMfa` accepts a 6-10 character code and tries TOTP first,
falling back transparently to a one-time MFA backup code if TOTP fails. Web's login page
(`MfaChallengeForm`) has no UI path to reach that fallback at all — it only ever renders a 6-digit
`InputOTP`. Flutter's login screen has an explicit "use a backup code instead" toggle
(`_backupCodeMode`) that switches to a free-text 6-10 char field. A user who lost their authenticator
device can complete login on mobile but not on web.
**Evidence:** [`next-js-boilerplate/src/features/auth/ui/MfaChallengeForm.tsx`](../next-js-boilerplate/src/features/auth/ui/MfaChallengeForm.tsx)
(no backup-code branch) vs.
[`flutter-boilerplate/lib/views/auth/login/page_content.dart`](../flutter-boilerplate/lib/views/auth/login/page_content.dart)
(`_backupCodeMode`, `_buildMfaState`) vs.
[`nest-js-boilerplate/src/auth/auth-login.service.ts#L153-L212`](../nest-js-boilerplate/src/auth/auth-login.service.ts)
(`verifyLoginMfa`'s TOTP→backup-code fallback).
**Notes:** A reverse-direction parity gap from most findings in this effort — mobile is ahead of web
here, not behind. Documented in
[backend/identity-access/auth/endpoints.md § Verify a login MFA code](./backend/identity-access/auth/endpoints.md#verify-a-login-mfa-code).

### CROSS-010

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Flutter's register screen has no social-login option at all. `SocialLoginButtons` has
exactly one call site in the entire Flutter app — the login screen. Web's register page renders the
same `<SocialLoginButtons />` component login does.
**Evidence:** `grep -rln "SocialLoginButtons" flutter-boilerplate/lib` returns only
[`components/auth/social_login_buttons.dart`](../flutter-boilerplate/lib/components/auth/social_login_buttons.dart)
(the definition) and `views/auth/login/page_content.dart` — no `register/page_content.dart` match;
contrast [`next-js-boilerplate/src/app/auth/register/page.tsx`](../next-js-boilerplate/src/app/auth/register/page.tsx),
which renders `<SocialLoginButtons />`.
**Notes:** Functionally reachable via login → OAuth still creates a new account on first use, but
the entry point and framing are missing from the screen a new user would actually look for it on.

### CROSS-011

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Commit `d4fee7ce` ("reveal-icon on all password inputs + live complexity checklist,"
2026-08-20) added a show/hide toggle to the shared web `Input` component and a live
password-requirements checklist (`PasswordRequirements.tsx`, wired into register + reset-password).
`git show d4fee7ce --stat` touches only `next-js-boilerplate`/`nest-js-boilerplate` files — zero
`flutter-boilerplate` files. Mobile's `LabeledField`/`Input` has a fixed `obscureText` bool with no
visible-toggle affordance, and no live-requirements-checklist widget exists anywhere in
`components/auth/`.
**Evidence:** `git show d4fee7ce --stat`;
[`flutter-boilerplate/lib/components/auth/labeled_field.dart`](../flutter-boilerplate/lib/components/auth/labeled_field.dart)
(`obscureText` bool, no toggle); no equivalent of
[`next-js-boilerplate/src/features/auth/ui/PasswordRequirements.tsx`](../next-js-boilerplate/src/features/auth/ui/PasswordRequirements.tsx)
found under `flutter-boilerplate/lib/components/auth/` or `views/auth/`.
**Notes:** Backend enforcement is unaffected (the same DTOs validate both platforms) — purely a
client-side UX/affordance gap, and a recent one (most recent commit on `main` as of Phase 0).

### MOB-002

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** `currentUserProvider` is defined twice with incompatible types and semantics.
[`hooks/use_auth.dart`](../flutter-boilerplate/lib/hooks/use_auth.dart) defines
`Provider<AuthenticatedUser?>` (synchronous, derived from the locally-cached session) — every real
call site in the app (~20, spanning messages/feed/settings/this vertical's own
`verify_email/page_content.dart`) resolves to this one.
[`api/client/auth/queries.dart`](../flutter-boilerplate/lib/api/client/auth/queries.dart) separately
defines `FutureProvider<AuthenticatedUser>` (a fresh `me` GraphQL fetch) under the identical name —
its only reference anywhere is a re-export in `lib/api/index.dart`; it is never actually read or
watched.
**Evidence:** `grep -rn "currentUserProvider =" flutter-boilerplate/lib` → exactly 2 definitions;
`grep -rn "currentUserProvider"` elsewhere → ~20 real call sites, all resolving by import to
`hooks/use_auth.dart`'s version; `grep -rln "client/auth/queries.dart"` → only `lib/api/index.dart`.
**Notes:** Same confusable-naming family as [BE-002](#be-002). The underlying `me` GraphQL query
itself is not dead — `meServerProvider`/`MeServer.call()` is called directly (bypassing the dead
wrapper) from `settings/account/page_view.dart`.

### BE-004

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `register`, `resetPassword`, and `changePassword` each run two independent
password-strength checks in sequence: the DTO's class-validator decorators
(`@MinLength(8)`/`@Matches(PASSWORD_COMPLEXITY_REGEX)`, enforced by the global `ValidationPipe`
before the resolver body runs) and an explicit `validatePasswordStrength()` call inside the service.
Because the DTO regex already guarantees length ≥8 and lower+upper+digit (3 of the 4 character
classes `validatePasswordStrength` counts), two of that function's three checks (`length < 8`,
`variety < 3`) can never fire from any of its three current call sites — only its common-password
blocklist check adds anything the DTO doesn't already cover.
**Evidence:** [`nest-js-boilerplate/src/common/utils/password.ts`](../nest-js-boilerplate/src/common/utils/password.ts)
vs. [`nest-js-boilerplate/src/auth/dto/register.input.ts`](../nest-js-boilerplate/src/auth/dto/register.input.ts)
(and `reset-password.input.ts`/`change-password.input.ts`, same `@Matches` rule); exactly 3 call
sites confirmed via `grep -rn "validatePasswordStrength" nest-js-boilerplate/src`
(`auth-registration.service.ts` L59/257/335); global `ValidationPipe` confirmed in
[`main.ts`](../nest-js-boilerplate/src/main.ts) L148-149.
**Notes:** Not a security issue — the DTO check is strictly stronger. Worth a follow-up decision:
delete the redundant branches, or loosen the DTO if independent defense-in-depth was the intent.
Documented in [backend/identity-access/auth/endpoints.md § Known issues](./backend/identity-access/auth/endpoints.md#known-issues).

### CROSS-008

**Severity:** LOW · **Area:** Backend + Frontend + Mobile · **Status:** verified
**Summary:** `GET /auth/oauth/providers` has zero callers — both web (`SocialLoginButtons.tsx`) and
mobile (`social_login_buttons.dart`) hardcode their own identical 6-provider list instead of
fetching it. Dead backend code, and a latent drift risk: if a provider is added or removed in
`oauth-providers.ts` (or its env config) without both client-side lists being updated to match, the
three go silently out of sync.
**Evidence:** [`nest-js-boilerplate/src/auth/oauth/oauth.controller.ts#L61-L64`](../nest-js-boilerplate/src/auth/oauth/oauth.controller.ts)
vs. [`next-js-boilerplate/src/features/auth/ui/social-login-buttons.tsx`](../next-js-boilerplate/src/features/auth/ui/social-login-buttons.tsx)
and [`flutter-boilerplate/lib/components/auth/social_login_buttons.dart`](../flutter-boilerplate/lib/components/auth/social_login_buttons.dart),
both with a hardcoded provider array; confirmed via `grep -rn "oauth/providers\|listProviders"`
across both client trees (zero matches).
**Notes:** Low severity — purely a maintainability/drift risk; the two hardcoded lists currently do
match each other and the backend's real 6 providers.

### FE-002

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** `src/features/auth/actions/signup.ts` (a `"use server"` Tanstack-form action, with
matching `lib/forms/signup-options.ts` and `validators/auth/signup-schema.ts`) sits inside
`features/auth/actions/`, where it reads as the real registration path — but it's dead relative to
the actual register page. Its only caller is the unrelated forms-gallery demo,
`src/views/(demos)/form/Form.tsx`. Real registration is `RegisterForm` → `useAuth().register()` →
`registerServer()`.
**Evidence:** `grep -rln "signupAction\|signupFormOpts\|signupSchema" next-js-boilerplate/src` →
`features/auth/actions/signup.ts`, `lib/forms/signup-options.ts`, `validators/auth/signup-schema.ts`,
and exactly one consumer, `src/views/(demos)/form/Form.tsx`; confirmed
[`next-js-boilerplate/src/features/auth/ui/register-form.tsx`](../next-js-boilerplate/src/features/auth/ui/register-form.tsx)
uses `useAuth().register()` instead.
**Notes:** Same confusable-location trap as [BE-002](#be-002), frontend-side this time.

### FE-004

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** `src/api/server/auth/me-raw.ts`'s `getMeRawServer()` declares a response type
`AuthMeResult = {authed: boolean, session?: string}` that doesn't match what `/api/auth/me` actually
returns (`{user, accessToken}`, confirmed by reading the route directly). Its only caller is a demo
page.
**Evidence:** [`next-js-boilerplate/src/api/server/auth/me-raw.ts`](../next-js-boilerplate/src/api/server/auth/me-raw.ts)
vs. [`next-js-boilerplate/src/app/api/auth/me/route.ts`](../next-js-boilerplate/src/app/api/auth/me/route.ts)
(always returns `{user, accessToken}` or `{error}`, never `{authed, session}`); `grep -rln
"getMeRawServer"` → only `views/demos/csr-cookies/PageContent.tsx`.
**Notes:** Low real-world impact given the sole caller is a demo page, but the declared type is
simply wrong and would mislead anyone reading it as documentation of the route's contract.

### FE-005

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** `src/api/client/auth/queries.ts`'s `meQueryOptions()` (a React Query option builder
around `getMeServer`) has zero callers anywhere in the app — not imported by any component, not
re-exported from the barrel `src/api/index.ts` either.
**Evidence:** `grep -rln "meQueryOptions"` across `next-js-boilerplate/src` → only its own
definition file.
**Notes:** Dead code; safe to delete or wire up, whichever is intended.

### FE-003

**Severity:** INFO · **Area:** Docs (self-correction) · **Status:** verified
**Summary:** The brief for the Phase 1a agent (itself sourced from Phase 0's earlier repo research)
described `src/views/auth/` as "a 1-file stub." The file count was right, but the one file —
`forgot-password/PageContent.tsx` — is not a stub: it's the complete, real, load-bearing
implementation of the forgot-password page (state, validation, submit handler, success view),
imported directly by `src/app/auth/forgot-password/page.tsx`. It's simply organized outside the
`features/auth/ui/` pattern every other page in this vertical follows.
**Evidence:** [`next-js-boilerplate/src/views/auth/forgot-password/PageContent.tsx`](../next-js-boilerplate/src/views/auth/forgot-password/PageContent.tsx)
(full implementation) vs.
[`next-js-boilerplate/src/app/auth/forgot-password/page.tsx`](../next-js-boilerplate/src/app/auth/forgot-password/page.tsx)
(imports it directly).
**Notes:** Same "verify, don't take an earlier pass's premise on faith" lesson as
[CROSS-007](#cross-007) — this time the premise came from this effort's own earlier research rather
than from a pre-existing doc.

### FE-006

**Severity:** n/a · **Area:** Frontend · **Status:** verified — wontfix
**Summary:** `/api/auth/token` and `/api/auth/refresh` sound like they might be the same thing but
are not: `token`'s route only echoes the current httpOnly cookie values back as JSON (no backend
call at all); `refresh`'s route runs the real CSRF-guarded backend `refresh` mutation and rotates
every cookie. Both are legitimately used for different purposes (`token` by `useAuth.tsx`'s
SSR-hydrate branch to get the access token into client JS state; `refresh` by the 401→retry
interceptor in `api-client.ts`).
**Evidence:** [`next-js-boilerplate/src/app/api/auth/token/route.ts`](../next-js-boilerplate/src/app/api/auth/token/route.ts)
(cookie-echo only) vs.
[`next-js-boilerplate/src/app/api/auth/refresh/route.ts`](../next-js-boilerplate/src/app/api/auth/refresh/route.ts)
(real refresh); confirmed `next-js-boilerplate/src/lib/api-client.ts` uses `AUTH_REFRESH_URL` for
the 401-retry cycle, not `AUTH_TOKEN_URL`.
**Notes:** Not a bug — checked and cleared, same pattern as [FE-001](#fe-001). Flagged only because
the names are confusable enough that a future reader might assume they're interchangeable.

### CROSS-012

**Severity:** MED · **Area:** Backend + Frontend + Mobile · **Status:** verified
**Summary:** `updateApiKey` (rename / enable-disable an API key) is fully implemented backend-side,
and web has a complete BFF proxy for it (`PATCH /api/api-keys/[id]`, CSRF-echoed, correctly calls
the mutation) — but has zero UI trigger on either platform. The api-keys screen/page only ever
renders a static, non-interactive enabled/disabled badge.
**Evidence:** [`nest-js-boilerplate/src/api-keys/api-keys.resolver.ts#L43-52`](../nest-js-boilerplate/src/api-keys/api-keys.resolver.ts),
[`next-js-boilerplate/src/app/api/api-keys/[id]/route.ts`](../next-js-boilerplate/src/app/api/api-keys/[id]/route.ts)
(fully wired `PATCH` handler, no caller); `grep -rn "updateApiKey" next-js-boilerplate/src` finds
only the route/GraphQL-string files; `grep -rn "updateApiKey" flutter-boilerplate/lib` finds nothing
at all.
**Notes:** Documented in
[backend/identity-access/api-keys/README.md](./backend/identity-access/api-keys/README.md#known-issues)
and both platforms' api-keys page/screen docs.

### CROSS-014

**Severity:** MED · **Area:** Docs (self-correction) · **Status:** verified
**Summary:** Both this effort's own earlier Flutter-mapping research and the resulting
`docs/mobile/README.md` vertical index stated mobile's security screen "is NOT nested under
settings — it's its own top-level route." Checked directly against the router and shell chrome
while documenting this vertical: **false**. The registered route is `/v1/:lang/settings/security`,
it renders inside the identical `SettingsShellScaffold` chrome as Sessions/API Keys, and
`SettingsNav`'s tab list includes it exactly like web's. The only real difference is that the Dart
*source file* (`lib/views/security/page_view.dart`) sits outside `lib/views/settings/` on disk — a
file-organization quirk with no routing consequence.
**Evidence:** [`flutter-boilerplate/lib/app/router.dart#L405-411`](../flutter-boilerplate/lib/app/router.dart),
[`flutter-boilerplate/lib/views/settings/settings_shell.dart#L56-105`](../flutter-boilerplate/lib/views/settings/settings_shell.dart).
**Notes:** `docs/mobile/README.md`'s vertical-index table has been corrected to match (see that
file's history) — this row records why. The mobile security docs live at the verified path,
[mobile/v1/settings/security/](./mobile/v1/settings/security/), not a top-level `mobile/security/`
folder.

### BE-006

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `AdminResolver` (`authorization/`) contains a private `createAuditLog()` method that is
byte-for-byte the same logic (including the identical `P2003`-retry-with-null-actor branch and log
message) as `AuditLogProcessor.createAuditLog()` — but nothing in `AdminResolver` ever calls it.
Every real mutation in the file (`setUserTier`/`setUserStatus`/`resetMfa`) correctly uses
`outbox.emit()` instead, the transactional-outbox pattern the rest of the codebase uses (see
[architecture.md § Transactional outbox](./architecture.md#transactional-outbox--reliable-event-emission)).
**Evidence:** [`nest-js-boilerplate/src/authorization/admin.resolver.ts#L105-123`](../nest-js-boilerplate/src/authorization/admin.resolver.ts)
vs. [`nest-js-boilerplate/src/outbox/audit-log.processor.ts#L53-71`](../nest-js-boilerplate/src/outbox/audit-log.processor.ts)
(the real, called implementation); `grep -rn "createAuditLog" nest-js-boilerplate/src` shows only
these two definitions and one call site, inside the processor itself.
**Notes:** Looks like a leftover from before this resolver was migrated to the outbox pattern. Safe
to delete. Documented in
[backend/identity-access/authorization/README.md](./backend/identity-access/authorization/README.md#known-issues).

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

### BE-009

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `POST /csrf/echo` (a self-test endpoint that echoes a CSRF-validated body back) has no
caller anywhere in frontend or mobile source.
**Evidence:** [`nest-js-boilerplate/src/csrf/csrf.controller.ts#L18-21`](../nest-js-boilerplate/src/csrf/csrf.controller.ts) —
the only `/api/echo`-shaped route on web is an unrelated CSR demo page hitting a different backend
endpoint entirely.
**Notes:** Reads as a manual/QA verification route for the CSRF mechanism, not a real product
contract. Documented in
[backend/identity-access/csrf/README.md](./backend/identity-access/csrf/README.md#known-issues).

### FE-007

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** `views/settings/security/mfa-handlers.ts` exports a complete, unused second
implementation of `handleEnroll`/`handleVerify`/`handleDisable` — `PageContent.tsx` defines and uses
its own inline versions instead. The dead version's `handleVerify` even has a different signature
(an optional `setMfaEnabled` param) from the live one, suggesting drift rather than a recent
parallel attempt.
**Evidence:** [`next-js-boilerplate/src/views/settings/security/mfa-handlers.ts`](../next-js-boilerplate/src/views/settings/security/mfa-handlers.ts)
vs. `PageContent.tsx`'s inline handlers in the same directory; `grep -rln "mfa-handlers"
next-js-boilerplate/src` returns nothing outside the file itself.
**Notes:** See [CROSS-013](#cross-013) — the same shape of bug independently exists on mobile in the
same vertical.

### CROSS-013

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** The same "scaffolded-then-inlined, original files left behind" dead-code pattern shows
up independently on both platforms in one vertical. Web: [FE-007](#fe-007)'s `mfa-handlers.ts`.
Mobile: **three** whole widget files under `flutter-boilerplate/lib/views/settings/api_keys/` —
`api_key_list.dart` (`ApiKeyList`/`ApiKeyItem`), `create_api_key_form.dart` (`CreateApiKeyForm`),
`api_key_handlers.dart` (`ApiKeyHandlers`) — are fully built and never imported anywhere; the real
screen (`page_content.dart`) reimplements the identical list/create/revoke UI entirely inline.
**Evidence:** `grep -rln "ApiKeyList(\|CreateApiKeyForm(\|apiKeyHandlersProvider"
flutter-boilerplate/lib` returns only each file's own definition (a same-named but distinct
`ApiKeyList` in `views/forms/api_key/` is the unrelated forms-gallery demo, confirmed as a different
class).
**Notes:** Same failure shape, two platforms, one vertical — worth a broader sweep rather than
treating as two unrelated one-offs. Documented in
[frontend/v1/settings/README.md](./frontend/v1/settings/README.md#known-issues-affecting-this-vertical),
[mobile/v1/settings/README.md](./mobile/v1/settings/README.md#known-issues-affecting-this-vertical),
and both api-keys page/screen+api docs.

### CROSS-015

**Severity:** n/a · **Area:** Docs (cross-agent coordination) · **Status:** verified
**Summary:** Phase 1a's `auth/endpoints.md` stated, for `changePassword`: *"No mobile equivalent
screen was found in this scan — `ChangePasswordServer.call()` exists in `change_password.dart` but
locating its caller is outside this pass's scope."* Phase 1b (documenting the settings/security
vertical concurrently) confirmed the caller:
`flutter-boilerplate/lib/views/security/change_password/page_content.dart`
(`ChangePasswordPageContent`).
**Evidence:** [`flutter-boilerplate/lib/views/security/change_password/page_content.dart`](../flutter-boilerplate/lib/views/security/change_password/page_content.dart)
calls `loginActionsProvider.changePassword(...)` → `change_password.dart` → backend
`changePassword`.
**Notes:** Not a bug — a coordination gap between two concurrent passes, resolved. Phase 1a's
`auth/endpoints.md` has been updated to link to
[mobile/v1/settings/security/widgets/change-password.md](./mobile/v1/settings/security/widgets/change-password.md)
directly instead of stating "not found."

### CROSS-016

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Web's `users/list` and `users/detail` pages are 100% hardcoded static demo content (a
literal `const USERS = [...]` array, no `src/api/**` import anywhere) with no real auth/role gate
beyond the standard "must be logged in" layout check. Mobile's identically-named screens are the
opposite in every respect — a real, live-data feature (`friendsListProvider`/`searchUsersProvider`),
gated to `ADMIN`/`SUPERADMIN` only via `requireAdmin` on all three `/users*` routes.
**Evidence:** [`next-js-boilerplate/src/views/users/list/FreePageView.tsx`](../next-js-boilerplate/src/views/users/list/FreePageView.tsx)
and `.../users/detail/[uuid]/FreePageView.tsx` (hardcoded arrays, `data-testid` attributes suggesting
a deliberate E2E fixture) vs.
[`flutter-boilerplate/lib/views/users/list/page_view.dart`](../flutter-boilerplate/lib/views/users/list/page_view.dart)
and [`router.dart#L511-547`](../flutter-boilerplate/lib/app/router.dart) (`redirect: (_, state) =>
requireAdmin(...)`).
**Notes:** Not a bug in the sense of broken behavior — both platforms work as built — but a
significant, previously-undocumented implementation divergence under one shared route name.
Documented in [frontend/v1/users/README.md](./frontend/v1/users/README.md),
[mobile/v1/users/README.md](./mobile/v1/users/README.md), and
[backend/social-content/profile/README.md](./backend/social-content/profile/README.md) (which also
carries the separate `users/`-vs-`profile/` backend naming trap, [BE-002](#be-002)).

### MOB-003

**Severity:** HIGH · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's user-detail screen ignores its own `userId` route parameter entirely and always
fetches/displays the logged-in caller's own profile — 100% reproducible for every profile viewed. Its
one action, "Add Friend," consequently always tries to send a friend request to yourself.
**Evidence:**
```dart
final _userDetailProvider = FutureProvider.family((ref, String userId) async {
  final server = ref.read(profileGetServerProvider);
  return server.call();          // userId is never referenced
});
```
[`flutter-boilerplate/lib/views/users/detail/page_view.dart#L11-14`](../flutter-boilerplate/lib/views/users/detail/page_view.dart).
`ProfileGetServer.call()` takes zero arguments and always runs `query MyProfile`, resolved
backend-side entirely from `@CurrentUser()` — confirmed no backend query accepts a target-user id and
returns another user's profile (`grep -n "^type Query" -A 60 nest-js-boilerplate/src/schema.gql` has
no such entry). The "Add Friend" button reads `ref.read(friendActionsProvider).sendRequest(user.id)`,
guaranteed to hit the backend's self-friending `403 EX_FORBIDDEN` check every time.
**Notes:** Reachability is limited to admins ([CROSS-016](#cross-016)), but within that audience the
bug is unconditional. Simplest fix: pass the already-fetched friend/search row through navigation
instead of re-fetching by id, or add a backend query that accepts a target id. Documented in
[backend/social-content/profile/README.md](./backend/social-content/profile/README.md#known-issues),
[mobile/v1/users/detail/screen.md](./mobile/v1/users/detail/screen.md),
[mobile/v1/users/api.md](./mobile/v1/users/api.md).

### MOB-004

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** The bare `/v1/:lang/users` route (`UsersPageContent`) is registered and admin-gated but
unreachable in practice — no navigational caller anywhere in the app, and its list rows have no tap
handler.
**Evidence:** [`flutter-boilerplate/lib/views/users/page_view.dart`](../flutter-boilerplate/lib/views/users/page_view.dart)
— `ListTile` items with no `onTap`. `grep -rn "'v1Users'"` (outside `router.dart` itself) and
`grep -rn "/users'"` (outside `/users/list`, `/users/detail`) both return nothing across
`flutter-boilerplate/lib`. No equivalent web route exists at this exact path.
**Notes:** Same shape as [MOB-001](#mob-001) — candidate for deletion. Documented in
[mobile/v1/users/README.md](./mobile/v1/users/README.md).

### FE-008

**Severity:** MED · **Area:** Frontend · **Status:** verified
**Summary:** Web's Friends page hardcodes `/v1/en/` in all three of its navigation actions instead of
the active locale.
**Evidence:** [`next-js-boilerplate/src/views/friends/FriendsPageContent.tsx#L32,49,60`](../next-js-boilerplate/src/views/friends/FriendsPageContent.tsx)
— `router.push("/v1/en/find-friends")` (×2) and `` router.push(`/v1/en/messages?user=${friend.id}`) ``.
`grep -rn '"/v1/en/'` across `views/friends`, `views/find-friends`, `views/users`,
`views/settings/{account,general,privacy}` matches only this one file. Confirmed as a real, isolated
bug by comparison to Flutter's equivalent,
[`friends_page_content.dart#L43,68,111`](../flutter-boilerplate/lib/views/friends/friends_page_content.dart),
which correctly interpolates `lang` throughout, and to this same file's neighbor
`settings/privacy/FreePageView.tsx`, which derives the active lang via `useParams<{lang: string}>()`.
**Notes:** A non-English user clicking "Find friends" or any friend row on this page is silently
bounced to the English-locale URL. Documented in
[frontend/v1/friends/page.md](./frontend/v1/friends/page.md).

### CROSS-017

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Web's `SuggestedFriendsPanel` (find-friends, Medium+ tier) renders name and
mutual-friend count but has no "Add Friend" action anywhere in the file; Flutter's equivalent widget
has a working one. Web's version also never selects `avatarUrl` in its BFF query, so it can't show a
real avatar there either.
**Evidence:** [`next-js-boilerplate/src/views/find-friends/SuggestedFriendsPanel.tsx`](../next-js-boilerplate/src/views/find-friends/SuggestedFriendsPanel.tsx)
(no button/handler) vs.
[`flutter-boilerplate/lib/views/find_friends/suggested_friends_panel.dart`](../flutter-boilerplate/lib/views/find_friends/suggested_friends_panel.dart)
(`FilledButton.tonal(onPressed: () => ref.read(friendActionsProvider).sendRequest(...))`).
[`next-js-boilerplate/src/api/server/friends/suggested.ts`](../next-js-boilerplate/src/api/server/friends/suggested.ts)
omits `avatarUrl`; [`flutter-boilerplate/lib/api/server/friends/suggested.dart`](../flutter-boilerplate/lib/api/server/friends/suggested.dart)
selects it.
**Notes:** The backend action is fully reachable elsewhere on the same web page (the search tab) — a
missing affordance in one panel, not a broken feature. Documented in
[frontend/v1/find-friends/components/suggested-friends-panel.md](./frontend/v1/find-friends/components/suggested-friends-panel.md),
[mobile/v1/find-friends/widgets/suggested-friends-panel.md](./mobile/v1/find-friends/widgets/suggested-friends-panel.md).

### CROSS-018

**Severity:** HIGH · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Mobile gates the find-friends vertical far more aggressively than the backend requires or
web replicates. The backend has exactly one tier gate in this whole contract (`suggestedFriends`,
`@MinTier(MEDIUM)`); `users(search)` and every friend-request REST handler have none. Web exposes
search plus both request tabs to every tier. Mobile instead has four independently-built tier
variants: Free gets suggestions only, no search; Basic gets a static empty-state and doesn't even
attempt a network call; Medium gets search + suggestions but no requests view on this screen; Premium
gets everything plus a non-functional "filter" bottom sheet. Separately, Free tier's requests screen
shows a bare upgrade message with zero data — no way to see or respond to an incoming friend request
at all.
**Evidence:** [`nest-js-boilerplate/src/friends/friends.resolver.ts#L38-39`](../nest-js-boilerplate/src/friends/friends.resolver.ts)
(the one real `@MinTier`); [`nest-js-boilerplate/src/messaging/messaging.controller.ts`](../nest-js-boilerplate/src/messaging/messaging.controller.ts)
(class-level `SessionAuthGuard` only, no tier guard on any friend-request route, confirmed by reading
the full controller) vs. `flutter-boilerplate/lib/views/find_friends/{free_page_view.dart,basic_page_view.dart,medium_page_view.dart,premium_page_view.dart}`
(four independent implementations) and `requests_page.dart`'s `TierGate` (Free tier:
`Center(child: Text(t.findFriendsUpgradeToSee))`).
**Notes:** Documented per-tier in [mobile/v1/find-friends/README.md](./mobile/v1/find-friends/README.md),
[mobile/v1/find-friends/screen.md](./mobile/v1/find-friends/screen.md),
[mobile/v1/find-friends/requests/screen.md](./mobile/v1/find-friends/requests/screen.md); backend
contract cited in [backend/social-content/friends/README.md](./backend/social-content/friends/README.md).
Rated HIGH because Free/Basic-tier mobile users are denied a core feature (finding/adding friends)
that both the backend and the web client make freely available to them.

### MOB-005

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's find-friends vertical has two fully-built, completely dead files:
`search_utils.dart` (3 unused exports — highlight-match, filter, debounce helpers) and
`pagination_bar.dart` (an unused `PaginationBar` widget).
**Evidence:** `grep -rn "highlightMatch\|filterByQuery\|Debouncer("` and
`grep -rln "PaginationBar("` across `flutter-boilerplate/lib` each return only the symbol's own
definition file, [`views/find_friends/search_utils.dart`](../flutter-boilerplate/lib/views/find_friends/search_utils.dart)
/ [`views/find_friends/pagination_bar.dart`](../flutter-boilerplate/lib/views/find_friends/pagination_bar.dart).
None of the three real search implementations paginate — each renders every result in one
`ListView.builder`.
**Notes:** Same shape as [MOB-001](#mob-001). Web's equivalent `PaginationBar.tsx` **is** used.
Documented in [mobile/v1/find-friends/README.md](./mobile/v1/find-friends/README.md).

### MOB-006

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** Mobile settings has two more fully-built, never-imported widgets, the same
"scaffolded then inlined, original left behind" pattern as [CROSS-013](#cross-013)/[FE-007](#fe-007):
`account_avatar_section.dart` and `settings_select.dart`. Both real screens reimplement the same UI
inline instead.
**Evidence:** `grep -rln "AccountAvatarSection"` → only
[`views/settings/account/account_avatar_section.dart`](../flutter-boilerplate/lib/views/settings/account/account_avatar_section.dart)
itself (the real `page_view.dart` reimplements the avatar section inline). `grep -rln "SettingsSelect("`
→ only [`views/settings/general/settings_select.dart`](../flutter-boilerplate/lib/views/settings/general/settings_select.dart)
itself (the real screen uses inline `DropdownButton`s). Both web counterparts
(`AccountAvatarSection.tsx`, `SettingsSelect.tsx`) are genuinely used — mobile-only.
**Notes:** With this and [CROSS-013](#cross-013)/[FE-007](#fe-007), the pattern now recurs across four
verticals (api-keys, security, account, general) — worth a dedicated repo-wide sweep rather than four
unrelated one-offs. Documented in [mobile/v1/settings/account/screen.md](./mobile/v1/settings/account/screen.md),
[mobile/v1/settings/general/screen.md](./mobile/v1/settings/general/screen.md).

### CROSS-019

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Settings → General's Language field persists correctly on both platforms but only
actually changes the rendered UI language on mobile — web's real language switch (`LangSwitcher`, a
cookie + navigation) is entirely independent of the persisted `profile.locale`, which web only ever
reads back to pre-fill its own dropdown. Timezone persists on both platforms but is read back by
neither — both apps instead derive the "real" timezone live from the OS/browser at render time.
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

### MOB-007

**Severity:** HIGH · **Area:** Mobile · **Status:** verified
**Summary:** `friendRequestsProvider` throws an unhandled exception for every real pending friend
request the backend returns — a field-name mismatch between the Dart model and the actual API
response — breaking the pending-requests feature for every tier that can reach it. Invisible in
casual testing because an account with zero pending requests never triggers the broken parse path
(`.map()` over an empty list never calls the factory).
**Evidence:** Backend's `GET /api/friends/requests` returns `{id, direction, user: {id, name, email,
avatar}, createdAt}` ([`messaging-friend.service.ts#L161-201`](../nest-js-boilerplate/src/messaging/messaging-friend.service.ts)).
[`flutter-boilerplate/lib/types/messages/friend_request_types.dart`](../flutter-boilerplate/lib/types/messages/friend_request_types.dart)'s
`FriendRequest.fromJson` instead reads `json['fromUserId']`/`fromUserName`/`fromUserAvatar` — none of
which exist in the real response (the per-user fields are nested under `user`, under different names;
`direction` isn't read at all). `json['fromUserId'] as String` on a missing key evaluates to
`null as String`, which Dart throws for at parse time. Neither
[`FriendRequestsServer.call()`](../flutter-boilerplate/lib/api/server/messages/friend_requests.dart)
nor `friendRequestsProvider` catches this. Confirmed no other `FriendRequest(` construction path
exists (`grep -rn "FriendRequest(" flutter-boilerplate/lib`).
**Notes:** Independent of, and more severe than, [CROSS-018](#cross-018)'s tier-gating finding —
fixing one doesn't fix the other. The shared `FriendRequest` type lives in `types/messages/`, though
this scan found no live consumer of it in the messages vertical itself. Documented in
[backend/messaging-realtime/messaging/endpoints.md](./backend/messaging-realtime/messaging/endpoints.md),
[mobile/v1/find-friends/README.md](./mobile/v1/find-friends/README.md),
[mobile/v1/find-friends/api.md](./mobile/v1/find-friends/api.md).

### FE-009

**Severity:** MED · **Area:** Frontend · **Status:** verified
**Summary:** The single GraphQL query backing web's post-detail page never selects the tier-gated
`reactionBreakdown`/`whoReacted` fields, so both are always empty client-side — the display
components silently render nothing rather than erroring, masking the gap.
**Evidence:** [`next-js-boilerplate/src/lib/graphql/queries.ts`](../next-js-boilerplate/src/lib/graphql/queries.ts)
`POST_QUERY` (L60-109) selects `id/title/content/coverImage/imageUrl/status/createdAt/author/comments/reactions/_count`
but never `reactionBreakdown`/`whoReacted` — the only query used to load a single post, both
server-side and client-side. The backend fields are real and guarded:
[`nest-js-boilerplate/src/post/post.resolver.ts#L101-126`](../nest-js-boilerplate/src/post/post.resolver.ts)
(`@ResolveField` + `TierGuard` + `@MinTier`). `ReactionBreakdown.tsx#L8` / `WhoReacted.tsx#L10` (both
under `next-js-boilerplate/src/views/posts/[uuid]/`) each early-return `null` on an empty array.
**Notes:** One-line fix (add both fields to `POST_QUERY`). Documented in
[backend/social-content/post/README.md](./backend/social-content/post/README.md),
[frontend/v1/posts/page.md](./frontend/v1/posts/page.md),
[frontend/v1/posts/components/reaction-breakdown.md](./frontend/v1/posts/components/reaction-breakdown.md),
[frontend/v1/posts/components/who-reacted.md](./frontend/v1/posts/components/who-reacted.md).

### FE-010

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** `MediumFeedList.tsx` is a byte-for-byte duplicate of `FreeFeedList.tsx` — the only actual
behavioral difference between the Free/Basic and Medium feed tiers is a `showSidebar` vs
`showPageInfo` prop on `FeedBaseView`, which didn't need a whole second copy of the list component to
express.
**Evidence:** `diff next-js-boilerplate/src/views/feed/FreeFeedList.tsx next-js-boilerplate/src/views/feed/MediumFeedList.tsx`
→ zero output. Contrast [`BasicPageView.tsx`](../next-js-boilerplate/src/views/feed/BasicPageView.tsx),
which correctly aliases (`export const BasicPageView = FreePageView;`) instead of duplicating.
**Notes:** Cosmetic/maintainability only — both files must be hand-kept in sync going forward.
Documented in [frontend/v1/feed/page.md](./frontend/v1/feed/page.md).

### MOB-008

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** `flutter-boilerplate/lib/views/posts/[uuid]/` — a full, tier-differentiated post-detail
implementation (10 files: base view, header, content view, edit form, reaction breakdown, who-reacted)
— is entirely dead code, never imported outside its own folder. The router wires the real
`/v1/:lang/posts/:uuid` route to a separate, simpler screen instead, which has no edit-post, no
delete-post, no reaction-breakdown, and no who-reacted UI at all — so a post's own author currently
has no working path anywhere on mobile to edit or delete their post.
**Evidence:** `grep -rn "PostDetailPage(" flutter-boilerplate/lib` matches only inside
`lib/views/posts/[uuid]/` itself. [`router.dart#L435-440`](../flutter-boilerplate/lib/app/router.dart)
wires `v1PostDetail` to `PostDetailPageContent` from `lib/views/posts/detail_page_view.dart` instead
(confirmed via its import list, which never references the `[uuid]/` subfolder); that live view has
no edit/delete/reaction affordance anywhere. The dead tree shows signs of being abandoned mid-build:
its `WhoReacted` (`who_reacted.dart#L32-42`) is 100% hardcoded fake data, never reading its own
`postId` prop; its `PremiumPostDetailPage` (`premium_page_view.dart#L35`) computes `isAuthor` by
comparing the viewer's id to the **post's** id rather than `post.authorId` — permanently false even if
wired up.
**Notes:** Compounds with [MOB-011](#mob-011) below (the feed's own edit/delete callbacks are also
unwired) — between the two, there is currently no working edit/delete path for a post's author
anywhere on mobile. Documented in [backend/social-content/post/README.md](./backend/social-content/post/README.md),
[mobile/v1/posts/README.md](./mobile/v1/posts/README.md),
[mobile/v1/posts/detail/screen.md](./mobile/v1/posts/detail/screen.md).

### MOB-009

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's `PostStatsSidebar` "Load Stats" button is a silent no-op — its `onLoadStats`
callback is never supplied at either of its two real call sites, and the backing `postStatsProvider`
has zero readers anywhere in the app.
**Evidence:** [`flutter-boilerplate/lib/components/feed/post_stats_sidebar.dart#L19,35`](../flutter-boilerplate/lib/components/feed/post_stats_sidebar.dart)
(`if (widget.onLoadStats == null) return;`). `grep -rn "PostStatsSidebar(" flutter-boilerplate/lib` →
both call sites in [`views/feed/feed_base_view.dart#L326,338`](../flutter-boilerplate/lib/views/feed/feed_base_view.dart)
instantiate it with zero arguments. `grep -rn "postStatsProvider\|postStatsServerProvider" flutter-boilerplate/lib`
→ only its two definitions, no `ref.watch`/`ref.read` anywhere.
**Notes:** Same "scaffolded-then-not-fully-wired" shape as [CROSS-013](#cross-013)/[FE-007](#fe-007).
One-line fix. Documented in [backend/social-content/post/endpoints.md](./backend/social-content/post/endpoints.md),
[mobile/v1/feed/screen.md](./mobile/v1/feed/screen.md),
[mobile/v1/feed/widgets/post-stats-sidebar.md](./mobile/v1/feed/widgets/post-stats-sidebar.md).

### MOB-010

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** `lib/types/posts/post_summary.dart` and `lib/types/posts/post_media.dart` are dead code —
every real screen in the posts/feed verticals uses `types/feed/post.dart`/`comment.dart` instead.
**Evidence:** `grep -rln "PostSummary\|PostMedia\b" flutter-boilerplate/lib` → only the two definition
files themselves.
**Notes:** Same shape as [MOB-001](#mob-001). Documented in [mobile/v1/posts/README.md](./mobile/v1/posts/README.md).

### BE-010

**Severity:** INFO · **Area:** Backend · **Status:** verified
**Summary:** `CommentModule` and `ReactionsModule` both import `PostModule` in `@Module.imports` but
never actually inject `PostService` — both query `Post` directly via `PrismaService` instead.
**Evidence:** `grep -n "PostService" nest-js-boilerplate/src/comment/comment.service.ts nest-js-boilerplate/src/reactions/reactions.service.ts`
→ zero matches in either file, despite both modules' `@Module` decorators importing `PostModule`.
**Notes:** Harmless (NestJS DI tolerates an unused module import) — documentation-clarity only.
Documented in [backend/social-content/comment/README.md](./backend/social-content/comment/README.md),
[backend/social-content/reactions/README.md](./backend/social-content/reactions/README.md).

### BE-011

**Severity:** INFO · **Area:** Backend · **Status:** verified
**Summary:** `Post.coverImage` is fully wired end-to-end (DTO → service → resolver → Prisma `Bytes?`
column, base64 round-trip) but no real post-composer on either platform ever sets it — web's `share`,
mobile's `share`, and mobile's `posts/create` all only ever populate `imageUrl`.
**Evidence:** [`nest-js-boilerplate/src/post/post.resolver.ts#L89-94`](../nest-js-boilerplate/src/post/post.resolver.ts)
(`coverImage` `@ResolveField`). `next-js-boilerplate/src/views/share/PageContent.tsx`/`share-actions.ts`
and `flutter-boilerplate/lib/views/share/page_content.dart`/`views/posts/create_page_view.dart` all
only set `imageUrl` (via the upload endpoint's returned URL).
**Notes:** Same "provisioned but unused" shape as [BE-008](#be-008). No user-visible effect.
Documented in [backend/social-content/post/README.md](./backend/social-content/post/README.md),
[frontend/v1/posts/api.md](./frontend/v1/posts/api.md).

### MOB-011

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's feed `PostCard` never wires `onEditStart`/`onDeleteConfirm` when instantiating
`PostHeader` — a post author's edit icon renders permanently disabled, and the delete icon shows a
real, working confirmation dialog that silently does nothing when confirmed.
**Evidence:** [`flutter-boilerplate/lib/components/feed/post_card.dart#L34-41`](../flutter-boilerplate/lib/components/feed/post_card.dart)
omits `onEditStart`/`onDeleteConfirm`/`onRefresh` entirely (only `onViewPost`/`onToggleReaction` are
passed). [`post_header.dart`](../flutter-boilerplate/lib/components/feed/post_header.dart)'s
constructor defaults all three to `null`; its delete button shows a real `AlertDialog` and only calls
`onDeleteConfirm?.call()` after confirmation — a null-safe no-op. Contrast web's
[`PostCard.tsx`](../next-js-boilerplate/src/components/feed/PostCard.tsx), which wires both correctly.
**Notes:** Compounds with [MOB-008](#mob-008) — see that entry. Documented in
[mobile/v1/feed/screen.md](./mobile/v1/feed/screen.md),
[mobile/v1/feed/widgets/post-header.md](./mobile/v1/feed/widgets/post-header.md).

### CROSS-020

**Severity:** HIGH · **Area:** Backend + Mobile (latent on Frontend) · **Status:** verified
**Summary:** GraphQL `myNotifications` doesn't redact a `hideAvatar` actor's `avatarUrl` — live and
exploitable on Flutter, latent on web. `hideAvatar`-based avatar redaction is a deliberate, repeated
pattern in this codebase, independently implemented in five places — but `notification.resolver.ts`'s
`myNotifications` query is a sixth place exposing the same data with no such redaction.
**Evidence:** The 5 correct redaction sites: `post/post.resolver.ts:84`, `friends/friends.resolver.ts:75`,
`messaging/messaging-dm.service.ts:37-45`, `notification/notification.controller.ts:44-49` (REST
list), `notification/notification.service.ts:73-79` (the realtime `Item` push DTO — confirmed
correct, see [backend/messaging-realtime/notification/README.md](./backend/messaging-realtime/notification/README.md)).
`notification/notification.resolver.ts`'s `myNotifications` (`L15-32`) returns the raw Prisma `actor`
relation via `findByUser()`'s `include: {actor: true}`, through the auto-generated
`@generated/notification/notification.model.ts`'s plain `@Field(() => User) actor` — no
`@ResolveField` override anywhere (`grep -rn "hideAvatar"` across the backend, excluding
generated/spec files, confirms exactly those 5 correct sites and zero in this resolver). Both
platforms call this query exclusively for their notification lists. Mobile's query
(`flutter-boilerplate/lib/api/server/notifications/list.dart`) selects `actor { id name avatarUrl }`
and `NotificationItemWidget` renders it as a real image — live and exploitable. Web's query
(`MY_NOTIFICATIONS_QUERY` in `next-js-boilerplate/src/lib/graphql/queries.ts`) selects only
`actor {id name email}` (no `avatarUrl`) and renders a letter-initial circle — unaffected today only
because the field isn't fetched, not because the resolver is safe.
**Notes:** The realtime live-push path is correctly redacted — the gap is specific to the paginated
list query (initial load, pull-to-refresh, "load more"). Fix is a one-line addition of the same
redaction ternary already used 5 other places. Documented in
[backend/messaging-realtime/notification/README.md](./backend/messaging-realtime/notification/README.md#known-issues)
and [endpoints.md](./backend/messaging-realtime/notification/endpoints.md).

### CROSS-021

**Severity:** HIGH · **Area:** Backend + Mobile · **Status:** verified
**Summary:** Mobile push notifications (Firebase Cloud Messaging) are non-functional end-to-end —
three separate, uncoordinated code paths, all broken.
**Evidence:** (1) `flutter-boilerplate/lib/services/push_notification_service.dart`'s
`_registerToken()` (`L163-178`) POSTs an FCM device token to `POST /api/push-notifications/register`
— wired into real app startup (`app/app.dart:81-88`) — but `grep -rniE "firebase|\bfcm\b"` across the
entire `nest-js-boilerplate/src` returns **zero** matches, and `push-notification.module.ts` has no
`controllers` array at all, so no backend route can ever receive this call. (2) A second, entirely
separate and unused path — `lib/api/client/push_notifications/actions.dart`'s `PushActions` +
`lib/api/server/push_notifications/{subscribe,unsubscribe}.dart` — POSTs to
`/api/push/subscribe`/`/api/push/unsubscribe`, has zero callers anywhere, and would **also** hit a
nonexistent backend REST route even if invoked (the backend's only push-subscription surface is
GraphQL-only — see [push-notification/endpoints.md](./backend/messaging-realtime/push-notification/endpoints.md)).
(3) Even if a token were successfully stored, the backend's only send mechanism,
`PushNotificationService.sendToUser()`, exclusively calls the `web-push` library against
`PushSubscription` rows keyed by W3C Web Push fields (`endpoint`/`p256dh`/`auth`) — structurally
incompatible with an FCM device token, so no path could ever deliver to it regardless of registration.
**Notes:** Not "unbuilt" — there's a complete, real `PushNotificationService` class on mobile with FCM
setup, foreground/background handlers, and notification-tap navigation, genuinely wired into app
startup. It talks to a backend contract that was never built to match (the backend only ever
implemented Web Push). Fixing this is a real backend feature (an FCM-aware send path plus a
registration endpoint), not a small patch. Documented in
[push-notification/README.md § Known issues](./backend/messaging-realtime/push-notification/README.md#known-issues)
and [notification/README.md § Known issues](./backend/messaging-realtime/notification/README.md#known-issues).

### BE-016

**Severity:** HIGH · **Area:** Backend · **Status:** verified
**Summary:** The VIP chat room both web and mobile expose to Medium/Premium tiers has no backing
database row — sending the first message in it fails for every user who reaches it.
**Evidence:** Frontend (`MediumPageView.tsx`/`PremiumPageView.tsx`) and mobile
(`flutter-boilerplate/lib/constants/chat.dart`'s `ChatConstants.vipRooms`) both hardcode `vip-lounge`
as a real, joinable room. Backend's `isValidRoom()`
(`nest-js-boilerplate/src/messaging/messaging-room.service.ts#L42-48`) accepts it purely via prefix
match (`room.startsWith('vip-')`), no DB check — so joining and reading its (empty) history succeeds.
But `RoomMessage.roomId` is a real FK to `Room.slug` (`prisma/schema.prisma#L836-845,947-961`,
`onDelete: Restrict`), and neither `prisma/seed.ts` (`CHAT_ROOMS = ['general','random','tech','design','music']`,
no `vip-lounge`) nor `MessagingRoomService`'s own startup auto-seed (`seedRooms()`, same 5-room list)
ever creates that row. `saveRoomMessage()` goes straight from validity checks to
`prisma.roomMessage.create()` with no upsert-on-write — a `P2003` FK violation is mapped by the
global exception filter to a `409 EX_CONFLICT_FOREIGN_KEY`, not a clean "room not found."
**Notes:** Every Medium/Premium user hits this identically on any environment where nobody manually
inserted the row out-of-band. Fix is entirely backend (add `vip-lounge` to `seedRooms()`/`seed.ts`, or
a migration). Documented in [chat-room page.md § Known issues](./frontend/v1/chat-room/page.md#known-issues-affecting-this-page).

### BE-012

**Severity:** MED · **Area:** Backend · **Status:** verified
**Summary:** `NotificationController`'s entire REST surface (`GET /api/notifications`,
`GET /api/notifications/unread-count`, `POST /api/notifications/read`) has zero real callers on
either platform.
**Evidence:** Frontend's three BFF routes under `next-js-boilerplate/src/app/api/notifications/**/route.ts`
all call `graphqlFetch` against `notification.resolver.ts`'s operations — none constructs a request
to the backend's REST path (one frontend URL constant coincidentally shares the REST route's exact
path spelling, but it's the frontend's own same-origin BFF path, a different server). Mobile's four
`flutter-boilerplate/lib/api/server/notifications/*.dart` files are 100% `_dio.post('/graphql', ...)`.
The REST-shaped Dart constants (`ApiUrls.notifications`/`notificationsRead`/`notificationsUnreadCount`)
have zero references anywhere else in `flutter-boilerplate/lib`.
**Notes:** Not a security issue — the REST surface is guarded correctly and behaves identically to
the live GraphQL path — pure dead weight, a whole surface fully superseded and unused (unlike
[BE-003](#be-003), a response-shape asymmetry between two actively-used surfaces). Candidate for
deletion, or a product call either way. Documented in
[notification/README.md](./backend/messaging-realtime/notification/README.md#known-issues).

### CROSS-022

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** The in-app notification click target and the push-notification click target resolve to
different pages for the same notification kinds, on both platforms.
**Evidence:** Web: `next-js-boilerplate/src/lib/notifications/target.ts` (in-app) sends
`friend-request`/`friend-accepted` to `/v1/${lang}/find-friends/requests` and a `postId` payload to
`/v1/${lang}/posts/${postId}`. `next-js-boilerplate/public/sw.js`'s `notificationclick` handler
(`L54-64`) sends the same two kinds to `/v1/${lang}/find-friends` (no `/requests` suffix) and
`/v1/${lang}/feed#post-${postId}` (the feed with an anchor hash, a different page) — despite its own
comment claiming to "match the frontend's `notificationTarget` map." Mobile:
`free_page_view.dart`'s inline click logic (`L116-125`) matches web's in-app targets exactly.
`push_notification_service.dart`'s `navigateFromData()` (`L144-159`) — whose own comment says it
"mirrors the web service worker's notificationclick dispatch" — carries forward web's `sw.js` bug for
friend-request/accepted, but correctly matches for `postId` (unlike web's own push path). All four
destination routes are real and exist on both platforms, so this lands on the wrong but working page,
not a 404.
**Notes:** The comments in both `sw.js` and `push_notification_service.dart` claiming parity with the
in-app logic are themselves evidence this is drift, not intent. Documented in
[notification/page.md § Known issues](./frontend/v1/notification/page.md#known-issues-affecting-this-page) and
[mobile notification/screen.md](./mobile/v1/notification/screen.md#known-issues).

### BE-017

**Severity:** MED · **Area:** Backend · **Status:** verified
**Summary:** Attachment `url`s are resolved and re-linked to a saved message/room-message with no
check that the uploader is the sender, or that the upload was scoped to that conversation/room.
**Evidence:** `resolveAttachmentEnvelopes()` (`nest-js-boilerplate/src/messaging/attachment-envelopes.util.ts#L15-46`)
looks up `PendingUpload` purely by matching `attachments[].url` — no `uploadedBy`/`kind`/`scopeId`
check against the sender or target. Both `MessagingDmService.sendAndDeliverMessage` and
`MessagingRoomService.saveRoomMessage` then run an **unconditional**
`prisma.pendingUpload.updateMany({where:{url:{in:uploadUrls}}, ...})` — not "set only if unset."
Contrast the adjacent, deliberate `replyToId` cross-thread guard in the same DM service
(`messaging-dm.service.ts#L402-423`, explicit comment about a crafted `replyToId` pulling a
decrypted preview from an unrelated conversation) — no equivalent guard exists for `attachments[].url`.
**Notes:** Effect: any user who has legitimately seen an attachment's `url` (as sender, DM recipient,
or room member) can attach that same `url` to an unrelated new message they send, silently repointing
that `PendingUpload`'s access-control ownership away from the original message. Requires prior
legitimate view access plus deliberate action — not exploitable by a stranger with zero access.
Documented in [upload/README.md § Known issues](./backend/messaging-realtime/upload/README.md#known-issues).

### MOB-014

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** Mobile chat-room's `useNativeControls` flag — the one behavioral difference Medium/Premium's
tier subclass declares — is threaded through 6 files and read in none of them.
**Evidence:** `medium_page_view.dart#L18-24`/`premium_page_view.dart#L18-27` override
`bool get useNativeControls => true` (default `false` on `chat_room_base_view.dart#L47`). Passed down
through `chat_room_sidebar.dart`, `chat_room_main_content.dart`, and every sub-component in
`chat_room_sub_components.dart`. A full grep for any conditional read of the flag across
`lib/views/chat_room/*.dart` returns zero matches.
**Notes:** Medium/Premium's chat-room UI is pixel-for-pixel identical to Free/Basic's for this flag.
Documented in [chat-room screen.md § What renders here](./mobile/v1/chat-room/screen.md#what-renders-here).

### MOB-015

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** Mobile chat-room hardcodes several UI strings in English despite matching,
already-populated ARB localization keys existing and going unused.
**Evidence:** `lib/l10n/app_en.arb` lists ~20 `chatRoom*` keys (`chatRoomRooms`, `chatRoomOnline`,
`chatRoomNoOneHere`, `chatRoomNoMessages`, etc.) — none appear anywhere in `lib/views/chat_room/`.
Concretely: `chat_room_header.dart#L57` hardcodes `'Chat Rooms'` (while the page-info dialog a few
lines away correctly uses `t.chatRoomTitle` for the same concept); `chat_room_sidebar.dart` hardcodes
`'Rooms'`, `'Online (${count})'`, `'No one is here'`; `chat_room_message_list.dart#L54` hardcodes
`'No messages yet'` (web correctly uses `t.noMessages` here). `chat_room_message_list.dart#L41`'s
`'Failed to load messages'` is also hardcoded on web — a shared, cross-platform gap called out
separately to avoid over-claiming it as mobile-exclusive.
**Notes:** Same "Forms gallery audit" pattern (translated key never wired) already logged for this
repo, now recurring in chat-room. Documented in
[chat-room screen.md](./mobile/v1/chat-room/screen.md#confirmed-gaps-vs-web-found-while-documenting-this-screen).

### CROSS-027

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's shared `AttachmentPreview` widget never surfaces server-generated thumbnails —
every attachment preview fetches the full original file instead, in both messages and chat-room.
**Evidence:** `flutter-boilerplate/lib/components/ui/attachment_preview/attachment_preview.dart`'s
constructor only accepts `url`/`type`/`name`, no `thumbnailUrl` — its two call sites
(`chat_room_message_list.dart#L137-145`, `messages/chat_message_bubble.dart#L98-103`) correspondingly
never pass one. This is a UI-layer-only gap, not a data-pipeline one: `MessageAttachment.fromJson` and
`RoomMessage.fromJson` both correctly parse and thread `thumbnailUrl` through — the field is
generated, stored, served, and parsed correctly end-to-end; only the final widget drops it. Contrast
web's `AttachmentPreview.tsx#L77,97-99`, which genuinely renders the thumbnail when present.
**Notes:** Real UX/bandwidth impact — mobile fetches full (≤10MB) originals for what should be small
320×320 webp thumbnails. Documented in
[upload/README.md § Thumbnail generation](./backend/messaging-realtime/upload/README.md#thumbnail-generation)
and both chat-room message-list docs.

### CROSS-028

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** Mobile has no attachment-gallery ("all uploads") feature anywhere — confirmed absent in
both messages and chat-room, resolving Phase 0's own "unconfirmed" flag on this question.
**Evidence:** `grep -rli "attachmentgallery\|all.?uploads\|allUploads" flutter-boilerplate/lib` returns
zero matches. Web has this feature in both verticals:
[`AttachmentGallerySheet.tsx`](./frontend/v1/messages/components/attachment-gallery-sheet.md) (messages)
and `RoomAttachmentGallerySheet.tsx` (chat-room).
**Notes:** Phase 0's own `mobile/v1/messages/screen.md` had flagged this as "unconfirmed... verify
during Phase 3 (upload module)" — now confirmed and closed. Documented in
[chat-room screen.md](./mobile/v1/chat-room/screen.md#confirmed-gaps-vs-web-found-while-documenting-this-screen)
and the now-resolved note in
[mobile/v1/messages/screen.md](./mobile/v1/messages/screen.md#confirmed-parity-gaps-vs-web-found-while-documenting-this-screen).

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
(`subscribePush`/`unsubscribePush`); mobile calls neither (see [CROSS-021](#cross-021)).
**Notes:** Users can subscribe/unsubscribe but have no UI anywhere to see or manage a list of their
own registered push subscriptions/devices. Documented in
[push-notification/endpoints.md](./backend/messaging-realtime/push-notification/endpoints.md#known-issues).

### BE-013

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `messaging.controller.ts` and `messaging-ws.gateway.ts` each inject
`PushNotificationService` and never call it.
**Evidence:** Both files' constructors declare `private readonly push: PushNotificationService`, but
`grep -n "this\.push\b"` in either file's body returns zero matches beyond the declaration itself. The
real DM-push call site, `messaging-dm.service.ts:645-661`, has its **own**, separately-constructed
`push` field — `MessagingService`'s constructor manually passes its one DI'd instance only into
`MessagingDmService`, not into `MessagingRoomService` (rooms never push at all) and not consumed by
the controller/gateway's own separately-injected copies.
**Notes:** Because `private readonly` constructor parameters double as class field declarations,
TypeScript's unused-variable checks don't flag this — a silent, compiler-invisible dead injection.
Harmless, but reads as if these two files participate in push delivery when they don't. Documented in
[notification/README.md](./backend/messaging-realtime/notification/README.md).

### MOB-012

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** `flutter-boilerplate/lib/api/server/notifications/dm_unread_count.dart` sends the same
GraphQL query as the in-app notification-unread-count file, not a DM-specific one — currently
unreachable, so no visible symptom, but a real bug.
**Evidence:** Its query string is byte-for-byte identical to `unread_count.dart`'s — there is no
GraphQL query for a DM-specific unread count anywhere in the schema (only the REST
`GET /api/messages/unread-count`). Its provider, `dmUnreadNotificationsProvider`, is only ever
`.invalidate()`d by `realtime_provider.dart` — nothing ever `.watch()`/`.read()`s its value. The real,
correct DM-unread badge (`views/v1/v1_header.dart:35`) watches a different provider,
`dmUnreadCountProvider`, which correctly hits the REST endpoint.
**Notes:** A near-duplicate of the file that already exists and works correctly in the `messages`
vertical, just misplaced and miswired in `notifications/`. Harmless today purely because nothing
reads its output. Documented in [notification/README.md](./backend/messaging-realtime/notification/README.md).

### MOB-013

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** The mobile notifications API layer has the same "scaffolded-then-inlined, original left
behind" dead-code pattern as [FE-007](#fe-007)/[CROSS-013](#cross-013), twice over, with one dead
method also containing an invalid GraphQL query.
**Evidence:** `lib/api/client/notifications/mark_read.dart`'s `markReadNotificationsProvider` has zero
callers — superseded by `notificationActionsProvider` in `actions.dart`. Separately,
`lib/api/server/notifications/read.dart`'s `NotificationReadServer.markRead()` (`L19-34`) is never
called by anything (the live single-item mark-read path is the separate `mark_read.dart` file
instead) — and if it ever were called, its mutation string requests a `{ id read }` sub-selection on
`markNotificationRead`, which the backend schema types as a bare `Boolean!` scalar, an invalid
GraphQL document.
**Notes:** Both dead pieces are currently harmless since nothing reaches them. Worth remembering if
anyone "cleans up" by wiring the dead `.markRead()` into use instead — that would introduce a real,
immediate runtime failure. Documented in [notification/README.md](./backend/messaging-realtime/notification/README.md).

### CROSS-023

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Web's notification page automatically marks every notification read on first load;
mobile has no equivalent, requiring an explicit tap.
**Evidence:** `NotificationPageContent.tsx:45-52` — a `markedRef` guard fires `markAllRead()`
unconditionally the first time `notifications.length > 0` after mount, no gating on scroll/visibility.
`free_page_view.dart` (`FreeNotificationPage`, a stateless `ConsumerWidget`) has no equivalent effect
anywhere in its `build()` — only the explicit "Mark all read" button and per-item mark-on-tap.
**Notes:** Not obviously a bug on either side — reasonable UX choices exist on both ends — filed as a
parity/behavior-difference finding per this effort's convention, for the team to decide whether to
reconcile. Documented in [notification/page.md](./frontend/v1/notification/page.md#known-issues-affecting-this-page).

### FE-011

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** A second, dead implementation of mark-read (`useMarkNotificationRead`) sits unused
alongside the real one the notification page calls.
**Evidence:** `src/api/client/notifications/mark-read.ts` exports `useMarkNotificationRead()` — a
complete duplicate of `useNotificationActions()`'s `markRead`/`markAllRead`. Re-exported from the
barrel `src/api/index.ts`, but `grep -rln "useMarkNotificationRead"` finds no consumer beyond that
barrel and its own definition — both `NotificationPageContent.tsx` and `NotificationDropdown.tsx`
import `useNotificationActions` instead.
**Notes:** Same pattern as [FE-007](#fe-007)/[CROSS-013](#cross-013) — now recurred at least four
times across this effort (those two, [MOB-013](#mob-013)'s two mobile files, and this one), suggesting
a recurring habit in how features get built in this codebase, not a one-off. Documented in
[notification/page.md](./frontend/v1/notification/page.md).

### CROSS-024

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Chat-room has no reply-to-message and no delete-message capability at all, on any
surface — structurally absent, not a per-platform gap.
**Evidence:** `RoomMessage`/`RoomMessageAttachment` (`prisma/schema.prisma#L947-976`) have no
reply-target or soft-delete (`deletedAt`) columns at all, unlike `Message`. `saveRoomMessage()` takes
no `replyToId` parameter. A repo-wide `grep -rn "deleteRoomMessage\|delete-room"` returns zero
matches — no delete-room-message endpoint exists on REST, GraphQL, or WS. Both platforms' chat-room
UI sends no `replyToId` and renders no delete/reply affordance.
**Notes:** Distinct from [CROSS-006](#cross-006) (DM reply-to present backend-side, missing only on
Flutter) — this is a structural absence across the entire stack, so not a cross-platform parity bug
in the usual sense, but a real feature gap relative to 1:1 messaging. Documented in
[chat-room page.md](./frontend/v1/chat-room/page.md#known-issues-affecting-this-page) and
[chat-room screen.md (mobile)](./mobile/v1/chat-room/screen.md#confirmed-gaps-vs-web-found-while-documenting-this-screen).

### FE-012

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** Web's buffered multipart upload BFF route (`POST /api/upload/attachment`) never forwards
the `x-scope-kind`/`x-scope-id` headers to the backend; its streamed sibling route does. Currently
dead code.
**Evidence:** `app/api/upload/attachment/route.ts` calls `backendFormFetch(...)` with no `headers`
passed at all. Contrast `app/api/upload/attachment-stream/route.ts#L37-66`, which explicitly forwards
both scope headers when present — `backendFormFetch` fully supports a headers passthrough, so this is
an omission, not an API limitation. Confirmed unreachable: `useMessageUpload()`, shared by both
`messages` and `chat-room` composers, always calls `uploadAttachmentStreamServer`, never the buffered
wrapper.
**Notes:** Low severity because dead today. Documented in
[upload/README.md](./backend/messaging-realtime/upload/README.md#known-issues) and
[upload/endpoints.md § Upload a chat attachment](./backend/messaging-realtime/upload/endpoints.md#upload-a-chat-attachment).

### CROSS-025

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** Mobile chat-room never calls `GET /api/rooms`; it hardcodes its room list, unlike web.
**Evidence:** `chat_room_base_view.dart` builds its room list from a compile-time Dart constant
(`lib/constants/chat.dart`). No `rooms.dart` file exists in `lib/api/server/messages/`. Web's
equivalent (`ChatRoomBaseView.tsx`) calls a real `useQuery(roomsQueryOptions())` → `GET /api/rooms`.
**Notes:** Currently matches the backend's real room list; same drift-risk shape as
[CROSS-008](#cross-008). Documented in
[chat-room screen.md](./mobile/v1/chat-room/screen.md#confirmed-gaps-vs-web-found-while-documenting-this-screen).

### MOB-016

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's `ChatRoomBaseView` is dual-purposed — also serving as a second, independent 1:1
DM implementation for a legacy route with no reachable caller anywhere in the app.
**Evidence:** `chat_room_base_view.dart#L51-60`'s own doc comment states it's reused, unmodified, for
`/v1/:lang/chat/:conversationId` (`router.dart#L483-490`, name `v1ChatRoomLegacy`), where `_room` is a
DM peer id. `grep -rn "v1ChatRoomLegacy"` outside `router.dart`, and a repo-wide grep for the legacy
path, both return nothing. Push-notification deep-linking routes DMs via `/v1/$lang/messages?user=`
only (its own comment notes a `conversationId`-keyed payload "never matched anything real" and was
removed). The one live in-app deep link that reaches chat-room always targets the real `v1ChatRoom`
route (`?conversation=`), never the legacy path-param one.
**Notes:** Same "registered but unreachable" shape as [MOB-001](#mob-001)/[MOB-004](#mob-004). If ever
reactivated, this branch has none of the real DM screen's reply/delete/multi-attachment capability.
Documented in [chat-room screen.md § Two routes, one widget, one real branch](./mobile/v1/chat-room/screen.md#two-routes-one-widget-one-real-branch).

### CROSS-026

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Web's and mobile's own chat-room deep-link query param names don't match each other
(`?room=` vs `?conversation=`).
**Evidence:** Web (`MessagesSidebarRooms.tsx`) builds `/v1/{lang}/chat-room?room={slug}`;
`chat-room/page.tsx` reads `sp.room`. Mobile's router reads `state.uri.queryParameters['conversation']`,
matching its one real caller, `header_message_banner.dart`.
**Notes:** Each platform is internally self-consistent; nothing is currently broken since no
shared/universal deep-link scheme exists between them today. Documented in
[chat-room page.md](./frontend/v1/chat-room/page.md#known-issues-affecting-this-page).

### MOB-017

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's attachment upload call has no `scope` parameter anywhere in its chain — every
mobile attachment upload (messages and chat-room alike) lands in the backend's default DM storage
folder, never the room-scoped one.
**Evidence:** `UploadAttachmentServer.call(filePath, fileName)` takes exactly two arguments and posts
to `/upload/attachment` with only the file in the form body — no `x-scope-kind`/`x-scope-id` headers.
`MessageActions.uploadAttachment(filePath, fileName)`, the sole caller from both `chat_room_base_view.dart`
and `messages/chat_input_bar.dart`, has the identical two-argument signature. Contrast web's
`startUploads(files, {kind: "chat-room", id: room})` → `uploadAttachmentStreamServer(file, scope, ...)`,
which forwards scope correctly end to end.
**Notes:** No functional break — access and quota checks both ignore `kind`/`scopeId` — purely an
object-storage foldering/traceability defect; a future feature relying on per-scope prefixes would
silently miss every mobile-uploaded room attachment. Documented in
[chat-room/api.md](./mobile/v1/chat-room/api.md#-attachment-upload-never-sends-an-upload-scope).

### CROSS-030

**Severity:** HIGH · **Area:** Frontend + Backend · **Status:** verified
**Summary:** Every paid↔paid tier change (upgrade or downgrade between two non-FREE tiers) attempted
from the web checkout page fails with a misleading "payment method required" error before ever
reaching the backend. Confirmed working correctly on mobile via the identical backend mutation.
**Evidence:** `next-js-boilerplate/src/views/checkout/DowngradeSection.tsx`'s `handleDowngrade` calls
`subscribe(targetTier)` — a single argument, no `paymentMethodId`, no `currentTier`.
`next-js-boilerplate/src/app/api/billing/subscribe/route.ts` (~L90-102):
```ts
const isUpgrade = ["BASIC", "MEDIUM", "PREMIUM"].includes(body.tier);
const isReSelection = body.tier === body.currentTier;
if (isUpgrade && !isReSelection && !body.paymentMethodId) {
  return 400 "Payment method required for upgrades";
}
```
`isUpgrade` is true for any paid target, not just true upgrades from FREE; `isReSelection` can never
be true here since `currentTier` is never sent by this call site — confirmed via a repo-wide grep,
the only call site anywhere that ever populates `currentTier` is a different, Phase-4b-owned button
(`PlanDetails.tsx`'s `handleCancelPendingChange`, which always sets it equal to the target tier).
Backend's `billing.service.ts`'s `handleTierChange` is fully correct and tested — the bug is 100% in
the Next.js BFF route file. Mobile's `flutter-boilerplate/lib/api/server/billing/stripe.dart` posts
directly to `/graphql` with no intermediate validation layer, so the identical action works correctly
there.
**Notes:** Only FREE→paid (via `StripeCardForm`, which does supply a card) and paid→FREE (target is
FREE, so the check is skipped) work through this page today. Documented in
[billing/endpoints.md](./backend/billing-usage/billing/endpoints.md#known-issues) and
[frontend/v1/checkout/page.md](./frontend/v1/checkout/page.md#known-issues-affecting-this-page).

### BE-020

**Severity:** MED · **Area:** Backend · **Status:** verified
**Summary:** A brand-new subscription's first billing-history ledger row can permanently show $0.00
with no invoice link if the `invoice.paid` webhook is delayed or never arrives.
**Evidence:** `billing.service.ts`'s `persistUpgrade` writes the first `WalletTransaction` row with
`amount: 0` synchronously, inside the `subscribeToPlan` mutation itself, before any webhook exists.
`stripe-webhook.controller.ts`'s `handleInvoicePaid`/`upsertInvoiceTransaction` reconciles into the
**same** row (shared idempotency key `` `stripe_invoice:${invoiceId}` ``) with the real
`amountPaid`/`stripeInvoiceUrl` — but only once that webhook actually lands. `myBillingHistory` reads
these rows directly with no other correction mechanism.
**Notes:** One concrete trigger is [BE-018](#be-018)'s throttling gap, but the finding stands
independent of cause (endpoint downtime, misconfigured signing secret, network partition all have the
same effect). Documented in
[billing/stripe.md](./backend/billing-usage/billing/stripe.md#known-issues).

### BE-018

**Severity:** MED · **Area:** Backend · **Status:** verified
**Summary:** The Stripe webhook endpoint has no throttle exemption and shares the app's global default
rate limit.
**Evidence:** `stripe-webhook.controller.ts` has no `@SkipThrottle()` on the class or the
`handleWebhook` method — `@SkipThrottle()` is a real, used pattern elsewhere in this codebase
(`throttle/throttle.controller.ts`). The global default (`ThrottlerModule.forRootAsync`, IP-tracked,
installed globally via `APP_GUARD`) therefore applies.
**Notes:** A burst of Stripe deliveries (retry storms, a dashboard "resend events" bulk action) could
get `429`'d; since `429` isn't `2xx`, Stripe treats it as a failed delivery and keeps retrying, and
enough consecutive failures risks Stripe auto-disabling the endpoint. Documented in
[billing/stripe.md](./backend/billing-usage/billing/stripe.md#known-issues).

### BE-022

**Severity:** MED · **Area:** Backend · **Status:** verified
**Summary:** Upload-storage quota is displayed on both platforms but never enforced server-side.
**Evidence:** `UsageService.assertCanUploadBytes()` (`nest-js-boilerplate/src/usage/usage.service.ts#L76-98`)
is fully implemented (throws `403 EX_UPLOAD_STORAGE_LIMIT_REACHED`) but a full-repo grep for
`assertCanUploadBytes` returns only its own definition. The upload module
(`upload.controller.ts`/`s3-bucket.service.ts`/`image.service.ts`/`attachment-thumbnail.service.ts`)
never imports `UsageService` at all. Contrast `assertCanSendMessage`, which **is** wired into
`messaging-dm.service.ts`/`messaging-room.service.ts`. Both platforms' `UploadStorageCard` render a
real "limit reached, upgrade" warning once `bytes >= limitBytes`, with nothing behind it.
**Notes:** Business-logic/monetization gap (unlimited free attachment storage), not a security leak.
Documented in
[usage/README.md § Enforcement](./backend/billing-usage/usage/README.md#enforcement-one-real-guard-one-dead-one)
and [endpoints.md](./backend/billing-usage/usage/endpoints.md).

### CROSS-033

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Mobile has no client-side equivalent of web's `StorageLimitNotice`; the real,
server-enforced message-storage cap is only discoverable on mobile via a raw failed send.
**Evidence:** `assertCanSendMessage` enforcement is real and identical cross-platform. Mobile's
`messageUsageProvider`/`storageUsageProvider` (`lib/api/client/usage/query.dart`) have exactly two
callers app-wide — `message_storage_card.dart` and `upload_storage_card.dart` — confirmed via grep;
nothing in `lib/views/messages/` reads them.
**Notes:** Resolves the open question Phase 0 explicitly left in
[frontend/v1/messages/components/storage-limit-notice.md](./frontend/v1/messages/components/storage-limit-notice.md)
("worth a look during Phase 4"). Documented there and in
[usage/README.md](./backend/billing-usage/usage/README.md).

### FE-013

**Severity:** LOW–MED · **Area:** Frontend · **Status:** verified
**Summary:** Web's Plans page shows self-referential feature bullets on the MEDIUM and PREMIUM cards
("Everything in Medium" shown *on* the Medium card; "Everything in Premium" shown *on* the Premium
card).
**Evidence:** `next-js-boilerplate/src/views/plans/PageContent.tsx`'s `FEATURES` map: `{FREE:
t.featuresBasic, BASIC: t.featuresMedium, MEDIUM: t.featuresPremium, PREMIUM: t.featuresPro}`.
`messages/en/pricing/messages.json`'s `featuresPremium` literally starts with "Everything in Medium"
and is mapped to the **MEDIUM** card; `featuresPro` starts with "Everything in Premium" and maps to
**PREMIUM**. `featuresPro` is itself a naming leftover — no "Pro" tier exists in the current
`FREE`/`BASIC`/`MEDIUM`/`PREMIUM` enum. The `tr` bundle has the identical structural pattern,
confirming this is baked into the translation source, not a one-off.
**Notes:** Likely caused by a missing `featuresFree` key (only 4 keys exist for a scheme that reads as
"the next tier's" preview copy) combined with the map not being adjusted after a tier-naming change.
Cosmetic, not functional. Documented in [frontend/v1/plans/page.md](./frontend/v1/plans/page.md).

### BE-019

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** No code distinguishes a Stripe `authentication_required` (3DS/SCA) decline on the actual
subscription charge from any other failure, and neither client offers a recovery path for it.
**Evidence:** `stripe-payment.provider.ts`'s `createSubscription` catch block only pattern-matches
`"insufficient funds"` and `"card_declined"` substrings; anything else (including
`authentication_required`) falls through to a generic `subscription_failed` reason.
`stripe/stripe.service.ts`'s `createSubscription` passes `off_session: true` (a deliberate pattern —
verify via SetupIntent first, charge off-session after — but one that doesn't *guarantee* the
off-session charge itself never needs authentication). Neither `StripeCardForm.tsx` (web) nor
`page_content.dart`'s `_handleSubscribe` (mobile) has any UI branch for "please complete verification
with your bank."
**Notes:** Plausible, not confirmed-live (no reproduction, no incident evidence) — same evidentiary
bar as [BE-004](#be-004). Documented in
[billing/stripe.md](./backend/billing-usage/billing/stripe.md#known-issues).

### BE-021

**Severity:** INFO · **Area:** Backend · **Status:** verified
**Summary:** `Wallet`/`WalletTransaction`'s balance and peer-transfer schema surface is fully modeled
but entirely unused — billing only ever uses it as a single-currency, single-direction bookkeeping
anchor.
**Evidence:** `Wallet` has a real `balance` field (`Decimal`, default 0); `WalletTransaction` has both
`fromWalletId`/`toWalletId` FKs and a 6-value `WalletTxnType` enum (`DEPOSIT`/`WITHDRAWAL`/`TRANSFER`/
`REFUND`/`FEE`/`ADJUSTMENT`). A repo-wide grep for `.balance` and `toWalletId` returns zero real hits
beyond one defensive `OR` clause in `getBillingHistory` that no write path ever populates. Only
`FEE`/`ADJUSTMENT` are ever written, only by `billing.service.ts`/`stripe-webhook.controller.ts`/
`wallet.service.ts` — the only three real files referencing either model anywhere in `src` (confirmed
`usage/` never touches it either).
**Notes:** Same pattern as [BE-008](#be-008) (unused `MfaFactor` WebAuthn columns) and
[CROSS-002](#cross-002) (`Organization`/`Team`/`Project` with no API surface) — a recurring habit of
provisioning broader schema than what's built. `wallet.service.ts` itself is a single 43-line file,
one method (`ensureWallet`), whose entire job is to lazily create-or-fetch a one-per-user `Wallet` row
so `WalletTransaction` writes elsewhere have a `fromWalletId` to point at. Documented in
[billing/README.md](./backend/billing-usage/billing/README.md).

### FE-014

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** The `subscribe` BFF route unconditionally publishes a Kafka event literally named
`billing.subscription.upgraded` for every successful `subscribeToPlan` outcome, including
cancellations and downgrades — but has zero current consumers.
**Evidence:** `app/api/billing/subscribe/route.ts` calls `publishEvent("billing.subscription.upgraded",
{...tier: body.tier...})` unconditionally after any `result?.success` response, with no branch for
cancel/downgrade/pending-change-cancel outcomes. A repo-wide grep for the topic name finds only the
one publishing file — no consumer exists anywhere.
**Notes:** No observed impact today (nothing reads the topic), but would mislead any future consumer
(e.g. a "Welcome to Premium" email trigger firing on a downgrade). Documented in
[frontend/v1/checkout/api.md](./frontend/v1/checkout/api.md).

### MOB-018

**Severity:** INFO · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's `PlanSummaryCard` widget has a fully-built `features` list-rendering branch that
its one call site never populates.
**Evidence:** `views/checkout/plan_summary_card.dart` correctly renders a bulleted list when
`features.isNotEmpty`. Its one call site (`page_content.dart`) constructs it as
`PlanSummaryCard(tierLabel: ..., price: ..., alreadySubscribed: ...)` — `features` always defaults to
`const []`.
**Notes:** Purely cosmetic vs. web's equivalent card, which does show features (sourced from
CROSS-031's hardcoded copy). Documented in
[mobile/v1/checkout/widgets/plan-summary-card.md](./mobile/v1/checkout/widgets/plan-summary-card.md).

### MOB-019

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** `views/checkout/stripe_card_form.dart` is a one-line re-export shim with zero importers
anywhere in the app.
**Evidence:** Its entire content: `export '../../components/ui/stripe_card_form.dart' show
StripeCardFormField;`. A grep for either path returns zero matches outside the file itself — the real
checkout page imports `components/ui/stripe_card_form.dart` directly, bypassing this file entirely.
**Notes:** Not broken (nothing depends on it), same "left-behind scaffolding" pattern as
[CROSS-013](#cross-013)/[FE-007](#fe-007). Documented in
[mobile/v1/checkout/widgets/stripe-elements.md](./mobile/v1/checkout/widgets/stripe-elements.md).

### CROSS-032

**Severity:** MED · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Mobile never handles the `tier-changed` WebSocket frame the backend pushes on every live
tier change; web does.
**Evidence:** `realtime.gateway.ts`'s `updateUserTier` sends `{type: 'tier-changed', tier}` to every
live socket for a user. Web: `lib/realtime/event-dispatch.ts` has `case "tier-changed"`, dispatched as
a `CustomEvent` that `useAuth.tsx` listens for and applies live. Mobile: a repo-wide grep for
`'tier-changed'` returns zero matches — listing every case in `realtime_provider.dart`'s frame-type
switch (~25 handled types) confirms it isn't among them.
**Notes:** Backend enforcement is unaffected (`SessionAuthGuard` re-derives the rbac token from the
real Redis-stored tier, not client state) — a live-UI-staleness gap, not a security issue. Documented
in [billing/README.md](./backend/billing-usage/billing/README.md#known-issues).

### MOB-020

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's `payment_methods.dart` (`PaymentMethods` widget class) is dead code — the fifth
recurrence of this effort's "scaffolded then inlined, original left behind" pattern in the settings
vertical alone.
**Evidence:** The router only wires `page_view.dart`'s `SettingsBillingPageContent`, whose
`_PaymentMethodsSection` reimplements the same list/remove/set-default UI inline. A grep for
`PaymentMethods(` outside `payment_methods.dart` itself returns nothing.
**Notes:** Extends the existing [CROSS-013](#cross-013)/[MOB-006](#mob-006) tally to five occurrences
of the same pattern. Documented in
[mobile/v1/settings/billing/screen.md](./mobile/v1/settings/billing/screen.md#known-issues).

### MOB-021

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** Mobile's invoice-history badge always renders "warning" (never "success") and shows a raw
unlocalized string.
**Evidence:** `page_view.dart`'s `_InvoiceHistorySection` checks `inv.status == 'paid'`, but every
real row's `status` is the literal `'COMPLETED'` — hardcoded in both `billing.service.ts`
(`persistUpgrade`/`applyLocalTierChange`) and `stripe-webhook.controller.ts`
(`upsertInvoiceTransaction`). The comparison is always false. Web's `StatusBadge.tsx` correctly checks
`=== "COMPLETED"`.
**Notes:** Cosmetic, no functional break. Documented in
[mobile/v1/settings/billing/screen.md](./mobile/v1/settings/billing/screen.md).

### FE-015

**Severity:** LOW · **Area:** Frontend · **Status:** verified
**Summary:** Web's billing-address "Cancel" button visibly reads "Cancel subscription."
**Evidence:** `BillingAddressForm.tsx`: `{t.cancelSubscription || "Cancel"}` — `t.cancelSubscription`
is always defined (`messages/en/settings/messages.json`: `"Cancel subscription"`), so the fallback
never triggers.
**Notes:** Same wrong-i18n-key-reuse pattern as this repo's "Forms gallery audit" findings. Documented
in [frontend/v1/settings/billing/components/billing-address.md](./frontend/v1/settings/billing/components/billing-address.md).

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

### MOB-022

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** 7 of 8 files in mobile's `premium/` vertical are dead code — the largest instance (by
file count) of this effort's recurring dead-parallel-implementation pattern, though functionally a
wash.
**Evidence:** The router wires only `page_view.dart`, whose `PremiumPageContent` implements all four
tiers itself via private inline classes. `free_page_view.dart`/`basic_page_view.dart`/
`medium_page_view.dart`/`premium_page_view.dart` (plus `premium_handlers.dart`,
`growth_stats_section.dart`, `stats_section.dart` — 7 files total) form a second, complete,
independently-built implementation of the identical four views that nothing ever reaches. Confirmed
via grep of every public symbol they export — all matches are internal to the dead cluster.
**Notes:** Unlike [MOB-008](#mob-008), live and dead versions are functionally equivalent — no
capability gap, just a large silently-duplicated maintenance liability. The live code has its own
separate real bug, [MOB-023](#mob-023). Documented in
[mobile/v1/premium/screen.md](./mobile/v1/premium/screen.md).

### MOB-024

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** A VAT number entered on mobile is saved correctly but never displayed back once the
address form closes.
**Evidence:** `BillingInfoDisplay` (`billing_info_display.dart`) has no `vatNumber` field/parameter at
all, unlike both the backend `BillingAddress` model and `BillingAddressForm` (which does collect and
submit one via `_vatCtrl`). The call site correspondingly never passes it through.
**Notes:** Found via a direct field-by-field comparison against the backend model. Documented in
[mobile/v1/settings/billing/widgets/billing-info-display.md](./mobile/v1/settings/billing/widgets/billing-info-display.md).

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

### CROSS-036

**Severity:** INFO · **Area:** Docs (self-correction) · **Status:** verified
**Summary:** `backend/README.md`'s "Scope of this documentation" section stated four directories are
demo-gated but ship one live file (gRPC's hybrid transport, the query-complexity plugin, the
rate-limit guard, the perf interceptor). Verifying each against source this phase found a fifth,
previously-unnamed instance: `exception-filters/`, whose `GlobalHttpExceptionFilter` is the app's
only `@Catch()`-all REST exception filter, registered unconditionally as `AppModule`'s `APP_FILTER`,
while `ExceptionFiltersModule` itself is `DEMO_MODULES`-gated.
**Evidence:** [`nest-js-boilerplate/src/app.module.ts`](../nest-js-boilerplate/src/app.module.ts) and
[`nest-js-boilerplate/src/exception-filters/global-http-exception.filter.ts`](../nest-js-boilerplate/src/exception-filters/global-http-exception.filter.ts).
**Notes:** `backend/README.md` corrected in the same Phase 5 change (now says "five," all five
named). Full account in
[backend/_reference/demo-gated-but-live.md](./backend/_reference/demo-gated-but-live.md).

### CROSS-037

**Severity:** INFO · **Area:** Backend + Docs · **Status:** verified
**Summary:** `logging/logging.module.ts` and `logging/request-context.ts` both carry doc comments
pointing at `docs/backend/research/logger.md` for design rationale. That file doesn't exist in the
current repo — deleted as part of this effort's own Phase 0 rewrite commit, same as
ADR-006/AUTH.md/REALTIME.md ([CROSS-004](#cross-004)/[CROSS-005](#cross-005)), but lower-stakes
since it's a code-comment dangling pointer, not a surviving doc actively misleading a reader.
**Evidence:** `grep -rn "docs/backend/research/logger"` → 2 hits; `ls docs/backend/research/` → no
such directory; `git log --all -- docs/backend/research/logger.md` shows no intermediate history.
**Notes:** Documented in
[backend/platform-core/logging/README.md](./backend/platform-core/logging/README.md).

### BE-024

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `DataloaderService.getPostLoader()` is fully implemented, identical shape to
`getUserLoader()`, but has zero callers anywhere in `src/`. `getUserLoader()` is genuinely used by
`post/post.resolver.ts` to batch-resolve `Post.author`.
**Evidence:** `grep -rn "getPostLoader"` → only its own definition.
**Notes:** Same "half-wired pair" shape as many prior findings in this effort. Documented in
[backend/platform-core/common/dataloader/README.md](./backend/platform-core/common/dataloader/README.md).

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

### MOB-025

**Severity:** HIGH · **Area:** Mobile · **Status:** verified
**Summary:** `AdminSearchUsersServer.call()` issues `GET '${Urls.adminAuditLogs}/users'` — i.e. `GET
/api/admin/audit-logs/users` — directly against the backend. No such route exists anywhere: the
backend's `authorization` module is GraphQL-only, and the Next.js BFF only defines `GET
/api/admin/audit-logs` and `POST /api/admin/set-tier` — no `/users` sub-route. Every search of 2+
characters throws an uncaught `DioException`, surfacing as a visible error message on the very first
keystroke past the debounce.
**Evidence:** [`flutter-boilerplate/lib/api/server/admin/search_users.dart`](../flutter-boilerplate/lib/api/server/admin/search_users.dart)
vs. `flutter-boilerplate/lib/constants/api/urls.dart` (`adminAuditLogs = '/api/admin/audit-logs'`)
vs. the complete absence of any `admin`-scoped REST controller in `nest-js-boilerplate/src` or
`next-js-boilerplate/src/app/api/admin/` (only `audit-logs/route.ts` and `set-tier/route.ts` exist
there).
**Notes:** The same folder's `audit_logs.dart` file documents *fixing* an identical bug in its own
header comment — `search_users.dart` looks like that bug's still-broken twin, never given the same
fix. The tier-set action itself works correctly once a `userId` is known by some other means; only
the discovery/search step is broken. Documented in
[mobile/v1/admin/screen.md](./mobile/v1/admin/screen.md).

### CROSS-038

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** Neither platform's About page has any in-app nav link pointing at it. Web's
`(marketing)` header nav has exactly one link ("Pricing"); mobile's nav has no "about" reference at
all. Both pages work correctly and aren't gated behind auth — they're simply unreachable by clicking
around the app on either platform.
**Evidence:** `next-js-boilerplate/src/app/(marketing)/layout.tsx`,
`next-js-boilerplate/src/views/v1/[lang]/V1Nav.tsx` vs.
`flutter-boilerplate/lib/views/v1/v1_nav.dart`.
**Notes:** Not gated/broken, purely a discoverability gap — a direct URL, deep link, sitemap crawl,
or search-engine result is the only way to reach it on either platform. Documented in
[frontend/about/page.md](./frontend/about/page.md) and [mobile/about/screen.md](./mobile/about/screen.md).

### MOB-026

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** `message_dropdown.dart` (`MessageDropdown`), `profile_dropdown.dart`
(`ProfileDropdown`), and `badge.dart` (`BadgeWidget`) are never instantiated anywhere —
`V1Header` reimplements all three concerns entirely inline instead (a private profile-avatar popup
menu, hand-written badge circles), with no auto-pop-on-arrival behavior like web's
`MessageDropdown`. A fourth file, `page_nav_wrapper.dart` (`PageNavWrapper`), is also never
instantiated, and even if it were wired up would not be a real port of web's same-named component:
web's version provides an in-flight-navigation progress overlay; mobile's is an unrelated page-key
transition wrapper.
**Evidence:** `grep -rn "MessageDropdown(\|ProfileDropdown(\|BadgeWidget(\|PageNavWrapper("
flutter-boilerplate/lib` — each matches only its own definition file.
**Notes:** Same "scaffolded, then reimplemented inline, original left behind" pattern already on
record for api-keys/security/account/general
([CROSS-013](#cross-013)/[FE-007](#fe-007)/[MOB-006](#mob-006)) — a fourth, previously-unrecorded
instance, and the largest single occurrence (4 files at once). `ProfileSection` in the same folder,
by contrast, is genuinely imported by `V1Sidebar`. Documented in
[mobile/app-shell.md](./mobile/app-shell.md).

### MOB-027

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** `lib/views/fallbacks/app/` (19 files) is entirely dead code and a distinct directory
from the real, live `lib/fallbacks/app/` scaffolding — confusingly similar path, unrelated/dead
contents. Two things live inside it: a self-contained tier-gated "not found"/"error" fallback system
that nothing imports, and 13 more files sharing exact names with real files under
`lib/fallbacks/app/**`, each independently unreferenced too.
**Evidence:** `grep -rln "views/fallbacks" flutter-boilerplate/lib`, excluding the directory's own
files, returns nothing — confirmed for every individual file and the directory as a whole. Contrast
`lib/fallbacks/index.dart`, genuinely imported by multiple `settings/*/page_view.dart` files.
**Notes:** Reads as an abandoned first draft superseded by the real `lib/fallbacks/` tree and left
behind rather than deleted. Largest dead-code cluster found in this documentation effort by file
count (surpassing [MOB-022](#mob-022)'s 7 files), though severity stays LOW since impact is purely
maintenance burden, zero functional/security consequence. Documented in
[mobile/flutter-only-infra.md](./mobile/flutter-only-infra.md).

### MOB-028

**Severity:** MED · **Area:** Mobile · **Status:** verified
**Summary:** `lib/features/statics/` (`AccessDeniedPage`, `ErrorPage`, `GlobalErrorPage`,
`LoadingPage`, `NotFoundPage`, `I18nNotFoundPage`, `UnauthorizedPage`, plus a barrel) mirrors web's
`src/features/statics/` concept-for-concept but is completely unwired — no screen, router
`errorBuilder`, `ErrorWidget.builder`, or any other code imports any of the seven widgets or the
barrel. Web's directly-equivalent module is genuinely live (its `AccessDeniedPage` is the exact
fallback the web admin page renders for a non-admin visitor).
**Evidence:** `grep -rln "features/statics" flutter-boilerplate/lib`, excluding the directory's own
files, returns nothing. Contrast `next-js-boilerplate/src/views/admin/PageContent.tsx` (`import {
AccessDeniedPage } from "@/features/statics"`, genuinely rendered).
**Notes:** Represents an entire planned resilience-UI layer (error/not-found/unauthorized/loading
placeholders) that doesn't exist live anywhere in the shipped app — if a route throws or a widget
build fails outside the one demo path, the fallback is presumably Flutter's own default error UI
rather than anything branded. The one concrete place this would have closed a real gap: the admin
screen's own missing in-widget role-check fallback (see [CROSS-039](#cross-039)) —
`UnauthorizedPage`/`AccessDeniedPage` sat ready-built and unused exactly where web's parity feature
uses the real thing. Documented in [mobile/flutter-only-infra.md](./mobile/flutter-only-infra.md).

### MOB-029

**Severity:** LOW · **Area:** Mobile · **Status:** verified
**Summary:** `lib/views/common/share_sheet/` (`ShareContent`, `ShareActions`, `SharePlatform` — a
data model, a share/copy-link button widget, and a second data model) is fully built and entirely
dead. The real `v1/share` screen doesn't import from this folder, and the app's actual native share
integration elsewhere (`mfa_enroll`, `attachment_preview`) uses the `share_plus` package directly.
**Evidence:** `grep -rn "ShareContent(\|ShareActions(\|SharePlatform(" flutter-boilerplate/lib`
matches only each file's own definition.
**Notes:** No evidence of what it was meant to replace/supplement. Documented in
[mobile/flutter-only-infra.md](./mobile/flutter-only-infra.md).

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
Mobile has an unused, ready-built equivalent of web's `AccessDeniedPage` sitting in
[`lib/features/statics/`](#mob-028) that would close the one real asymmetry (no in-widget fallback)
if ever wired in. Documented in [frontend/v1/admin/page.md](./frontend/v1/admin/page.md) and
[mobile/v1/admin/screen.md](./mobile/v1/admin/screen.md).

### BE-026

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** `Post.categoryId`/`Post.category` and `Post.tags` (a `Category` relation and an implicit
`Tag[]` m2m) are real, fully-formed Prisma relations on `Post` — but `src/post/` never references
`category`/`tag` anywhere, not in `post.service.ts`, `post.resolver.ts`, nor any DTO. Unlike
[BE-011](#be-011) (`coverImage`, wired end-to-end backend-side but unused by either frontend), these
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

### CROSS-040

**Severity:** HIGH · **Area:** Backend + Frontend + Infra(?) · **Status:** verified
**Summary:** Every 1:1 RTC call attempted during a live testing pass (real Chromium browser
sessions against the deployed stack, two separate real user accounts) reproduced the same failure:
the caller's invite and the callee's ringing/accept all signal correctly, but within ~5-10 seconds
of the callee accepting, the backend logs a call cancellation caused by a detected WebSocket
disconnect — and neither client ever reaches the `connected` phase. Confirmed via
`RtcCallService`'s own structured logs:
```
{"event":"call.invited","phase":"RINGING", ...}
... (accept sent client-side; no corresponding "call.accepted"/"connected" log ever appears)
{"event":"call.cancelled","reason":"socket_disconnect","phase":"CANCELLED", ...}
```
On a second attempt, the same shape reproduced but with the *callee's* socket implicated instead
(`"reason":"callee_socket_disconnect"`, `"event":"call.missed"`) — the disconnect isn't consistently
one particular role, which points at general realtime-connection instability around this code path
rather than a caller-specific or callee-specific bug.
**Evidence:** [`nest-js-boilerplate/src/rtc/rtc-call.service.ts`](../nest-js-boilerplate/src/rtc/rtc-call.service.ts)
`handleDisconnect()` (~L526-579) is the code path that fired both times — it cancels/misses any
`RINGING` call the moment either party's gateway socket disconnects, which is reasonable logic *if*
the disconnect is real, but Playwright's own WebSocket instrumentation (`page.on("websocket")`,
listening for the `close` event on the actual browser-level `WebSocket` object) shows **no close
event ever fired on either client** during the exact window the backend believed a disconnect
happened — i.e. from the browser's own vantage point, the connection never dropped. Separately,
and possibly related: the callee's page, immediately after the realtime WS authenticates, sends
repeated `{"type":"unwatch","topic":"feed"}` / `{"type":"watch","topic":"feed"}` frame pairs for the
same topic in rapid succession (5-6 cycles observed in under a second right after page load) —
consistent with a `useEffect` dependency bug causing the realtime feed-subscription hook to
re-subscribe far more than it should, in `next-js-boilerplate/src/lib/realtime/` (exact hook not yet
isolated). Testing was done against the real deployed domains (`https://app.eys.gen.tr` /
`wss://api.eys.gen.tr/ws`), routed through this environment's external OpenResty proxy — a prior
session's notes flag that this exact proxy's WebSocket handling has needed special-cased handling
before (`/ws` probes requiring forced HTTP/1.1), so an infra-layer explanation (the proxy
recycling/resetting the long-lived WS connection under some condition) has not been ruled out
either, and could produce exactly this symptom (server-side TCP disconnect the browser's JS
`WebSocket` object never gets a clean chance to report before the underlying socket is gone).
**Notes:** Not root-caused — genuinely unclear whether this is an application bug (most likely
candidate: whatever causes the watch/unwatch churn also destabilizes the same connection during a
call) or an infrastructure/proxy issue specific to the external domain path. **This blocks 100% of
RTC calls from ever connecting** — meetings and live-streaming, which share the same realtime
signaling substrate, are suspected to be affected identically but weren't independently verified
before this was logged (deprioritized per user direction to move to other work). Whoever picks this
up next should first determine whether it reproduces when testing purely inside the docker network
(bypassing the external proxy entirely) — that single test would cleanly separate the two
hypotheses.

### CROSS-044

**Severity:** LOW · **Area:** Backend · **Status:** verified
**Summary:** The general GraphQL `users(search: String)` query — used by web's own general
users-search/find-friends feature, not just the admin page — is gated only by
`@UseGuards(SessionAuthGuard)` at the resolver class level
([`messaging.resolver.ts`](../nest-js-boilerplate/src/messaging/messaging.resolver.ts), no
role check). Since it returns the full generated `User` GraphQL type, **any authenticated user**
can already request `role`/`status` for an arbitrary other user directly against the GraphQL
endpoint today (`{ users(search: "x") { role status } }`) — whether they're an ADMIN/SUPERADMIN, or
BANNED/SUSPENDED — regardless of any admin-only gating the frontend puts in front of its own UI for
that data.
**Evidence:** Found while building BE-007's admin ban/MFA-reset UI: the new admin-only BFF
route deliberately avoids reusing the general `/api/users/search` route specifically to not leak
these two fields to a non-admin caller through the *intended* UI surface — but that only protects
the BFF-mediated path. A direct GraphQL request (or a compromised/malicious frontend bundle) bypasses
the BFF and this class-level guard entirely.
**Notes:** Not fixed this pass — pre-existing, and not something this session's admin-UI work made
worse (the fields were already selectable on `User` by any caller of `users()`; the admin UI change
only made the *value* visible through one new, correctly-gated surface). A real fix needs
per-field GraphQL authorization (e.g. a viewer-aware `@ResolveField()` override on `User.role`/
`User.status` that redacts for anyone other than the record's own owner or an admin/superadmin,
the same shape as the existing `hideAvatar` redaction pattern used elsewhere) — a small but real new
pattern, not a one-line fix, so flagged here rather than built under this task's scope.
