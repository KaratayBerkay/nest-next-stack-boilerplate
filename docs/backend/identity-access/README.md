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

Notable findings from this phase: [BE-005](../../issues.md#be-005) (unguarded dead OAuth endpoint),
[BE-007](../../issues.md#be-007)/[CROSS-012](../../issues.md#cross-012) (real mutations with zero UI
trigger — ban/suspend, MFA reset, API key rename), [CROSS-009](../../issues.md#cross-009)/[CROSS-010](../../issues.md#cross-010)/[CROSS-011](../../issues.md#cross-011)
(three independent mobile-vs-web auth-UX parity gaps), and
[CROSS-013](../../issues.md#cross-013)/[FE-007](../../issues.md#fe-007) (the same
scaffolded-then-inlined dead-code pattern recurring on both platforms). Full list:
[issues.md](../../issues.md).
