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
| [CROSS-002](#cross-002) | MED (tentative) | Backend + Frontend + Mobile | `project-tasks` + `team-members` are real `CORE_MODULES` with no discovered frontend/mobile consumer page | found — unverified | Phase 0, verify in Phase 2 |
| [CROSS-005](#cross-005) | MED | Backend + Docs | Old AUTH.md/REALTIME.md describe a first-message WS auth protocol removed 2026-08-03; real mechanism is cookie-based upgrade auth | verified | Phase 0 |
| [BE-003](#be-003) | LOW–MED | Backend | REST `sendMessage` response includes an internal `delivery` field that the GraphQL `sendMessage` mutation deliberately strips | verified | Phase 0 |
| [MOB-001](#mob-001) | LOW | Mobile | Dead file `lib/views/security/csp/nonce_panel.dart` | verified | Phase 0 |
| [FE-001](#fe-001) | — | Frontend | `constants/routes.ts` `FIND_FRIENDS_PATH`/`FRIENDS_PATH` — checked, not a bug | verified — wontfix | Phase 0 |
| [CROSS-003](#cross-003) | INFO | Backend + Frontend + Mobile | No real backend API versioning exists; frontend's "v1" is a frontend-only URL convention | verified | Phase 0 |
| [CROSS-006](#cross-006) | MED | Frontend + Mobile | Flutter messaging has no reply-to-message feature at all (no field, no UI, no action) | verified | Phase 0 |
| [CROSS-007](#cross-007) | MED | Docs (self) | Earlier research in this same effort mis-classified Flutter's REST-shaped calls as BFF-routed; `messages` vertical has zero Next.js involvement for either call shape | verified | Phase 0 |

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
[mobile/v1/messages/screen.md](./mobile/v1/messages/screen.md#widgets-used) — all three sides of the
gap point at this one row.

### CROSS-002

**Severity:** MED (tentative) · **Area:** Backend + Frontend + Mobile · **Status:** found — unverified
**Summary:** `project-tasks` and `team-members` are real, always-on `CORE_MODULES`, but no matching
frontend vertical turned up in the real-page inventory (35 pages) and no matching Flutter vertical
either. Possibly orphaned backend features, possibly admin-only with no dedicated page, possibly
consumed by something not yet checked (an internal tool, a different client).
**Evidence:** [`nest-js-boilerplate/src/project-tasks/`](../nest-js-boilerplate/src/project-tasks/),
[`nest-js-boilerplate/src/team-members/`](../nest-js-boilerplate/src/team-members/) vs the absence of
either in `next-js-boilerplate/src/app/v1/[lang]/**` or `flutter-boilerplate/lib/views/**`.
**Notes:** verify during Phase 2 (Social & Content) — grep both apps for any GraphQL operation name
belonging to these two modules before concluding they're truly orphaned; if a consumer is found,
document it normally and close this as `wontfix` (not a bug, just an unusual entry point).

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
