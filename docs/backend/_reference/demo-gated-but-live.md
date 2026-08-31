# Demo-gated but live

Five directories are gated behind `DEMO_MODULES` (off in production unless `LOAD_DEMO_MODULES=true` or
`NODE_ENV=development` — see [_reference/excluded-modules.md](./excluded-modules.md)) that nonetheless
ship one file each — imported directly into `AppModule`'s or `main.ts`'s own unconditional setup,
bypassing the `DEMO_MODULES` gate entirely — that's genuinely live in every environment, production
included. [backend/README.md](../README.md) previously said "four" here, naming four of the five in
prose (gRPC, the complexity plugin, the rate-limit guard, the perf interceptor); verifying each against
source this phase found a fifth real instance (`exception-filters/`) that wasn't previously named — see
`CROSS-036` (resolved) and the corrected count in [backend/README.md](../README.md).

For each, this doc asks the same question BE-001 already answered for gRPC: is the always-on file
**intentional** (a deliberate, if confusingly-located, piece of core infrastructure), or **broken the
same way BE-001 is** (a listener/feature partially active with nothing behind it)? Four of the five are
intentional and working correctly. Only BE-001 (gRPC) is an actual bug.

## BE-001 — gRPC's hybrid transport

**Status: confirmed bug**, already tracked as `BE-001` (resolved) — read there
for the full evidence. Summary: [`main.ts`](../../../nest-js-boilerplate/src/main.ts) unconditionally
calls `internalGrpcOptions()` (imported from `./grpc/grpc.module`) and starts a gRPC microservice
listener on `:5050` via `app.connectMicroservice(...)`/`app.startAllMicroservices()` — regardless of
whether `GrpcModule` (which registers `InternalController`, the only handler this transport would ever
route to) is actually loaded. In production, `GrpcModule` is off (`DEMO_MODULES`), so the listener
starts with **zero registered handlers** — a real behavioral gap, not just a doc curiosity. See
[grpc.module.ts](../../../nest-js-boilerplate/src/grpc/grpc.module.ts) and
[grpc.internal.controller.ts](../../../nest-js-boilerplate/src/grpc/internal.controller.ts).

## The global query-complexity plugin (`complexity/`)

**Status: intentional, not a bug.** `complexity/complexity.module.ts` (`ComplexityModule`, providing
`ItemsResolver` — a demo GraphQL type/resolver whose fields carry cost-estimation directives) is
`DEMO_MODULES`-gated. But
[`complexity.plugin.ts`](../../../nest-js-boilerplate/src/complexity/complexity.plugin.ts)'s
`ComplexityPlugin` — an Apollo Server plugin rejecting any GraphQL query whose computed cost exceeds
`MAX_COMPLEXITY = 200` before it executes — is added directly to `AppModule`'s own `providers` array
([`app.module.ts`](../../../nest-js-boilerplate/src/app.module.ts)), unconditionally. `ComplexityModule`'s
own doc comment explains why the plugin lives outside its gate: "the cost-enforcing `ComplexityPlugin`
injects `GraphQLSchemaHost`, which is only resolvable in the module scope that imports
`GraphQLModule.forRoot` — so the plugin is registered at the composition root (`AppModule`…) alongside
this module, which owns the resolver + costed types." Because `getComplexity()` operates generically
over the whole built schema and the incoming query document, this budget enforcement applies to
**every real GraphQL query in production**, not just the demo `ItemsResolver`'s fields — a genuinely
useful, always-on protection, deliberately split from its demo-only showcase resolver for a real
technical reason (DI scope), not an oversight.

## The global rate-limit guard (`throttle/`)

**Status: intentional, not a bug.**
[`throttle.module.ts`](../../../nest-js-boilerplate/src/throttle/throttle.module.ts) (`ThrottleModule`,
providing `ThrottleController` — demo endpoints exercising `@Throttle()`/`@SkipThrottle()`) is
`DEMO_MODULES`-gated, and its own comment says so plainly: "The global limiter
(`ThrottlerModule.forRoot` + `APP_GUARD` `HttpThrottlerGuard`) is wired in `AppModule`; this module
just exposes endpoints exercising `@Throttle`/`@SkipThrottle`." Two files from this directory are
imported directly into `AppModule`, unconditionally: `http-throttler.guard.ts`'s `HttpThrottlerGuard`
(registered as `{provide: APP_GUARD, useClass: HttpThrottlerGuard}` — a GraphQL-aware subclass of
`@nestjs/throttler`'s `ThrottlerGuard` that also structured-logs every `network.rate_limited` rejection)
and `redis-throttler-storage.ts`'s `RedisThrottlerStorage` (the `ThrottlerModule.forRootAsync`'s
storage backend, so rate-limit counters survive across app instances/restarts via Redis rather than
in-process memory). Both run against every real request in every environment; only the showcase
controller demonstrating them is gated off.

## The global perf interceptor (`interceptors/`)

**Status: intentional, not a bug.**
[`interceptors.module.ts`](../../../nest-js-boilerplate/src/interceptors/interceptors.module.ts)
(`InterceptorsModule`, providing `InterceptorsController` — six interceptor patterns bound per-route:
logging, caching, transform, errors, timeout, exclude-null) is `DEMO_MODULES`-gated. But
[`performance.interceptor.ts`](../../../nest-js-boilerplate/src/interceptors/performance.interceptor.ts)'s
`PerformanceInterceptor` is registered directly in `main.ts`'s `app.useGlobalInterceptors(new
PerformanceInterceptor(), new IdCodecInterceptor())` — unconditionally, for every HTTP and GraphQL
request. It logs a structured `perf.slow_request` event (method/path/duration/status/device-type) for
any request taking over 1000ms, using [`common/utils`](../platform-core/common/utils/README.md#parsedevicetypeuseragent)'s
`parseDeviceType` — real, always-on latency observability, unrelated to the six route-scoped demo
patterns living in the same directory. (Note: `backend/README.md`'s original prose named this "the
global perf interceptor" without specifying a directory — this phase confirms it's `interceptors/`,
**not** `fastify-perf/`, which is entirely unwired and, per
[excluded-modules.md](./excluded-modules.md), moot anyway since this app runs on Express, not
Fastify.)

## The global exception filter (`exception-filters/`)

**Status: intentional, not a bug — and arguably the most load-bearing file in this whole list.**
[`exception-filters.module.ts`](../../../nest-js-boilerplate/src/exception-filters/exception-filters.module.ts)
(`ExceptionFiltersModule`, providing `HttpExceptionFilter`/`CatchEverythingFilter` for
`ErrorsController`'s demo error-throwing routes) is `DEMO_MODULES`-gated. But
[`global-http-exception.filter.ts`](../../../nest-js-boilerplate/src/exception-filters/global-http-exception.filter.ts)'s
`GlobalHttpExceptionFilter` is registered directly in `AppModule`'s own `providers` array as
`{provide: APP_FILTER, useClass: GlobalHttpExceptionFilter}` — unconditionally. This is the **only**
`@Catch()`-all exception filter in the entire app: every uncaught REST exception funnels through it,
which calls [`common/exceptions`](../platform-core/common/exceptions/README.md)'s
`toExceptionResponse()` to normalize it into the app's one unified error shape, structured-logs it
(error level for 5xx, log level for 4xx), and replies. Without this file, the app would have no
consistent REST error contract at all — this is core infrastructure that happens to sit in a
demo-sounding directory, not a demo feature that happens to leak into production.

## A file that runs unconditionally but does nothing (`directives/`)

Not counted among the five above — mentioned for completeness, since it was checked while verifying
this list and is a meaningfully different shape (inert, not behaviorally live).
[`directives.module.ts`](../../../nest-js-boilerplate/src/directives/directives.module.ts)
(`DirectivesModule`, providing `AnnouncementsResolver`, whose `Announcement.message` field carries a
`@Directive('@upper')`) is `DEMO_MODULES`-gated. `AppModule`'s `GraphQLModule.forRoot` unconditionally
runs `transformSchema: (schema) => idCodecSchemaTransformer(upperDirectiveTransformer(schema,
'upper'))` — so `upperDirectiveTransformer` (from this same gated directory) does execute at every
schema build, in every environment, and the `@upper` `GraphQLDirective` itself is registered
schema-wide via `buildSchemaOptions.directives`, also unconditionally. But `upperDirectiveTransformer`'s
own comment states it only touches "every `OBJECT` field carrying `@upper`" — and a repo-wide grep
(`grep -rn "@Directive"`) confirms `@Directive('@upper')` is used **nowhere** outside this same
demo-gated directory. In production, this transformer runs on schedule but has zero fields to act on —
structurally always-on, behaviorally a no-op. Not a bug; nothing is broken or missing, it just isn't
"live" in the sense the five directories above are.

## A related but mechanically distinct case (`caching/`)

[`caching/`](./excluded-modules.md#caching)
has a similar shape — one real, live file (`cache-aside.service.ts`'s `CacheAsideService`) sitting in an
otherwise-inert directory — but it is **not** `DEMO_MODULES`-gated at all; `CachingModule` is never
referenced by `app.module.ts` under any environment variable (its own comment: "not wired into
AppModule"). Documented in [excluded-modules.md](./excluded-modules.md#caching)
rather than here, since there's no demo/production toggle involved — just an orphaned module directory
with one file reached by a different, direct-import path ([`redis/`](../platform-core/redis/README.md)'s
`@Global()` DI registration).
