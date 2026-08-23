# common/id-codec (backend)

**Source:** [`nest-js-boilerplate/src/common/id-codec/`](../../../../../nest-js-boilerplate/src/common/id-codec/) ·
**Category:** [Platform / Core](../../README.md) · **Parent:** [common](../README.md)

## What this owns

Deterministic, authenticated encryption of database uuids at every transport boundary — REST,
GraphQL, and WS — so no raw Postgres id ever leaves the process. This is the feature three existing
Phase 1/3 docs already forward-reference as "Phase 5, not yet documented":
[identity-access/auth](../../../identity-access/auth/README.md#sessionauthguard--validation-order),
[identity-access/sessions](../../../identity-access/sessions/README.md#sessionid-is-hashed-not-encrypted),
and [messaging-realtime/realtime](../../../messaging-realtime/realtime/README.md).

**Why deterministic** (unlike, say, `wire-crypto`'s message-content encryption): the same uuid must
always produce the same token, because both the frontend's cache keys and this backend's own internal
`===`/`Set`/`Map` id comparisons depend on equality holding across separate reads/requests. That
trades away semantic security (an observer can tell two tokens refer to the same row) for the property
this feature actually needs.

**Construction** ([`id-codec.ts`](../../../../../nest-js-boilerplate/src/common/id-codec/id-codec.ts)):
nonce = `HMAC-SHA256(macKey, plaintext)[:12]` (a pure function of the plaintext, not random — same
determinism reasoning as above), then `AES-256-GCM(encKey, nonce, plaintext)` — the same idea as
AES-SIV, built from `node:crypto` primitives only, matching
[`common/crypto`](../crypto/README.md)'s "small, dependency-free" convention. `encKey`/`macKey` are
domain-separated HMAC subkeys derived from `ENCRYPTION_KEY` (same key material
[`common/crypto`](../crypto/README.md)'s `CryptoService` uses, but derived independently — this module
has no dependency on that one). The 16-byte uuid is encrypted directly (not its 36-char string form),
so the output token is shorter: 12 (nonce) + 16 (tag) + 16 (ciphertext) = 44 bytes → 59 base64url
chars, vs. ~86 for the string form. A tampered/forged token fails the GCM auth tag loudly
(`decryptId` throws) rather than silently decrypting to garbage.

## How the app knows *which* fields are ids

[`uuid-fields.ts`](../../../../../nest-js-boilerplate/src/common/id-codec/uuid-fields.ts) parses
`prisma/schema.prisma`'s **text directly** (not Prisma's runtime DMMF, which the file's own comment
notes is verified-empirically too minimal — no `isId`, no `relationFromFields`, for Prisma 7 client
runtime) to classify every field as a uuid field or not: a model's own `@id` field, or a relation's FK
scalar whose `references` is exactly the target model's own `@id` field. That target-aware check is
load-bearing: `RoomParticipant.roomId` references `Room.id` (a real uuid FK — must be encrypted), but
`RoomMessage.roomId` references `Room.slug` (a routing string like `"general"`/`"vip-..."` — must
**never** be touched, since `messaging.controller.ts`'s `rooms/:roomId/messages` route depends on it
staying a plain string). Same field name, different models, different answers — a single flat name set
can't represent both correctly, so per-model precision (`fieldsByModel`) is kept for GraphQL (which has
type context via `mapSchema`), alongside a conservative flattened `globalSafeNames` set for REST/WS
(no type context there — any name that qualifies in one model but not another, currently just
`roomId`, is dropped from the flat set entirely rather than risk corrupting routing). A small manual
alias list (`cursor`, `readerId`, `deviceId`) covers payload/param keys that carry an id under a name
that doesn't match any real Prisma field name, found by grepping actual call sites rather than guessed.

## Three enforcement points, one per transport

| Transport | File | Mechanism |
|---|---|---|
| REST | [`id-codec.interceptor.ts`](../../../../../nest-js-boilerplate/src/common/id-codec/id-codec.interceptor.ts) | `IdCodecInterceptor`, registered globally in `main.ts` (`app.useGlobalInterceptors`) — decrypts `request.body`/`request.params` before the controller runs, encrypts the response body after. Query strings are handled separately (see below) — Express 5's `req.query` is a live getter, so mutating it here would be silently lost. Guarded to HTTP only: GraphQL's `fieldResolverEnhancers: ['interceptors']` setting would otherwise run this a second time per GraphQL field. |
| GraphQL | [`id-codec-schema.transformer.ts`](../../../../../nest-js-boilerplate/src/common/id-codec/id-codec-schema.transformer.ts) | `idCodecSchemaTransformer`, applied schema-wide in `AppModule`'s `GraphQLModule.forRoot({transformSchema})` — wraps every `OBJECT_FIELD` resolver so args are deep-decrypted before the real resolver runs and the field's own result is encrypted after, if it's a known uuid field of its parent type. No individual resolver or generated `@generated/**` file needs touching. |
| Query strings | `main.ts`'s Express `query parser` override | `bestEffortDecryptIds` (see below) replaces Express's default query-string parser entirely — the only place a query-string id can be decrypted, since `req.query` re-parses on every access. |

[`id-codec.util.ts`](../../../../../nest-js-boilerplate/src/common/id-codec/id-codec.util.ts) provides
the shared tree-walkers: `deepDecryptIds`/`deepEncryptIds` (throw on a malformed/tampered token —
input-side REST/WS/GraphQL-args, which has no framework recursion to lean on and must walk the whole
tree itself), `bestEffortDecryptIds` (swallows a per-leaf failure instead of throwing — used only by
the query-string hook, since a getter invoked unpredictably many times per request can't safely throw),
and `encryptFieldIfId` (the GraphQL output-side transform — deliberately shallow, since GraphQL's own
execution engine already recurses field-by-field with its own wrapped resolver call).

**A real, previously-shipped bug this file's own comments document**: `encryptFieldIfId`'s two-tier
lookup (per-model `fieldsByModel`, falling back to the flat `globalSafeNames` for any GraphQL type that
isn't a recognized Prisma model) exists because falling through to "unencrypted" for a hand-written
type like `SessionUserPayload` (the `me` query's return type) was a real bug — `me { id }` shipped the
raw database uuid in production before this fallback was added.

## Interfaces

None. Internal-only — an interceptor + a schema transformer + a query-parser hook, all wired at the
composition root (`app.module.ts`/`main.ts`), not injected feature-by-feature.

## Depends on

`prisma/schema.prisma` (read directly off disk, memoized after first parse — the schema doesn't change
while the process is running).

## Used by

Every REST controller, GraphQL resolver, and WS payload in the app, transitively — this runs at the
global interceptor/schema-transform layer, so no individual feature module imports it directly except
where a guard needs `decryptId`/`encryptId` ahead of the interceptor running (e.g.
[activity-log](../../activity-log/README.md)'s `OptionalAuthGuard`, which decrypts a JWT's `sub` claim
itself since guards run before global interceptors).

## Known issues

None specific to this module — the `me { id }` leak mentioned above is fixed in current source (the
two-tier `fieldsByModel`/`globalSafeNames` fallback in `encryptFieldIfId` is the fix), not a still-open
gap; it's noted here only because the fix's own code comment explains the bug it closes.
