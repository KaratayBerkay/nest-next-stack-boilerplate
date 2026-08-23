# Redis (backend)

**Source:** [`nest-js-boilerplate/src/redis/`](../../../../nest-js-boilerplate/src/redis/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns

The two shared `ioredis` client instances the rest of the app is built on:
[`redis.module.ts`](../../../../nest-js-boilerplate/src/redis/redis.module.ts) provides `REDIS_CLIENT`
(general-purpose commands — session storage, rate-limit counters, room membership sets, cache-aside
reads/writes) and `REDIS_SUBSCRIBER` (a dedicated `duplicate()`d connection, since Redis blocks a
connection that's in subscriber mode — needed for cross-instance pub/sub in multi-replica deployments).
Both tokens live in their own file, [`redis.tokens.ts`](../../../../nest-js-boilerplate/src/redis/redis.tokens.ts),
specifically so providers injecting them (this module's own health indicator, `auth/token-store.service.ts`,
and others) never import `redis.module.ts` back — an earlier circular-import shape left the token
`undefined` at decorator-evaluation time and broke Nest's DI graph at boot (per that file's own
comment). `@Global()` — wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly.
`onApplicationShutdown` quits both clients cleanly.

## This module also exports `CacheAsideService` — which doesn't live here

`RedisModule`'s `providers`/`exports` arrays include `CacheAsideService`
([`redis.module.ts#L37,43`](../../../../nest-js-boilerplate/src/redis/redis.module.ts)) — but the class
itself is imported from `../caching/cache-aside.service`, i.e. the **excluded**, unwired `caching/`
directory (see
[_reference/excluded-modules.md#caching](../../_reference/excluded-modules.md#caching) for the full
story). `caching/`'s own `CachingModule` (a `@nestjs/cache-manager` recipe demo) is never registered in
`AppModule` at all — its own source comment says so explicitly — but `CacheAsideService` is real,
load-bearing, Redis-backed read-through-cache code, made reachable app-wide purely because this
`@Global()` module provides and exports it directly, bypassing `CachingModule` entirely. Five real
consumers inject it today: `messaging/messaging.service.ts` (and its `MessagingDmService`/
`MessagingFriendService` sub-services, manually constructed — see
[messaging-realtime/messaging/README.md](../../messaging-realtime/messaging/README.md#what-this-module-owns)),
`comment/comment.service.ts`, and `post/post.service.ts`. It offers `get`/`set`/`del`/`invalidate`
(pattern-based, `SCAN`-driven) and a `getOrFetch` read-through helper, with dates round-tripped through
a custom JSON reviver so a cache hit doesn't silently return a `string` where a fresh Prisma read would
have returned a `Date` (a real bug this file's own comment says it fixes — a naive cache would crash
every GraphQL `DateTime` field's `serialize()` on a cache hit).

## Interfaces

None. Internal-only.

## Depends on

`ConfigService` (Redis host/port/password/TLS).

## Used by

Nearly every other backend module needing a shared cache, counter, pub/sub, or rate-limit surface.
Notable direct consumers of this module's own files: [health](../health/README.md)'s
`RedisHealthIndicator` (readiness probe), `auth/token-store.service.ts` (the session compound-key
store — see [identity-access/auth](../../identity-access/auth/README.md)), and the [`throttle/`](../../_reference/demo-gated-but-live.md#the-global-rate-limit-guard-throttle)
directory's `RedisThrottlerStorage` (the app's real global rate limiter).

## Known issues

None specific to this module — see [_reference/excluded-modules.md#caching](../../_reference/excluded-modules.md#caching)
for the `CacheAsideService` naming/location note above.
