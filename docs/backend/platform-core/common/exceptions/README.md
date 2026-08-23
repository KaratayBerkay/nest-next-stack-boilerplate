# common/exceptions (backend)

**Source:** [`nest-js-boilerplate/src/common/exceptions/`](../../../../../nest-js-boilerplate/src/common/exceptions/) ·
**Category:** [Platform / Core](../../README.md) · **Parent:** [common](../README.md)

## What this owns

The one unified error shape every REST response, GraphQL error, and validation failure in this app
gets normalized into — the `exc`/`key`/`fields` codes referenced throughout every other module's
`endpoints.md` (e.g. `403 EX_FORBIDDEN`, `409 EX_CONFLICT_DUPLICATE`) come from here.
[`exception-response.interface.ts`](../../../../../nest-js-boilerplate/src/common/exceptions/exception-response.interface.ts)
defines the shape:

```ts
interface ExceptionResponse {
  statusCode: number;
  exc: ExceptionCode;   // stable machine-readable code, e.g. 'EX_FORBIDDEN'
  msg: string;          // human-readable, English, for logs/dev — not localized
  key: string;           // i18n key, e.g. 'error.forbidden' — what the client actually renders
  field?: string;
  fields?: ExceptionFieldError[]; // per-field validation errors: {field, msg, key}
}
```

[`exception-code.ts`](../../../../../nest-js-boilerplate/src/common/exceptions/exception-code.ts) is
the closed union of every `exc` value the app can emit — 21 codes as of this writing, spanning generic
HTTP semantics (`EX_NOT_FOUND`, `EX_FORBIDDEN`, `EX_CONFLICT_DUPLICATE`) and domain-specific ones
(`EX_AUTH_WEAK_PASSWORD`, `EX_API_KEY_NOT_FOUND`, `EX_TIER_INSUFFICIENT`, `EX_WS_UNSTABLE`).

[`to-exception-response.ts`](../../../../../nest-js-boilerplate/src/common/exceptions/to-exception-response.ts)'s
`toExceptionResponse(exception)` does the actual normalization, in priority order:

1. **Already-structured** — if a thrown `HttpException`'s response already has `{exc, msg}` (the app's
   own convention — see e.g. [`common/utils/password.ts`](../utils/README.md#validatepasswordstrengthpassword)'s
   `BadRequestException({exc: 'EX_AUTH_WEAK_PASSWORD', ...})`), it's passed through as-is.
2. **Known Nest exception class** — `ConflictException`/`NotFoundException`/`ForbiddenException`/
   `UnauthorizedException`/`BadRequestException` each map to a fixed `{exc, key}` pair.
3. **Known Prisma error code** — `P2002`→`EX_CONFLICT_DUPLICATE` (409), `P2025`→`EX_NOT_FOUND` (404),
   `P2003`→`EX_CONFLICT_FOREIGN_KEY` (409), `P2014`→`EX_CONFLICT_RELATION` (409),
   `P2023`→`EX_INCONSISTENT_DATA` (400) — so a raw Prisma constraint violation never leaks past a
   resolver/controller as an unhandled 500.
4. **Fallback** — any other `HttpException` gets `EX_INTERNAL` (5xx) or `EX_VALIDATION_FORM` (4xx)
   by status code; anything else at all becomes a generic `500 EX_INTERNAL`.

## Where this actually runs — three call sites, one function

This one function is the app's entire error-normalization surface, called from three independent
places so REST, GraphQL, and DTO validation all produce the identical shape:

- **REST**: [`exception-filters/global-http-exception.filter.ts`](../../../_reference/demo-gated-but-live.md#the-global-exception-filter-exception-filters)'s
  `GlobalHttpExceptionFilter`, registered unconditionally as `APP_FILTER` in `AppModule` — see
  [_reference/demo-gated-but-live.md](../../../_reference/demo-gated-but-live.md) for why this lives in a
  directory that looks demo-only.
- **GraphQL**: `AppModule`'s `GraphQLModule.forRoot({formatError: ...})` calls it directly on every
  resolver error, overriding Apollo's default `INTERNAL_SERVER_ERROR` code with the app's real `exc`
  code (own comment: "otherwise every error, including 401s, surfaces as INTERNAL_SERVER_ERROR and
  misleads consumers").
- **DTO validation**: `main.ts`'s global `ValidationPipe`'s `exceptionFactory` builds an
  `EX_VALIDATION_FORM` response with a `fields` array directly (bypassing `toExceptionResponse` since
  the shape is already known at that point), following the same `ExceptionFieldError` contract.

## Interfaces

None. Internal-only.

## Depends on

Nothing backend-internal.

## Used by (who imports this, and why)

`AppModule` (GraphQL `formatError`) and `exception-filters/global-http-exception.filter.ts` (REST) —
see above. Every other module's thrown exceptions are consumed by this indirectly, not by importing it
directly.

## Known issues

None specific to this module.
