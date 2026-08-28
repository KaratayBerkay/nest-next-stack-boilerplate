# RTC — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/rtc/`](../../../../nest-js-boilerplate/src/rtc/)

Three interface shapes, split by product (see the README's product table): **1:1 call signaling is
WebSocket frames**, **meeting/stream lifecycle is GraphQL**, and **REST exists only for call
history/recovery reads plus the LiveKit webhook**. Web reaches everything through its BFF
([frontend rtc api.md](../../../frontend/v1/rtc/api.md)); mobile posts GraphQL directly and hits the
two REST reads directly ([mobile rtc api.md](../../../mobile/v1/rtc/api.md)).

## REST

**Auth:** `SessionAuthGuard` on [`rtc.controller.ts`](../../../../nest-js-boilerplate/src/rtc/rtc.controller.ts)
(base path `/api/rtc`). The webhook authenticates differently — see its entry.

### Get call history

**Kind:** REST · **`GET /api/rtc/calls`** · query `before?` (cursor), `take?` (default 30, clamped 1–100)
**Source:** [`rtc.controller.ts#L25-L40`](../../../../nest-js-boilerplate/src/rtc/rtc.controller.ts)
**Response:** paginated 1:1 call rows for the caller — peer summary, direction, `hasVideo`, state
(`ENDED`/`MISSED`/`REJECTED`/`CANCELLED`), `ringingAt`/`acceptedAt`/`endedAt`.
**Used by:** Web [calls page](../../../frontend/v1/rtc/calls/page.md) via
[`api/server/rtc/call-history.ts`](../../../../next-js-boilerplate/src/api/server/rtc/call-history.ts)
(BFF catch-all `app/api/rtc/[...path]/route.ts`) · Mobile
[`api/server/rtc/call_history.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/call_history.dart)
(direct REST — no BFF hop).

### Get active call snapshot

**Kind:** REST · **`GET /api/rtc/calls/active`**
**Source:** [`rtc.controller.ts#L42-L53`](../../../../nest-js-boilerplate/src/rtc/rtc.controller.ts)
**Response:** `{ call: ActiveCallSnapshot | null }` — any call currently ringing (as callee) or
connected for the caller, including the LiveKit token/room and `maxDurationMinutes`. The recovery
path for a client that (re)connected and missed the point-in-time `rtc:invite`/`rtc:accepted` push.
**Used by:** Web [`RtcCallProvider`](../../../../next-js-boilerplate/src/lib/rtc/RtcCallProvider.tsx)
on mount/reconnect via [`api/server/rtc/active-call.ts`](../../../../next-js-boilerplate/src/api/server/rtc/active-call.ts) ·
Mobile [`rtc_call_provider.dart`](../../../../flutter-boilerplate/lib/lib/rtc/rtc_call_provider.dart)
via [`active_call.dart`](../../../../flutter-boilerplate/lib/api/server/rtc/active_call.dart) (direct REST).

### Receive LiveKit lifecycle webhook

**Kind:** REST · **`POST /rtc/webhook/livekit`** — *not* under `/api`, and no session
**Source:** [`rtc-webhook.controller.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-webhook.controller.ts)
**Auth:** LiveKit's signed `Authorization` header, verified via `verifyWebhookEvent` (same pattern
as Stripe's webhook controller); 1 MB body cap.
**Handles:** `room_started` / `room_finished` / `participant_joined` / `participant_left` — see
[README.md § Webhook lifecycle](./README.md#webhook-lifecycle).
**Used by:** the LiveKit server only (`webhook.urls` in
[`livekit.yaml`](../../../../nest-js-boilerplate/docker/livekit/livekit.yaml)).

## WebSocket events (client→server)

All ride the shared [realtime gateway](../realtime/endpoints.md)'s authenticated socket — there is
no separate RTC socket. Registered by
[`rtc-call-ws.gateway.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-call-ws.gateway.ts) (calls)
and [`rtc-chat-ws.gateway.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-chat-ws.gateway.ts)
(room chat).

| Frame | Payload | Effect |
|---|---|---|
| `rtc:invite` | `calleeId`, `hasVideo` | Start a 1:1 call: creates `RtcRoom`+`CallSession` (RINGING), LiveKit room `call-<enc id>`, mints both tokens, pushes `rtc:ringing` to callee + `rtc:invite`-ack to caller; 45s ring timeout → MISSED. Duration cap = MIN(caller, callee) tier |
| `rtc:accept` | `callId` | Callee accepts: state → CONNECTED, both sides get `rtc:accepted` (LiveKit token/room + `maxDurationMinutes`), cap timers start |
| `rtc:reject` | `callId` | Callee declines → `rtc:rejected` to caller, state REJECTED |
| `rtc:cancel` | `callId` | Caller cancels the ring → `rtc:cancelled` to callee, state CANCELLED |
| `rtc:hangup` | `callId` | Either side ends a connected call → `rtc:hangup` to the peer, state ENDED, LiveKit room deleted |
| `rtc:join-room-chat` | `slug` | Subscribe this socket to a meeting **or** stream chat channel (both services try the slug; the non-owner no-ops) |
| `rtc:leave-room-chat` | `slug` | Unsubscribe (in-memory socket bookkeeping only) |
| `rtc:chat-message` | `slug`, `text` | Persist (encrypted at rest) + broadcast `rtc:chat-message` to the channel; sender must be an active (`leftAt: null`) participant |

A socket **disconnect** also ends any call it was signaling for (the gateway's
`registerDisconnectHandler` → `RtcCallService.handleDisconnect`).

## WebSocket events (server→client)

Pushed through the same shared socket. Call frames target the two parties directly; meeting/stream
frames broadcast to the `rtc-meeting:<slug>` / `rtc-stream:<slug>` channel.

| Frame | To | Meaning / payload highlights |
|---|---|---|
| `rtc:ringing` | callee | Incoming call: caller summary, `callId`, `hasVideo` |
| `rtc:invite` (ack) | caller | Your outgoing call is ringing (`callId`) |
| `rtc:accepted` | both | Call is live: LiveKit `token`+`roomName`, `maxDurationMinutes` |
| `rtc:rejected` / `rtc:cancelled` / `rtc:missed` / `rtc:hangup` | the other party | Terminal transitions of the ring/call lifecycle |
| `rtc:call-limit-warning` | both | 60s before the tier duration cap |
| `rtc:error` | sender | Stable snake_case `reason` codes for a failed frame (mapped to copy client-side) |
| `rtc:meeting-participant-joined` / `-left` | meeting channel | Roster deltas — `-left` also fires from the webhook path so hard-crashed participants disappear |
| `rtc:meeting-force-muted` | target participant | Host muted you (server-enforced via LiveKit mute) |
| `rtc:meeting-removed` | target participant | Host removed you (client shows the removed screen, must not auto-rejoin) |
| `rtc:meeting-limit-warning` / `rtc:meeting-ended` | meeting channel | Sweep warning; meeting over (host end, sweep force-end, or LiveKit room_finished) |
| `rtc:stream-viewer-joined` / `-left` | stream channel | Viewer roster + **live `viewerCount`** (both directions carry the count; clients ignore frames without one) |
| `rtc:stream-ended` | stream channel | Broadcast over |
| `rtc:chat-message` | room channel | A chat message (decrypted server-side for delivery) |

**Client subscribers:** web [`RtcCallProvider`](../../../../next-js-boilerplate/src/lib/rtc/RtcCallProvider.tsx)
(call frames), [`useRoomChat`](../../../../next-js-boilerplate/src/hooks/rtc/useRoomChat.ts) +
[`useStreamViewerCount`](../../../../next-js-boilerplate/src/hooks/rtc/useStreamViewerCount.ts)
(room frames); mobile [`rtc_call_provider.dart`](../../../../flutter-boilerplate/lib/lib/rtc/rtc_call_provider.dart),
[`meeting_signal.dart`](../../../../flutter-boilerplate/lib/lib/rtc/meeting_signal.dart),
[`stream_signal.dart`](../../../../flutter-boilerplate/lib/lib/rtc/stream_signal.dart),
[`meetings_chat_live.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/meetings_chat_live.dart) /
[`streams_chat_live.dart`](../../../../flutter-boilerplate/lib/api/client/rtc/streams_chat_live.dart).

## GraphQL

All on [`rtc.resolver.ts`](../../../../nest-js-boilerplate/src/rtc/rtc.resolver.ts) —
`SessionAuthGuard` + `RtcErrorInterceptor` class-level. Web reaches every operation through its BFF
routes (`app/api/rtc/**`); mobile posts `/graphql` directly. Per-operation "Used by" is therefore
recorded once in each app's rtc `api.md`
([frontend](../../../frontend/v1/rtc/api.md) · [mobile](../../../mobile/v1/rtc/api.md)) rather than
repeated on all ~28 entries below.

### Get my RTC tier limits

**Kind:** GraphQL Query · **`rtcTierLimits`**
**Response:** `{ tier, callMaxDurationMinutes, meetingMaxParticipants, meetingMaxDurationMinutes,
canGoLive }` — the caller's own best case (the binding call cap is computed at accept-time against
the *other* party's tier too). Values: [README.md § Tier limits](./README.md#tier-limits).

### Meetings

| Operation | Kind | Behavior |
|---|---|---|
| `myMeetings` | Query | Last 50 meetings the caller **hosted or attended**, newest-first, with participants preloaded for the list UI (re-keyed off the GraphQL-visible relation — see [README.md § PII contract](./README.md#client-safe-participant-summaries-pii-contract)) |
| `meetingBySlug(slug)` | Query | Nullable single-meeting read |
| `meetingChatMessages(slug, before?, take?)` | Query | Paginated chat history — 403s until the caller has a participant row (clients gate the fetch on join) |
| `createMeeting(title)` | Mutation | Atomic `RtcRoom`+`Meeting` create (PENDING) → LiveKit room create → ACTIVE. Caps snapshot the host's tier at create time |
| `joinMeeting(slug)` | Mutation | Capacity-locked join (row lock + count vs `maxParticipants`), returns `{ token, roomName, role, meeting }`; host relation always loaded (GraphQL `Meeting.host` is non-nullable) |
| `inviteToMeeting(slug, userId)` | Mutation | Any **active participant or the host** (host may invite before their own join lands — the create-dialog flow) → in-app notification + fire-and-forget [`meeting-invite` email](../../platform-core/mail/README.md) |
| `leaveMeeting(slug)` | Mutation | Stamps own `leftAt` + notifies channel |
| `endMeeting(slug)` | Mutation | Host-only; backfills every open `leftAt`, broadcasts `rtc:meeting-ended`, deletes the LiveKit room |
| `removeMeetingParticipant(slug, userId)` / `muteMeetingParticipant(slug, userId, muted)` | Mutation | Host controls — enforced server-side through LiveKit (`removeParticipant` / track mute), plus the targeted WS frames above |
| `Meeting.participants` | ResolveField | `[MeetingParticipantSummary]` (separate `RtcMeetingResolver` class) — the client-safe attendee list |

### Live streams

| Operation | Kind | Behavior |
|---|---|---|
| `liveStreams` | Query | Public discovery list of currently-live streams (broadcaster summary + `viewerCount`) |
| `streamBySlug(slug)` | Query | Nullable single-stream read |
| `streamChatMessages(slug, before?, take?)` | Query | Chat history (participant-gated like meetings) |
| `goLive(title)` | Mutation | Tier-gated (`MEDIUM`+): creates room + `LiveStream`, returns broadcaster token |
| `joinStreamAsViewer(slug)` | Mutation | Viewer join: participant upsert + viewer-count broadcast + subscribe-only token. **Broadcaster-safe:** the broadcaster opening their own viewer page skips all viewer side effects (their participant row is what keeps their chat alive) |
| `leaveStreamAsViewer(slug)` | Mutation | Stamps viewer `leftAt` + broadcasts the new count (no-op for the broadcaster) |
| `endStream(slug)` | Mutation | Broadcaster-only; idempotent (a double-end or a race with LiveKit's own room_finished no-ops) |
| `LiveStream.viewerCount` | ResolveField | Live LiveKit participant count minus the broadcaster |

### Reports

`reportCall(callId, reason, details?)` · `reportMeeting(slug, …)` · `reportStream(slug, …)` — all
**Mutation → `RtcReport`**, reason enum `HARASSMENT | SPAM | INAPPROPRIATE_CONTENT | OTHER`, backed
by [`rtc-report.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-report.service.ts).
Write-only for now (no review UI — see [README.md § Known issues](./README.md#known-issues)).

### Recordings

`meetingRecording(slug)` / `streamRecording(slug)` (Query, nullable) ·
`start|stopMeetingRecording(slug)` / `start|stopStreamRecording(slug)` (Mutation) — host/broadcaster
gated. ⚠ **Scaffolding**: rows persist intent but no LiveKit Egress ever runs; `egressId`/`fileUrl`
stay null ([`rtc-recording.service.ts`](../../../../nest-js-boilerplate/src/rtc/rtc-recording.service.ts)).
Client UIs label the feature "coming soon" accordingly.
