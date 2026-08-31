# Identity & Access

Authentication, authorization, and account-security modules. ✅ Complete (Phase 1).

| Module | Docs |
|---|---|
| [auth](./auth/) | [README](./auth/README.md) · [endpoints](./auth/endpoints.md) |
| [authorization](./authorization/) | [README](./authorization/README.md) · [endpoints](./authorization/endpoints.md) |
| [mfa](./mfa/) | [README](./mfa/README.md) · [endpoints](./mfa/endpoints.md) |
| [devices](./devices/) | [README](./devices/README.md) · [endpoints](./devices/endpoints.md) |
| [sessions](./sessions/) | [README](./sessions/README.md) · [endpoints](./sessions/endpoints.md) |
| [api-keys](./api-keys/) | [README](./api-keys/README.md) · [endpoints](./api-keys/endpoints.md) |
| [csrf](./csrf/) | [README](./csrf/README.md) · [endpoints](./csrf/endpoints.md) |

Frontend: [`/auth/*`](../../frontend/auth/README.md) (6 pages) +
[`settings/{security,sessions,api-keys}`](../../frontend/v1/settings/README.md). Mobile:
[`auth/*`](../../mobile/auth/README.md) (6 screens) +
[`settings/{sessions,api-keys}` + `security`](../../mobile/v1/settings/README.md).

Notable findings from this phase: `BE-005` (resolved) (unguarded dead OAuth endpoint),
`BE-007` (resolved)/`CROSS-012` (resolved) (real mutations with zero UI
trigger — ban/suspend, MFA reset, API key rename), `CROSS-009` (resolved)/`CROSS-010` (resolved)/`CROSS-011` (resolved)
(three independent mobile-vs-web auth-UX parity gaps), and
[CROSS-013](../../issues.md#cross-013)/`FE-007` (resolved) (the same
scaffolded-then-inlined dead-code pattern recurring on both platforms). Full list:
[issues.md](../../issues.md).
