# RTC (backend)

**Source:** [`nest-js-boilerplate/src/rtc/`](../../../../nest-js-boilerplate/src/rtc/) ·
**Category:** [Messaging & Realtime](../README.md) · **Endpoints:** [endpoints.md](./endpoints.md)

Three real-time audio/video products on one self-hosted [LiveKit](https://livekit.io) SFU, plus the
shared machinery underneath them:

| Product | Lifecycle surface | Room shape |
|---|---|---|
| **1:1 calls** | WebSocket frames (`rtc:invite` → `rtc:ringing` → `rtc:accept`/`rtc:reject`/`rtc:cancel` → `rtc:hangup`) — ringing is inherently push-driven | Exactly 2 participants, ends the moment either side genuinely leaves |
| **Group meetings** | GraphQL mutations (create/join/leave/end + host controls), slug-addressed join links | Tier-capped participant count + duration, host role |
| **Live streams** | GraphQL mutations (goLive/joinStreamAsViewer/…), public discovery list | One broadcaster, unlimited viewers; going live is tier-gated (`MEDIUM`+), watching is free |

All three share: an [encrypted-at-rest room chat](#room-chat), abuse **reports**, **recording**
scaffolding (persisted intent, no real egress yet), and **tier-scaled limits**. Added after the
original docs pass (RTC phases 1–4 + a hardening pass, commits `85374f42`…`8bc54f55`); this doc
covers the post-hardening state.

## File map

| File | Role |
|---|---|
| [`rtc.module.ts`](../../../../nest-js-boilerplate/src/rtc/rtc.module.ts) | Wires everything below; imported by `app.module.ts` `CORE_MODULES` (a real, always-on module) |
| [`livekit.service.ts`](../../../../nest-js-boilerplate/src/rtc/livekit.service.ts) | The only file that talks to LiveKit's server API: room create/delete, access-token minting, participant lookup/mute/remove, webhook signature verification. Also owns `toLivekitIdentity`/`fromLivekitIdentity` and `toLivekitRoomName` — see [Identity & room-name encryption](#identity--room-name-encryption) |
| [`rtc-call.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-call.service.ts) | 1:1 call state machine (`CallSession.state`: RINGING → CONNECTED → ENDED/REJECTED/MISSED/CANCELLED), ring timeout (45s → MISSED), tier duration cap timers, and the [`participant_left` grace window](#the-participant_left-grace-window) |
| [`rtc-call-ws.gateway.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-call-ws.gateway.ts) | Registers the 5 client→server call frames on the shared [RealtimeGateway](../realtime/README.md) — no new socket server; also the disconnect hook that ends a call when its socket dies |
| [`rtc-meeting.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-meeting.service.ts) | Meeting lifecycle: atomic RtcRoom+Meeting create, slug join with capacity lock, host invite (notification + email), host controls (mute/remove/end), participant summaries for the list UI |
| [`rtc-meeting-sweep.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-meeting-sweep.service.ts) | 30s `@Interval` scan force-ending meetings past their tier duration cap (+ a one-time 60s-warning frame). A DB scan, not per-meeting timers, so it survives replica restarts |
| [`rtc-stream.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-stream.service.ts) | Live-stream lifecycle: tier-gated goLive, viewer join/leave (live viewer counts from non-departed `VIEWER` participant rows — LiveKit's list lags the join mutation), the client-safe watcher list, peak-viewer tracking, discovery list |
| [`rtc-chat.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-chat.service.ts) | The shared room-chat engine (meetings + streams): persistence via [StorageCryptoService](../wire-crypto/README.md) (`encryptForRtcRoom`), history pagination, `isActiveParticipant` guard |
| [`rtc-chat-ws.gateway.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-chat-ws.gateway.ts) | Registers the 3 shared chat frames (`rtc:join-room-chat`/`rtc:leave-room-chat`/`rtc:chat-message`); meetings and streams share the frame types, each service no-ops on slugs that aren't its own |
| [`rtc-webhook.controller.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-webhook.controller.ts) | LiveKit → backend lifecycle sync (`room_started`/`room_finished`/`participant_joined`/`participant_left`), authenticated by LiveKit's signed `Authorization` header — see [Webhook lifecycle](#webhook-lifecycle) |
| [`rtc.controller.ts`](../../../../nest-js-boilerplate/src/rtc/rtc.controller.ts) | The module's only client-facing REST: call history + active-call recovery |
| [`rtc.resolver.ts`](../../../../nest-js-boilerplate/src/rtc/rtc.resolver.ts) | All meeting/stream/report/recording GraphQL operations + `rtcTierLimits`; also `RtcMeetingResolver` (the `Meeting.participants` summary field) |
| [`rtc-report.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-report.service.ts) | Persists `RtcReport` rows (call/meeting/stream, reason enum + free text). Write-only for now — no review UI reads them yet |
| [`rtc-recording.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-recording.service.ts) | ⚠ Scaffolding only (its own doc-comment says so): start/stop persist an `RtcRecording` row but never launch a LiveKit Egress — `egressId`/`fileUrl` stay null. The UI surfaces this as a "coming soon" note |
| [`rtc-tier-limits.constants.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-tier-limits.constants.ts) | Every tier number in one file — see [Tier limits](#tier-limits) |
| [`rtc-error.interceptor.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-error.interceptor.ts) | Maps service exceptions onto the GraphQL error shape the web BFF's status mapping expects |
| [`rtc-logger.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-logger.ts) | `rtcLog`/`rtcErrorLog` — structured `category: "rtc"` log lines (queryable in `backend-logs`, see the root `AGENTS.md` log section) |

## LiveKit infrastructure

- **Server:** `livekit/livekit-server:v1.13.6` in the root
  [`docker-compose.yml`](../../../../docker-compose.yml) — **host networking** (its 10k-port UDP
  media range can't be bridge-mapped), so it reaches other services via `localhost:<host port>`.
  v1.8 was too old for livekit-client 2.x's data-track negotiation (every publisher fell into a
  full reconnect 15s after joining) — the version comment in compose documents this.
- **Config:** [`nest-js-boilerplate/docker/livekit/livekit.yaml`](../../../../nest-js-boilerplate/docker/livekit/livekit.yaml) —
  note `ips.excludes: ["172.16.0.0/12"]`: with host networking LiveKit would otherwise advertise
  every Docker bridge as an ICE candidate, causing constant ICE flapping in live calls.
- **Backend env:** `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` / `LIVEKIT_HTTP_URL`
  ([`livekit.service.ts#L86-L99`](../../../../nest-js-boilerplate/src/rtc/livekit.service.ts)).
  Clients get the socket URL separately (web: `NEXT_PUBLIC_LIVEKIT_URL`; mobile: its `.env`).
- **Flow:** the backend mints a signed access token per join (grants scoped to one room; calls also
  cap `maxParticipants: 2`); the client connects **directly** to LiveKit with that token — media
  never touches NestJS.

## Identity & room-name encryption

LiveKit identities and room names ride the signed client token, the client's `Room` object, and
every webhook/log line — so raw database uuids there would undo the
[id-codec](../../platform-core/common/id-codec/README.md) transport encryption. Therefore:

- `toLivekitIdentity(userId)` = the id-codec's deterministic `encryptId()` — the **same** value the
  client already knows as the user's public id, which is what lets the web/mobile UI match LiveKit
  participants against chat senders and the meeting host.
- `toLivekitRoomName(kind, rawId)` = `` `${kind}-${encryptId(rawId)}` `` (`call-…`/`meeting-…`/
  `stream-…`). Room names are only resolved back to rows via the `RtcRoom.livekitRoomName` column,
  never parsed.
- Webhooks decrypt inbound identities via `fromLivekitIdentity()` (tolerating pre-encryption
  identities from older live sessions); `RtcParticipant.livekitIdentity` stores the **raw** userId.

## Webhook lifecycle

`POST /rtc/webhook/livekit` keeps Postgres in sync with what the SFU actually did
([`rtc-webhook.controller.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-webhook.controller.ts)):

| Event | Effect |
|---|---|
| `room_started` | `RtcRoom` → ACTIVE + `startedAt` — but **only if not already ENDED** (a reconnecting client racing teardown makes LiveKit auto-recreate the room; that zombie must not resurrect the row) |
| `participant_joined` | Clears `leftAt` on the participant's row — livekit-client's full reconnect is a leave+rejoin, and the rejoin must undo the leave's stamp |
| `participant_left` | Stamps `leftAt`; for CALL rooms triggers the grace window below; for MEETING/STREAM rooms notifies remaining peers (so a hard-crashed participant isn't silently stuck on screen) |
| `room_finished` | Kind-specific safety net (`handleRoomEndedByLiveKit`) for whenever nothing else ended the session — idempotent, guarded by each kind's own state column |

### The `participant_left` grace window

livekit-client recovers a broken connection with a **full reconnect** — it sends a LeaveRequest and
rejoins the same room ~40ms later, and LiveKit dutifully fires `participant_left` for the old
session. Ending a 1:1 call on that webhook alone destroyed healthy calls mid-reconnect. So
[`RtcCallService.handlePeerLeft`](../../../../nest-js-boilerplate/src/rtc/rtc-call.service.ts)
first probes LiveKit (`isParticipantConnected`) and, if the user is genuinely absent, starts a
**10s grace timer** (`PEER_LEFT_GRACE_SECONDS`, kept under the room's own 15s `departureTimeout`);
the call ends only if the participant is still gone after the window. A rejoin cancels teardown.

## Tier limits

All in [`rtc-tier-limits.constants.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-tier-limits.constants.ts);
exposed to clients pre-flight via the `rtcTierLimits` query.

| Limit | FREE | BASIC | MEDIUM | PREMIUM | Applied against |
|---|---|---|---|---|---|
| Call duration (min) | 10 | 25 | 45 | 120 | **MIN(caller tier, callee tier)** — product-set values (2026-08-28), deliberately *not* on the ×1/2/4/8 convention |
| Meeting participants | 4 | 8 | 16 | 32 | Host's tier (4 × multiplier) |
| Meeting duration (min) | 40 | 80 | 160 | 320 | Host's tier (40 × multiplier); enforced by the sweep |
| Go live | ✗ | ✗ | ✓ | ✓ | Broadcaster's tier (`MIN_TIER_TO_GO_LIVE = MEDIUM`); *watching* is free for every tier |

Both call parties get a warning frame 60s before the cap (`rtc:call-limit-warning`); meetings get
`rtc:meeting-limit-warning` from the sweep.

## Room chat

Meetings and streams share one chat engine
([`rtc-chat.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-chat.service.ts)): messages are
encrypted at rest via [StorageCryptoService](../wire-crypto/README.md)'s `encryptForRtcRoom` before
the `RtcChatMessage` insert and decrypted server-side for history/delivery. Live fan-out rides the
shared [RealtimeGateway](../realtime/README.md)'s room-broadcast primitive on channel
`rtc-meeting:<slug>` / `rtc-stream:<slug>` (prefixed so they can never collide with chat-room
`Room.slug`s in the same keyspace). Every chat op is guarded by `isActiveParticipant`
(participant row with `leftAt: null`).

## Client-safe participant summaries (PII contract)

`Meeting.participants` (GraphQL) returns `MeetingParticipantSummary` — a deliberately narrow shape
(`userId`, resolved display `name`, `hideAvatar`-filtered `avatarUrl`, `role`, `joinedAt`,
`leftAt`) instead of the generated `RtcParticipant`/`User` pair, because meeting attendees are
arbitrary users. `myMeetings` preloads the rows N+1-free but re-keys them onto a
**schema-invisible** `participantRows` property
([`rtc-meeting.service.ts` § `myMeetings`](../../../../nest-js-boilerplate/src/rtc/rtc-meeting.service.ts)):
leaving them on `room.participants` would expose co-attendee `user.email`, un-filtered `avatarUrl`,
and the raw-uuid `livekitIdentity` column through the generated `RtcRoom.participants` GraphQL
field. Keep that invariant when touching the query.

## Prisma models

`RtcRoom` (the kind-agnostic hub: kind/state/livekitRoomName/startedAt/endedAt), `RtcParticipant`,
`CallSession`, `Meeting`, `LiveStream`, `RtcChatMessage`, `RtcReport`, `RtcRecording` — schema at
[`prisma/schema.prisma#L1083-L1256`](../../../../nest-js-boilerplate/prisma/schema.prisma) and the
reverse index in [docs/schema.md § RTC](../../../schema.md#rtc-calls-meetings-live-streams).

## Used by

| App | Docs |
|---|---|
| Frontend | [frontend/v1/rtc/](../../../frontend/v1/rtc/README.md) — hub, calls, meetings, live; global call overlay + provider in the app shell |
| Mobile | [mobile/v1/rtc/](../../../mobile/v1/rtc/README.md) — same verticals, direct-GraphQL call shape |

## Known issues

- Recording is scaffolding only (see the file-map row above) — the API/DB/UI seam exists, no LiveKit
  Egress is ever launched.
- `RtcReport` rows have no review/admin UI yet (write-only surface).
