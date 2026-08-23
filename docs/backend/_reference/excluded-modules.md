# Excluded modules

Every `nest-js-boilerplate/src/*` top-level directory that is **not** one of the 33 real, documented
product modules and not `@generated/` (see [generated-client.md](./generated-client.md)) — 70
directories in total, matching [backend/README.md](../README.md)'s module count
(104 top-level directories − 33 documented − 1 generated = 70). Each is NestJS's own bundled official
recipe/sample code (mirroring docs.nestjs.com's chapter structure), verified individually against
[`app.module.ts`](../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES`/`DEMO_MODULES`
arrays and a repo-wide grep for any import reference from outside the directory itself — **not**
assumed from the directory name. "Wired" below means "registered as a NestJS module app.module.ts
actually imports"; several directories nonetheless ship one file that's genuinely live in
production via a different, direct-import path — those are called out individually below and fully
detailed in [demo-gated-but-live.md](./demo-gated-but-live.md).

**Wiring key:** `DEMO_MODULES` = real and reachable, but only when `LOAD_DEMO_MODULES=true` or
`NODE_ENV=development` (off by default in production) · `unwired` = not referenced by
`app.module.ts` at all, under any environment variable — confirmed via `grep -rln "from '\(\.\./\)*<dir>/'"`
across the whole `src/` tree returning zero hits outside the directory itself.

## Naming collisions — verify by content, not by name

Four directory names are easy to misread as a real product module. All four were checked directly
against source, not assumed:

### `cookies/`

**Wiring:** `DEMO_MODULES` (`CookiesModule`, groups `CookiesController`'s cookie-read/write demo
endpoints — own comment: "the cookie-parser middleware itself is registered globally in main.ts; this
module just groups the endpoints that read/write cookies"). Not to be confused with the real,
always-on [`common/cookies/`](../platform-core/common/cookies/README.md) (the cookie-hardening options
factory every real session cookie in the app uses) — a new finding this phase, the fourth confirmed
instance of this codebase's naming-collision pattern. See
[BE-025](../../issues.md#be-025) below.

### `session/` (singular)

**Wiring:** unwired — `session.module.ts`/`session.controller.ts` exist but nothing in `src/`
references them; confirmed absent from both `app.module.ts` arrays. Not to be confused with the real,
always-on [`identity-access/sessions/`](../identity-access/sessions/README.md) (plural — the
active-sessions-list GraphQL resolver, Phase 1).

### `tasks/`

**Wiring:** `DEMO_MODULES` (`TasksModule`, `@nestjs/schedule` cron-job examples). Not to be confused
with the real, always-on [`social-content/project-tasks/`](../social-content/project-tasks/README.md)
(Phase 2) — see also [architecture.md § Transactional outbox](../../architecture.md#transactional-outbox--reliable-event-emission),
which notes this `tasks/` directory specifically when explaining that the outbox relay is
BullMQ-queue-driven, not cron-polled.

### `users/`

**Wiring:** `DEMO_MODULES` (`UsersModule`) — its own source comment reads "demo CRUD module — leaks
passwordHash; must not run in production." Not to be confused with the real, always-on
[`social-content/profile/`](../social-content/profile/README.md) (Phase 2). Already tracked as
[BE-002](../../issues.md#be-002) (Phase 0) — the first of this pattern found in this effort; the three
above are additional instances confirmed this phase.

## `caching/`

A partial exception, related to but distinct from [demo-gated-but-live.md](./demo-gated-but-live.md):

**Wiring:** unwired — `caching.module.ts`'s own doc comment states plainly: "Standalone (demo
controller with a request counter) — not wired into AppModule." `CachingModule`
(`CacheDemoController`/`CacheDemoService`/`CounterService`, a `@nestjs/cache-manager` recipe) is never
reachable, under any environment variable — unlike the [demo-gated-but-live.md](./demo-gated-but-live.md)
cases, there's no `LOAD_DEMO_MODULES=true` toggle that would ever load it.

**But** — one file in this same directory, [`cache-aside.service.ts`](../../../nest-js-boilerplate/src/caching/cache-aside.service.ts)
(`CacheAsideService`, a generic Redis-backed read-through cache helper), is real, load-bearing,
production code: [`redis/redis.module.ts`](../platform-core/redis/README.md) — a `@Global()` module —
imports it directly, adds it to its own `providers`/`exports`, and re-exports it app-wide. Five real
consumers inject it: `messaging/messaging.service.ts` and its `MessagingDmService`/
`MessagingFriendService` sub-services, `comment/comment.service.ts`, and `post/post.service.ts`. So the
*module* (`CachingModule`) is 100% dead, exactly as its own comment says — but a *sibling file in the
same directory* is genuinely live, reachable via `redis/`'s DI registration rather than `caching/`'s
own (nonexistent) module wiring. See [platform-core/redis/README.md](../platform-core/redis/README.md#this-module-also-exports-cacheasideservice--which-doesnt-live-here)
for the full account.

## All 70 directories

| Directory | Wiring | Note |
|---|---|---|
| `als` | `DEMO_MODULES` | `AsyncLocalStorage`-based request-context recipe (`AlsModule`) — a different, narrower mechanism than [logging](../platform-core/logging/README.md)'s own real `AsyncLocalStorage` usage in `request-context.ts`, which is hand-rolled, not from this directory. |
| `async-providers` | unwired | `useFactory`/async provider-registration recipe. |
| `broker-transports` | unwired | Microservice broker-transport (Redis/NATS/etc.) recipe. |
| `caching` | unwired* | See [§ caching/](#caching) above — one file is a real exception. |
| `circular-dependency` | unwired | `forwardRef()` circular-DI-resolution recipe. |
| `cli-plugin` | unwired | `nest-commander`/CLI-plugin recipe — distinct from `nest-commander/` below. |
| `complexity` | `DEMO_MODULES`* | GraphQL query-complexity recipe (`ComplexityModule`/`ItemsResolver`) — but see [demo-gated-but-live.md § the global query-complexity plugin](./demo-gated-but-live.md#the-global-query-complexity-plugin-complexity). |
| `compression` | `DEMO_MODULES` | Response-compression recipe — the app's *real* compression (`compression` npm package) is wired directly in `main.ts`, independent of this directory. |
| `controllers` | unwired | Fundamentals › Controllers recipe (`CatsController`). |
| `cookies` | `DEMO_MODULES` | See [§ Naming collisions](#cookies) above. |
| `cookies-ssr` | `DEMO_MODULES` | Server-side-rendered-cookie recipe (`CookiesSsrModule`) — confirmed a real consumer of [`common/crypto`](../platform-core/common/crypto/README.md)'s `CryptoService`, but the module itself is demo-gated, so that consumption is inert in production. |
| `cors` | `DEMO_MODULES` | CORS recipe — the app's *real* CORS config (`app.enableCors(...)`) is wired directly in `main.ts`, independent of this directory. |
| `cqrs` | `DEMO_MODULES` | CQRS recipe (`CqrsExampleModule`). |
| `custom-providers` | unwired | Fundamentals › Custom providers recipe. |
| `custom-transport` | unwired | Custom microservice-transport recipe. |
| `directives` | `DEMO_MODULES` | GraphQL schema-directive recipe (`@upper`, `AnnouncementsResolver`) — its schema transformer (`upperDirectiveTransformer`) *does* run unconditionally at every schema build (wired into `AppModule`'s `GraphQLModule.forRoot`), but has zero fields to act on in production since the only `@Directive('@upper')` usage anywhere in the schema lives in this same demo-gated directory — see [demo-gated-but-live.md § A file that runs unconditionally but does nothing](./demo-gated-but-live.md#a-file-that-runs-unconditionally-but-does-nothing-directives). |
| `discovery` | unwired | `DiscoveryService`/reflection recipe (`FeatureScannerService`). |
| `dynamic-modules` | unwired | `register()`/`forRoot()`-style dynamic-module recipe (`StorageModule`). |
| `events` | unwired | `EventEmitterModule` recipe. |
| `exception-filters` | `DEMO_MODULES`* | Exception-filter recipe (`ExceptionFiltersModule`/`ErrorsController`) — but see [demo-gated-but-live.md § the global exception filter](./demo-gated-but-live.md#the-global-exception-filter-exception-filters). |
| `execution-context` | unwired | `ArgumentsHost`/`ExecutionContext` recipe. |
| `extensions` | `DEMO_MODULES` | GraphQL custom-scalar/schema-extension recipe (`ExtensionsModule`). |
| `fastify-perf` | unwired | Fastify-adapter performance recipe (`FastifyPerfModule`) — moot in this app either way, since the app runs on the default Express platform (confirmed: `main.ts` calls Express-style `app.getHttpAdapter().getInstance().set(...)`, never a Fastify-specific API). |
| `federation` | unwired | Full Apollo Federation gateway + two subgraph services (`users-subgraph`, `posts-subgraph`, `gateway`) — the largest orphaned cluster by file count found in this pass. |
| `field-middleware` | `DEMO_MODULES` | GraphQL field-middleware recipe (`FieldMiddlewareModule`). |
| `graphql-other` | `DEMO_MODULES` | Miscellaneous GraphQL-recipe leftovers (`GraphqlOtherModule`) not large enough to warrant their own directory. |
| `grpc` | `DEMO_MODULES`* | gRPC microservice recipe (`GrpcModule`/`InternalController`) — see [demo-gated-but-live.md § BE-001](./demo-gated-but-live.md#be-001--grpcs-hybrid-transport) (its hybrid-transport listener starts unconditionally regardless of this gate — a confirmed bug). |
| `http-client` | unwired | `HttpModule`/`HttpService` (axios-wrapper) recipe. |
| `injection-scopes` | unwired | `Scope.REQUEST`/`Scope.TRANSIENT` recipe — a different, narrower example of request-scoped DI than [`common/dataloader`](../platform-core/common/dataloader/README.md)'s real `Scope.REQUEST` usage. |
| `interceptors` | `DEMO_MODULES`* | Interceptor recipe (`InterceptorsModule`/`InterceptorsController`, six per-route-bound examples) — but see [demo-gated-but-live.md § the global perf interceptor](./demo-gated-but-live.md#the-global-perf-interceptor-interceptors). |
| `interfaces` | `DEMO_MODULES` | GraphQL interface-type recipe (`InterfacesModule`). |
| `lazy-loading` | unwired | `LazyModuleLoader` recipe. |
| `lifecycle` | unwired | `OnModuleInit`/`OnApplicationBootstrap`/etc. lifecycle-hook recipe. |
| `microservices` | unwired | TCP/microservices-transport fundamentals recipe. |
| `middleware` | `DEMO_MODULES` | Functional/class middleware recipe (`MiddlewareModule`) — distinct from this app's real middleware (`requestContextMiddleware`, `cookie-parser`, `helmet`, `DeviceIpMiddleware`), all wired directly in `main.ts`, independent of this directory. |
| `mikro-orm` | unwired | MikroORM integration recipe — this app's real ORM is Prisma ([`prisma/`](../platform-core/prisma/README.md)). |
| `module-reference` | unwired | `ModuleRef` recipe. |
| `modules` | unwired | Fundamentals › Modules recipe. |
| `mongoose` | unwired | Mongoose/MongoDB integration recipe — this app uses Postgres via Prisma, not MongoDB. |
| `mvc` | unwired | Server-side-rendered MVC (Handlebars/EJS) recipe — this app is an API-only backend (the frontend is a separate Next.js app). |
| `nest-commander` | unwired | `nest-commander` CLI-framework recipe. |
| `openapi` | `DEMO_MODULES` | OpenAPI/Swagger decorator recipe (`OpenapiModule`) — the app's *real* Swagger setup (`SwaggerModule.setup('api', ...)`, non-production only) is wired directly in `main.ts`, independent of this directory. |
| `openapi-plugin` | unwired | `@nestjs/swagger` CLI-plugin recipe. |
| `passport-auth` | `DEMO_MODULES` | Passport.js strategy recipe (`PassportAuthModule`) — this app's real authentication is the custom Redis-session model in [identity-access/auth](../identity-access/auth/README.md), not Passport. |
| `pipes` | `DEMO_MODULES` | Validation/transformation-pipe recipe (`PipesModule`) — the app's real global pipe (`ValidationPipe`) is wired directly in `main.ts`. |
| `platform-agnosticism` | unwired | Express-vs-Fastify platform-agnostic-code recipe. |
| `plugins` | `DEMO_MODULES` | GraphQL Apollo-plugin recipe (`PluginsModule`) — distinct from `complexity/`'s `ComplexityPlugin` (see the `complexity` row above), which is a real, always-on Apollo plugin registered directly in `AppModule`. |
| `providers` | unwired | Fundamentals › Providers recipe (`CatsService`). |
| `router-module` | `DEMO_MODULES` | `RouterModule` (route-prefix-grouping) recipe (`RouterDemoModule`). |
| `scalars` | `DEMO_MODULES` | Custom GraphQL scalar recipe (`ScalarsModule`) — this app's real custom scalars (`GraphQLJSON`, the Decimal scalar via `prisma-graphql-type-decimal`) are registered elsewhere, independent of this directory. |
| `sdl-generator` | unwired | GraphQL SDL-file-generation recipe. |
| `sequelize` | unwired | Sequelize ORM integration recipe — this app uses Prisma, not Sequelize. |
| `serialization` | `DEMO_MODULES` | `ClassSerializerInterceptor`/`@Exclude()` recipe (`SerializationModule`). |
| `serve-static` | `DEMO_MODULES` | Static-asset-serving recipe (`StaticAssetsModule`). |
| `session` | unwired | See [§ Naming collisions](#session-singular) above. |
| `sharing-models` | `DEMO_MODULES` | Monorepo TypeScript-model-sharing recipe (`SharingModelsModule`). |
| `sse` | `DEMO_MODULES` | Server-Sent-Events recipe (`SseModule`) — this app's real live-push mechanism is raw WebSocket ([messaging-realtime/realtime](../messaging-realtime/realtime/README.md)), not SSE. |
| `standalone` | unwired | Standalone (non-HTTP) Nest application recipe (`NestFactory.createApplicationContext`). |
| `streaming` | unwired | Streaming-response (`StreamableFile`) recipe. |
| `subscriptions` | `DEMO_MODULES` | GraphQL subscriptions recipe (`SubscriptionsModule`, `graphql-ws`) — the app's real GraphQL config does enable `subscriptions: {'graphql-ws': true}` in `AppModule`'s `GraphQLModule.forRoot`, but no real feature module currently defines a `@Subscription()` resolver; only this demo one does. |
| `swc` | unwired | SWC-compiler build-config recipe (a build-tooling doc, not a runtime module). |
| `tasks` | `DEMO_MODULES` | See [§ Naming collisions](#tasks) above. |
| `throttle` | `DEMO_MODULES`* | Rate-limiting demo-endpoints recipe (`ThrottleModule`/`ThrottleController`) — but see [demo-gated-but-live.md § the global rate-limit guard](./demo-gated-but-live.md#the-global-rate-limit-guard-throttle). |
| `typeorm` | unwired | TypeORM integration recipe — this app uses Prisma, not TypeORM. |
| `unions-enums` | `DEMO_MODULES` | GraphQL union/enum-type recipe (`UnionsEnumsModule`). |
| `users` | `DEMO_MODULES` | See [§ Naming collisions](#users) above. |
| `versioning` | unwired | URI/header/media-type API-versioning recipe — see [architecture.md § No backend API versioning](../../architecture.md#no-backend-api-versioning) and [issues.md#cross-003](../../issues.md#cross-003): this app deliberately has no real API versioning; this directory is unreachable recipe code, not evidence of one. |
| `ws` | `DEMO_MODULES` | Raw-`ws`-library WebSocket-gateway recipe (`WsModule`) — a smaller, generic example of the same `ws` library this app's real [messaging-realtime/realtime](../messaging-realtime/realtime/README.md) gateway uses for its actual `/ws` transport. |
| `ws-adapter` | unwired | Custom WebSocket-adapter recipe. |
| `ws-enhancers` | unwired | WebSocket guard/interceptor/pipe recipe. |

## Known issues

- [BE-025](../../issues.md#be-025) (LOW) — `cookies/` (`DEMO_MODULES`, a NestJS cookie-recipe demo) sits
  next to the real, always-on `common/cookies/` (the cookie-hardening options factory) with a
  confusable name — the fourth instance of this codebase's `users/`↔`profile/`-style naming-collision
  pattern found across this whole documentation effort (after `users/`↔`profile/`
  ([BE-002](../../issues.md#be-002)), `session/`↔`sessions/`, and `tasks/`↔`project-tasks/`, all
  re-confirmed this phase).
- Full list: [issues.md](../../issues.md).
