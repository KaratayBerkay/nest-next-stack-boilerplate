# Common (backend)

**Source:** [`nest-js-boilerplate/src/common/`](../../../../nest-js-boilerplate/src/common/) ·
**Category:** [Platform / Core](../README.md)

Not one feature — seven independent, narrowly-scoped helper subdirectories that other modules import
piecemeal. Unlike the rest of `platform-core`, `common/` has no single module file or `@Module` of its
own; each subdirectory below is documented as its own leaf, matching `src/common/<subdir>/` exactly
(per [conventions.md § 1](../../../conventions.md#1-folder-structure-rule)).

| Subdir | Docs | What it's for |
|---|---|---|
| [cookies](./cookies/) | [README](./cookies/README.md) | Hardened cookie-options factory shared by every auth/session cookie |
| [crypto](./crypto/) | [README](./crypto/README.md) | General-purpose AES-256-GCM/HMAC helpers (`CryptoService`) — verification tokens, MFA secrets, mail-pool passwords |
| [dataloader](./dataloader/) | [README](./dataloader/README.md) | Per-request `DataLoader` batching for GraphQL N+1 avoidance |
| [exceptions](./exceptions/) | [README](./exceptions/README.md) | The app's one unified error shape (`{statusCode, exc, msg, key, ...}`) — every REST/GraphQL error funnels through this |
| [id-codec](./id-codec/) | [README](./id-codec/README.md) | Encrypts/decrypts database uuids at the transport boundary — REST, GraphQL, WS |
| [scanner-filter](./scanner-filter/) | [README](./scanner-filter/README.md) | Pre-pipeline 404s for vulnerability-scanner probes (`/*.php`, `wp-*`, `/.env`, …) — added post-docs (2026-08-28) |
| [token-codec](./token-codec/) | [README](./token-codec/README.md) | Same idea as `id-codec`, for opaque session tokens instead of uuids |
| [utils](./utils/) | [README](./utils/README.md) | Small stateless helpers: device-type sniffing, display names, letter counting, duration parsing, password strength |

None of these seven expose REST/GraphQL/WS surfaces of their own — every one is internal, imported
directly by other modules (some `@Global()`-provided via a thin wrapper module, some plain exported
functions with no DI at all). See each subdir's own README for its real consumer list.

## Two of these are already referenced from Phase 1/3 docs

[identity-access/auth](../../identity-access/auth/README.md#sessionauthguard--validation-order),
[identity-access/sessions](../../identity-access/sessions/README.md#sessionid-is-hashed-not-encrypted),
and [messaging-realtime/realtime](../../messaging-realtime/realtime/README.md) all forward-reference
`id-codec`/`token-codec` as "the general `id-codec` transport-encryption… (`platform-core` category,
Phase 5, not yet documented)" — those pointers now resolve here:
[id-codec/README.md](./id-codec/README.md) and [token-codec/README.md](./token-codec/README.md). Those
three existing docs are outside this phase's scope to edit directly (see this phase's own boundary
note), but their generic `../../platform-core/README.md` links now land on a populated index that
routes straight to the real docs.

## Known issues

None specific to this index — see each subdirectory's own README.
