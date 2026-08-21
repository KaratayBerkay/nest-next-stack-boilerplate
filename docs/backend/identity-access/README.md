# Identity & Access

Authentication, authorization, and account-security modules.

| Module | Status |
|---|---|
| [auth](./auth/) | 🟡 partial — session/token model documented (needed by the messaging pilot's `SessionAuthGuard` references); login/register/OAuth/email-verify flows land in Phase 1 |
| authorization | ⬜ Phase 1 |
| mfa | ⬜ Phase 1 |
| devices | ⬜ Phase 1 |
| sessions | ⬜ Phase 1 |
| api-keys | ⬜ Phase 1 |
| csrf | ⬜ Phase 1 |

Phase 1 also covers the frontend `/auth/*` pages (login, register, forgot-password, reset-password,
verify-email, undo-password-change) and `settings/{api-keys,sessions,security}`, plus their mobile
equivalents — see [../../frontend/README.md](../../frontend/README.md) and
[../../mobile/README.md](../../mobile/README.md).
