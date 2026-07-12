# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Admin `setUserTier` now writes an `AuditLog` entry (parity with `setUserStatus`)
- Prisma migrate uses `--force-reset` for breaking schema changes
- AGENTS.md rules enforced: inline types extracted, `"use client"` components moved to `src/views/`, oversized page files split

### Added

- MFA challenge form i18n — hardcoded English strings replaced with `t()` calls
- `User` type moved to `src/types/auth/User.ts` to fix `lib/` → `features/` import direction
- Generated i18n files (`.json` + `.d.ts`) gitignored; regenerated in prebuild

### Changed

- Upgraded-3 critical and high-priority findings verified fixed (DI wiring, outbox SQL, Playwright `storageState`, CSRF cache, Elasticsearch compat headers)
