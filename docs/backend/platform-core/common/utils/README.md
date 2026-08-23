# common/utils (backend)

**Source:** [`nest-js-boilerplate/src/common/utils/`](../../../../../nest-js-boilerplate/src/common/utils/) ·
**Category:** [Platform / Core](../../README.md) · **Parent:** [common](../README.md)

## What this owns

Five small, pure, stateless helper functions with no shared theme beyond "too small to deserve their
own directory." No DI, no module wrapper — plain imports.

### `parseDeviceType(userAgent?)`

[`device-type.ts`](../../../../../nest-js-boilerplate/src/common/utils/device-type.ts) — regex-based
User-Agent sniffing into `'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'`. Checks bot patterns
first (search-engine crawlers, headless browsers), then tablet, then mobile, defaulting to desktop.
**The single most widely-used file in this whole category** — every structured log line that includes
`deviceType` calls this: [interceptors](../../../_reference/demo-gated-but-live.md#the-global-perf-interceptor-interceptors)'s
`PerformanceInterceptor`, [throttle](../../../_reference/demo-gated-but-live.md#the-global-rate-limit-guard-throttle)'s
`HttpThrottlerGuard`, [exception-filters](../../../_reference/demo-gated-but-live.md#the-global-exception-filter-exception-filters)'s
`GlobalHttpExceptionFilter`, and [activity-log](../../activity-log/README.md)'s `ActivityLogService`
all call it — meaning nearly every backend log line about a real request carries a consistently-derived
device classification.

### `displayName(user)`

[`display-name.ts`](../../../../../nest-js-boilerplate/src/common/utils/display-name.ts) — `user.name
?? user.email ?? 'Unknown'`. Used by `messaging-realtime/messaging`
(`MessagingFriendService`/`MessagingDmService`, for notification text and system messages) and
`messaging-realtime/realtime`.

### `countLetters(text)`

[`letter-count.ts`](../../../../../nest-js-boilerplate/src/common/utils/letter-count.ts) — counts
Unicode code points (`Array.from(text).length`), not UTF-16 code units, so multi-byte characters (emoji,
non-Latin scripts) count as one letter each rather than two. Used by
`messaging-realtime/messaging`'s `MessagingDmService`/`MessagingRoomService` to feed
[billing-usage/usage](../../../billing-usage/usage/README.md)'s `assertCanSendMessage` message-length
quota check.

### `parseDurationToSeconds(raw, fallback?)`

[`parse-duration.ts`](../../../../../nest-js-boilerplate/src/common/utils/parse-duration.ts) — parses
a Go-style duration string (`"15m"`, `"1h"`, `"30d"`) into seconds; returns `fallback` (default 900)
for anything that doesn't match `^\d+[smhd]$`. Used by `identity-access/auth`'s `TokenStoreService`
(TTL config parsing) and `messaging-realtime/wire-crypto`'s `WireCryptoService`.

### `validatePasswordStrength(password)`

[`password.ts`](../../../../../nest-js-boilerplate/src/common/utils/password.ts) — throws a structured
`BadRequestException({exc: 'EX_AUTH_WEAK_PASSWORD', ...})` (see
[common/exceptions](../exceptions/README.md) for that shape) if the password is under 8 characters, is
one of 15 hardcoded common passwords (checked case/punctuation-insensitively), or has fewer than 3 of
{lowercase, uppercase, digit, special-character}. **Two of its three checks are unreachable dead code**
in every current call site: `identity-access/auth`'s DTOs (`register.input.ts`,
`reset-password.input.ts`, `change-password.input.ts`) already enforce `@MinLength(8)` and a
`@Matches` regex requiring lower+upper+digit via `class-validator`, ahead of this function ever
running — only the common-password blocklist check adds anything the DTO layer doesn't already
guarantee. See [BE-004](../../../../issues.md#be-004) (documented in Phase 1,
[identity-access/auth/endpoints.md](../../../identity-access/auth/endpoints.md#known-issues)) for the
full account — not re-litigated here, this module is just where the function itself lives.

## Interfaces

None. Internal-only.

## Depends on

Nothing backend-internal (`validatePasswordStrength` depends only on `@nestjs/common`'s
`BadRequestException`).

## Used by

See each function above — spans `identity-access/auth`, `messaging-realtime/messaging`,
`messaging-realtime/realtime`, `messaging-realtime/wire-crypto`, and every file listed in
[_reference/demo-gated-but-live.md](../../../_reference/demo-gated-but-live.md) plus
[activity-log](../../activity-log/README.md) for `parseDeviceType` specifically.

## Known issues

None specific to this module beyond the already-tracked [BE-004](../../../../issues.md#be-004) noted
above.
