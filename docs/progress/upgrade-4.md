# Upgrade audit #4 — the P2 backlog carried over from `upgrade-3.md`

> Written 2026-07-12. `upgrade-3.md`'s Critical (#1-#5) and High-priority
> (#6-#11) findings were re-verified against current code (not just commit
> messages) and are all confirmed fixed: DI wiring, outbox SQL quoting, the
> Playwright `storageState` fix, the `.env.example` port swap, the
> `devActivateUser` allowlist, admin role-hierarchy checks, MFA backup-code
> recovery, `posts/[uuid]` metadata, `config.spec.ts`'s `DATABASE_URL`, the
> session-scoped CSRF cache, and the Elasticsearch compatibility headers —
> 273/273 backend unit tests pass and a live Docker boot is healthy.
>
> What's left is exactly `upgrade-3.md`'s P2 ("nice to have") list, confirmed
> still open by re-reading the current code below. Nothing here blocks
> calling the app production-ready; this is routine hardening/debt.

**Priorities:** all `P2` here (nice to have, no correctness risk). **Effort:**
S (< ½ day) · M (1–2 days) · L (multi-day).

---

## Backend

1. **`setUserTier` has no `AuditLog` entry.**
   `src/authorization/admin.resolver.ts:112-128` — its sibling
   `setUserStatus` (lines 130-156) correctly calls `prisma.auditLog.create`
   after the mutation; `setUserTier` still doesn't. **Fix (S):** add the same
   `auditLog.create` call, mirroring `setUserStatus`'s shape.

2. **No OTel collector deployed — traces/metrics still export to nowhere.**
   Confirmed live: the running container spams
   `connect ECONNREFUSED 127.0.0.1:4318` on every export interval. The
   `diag.setLogger` fix from a prior audit made this visible instead of
   silent, but the underlying gap (no `OTEL_EXPORTER_OTLP_ENDPOINT`, no
   collector in `docker-compose.yml`) is unchanged. **Fix (M):** deploy a
   collector (or point `OTEL_EXPORTER_OTLP_ENDPOINT` at one already run
   elsewhere), or drop OTel init entirely until one exists.

3. **Backend CI still has no full-repo `fallow` gate and never runs
   `test:cov`.** `package.json`'s only `fallow` invocation remains the
   diff-scoped check inside the `prebuild` hook
   (`"prebuild": "prisma generate && pnpm fallow-check"`); there is no
   standalone dead-code/dupes job the way the frontend CI has one. `test:cov`
   is never invoked in `.github/workflows/ci.yml` either — coverage is
   produced locally at best. **Fix (S):** add a `fallow audit --ci` step and
   a `pnpm test:cov` step to the backend workflow, same shape as the
   frontend's.

4. **`mfa/`, `push-notification/`, `comment/`, `redis/`, `auth/oauth/` still
   have zero `.spec.ts` files.** Confirmed by directory search — no test
   files exist in any of the five. `mfa/` is the sharpest gap given MFA
   backup-code recovery (closed in `upgrade-3.md` #7) now lives there
   entirely untested. **Fix (M):** start with `mfa.service.spec.ts` covering
   `verify`/`disable`/`resetMfa`/backup-code redemption, then work through
   the rest.

5. **`e2e/standalone.spec.ts` shells out to `docker build` locally.** Fails
   immediately in any sandbox without a Docker daemon
   (`execSync("docker build ...")`); worth confirming this actually runs (and
   passes) in real CI, since the `Dockerfile` isn't otherwise built or
   scanned anywhere in `ci.yml`. **Fix (S):** verify in CI logs, or add an
   explicit CI step that builds/smoke-tests the image outside this Playwright
   spec so the coverage doesn't depend on a sandboxed test runner having
   Docker available.

## Frontend

6. **MFA challenge form hardcodes English strings.**
   `src/features/auth/ui/login-form.tsx:137,146,162,172` — "Two-Factor
   Authentication", "Authentication code", "Verify", "Verifying..." are all
   literals, while the same file already imports and uses `useMessages("auth")`
   (line 75) for every other string on the page. **Fix (S):** route these
   four strings through `t()` like the rest of the form, and add the keys to
   both locale message files.

7. **Generated i18n files show as locally modified after every build.**
   `src/generated/i18n-messages-{en,tr}.json` + `.d.ts` are committed, but the
   `prebuild` hook regenerates them on every `pnpm build` — running the
   generator produces a clean diff against `HEAD` today, so this isn't drift,
   just `git status` noise. **Fix (S):** `.gitignore` the generated output
   and generate it as part of `prebuild`/CI instead of committing it.

8. **CHANGELOG `[Unreleased]` still doesn't mention anything from `77f6817`
   onward.** Confirmed — `git log 77f6817..HEAD -- CHANGELOG.md` is empty.
   MFA challenge UI, admin ban/suspend, the CSRF cache rewrite, the e2e auth
   fixture, and everything in `upgrade-3.md`/this doc are all unlisted.
   **Fix (S):** add an `[Unreleased]` entry summarizing the security/audit
   fixes landed since `77f6817`.

9. **Tier-view duplication is structurally unresolved.** Confirmed by line
   count: `chat-room`'s Free/Medium/Premium views are 365/359/362 lines each
   (~99% overlap), `posts/[uuid]`'s are 246/265/289, `feed`'s are 57/61/63 —
   all three trios remain fully duplicated rather than sharing a common
   base + tier-specific slots. The settings-page instance is already fixed by
   aliasing (all 4 settings pages alias Basic/Medium/Premium directly to
   `FreePageView` — a real structural improvement), but the surviving trios
   don't follow that pattern yet. **Fix (L):** extract the shared layout per
   page into a base component parameterized by tier-specific render props/
   slots, the way the settings pages already do via aliasing where the tiers
   are identical, or a shared-base-plus-overrides pattern where they're not.

10. **No `eslint-plugin-jsx-a11y`, no `@axe-core/playwright`, no
    `dependency-cruiser`.** Confirmed absent from `package.json`. **Fix (S):**
    add `eslint-plugin-jsx-a11y` to the ESLint config, `@axe-core/playwright`
    as an e2e a11y smoke check on a couple of key pages, and
    `dependency-cruiser` as an import-graph/circular-dependency CI gate.

11. **Zero e2e coverage for checkout/billing, settings sub-pages, admin
    audit-logs, chat-room.** Previously blocked on the login fixture being
    broken (`upgrade-3.md` #3); that's fixed now, so this is unblocked but
    still not written. **Fix (M):** add Playwright specs for these four
    surfaces now that the authenticated fixture actually produces a valid
    `storageState`.

12. **Skeleton-component triplication and one `lib/`→`features/` import
    direction violation remain.** `src/lib/auth-ssr.ts:8` still imports
    `User` from `@/features/auth/hooks/useAuth` — confirmed unchanged,
    `lib/` importing from `features/` inverts the intended dependency
    direction. **Fix (S):** move the shared `User` type to `lib/` (or a
    neutral `types/` module) and have both `lib/auth-ssr.ts` and the feature
    hook import it from there.

---

## Suggested execution order

1. **#1, #3, #8** — cheapest, purely additive (audit log parity, CI gates,
   changelog entry).
2. **#6, #12, #7** — small, self-contained cleanups with no design decisions
   attached.
3. **#4, #11** — test-coverage debt; #4 (MFA unit tests) first since it's the
   highest-stakes untested code path in the backend.
4. **#2, #10** — infra/tooling additions that need a deployment or config
   decision (where does the collector live, which a11y checks run in CI).
5. **#9** — the only L-effort item; worth scoping as its own follow-up rather
   than folding into a batch with the rest.
6. **#5** — just needs confirmation it passes in real CI; not a code change
   unless that check reveals otherwise.
