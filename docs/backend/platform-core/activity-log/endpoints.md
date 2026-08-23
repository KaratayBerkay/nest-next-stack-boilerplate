# Activity log — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/activity-log/`](../../../../nest-js-boilerplate/src/activity-log/)

## REST

Base path: none (`@Controller('activity-logs')` — see
[`activity-log.controller.ts`](../../../../nest-js-boilerplate/src/activity-log/activity-log.controller.ts)).
**Auth:** [`OptionalAuthGuard`](./README.md#auth-is-optional-not-required) on the whole controller —
never rejects; attaches `req.user` when a valid session is present, proceeds anonymously otherwise.

### Log client activity events

**Kind:** REST · **`POST /activity-logs`**
**Source:** [`activity-log.controller.ts#L19-L23`](../../../../nest-js-boilerplate/src/activity-log/activity-log.controller.ts),
DTO [`log-activity.dto.ts`](../../../../nest-js-boilerplate/src/activity-log/dto/log-activity.dto.ts)
**Request body** (`LogActivityDto`):

```jsonc
{
  "events": [{                      // 1-50 items
    "eventType": "page_view",       // required, 1-128 chars
    "clientSessionId": "abc123",    // required, 1-64 chars — client-generated, not the server session id
    "timestamp": "2026-08-23T00:00:00.000Z",
    "category": "page",             // optional, one of: session|page|http-exception|application-exception|network|database|performance
    "event": "...", "userId": "...", "url": "...", "userAgent": "...",
    "page": "...", "durationMs": 0, "platform": "ios",
    "exceptionType": "CLIENT_ERROR", // optional, one of: CLIENT_ERROR|CLIENT_REJECTION|CLIENT_REQUEST_ERROR
    "metadata": { "any": "object" }
  }]
}
```

**Response:** `202 Accepted`, empty body (`@HttpCode(202)`) — fire-and-forget, no persistence
confirmation of any kind.
**Behavior:** each event is written directly to the structured Pino log stream (see
[logging](../logging/README.md)) — never to Postgres, never to the outbox. `userId`/`sessionIdHash`
are filled from the guard-resolved `req.user` when present ([`hashSessionId`](../common/crypto/README.md),
a one-way fingerprint — the raw session id is never logged), otherwise from the event's own
self-reported `userId` field. `platform` maps to a coarse `deviceType` (`ios`/`android`/`ipados` →
`mobile`/`mobile`/`tablet`; anything else → `mobile`, since this endpoint has no web caller today — see
[README.md](./README.md#what-this-module-owns)).
**Errors:** `400` (`ValidationPipe`: malformed/oversized event array, bad enum value).
**Used by:** Mobile [`activity_logger.dart`](../../../../flutter-boilerplate/lib/lib/activity_logger.dart) —
app-wide client instrumentation, not scoped to one screen. No frontend caller — see
[README.md](./README.md#what-this-module-owns) for the separate web-side pipeline.
