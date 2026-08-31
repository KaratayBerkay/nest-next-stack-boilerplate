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
| [BE-004](#be-004) | LOW | Backend | `validatePasswordStrength()`'s length/variety checks are unreachable dead code — the DTO validator is already stricter | verified | Phase 1a |
| [FE-002](#fe-002) | LOW | Frontend | Dead `signup.ts` server action sits inside `features/auth/actions/`, used only by an unrelated forms-gallery demo | verified | Phase 1a |
| [BE-008](#be-008) | INFO | Backend | `MfaFactor`'s schema has WebAuthn columns; `MfaService` only ever implements TOTP | verified | Phase 1b |
| [BE-009](#be-009) | LOW | Backend | `POST /csrf/echo` (a CSRF self-test route) has no caller anywhere | verified | Phase 1b |
| [CROSS-013](#cross-013) | LOW | Frontend + Mobile | Same "scaffolded-then-inlined, original left behind" dead-code pattern independently on both platforms in the api-keys screen | verified | Phase 1b |
| [CROSS-019](#cross-019) | MED | Frontend + Mobile | Settings language/timezone persist correctly but don't (fully) take effect — language only live on mobile, timezone unused by either | verified | Phase 2a |
| [BE-014](#be-014) | INFO | Backend | 4 of 9 `NotificationType` enum values have no producer anywhere in current backend code | verified | Phase 3a |
| [BE-015](#be-015) | LOW | Backend | `myPushSubscriptions` GraphQL query has no caller on either platform | verified | Phase 3a |
| [CROSS-023](#cross-023) | LOW | Frontend + Mobile | Web auto-marks all notifications read on page load; mobile has no equivalent, requires explicit tap | verified | Phase 3a |
| [CROSS-024](#cross-024) | LOW | Frontend + Mobile | Chat-room has no reply-to-message and no delete-message capability at all, on any surface | verified | Phase 3b |
| [FE-012](#fe-012) | LOW | Frontend | Buffered multipart upload BFF route never forwards upload-scope headers; dead code today | verified | Phase 3b |
| [MOB-016](#mob-016) | LOW | Mobile | Mobile's chat-room widget is dual-purposed as a second, unreachable 1:1 DM implementation | verified | Phase 3b |
| [CROSS-026](#cross-026) | LOW | Frontend + Mobile | Web's and mobile's own chat-room deep-link query param names don't match each other | verified | Phase 3b |
| [BE-019](#be-019) | LOW | Backend | Nothing distinguishes a Stripe 3DS/SCA decline from any other subscription-charge failure; neither client offers a recovery path for it | verified | Phase 4a |
| [CROSS-035](#cross-035) | LOW | Frontend + Backend | The "Premium" nav page is not a subscription page — it's a live NestJS tier-gate tech demo with no role check, reachable by any paid user | verified | Phase 4b |
| [BE-023](#be-023) | LOW | Backend | `VaultService` (`@Global()`) has zero consumers anywhere in the app — the real vault-read path bypasses it entirely | verified | Phase 5a |
| [BE-025](#be-025) | LOW | Backend | `cookies/` (demo) vs `common/cookies/` (real) — a fourth confirmed module-naming collision trap | verified | Phase 5a |
| [CROSS-038](#cross-038) | LOW | Frontend + Mobile | The About page has no discoverable in-app nav link on either platform | verified | Phase 5b |
| [CROSS-031](#cross-031) | MED | Frontend + Mobile + Backend | Tier feature copy exists in four divergent hardcoded sets (web pricing, web plans, backend seed/config, mobile plans Dart) — no single source of truth | verified | Phase 4a *(entry reconstructed 2026-08-29 — was referenced by 8 docs but never written)* |
| [CROSS-039](#cross-039) | INFO | Frontend + Mobile | Both platforms' admin role-gate is client-side-only at the render layer (at different points); real mutations are correctly backend-gated regardless | verified | Phase 5b |
| [BE-026](#be-026) | LOW | Backend | `Post.category`/`Post.tags` have zero application-code references anywhere in `src/post/` — not even in a DTO | verified | schema.md |
| [BE-027](#be-027) | LOW | Backend | The `Follow` model has zero application-code references anywhere in `src/` — no module queries or writes it | verified | schema.md |
| [BE-028](#be-028) | LOW | Backend | 9 `User` columns/relations (`referredBy` self-relation, `birthDate`, `quietHoursStart`, `interests`, `metadata`, `preferences`, `phoneNumber`, `phoneVerified`, `reputation`) have zero application-code references anywhere | verified | schema.md |

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

### CROSS-013

**Severity:** LOW · **Area:** Frontend + Mobile · **Status:** verified
**Summary:** The same "scaffolded-then-inlined, original files left behind" dead-code pattern shows
up independently on both platforms in one vertical. Web: `FE-007`'s `mfa-handlers.ts`.
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
**Notes:** Same "registered but unreachable" shape as `MOB-001`/`MOB-004` (both resolved). If ever
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

