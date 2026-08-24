# RTC suite — 1:1 calls, group meetings, live streaming

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
2. **1:1 calls end-to-end, tier-capped from the start** — not started.
3. **Group meetings end-to-end, caps + encrypted chat from the start** — not started.
4. **Live streaming end-to-end, go-live gated, chat encrypted from the start** — not started.
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
4. Meeting caps are keyed to the host's tier only.
5. Ring-timeout value (45s, ported from the reference repo's own client-side convention)
   and the `MISSED` call-end state — not yet exercised by code (Phase 2).
6. No dedicated route for an active 1:1 call (global overlay, no URL) — planned for
   Phase 2's `IncomingCallModal`/`IncomingCallDialog`.
7. Meeting-host-leaves policy: "meeting continues, no ownership transfer" — Phase 3.
8. REST-via-BFF as the frontend's authoritative integration path, GraphQL secondary —
   Phase 2+.
9. Meeting duration-cap enforcement mechanism (periodic sweep vs. a possible native
   LiveKit per-room max-duration config) — needs an implementation-time check against the
   pinned `livekit/livekit-server:v1.8` image before Phase 3 commits to the sweep-only
   design.
