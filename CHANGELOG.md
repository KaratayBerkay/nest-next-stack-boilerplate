# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Admin `setUserTier` now writes an `AuditLog` entry (parity with `setUserStatus`)
- Prisma migrate uses `--force-reset` for breaking schema changes
- AGENTS.md rules enforced: inline types extracted, `"use client"` components moved to `src/views/`, oversized page files split
- CI workflows moved from `nest-js-boilerplate/.github/workflows/` and `next-js-boilerplate/.github/workflows/` to the repo-root `.github/workflows/` — GitHub Actions never scanned the subdirectory paths, so neither backend nor frontend CI had ever actually run
- `useAuth.tsx` ↔ `types/auth/AuthProvider-types.ts` circular import (leftover from the `User`-type migration), caught by the new `dependency-cruiser` `no-circular` gate
- `e2e/setup.spec.ts`'s `storageState` cookie shaping, which was breaking every authenticated Playwright spec (`browser.newContext()` rejected a Set-Cookie with both `url` and `domain` set)
- 348 pre-existing files failing `prettier --check`, repo-wide — needed so the now-functional CI's format-check step doesn't fail on the first real run
- `OpenTelemetry` init no longer runs unconditionally (`OTEL_ENABLED=true` opt-in) — was spamming failed OTLP exports with no collector deployed
- Full `eslint-plugin-jsx-a11y` recommended ruleset enabled and ~20 files' real violations fixed (was previously only the partial subset `eslint-config-next` enables by default)

### Added

- MFA challenge form i18n — hardcoded English strings replaced with `t()` calls
- `User` type moved to `src/types/auth/User.ts` to fix `lib/` → `features/` import direction
- Generated i18n files (`.json` + `.d.ts`) gitignored; regenerated in prebuild
- Backend unit tests for `mfa/`, `push-notification/`, `comment/`, `redis/`, `auth/oauth/` (previously untested)
- `dependency-cruiser` import-graph/circular-dependency CI gate (`pnpm depcruise`)
- `@axe-core/playwright` a11y smoke check on home + feed pages (`e2e/a11y.spec.ts`)
- Playwright specs for checkout/billing, settings sub-pages, admin audit-logs, chat-room
- Backend CI now runs `test:cov` and `fallow dead-code`/`fallow dupes`, matching the frontend's shape

### Changed

- Upgraded-3 critical and high-priority findings verified fixed (DI wiring, outbox SQL, Playwright `storageState`, CSRF cache, Elasticsearch compat headers)
- `chat-room`, `posts/[uuid]`, `feed` tier views (Free/Medium/Premium) refactored from ~99%-duplicated trios into a shared base component + tier-specific config/slots
