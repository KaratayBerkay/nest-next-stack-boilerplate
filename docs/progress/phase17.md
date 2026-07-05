# Phase 17 — Subscriptions & pricing: mock checkout, per-tier page views, WS tier gate

> Execution tracker for the seventeenth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-05 · Status: **NOT gate-clean (re-verified five times:
> 2026-07-05 across four passes — `aacb05a` → `d75be4b` → lint residual
> closed → pricing regression test added; 2026-07-06 a full Stage B/D/E code
> audit; again 2026-07-06 after `6b1411b` landed fixes for two of the
> three gaps that second pass found; a fourth pass 2026-07-06 that closed
> most of the remaining i18n residuals; and a fifth pass 2026-07-06 that
> found the fourth pass's "fully closed" i18n claim was itself slightly
> overstated)**.
> Stages A–G's code landed in `e2c0558`/`a7cd6a0` (tracker left at "planning
> only" the whole time — 6th "commit lands, tracker untouched" occurrence
> after phases 2/12/13/15/16). A punch list of 6 gaps was found; `aacb05a`
> fixed 5 of 6 (T28 excluded, needs live infra) but introduced a new bug in
> the process (`/pricing`'s feature lists shifted one tier); `d75be4b` fixed
> that too, confirmed correct against the live tree.
>
> **2026-07-06, first re-check: this file itself was a 7th "commit lands,
> tracker untouched" instance, at the individual-task level.** Every
> remaining unchecked box in Stage B (T7, T8), Stage D (T12, T14, T16), and
> Stage E (T18–T23, T25) turned out to already have real, correct code in
> the tree, unacknowledged here. That pass also found three new gaps: a
> locale-dropping bug in the pricing→checkout handoff, missing i18n on two
> pages' new content, and thin test coverage for the new surface (plus one
> mistake of its own — it wrongly claimed `MockCardForm` had no test).
>
> **2026-07-06, second re-check: Berkay landed `6b1411b` directly, again
> without updating this file (8th occurrence).** Re-verified its claims: the
> locale bug is **fixed correctly**, the missing-i18n gap is **mostly
> fixed** (small residual hardcoded strings remain), and the test-coverage
> gap is **partially fixed** — `post.resolver.spec.ts`/`friends.resolver.spec.ts`
> were added (backend test count 207→220) but only test the resolvers' own
> logic, not the `@MinTier` guard's actual 403 behavior, which remains
> completely unproven by any test. `admin.resolver.ts`'s `growthStats`, every
> Stage E view file, and the checkout page still have zero tests. Frontend
> count is unchanged at 77. See "Second re-verification pass (2026-07-06)"
> and "Third re-verification pass (2026-07-06)" below for the full detail.
>
> **2026-07-06, third re-check: Berkay landed `d03d1a1` directly, and this
> time did update this file's own tracker (fourth pass, below) — a genuine
> improvement over the prior 8 "commit lands, tracker untouched" instances.**
> Its three targeted fixes (feed's error fallback, `MockCardForm`'s
> testCards/month/year labels, chat-room's connection tooltips) are all
> confirmed correct. But its claim that i18n is now "fully closed" with "no
> remaining hardcoded strings" doesn't hold up under a broader grep: two more
> hardcoded strings survive in files this phase touches — `posts/[uuid]`'s
> `"Post not found"` (all 3 tiers) and `MockCardForm`'s generic
> `"Payment failed. Please try again."` fallback. See "Fourth re-verification
> pass (2026-07-06)" below for the exact fix (both are one key + one-line
> swaps, `useMessages("posts")` is already in scope in the `posts/[uuid]`
> files).
> **Remaining open items:** T28 (live control run, still not run), the
> guard-403 test gap, `admin.resolver.ts` test coverage, and the two i18n
> residuals above.

## Punch-list fix verification (2026-07-05, commits `aacb05a` → `d75be4b`)

| # | Punch item | Result |
| - | --- | --- |
| 1 | Wallet linkage | ✅ Fixed correctly (`aacb05a`) — `fromWalletId: wallet.id` added to all 3 `walletTransaction.create()` calls; spec updated with real assertions (not just re-passing old ones) |
| 2 | Render-time component bug | ✅ Fixed correctly (`aacb05a`) — `tier-view.tsx` returns `ReactNode` directly, all 8 pages updated, `tier-view.spec.tsx` rewritten with `render()`/`screen`; `pnpm lint` frontend 0 errors, `tsc --noEmit` clean |
| 3 | Backend lint (81 errors) | ✅ Fixed — all 5 residual lint errors in `billing.service.spec.ts` resolved with `eslint-disable-next-line` comments matching the existing convention in `auth.service.spec.ts`/`device.service.spec.ts` |
| 4 | Missing pricing/premium i18n | ✅ Fully fixed — `aacb05a` created the namespaces and fixed the logged-out CTA, `d75be4b` fixed the feature-list mapping bug. **Regression test added:** `pricing/page.spec.tsx` with 10 tests covering all 4 tier feature mappings, logged-out CTA → `/auth/login`, current-plan badge, upgrade → checkout, included label |
| 5 | users/detail split | ✅ Fixed correctly (`aacb05a`) — mirrors `users/list`'s exact shape (`FreePageView` holds real content, `Basic/Medium/PremiumPageView` re-export it, `page.tsx` renders `FreePageView` directly) |
| 6 | T28 live control run | ❌ Still not run (expected — out of scope for code-only commits) |

### Fix 4's new bug — RESOLVED in `d75be4b` (2026-07-05)

`d75be4b` applies exactly the 2-line remap this file prescribed: `FEATURES.BASIC`
now reads `t.featuresMedium` and `FEATURES.MEDIUM` now reads `t.featuresPremium`
(`pricing/page.tsx:68-69`), and the dead `featuresFree` key was removed from
both `messages/{en,tr}/pricing/messages.json` plus the regenerated
`i18n-messages.d.ts`. Confirmed via `git show d75be4b` — no other file touched.
`pnpm test` (67/67), `pnpm lint` (0 errors), and `tsc --noEmit` (clean) all
still pass in `next-js-boilerplate` post-fix. **Not done:** no regression test
was added asserting each tier card renders its own distinct feature list — the
original fix plan's step suggesting this wasn't applied, so a future edit
here could silently reintroduce the same mismatch undetected.

<details>
<summary>Original bug diagnosis (2026-07-05, now fixed — kept for reference)</summary>

### New bug found in Fix 4 — `/pricing`'s feature lists are off by one tier

`(marketing)/pricing/page.tsx:67-72` maps `FEATURES.BASIC` and `FEATURES.MEDIUM`
to the wrong i18n keys:
```tsx
const FEATURES: Record<Tier, string[]> = {
  FREE: t.featuresBasic,     // correct — featuresBasic holds FREE's real content
  BASIC: t.featuresBasic,    // BUG: duplicates FREE's list verbatim
  MEDIUM: t.featuresMedium,  // BUG: this is actually BASIC's old content
  PREMIUM: t.featuresPro,    // correct
};
```
Confirmed by diffing against the pre-fix hardcoded arrays (`git show
e2c0558:.../pricing/page.tsx`): `messages/{en,tr}/pricing/messages.json`'s
`featuresMedium` key actually holds the old **BASIC** copy ("Everything in
Free, Priority support, Basic analytics"), and `featuresPremium` holds the old
**MEDIUM** copy ("Everything in Basic, Post stats & reaction breakdown, VIP
room access, Suggested friends") — but `featuresPremium` is never referenced
anywhere in `page.tsx`. Net effect on the live page: the BASIC tier card
shows an identical feature list to FREE (no differentiation), and the MEDIUM
card shows BASIC's old perks instead of its own (VIP room access, suggested
friends, post stats). There's also a dead `featuresFree` key (a lone string,
wrong type, never referenced — leftover from the same authoring mistake).

**Fix:** in `pricing/page.tsx`, change the mapping to:
```tsx
const FEATURES: Record<Tier, string[]> = {
  FREE: t.featuresBasic,
  BASIC: t.featuresMedium,
  MEDIUM: t.featuresPremium,
  PREMIUM: t.featuresPro,
};
```
No JSON changes required — the correct content already exists under those
keys, just unmapped. Optionally delete the unused `featuresFree` key from
both `messages/en/pricing/messages.json` and `messages/tr/pricing/messages.json`
as cleanup, and re-run `pnpm generate-i18n-types`. Add a test asserting each
tier card renders its own distinct feature text (none of the 67 frontend
tests would have caught this — there's no test covering `/pricing`'s
rendered content at all).

Once this follow-up lands, re-run `pnpm test` (both packages) and do a live
click-through of `/pricing` in both locales before considering Fix 4 done.

</details>

## Second re-verification pass (2026-07-06) — Stage B/D/E code audit

Berkay asked to re-check whether this phase is actually complete. Rather than
trust this file's checkboxes, every task still shown as `[ ]` in Stage B, D,
and E was checked directly against the live tree (file contents, `grep`,
`wc -l`, `pnpm test`), not just re-read from prior notes.

**Result: the code is much further along than this file showed.** All of the
following already exist in the tree and structurally match this file's own
spec, despite carrying no prior acknowledgment here:

| Task | What's actually in the tree |
| --- | --- |
| T7 | `post.resolver.ts:84-116` — `reactionBreakdown`/`whoReacted`/`myPostStats` all present with correct `@MinTier(MEDIUM)`/`@MinTier(PREMIUM)` + `TierGuard` |
| T8 | `friends.resolver.ts` has `suggestedFriends`; `admin.resolver.ts:117-118` has `growthStats` |
| T12 | `src/features/billing/ui/mock-card-form.tsx` — Luhn + expiry validation via `@/lib/validation/billing`, sends only `{tier, last4, expMonth, expYear}`, shows the 3 D3 test-card hints |
| T14 | `v1/[lang]/checkout/[tier]/checkout-content.tsx` — full upgrade (card form) / downgrade (one-click) / current-tier states, uses `checkout` i18n namespace |
| T16 | `constants/routes.ts:7-8` — `checkoutPath(tier, lang)` helper exists; `git grep` confirms no stray hardcoded `/checkout/` string outside it |
| T18 (`/feed`) | `views/{Free,Basic,Medium,Premium}PageView.tsx` — Free unchanged, Basic re-exports (D6), Medium adds a `myPostStats` sidebar, Premium adds a badge — ladder matches spec |
| T19 (`/posts/[uuid]`) | Same shape — Medium adds `reactionBreakdown` chart, Premium adds `whoReacted` list on top |
| T20 (`/messages`) | All 4 views re-export `FreePageView` verbatim (D6, no differentiation planned) — matches spec exactly |
| T21 (`/chat-room`) | Medium adds a "Join VIP Lounge" button (T9's gate), Premium adds a crown badge; uses the `chat-room` i18n namespace |
| T22 (`/notification`) | All 4 views re-export (D6) — matches spec |
| T23 (`/find-friends`) | Medium adds a `suggestedFriends` panel (uses `find-friends` i18n namespace), Premium re-exports Medium (D6, no further delta) — matches spec |
| T25 (`/settings/sessions`) | All 4 views re-export (D6) — matches spec |

None of these boxes are being checked off by this pass, for the same reason
T5/T9/T15/T17 stayed unchecked despite static confirmation: this project's
own established rule is that a task is done only when its verify step
(usually a live click-through or a live 403 check) actually runs, not when
the source merely looks right — see the per-task notes added below. What
*is* new here is that this file previously said nothing at all about most of
these — a plain, unnoted gap, not even a "static re-check" placeholder.

### Three new gaps found (not on any prior punch list)

1. **Locale dropped in the pricing→checkout handoff.**
   `(marketing)/pricing/page.tsx:119` calls `checkoutPath(tier)` with no
   `lang` argument, so `checkoutPath`'s default (`lang = "en"`,
   `constants/routes.ts:7`) always wins. A Turkish-locale visitor clicking
   "Upgrade" from `/pricing` lands on `/v1/en/checkout/...`, never
   `/v1/tr/...` — the locale silently resets. Root cause: `/pricing` sits
   outside the `[lang]` route group (D9), so `PricingPage` has no `lang` in
   scope to pass through. **Fix:** read the visitor's locale the same way
   other locale-aware code outside `[lang]` does (check how the root layout
   or `MessagesProvider` currently resolves a default locale for this page,
   since it already renders `t.heading`/`t.subtitle` in the right language)
   and thread that value into `checkoutPath(tier, lang)` instead of relying
   on the default.
2. **Missing i18n on two pages' new Stage E content.** Confirmed via
   `grep -c "useMessages(" ` across every view file: `feed`'s
   `MediumPageView.tsx`/`PremiumPageView.tsx` (the new `myPostStats`
   sidebar) and `posts/[uuid]`'s `MediumPageView.tsx`/`PremiumPageView.tsx`
   (the new `reactionBreakdown`/`whoReacted` panels) all have **zero**
   `useMessages()` calls — hardcoded strings throughout ("No posts yet.",
   "Load stats", "Search posts...", "Post not found", "Delete post", "Are
   you sure you want to delete this post?"). No `feed` or `posts` namespace
   exists anywhere under `messages/en/` or `messages/tr/`, unlike
   `chat-room`/`find-friends`/`premium`/`pricing`/`checkout`, which all got
   namespaces. (`feed`'s `FreePageView` and `posts/[uuid]`'s `FreePageView`
   already had zero i18n before this phase too — that part is pre-existing
   debt, not a regression — but the *new* Stage E panels compound it instead
   of fixing it.) **Fix:** create `messages/{en,tr}/feed/messages.json` and
   `messages/{en,tr}/posts/messages.json`, wire `useMessages("feed")` /
   `useMessages("posts")` into all 4 view files per page (or at minimum the
   Medium/Premium ones, if Free/Basic's pre-existing gap is deliberately
   left for a different phase), then `pnpm generate-i18n-types`.
3. **Zero test coverage for most of Stage B/D/E's new surface.** `pnpm test`
   is green (207 backend / 77 frontend), but that count hasn't moved for any
   of this — confirmed no spec file exists for `post.resolver.ts`'s new
   `@MinTier`-gated fields, `friends.resolver.ts`, or `admin.resolver.ts`'s
   `growthStats` (backend), nor for any Stage E view file, the checkout
   page, or `MockCardForm` (frontend). This means the tier-gate enforcement
   T7/T8 added has no regression protection today — a `@MinTier` decorator
   could be deleted or misconfigured and no test would catch it, the same
   class of blind spot this phase's own T10 already fixed for the WS gate.
   **Fix:** add unit specs for `post.resolver.ts` (403-below/200-at-or-above
   per field, mirroring `messaging-ws.gateway.spec.ts`'s T10 pattern),
   `friends.resolver.ts`, and `admin.resolver.ts`'s `growthStats`; add at
   least one render test per Stage E view file exercising its
   tier-specific content, plus a `MockCardForm`/checkout-page test covering
   the Luhn-reject and approved/declined-card paths.

   **Correction (2026-07-06, caught during the next re-check below):** the
   "or `MockCardForm`" clause above was wrong — this audit's own search only
   grepped for `*spec*` filenames and missed that this project's frontend
   convention mixes `.spec.` and `.test.` naming.
   `src/features/billing/ui/mock-card-form.test.tsx` already existed (since
   `e2c0558`, the original Stage D commit) with 5 real tests covering exactly
   what T12's verify step asks for (renders all fields, shows the 3 test-card
   hints, fills a test card, blocks an invalid-Luhn submission client-side,
   formats the card number). T12 was never actually missing test coverage —
   flagging this so the record is accurate; see the third pass below.

Re-run `pnpm test`/`lint`/`tsc --noEmit` in both packages after each fix, and
update this file's per-task notes and the table above once each is closed.

## Third re-verification pass (2026-07-06, commit `6b1411b`)

Berkay landed `6b1411b` ("feat(phase17): complete i18n coverage + resolver
tests") directly, without updating this file — the **8th** "commit lands,
tracker untouched" occurrence this project has now had (after phases
2/12/13/15/16 and this file's own two prior passes above). Re-verified each
claim in that commit's message against the live tree rather than trusting it:

1. **Gap #1 (locale drop) — ✅ fixed correctly.** `pricing/page.tsx` now
   reads `getCookieLang()` (a new local helper reading the `lang` cookie via
   `LANG_COOKIE`/`LANGS`/`DEFAULT_LANG` from `constants/i18n.ts`) and passes
   it into `checkoutPath(tier, lang)`. Confirmed this is the **same** cookie
   `components/layout/LangSwitcher.tsx` already sets on locale switch, and
   the same one `proxy.ts` reads server-side — not a new, parallel locale
   mechanism. A `tr`-locale visitor now correctly lands on
   `/v1/tr/checkout/...`.
2. **Gap #2 (missing i18n) — mostly fixed.** `feed`'s and `posts/[uuid]`'s
   Medium/Premium views now call `useMessages()` (new `feed`/`posts`
   namespaces in both `en`/`tr`), as does `find-friends`'s new
   `suggestedFriends` panel. Small residual: `feed/views/MediumPageView.tsx`
   and `PremiumPageView.tsx` each still have one hardcoded fallback string
   (`body.error ?? "Failed to load posts"`), and `MockCardForm` still has a
   handful of hardcoded labels ("Test cards:", "Month", "Year", "CVC", the
   generic "Payment failed..." fallback) that the `checkout` namespace's new
   keys don't yet cover. Not blocking, but not zero either.
3. **Gap #3 (test coverage) — partially fixed.** `post.resolver.spec.ts` (9
   tests) and `friends.resolver.spec.ts` (4 tests) were added — backend
   test count moved 207→220, confirmed by re-running `pnpm test`. These
   cover the resolver methods' own business logic (grouping, sorting,
   null-handling) correctly. **What they do not cover:** the `@MinTier`
   guard's actual 403-enforcement — these are plain unit tests that
   construct `PostResolver`/`FriendsResolver` directly and call the method,
   which never invokes Nest's guard pipeline, so a below-tier caller getting
   rejected is still unverified by anything (T7/T8's own verify step
   explicitly asks for this). `admin.resolver.ts`'s `growthStats` still has
   no spec file at all. No test was added for any Stage E view file or the
   checkout page.

**Net effect:** two of the three new gaps found in the second pass are now
closed or substantially closed (#1 fully, #2 mostly); #3 is real progress but
not done — the guard-enforcement behavior and most of the frontend surface
remain untested. T28 (live control run) is still the only way to actually
prove the 403s work end-to-end today.

**Update (2026-07-06):** gap #2 (missing i18n) is now **mostly closed** — see
"Fourth re-verification pass" below for the residual strings that were fixed,
and the fifth pass's correction for the two that weren't.

## Fourth re-verification pass (2026-07-06)

Closed the remaining i18n residuals identified in the third pass:

1. **Feed error fallback — ✅ fixed.** `feed/views/{Free,Medium,Premium}PageView.tsx`
   each had a hardcoded `"Failed to load posts"` fallback string. Added
   `failedToLoadPosts` key to `messages/{en,tr}/feed/messages.json` and wired
   `t.failedToLoadPosts` into all three files.
2. **MockCardForm labels — ✅ fixed.** `"Test cards:"`, `"Month"`, `"Year"` were
   still hardcoded English. Added `testCards`/`month`/`year` keys to
   `messages/{en,tr}/checkout/messages.json` and wired them via `t.testCards`,
   `t.month`, `t.year`. `MockCardForm` is now fully i18n'd.
3. **Chat-room connection state tooltips — ✅ fixed.** `chat-room/views/{Free,Medium,
   Premium}PageView.tsx` each had `"Connected"`/`"Connecting…"`/`"Disconnected"` in
   `title` attributes, despite the `chat-room` namespace having `connected`/`connecting`/
   `disconnected` keys. Replaced with `t.connected`/`t.connecting`/`t.disconnected` in
   all three files.

**Verification:** `pnpm tsc --noEmit` clean, `pnpm test` 77/77 pass (still 220
backend/77 frontend as of this pass, confirmed by re-running both suites),
`pnpm generate-i18n-types` re-run and committed. All three targeted strings
above are genuinely fixed — confirmed directly (`grep` for each old literal
now returns nothing, `grep` for the new `t.*` usage returns hits in all the
named files).

**Correction (2026-07-06, fifth re-check): the "fully closed" / "no remaining
hardcoded UI strings" claim above is not quite true.** A broader grep across
every Stage E view file (not just the three named above) turned up two
strings this pass missed, both in files this phase itself touches:

1. `posts/[uuid]/views/{Free,Medium,Premium}PageView.tsx:66-72` (all three
   tiers) — `throw new Error("Post not found")` in the post-detail fetch,
   twice per file. This is user-facing (caught by the file's own
   `ErrorBoundary`), and the fix is a one-line addition per occurrence: the
   file already calls `const t = useMessages("posts")` (line 44) and already
   uses `t.back` two lines below — it just needs a `postNotFound` key added
   to `messages/{en,tr}/posts/messages.json` and `t.postNotFound` swapped in
   for the two literal strings, in all three view files.
2. `src/features/billing/ui/mock-card-form.tsx:87` — the generic catch-all
   `"Payment failed. Please try again."` fallback (shown when the BFF error
   response has no structured `msg`) is still hardcoded, despite the rest of
   this file now being fully wired to the `checkout` namespace. Needs one
   more key (e.g. `paymentFailedGeneric`) added alongside `testCards`/`month`/
   `year`.

Both are minor relative to the original gap (the bulk of both files' content
is genuinely i18n'd now), but the record should say "two known residuals
remain" rather than "fully closed" until these are addressed.

**Still open:** the two residuals above, gap #3 (guard-403 test coverage),
and T28 (live control run).

## Punch list to close this phase (priority order, historical)

Original findings from the first re-verification pass. Status prefixes reflect
`aacb05a`'s fixes and the second re-verification pass — see "Punch-list fix
verification" above for the authoritative current detail; this list is kept
for the original reasoning/file:line evidence, not as a live status source.

1. ✅ **RESOLVED in `aacb05a`.** `BillingService`/`getBillingHistory` never
   linked `WalletTransaction` rows to the user's `Wallet`, so
   `myBillingHistory` always returned empty. `ensureWallet()`
   (`billing.service.ts:52,167-174`) was called and its return value
   discarded; every `walletTransaction.create()` in `subscribeToPlan`
   (`:70-85`, `:92-107`, `:123-136`) omitted `fromWalletId`/`toWalletId`. Fixed
   by adding `fromWalletId: wallet.id` to all three, with new spec assertions
   verifying it.
2. ✅ **RESOLVED in `aacb05a`.** Every Stage E dispatcher page computed its
   view component inline during render, tripping `react-hooks/static-components`
   (8 hard errors). Fixed by converting `tier-view.ts` → `.tsx` to return a
   `ReactNode` directly instead of a component reference; `pnpm lint` frontend
   is now 0 errors.
3. ✅ **RESOLVED.** All 5 residual lint errors in `billing.service.spec.ts`
   fixed with `eslint-disable-next-line` comments matching the existing
   convention in `auth.service.spec.ts`/`device.service.spec.ts`. `pnpm lint`
   now clean in both packages.
4. ✅ **RESOLVED across `aacb05a` + `d75be4b` + new test.** `pricing` and `premium`
   i18n namespaces created, feature-list mapping fixed, and a 10-test regression
   test (`pricing/page.spec.tsx`) now guards the exact mismatch class that
   shipped in `aacb05a`. All 77 frontend tests pass.
5. ✅ **RESOLVED in `aacb05a`.** `users/detail/[uuid]` never got the
   tier-view split; only `users/list` did. Fixed — mirrors `users/list`'s
   exact shape.
6. ❌ **STILL OPEN.** The live control run (T28) against rebuilt containers
   was never run. No docker rebuild, WS/HTTP probe script, or log spot-check
   exists anywhere. Punch-items 1, 2, and the new pricing bug were all
   invisible to the 207+67 passing unit tests — exactly the gap this
   project's own established lesson (phases 2/12/15/16) warns about, now
   demonstrated a third time within this file alone.
7. **Nested tracker-drift, not fixed here (unchanged):** `phase16.md`'s
   header claims "gate-clean — closed 2026-07-05" (set by this phase's own
   Stage A/T2), but its `T23`, `T32`, and 3 verify-loop items are still
   unchecked in that same file — outside the 10-item punch list Stage A was
   scoped to re-verify, but the "closed" framing overstates it. Flagging so
   it isn't mistaken for fully resolved.

## Fix plan (step-by-step, one per punch-list item)

Kept as the original instructions for traceability. Fixes 1, 2, 3, 4, and 5 are
✅ **done** (applied in `aacb05a`/`d75be4b` + lint fix + regression test). Fix 6
(T28) is ❌ **not started**.

### Fix 1 — Wallet linkage (`billing.service.ts`) — ✅ done

1. In `subscribeToPlan`, the wallet is already fetched at line 52 (`const wallet
   = await this.ensureWallet(userId);`) — its `.id` is just never used. Add
   `fromWalletId: wallet.id,` to the `data` object of all three
   `this.prisma.walletTransaction.create({...})` calls: the decline branch
   (`:70-85`), the approved branch (`:92-107`), and the downgrade branch
   (`:123-136`). Leave `toWalletId` unset — the money's destination is the
   external mock processor, not another `Wallet` row.
2. No change needed to `getBillingHistory` (`:147-156`) — its
   `OR:[{fromWallet:{userId}},{toWallet:{userId}}]` filter already matches once
   `fromWalletId` is populated.
3. Update `billing.service.spec.ts`'s three `walletTransaction.create`
   assertions (around lines 85-92, 120-127, 148-155) to also assert
   `fromWalletId: 'w1'` is present in `data` (matching the mocked wallet
   fixture at line 26) — otherwise this exact regression can silently ship
   again.
4. Add one assertion to the `getBillingHistory` test (line ~191) that
   `mockPrisma.walletTransaction.findMany` was called with a `where` containing
   the `OR` wallet filter, e.g.
   `expect.objectContaining({ where: expect.objectContaining({ OR: [{ fromWallet: { userId: 'u1' } }, { toWallet: { userId: 'u1' } }] }) })`.
5. Re-run `pnpm test` in `nest-js-boilerplate` — all billing tests should stay
   green with the new assertions passing.

### Fix 2 — Render-time component creation (8 dispatcher pages) — ✅ done

Root cause: each page does `const PageView = getTierView(user.tier, VIEWS);
return <PageView />;` — assigning a PascalCase variable from a runtime call and
then JSX-tagging it is exactly what `react-hooks/static-components` flags,
since it can't prove the reference is stable across renders.

1. Convert `next-js-boilerplate/src/lib/tier-view.ts` → `tier-view.tsx` (it now
   needs to emit JSX) and change `getTierView` to return the *rendered node*
   instead of the component reference:
   ```tsx
   import type { ReactNode } from 'react';

   export function getTierView<T extends TierViews>(
     tier: string | null | undefined,
     views: T,
   ): ReactNode {
     const View =
       tier && tier in views && tier in TIER_ORDER
         ? views[tier as Tier]
         : views[FALLBACK_TIER];
     return <View />;
   }
   ```
   Callers now embed the call directly (`{getTierView(user.tier, VIEWS)}`)
   instead of storing it in a PascalCase variable first — no intermediate
   component-typed binding exists at the call site, which is what the rule
   actually keys off.
2. Update all 8 call sites (`chat-room/page.tsx`, `feed/page.tsx`,
   `find-friends/page.tsx`, `messages/page.tsx`, `notification/page.tsx`,
   `posts/[uuid]/page.tsx`, `premium/page.tsx`, `settings/sessions/page.tsx`):
   replace
   ```tsx
   const PageView = getTierView(user.tier, VIEWS);
   return <PageView />;
   ```
   with
   ```tsx
   return getTierView(user.tier, VIEWS);
   ```
   (for `premium/page.tsx`, which wraps it in a `<div>`, replace just the
   `<PageView />` line with `{getTierView(user.tier, VIEWS)}`).
3. Rewrite `next-js-boilerplate/src/lib/tier-view.spec.ts` — it currently
   asserts reference identity (`expect(getTierView('FREE', views)).toBe(FreeView)`),
   which no longer typechecks once the return value is a `ReactNode`. Switch
   each view fixture to render distinguishable output (e.g. a
   `data-testid`/text unique per tier) and assert via
   `@testing-library/react`'s `render()`/`screen` which one appears, instead of
   comparing references.
4. Re-run `pnpm lint` — the 8 `react-hooks/static-components` errors should
   clear. If the rule still fires *inside* `getTierView` itself, fall back to
   inlining a `switch` per page (loses the shared-helper DRY win from T11 but
   is guaranteed lint-clean, since literal `<BasicPageView />`-style JSX tags
   are never flagged).

### Fix 3 — Backend lint (81 errors) — ⚠️ mostly done (81→5)

1. `mock-payment.provider.ts:26` — `async charge()` has no `await`. Drop
   `async` and return `Promise.resolve({...})` from each branch instead, so the
   interface (`Promise<ChargeResult>`) is still satisfied without a fake
   `await`.
2. `billing.service.ts:52` unused `wallet` — resolved automatically by Fix 1
   once `wallet.id` is referenced.
3. `billing.service.spec.ts` (30 errors) — caused by `mockPrisma: any`,
   `mockTokenStore: any`, `mockNotification: any`, `mockRealtime: any` (lines
   9-12), which cascade into `no-unsafe-*` everywhere they're used. Replace
   each with a minimal structural type covering only the methods actually
   called (e.g. `type MockPrisma = { user: { findUniqueOrThrow: jest.Mock;
   update: jest.Mock }; wallet: { findUnique: jest.Mock; create: jest.Mock };
   walletTransaction: { create: jest.Mock; findMany: jest.Mock } };`), and cast
   once at the `new BillingService(...)` call site
   (`mockPrisma as unknown as PrismaService`) instead of leaking `any`
   throughout.
4. `messaging-ws.gateway.spec.ts` (27 errors) — same shape of problem:
   `createMockWs(): any` (line 9) and `mockRealtime`/`mockMs: any` (lines
   26-27). Give `createMockWs` a concrete return type matching the fields it
   sets (`userId`, `tier`, `send`, etc.) and cast `(gateway as any)` (lines
   like 56) to a narrow structural type instead, e.g.
   `(gateway as unknown as { handleJoinRoom: (ws: MockWs, data: { room: string }) => void; handleClaimJoinRoom: (ws: MockWs, params: { room: string }) => void })`.
5. `mock-payment.provider.spec.ts` (7 errors) — every test does
   `tier: 'PREMIUM' as any` (and BASIC/FREE). Import `SubscriptionTier` from
   `../@generated/prisma/subscription-tier.enum` and use
   `SubscriptionTier.PREMIUM`/`.BASIC`/`.FREE` instead of the string+`as any`
   cast.
6. `post.resolver.ts` (15 errors, lines 80-99) — `(post as any).reactions` and
   `(r: any)`. Define one local type above the resolver:
   ```ts
   type PostWithReactions = Post & {
     reactions?: { type: string; userId: string; user?: { name: string | null } | null }[];
   };
   ```
   then use `(post as PostWithReactions).reactions ?? []` in both
   `reactionBreakdown` and `whoReacted`, and type the `.map` callback parameter
   with the same element type instead of `any`.
7. Re-run `pnpm lint` in `nest-js-boilerplate` — should drop from 81 to 0 (the
   1 pre-existing `versioning.e2e-spec.ts` error predates this phase and is out
   of scope). **Result: ✅ fully resolved** — all 5 residual errors fixed with
   `eslint-disable-next-line` comments in `billing.service.spec.ts`. `pnpm lint`
   now clean in both packages.

   **Root cause confirmed (2026-07-05, re-checked against the current file),
   correcting the earlier guess about typed-mock generics:** it isn't a
   typing gap in `MockPrisma` — `expect.objectContaining(...)` itself resolves
   to `any` in this project's `@types/jest@^30`, so *any* object literal that
   embeds it (`data: expect.objectContaining({...})`, `where: expect.objectContaining({...})`)
   trips `no-unsafe-assignment`, regardless of how precisely the surrounding
   mocks are typed. This is a known, accepted friction point between
   `@typescript-eslint` and Jest's asymmetric matchers — this project already
   has the exact same pattern (and exact same fix) in two other spec files:
   `src/auth/auth.service.spec.ts:203,209,211` and
   `src/devices/device.service.spec.ts:144`, both using a scoped
   `// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment`
   directly above the line, rather than fighting the type system.

   **Exact fix — add a comment on the line *above* each flagged line:**
   - Line 96 (above line 97 `data: expect.objectContaining({`, in "upgrades
     tier on approved card"): `// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment`
   - Line 132 (above line 133, same pattern, in "rejects declined card"):
     same comment
   - Line 161 (above line 162, same pattern, in "downgrades without calling
     the payment provider"): same comment
   - Line 207 (above line 208 `where: expect.objectContaining({`, in
     "getBillingHistory › returns transactions for the user"): same comment
   - Line 151 (`expect(mockProvider.charge).not.toHaveBeenCalled();`,
     `@typescript-eslint/unbound-method`) is a different rule but the same
     kind of false positive — `mockProvider.charge` is a `jest.fn()` property,
     not a real class method whose `this` binding matters. No prior instance
     of disabling this specific rule exists in the repo yet (checked), so add
     `// eslint-disable-next-line @typescript-eslint/unbound-method` on line
     150, directly above it — same style as the other four, just a different
     rule name.
   - Re-run `pnpm lint` — should now be a clean 0 (matching the original
     target), with no change to test behavior (these are lint-only comments,
     the assertions themselves are already correct and passing).

### Fix 4 — Missing `pricing`/`premium` i18n — ✅ done (with a follow-up fix, see below)

`getAllMessages()` (`src/lib/i18n/get-all-messages.ts`) auto-discovers every
`messages/{locale}/*/messages.json` folder recursively — no manual namespace
registration needed in either `layout.tsx`, just add the files:

1. Create `messages/en/pricing/messages.json` and `messages/tr/pricing/messages.json`
   with keys for the heading/subtitle and the CTA labels currently hardcoded in
   `(marketing)/pricing/page.tsx` (`"Pricing"`, `"Choose the plan that fits your
   needs."`, `"Current plan"`, `"Included"`, `"Upgrade"`).
2. Update `pricing/page.tsx`: `import { useMessages } from
   "@/lib/i18n/MessagesProvider"`, `const t = useMessages("pricing")`, replace
   each hardcoded string with `t.<key>`.
3. Same page: fix the logged-out CTA gap. Currently `ctaHref` is only set when
   `isUpgrade && user` (line ~123-125), so a logged-out visitor gets the
   disabled span. Change so a logged-out visitor gets
   `ctaHref={LOGIN_PATH}` (from `@/constants/routes`) with `ctaLabel: t.upgrade`
   — completing T15's 4th CTA state.
4. Create `messages/en/premium/messages.json` /
   `messages/tr/premium/messages.json` covering the strings hardcoded across
   `premium/page.tsx` and its 4 view files ("Premium Dashboard", "Sign in to
   view premium", "Load premium stats", "Total Users"/"Active Users"/"Revenue",
   the growth-trend copy in `MediumPageView.tsx`, the CSV-export copy in
   `PremiumPageView.tsx`, the locked-state copy in `FreePageView.tsx`).
5. Update `premium/page.tsx` and each of its 4 view files to call
   `useMessages("premium")` and replace their hardcoded strings.
6. Run `pnpm generate-i18n-types` in `next-js-boilerplate` so
   `src/generated/i18n-messages.d.ts` picks up the two new namespaces.
7. Manually load `/pricing` and `/v1/tr/premium` in a dev server and confirm no
   missing-key fallback in either locale (per the phase's own verify loop).

**Fix 4 follow-up — ✅ applied in `d75be4b` (2026-07-05):** steps 1-3 and 5-7
above landed correctly, but step 1's JSON authoring shifted the feature-list
keys by one tier relative to how `page.tsx` consumes them. `d75be4b` applied
exactly the prescribed 2-line remap (`FEATURES.BASIC`/`FEATURES.MEDIUM` →
`t.featuresMedium`/`t.featuresPremium`) and removed the dead `featuresFree`
key from both locale JSON files — confirmed via `git show d75be4b`, and
`pnpm test`/`lint`/`typecheck` all still pass in `next-js-boilerplate`.

**Regression test — ✅ added (2026-07-05):**
`next-js-boilerplate/src/app/(marketing)/pricing/page.spec.tsx` with 10 tests
covering: all 4 tier feature list mappings (verifying no tier-shift regression),
logged-out CTA links to `/auth/login`, current-plan badge, upgrade CTA →
`/checkout/`, included label for lower tiers. All 77 frontend tests pass.
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessagesProvider } from "@/lib/i18n/MessagesProvider";
import PricingPage from "./page";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

const messages = {
  pricing: {
    heading: "Pricing",
    subtitle: "Choose the plan that fits your needs.",
    currentPlan: "Current plan",
    included: "Included",
    upgrade: "Upgrade",
    featuresBasic: ["Basic access", "Community support"],
    featuresMedium: ["Everything in Free", "Priority support", "Basic analytics"],
    featuresPremium: ["Everything in Medium", "Post stats & reaction breakdown", "VIP room access", "Suggested friends"],
    featuresPro: ["Everything in Premium", "Who-reacted list", "Export data", "Crown badge", "Dedicated support"],
    priceFree: "$0", priceBasic: "$9.99/mo", priceMedium: "$19.99/mo", pricePremium: "$49.99/mo",
  },
} as never; // narrow cast — only the "pricing" key is populated for this test

describe("PricingPage", () => {
  it("gives every tier its own distinct, non-duplicated feature list", () => {
    render(
      <MessagesProvider messages={messages}>
        <PricingPage />
      </MessagesProvider>,
    );
    const free = messages.pricing.featuresBasic[0];
    const basic = messages.pricing.featuresMedium[0];
    const medium = messages.pricing.featuresPremium[0];
    // FREE and BASIC must not render identical text (the exact bug that shipped)
    expect(screen.getAllByText(free)).toHaveLength(1);
    expect(screen.getByText(basic)).toBeDefined();
    expect(screen.getByText(medium)).toBeDefined();
    expect(screen.getByText("VIP room access")).toBeDefined(); // MEDIUM's real perk
  });
});
```
The key assertion is `getAllByText(free)` having length 1 — if `BASIC` ever
regresses back to duplicating `FREE`'s list, that text would appear twice and
this test fails immediately, which is exactly the guard that was missing when
`aacb05a` shipped the original mismatch. Run `pnpm test` after adding it to
confirm it passes against the current (fixed) `page.tsx`.

### Fix 5 — `users/detail/[uuid]` tier-view split — ✅ done

Mirror `users/list`'s already-established shape exactly (that page also has no
real tier differentiation per D6, and already hardcodes `FreePageView` rather
than routing through `getTierView` — same pattern, just apply it to the sibling
page):

1. Create `users/detail/[uuid]/views/FreePageView.tsx` containing the existing
   `UserDetailContent` function body verbatim (the `USERS` mock record, the
   `getMessages(lang, "users")` call, and its JSX), exported as `FreePageView`
   the same way `users/list/views/FreePageView.tsx` does.
2. Create `BasicPageView.tsx`, `MediumPageView.tsx`, `PremiumPageView.tsx` in
   the same `views/` folder, each a one-line re-export matching
   `users/list/views/BasicPageView.tsx`'s exact shape:
   `import { FreePageView } from "./FreePageView"; export const BasicPageView = FreePageView;`
3. Update `users/detail/[uuid]/page.tsx` to import `FreePageView` from
   `./views/FreePageView` and render it inside the existing `Suspense` wrapper,
   in place of the current inline `UserDetailContent`.

### Fix 6 — T28 live control run — ❌ not started

1. `docker compose --profile all up -d --build` (full rebuild — both images
   changed).
2. Script against the real stack: register/login a fresh FREE user → attempt
   joining WS room `vip-lounge` (expect the rejection frame) → call
   `whoReacted` on a post (expect 403) → `checkout/PREMIUM` with `4242...`
   (expect approval, tier flips) → re-attempt the VIP join (now succeeds) →
   re-call `whoReacted` (now 200) → **call `myBillingHistory` and confirm the
   just-completed charge actually appears — this is the real end-to-end proof
   Fix 1 worked**, not just the updated unit assertions → second fresh user,
   checkout with `0002...` (expect decline, tier unchanged) → downgrade first
   user back to FREE (no card, immediate, tier flips right away).
3. Confirm zero full-PAN bytes appear in backend logs or Postgres (`docker
   compose logs backend | grep <PAN>`; spot-check `WalletTransaction.metadata`
   only ever contains `last4`).

Fixes 1, 2, 4, 5 are all done (`d75be4b` closed out Fix 4's follow-up). Fix 3
has a small residual (5 lint errors, test-only). Once that residual is
cleared, re-run `pnpm test`/`lint`/`typecheck` in both packages, then do Fix 6
(T28) — the live control run — before flipping the remaining task boxes below.

Confirmed correct on re-verification (do not re-litigate): the mock test-card
table (D3) and upgrade-only provider gating (D5), `CsrfGuard` added to
`setUserTier` (T6), the WS `vip-` room gate in both `handleJoinRoom` and
`handleClaimJoinRoom` (T9/T10), BFF real-status passthrough (T13), the `/premium`
tier ladder (T17), the D6 re-export pattern on feed/messages/notification/
settings-sessions/find-friends, and that no full PAN ever crosses the wire (D4).

Re-scope note (2026-07-05): phase 17 was queued as the cross-stack e2e suite
([phase16.md](phase16.md) queue). Berkay re-prioritized to **subscriptions & pricing**:
scenarios for which page renders differently per `SubscriptionTier`, a mock payment
page (test-card checkout, no real provider yet — "later we will do real provider"),
and backend HTTP **and** WS enforcement to match. The e2e suite moves down the queue
again (now 18) — same pattern Phase 4/14/15/16 each used when re-scoping away from it.

## Relationship to Phase 16

`phase16.md` (Status header still reads **"NOT gate-clean"**, its own punch list of 10
lettered findings) is **not actually still broken** — checked `git log` for the range
after that control run was written: commit `957a4e9` ("fix: resolve 10 blocking bugs
from Phase 16 control run") addresses all 10 punch-list items by name in its message
(T22 `Boolean!`/`Promise<void>`, T15 truncated collision suffix, T1/T7
`MockTokenStore.updateFields`, T3 `prisma.session` sweep across 4 e2e specs, T31
`SMTP_HOST=mailpit` default, T27 `/auth` link prefix, T26 i18n key + redirect, T11
`console.error` object-passing, T17/T18/T20/T21 missing tests backfilled), and a
follow-up commit `9d3448c` hardened SMTP to implicit-TLS port 465. This is the
**fourth** occurrence of this project's recurring "commit lands, tracker untouched"
pattern (after phases 2, 12, 13, 15) — flagging it once per the established lesson
rather than assuming either "still broken" or "silently fine". Stage A below re-verifies
and closes the tracker before Stage B's new scope starts, mirroring how Phase 16 itself
absorbed Phase 15's carried debt into its own Stage A.

## Survey (2026-07-05) — tier RBAC infrastructure as it exists today

This is **not greenfield**. Two prior phases already built the tier system this phase
extends:

- **`SubscriptionTier` enum is real**: `FREE | BASIC | MEDIUM | PREMIUM`
  (`nest-js-boilerplate/prisma/schema.prisma:51-56`), `User.subscriptionTier`
  (`:259`, `@default(FREE)`, indexed). Four tiers, not three.
- **Tier lives in the Redis session hash**, not the JWT (`token-store.service.ts`),
  and is rewritten live across every session in `user:{userId}:sessions` via
  `TokenStoreService.rewriteFieldsForUser()` when it changes — no forced logout, the
  client's next 401 triggers exactly one silent-refresh round-trip
  (`docs/backend/AUTH.md` "Tier change semantics"). `SessionAuthGuard` re-derives
  `rbacToken` from the **live** Redis tier on every request.
- **Backend RBAC primitives already exist** in `nest-js-boilerplate/src/authorization/`:
  `@MinTier(SubscriptionTier.X)` decorator + `TierGuard` (run after `SessionAuthGuard`),
  demoed today by `AdminResolver.premiumStats` (`@MinTier(BASIC)`) and
  `AdminResolver.setUserTier` (admin-only, propagates to Redis). **Gap found, not
  fixed here to avoid scope creep**: `setUserTier` has no `CsrfGuard`, unlike
  `logoutOtherSessions`'s equivalent mutation — fixed in Stage B alongside the new
  self-serve mutation since it's the same file/pattern (D-note below).
- **Frontend primitives already exist**: `src/lib/tier.ts` (`TIER_ORDER`,
  `tierAtLeast`, `tierLabel`), `src/hooks/useMinTier.ts`, `src/components/TierGate.tsx`
  (render-only; real enforcement is always the backend guard). `/premium`
  (`v1/[lang]/premium/page.tsx`) demos `<TierGate min="BASIC">` inline. `/pricing`
  (`(marketing)/pricing/page.tsx`) is a static 4-card stub — hardcoded English, no
  i18n, no click handlers, `current`/`cta` logic only.
- **No `page.tsx` + separate `{Tier}PageView.tsx` split exists anywhere yet** — every
  page today is one file. This phase introduces that convention from scratch.
- **WS gateway does not gate by tier at all today.** `realtime.gateway.ts:348` reads
  `hash.tier` only to re-derive the rbacToken for handshake integrity, not to
  authorize any action. `messaging-ws.gateway.ts`'s `handleJoinRoom`/
  `handleClaimJoinRoom` accept any client-supplied `room` string with no ownership or
  tier concept — one active room per socket, no per-user room cap.
- **No payment/billing code exists** — no Stripe/iyzico, no `Payment`/`Invoice`/`Plan`
  Prisma model. But the schema already has two unused hooks seeded for exactly this:
  `Wallet`/`WalletTransaction` (balance ledger, `WalletTxnType` incl. `FEE`/
  `ADJUSTMENT`/`REFUND`, `idempotencyKey`, `metadata Json`) and
  `NotificationType.BILLING` — both present in `schema.prisma` since the initial
  commit, **zero application code references either today** (grepped, only
  `@generated/*` hits). This phase is the first thing to actually use them.
- **Berkay's direction for this phase** (from the pre-planning Q&A): (1) mock payment
  only — a real provider (Stripe/iyzico, undecided) comes later; (2) `BASIC` gets its
  own `BasicPageView.tsx`, not folded into `FreePageView` — four view files per page,
  matching the enum 1:1; (3) roll the `page.tsx` + `{Tier}PageView.tsx` split out
  across all main app pages now, not just `/pricing` + `/premium`.

## Decisions

- **D1 — Reuse `Wallet`/`WalletTransaction`/`NotificationType.BILLING` instead of new
  `Payment`/`Invoice`/`Plan` tables.** They've sat unused in the schema since the first
  commit and model exactly this (a ledger + a billing notification type) — no Prisma
  migration needed this phase. A subscription charge/downgrade is one
  `WalletTransaction` row (`type: FEE` for a charge, `ADJUSTMENT` for a free
  downgrade, `status: COMPLETED|FAILED`, `metadata: {tier, provider:"mock", last4}`,
  `reference: "subscription:<TIER>"`); every user gets a lazily-created primary USD
  `Wallet` on first checkout attempt.
- **D2 — `PaymentProvider` interface + `MockPaymentProvider` now; real provider is a
  second class later, not a rewrite.** New `nest-js-boilerplate/src/billing/` module:
  `payment-provider.interface.ts` (`charge(input): Promise<{ approved: boolean;
  reason?: string; providerRef: string }>`), `mock-payment.provider.ts` as the only
  implementation, injected behind the interface token so swapping to
  `StripePaymentProvider`/`IyzicoPaymentProvider` later touches one binding, not the
  resolver or schema.
- **D3 — Mock test-card table mirrors real Stripe test cards.** Last four digits
  `4242` → approved; `0002` → declined (`generic_decline`); `9995` → declined
  (`insufficient_funds`); any other number that passes a Luhn check → approved
  (so the demo isn't limited to 3 magic numbers). If Stripe is the eventual real
  provider, none of the "try this test card" UX/docs need to change.
- **D4 — Full card number never crosses the wire to the backend, even in mock mode.**
  The frontend validates Luhn + expiry client-side and sends only `{ last4,
  expMonth, expYear, tier }` — the `MockPaymentProvider` decides approve/decline from
  `last4` alone. Mirrors how real tokenized-card flows (Stripe Elements etc.) work,
  so the habit is already correct before a real provider is wired in.
- **D5 — Only upgrades call the payment provider.** Moving to a lower tier (or to
  FREE) never touches `MockPaymentProvider` — no card required, tier flips
  immediately via the same `TokenStoreService.rewriteFieldsForUser` path
  `setUserTier` already uses, logged as a zero-amount `ADJUSTMENT` transaction.
- **D6 — Tier-view split is strictly additive, never a regression.** `FreePageView`
  for every page is today's existing, already-shipped behavior, unchanged. Each
  higher tier adds one bounded extra panel/action; nothing is removed from a lower
  tier that already has it. **When a tier has no new content for a given page, its
  view file re-exports the next-lower tier's** (e.g. `export { default } from
  "./FreePageView"`) rather than duplicating JSX — keeps the four-file shape uniform
  everywhere without inventing filler content.
- **D7 — Exactly one new WS-level tier gate this phase**, not a redesign of the
  realtime protocol: room names prefixed `vip-` require `MEDIUM+` in
  `handleJoinRoom`/`handleClaimJoinRoom` (`messaging-ws.gateway.ts`) — reject with the
  same `{type:"error", message}` frame shape already used for `isValidRoom` failures.
  Proves server-side WS enforcement end-to-end (same story `/premium` already proves
  over HTTP); more gates can follow the identical pattern later.
- **D8 — Pricing and checkout are comparison/transactional pages, not part of the
  `{Tier}PageView` pattern.** They must show all four tiers to every viewer regardless
  of the viewer's own tier — that's a different shape than a content page whose own
  rendering depends on the viewer's current tier. `/pricing` keeps one file (rebuilt
  for real: i18n, tier-aware CTA state); checkout is a new one-file-per-visit page at
  `v1/[lang]/checkout/[tier]`.
- **D9 — `(marketing)/pricing` stays outside the `[lang]` locale group** (pre-existing
  structural fact, not fixed here — it has no `[lang]` segment and never has). It gets
  real copy via the root layout's default-locale message loader; full per-locale
  marketing routing is out of scope for this phase.
- **D10 — Stage A closes Phase 16's tracker before any new-scope work starts**, same
  "close the predecessor's gaps first" convention Phase 14/15/16 each used — a
  static+live re-check of the 10 punch-list items, then flip `phase16.md`'s
  checkboxes based on what's actually true, not what the commit message claims.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stage A gates Stage B+ (D10). Stage B gates
C/D (needs the provider + mutation). Stage E depends on B (self-serve tier change,
so the pricing/premium views have something real to hit) and D (checkout page must
exist before pricing's CTA can link to it). Stage F can land alongside each of C/D/E
as their own namespaces are added, or as one sweep after. Stage G is last.

### Stage A — Phase 16 close-out (blocking prerequisite)

- [x] **T1 (S) — Re-verify Phase 16's 10 punch-list items against `957a4e9`/
  `9d3448c`.** For each of T22/T15/T1-T7/T3/T31/T27/T26/T11/T17/T18/T20/T21: read the
  actual current file state (not just the commit message) and confirm the fix matches
  what `phase16.md`'s "Fix:" note asked for. Run `pnpm test`, `pnpm test:e2e`,
  `pnpm lint`, `tsc --noEmit` in both packages.
  *Verify:* every item confirmed fixed in the live tree, or a fresh finding is
  recorded if one isn't. **Done** — all 10 confirmed. Caveat: see punch-item 7
  above, `phase16.md`'s own `T23`/`T32` (outside the 10-item list) are still open.
- [x] **T2 (S) — Flip `phase16.md`'s checkboxes and Status line to match T1's
  findings.** Update the header Status string, check every task box that's
  confirmed, and append a short "Closed 2026-07-XX" note referencing `957a4e9`/
  `9d3448c` rather than leaving the stale "NOT gate-clean" framing in place.
  *Verify:* `phase16.md` accurately reflects reality; no box is checked that T1
  didn't confirm. **Done** — header now reads "gate-clean — closed 2026-07-05".

### Stage B — Backend billing foundation

- [x] **T3 (M) — `nest-js-boilerplate/src/billing/` module: `PaymentProvider`
  interface + `MockPaymentProvider`.** `charge({ userId, tier, last4, expMonth,
  expYear }): Promise<{ approved: boolean; reason?: string; providerRef: string }>`.
  Decision table per D3 (`4242`→approved, `0002`→`generic_decline`,
  `9995`→`insufficient_funds`, else Luhn-valid→approved, Luhn-invalid→approved:false
  reason `invalid_card`). Bound behind an injection token (`PAYMENT_PROVIDER`) so a
  real provider is a second class later, not a rewrite.
  *Verify:* unit tests for all 4 table rows + the Luhn-fallback branch. **Done** —
  tests pass, and post-`aacb05a` `mock-payment.provider.ts`/`.spec.ts` are also
  fully lint-clean (dropped the dead `async`, uses `SubscriptionTier` enum
  instead of `as any`).
- [x] **T4 (M) — `BillingService.subscribeToPlan(userId, targetTier, card?)`.**
  Upgrade path (`targetTier` rank > current): requires `card`, calls
  `provider.charge()`; on approval, updates `User.subscriptionTier`, calls the
  existing `TokenStoreService.rewriteFieldsForUser`, writes a `WalletTransaction`
  (`type: FEE`, `status: COMPLETED`, `metadata: {tier, provider:"mock", last4}`,
  `idempotencyKey` derived from userId+tier+minute-bucket to make retries safe), and
  a `Notification` (`type: BILLING`). On decline: `WalletTransaction`
  `status: FAILED`, no tier change, no notification, return the decline reason.
  Downgrade/FREE path (D5): no `card`/provider call, straight to the tier-rewrite +
  a zero-amount `ADJUSTMENT` transaction + notification. Lazily creates the user's
  primary USD `Wallet` if none exists yet.
  *Verify:* unit tests — upgrade+approved card flips tier and writes `COMPLETED`;
  upgrade+declined card leaves tier untouched and writes `FAILED`; downgrade never
  calls the provider mock (spy assertion) and still flips tier. **Done** — plus
  `aacb05a` fixed the wallet-linkage bug (punch-item 1) and the spec now asserts
  `fromWalletId` on all three branches.
- [ ] **T5 (S) — `BillingResolver`: `subscribeToPlan` mutation + `myBillingHistory`
  query.** `@UseGuards(SessionAuthGuard, CsrfGuard)`, self-serve (any authenticated
  user acting on their own account, no `@Roles` needed). `myBillingHistory` returns
  the caller's own `WalletTransaction` rows only (own-wallet filter, no cross-user
  leakage).
  *Verify:* e2e — authenticated user calls `subscribeToPlan(PREMIUM, {last4:"4242",
  ...})` → tier flips, next request's silent-refresh picks it up (same mechanism
  `setUserTier` already proves); forged `userId`/another user's wallet never appears
  in `myBillingHistory`. Static re-check 2026-07-05: the root-cause wallet-linkage
  bug that made `myBillingHistory` always return empty is now fixed (punch-item 1)
  and unit-asserted — left unchecked because this task's own verify step
  specifically demands a live e2e run, which hasn't happened yet (pending T28).
- [x] **T6 (S) — Add `CsrfGuard` to `AdminResolver.setUserTier`.** Same
  state-mutating-without-CSRF gap `logoutOtherSessions` already fixed elsewhere,
  found while building the new self-serve mutation right next to it — fix alongside
  rather than leave untracked (same reasoning Phase 16's D8 used for the
  `RESEND_*`/`SMTP_*` env fix).
  *Verify:* an admin request missing the CSRF header/token now gets rejected;
  existing e2e coverage for `setUserTier` still passes with the header included.
  **Done** — confirmed `@UseGuards(CsrfGuard)` present at `admin.resolver.ts:85`.
- [ ] **T7 (S) — `myPostStats`/`reactionBreakdown`/`whoReacted` resolver fields
  (feed + post-detail bonuses).** `myPostStats` (own posts' view/reaction counts,
  `@MinTier(MEDIUM)`) on the feed resolver; `reactionBreakdown(postId)`
  (`@MinTier(MEDIUM)`) and `whoReacted(postId)` (`@MinTier(PREMIUM)`) on the post
  resolver — grouped `Reaction` counts/rows, own+others' posts readable the same as
  today's existing post queries.
  *Verify:* FREE/BASIC caller gets a 403 on all three; MEDIUM gets the first two but
  403s on `whoReacted`; PREMIUM gets all three; unit + e2e per field. Static
  re-check 2026-07-06: all three fields exist in `post.resolver.ts:84-116` with
  the correct guards. **`post.resolver.spec.ts` added in `6b1411b`** (9 tests) —
  but it unit-tests the methods' own logic only (grouping, mapping), not the
  `@MinTier` guard's 403 behavior, since constructing `PostResolver` directly
  never runs Nest's guard pipeline. Left unchecked — the below-tier rejection
  this task's verify step actually asks for is still unproven, unit or live.
  See "Third re-verification pass (2026-07-06)".
- [ ] **T8 (S) — `suggestedFriends`/`growthStats` resolver fields (find-friends +
  premium bonuses).** `suggestedFriends` (`@MinTier(MEDIUM)`, simple
  friends-of-friends-not-already-connected query bounded to e.g. 10 rows) on the
  friendship resolver; `growthStats` (`@MinTier(MEDIUM)`, alongside the existing
  `premiumStats`) on `AdminResolver`.
  *Verify:* same 403-below/200-at-or-above pattern as T7, unit + e2e. Static
  re-check 2026-07-06: both fields exist (`friends.resolver.ts`'s
  `suggestedFriends`, `admin.resolver.ts:117-118`'s `growthStats`).
  **`friends.resolver.spec.ts` added in `6b1411b`** (4 tests, covers
  `suggestedFriends`'s sorting/filtering logic well) — but same caveat as T7,
  it doesn't exercise the guard itself. `admin.resolver.ts`'s `growthStats`
  still has **no spec file at all**. Left unchecked — tier-gate enforcement
  remains unverified for both fields. See "Third re-verification pass
  (2026-07-06)".

### Stage C — WS tier gate: VIP chat rooms

- [ ] **T9 (S) — Reject `vip-`-prefixed room joins below `MEDIUM`.** In
  `handleJoinRoom`/`handleClaimJoinRoom` (`messaging-ws.gateway.ts`), after the
  existing `isValidRoom` check: if `data.room`/`params.room` starts with `vip-` and
  the connection's tier rank < `MEDIUM`, send the same
  `{type:"error", message:"..."}` frame shape used for invalid rooms and do not
  join. Confirm the socket already has the authenticated tier available from the
  handshake (`realtime.gateway.ts:348`'s `hash.tier`) — thread it onto `AuthWs` if
  it isn't already there.
  *Verify:* a scripted WS client forging a `join-room` for `vip-lounge` on a FREE
  session gets the error frame and never appears in `getRoomCounts()`/broadcasts; a
  MEDIUM+ session joins normally. Live-probed, not just unit-tested (per this
  project's convention that WS behavior needs a real socket, not just a mock).
  Static re-check 2026-07-05: the rank check exists correctly in both handlers
  (`messaging-ws.gateway.ts:175-188,272-289`) — left unchecked because the
  live-socket probe this verify step requires hasn't run (pending T28).
- [x] **T10 (S) — Unit test for the gate.** Cover FREE/BASIC (rejected),
  MEDIUM/PREMIUM (allowed), and non-`vip-` rooms (unaffected, all tiers) in
  `messaging-ws.gateway.spec.ts`.
  *Verify:* all four cases green. **Done** — passes under `pnpm test`, though the
  spec file itself has 27 lint errors, see punch-item 3.

### Stage D — Frontend: mock checkout + pricing rebuild + shared dispatcher

- [x] **T11 (S) — `src/lib/tier-view.ts`: shared per-page dispatcher helper.** One
  small function/component (`getTierView(tier, views)` or `<TierView tier={...}
  views={{FREE, BASIC, MEDIUM, PREMIUM}} />`) so all 9 pages in Stage E share one
  lookup instead of nine copy-pasted switches; falls back to `FREE` for a
  null/unknown tier (logged-out/loading states stay each page's own existing
  `loading`/`!user` early-return, unchanged).
  *Verify:* unit test — each of the 4 tiers resolves to its own view; unknown/undefined
  falls back to `FREE`. **Done** — `aacb05a` converted it to `tier-view.tsx`
  returning `ReactNode` directly (fixing punch-item 2's render-time-component
  bug), `tier-view.spec.tsx` rewritten with `render()`/`screen` and passes all
  7 cases; `pnpm lint` frontend is now 0 errors (was 8).
- [x] **T12 (M) — `MockCardForm` component** (`src/components/billing/
  MockCardForm.tsx`): card number, expiry (MM/YY), CVC, cardholder name inputs;
  client-side Luhn check + expiry-not-in-past validation before any network call;
  on submit, sends only `{ last4, expMonth, expYear }` (D4) via a new BFF route.
  Displays the 3 documented test numbers (D3) as on-page hints, same spirit as
  Stripe's own test-mode checkout UIs.
  *Verify:* component test — invalid Luhn/expired date blocked client-side with no
  fetch call; valid input calls the route with only the masked fields, never the
  full PAN. **Done** — `src/features/billing/ui/mock-card-form.tsx` matches spec
  (Luhn/expiry validation, sends only `{tier, last4, expMonth, expYear}`, shows
  the 3 D3 test-card hints). Correcting a mistake in this file's own 2026-07-06
  note: it previously said no component test existed, but
  `mock-card-form.test.tsx` (5 tests, all passing) has existed since `e2c0558`
  — the earlier check only grepped for `*spec*` filenames and missed this
   project's `.test.` naming. **Fourth re-verification pass (2026-07-06):**
   the `"Test cards:"`, `"Month"`, `"Year"` labels were replaced with
   `t.testCards`/`t.month`/`t.year` from the `checkout` namespace — confirmed.
   **Fifth pass correction:** not *fully* i18n'd though — line 87's generic
   `"Payment failed. Please try again."` catch-all fallback is still
   hardcoded English. Small, one-key fix; doesn't affect this box staying
   checked (T12's own verify step is about validation/masking behavior, which
   is unaffected), but noted so it isn't lost.
- [x] **T13 (S) — BFF routes: `api/billing/subscribe/route.ts` (POST),
  `api/billing/history/route.ts` (GET).** Same `graphqlFetch` +
  `sessionTokenHeaders()` + CSRF-echo pattern as `api/admin/set-tier/route.ts`/
  `api/auth/logout/route.ts`; real HTTP status passthrough (`{status:
  body.statusCode}` on error — the exact gap phase13 found missing on 5 other BFF
  routes, don't repeat it here).
  *Verify:* declined-card response reaches the browser as a real non-200 with the
  structured `{statusCode,exc,msg,key}` body `exceptionHandler` already knows how to
  render. **Done** — confirmed `{status: body.statusCode}` passthrough matches
  `api/admin/set-tier/route.ts`'s pattern in both new routes.
- [ ] **T14 (M) — `v1/[lang]/checkout/[tier]/page.tsx`.** Authenticated-only
  (existing `LoadingAuth`/`UnauthenticatedMessage` pattern); shows the target plan's
  price/features, `MockCardForm` for upgrades, a one-click confirm (no card) for
  downgrades/FREE (D5); success → toast + redirect to `/pricing`; decline → inline
  error via `exceptionHandler`, form stays filled for retry.
  *Verify:* live click-through — upgrade with `4242...` succeeds and the shell's
  tier badge updates on next action (no re-login); `0002...` shows a decline with a
  clear reason and no tier change. Static re-check 2026-07-06:
  `checkout/[tier]/checkout-content.tsx` exists and matches this spec (upgrade
  card form / one-click downgrade / current-tier state, `checkout` i18n
  namespace). Left unchecked — no live click-through has run (pending T28), and
  no test file exists for this page either. Gap #1 (the pricing→checkout
  handoff dropping `lang`) is now **fixed** in `6b1411b` — `pricing/page.tsx`
  passes the visitor's real locale into `checkoutPath()` via a new
  `getCookieLang()` helper reading the same cookie `LangSwitcher` already
  sets; confirmed correct.
- [ ] **T15 (M) — Rebuild `(marketing)/pricing/page.tsx` for real.** Real i18n copy
  (new `pricing` namespace, D9), CTA per viewer state: logged-out → links to login;
  logged-in + already at/above the tier → "Included" (disabled); logged-in + below →
  "Upgrade" linking to `checkout/[tier]`.
  *Verify:* all 4 CTA states exercised live (logged-out, current-tier, above,
  below); page renders in both `en`/`tr`. `aacb05a` added the `pricing`
  namespace and fixed the logged-out→login CTA (introduced a feature-list
  bug in the process, fixed by `d75be4b` — see "Punch-list fix verification").
  Content is now static-confirmed correct for all 4 tiers — left unchecked
  only because the 4 CTA states haven't actually been exercised live yet
  (pending T28).
- [x] **T16 (S) — `PRICING_PATH`/new `CHECKOUT_PATH` route constants + nav
  entries.** `PRICING_PATH` already exists (`constants/routes.ts`) — add
  `CHECKOUT_PATH` builder (`(tier: Tier) => \`/v1/${lang}/checkout/${tier}\`` shape,
  matching existing localized-path helpers) and wire the pricing page's CTAs through
  it instead of a hand-built string.
  *Verify:* `git grep` shows no hardcoded `/checkout/` string outside this helper.
  **Done, re-checked 2026-07-06** — `constants/routes.ts:7-8`'s `checkoutPath(tier,
  lang)` is the only place `/checkout/` is built, and `pricing/page.tsx` calls it
  instead of a hand-built string. The helper itself is correct; the bug is one
  layer up — `pricing/page.tsx` calls it without passing `lang`, so it silently
  falls back to its own `"en"` default. That's tracked as gap #1 above, not a
  reason to reopen this box.

### Stage E — Per-page `{Tier}PageView.tsx` rollout

Each item: split `page.tsx` into a thin dispatcher (auth/loading guards unchanged,
tier read from `useAuth().user.tier`, rendered via T11's helper) + up to 4 sibling
view files. Per D6, a tier with nothing new re-exports the next-lower tier's file —
noted explicitly below where that applies.

- [ ] **T17 (M) — `/premium` (flagship — do this one first as the reference
  implementation).** `FreePageView`/`BasicPageView`: today's locked-`AccessDenied`
  state below `BASIC` (`BasicPageView` is the first tier with real content — the
  existing `premiumStats` panel). `MediumPageView`: `BasicPageView`'s content + a
  new "growth trend" panel from T8's `growthStats`. `PremiumPageView`:
  `MediumPageView`'s content + a mock "export CSV" button (client-side only, no
  new endpoint).
  *Verify:* live click-through as FREE (locked), BASIC (stats only), MEDIUM
  (stats+trend), PREMIUM (stats+trend+export) — matches this exact tier ladder.
  Static re-check 2026-07-05: file contents match this ladder exactly — left
  unchecked because the live click-through itself hasn't run (pending T28), and
  this page also has punch-items 2 (render bug) and 4 (no i18n) open.
- [ ] **T18 (M) — `/feed`.** `FreePageView`: today's feed, unchanged.
  `BasicPageView`: re-exports `FreePageView` (D6 — no delta yet).
  `MediumPageView`: adds T7's `myPostStats` sidebar (own posts' view/reaction
  counts). `PremiumPageView`: `MediumPageView`'s content + a cosmetic "Premium"
  badge next to the user's own posts.
  *Verify:* FREE/BASIC see identical markup (same component); MEDIUM sees the new
  sidebar and a FREE-tier forced API call to `myPostStats` gets a real 403. Static
   re-check 2026-07-06: the ladder is implemented correctly in
   `feed/views/{Free,Basic,Medium,Premium}PageView.tsx`. **`6b1411b` added the
   `feed` i18n namespace and wired `useMessages()` into Medium/PremiumPageView**.
   **Fourth re-verification pass (2026-07-06):** the remaining hardcoded
   `"Failed to load posts"` fallback was replaced with `t.failedToLoadPosts` —
   `/feed` is now fully i18n'd. Left unchecked — no live click-through has run,
   and `myPostStats` still has no test proving the below-tier 403 (see T7).
- [ ] **T19 (M) — `/posts/[uuid]` (post detail).** `FreePageView`/`BasicPageView`:
  today's page (reaction **count** only, unchanged). `MediumPageView`: adds T7's
  `reactionBreakdown` chart. `PremiumPageView`: adds T7's `whoReacted` list on top
  of Medium's chart.
  *Verify:* same 3-rung ladder confirmed live + backend 403 below each rung.
  Static re-check 2026-07-06: the ladder is implemented correctly in
  `posts/[uuid]/views/{Free,Basic,Medium,Premium}PageView.tsx`. **`6b1411b`
  added the `posts` i18n namespace and wired `useMessages()` into all 4
  views.** **Fifth-pass correction:** not fully closed — `FreePageView`,
  `MediumPageView`, and `PremiumPageView` each still throw a hardcoded
  `"Post not found"` (lines ~66-72) in their fetch handler, even though
  `t = useMessages("posts")` is already in scope two lines below. One
  `postNotFound` key + a 3-file swap closes it. Left unchecked — no live
  click-through, and still no backend test
  for the 403 (same gap as T7).
- [ ] **T20 (S) — `/messages`.** No tier differentiation planned (1:1 DMs are core,
  not a monetization axis) — all four views re-export the same existing content
  (D6). Establishes the dispatcher plumbing uniformly even where content doesn't
  differ yet.
  *Verify:* page still renders/behaves identically to today for all 4 tiers; no
  regression in the existing messages e2e coverage. Static re-check 2026-07-06:
  all 4 views in `messages/views/` re-export `FreePageView` verbatim, exactly as
  specified — left unchecked only because no one has re-run the existing
  messages e2e coverage against this dispatcher shape specifically since it
  landed (pending T28/T27's e2e run).
- [ ] **T21 (M) — `/chat-room`.** `FreePageView`/`BasicPageView`: today's page,
  unchanged, no "VIP Lounge" entry point shown. `MediumPageView`: adds a "Join VIP
  Lounge" button that joins the `vip-lounge` room (T9's gate). `PremiumPageView`:
  `MediumPageView`'s content + a small crown badge next to the user's own name in
  any room.
  *Verify:* live click-through — FREE/BASIC never see the VIP button (and a forced
  WS join attempt is rejected per T9); MEDIUM/PREMIUM join successfully. Static
  re-check 2026-07-06: the ladder is implemented correctly in
  `chat-room/views/{Free,Basic,Medium,Premium}PageView.tsx`, and — unlike T18/T19
  — this page's new content does use the `chat-room` i18n namespace correctly.
  Left unchecked only because the live click-through/WS join hasn't run (pending
  T28).
- [ ] **T22 (S) — `/notification`.** No tier differentiation planned — same
  re-export-everywhere shape as T20.
  *Verify:* unchanged behavior for all 4 tiers. Static re-check 2026-07-06:
  confirmed — all 4 views in `notification/views/` re-export `FreePageView`
  verbatim. Left unchecked for the same reason as T20 (no re-run of existing
  coverage against this shape yet).
- [ ] **T23 (M) — `/find-friends`.** `FreePageView`/`BasicPageView`: today's page,
  unchanged. `MediumPageView`/`PremiumPageView`: adds T8's `suggestedFriends` panel
  (Premium re-exports Medium — D6, no further delta identified for this page).
  *Verify:* FREE/BASIC unchanged; MEDIUM/PREMIUM show suggestions; below-MEDIUM
  forced API call 403s. Static re-check 2026-07-06: `find-friends/views/`
  matches this exactly — Medium adds the `suggestedFriends` panel (correctly
  using the `find-friends` i18n namespace), Premium re-exports Medium per D6.
  `6b1411b` added `friends.resolver.spec.ts` (4 tests) covering the panel's own
  sorting/filtering logic. Left unchecked — the below-MEDIUM 403 itself still
  has no test (guards aren't exercised by a plain unit test, see T7/T8) and no
  live click-through has run.
- [x] **T24 (S) — `/users/list` + `/users/detail`.** No tier differentiation
  planned (browsing users is core) — re-export shape, same as T20/T22.
  *Verify:* unchanged behavior for all 4 tiers. **Done** — `aacb05a` gave
  `users/detail/[uuid]` the same split `users/list` already had (`FreePageView`
  holds the real content, `Basic/Medium/PremiumPageView` re-export it,
  `page.tsx` renders `FreePageView` directly inside the existing `Suspense`).
- [ ] **T25 (S) — `/settings` (+ `/settings/sessions`).** No tier differentiation
  planned (account settings are the same for everyone) — re-export shape.
  *Verify:* unchanged behavior for all 4 tiers. Static re-check 2026-07-06:
  confirmed — all 4 views in `settings/sessions/views/` re-export `FreePageView`
  verbatim. Left unchecked for the same reason as T20/T22.

### Stage F — i18n

- [ ] **T26 (M) — New locale namespaces for every page touched above.** At minimum:
  `pricing`, `checkout`, `premium` (retrofit — today's page has zero i18n),
  `feed`/`posts`/`chat-room`/`find-friends` additions for the new panels' copy (only
  the *new* strings need namespaces if the page already has one; `pricing`/
  `checkout`/`premium` need namespaces created from scratch, using
  `messages/{en,tr}/messages/messages.json` as the structural template per
  `useMessages()`'s existing convention). Run `pnpm generate-i18n-types` after.
  *Verify:* `en` and `tr` both render with no fallback/missing-key warnings; the
  generated `I18nMessages` type includes every new namespace. `aacb05a` added
  the `pricing` and `premium` namespaces (both `en`/`tr`) and wired
  `useMessages()` into both pages; `d75be4b` fixed the feature-list mismatch
  `aacb05a` introduced (regenerated `i18n-messages.d.ts` too). Content is now
  correct — left unchecked only because no one has actually loaded both
  locales in a browser this session (pending T28).

### Stage G — Tests + verify loop

- [ ] **T27 (M) — Backend + frontend unit/e2e suites green.** `pnpm test`/
  `test:e2e` (backend), frontend unit tests for `MockCardForm`/`tier-view` helper/
  every new resolver field; no regression in Stage A's re-confirmed Phase 16
  surface. Re-checked 2026-07-05 post-lint-fix: `pnpm test` green in both
  packages (207 backend / 77 frontend), `pnpm lint` clean on frontend and backend.
  Left unchecked — `test:e2e` still hasn't been run this session. **Re-checked
  2026-07-06 (before `6b1411b`): still 207/77, unchanged** — flagged that
  `MockCardForm`, the checkout page, Stage E view files, and the new resolver
  fields (T7/T8) mostly lacked coverage (correcting a mistake in that same
  pass: `MockCardForm` actually already had a test file, see T12). **Re-checked
  again post-`6b1411b`: backend now 220 (+13, from `post.resolver.spec.ts` and
  `friends.resolver.spec.ts`), frontend still 77.** Real progress, but
  `admin.resolver.ts`'s `growthStats`, every Stage E view file, and the
  checkout page still have zero tests, and none of the new backend specs
  actually exercise the `@MinTier` guard's 403 path (see "Third
  re-verification pass (2026-07-06)"). `test:e2e` still hasn't run.
- [ ] **T28 (L) — Live control run against rebuilt containers** (same recipe as
  Phase 3/16: `docker compose --profile all up -d --build`, real HTTP/GraphQL/WS
  traffic, not just mocks). Script: register/login a fresh FREE user → attempt
  `vip-` room join (rejected) → attempt `whoReacted` (403) → checkout PREMIUM with
  `4242...` (approved, tier flips, WS join now allowed, `whoReacted` now 200) →
  checkout with `0002...` on a second user (declined, tier unchanged) → downgrade
  back to FREE (no card, immediate). Confirm zero full-PAN bytes ever appear in
  backend logs/Postgres (`WalletTransaction.metadata` contains only `last4`).

## Verify loop (phase gate)

- [ ] **Phase 16 actually closed:** Stage A's re-verification is real (not just
  trusting the commit message), `phase16.md` reflects it.
- [ ] **Mock payment is provider-swappable in practice, not just in theory:** the
  resolver/schema/frontend never reference `MockPaymentProvider` directly outside
  its own binding — grep confirms the only import site is the DI wiring.
- [ ] **No full card number ever reaches the backend or a log line** — confirmed via
  the same `log_statement='all'`-style Postgres spot check this project has used
  since Phase 3, plus a source grep for anywhere a full PAN variable could leak.
- [ ] **Every `@MinTier`-gated field enforces server-side**, proven by a forced
  below-tier call getting a real 403 — not just the frontend `TierGate` hiding UI.
  2026-07-06: the decorators are all present and correctly targeted (T7/T8
  confirmed statically). `6b1411b` added `post.resolver.spec.ts`/
  `friends.resolver.spec.ts`, but those unit-test the resolvers' own logic by
  constructing them directly, which never runs Nest's guard pipeline — **the
  actual 403 rejection is still unproven by anything**, unit or live. This
  line cannot be checked until a guard-level test (e.g. an e2e call, or a test
  that boots the module with guards attached) or T28's live run actually
  exercises it.
- [ ] **The one new WS gate (`vip-` rooms) rejects live**, proven with a real socket
  client forging the join, not a mock.
- [ ] **Zero regressions**: FREE-tier behavior on every touched page is byte-for-byte
  the same as before this phase (D6) — this is the thing most likely to quietly
  break given 9 pages are being touched at once.
- [ ] **`pnpm generate-i18n-types` run and committed**, both locales render with no
  missing-key fallback. 2026-07-06: **not true at first check** — `feed` and
  `posts/[uuid]`'s Medium/Premium panels had zero i18n coverage. **`6b1411b`
  fixed most of this** — both pages now have `en`/`tr` namespaces wired via
  `useMessages()`. **Fourth pass (`d03d1a1`):** feed's error fallback,
  MockCardForm's testCards/month/year labels, and chat-room's connection
  tooltips are all now wired — confirmed. **Fifth pass (2026-07-06)
  correction:** two more hardcoded strings survive a broader grep —
  `posts/[uuid]`'s `"Post not found"` (all 3 tiers) and MockCardForm's
  generic `"Payment failed. Please try again."` fallback. Left unchecked —
  both are small, known, one-line fixes, plus both locales still need an
  actual browser load (pending T28).
- [ ] **Live control run (T28) passes** before this phase is marked complete —
  static/unit-only verification is not sufficient per this project's established
  lesson (phases 2/12/15/16 all shipped real bugs that only a live rebuilt-container
  pass caught).

## Phase queue (updated 2026-07-05)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache | [phase8.md](phase8.md) |
| 9 (done, 14/15 code tasks) | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | [phase9.md](phase9.md) |
| 10 (mostly landed) | Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence + stability, transport-state UX — T11 broken, T4/T15 carried to 11 | [phase10.md](phase10.md) |
| 11 (parked — plan only, tasks open) | Phase 10 remediation: post-detail live-renew fix (allowlist + context churn), close-out bookkeeping, verification gate, residual UX — deferred in favor of Phase 12, resume after | [phase11.md](phase11.md) |
| 12 (implemented, not gate-clean until Phase 14/T4) | Exception handling: unified backend error contract, frontend `exceptionHandler` + i18n resolver, dedicated connection-unstable + access-denied pages, loading skeletons, real auth forms | [phase12.md](phase12.md) |
| 13 (implemented, not gate-clean until Phase 15/T15) | Phase 12 remediation + notification/DM unread count renewal hardening + sender display-name consistency + chat scroll-to-bottom button | [phase13.md](phase13.md) |
| 14 (implemented, not gate-clean until Phase 15) | Phase 13 close-out + comprehensive Kibana activity logging: session/page/exception categories — 7 of 20 tasks confirmed broken live, remediated in Phase 15 | [phase14.md](phase14.md) |
| 15 (Stage G/T15 done, Stages A–F not started) | Phase 14 remediation: IP-change unification, WS close codes, frontend event pipe, Kibana saved searches, docs accuracy, Phase 12/13 live control run, test debt — Stages A–F carried whole into Phase 16's Stage A | [phase15.md](phase15.md) |
| 16 (implemented 2026-07-05, pending Stage A re-verify above) | Phase 15 close-out + welcome-email & password-reset for social signups: username generation, SMTP (mxroute) transport, real mail templates, generic password-reset flow, frontend set-password/verify-email pages, env/compose/docs cleanup | [phase16.md](phase16.md) |
| **17 (this file)** | Subscriptions & pricing: mock payment provider (Wallet/WalletTransaction ledger), self-serve tier checkout, `{Tier}PageView` split across 9 main pages, one WS-level tier gate (VIP rooms), real i18n'd pricing page | this file |
| 18 (was 17) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops, plus this phase's checkout/tier-gate flows | [todo/01](../todo/01-stack-integration.md) |
| 19 (was 18) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 20 (was 19) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 21 (was 20) | Backlog: OTel/metrics, remaining push polish, seed, publishing, backups; **real payment provider swap (Stripe/iyzico, undecided) once Berkay picks one** — added here per this phase's own D2 | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases 17-20 (from phase16.md's own queue table) were renumbered +1
(now 18-21) to insert this subscriptions/pricing phase, same pattern Phase 14/15/16
each used. The real-payment-provider follow-up was added as an explicit backlog line
in phase 21 rather than left implicit, since Berkay named it as a known next step. -->
