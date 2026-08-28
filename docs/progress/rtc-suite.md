# RTC suite — 1:1 calls, group meetings, live streaming

> **Progress tracker, not reference docs.** The shipped system is documented at
> [backend/messaging-realtime/rtc/](../backend/messaging-realtime/rtc/README.md),
> [frontend/v1/rtc/](../frontend/v1/rtc/README.md), and
> [mobile/v1/rtc/](../mobile/v1/rtc/README.md) — read those for current behavior; this file records
> how it got built.

*Planned locally against the live tree (every file/line citation below was read directly
from the repo, not assumed), refined via an independent design pass, then two rounds of
user-directed scope decisions before Phase 1 implementation. This is a single running
tracker, updated in place per phase — see `docs/progress/end-2-end.md`'s (E2EE) precedent
for why this repo prefers one file over `phaseN.md` files for a multi-phase build.*

## Context

A left-nav "RTC" feature, analogous to the existing "Messages" page, covering three
products in one initiative: 1:1 voice/video calls (WhatsApp-style), group video meetings
(Zoom-style), and live streaming with viewers + chat (Twitch-style). A reference
implementation, `voice-call-system` (a sibling repo, not part of this one), solves a
narrow slice of this — 1:1 **audio-only**, pure P2P WebRTC, Socket.IO signaling, a
standalone coturn TURN server, in-memory state, no persistence — but that architecture
doesn't extend to group meetings or streaming (no SFU), and its transport (Socket.IO)
doesn't match this repo's real-time layer (a custom raw `ws` gateway). This plan mines
the reference repo's call-state-machine rules and event vocabulary, but redesigns the
transport and media plane against what's actually in this repo, and adds the two missing
product surfaces (meetings, streaming) on shared new infra.

Decisions confirmed before building:
- Calls are audio **and** video.
- All three features share **one self-hosted LiveKit SFU** (`livekit/livekit-server`,
  Apache-2.0) — one piece of media infra instead of three. LiveKit's built-in TURN/STUN
  replaces coturn entirely; LiveKit rooms work unmodified for 2-party calls, N-party
  meetings, and 1-publisher/many-viewers streaming.
- Build all three as one continuous initiative, phase by phase, not "ship calls, stop."
- RTC chat (call/meeting/stream) matches the app's **actual current** chat-encryption
  mechanism (see the correction below — not the stronger scheme the term might suggest).
- RTC is tier-gated from Phase 1, consistent with the rest of the app.

### A correction made mid-design, worth keeping visible

An early pass of this plan assumed this repo's chat encryption was a client-side
sender-key/X3DH scheme (matching the reference repo's own framing of "E2EE"), and
designed RTC chat key-distribution around that. **That system was removed from this repo
on 2026-08-04** (`nest-js-boilerplate/src/wire-crypto/README.md` / the mirrored doc at
`docs/backend/messaging-realtime/wire-crypto/README.md`, `docs/issues.md#cross-004`) and
replaced with `StorageCryptoService` — **trusted-server, server-held-key** at-rest
encryption: one HKDF-derived key per DM sender, one shared HKDF-derived key for all
`RoomMessage` rows. The server can always decrypt; the guarantee is "ciphertext at rest /
in a DB dump," not true end-to-end secrecy. RTC chat matches *that* real mechanism, which
turned out simpler than originally designed — no key distribution, no per-participant key
state, no bootstrapping problem for short-lived rooms (a stream with fast-churning
viewers costs the same near-zero key-management overhead as a 2-person call, because
there is no per-participant key state to rotate on join/leave). This is a materially
weaker guarantee than "E2EE" usually implies outside this codebase's specific
redefinition of the term — flagged to the user as a judgment call, confirmed as the
intended shape.

Also confirmed while researching: `Room.membershipVersion` (which might have suggested a
shared pattern with `RtcRoom`) is write-only dead code — incremented at
`messaging-room.service.ts:233,252` but read nowhere in the app (only in generated Prisma
scaffolding). `RtcRoom` deliberately does not get an equivalent field.

## Architecture

**New, separate Prisma models** — not an extension of `Room`/`RoomParticipant` (those are
purpose-built for persistent, slug-joinable chat rooms; grafting ephemeral LiveKit-backed
sessions onto that shape would be a worse fit than six small new models):

- `RtcRoom` / `RtcParticipant` — shared spine. `RtcRoomKind` (CALL/MEETING/STREAM),
  `RtcRoomState` (PENDING/ACTIVE/ENDED — a CALL starts PENDING with no LiveKit room
  minted until accepted, so an unanswered call costs nothing).
- `CallSession` — 1:1 call state machine (`CallEndState`: RINGING → CONNECTING →
  CONNECTED → ENDED/REJECTED/FAILED/CANCELLED/MISSED — MISSED is new vs. the reference
  repo, for ring-timeout), `maxDurationMinutes` persisted at accept-time from
  `MIN(caller tier, callee tier)`.
- `Meeting` — host, slug, `maxParticipants`/`maxDurationMinutes` derived from the host's
  tier **at creation time** (persisted, not recomputed live).
- `LiveStream` — broadcaster, slug, `isLive`, `peakViewerCount` (historical high-water
  mark only — the live number comes from LiveKit's `RoomServiceClient.listParticipants`
  at query time).
- `RtcChatMessage` — `v`/`ct`/`nonce` columns (same shape as `RoomMessage`, not
  plaintext), encrypted via new `StorageCryptoService.encryptForRtcRoom`/
  `decryptForRtcRoom` methods with their own HKDF context (`rtc-room-storage-v1`) so RTC
  chat is cryptographically separate from `RoomMessage`'s shared key.

**NestJS module** — `src/rtc/`: `LiveKitService` (wraps `livekit-server-sdk`: token
minting via `AccessToken`/`VideoGrant`, room lifecycle via `RoomServiceClient`, webhook
verification via `WebhookReceiver` — the auth.service.ts analog from the reference repo,
turning an already-authenticated user into a signed LiveKit grant, never trusting a
client-supplied identity), `rtc-tier-limits.constants.ts` (reuses `usage.constants.ts`'s
FREE/BASIC/MEDIUM/PREMIUM ×1/×2/×4/×8 doubling convention), `RtcResolver` (GraphQL),
`RtcWebhookController` (mirrors `StripeWebhookController`'s raw-body-signature pattern —
no session guard, webhooks authenticate via LiveKit's own signature). The 1:1 call
ringing/presence layer (Phase 2) registers `rtc:*` frames on the **shared**
`RealtimeGateway` via `registerHandler`, exactly like `messaging-ws.gateway.ts` does — no
new gateway, no Socket.IO, ports the reference repo's validation rules (no self-call,
busy-if-active-call, accept/reject/cancel only by the real participant) rather than its
transport. `RealtimeGateway.registerDisconnectHandler` is new core-gateway surface added
in Phase 1 — there was previously no hook for "a socket just disconnected" (messaging
never needed one); needed so a RINGING call auto-ends if the callee's socket drops before
they answer.

**Infra** — `livekit` service in the root `docker-compose.yml`, `network_mode: host` (not
bridge+ports like this file's other services — LiveKit's 10k-port UDP media range can't
be reliably bridge-mapped; same reasoning `voice-call-system`'s coturn service uses host
networking). Config at `nest-js-boilerplate/docker/livekit/livekit.yaml`. Because
`network_mode: host` means no Docker-internal DNS, that config addresses Redis and the
webhook callback via `localhost`, not compose service names.

**Frontend** — one new nav entry (`/rtc`, matches the original ask: "a page in left menu
for RTC, like messages"), not three separate ones — Calls/Meetings/Live are three flavors
of the same LiveKit-backed surface, closer to Zoom/Discord's single video surface with
tabs than to this app's Messages-vs-Chat-Room split. `next.config.ts`'s global
`Permissions-Policy: camera=(), microphone=()` (confirmed blocking `getUserMedia()`
everywhere, including self) gets a per-route override for `/v1/:lang/rtc/:path*`.

**Mobile** — mirrors the web decision exactly (one nav entry, same tier-UI approach),
following the **flutter-conversion** skill's conventions throughout.

**Tier gating** — two mechanisms, matching two existing precedents exactly: (a) binary
gate on going live only (`@MinTier(SubscriptionTier.MEDIUM)`, identical shape to the real
usage at `post.resolver.ts:101-102`) — joining a stream/meeting and making/receiving 1:1
calls are *not* gated, available to every tier; (b) numeric scaling checks (call
duration, meeting participants/duration) mirror `UsageService`'s pattern — compute a
tier-scaled limit inline, throw a typed `ForbiddenException`.

## Phased build sequence

Each phase is independently demoable. Work through them in order with a check-in between
phases.

1. **LiveKit infra + token-minting + tier-limit foundation + empty nav shell** — ✅ done, see below.
2. **1:1 calls end-to-end, tier-capped from the start** — ✅ done, see below.
3. **Group meetings end-to-end, caps + encrypted chat from the start** — ✅ done, see below.
4. **Live streaming end-to-end, go-live gated, chat encrypted from the start** — ✅ done, see below.
5. **Polish / cross-cutting** (push notifications, LiveKit Egress recording/HLS,
   moderation, call-history UI) — not started.

Explicitly out of scope for this initiative: CallKit/ConnectionService (OS-level
background calling — matches the reference repo's foreground-only design), RTMP ingest
from OBS (browser/mobile-native publish is the MVP path), HLS egress for scaling
viewership past direct SFU limits, and recording — all deferred, noted for a future
phase.

---

## Phase 1 — LiveKit infra + token-minting + tier-limit foundation + empty nav shell

**Status: done, verified against a live local stack (not just typecheck/lint).**

### Backend (`nest-js-boilerplate`)

- `prisma/schema.prisma`: `RtcRoomKind`/`RtcRoomState`/`RtcParticipantRole`/
  `CallEndState` enums + `RtcRoom`/`RtcParticipant`/`CallSession`/`Meeting`/
  `LiveStream`/`RtcChatMessage` models + matching `User` relation block.
- `prisma/migrations/20260824120000_add_rtc_suite/migration.sql` — hand-verified clean
  (generated via `prisma migrate diff` against a real shadow DB, then hand-filtered to
  drop unrelated pre-existing schema drift the diff also picked up — a `BillingAddress`
  table and two trigram-index `DROP INDEX` statements that have nothing to do with this
  change; applied and confirmed via `prisma migrate diff` reporting "database is already
  in sync with the Prisma schema" afterward).
- `src/rtc/livekit.service.ts`, `rtc-tier-limits.constants.ts`, `rtc.module.ts`,
  `rtc.resolver.ts` (`Query rtcTierLimits`), `rtc-webhook.controller.ts`
  (`POST /rtc/webhook/livekit` — no global route prefix in this app, so this is the real
  path, not `/api/rtc/webhook/livekit`).
- `src/wire-crypto/storage-crypto.service.ts`: `encryptForRtcRoom`/`decryptForRtcRoom`.
- `src/realtime/realtime.gateway.ts`: `registerDisconnectHandler` extension point.
- `src/app.module.ts`: `RtcModule` registered.
- `livekit-server-sdk` added as a dependency.
- **Verified live**: booted the real built app image against local Postgres/Redis/
  LiveKit — `RtcModule dependencies initialized`, GraphQL schema includes
  `rtcTierLimits` (queried directly: correctly 401s "Missing access token" rather than a
  schema error), `RtcWebhookController` mapped to `/rtc/webhook/livekit` (POSTing an
  unsigned body correctly 400s "Invalid signature" rather than crashing),
  `/health/ready` reports database/redis both up.

### Infra

- `docker-compose.yml`: new `livekit` service (`livekit/livekit-server:v1.8`,
  `network_mode: host`).
- `nest-js-boilerplate/docker/livekit/livekit.yaml`: dev static key pair (LiveKit
  requires secrets ≥32 chars — the first attempt with a short dev secret logged a
  validation error), Redis/webhook addressed via `localhost` (host networking has no
  Docker-internal DNS).
- **Verified live**: LiveKit server boots clean (no errors), HTTP endpoint responds 200.
  Smoke-tested `RoomServiceClient.createRoom`/`listRooms`/`deleteRoom` and `AccessToken`
  minting for two identities directly against the running server — all correct. Full
  two-browser-tab audio/video verification is still the user's to do by hand (needs a
  real mic/camera + browser); not something this environment can drive.
- **Operational action still needed, outside repo-only changes**: this repo's secrets
  flow through a live Vault instance (`docker/vault-init/entrypoint.sh`). The real
  `secret/production/backend` path needs `LIVEKIT_URL`/`LIVEKIT_HTTP_URL`/
  `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` added for any non-local deploy — not done here
  (no Vault write access from this environment). Locally, `.vault-envs/backend.env` and
  `.vault-envs/frontend.env` (both gitignored, cached from a real vault-init run) were
  hand-appended with matching dev values so Phase 1 could be verified end-to-end; this
  will be overwritten by the next real `vault-init` run until the real Vault path has
  these keys.

### Frontend (`next-js-boilerplate`)

- Nav: `/rtc` entry in `V1Nav.tsx` + `AUTH_REQUIRED_HREFS`, `navRtc` i18n key (en/tr).
- Routes: `src/app/v1/[lang]/rtc/{page,loading,error}.tsx`, backed by
  `src/views/rtc/RtcHubView.tsx` (three placeholder cards: Calls/Meetings/Live) and a new
  `rtc` i18n namespace (`messages/{en,tr}/rtc/messages.json`).
- `next.config.ts`: `Permissions-Policy` override for `/v1/:lang/rtc/:path*`
  (`camera=(self), microphone=(self), display-capture=(self)`).
- `NEXT_PUBLIC_LIVEKIT_URL` wired through `src/lib/env.ts`, the zod schema, `.env.example`,
  the Dockerfile `ARG`/`ENV`, and `docker-compose.yml`'s `nextjs.build.args`.
- `livekit-client` added as a dependency.
- **Verified**: `pnpm typecheck` and `pnpm lint` both clean on every touched/new file.
  Dev-server/browser check intentionally skipped per this repo's established convention
  (lint+typecheck is the bar for routine component/page work; live verification happens
  later, by hand).

### Mobile (`flutter-boilerplate`)

- Nav: `/rtc` entry in `v1_nav.dart`, `v1ShellNavRtc` ARB key (en/tr).
- Route: `/v1/:lang/rtc` in `router.dart` + `Routes.v1Rtc`, backed by
  `lib/views/rtc/page_view.dart` (`RtcPageContent` — plain widget, deliberately **not**
  composed via `TierGate`/free-basic-medium-premium page views like Feed/Messages: RTC's
  tier differences are purely numeric caps + one binary go-live gate, not different page
  layouts, so the per-tier-page-swap pattern doesn't fit here — mirrors the same decision
  made on the web side).
- New `rtc*`/`v1ShellNavRtc` ARB keys (en/tr) → regenerated `app_localizations*.dart` via
  `flutter gen-l10n`.
- `livekit_client: ^2.7.0` added (resolved to 2.11.0; wraps `flutter_webrtc` internally —
  no separate `flutter_webrtc`/`socket_io_client` dependency needed).
- `AndroidManifest.xml`: added `CAMERA`/`RECORD_AUDIO`/`MODIFY_AUDIO_SETTINGS`/
  `BLUETOOTH_CONNECT` (previously only had `INTERNET`).
- `Info.plist`: broadened the existing `NSCameraUsageDescription` copy to also cover
  calls/meetings/streaming (iOS allows only one), added the previously-missing
  `NSMicrophoneUsageDescription`.
- **Verified**: `flutter analyze` clean (whole project, not just touched files),
  `dart format` clean, `flutter pub get` resolved `livekit_client` with no conflicts.
  Not built to a real APK/device in this pass — `flutter_webrtc`'s native Android/iOS
  build hookup (Gradle/NDK, minSdkVersion, deployment target) is a real gotcha class
  worth a dedicated build-and-install check before Phase 2 mobile UI work leans on it.

### Open judgment calls carried forward (unchanged from the plan, still open)

1. RTC chat encryption matches the app's actual current mechanism (server-held-key
   at-rest), not true end-to-end secrecy — confirmed as intended, see the correction
   above.
2. 1:1 calls are ungated-but-duration-capped (free for every tier, FREE cap 15 min).
3. Call duration cap uses `MIN(caller tier, callee tier)`.
4. Meeting caps are keyed to the host's tier only — implemented as designed: persisted on
   `Meeting.maxParticipants`/`maxDurationMinutes` at creation time, never recomputed from
   a live host-tier lookup.
5. Ring-timeout value (45s, ported from the reference repo's own client-side convention)
   and the `MISSED` call-end state — implemented in Phase 2, see below.
6. No dedicated route for an active 1:1 call (global overlay, no URL) — implemented in
   Phase 2 as a global `RtcCallOverlay`/`RtcCallProvider` (web) and `RtcCallOverlay`/
   `rtcCallProvider` (Flutter), mounted app-shell-wide, not per-page.
7. Meeting-host-leaves policy: "meeting continues, no ownership transfer" — implemented in
   Phase 3 exactly as recommended: `leaveMeeting` never special-cases the host, `endMeeting`
   is the only host-driven termination, and LiveKit's own empty-room `departureTimeout` is
   the backstop for a host who vanishes without clicking End.
8. REST-via-BFF as the frontend's authoritative integration path, GraphQL secondary — held
   for calls (REST), but Meeting CRUD is GraphQL end-to-end per the plan's own explicit
   call-out ("Meeting CRUD & Stream endpoints — RtcResolver (GraphQL)"). Phase 3's Next.js
   BFF route handlers still wrap that GraphQL traffic in a REST-shaped surface for the
   browser (mirrors the pre-existing `api-keys` feature's own GraphQL-via-BFF-route
   pattern) — Flutter calls `/graphql` directly, no BFF layer on mobile.
9. Meeting duration-cap enforcement mechanism: confirmed via the pinned
   `livekit/livekit-server` version's `livekit-server-sdk` `CreateOptions` type — no native
   per-room max-duration field exists (only `emptyTimeout`/`departureTimeout`/
   `maxParticipants`), so Phase 3 ships the periodic-sweep design as planned:
   `RtcMeetingSweepService` (`@Interval`, 30s) scans active MEETING rooms and force-ends
   any past `startedAt + maxDurationMinutes`. Deliberately more robust than 1:1 calls' own
   per-replica `setTimeout`s — any replica's tick can catch up an expired meeting, not just
   the one that "started" it, so a mid-meeting replica restart can only delay the cutoff by
   up to one sweep interval, never strand it.

---

## Phase 2 — 1:1 calls end-to-end, tier-capped from the start

**Status: done, verified against a live local stack (module boot, route mapping, REST
auth-gating all confirmed; two-browser/two-device audio-video verification is the user's
to do by hand — needs real mic/camera hardware this environment can't drive, same
carve-out as Phase 1's LiveKit smoke test).**

### Backend (`nest-js-boilerplate`)

- `src/common/id-codec/uuid-fields.ts`: added `callId` to `MANUAL_ID_ALIASES` — the WS
  protocol's `CallSession.id` field has no matching scalar FK anywhere in the schema for
  the per-model classifier to pick up automatically (same reasoning as the existing
  `cursor`/`readerId`/`deviceId` aliases).
- `src/rtc/rtc-call.service.ts` (new): the call state machine. Ports voice-call-system's
  validation rules (no self-call, busy-if-active, accept/reject/cancel only by the real
  participant) onto `RealtimeGateway.registerHandler`, not a new gateway. "Busy" and
  ring/duration timers are resolved by reading `CallSession` from Postgres rather than an
  in-memory map (the reference repo's map only works single-instance; this app assumes N
  replicas) — a deliberate, documented simplification: timers are still plain
  `setTimeout`s on whichever replica handled the invite/accept, so a replica restart
  mid-call can strand a call with nothing to unstick it (rare, low-stakes, same class of
  gap the Phase 3 meeting-duration sweep will solve properly). Ring-timeout is 45s
  (ported from the reference repo's own client-side convention). Call duration cap is
  `MIN(caller tier, callee tier)`, computed fresh from the DB at accept-time (never from
  a possibly-stale `ws.tier`), with a warning frame 60s before the forced hangup.
  `getActiveCallSnapshot`/`getCallHistory` back the two REST reads below; the former
  returns the exact same `rtc:invite`/`rtc:accepted` frame shapes the WS pushes use
  (including peer identity for the `rtc:accepted` case, added specifically so a
  page-refresh mid-call can re-render who the user is talking to), so the frontend/mobile
  reducer can feed a recovery read through the identical code path as a live frame.
- `src/rtc/rtc-call-ws.gateway.ts` (new): thin — registers `rtc:invite`/`rtc:accept`/
  `rtc:reject`/`rtc:cancel`/`rtc:hangup` on the shared `RealtimeGateway` and the
  RINGING-phase `registerDisconnectHandler` hook added in Phase 1; all validation/state
  lives in the service.
- `src/rtc/rtc.controller.ts` (new): `GET /api/rtc/calls` (paginated history) and
  `GET /api/rtc/calls/active` (recovery snapshot) — REST-via-BFF, matching Judgment call
  10's resolution; no GraphQL surface added for calls (WS already owns every state
  transition, REST only serves reads).
- `src/rtc/rtc-webhook.controller.ts`: extended `handleParticipantLeft`/
  `handleRoomFinished` — for a CALL-kind room, one side leaving now ends the call
  immediately (`RtcCallService.handlePeerLeft`) rather than waiting on LiveKit's own
  ~60s `departureTimeout`, with `handleRoomEndedByLiveKit` as an idempotent safety net on
  `room_finished`. This is the path that closes out a call whose participant's app
  crashed or lost network without ever sending `rtc:hangup`.
- `src/rtc/rtc.module.ts`: wired `RtcCallService`/`RtcCallWsGateway`/`RtcController` in.
- **Verified live**: rebuilt and booted the real app image — `RtcModule`/`RtcController`/
  `RtcWebhookController` all initialize with no DI errors, `RtcController` routes mapped
  (`GET /api/rtc/calls`, `GET /api/rtc/calls/active`), both correctly 401 unauthenticated
  rather than 404/500. `pnpm typecheck`/lint clean on every touched/new file (one real fix
  along the way: the four RTC Prisma enums had to be imported from `@prisma/client`
  directly in this new call-service/webhook code, not the `@generated/prisma/*.enum.ts`
  GraphQL-registration wrappers Phase 1 used — those are a structurally-identical but
  nominally distinct TS type, and eslint's `no-unsafe-enum-comparison` correctly caught
  every `call.state !== CallEndState.X` comparison against the wrong one).

### Frontend (`next-js-boilerplate`)

- `src/lib/rtc/RtcCallProvider.tsx` (new): app-shell-wide call-state reducer/context —
  `idle → outgoing-ringing/incoming-ringing → connected`, exact mirror of the backend's
  frame vocabulary. Subscribes to every `rtc:*` WS frame via `useRealtime()`, and recovers
  a missed point-in-time push via `activeCallQueryOptions()` (invalidated on every WS
  reconnect from `resync.ts`, same "pull covers a race" idea as messaging's
  get-room-members). Mounted in `V1Shell.tsx` alongside `RealtimeProvider`.
- `src/components/rtc/RtcCallOverlay.tsx` (new): the one global UI surface for the whole
  call lifecycle — incoming-call `Dialog`, outgoing-ring/connecting screen, in-call
  video/audio + mute/camera/hangup controls. Rendered once in `V1Shell`, works from any
  page.
- `src/hooks/rtc/useLiveKitRoom.ts` (new): thin wrapper around `livekit-client`'s
  low-level `Room`/`Track` API (no `@livekit/components-react`, matching this repo's
  custom-component culture). Takes caller-owned video/audio element refs rather than
  creating and returning its own — a hook return value mixing refs with plain reactive
  state trips react-compiler's ref-during-render lint check on *every* property access
  off the returned object, not just the ref ones; refs now live in the consuming
  component (`useRef` in `RtcCallOverlay`), passed in.
- `src/api/server/rtc/{call-history,active-call}.ts` + `src/api/client/rtc/query.ts` +
  `src/app/api/rtc/[...path]/route.ts`: the two-layer REST-via-BFF stack for the two new
  backend reads, matching the established `messages/[...path]` pattern (this one
  explicitly prefixes `rtc/` in the backend URL, since `RtcController` lives at
  `api/rtc` rather than bare `api`).
- `src/views/messages/ChatViewHeader.tsx`: added voice/video call buttons — the real entry
  point for placing a call (mirrors WhatsApp's own chat-header convention), disabled
  while the peer is offline or the user is already in a call.
- `src/views/rtc/RtcHubView.tsx` / `src/views/rtc/RtcCallHistoryView.tsx` +
  `src/app/v1/[lang]/rtc/calls/page.tsx`: the Calls card is now a live link (Meetings/Live
  stay "Coming soon"); the history page lists past calls with a one-tap "call again".
- `messages/{en,tr}/rtc/messages.json` + regenerated `src/generated/i18n-messages*`: ~25
  new keys for the whole call UI.
- **Verified**: `pnpm typecheck` and `pnpm lint` both clean on every touched/new file
  (two real react-compiler-driven fixes along the way, beyond the ref-mixing one above:
  an `eslint-disable` for `exhaustive-deps` had to be replaced with a real dependency
  instead, since react-compiler refuses to optimize any component containing a disabled
  hooks-lint rule). Rebuilt and booted the real Next.js image — `/` 200s, the new
  `/api/rtc/[...path]` BFF proxy correctly round-trips to the backend and 401s
  unauthenticated rather than 404/500. Two-browser live call verification (ring → accept
  → connected → hangup, reject/cancel/busy/self-call/disconnect-mid-ring, the 15-minute
  FREE cap firing its warning then forced hangup) is the user's to do by hand, per this
  repo's established convention for real-time/media features.

### Mobile (`flutter-boilerplate`)

- `lib/lib/rtc/rtc_call_state.dart` / `rtc_call_provider.dart` (new): a `StateNotifier`
  mirror of the web reducer — same phase names, same guard conditions. Fed by
  `realtime_provider.dart`'s central `handleEventFrame` switch (new `rtc:*` cases dispatch
  into the notifier) rather than owning its own subscription — this app funnels every
  frame through one switch, unlike web's per-type `realtime.subscribe(type, handler)`.
  `resyncAfterConnect` invalidates `activeCallProvider` on every reconnect, same recovery
  idea as web.
- `lib/components/rtc/rtc_call_overlay.dart` (new): owns the LiveKit `Room` directly
  (connect on entering `connected`, disconnect on leaving) rather than through a reusable
  hook-style abstraction — the connection lifecycle is tied 1:1 to this one widget's
  mount lifetime. Mounted via `MaterialApp.router`'s `builder` param (not a `Stack` around
  the whole `MaterialApp`, which would put it *outside* the app's own
  `Localizations`/`Directionality` scope and break `AppLocalizations.of(context)` — same
  risk the existing `_BiometricOverlay` pattern runs, sidestepped here rather than copied).
- `lib/app_config.dart` / `.env.example`: added `AppConfig.livekitUrl` — Phase 1 wired
  `NEXT_PUBLIC_LIVEKIT_URL` for web but never added a Flutter-side equivalent; a real gap,
  filled now (`LIVEKIT_URL`, defaults `ws://localhost:7880`).
- `lib/api/server/rtc/{call_history,active_call}.dart` + `lib/api/client/rtc/query.dart` +
  `lib/types/rtc/{call_history_entry,active_call_snapshot}.dart`: two-layer Dio stack for
  the same two backend reads, calling the backend directly (no BFF layer on mobile).
- `lib/views/messages/chat_view_header.dart`: call/video-call `IconButton`s, same
  disabled-while-offline-or-busy behavior as web.
- `lib/views/rtc/page_view.dart` / `calls_page_view.dart` + router/route entries: Calls
  card now navigates to a real history list; Meetings/Live stay "Coming soon".
- `lib/l10n/app_{en,tr}.arb` + regenerated `app_localizations*.dart`: ~26 new `rtc*` keys.
  Two (`rtcCallingTitle`, `rtcCallLimitWarning`) carry ICU placeholders — Flutter's
  codegen turns those into callable methods (`t.rtcCallingTitle(name)`), not the
  web/JSON approach of a plain string plus manual `.replace()`.
- **Verified**: `flutter analyze` clean (whole project) and `dart format` clean on every
  touched/new file. Real issues caught and fixed along the way: `LocalTrackPublication
  .track` returns `LocalTrack?`, not `VideoTrack?` — narrowing via `is` didn't survive
  being read back out of a `final` local inside a `setState` closure, so those two sites
  use an explicit `as` cast instead of relying on flow-typing through the closure; a
  method named `onError` on the notifier collided with `StateNotifier`'s own inherited
  member of that name (renamed `onCallError`). Not built to a real APK/device in this
  pass — real two-device call verification needs actual camera/mic hardware, same
  carve-out as web.

---

## Phase 3 — Group meetings end-to-end, caps + encrypted chat from the start

**Status: done, backend verified against a live local stack (schema build + resolver
reachability); web verified via a live rebuild/boot + typecheck/lint; mobile verified via
`flutter analyze`/`build apk --release`. No schema changes needed — all six RTC models
already existed from Phase 1.**

### Backend (`nest-js-boilerplate`)

- `src/rtc/rtc-meeting.service.ts` (new): the meeting lifecycle. `createMeeting` mints the
  LiveKit room immediately (unlike calls — no ringing phase, create-and-ready-on-create),
  persisting tier-derived `maxParticipants`/`maxDurationMinutes` at creation time so a later
  host-tier change never retroactively resizes an in-progress meeting. `joinMeeting`
  enforces the cap (`EX_MEETING_FULL`) only for a *new* participant — an already-active
  participant reconnecting (its `RtcParticipant` row has `leftAt: null`) always gets a fresh
  token without re-checking capacity, so a second device or a page refresh never
  double-counts against the cap. `leaveMeeting`/`endMeeting`/`removeMeetingParticipant`/
  `muteMeetingParticipant` round out host controls; `removeMeetingParticipant` calls
  LiveKit's `removeParticipant` (kicks the connection) and `muteMeetingParticipant` calls a
  new `LiveKitService.muteParticipantAudio` (LiveKit has no "mute by identity" call — it
  looks the participant's current audio track up via `getParticipant` first, then
  `mutePublishedTrack`s that specific track).
- **The meeting's own `RtcRoom.id`/`Meeting.id` never reach the client at all** — `slug` is
  the only client-facing handle (join link, WS chat-channel key, host-control target),
  deliberately avoiding the need for a new `MANUAL_ID_ALIASES` entry the way `callId` needed
  one in Phase 2. The WS chat channel is namespaced `rtc-meeting:${slug}` in
  `RealtimeGateway`'s shared `roomSockets` keyspace, per the plan's own explicit warning not
  to collide with a chat-room `Room.slug` there.
- `src/rtc/rtc-meeting-ws.gateway.ts` (new): registers `rtc:join-room-chat`/
  `rtc:leave-room-chat`/`rtc:chat-message` on the shared `RealtimeGateway`, exactly
  `MessagingWsGateway`'s join-room/room-message pattern. Meeting *lifecycle* (create/join/
  leave/end/host-controls) is GraphQL, not WS — only the chat channel rides the WS gateway.
- `src/rtc/rtc-meeting-sweep.service.ts` (new): the meeting duration cap, `@Interval`-based
  (not `@Cron`, matching this repo's own documented reason — `cron`'s date math can compute
  a negative delay across a clock jump; `tasks.service.ts` already established the
  precedent). A 30s full scan of active MEETING rooms, force-ending anything past
  `startedAt + maxDurationMinutes` — deliberately *more* robust than 1:1 calls' own
  per-replica `setTimeout`s (an accepted Phase 2 gap): any replica's tick can catch up an
  expired meeting, not just the one that "started" it, so this is the cross-replica
  mechanism Phase 2's own doc comment said Phase 3 would need to solve properly. A one-time
  warning frame (60s lead, mirroring the call warning) is deduped via a plain in-memory
  `Set` — accepted as possibly-duplicated-or-missed across replica restarts, same low-stakes
  tradeoff class as the call warning.
- `src/rtc/rtc-webhook.controller.ts` (modified): `handleRoomFinished`/`handleParticipantLeft`
  now also branch on `RtcRoomKind.MEETING` (previously only handled `CALL`), delegating to
  new `RtcMeetingService.handleRoomEndedByLiveKit`/`notifyParticipantLeftByLiveKit` — the
  same "LiveKit webhook is the authoritative departure signal" pattern calls established,
  now covering the case where every meeting participant's connection just drops without
  anyone clicking Leave/End.
- `src/rtc/rtc.resolver.ts` (rewritten): extended past the Phase 1 `rtcTierLimits` query with
  `myMeetings`/`meetingBySlug`/`meetingChatMessages` queries and `createMeeting`/
  `joinMeeting`/`leaveMeeting`/`endMeeting`/`removeMeetingParticipant`/
  `muteMeetingParticipant` mutations, plus two hand-rolled `@ObjectType`s
  (`JoinMeetingResult`, `RtcChatMessageView`/`RtcChatMessagesPage`) since those shapes don't
  match any generated Prisma model.
- Meeting chat reuses `StorageCryptoService.encryptForRtcRoom`/`decryptForRtcRoom` (already
  added in Phase 1, unused until now) — `{v, ct, nonce}` columns on `RtcChatMessage`, same
  shape as `RoomMessage`, never plaintext at rest.
- `src/rtc/livekit.service.ts` (modified): added `muteParticipantAudio` (see above).
- `src/rtc/rtc.module.ts`: registered `RtcMeetingService`/`RtcMeetingWsGateway`/
  `RtcMeetingSweepService`.
- **Verified**: `tsc --noEmit -p tsconfig.build.json` and scoped `eslint` clean on every
  new/changed file. Real bug caught before it shipped: a hand-rolled GraphQL `@ObjectType`
  field typed `string | null` (`RtcChatMessageView.senderAvatarUrl`) crashed the whole app
  at boot with `UndefinedTypeError` — NestJS GraphQL's reflection-based type inference can't
  resolve a nullable union automatically; fixed with an explicit `@Field(() => String, {
  nullable: true })`, matching the pattern the Phase-1-generated `RtcRoom.livekitRoomName`
  field already used. Caught by actually rebuilding and booting the real backend image (the
  container crash-looped) — `tsc`/`eslint` alone never would have caught it, since the error
  is a runtime GraphQL-schema-build failure, not a type error. After the fix: clean boot,
  `myMeetings` query round-trips through `SessionAuthGuard` correctly (proper 401 for an
  unauthenticated request, not a 500/schema error) confirming the resolver and its six new
  operations are wired end-to-end.

### Frontend (`next-js-boilerplate`)

- Meeting CRUD is GraphQL end-to-end (per the plan's own explicit call-out), but reaches
  the browser through the same REST-shaped Next.js BFF route-handler pattern the
  pre-existing `api-keys` feature already established — `src/app/api/rtc/meetings/**`
  (7 new route handlers) call `graphqlFetch` server-side and expose a plain REST surface;
  `src/lib/graphql/rtc.ts` holds the query/mutation strings. This is a different shape than
  Phase 2's calls REST (which hits `RtcController` directly, no GraphQL underneath) —
  documented explicitly since it's a real, deliberate branch in the "REST-via-BFF" judgment
  call, not an inconsistency.
- `src/hooks/rtc/useLiveKitMeetingRoom.ts` (new): the N-participant analog of Phase 2's
  `useLiveKitRoom` — the shape differs enough (a dynamic participant list vs. two fixed
  video elements) to warrant its own hook rather than generalizing that one. Never returns
  a DOM ref (same react-compiler lesson Phase 2 learned): each participant tile owns its
  own local `useRef`/`useEffect` `track.attach(el)`/`detach(el)` pair
  (`MeetingParticipantTile.tsx`), so the hook itself only ever returns LiveKit `Track`
  *objects* (SDK data, not React refs) plus plain state and toggle functions.
- `src/views/rtc/RtcMeetingRoomView.tsx` (new): join-on-mount, video grid, chat/participants
  tab panel, mic/camera/screen-share toggles, host-only mute/remove controls, end-meeting
  confirm dialog. Chat history seeds from a REST read
  (`meetingChatQueryOptions`/`meetingChatMessages`), then live messages append via the
  existing `rtc:*` WS vocabulary extended with `rtc:chat-message`/
  `rtc:meeting-participant-joined`/`-left`/`rtc:meeting-ended`/`rtc:meeting-removed`/
  `rtc:meeting-force-muted`/`rtc:meeting-limit-warning`.
- `src/views/rtc/RtcMeetingsListView.tsx` (new): "my meetings" (host-created only, matching
  the plan's own framing) + a create dialog; `src/views/rtc/RtcHubView.tsx` — the Meetings
  card is now a live link (Live stays "Coming soon").
- `next.config.ts`'s Permissions-Policy override (`/v1/:lang/rtc/:path*`, added in Phase 1)
  already covers the new `/rtc/meetings/**` routes — no change needed, confirmed by
  inspection before assuming otherwise.
- `messages/{en,tr}/rtc/messages.json` + regenerated `src/generated/i18n-messages*`: ~30 new
  keys for the meetings UI.
- **Verified**: `tsc --noEmit` and scoped `eslint` clean on every touched/new file. Two real
  lint-driven fixes: `react-hooks/set-state-in-effect` on a redundant `setPhase("joining")`
  call at the top of the join effect (the `useState` initializer already covers it — removed
  rather than suppressed, since an eslint-disable on any `react-hooks/*` rule stops
  react-compiler from optimizing the whole component, the same Phase 2 lesson); and a
  `realtime.status` read used directly as a `useEffect` dependency, which doesn't reliably
  re-fire on status transitions (the provider's plain object reference isn't guaranteed to
  change) — switched to the purpose-built `useRealtimeStatus()` hook this codebase already
  provides for exactly this. Rebuilt and booted the real Next.js image — `/v1/en/rtc/meetings`
  redirects (302) rather than erroring for an unauthenticated request, no server errors in
  the logs. Live two-browser meeting verification (3+ participants, screen-share, host
  mute-all/remove/end, the participant/duration caps actually firing, a direct `psql` read
  confirming `RtcChatMessage.ct` is ciphertext) is the user's to do by hand, same carve-out
  Phase 2 used for calls.

### Mobile (`flutter-boilerplate`)

- Meeting GraphQL calls go straight to `/graphql` via the shared `dioProvider` (no BFF layer
  on mobile, confirmed by mirroring the pre-existing `api_keys` feature's own Dart
  GraphQL-over-Dio pattern) — `lib/api/server/rtc/meetings_*.dart` (8 files, one per
  operation) + `lib/api/client/rtc/meetings_{actions,query,chat_live}.dart`.
- `lib/lib/realtime/realtime_provider.dart` (modified): six new `rtc:meeting-*`/
  `rtc:chat-message` cases in the central `handleEventFrame` switch — this app funnels
  every WS frame through one switch (no per-type `subscribe()` the way web has), so a
  page-scoped feature like a meeting room needs its live updates routed through provider
  state instead. `rtc:chat-message` patches `meetingChatProvider(slug)` (a
  `StateNotifierProvider.family` mirroring `roomMessagesProvider`'s own
  `appendLive`-on-a-`PaginatedListState` shape exactly), and the control signals
  (joined/ended/removed/force-muted/limit-warning) write into a new
  `lib/lib/rtc/meeting_signal.dart` family notifier — both guarded by `ref.exists(...)` so a
  frame for a meeting nobody's currently watching is a no-op, the same guard
  `room-message`'s existing case already uses.
- `lib/views/rtc/meeting_room_page_view.dart` (new): owns the LiveKit `Room` directly, same
  pattern as `RtcCallOverlay` (Phase 2) — connect on join, rebuild a plain `List` of
  participant views on every relevant `RoomEvent`, tear down on dispose. Two Dart-SDK
  surface differences from the JS SDK worth remembering: `videoTrackPublications`/
  `audioTrackPublications` are `List<T>`, not `Map`, and `isMicrophoneEnabled()`/
  `isCameraEnabled()`/`isScreenShareEnabled()` are methods, not getters. A manual two-button
  chat/participants toggle (`_tab` state + two `TextButton`s) is used instead of `TabBar`,
  which requires a `TabController`/`DefaultTabController` ancestor this page doesn't have.
- `lib/views/rtc/meetings_list_page_view.dart` (new) + `lib/views/rtc/page_view.dart`
  (modified): Meetings card now navigates to a real list + create-dialog page; Live stays
  "Coming soon". Router entries: `/v1/:lang/rtc/meetings` and `/v1/:lang/rtc/meetings/:slug`.
- `lib/l10n/app_{en,tr}.arb` + regenerated `app_localizations*.dart`: ~28 new `rtc*` keys.
- **Verified**: `flutter analyze` clean (whole project), `dart format` clean on every
  touched/new file, and `flutter build apk --release` — a real compile, not just an
  analyzer pass, catching anything analyzer-clean-but-uncompilable. Not installed/run on a
  real device in this pass — live multi-device meeting verification needs actual camera/mic
  hardware, same carve-out Phase 2 used for calls.

---

## Phase 4 — Live streaming end-to-end, go-live gated, chat encrypted from the start

**Status: done. Backend verified against a live local stack with a real GraphQL round trip
(FREE-tier `goLive` blocked, tier upgraded, `goLive` succeeds, a FREE-tier viewer joins
ungated, chat/discovery queries round-trip, a non-broadcaster is rejected from `endStream`,
the real broadcaster ends it, `psql` confirms every DB state transition). Web verified via a
live rebuild/boot + typecheck/lint. Mobile verified via `flutter analyze`/`build apk
--release`. No schema changes needed — `LiveStream` already existed from Phase 1.**

### Backend (`nest-js-boilerplate`)

- `src/rtc/rtc-stream.service.ts` (new): `goLive` creates the `RtcRoom`(STREAM) + LiveKit
  room and mints a publisher token in one call — unlike meetings' create-then-join split,
  going live IS joining as broadcaster, so there's no separate "join my own stream" step.
  `liveStreams()` lists `WHERE isLive ORDER BY startedAt DESC` (public discovery);
  `joinStreamAsViewer` mints a subscriber-only token (`canPublish: false`) and is completely
  ungated — every tier can watch. `endStream` is broadcaster-only. No duration cap exists
  for streams (unlike calls/meetings) — the plan never asked for one, and "going live" isn't
  a scarce resource the same way a call slot or a meeting seat is.
- **Viewer count is computed from LiveKit's own `listParticipants` at read time**
  (`LiveKitService.listParticipantCount`, already present since Phase 1), never from a
  Postgres count — `LiveStream.peakViewerCount` is a historical high-water mark only,
  updated opportunistically inside `joinStreamAsViewer` when the live count exceeds it. The
  broadcaster occupies one LiveKit participant slot too, so `getViewerCount` subtracts 1
  while `isLive` so "3 viewers" never silently includes the streamer. Exposed as a
  `@ResolveField(() => Int) viewerCount` on `RtcResolver` (`@Resolver(() => LiveStream)`,
  changed from a bare `@Resolver()` — the same shape `post.resolver.ts`'s
  `@Resolver(() => Post)` already uses, freely mixing root `Query`/`Mutation` fields with a
  type-scoped `@ResolveField`), reading `stream.room.livekitRoomName` off the already-loaded
  parent object — the id-codec's GraphQL schema transformer only rewrites a field's *return*
  value, never the `@Parent()` source it receives, so this sees the real internal room name
  regardless of what the client-facing `room.id`/`stream.id` fields get encrypted to.
- **`goLive` is gated `@UseGuards(TierGuard) @MinTier(MIN_TIER_TO_GO_LIVE)`** (already-existing
  MEDIUM constant from Phase 1's `rtc-tier-limits.constants.ts`, unused until now) — the
  exact `TierGuard`/`@MinTier` shape confirmed live at `post.resolver.ts:101-102` in earlier
  phases. `joinStreamAsViewer`/`liveStreams`/`streamBySlug` carry no such guard.
- **Stream chat reuses the meeting chat mechanism with zero new design cost**, exactly as the
  plan predicted — but the two services sharing the *same* `rtc:join-room-chat`/
  `rtc:leave-room-chat`/`rtc:chat-message` WS frame types (`RealtimeGateway.registerHandler`
  only allows one handler per frame type) meant Phase 3's `RtcMeetingWsGateway` couldn't
  simply be copied; it's renamed/broadened to `rtc-chat-ws.gateway.ts`'s `RtcChatWsGateway`,
  which calls *both* `RtcMeetingService` and `RtcStreamService` on every chat frame. This is
  safe because meeting slugs and stream slugs are two separate randomly-generated
  namespaces — each service's own `activeParticipant`/slug-lookup guard silently no-ops on a
  slug it doesn't own, so at most one of the two calls ever actually does anything.
- **New `src/rtc/rtc-chat.service.ts`**, extracted mid-phase after the meeting/stream chat
  methods showed up as real, flagged duplication (`sendChatMessage`/`joinRoomChat`/
  `getChatHistory`/`markParticipantLeft` were ~150 lines near-identical between the two
  services). Owns everything downstream of "I already know this is an active participant of
  `roomId`, addressed by this WS channel key" — encrypt-and-persist-and-broadcast a message,
  paginate-and-decrypt history, mark a participant left, and the generic half of the
  active-participant check (`isActiveParticipant(roomId, userId)`). Slug resolution stays in
  each domain service (a `Meeting` lookup vs. a `LiveStream` lookup genuinely differs).
  `RtcMeetingService`/`RtcStreamService` both take `RtcChatService` in their constructor now
  instead of `StorageCryptoService` directly.
- Also extracted while in the neighborhood: `RtcMeetingService.mustFindMeetingAsHost` — the
  "find meeting by slug, confirm caller is host, or throw" guard that `endMeeting`/
  `removeMeetingParticipant`/`muteMeetingParticipant` had each hand-copied.
- `src/rtc/rtc-webhook.controller.ts` (modified): `handleRoomFinished`/`handleParticipantLeft`
  now also branch on `RtcRoomKind.STREAM`, delegating to new
  `RtcStreamService.handleRoomEndedByLiveKit`/`notifyViewerLeftByLiveKit` — same
  webhook-is-authoritative pattern as calls/meetings. A dropped **broadcaster** connection
  does *not* end the stream via `participant_left` (mirrors meetings' host-leaves policy
  exactly) — only an explicit `endStream` or LiveKit's own empty/departure-timeout-driven
  `room_finished` ends it.
- `src/rtc/rtc.resolver.ts` (extended): `liveStreams`/`streamBySlug`/`streamChatMessages`
  queries, `goLive`/`joinStreamAsViewer`/`leaveStreamAsViewer`/`endStream` mutations, a
  shared `LiveStreamJoinResult` `@ObjectType` (`{token, roomName, stream}` — one type for
  both `goLive` and `joinStreamAsViewer` since the calling mutation already implies the
  caller's role, unlike `JoinMeetingResult`, which needs an explicit `role` field because one
  mutation serves both host and participant).
- `src/rtc/rtc.module.ts`: registered `RtcStreamService`/`RtcChatService`, renamed
  `RtcMeetingWsGateway` provider to `RtcChatWsGateway`.
- **Verified**: `tsc --noEmit` and scoped `eslint --fix` clean on every new/changed file (two
  real prettier findings auto-fixed, two `prefer-optional-chain` warnings left as warnings —
  pre-existing severity level in this repo's eslint config, not new). Rebuilt and booted the
  real backend image clean (`GraphQLModule` mapped `/graphql`, `Nest application successfully
  started`, no errors in logs — would have crash-looped on any resolver type error the same
  way Phase 3's `senderAvatarUrl` bug did). Then a full live GraphQL round trip against the
  running container: registered a FREE-tier test user, confirmed `goLive` correctly rejects
  with `EX_FORBIDDEN "Requires MEDIUM subscription or higher"`; promoted the user to MEDIUM
  via `psql` and re-logged-in (tier is snapshotted into the session at login, not re-read
  live, so a DB-only tier change needs a fresh login to take effect); `goLive` succeeded and
  minted a real LiveKit publisher token; registered a second FREE-tier user who joined as
  viewer with a subscriber-only token (`canPublish: false`), confirming viewing is genuinely
  ungated; `streamChatMessages` round-tripped correctly (empty — sending a message requires a
  real WS connection curl can't establish, same limitation Phase 3 accepted); the viewer was
  correctly rejected from `endStream` (`"Only the broadcaster can end this stream"`);
  `liveStreams` discovery correctly listed the stream while live and excluded it once ended;
  the real broadcaster's `endStream` succeeded and a direct `psql` read confirmed every state
  transition: `LiveStream.isLive → false` + `endedAt` set, `RtcRoom.state → ENDED` + its own
  `endedAt` set, and both the `BROADCASTER` and `VIEWER` `RtcParticipant` rows got `leftAt`
  populated by the bulk end.

### Frontend (`next-js-boilerplate`)

- Same GraphQL-via-BFF-route pattern Phase 3 established for meetings (not calls' direct-REST
  shape) — `src/app/api/rtc/streams/**` (7 new route handlers: list/go-live, `[slug]`,
  `[slug]/join`, `/leave`, `/end`, `/chat`) wrapping `graphqlFetch` calls;
  `src/lib/graphql/rtc.ts` gained the stream query/mutation strings + a shared `STREAM_FIELDS`
  fragment (mirrors `MEETING_FIELDS`) that includes `viewerCount`.
- `src/hooks/rtc/useLiveKitStreamRoom.ts` (new): the single-broadcaster analog of Phase 3's
  `useLiveKitMeetingRoom` — a stream has exactly one video that matters, never a per-viewer
  grid (every viewer that joins the LiveKit room *is* a `RemoteParticipant`, but none are
  ever rendered). `isLocalBroadcaster` picks whether "the broadcaster" is the local
  participant (go-live page, publish-capable token) or a remote one found by identity
  (viewer page, subscribe-only token) — one hook drives both pages. Same react-compiler-safe
  contract as the meeting hook: only ever returns `Track` objects and plain state, never a
  DOM ref — `src/components/rtc/StreamPlayer.tsx` owns its own local
  `useRef`/`useEffect` attach/detach pair, mirroring `MeetingParticipantTile`.
- `src/views/rtc/RtcGoLiveView.tsx` (new): wraps the actual form/live component
  (`RtcGoLiveForm`) in `<TierGate min="MEDIUM" fallback={<AccessDenied .../>}>` *inside* the
  client view, not in the server `page.tsx` — `AccessDenied`'s title/message/ctaLabel need
  `useMessages()` for localization, which a server component can't call directly. One page,
  two phases (setup form → live broadcasting view) instead of a second route — going live
  and managing the live stream are the same continuous session, so there's no
  refresh-resilience gap to design around the way calls/meetings' overlay-vs-route tradeoff
  (Open judgment call 6) has to.
- `src/views/rtc/RtcLiveViewerView.tsx` (new): join-on-mount, single video player, chat panel,
  live viewer-count updates via `rtc:stream-viewer-joined`/`-left`, `rtc:stream-ended`
  handling. If the joining user turns out to be the stream's own broadcaster (checked against
  `stream.broadcaster.id`), shows an "this is your own stream" notice with a link to the
  go-live management page instead of opening a second LiveKit connection under the same
  identity.
- `src/views/rtc/RtcLiveDiscoveryView.tsx` (new): a card grid (`liveStreams` query),
  broadcaster avatar/name, live viewer-count badge, a "Go live" button linking to
  `/rtc/live/go-live`. `src/views/rtc/RtcHubView.tsx` — the Live card is now a live link too
  (all three RTC sections are live as of this phase).
- `next.config.ts`'s Permissions-Policy override (`/v1/:lang/rtc/:path*`, added in Phase 1)
  already covers `/rtc/live/**` — confirmed by inspection, no change needed, same as Phase 3.
- `messages/{en,tr}/rtc/messages.json` + regenerated `src/generated/i18n-messages*`: ~20 new
  keys for the live-streaming UI.
- **Verified**: `tsc --noEmit` and scoped `eslint --fix` clean on every new/changed file (one
  real fix: a `Badge` `variant="destructive"` that doesn't exist on this component's variant
  union — corrected to `"error"`, the closest match already in `BadgeVariant`). Rebuilt and
  booted the real Next.js image clean (production `next build` succeeded, which — unlike a
  bare `tsc --noEmit` — also runs Next's own static analysis/route generation over every new
  page). Live multi-viewer stream verification (screen-share, real camera/mic hardware, the
  viewer-count badge updating live in two real browser tabs) is the user's to do by hand,
  same carve-out Phase 2/3 used.

### Mobile (`flutter-boilerplate`)

- `lib/types/rtc/stream.dart` + `lib/api/server/rtc/stream_fields.dart` +
  `lib/api/server/rtc/streams_{list,go_live,get,join,leave,end,chat}.dart` (8 files) +
  `lib/api/client/rtc/streams_{actions,query,chat_live}.dart` — exact mirror of the meeting
  Dart layer's shape, GraphQL-over-Dio straight to `/graphql` (no BFF on mobile, same as
  Phase 3).
- `lib/lib/realtime/realtime_provider.dart` (modified): the existing `rtc:chat-message` case
  now tries *both* `meetingChatProvider(slug)` and `streamChatProvider(slug)` (each guarded
  by its own `ref.exists`, same reasoning as the backend's `RtcChatWsGateway` — the two are
  separate slug namespaces, so at most one ever matches). Three new cases —
  `rtc:stream-ended`, `rtc:stream-viewer-joined`/`-left` — write into a new
  `lib/lib/rtc/stream_signal.dart` family notifier (`StreamSignal{seq, ended, viewerCount}`),
  the stream analog of `MeetingSignal`.
- `lib/views/rtc/go_live_page_view.dart` (new): `RtcGoLivePageContent` wraps the actual form
  (`_RtcGoLiveForm`) in this app's own `TierGate` widget (`lib/lib/tier_view.dart` —
  `allowedTiers: const [Tier.medium, Tier.premium]`, `freeWidget: _RtcGoLiveForm(...)` reused
  as the fallback slot for the medium tier too since no `mediumWidget` is given; a tier
  outside `allowedTiers` falls through to the widget's own built-in, non-localized
  `_UpgradePrompt` — a pre-existing limitation of this widget, not something this phase
  introduced). `_RtcGoLiveForm` owns the LiveKit `Room` directly (publisher token, camera
  preview via `VideoTrackRenderer`), same pattern as `meeting_room_page_view.dart`.
- `lib/views/rtc/live_viewer_page_view.dart` (new): `RtcLiveViewerPageContent` owns its own
  `Room` (subscriber token), finds the broadcaster's video by matching `Participant.identity`
  against `stream.broadcaster.id` rather than rendering every remote participant — a stream
  has exactly one video that matters, same reasoning as the web hook.
- `lib/views/rtc/live_discovery_page_view.dart` (new) + `lib/views/rtc/page_view.dart`
  (modified): Live card now navigates to a real discovery list instead of "Coming soon" — all
  three RTC hub cards are live as of this phase. Router entries: `/v1/:lang/rtc/live`,
  `/v1/:lang/rtc/live/go-live`, `/v1/:lang/rtc/live/:slug` (declared in that order —
  `go-live`'s static segment must be registered before the dynamic `:slug` sibling, same
  precedent as `meetings` before `meetings/:slug`).
- `lib/l10n/app_{en,tr}.arb` + regenerated `app_localizations*.dart`: ~17 new `rtc*` keys.
  `flutter gen-l10n` infers a placeholder method (`String rtcViewerCount(Object count)`) from
  `{count}` in the message even with no explicit `@rtcViewerCount` metadata block — confirmed
  by checking `rtcMeetingLimitWarning`'s own generated signature from Phase 2 before assuming
  the simpler ARB entry would work.
- **Verified**: `flutter analyze` clean (whole project, after fixing two lints this phase's
  own change to `page_view.dart` surfaced — the RTC hub's `sections` tuple list no longer has
  any `null` route now that Live is live too, so Dart narrowed the tuple's route field from
  `String?` to `String`, making the old `route != null`/`route == null` branches statically
  dead; simplified rather than suppressed), `dart format` clean on every touched/new file, and
  `flutter build apk --release` — a real compile (124.9MB), not just an analyzer pass. Not
  installed/run on a real device — live multi-device stream verification needs actual
  camera/mic hardware, same carve-out Phase 2/3 used.
