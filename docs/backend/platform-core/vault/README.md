# Vault (backend)

**Source:** [`nest-js-boilerplate/src/vault/`](../../../../nest-js-boilerplate/src/vault/) ·
**Category:** [Platform / Core](../README.md) · **Interface docs:** none (internal — no REST/GraphQL/WS
surface of its own)

## What this module owns — two unrelated ways to read HashiCorp Vault

This directory holds **two independent implementations** of "read a secret from Vault and put it in
`process.env`," built for two different moments in the app's lifecycle, and they don't share code:

| | Called from | When | Path | DI? |
|---|---|---|---|---|
| [`vault-loader.ts`](../../../../nest-js-boilerplate/src/vault/vault-loader.ts)'s `loadVaultSecrets()` | `main.ts`, directly | Before `NestFactory.create()` — no Nest app, no DI container exists yet | Hardcoded: `secret/data/secret/production/backend` | No — plain async function, standalone `pino` logger instance (the real DI-managed Pino logger from [logging](../logging/README.md) doesn't exist yet at this point in boot) |
| ~~`VaultService`~~ | **Deleted 2026-09-03** (`BE-023` (resolved — fixed 2026-09-03: `VaultService`/`VaultModule` were deleted)) — it had zero consumers; `vault-loader.ts` is the only Vault code path now | — | — | — |

`loadVaultSecrets()` is the one that actually matters in production: `main.ts`'s `bootstrap()` calls it
as its very first line, so every secret Vault returns lands in `process.env` before `ConfigModule`
(and everything depending on it, including [`config`](../config/README.md)'s Joi validation) ever
reads environment variables. If `VAULT_ADDR`/`VAULT_TOKEN` aren't set, or Vault returns a non-OK
status, or the fetch throws, it logs a warning and returns — the app boots on whatever's already in
the real environment either way, never blocking startup on Vault being reachable.

The former `VaultService`/`VaultModule` (a DI-friendly `readSecrets(path)`/`loadIntoEnv(path)` wrapper
that nothing ever injected) was removed on 2026-09-03 — `BE-023` (resolved). If an on-demand secret
read is ever needed at runtime, add it next to `vault-loader.ts` rather than resurrecting the class.

## Deploy-side note: `vault-init` and `.env.local` overrides

Separate from both code paths above, the **compose-level**
[`docker/vault-init/entrypoint.sh`](../../../../docker/vault-init/entrypoint.sh) (repo root, not
the backend package) materializes each service's Vault secrets into an env file at container start —
and (post-docs, 2026-08-28) appends an optional `/secrets/<svc>.env.local` **after** the Vault
values, so its keys win (docker `env_file` semantics: last occurrence counts). That's the escape
hatch for a deploy box whose `VAULT_TOKEN` is read-only: a secret that can't be written upstream
(e.g. `MESSAGE_STORAGE_MASTER_KEY`) goes in the `.local` file until a privileged token can move it
into Vault. Direct edits to the generated env file don't survive — `vault-init` rewrites it on every
start.

## Interfaces

None. Internal-only.

## Depends on

Nothing (both paths call Vault's HTTP API directly via `fetch`, no other module).

## Used by

`main.ts` (`loadVaultSecrets()`, bootstrap-time). `VaultService` has no callers — see below.

## Known issues

- `BE-023` (resolved) (LOW) — `VaultService` is provided and exported globally by
  `VaultModule` but has zero consumers anywhere in `src/` (confirmed: `grep -rln "VaultService"`
  returns only `vault.module.ts` and `vault.service.ts` itself). Any runtime, on-demand secret read a
  future feature might need (rotating a key without a restart, reading a per-tenant secret, etc.) would
  reach for this class — worth knowing it's currently inert rather than assuming it's exercised
  somewhere non-obvious.
