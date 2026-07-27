# convert-frontend-8-flutter — Settings, Feed, and Share: close the gap with Next.js

**Date:** 2026-07-27 · **Planned against:** HEAD `b8afd99` · **Implemented as:**
`9839ee2`/`9a47fd3` · **Re-verified against:** HEAD `9a47fd3` · **Status:** ⚠️
**PARTIALLY IMPLEMENTED.** Researched via 4 parallel deep-comparison
passes (Settings general/account/privacy/nav, Settings billing/api-keys/sessions/index,
Feed, Share), each independently verifying file:line citations on both sides against
current HEAD. All 61 tasks below were then implemented and committed, and all gates
are genuinely green (`flutter analyze` 0 issues, `dart format` clean, `flutter test`
412/413 — the 1 failure is the pre-existing, pre-disclosed `card_test.dart` flake,
not a regression).

**But green gates and `[x]` marks were not sufficient here, again** (this project's
established, repeated lesson — see §10). A 2026-07-27 verification pass read the
implementation task-by-task against the real Next.js/NestJS source rather than
trusting the checkboxes, and found **~20 concrete gaps**, two of them new
app-wide-impact reaction bugs in the same class this doc's own §2 called out as
highest priority. This is not a rubber-stamp-claim situation (most individual pieces
really were built, unlike some past "complete" claims in this project's history) —
it's a wired-to-the-wrong-node / spec-mismatch / silently-incomplete situation. See
**§11** for the full cited findings and **Stage S** (§9) for the resulting fix tasks.
Tasks below that verification found incomplete are flagged inline with **⚠️ Verify
round 2** and a pointer to their §11 subsection; unflagged tasks were spot-checked
against the real backend schema and/or a live gate run and hold up.

> Berkay: "flutter : settings | feed | share is not matching with next-js
> boilerplate." That's accurate, but understates it differently per area. **Settings**
> is mostly *unbuilt* (most fields simply don't exist yet) and, independent of that,
> **entirely unreachable by tapping through the app** — there is no navigation between
> its 6 sub-pages at all. **Feed** is mostly *built* but disconnected from itself — a
> richer, more-correct set of components sits fully written right next to a thinner one
> that's actually wired up, and two of the data bugs underneath it break reactions and
> comments **everywhere in the app**, not just the feed. **Share** doesn't exist as a
> working feature at all — pure placeholder, `onPressed: () {}` — but the entire data
> layer it needs was already built for a different, unreachable route and just needs a
> real UI on top of it.

---

## 1. How to use this doc

§3-§5 are the current-state picture per feature area — read these for the "why" and
the inventory of what's actually live vs. dead. §6 is decisions Berkay should make
before or during implementation (each has a recommendation, none are silent
assumptions). §7 lists things that look like gaps but are confirmed fine as-is — don't
"fix" these. §9 is the actual stage-ordered task list — this is what gets checked off.
§10 is the verify loop. Every citation below was confirmed by direct file read against
HEAD `b8afd99` on 2026-07-27, not carried over from an earlier round.

## 2. Executive summary

**Three areas, three different failure shapes, one recurring root cause.** This
project has now found the same bug shape — *a fully-written, more-correct component
or file sitting completely unreferenced next to a thinner one that's actually wired
into the router* — in auth/realtime (`convert-frontend-6`/`7`), and now confirmed
independently in **both** Settings and Feed by two separate research passes that
didn't coordinate with each other. It is a systemic pattern in this codebase, not a
one-off. Concretely this round: **20 dead tier-view files** across Settings'
general/account/privacy/billing/sessions sub-pages (each dead file inventing its own
content with no basis in the real Next.js page), plus a fully-built, zero-call-site
`SettingsNav` that would fix Settings' single biggest structural problem if it were
just mounted, plus a fully-built, zero-call-site `PostHeader`/`PostContent`/
`PostActions`/`CommentSection` set in Feed that's more correct than what's live. In
every one of these cases, wiring up the dead file is either **exactly** the fix
(`SettingsNav`) or **actively wrong** (the tier-view files, which don't match web
either) — each one had to be checked individually; there's no shortcut.

**Two of the bugs found this round aren't "Flutter doesn't match web" bugs — they're
"this feature has never worked, anywhere in the app" bugs**, and matter more than
everything else in this doc combined: the reaction-toggle mutation hardcodes an
invalid lowercase `'like'` against a backend enum that only accepts uppercase
(`LIKE`/`LOVE`/`LAUGH`/`WOW`/...), and the comment create/update/list calls request a
field named `content` when the schema's real field is `body`. Both fail on **every**
call, unconditionally, and both are already reachable today from the separate Posts
feature (`/v1/:lang/posts/[uuid]`) — not just from the Feed work in this doc. Fixing
these (Stage K) should be treated as a standalone priority-one bugfix, independent of
the rest of this doc's timeline.

**Settings** (§3): 6 sub-pages, structurally present (all routes exist, all wired),
but three compounding problems: (1) zero in-app navigation between them —
`SettingsNav` is fully built and simply never mounted; (2) General/Account/Privacy's
live implementations are a materially thinner *and differently-scoped* feature set
than web — General is missing timezone/currency/date-display entirely, Account is
missing avatar upload and username despite the server+client plumbing for both
already existing unused, Privacy's three toggles don't correspond to any of web's
real fields at all; (3) Billing/Sessions/API-Keys have real, live, mostly-correct
implementations with a long tail of smaller bugs — a tier-casing bug that silently
skips the free-tier UI entirely, an API-key secret that's fetched and then thrown
away instead of shown to the user, a "current device" flag that's permanently false.

**Feed** (§4): router/tier wiring is correct (unlike Settings), so the trap recurs one
level down inside the page views instead. Basic tier shows an unrelated "locked
feature" placeholder instead of reusing Free's feed (web: they're byte-identical).
The live feed card has no working reactions (see above), no inline comment expansion,
no edit/delete of your own post — all three exist in the disconnected rich component
set. The feed-list query never fetches `reactions`/`_count`, so every post shows "0"
forever regardless of the reaction-toggle fix. The search box is inert. There is no
pagination — one fixed backend-default batch, permanently. The notification bell's
badge count is correct, but tapping any notification never navigates anywhere
(dispatches on a type-string shape that doesn't exist in the real enum), and "Mark
all read" has no button wired to it despite the server call already existing.

**Share** (§5): the `/share` route renders a static icon, a hardcoded (non-localized)
sentence, and a button with an empty `onPressed: () {}` — confirmed non-functional.
The good news: `PostActions.create()` and `PostActions.uploadImage()` — the exact
data layer this page needs — are already fully built, already verified field-safe
against the backend resolver, and already exercised by a *different*, web-nonexistent
route (`/v1/:lang/posts/create`). All 14 i18n strings the real form needs already
exist correctly in both locales. This is close to a pure UI-assembly task on top of
working plumbing, not a from-scratch feature build.

---

## 3. Settings — current state

### 3.A Inventory — what's actually live

All 7 settings routes are flat sibling `GoRoute`s inside the single top-level
`ShellRoute` (`flutter-boilerplate/lib/app/router.dart:255,316-372`) — there is no
settings-specific shell providing shared chrome.

| Sub-page | Live entry point | Shape |
|---|---|---|
| Index (`/settings`) | `views/settings/page_view.dart` → `SettingsPageContent` | Real `PlanInfoCard`/`PlanAdvantages`/`UpgradeActions` composition, several fields hardcoded/unwired (§3.H) |
| General | `views/settings/general/page_view.dart` → `SettingsGeneralPageContent` | `TierGate` wraps one shared `_GeneralSettings` widget in all 4 branches — ignores its own `{free,basic,medium,premium}_page_view.dart` siblings entirely |
| Account | `views/settings/account/page_view.dart` → `SettingsAccountPageContent` | No `TierGate` at all; one `_AccountForm` for every tier — ignores its own tier-view siblings |
| Privacy | `views/settings/privacy/page_view.dart` → `SettingsPrivacyPageContent` | `TierGate` wraps one shared `_PrivacySettings` widget in all 4 branches — ignores its own tier-view siblings |
| Billing | `views/settings/billing/page_view.dart` → `SettingsBillingPageContent` | 313 lines, its own inline `_SubscriptionCard`/`_PaymentMethodsSection`/`_InvoiceHistorySection`/`_FreeBillingView` — no `TierGate`, ignores its own tier-view + 7 sub-component siblings |
| Sessions | `views/settings/sessions/page_view.dart` → `SettingsSessionsPageContent` | No `TierGate` — ignores its own tier-view + 3 sub-component siblings |
| API Keys | `views/settings/api_keys/page_content.dart` → `SettingsApiKeysPageContent` | No tier split on either side (confirmed intentional, not a gap) — ignores its own 3 sub-component siblings |

**`SettingsNav`** (despite living in a file called `views/settings/settings_shell.dart`)
is a complete, correct, responsive 6-tab port of `next-js-boilerplate/src/components/
settings/SettingsNav.tsx` — confirmed by two independent research passes to have
**zero call sites anywhere** (`grep -rn "SettingsNav("` matches only its own
constructor). Next.js wraps every settings route in it via
`next-js-boilerplate/src/app/v1/[lang]/settings/layout.tsx:1-13`. Flutter has no
layout-nesting equivalent wired up at all — the only in-app paths that ever reach
`/settings/billing|sessions|api-keys` today are a one-time post-checkout redirect and
manual/deep-link URL entry.

**Dead tier-view files, confirmed non-resurrectable** (see D1): 20 files total —
`general/`, `account/`, `privacy/` each have 4 (`free/basic/medium/premium_page_view.
dart`), `billing/` and `sessions/` each have 4 more, plus billing's 7 dead
sub-components (`billing_info_display.dart`, `invoice_table.dart`,
`invoice_pagination.dart`, `payment_methods.dart`, `plan_benefits.dart`,
`plan_details.dart`, `status_badge.dart`) and sessions' 3 (`session_card.dart`,
`session_skeleton.dart`, `empty_sessions.dart`). Every one of these was checked
against its real Next.js counterpart: Next.js has **zero real tier differentiation**
on any of these 5 sub-pages (`Basic/Medium/PremiumPageView.tsx` are 1-line re-exports
of `FreePageView` in every case) — so Flutter's dead tier files, which each invent
their *own* mutually-inconsistent per-tier content, aren't a thinner version of
something real; they're an independently-invented third thing. A few individual
sub-components among them (`privacy_toggle_row.dart`, `invoice_pagination.dart`,
`empty_sessions.dart`) are well-shaped and directly reusable — those are called out
in §9's tasks; the rest should be deleted (§9 Stage Q).

### 3.B Headline gaps by sub-page

**General** — live implementation has only a binary theme switch + an instant-apply
language dropdown. Missing entirely: timezone, currency, date-display (with its
3-format live preview), and any staged Save flow — the language change today never
reaches the backend at all, it's local-device-only.

**Account** — live implementation has name + bio + a read-only avatar. Missing:
avatar upload (the upload call exists, unused, and has a live bug — reads
`response.data['url']`, the real key is nested under `urls.full`), and a username
field with debounced availability checking (the `isUsernameAvailable` query and
`checkUsername()` client method both already exist, unused). One shared blocker: the
client update method only forwards `name`/`bio` even though the mutation it sends
already asks for `username`/`avatarUrl`/`locale`/`timezone` back in its response —
extending the method signature (§9 T3) unblocks General, Account, and this avatar fix
simultaneously.

**Privacy** — the 3 live toggles (online status / read receipts / friend requests)
share **zero** fields with web's real 3 (hide-profile-picture / use-nickname
+conditional nickname input / enable-2FA) — strong evidence the live version was
cloned from one of the dead tier-view files rather than ported from Next.js. No
persistence, no Save button, plain `setState` that resets on navigation.

**Billing** — the single biggest live bug: `SubscriptionInfo.fromJson` never
lowercases the backend's uppercase `SubscriptionTier` value, so `if (sub.plan ==
'free')` never matches — every free-tier user falls into the *paid*-plan branch,
including a Cancel Subscription button the backend correctly rejects for free users,
with no try/catch, so the failure is silent. Payment methods are read-only (no
add/remove/set-default, though the dead `payment_methods.dart` widget already has the
right callback slots, and Stripe setup-intent plumbing already works elsewhere in the
app for checkout). No billing-address UI exists at all despite the query+mutation
working end-to-end already. Invoice rows don't open their PDF URL even when one
exists (`onTap: inv.pdfUrl != null ? () {} : null` — empty closure). No pagination.

**Sessions** — "current device" is permanently `false`: the query never fetches
`isCurrent` (correctly — that's normal, web computes it client-side too), but
Flutter's `AuthenticatedUser` model is missing the `sessionId` field needed to do the
same comparison, even though the query that fetches the current user already
requests `sessionId` on the wire and just drops it in `fromJson`. No empty-state UI.
Device labels show the raw `deviceId` instead of a friendly `userAgent`-derived name
(the field is fetched, never parsed).

**API Keys** — the most severe single bug in this area: key creation already fetches
the secret (`fullKey`) all the way to the call site and then **discards it** — there
is no code path anywhere, live or dead, that ever shows a newly-created key to the
user. No expiry-duration presets at creation (mutation supports it, UI doesn't offer
it) — every Flutter-created key is permanently non-expiring.

**Index / plan cards** — `_featuresForTier()` hardcodes `['Feature 1', 'Feature 2',
'Feature 3']` regardless of the `tier` argument it receives; every user on every plan
sees those literal strings. `PlanInfoCard` never receives a price for paid tiers or a
renewal/cancel date (the index page reads only a cached tier string, never the real
subscription the billing page already queries), and has no link to Billing at all.
The Cancel-Subscription button here is wired with no `onCancel` handler, so it
renders permanently disabled — Next.js doesn't have a cancel button on this page at
all, only a "Manage Billing" link.

**i18n**: Settings' ARB coverage is excellent — 163 `settings*`-prefixed keys, en/tr
identical, and (per §3.B's General/Account/Privacy detail) *most of the strings a
faithful port needs already exist unused*. This is a wiring problem, not a
translation problem.

---

## 4. Feed — current state

### 4.A Inventory — what's actually live

Unlike Settings, `views/feed/page_view.dart`'s `TierGate` genuinely dispatches to 4
distinct classes (`FreeFeedPage`/`BasicFeedPage`/`MediumFeedPage`/`PremiumFeedPage`,
each importing its own file) — the router-level trap does not recur here. It recurs
one layer down instead:

| File | Status | Note |
|---|---|---|
| `components/feed/post_card.dart` (`PostCard`) | **LIVE** | The actual feed-list item. Self-contained — does not compose any of the 4 files below. |
| `components/feed/post_header.dart` / `reaction_buttons.dart` | **DEAD for Feed** | Only reachable from `views/posts/[uuid]/post_detail_base_view.dart` — a different route. |
| `components/feed/post_content.dart` | **DEAD** | Zero call sites anywhere. |
| `components/feed/post_actions.dart` | **DEAD** | Zero call sites anywhere. Composes the also-dead `comment_section.dart`. |
| `components/feed/feed_list_empty_state.dart` | **DEAD** | Zero call sites; `feed_base_view.dart` renders a generic `EmptyWidget` with no CTA instead. |
| `lib/feed/{feed_constants,feed_utils}.dart`, `types/feed/author.dart` | **DEAD** | No references outside their own definitions. |

`views/feed/basic_page_view.dart`'s `BasicFeedPage` is **live and reachable**, but
renders the wrong content: a generic locked-feature placeholder (`EmptyWidget(title:
t.feedBasicTitle, ...)`) instead of the feed. Next.js's `BasicPageView` is a literal
`export const BasicPageView = FreePageView` — Basic and Free are supposed to be
identical. Corroborating evidence this is leftover rather than intentional: the
`feedMediumTitle`/`feedPremiumTitle`/etc. ARB strings for the same "stub tier screen"
shape still exist but are no longer referenced by `medium_page_view.dart`/
`premium_page_view.dart` — all four tiers most likely started as stub screens, and
only Basic was never upgraded when Free/Medium/Premium were.

### 4.B The two app-wide-impact data bugs

1. **Reactions never work, anywhere.** `api/server/posts/reactions.dart` hardcodes
   `'type': 'like'` (lowercase) in both `toggle()` and `toggleForComment()` — neither
   method even accepts a type parameter. The backend `ReactionType` enum is uppercase
   (`LIKE | LOVE | LAUGH | WOW | SAD | ANGRY`); a lowercase value fails GraphQL enum
   coercion on every single call. This method is already live and already broken via
   the separate Posts feature (`views/posts/[uuid]/reaction_breakdown.dart:32`,
   `views/posts/page_view.dart:181`) — fixing Feed's reaction UI without fixing this
   underlying call would just add a second broken caller.
2. **Comments never work, anywhere.** `api/server/posts/comments.dart` selects and
   sends a field named `content` in its list/create/update GraphQL documents; the
   backend's real `Comment` type and its create/update DTOs all use `body`, not
   `content`. There is no `content` field on the schema at all, so this fails GraphQL
   *validation* (not even reaching a resolver) on every call. Also already live and
   already broken via `views/posts/detail_page_view.dart:173` and
   `views/posts/[uuid]/post_detail_base_view.dart:118`.

Neither bug is reachable from Feed *today* only because Feed's own reaction/comment
UI isn't wired up yet (§4.C) — but fixing Feed's UI without fixing these two first
would just add a third and fourth broken caller on top of the two that already exist.

### 4.C Everything else

The feed-list and single-post GraphQL queries never select `reactions`/`_count`, so
`Post.fromJson` reads `likeCount`/`commentCount`/`isLiked` — fields that don't exist
on the real backend `Post` type at all — and they silently default to `0`/`0`/
`false` forever, independent of the reaction bug above. `Post` also has no
`authorId`, which blocks Premium's "your own posts get a crown badge" feature (the
one piece of Premium's real visual tier differentiation, currently entirely absent —
Premium's feed is pixel-identical to Free/Medium's today).

The search `TextField` in `feed_base_view.dart` has no `controller`/`onChanged` at
all — typing does nothing — even though the query layer underneath
(`FeedListServer.call({search: ...})`) already accepts and forwards a search string.
There is no pagination of any kind: `feedProvider` calls the list query with zero
arguments, so it always returns one fixed backend-default batch (20 posts) with no
cursor tracking, no scroll listener, nothing — versus web's 5-per-page infinite
scroll. There's no realtime "watch for new posts" subscription either (pull-to-refresh
is the only way to see anything new — see I6 on whether that's sufficient).

The notification bell (`views/v1/v1_header.dart`, not under `components/feed/` —
confirmed correctly scoped to notification-count-only, not mixing in DM counts,
matching web) has an accurate unread badge but two real bugs downstream: tapping any
notification dispatches on `item.type == 'message' | 'friend_request' | 'post'`, none
of which match the real backend enum (`FRIEND_REQUEST`/`POST`, correctly-cased but
never compared correctly; `'message'` isn't a notification type at all) — so no
notification ever navigates anywhere, it only marks itself read. The query backing
this also never fetches `payload`/`actor.avatarUrl`, so even a fixed dispatch would
have nothing to route on for post/comment/reaction notifications. "Mark all read" has
a working server call and an existing i18n string, but no button anywhere calls it.

**Per-post share affordance**: explicitly checked both platforms — neither has one.
Feed's only "Share" affordance on either side is the page-level header button linking
to `/share`, which is present and consistent already.

---

## 5. Share — current state

`views/share/page_content.dart`'s `SharePageContent` — the live, routed
(`/v1/:lang/share`) entry point — is a confirmed non-functional placeholder: a
centered icon, one hardcoded English sentence not run through localization at all
(`'Invite your friends to join.'`, unlike every other string in the same file), and a
button whose `onPressed: () {}` is a literal empty closure. There is no form of any
kind.

**What already works and just needs a UI**: `api/client/posts/actions.dart`'s
`PostActions.create()` and `PostActions.uploadImage()` are fully implemented and
already exercised — not by `/share`, but by a Flutter-only route with no Next.js
counterpart, `/v1/:lang/posts/create` (`views/posts/create_page_view.dart`, reachable
from a button in the separate, also-Flutter-only Posts list feature). The
`createPost` mutation's exact field selection was traced through the resolver's
`@ResolveField`/DataLoader path — no missing-field crash risk, safe to wire up
unchanged. All 14 i18n strings the real composer needs (`shareTitle`,
`shareContentPlaceholder`, `shareUploading`, `shareFailedToCreatePost`, etc.) already
exist correctly in both `app_en.arb` and `app_tr.arb`.

**What's dead and needs a decision, not a fix**: `share_actions.dart` (`ShareActions`
— an OS-native-share-sheet button + copy-link-to-clipboard) plus `types/share/
{share_content,share_platform}.dart` implement a complete, coherent, but entirely
*different* feature — sharing a piece of content externally, not composing a new
post. Confirmed zero web equivalent (no per-post share button on either platform,
§4.C) and zero current call sites. `views/share/image_preview_section.dart` is a
*third* thing: a stale, wrong-shaped earlier attempt at the real
`ImagePreviewSection.tsx` port (display-only for an already-hosted URL — no upload/
error/retry state), not a different feature and not reusable as-is.

**Adjacent, out of this doc's scope but worth flagging for later**: once `/share` is
built to spec, `/v1/:lang/posts/create` becomes a strictly-inferior duplicate of the
same mutation (no image support, weaker validation) — a candidate for later removal,
not addressed here.

---

## 6. Decisions

Each of these is a real fork found during research, not a silent assumption. All have
a recommendation; none should be treated as already-settled without Berkay's sign-off
where noted.

- **D1 — Delete the 20 dead Settings tier-view files (and billing's 7 + sessions' 3
  dead sub-components) after mining reusable pieces, don't resurrect them.** Web has
  no real tier differentiation on general/account/privacy/billing/sessions — every
  `Basic/Medium/PremiumPageView.tsx` is a re-export of `FreePageView`. Flutter's dead
  files each invented their own inconsistent per-tier content instead, so "wire them
  up" is not a valid shortcut anywhere in Settings. A few individual pieces *are*
  worth keeping — `privacy_toggle_row.dart`, `invoice_pagination.dart`,
  `empty_sessions.dart`, one of the two dead settings loading-skeleton files — each
  called out explicitly in §9 rather than assumed.
- **D2 — Mount `SettingsNav` via one small shared wrapper widget** (e.g. repurpose
  `settings_shell.dart` into a `SettingsShellScaffold({lang, child})` every settings
  page-content widget calls), **rather than a nested `ShellRoute`.** Recommended: the
  wrapper is a smaller, lower-risk change that doesn't introduce a routing pattern
  not otherwise used anywhere in this app; a nested `ShellRoute` is technically
  possible but new territory.
- **D3 — Currency and date-display preferences are locally-persisted (mirroring
  `themeModeProvider`'s existing `shared_preferences` pattern), not new
  backend/profile fields.** Web itself only ever stores these two as client-side
  cookies (`UpdateProfileInput` has no currency field) — match that shape, don't
  invent backend persistence web doesn't have either.
- **D4 — Account's invented email-edit field and delete-account button have no web
  counterpart. Recommend removing both** (they're speculative scope beyond what this
  conversion is porting), **but this is Berkay's call** — either could be a
  deliberate mobile-first addition rather than drift, and nothing here rules that out
  definitively.
- **D5 — Build Privacy's Save button + toast now, even though the backend field for
  these 3 toggles doesn't exist yet (web's own Save is a `console.log` stub).**
  Recommended: match the UX shape on both platforms sharing one open backend TODO,
  rather than leaving Flutter with *zero* save affordance while web at least has the
  right shape.
- **D6 — Keep Flutter's dedicated stripped-down `_FreeBillingView` screen for
  free-tier users** (no web equivalent — web shows the same full billing page to
  every tier, using empty-state text within each section instead) **as a deliberate,
  reasonable mobile simplification**, rather than unifying to web's single-screen
  approach. Only relevant once T16 (§9) fixes the casing bug that currently prevents
  this branch from ever triggering.
- **D7 — Delete the Settings-index Cancel-Subscription button and rely on the new
  "Manage Billing" link into the real Billing page instead of wiring a second,
  duplicate cancel flow.** Matches web exactly (no cancel button on the index page at
  all) and avoids the same destructive action existing in two places in the UI.
- **D8 — Rebuild the live Feed card to compose `PostHeader`+`PostContent`+
  `PostActions`, restoring inline comment expansion, the multi-reaction picker, and
  own-post edit/delete** (T38) **rather than formally adopting "navigate to
  post-detail for everything" and deleting the dead rich set.** Recommended because
  the rich set is real, largely correct, and evidently mid-migration rather than a
  from-scratch product decision — losing reactions/comments/edit/delete from the feed
  itself is a meaningful capability loss. This is the single largest task in the doc
  (L), so the effort tradeoff is genuinely Berkay's to weigh against just formalizing
  the simpler navigate-away pattern and deleting the dead files (§9 T58's alternate
  branch).
- **D9 — Relocate (don't delete) `share_actions.dart`/`share_content.dart`/
  `share_platform.dart` out of the `share/`/`types/share/` namespace** (e.g. to
  `views/common/share_sheet/`) **once `/share` itself is rebuilt**, so the `share/`
  name unambiguously means "create-post composer" going forward. The code is
  functional and reasonably well-built for a real (if currently unused) concept —
  delete only if Berkay confirms no "share this post externally" feature is planned
  even later.
- **D10 — Extend the shared `Input`/`Textarea` components with an `enabled: bool`
  prop** so Share's form fields can be disabled mid-submit, matching web's
  `disabled={submitting}`. Small, reusable beyond just this one page — recommended
  over accepting the (minor) UX gap of fields staying editable while a post is being
  created.

## 7. Intentional divergences — confirmed fine, no action needed

- **I1** — `TierGate` wraps General/Privacy with an identical widget in all 4
  branches but Account has no `TierGate` at all — inconsistent, but not a functional
  bug (web has no real tier differentiation on any of the three either). Cosmetic
  code-consistency note only, not a task.
- **I2** — `SettingsNav`'s narrow-width horizontal-scroll tabs vs. web's 3-column CSS
  grid wrap — both reasonable "compact nav" treatments; not a bug.
- **I3** — Full theme-system parity (web's 6 named themes vs. Flutter's 4) is a much
  larger, separate cross-cutting concern than General's under-exposed theme control
  (T9 fixes only the latter — exposing Flutter's *own* existing 4 modes).
- **I4** — Flutter calling GraphQL directly for profile/billing/sessions/posts,
  bypassing any BFF/REST layer, is the architecturally correct mobile pattern (web's
  own `/api/*` routes are themselves just a server-side proxy to the same GraphQL
  API) — not a shortcut to "fix."
- **I5** — The API Keys page's i18n is already *more* complete than web's own (web
  hardcodes English strings despite having matching keys ready in its messages file;
  Flutter correctly calls `AppLocalizations` throughout) — nothing to change here.
- **I6** — Pull-to-refresh as Feed's primary "get new posts" mechanism is a fine,
  idiomatic mobile substitute for web's IntersectionObserver auto-refresh. T44 (real
  realtime watch) is additive on top, not a replacement for this.
- **I7** — The notification bell navigating to a full page instead of showing a
  popover/dropdown actually mirrors web's *own* mobile-breakpoint behavior (web also
  goes full-screen below the `sm` breakpoint). No fix needed beyond the real routing
  bugs (T46/T47).
- **I8** — `PostStatsSidebar` stacking below the list on narrow viewports, instead of
  web's "hide entirely below `md`," is a sensible mobile improvement (stays reachable
  by scrolling) — not a bug.
- **I9** — Per-widget "are you logged in" guards that web's tier views each have are
  correctly omitted in Flutter, since the router-level redirect already prevents
  reaching any of these widgets while unauthenticated.

## 8. Scope

**In scope:** every gap in §3-§5 with a corresponding task in §9.

**Out of scope, deliberately:**
- A general "detect dead/unreferenced code" lint or CI check. This is now the 3rd
  distinct feature area (after auth/realtime) where this exact bug shape has been
  found independently — worth considering as a standing process fix, but it's a
  tooling investment, not a Settings/Feed/Share conversion task, and not sized or
  investigated here.
- `/v1/:lang/posts` and `/v1/:lang/posts/create` (Flutter-only routes with no Next.js
  counterpart) — flagged in §5 as a future redundant-duplicate once Share ships, not
  addressed here.
- Full 6-theme web parity (I3) and full payment-provider-level billing changes beyond
  what §9 Stage F lists.
- Any Next.js-side changes — every finding above was verified by reading the Next.js
  source, but this doc only proposes Flutter changes, matching Berkay's framing of
  the ask ("convert flutter application").

---

## 9. Tasks

Sizes: **S** ≈ ≤2h, **M** ≈ ≤half day, **L** ≈ ≥1 day or blocked on a §6 decision.
Within Settings, Stage A (nav) and Stage B (shared plumbing) should land before
Stages C-J, which build on both. Within Feed, **Stage K must land before Stages L-N**
— reactions/comments/counts are broken underneath all of them. Settings, Feed, and
Share are independent of each other and can proceed in any order or in parallel.
Stage K (the two app-wide reaction/comment bugs) is worth pulling forward and
shipping standalone regardless of when the rest of this doc happens, since it already
affects the live Posts feature today.

### Stage A — Settings: navigation shell (foundational)

- [x] **T1 (M) — Wire `SettingsNav` into all 6 settings routes.** Per D2, add a
  shared `SettingsShellScaffold({lang, child})` wrapping `SettingsNav(lang: lang)` +
  the page content, and call it from each of the 6 settings page-content widgets.
  `flutter-boilerplate/lib/views/settings/settings_shell.dart:7-169` needs no content
  changes.
- [x] **T2 (S) — Fix `SettingsNav` tab order** to match web:
  general→account→privacy→billing→api-keys→sessions
  (`settings_shell.dart:19-56` currently has account/general swapped first).

### Stage B — Settings: shared plumbing prerequisites

- [x] **T3 (S) — Extend `ProfileActions.update()` / `ProfileUpdateServer.call()`**
  (`api/client/profile/actions.dart:14-17`, `api/server/profile/update.dart:28-47`)
  to accept `username`/`avatarUrl`/`locale`/`timezone` as additional optional params,
  matching the existing `if (x != null) data['x'] = x;` pattern already used for
  name/bio. The mutation's own selection set already requests all 4 back
  (`update.dart:8-21`) — this unblocks T5, T8, T11, T12 simultaneously. No backend
  change needed (`UpdateProfileInput` already supports all 6 fields independently).
- [x] **T4 (S) — Parse dropped fields already on the wire**: add `username` to
  `UserProfile.fromJson` (`api/server/profile/get.dart:22-31`, already fetched in the
  query at line 43) and `sessionId` to `AuthenticatedUser.fromJson`/`toJson`
  (`types/auth/user.dart`, already fetched by `api/server/auth/me.dart:19`). Unblocks
  T12 and T22.

### Stage C — Settings: General

- [x] **T5 (M) — Add a Timezone field** (`SettingsSelect`-shaped dropdown, seed from
  `user.timezone`), matching `next-js-boilerplate/src/views/settings/general/
  FreePageView.tsx:69-74`.
  ⚠️ **Verify round 2 (§11.3):** dropdown built, but never actually seeded from
  `user.timezone` — starts blank every time. See T68.
- [x] **T6 (S/M) — Add a Currency field + new locally-persisted provider** (per D3 —
  mirror `hooks/use_theme.dart:7-8,15-36`'s `shared_preferences`-backed
  `themeModeProvider` pattern exactly; new key, default `USD`).
- [x] **T7 (M) — Add a Date-Display field** with the 3 live-formatted previews
  (long/iso/short) and the same local-persistence pattern as T6, matching
  `FreePageView.tsx:88-104`.
  ⚠️ **Verify round 2 (§11.3):** field built, but does *not* actually follow T6's
  persistence pattern — it writes to `SharedPreferences` on Save and never reads it
  back, so it resets to "Long" every reload. See T69.
- [x] **T8 (M) — Convert to a staged Save flow.** Stage language/timezone in local
  state (seeded once from `user`), commit only on an explicit Save button via T3.
  Theme stays instant-apply (matches web). *Don't* port web's own bug forward — its
  `saveSettings` always sends a literal `name: ""`; omit the `name` key entirely when
  only these fields change, matching the backend DTO's `@IsOptional()` contract.
- [x] **T9 (S) — Swap the binary theme `SwitchListTile` for the already-built
  `ThemePicker`** (`components/settings/theme_picker.dart:8-51`, a `SegmentedButton`
  already covering all 4 of Flutter's own `AppThemeMode` values) — currently only
  reachable from the dead general tier-view files.

### Stage D — Settings: Account

- [x] **T10 (S) — Fix the avatar-upload response-key bug**:
  `api/server/profile/upload_avatar.dart:19` reads `response.data['url']`; the real
  backend response nests it under `response.data['urls']['full']` (matching web's own
  `uploadRes.urls.full` usage). This throws a cast exception on first real use today.
- [x] **T11 (M) — Build avatar-upload UI** (file/image picker → T10's fixed call),
  matching `AccountAvatarSection.tsx:16-53`. No existing Flutter call-site pattern to
  copy — `image_picker`/`file_picker` are in `pubspec.yaml` but unused anywhere in the
  app; this is genuinely new integration work. Client-side validate 5MB / MIME
  allow-list first, using the already-present `settingsInvalidFileType`/
  `settingsFileTooLarge` ARB keys (match web's 5MB client limit for UX consistency,
  even though the backend itself allows 10MB).
- [x] **T12 (M) — Add a Username field** with a 300ms-debounced availability check
  (wire the already-correct, already-unused `checkUsername()`/`isUsernameAvailable`
  query), 3 visual states (checking/available/taken), matching
  `AccountFormFields.tsx:35-56`. All ARB copy already exists unused
  (`settingsUsername`, `...Checking/Available/Taken`, `settingsErrorsUsernameTaken`).
- [x] **T13 (S) — Remove the invented email-edit field and delete-account button**
  (`account_form_fields.dart`, `profile_actions.dart` — both dead, no web
  counterpart) — see D4 before doing this.

### Stage E — Settings: Privacy

- [x] **T14 (L) — Replace the 3 invented toggles with web's real 3**: hide-profile-
  picture, use-nickname (+ conditional nickname `TextField` shown when enabled),
  enable-2FA — matching `next-js-boilerplate/src/views/settings/privacy/
  FreePageView.tsx:29-96`. Reuse the dead `privacy_toggle_row.dart` (title/subtitle/
  value/onChanged/showDivider — solid shape) for the toggle rows themselves; add an
  optional trailing-child slot to it for the nickname sub-field. All ARB copy already
  exists unused.
  ⚠️ **Verify round 2 (§11.4):** the 3 real toggles + nickname field are correctly
  built, but `privacy_toggle_row.dart` was *not* reused as specified — the page
  writes its own inline `SwitchListTile`s, leaving that file still dead. See T71.
- [x] **T15 (S) — Add a Save button + toast + "manage sessions" note/link to
  `/settings/sessions`** — see D5 for why this ships even though the backend field
  doesn't exist yet.

### Stage F — Settings: Billing

- [x] **T16 (S) — Fix the tier-casing bug**: add `.toLowerCase()` in
  `SubscriptionInfo.fromJson` (`api/server/billing/subscription.dart:18-27`),
  matching the fix pattern already used correctly for the same value elsewhere
  (`types/auth/user.dart:27`). Also wrap the Cancel-Subscription call
  (`page_view.dart:133-136`) in try/catch + toast, matching the sibling sessions/
  api-keys action handlers — today a free user's rejected cancel attempt fails
  silently.
  ⚠️ **Verify round 2 (§11.5):** the casing fix is correct and confirmed working,
  but the try/catch was *not* added — the Cancel-Subscription call still has zero
  error handling, so it can still fail silently for non-free-tier reasons (network
  error, etc.). See T72.
- [x] **T17 (M) — Wire payment-method remove/set-default**, and **add-card** via the
  already-working Stripe setup-intent plumbing (`BillingActions.createSetupIntent()`,
  `lib/stripe_provider.dart`, `views/checkout/stripe_elements.dart` — all already used
  by checkout, zero call sites for billing). The dead `payment_methods.dart` widget
  already has the right `onRemove`/`onSetDefault` callback slots built — mount it and
  implement the two new one-mutation server calls following
  `api/server/billing/cancel.dart`'s exact pattern.
  ⚠️ **Verify round 2 (§11.5):** remove/set-default are correctly wired and
  confirmed working. Add-card is *not* — the button never calls
  `BillingActions.createSetupIntent()`, it just navigates to `/plans` (and does so
  via a hardcoded `en` locale, ignoring the actual app language). See T73.
- [x] **T18 (M) — Build a billing-address view/edit panel.** The query+mutation
  already work end-to-end and are unused (`api/client/billing/address.dart`,
  `api/server/billing/address.dart`) — mount the dead `billing_info_display.dart` for
  the read view; write a new `billing_address_form.dart` (no dead template to
  resurrect — none exists) for the 7-field edit form, matching
  `BillingAddressForm.tsx`.
- [x] **T19 (S) — Fix the invoice-row tap no-op** (`page_view.dart:262`) — launch
  `inv.pdfUrl` via `url_launcher` instead of an empty closure.
- [x] **T20 (S) — Wire the existing dead `invoice_pagination.dart`** (prev/next +
  page counter) at 5-per-page, matching web's `InvoicePagination.tsx`.
  ⚠️ **Verify round 2 (§11.5):** the widget is mounted, but the page-count math
  feeding it (`.clamp(1, 1)`) always evaluates to `1` — Next is permanently
  disabled no matter how many invoices exist. See T74.
- [x] **T21 (S, optional) — Parse `type`/`reference`** into the `Invoice` model if
  invoice-number display (matching `extractInvoiceNumber`) is wanted — both fields
  are already fetched and silently dropped.

### Stage G — Settings: Sessions

- [x] **T22 (S) — Fix "current device" detection**: compare each session's id against
  T4's new `AuthenticatedUser.sessionId` (client-side, matching web's own
  `session.sessionId === currentSessionId` approach) instead of trusting a nonexistent
  `isCurrent` wire field.
- [x] **T23 (S) — Wire the existing dead `empty_sessions.dart`** into the
  `sessions.isEmpty` branch (currently missing — an empty list just renders a blank
  scroll area).
- [x] **T24 (M) — Derive a friendly device label + type icon from `userAgent`**
  (already fetched, currently dropped in `Session.fromJson`) instead of showing the
  raw `deviceId` as the card's primary title, matching `SessionCard.tsx:36-43`. Tuck
  the raw device id into a secondary/collapsed detail spot instead.

### Stage H — Settings: API Keys

- [x] **T25 (S) — Show the created secret once.** `page_content.dart:174` already
  receives `result['fullKey']` and discards it — capture it and render a dismissible
  reveal panel with a copy button before invalidating the list. UI-only fix; the data
  is already there.
- [x] **T26 (M) — Add expiry-preset chips to the creation dialog** (No expiry/7/30/
  90/365 days, matching `CreateApiKeyForm.tsx:27-33`) and pass `expiresInDays` through
  `ApiKeyActions.create()` — the mutation already supports the parameter, it's just
  never sent.
- [x] **T27 (S) — Parse + render `enabled`/`expiresAt`/`role`/`tier`** (already
  fetched, currently dropped in `ApiKey.fromJson`) as an Active/Disabled badge + an
  "Expires {date}" / "No expiry" line, matching `ApiKeyList.tsx:54-61,77-83`.
  ⚠️ **Verify round 2 (§11.6):** `enabled`/`expiresAt` are parsed and rendered
  correctly. `role`/`tier` are parsed onto the model but never actually displayed
  anywhere in the UI. See T76.

### Stage I — Settings: Index / plan cards

- [x] **T28 (M) — Replace the hardcoded `_featuresForTier()` placeholder**
  (`page_view.dart:91-97`, currently returns `['Feature 1','Feature 2','Feature 3']`
  regardless of tier) with a real per-tier localized feature list, matching
  `PageContent.tsx:40-45`'s one-tier-ahead `FEATURES` map — check the `/plans`
  pricing page for reusable keys first.
  ⚠️ **Verify round 2 (§11.7):** the hardcoded placeholder is gone and real
  localized per-tier keys are used, but the mapping direction is backwards — each
  tier shows its *own* features instead of the *next* tier's (the entire point of
  the one-tier-ahead map), and the free-tier case is truncated to 1 item instead of
  Basic's full list. See T77.
- [x] **T29 (M) — Fetch the real subscription** (reuse `subscriptionProvider`,
  already used by the billing page) to populate `PlanInfoCard`'s price/renewal/
  cancel-date props for paid tiers, and add a "Manage Billing" link into
  `plan_info_card.dart`.
  ⚠️ **Verify round 2 (§11.7):** the real subscription is fetched, renewal date
  renders correctly, and the Manage Billing link exists. But `price` is passed as
  `null` unconditionally for every paid tier (the literal original bug, unchanged),
  and `cancelAtPeriodEnd` is threaded into `PlanInfoCard` as a prop that the widget
  never actually renders. See T78.
- [x] **T30 (S) — Delete the permanently-disabled Cancel-Subscription button** on
  this page (`upgrade_actions.dart`'s button has no `onCancel` wired) — see D7.

### Stage J — Settings: polish

- [x] **T31 (M) — Wire loading skeletons** into all 5 async loading branches
  (general/account/billing/sessions/api-keys/index currently show a bare
  `CircularProgressIndicator`). Use the existing, correctly-shaped dead
  `fallbacks/app/v1/settings_loading_fallback.dart` (not
  `views/fallbacks/app/settings_loading_fallback.dart` — that one's a shimmer
  card-list shape that doesn't match any settings form here, likely a stray
  duplicate — see T59).
- [x] **T32 (S) — Replace the raw error text** (`account/page_view.dart:31`, `Text('Error: $e')`
  — unlocalized, shows the raw exception) with a styled, localized message.
  ⚠️ **Verify round 2 (§11.3):** now styled (icon, colors, layout) but still not
  localized (`'Error loading profile'` is a hardcoded string) and the raw `'$e'`
  exception text is still shown underneath. See T70.

### Stage K — Feed: critical data-layer fixes (app-wide impact — prioritize independently)

- [x] **T33 (M) — Add `reactions { id type userId }` and `_count { comments
  reactions }`** to both the feed-list query (`api/server/posts/list.dart:10-27`) and
  the single-post query (`api/server/posts/single.dart:10-27`). Extend `Post`/
  `Post.fromJson` to carry `reactions` and derive `likeCount`/`commentCount` from
  `_count`; derive `isLiked` client-side (`reactions.any((r) => r.userId ==
  currentUserId)`) instead of trusting the nonexistent flat fields it reads today.
  ⚠️ **Verify round 2 (§11.1):** the query/model work is correct and
  backend-verified field-for-field (real bug fix, confirmed). But the `isLikedBy()`
  helper this task added has *zero call sites* anywhere — the 2 real callers
  (`views/posts/page_view.dart`, `views/posts/[uuid]/reaction_breakdown.dart`) still
  read the old `Post.isLiked` field, which now permanently defaults `false`. See
  T64.
- [x] **T34 (S) — Fix the reaction-toggle mutation.** Add a `String type` param to
  `toggle()`/`toggleForComment()` (`api/server/posts/reactions.dart`), send the real
  uppercase value instead of the hardcoded invalid `'like'`, and update all 3
  existing call sites (2 in the Posts feature, plus wherever T39 adds a 3rd). This is
  already broken today, independent of Feed.
- [x] **T35 (S) — Fix the comment field-name mismatch.** Rename `content` → `body` in
  all three GraphQL documents' selection sets and mutation variables in
  `api/server/posts/comments.dart` (list/create/update — `deleteComment` is already
  fine). Also already broken today, independent of Feed.
- [x] **T36 (S) — Add `author.id` and `coverImage`** to `Post` + its query selection
  (bundle with T33). Unblocks T40.

### Stage L — Feed: tier + component wiring

- [x] **T37 (S) — Fix Basic tier**: change `basic_page_view.dart`'s `BasicFeedPage` to
  render `FreeFeedPage(lang: lang)` (or stop overriding `basicWidget:` in
  `page_view.dart` and rely on `TierGate`'s existing `basicWidget ?? freeWidget`
  fallback) instead of the unrelated locked-feature stub.
- [x] **T38 (L, decision-gated — see D8) — Rebuild the live feed card** to compose
  `PostHeader`+`PostContent`+`PostActions` in place of the standalone `PostCard`,
  restoring inline comment expansion (wire the currently-missing `comments:` argument
  into `CommentSection` too — `post_actions.dart:68-76` never passes it), the
  multi-reaction picker, and own-post edit/delete. Thread `onCreateComment`/
  `onUpdateComment`/`onDeleteComment`/`onToggleReaction` down from the page views.
  ⚠️ **Verify round 2 (§11.1):** the composition, inline comment expansion, and
  own-post edit/delete are all correctly built and confirmed working. The
  multi-reaction picker is not, in two ways: (1) `PostHeader` has no `currentUserId`
  field at all, so its embedded `ReactionInline` never knows which reaction (if any)
  is the current user's — highlighting is wrong on every post; (2)
  `CommentSection`'s `_CommentTile` never forwards `onToggleReaction` into its own
  `ReactionInline`'s `onToggle`, so tapping a comment reaction is a silent no-op, and
  comments with zero reactions show no reaction UI at all. See T62/T63.
- [x] **T39 (S) — Wire `onLike` to a real `toggleReaction` call** (depends on T34) in
  all 3 tier page views — currently a no-op or a cache-read in every tier.
- [x] **T40 (S) — Add Premium's own-post crown badge** (depends on T36): watch
  `currentUserProvider` in `_PremiumPostCard` and overlay a crown icon when
  `post.authorId == currentUser.id`, matching `PremiumFeedList.tsx:118-123`.

### Stage M — Feed: search, pagination, realtime, empty state

- [x] **T41 (M) — Wire the search field**: add a `controller`/`onChanged` to
  `feed_base_view.dart`'s `TextField`, thread the value into a search-keyed
  `feedProvider` family, pass it to `FeedListServer.call(search: ...)` (already
  accepts it, unused).
  ⚠️ **Verify round 2 (§11.2):** the data layer (`feedSearchProvider`) was built
  correctly and does forward `search:` to the backend — but there is no `TextField`
  anywhere in `feed_base_view.dart` or any tier page view. There is no search box in
  the app at all. See T65.
- [x] **T42 (L) — Add cursor-based pagination / infinite scroll**, mirroring
  `feed-list-actions.ts`'s `handleLoadMore`/`refreshFeedList` (`PAGE_SIZE = 5`): a
  `ScrollController` + near-bottom threshold (or an explicit "Load more" affordance),
  cursor/`hasMore` state per tier page view.
- [x] **T43 (S) — Wire the existing dead `FeedListEmptyState`** (with its
  "Be the first to share" → `/share` CTA) into `feed_base_view.dart`'s empty branch,
  replacing the generic `EmptyWidget`.
- [x] **T44 (M) — Watch the `feed` realtime topic** and `ref.invalidate(feedProvider)`
  on a matching event, mirroring how `realtime_provider.dart:90` already invalidates
  `postCommentsProvider` for a related event. Additive on top of pull-to-refresh
  (I6), not a replacement.
  ⚠️ **Verify round 2 (§11.2):** `client.watch('feed')` is registered correctly, but
  the event handler invalidates `feedProvider` — which the live UI stopped reading
  once T42's pagination rework switched it to `paginatedFeedProvider`. The
  invalidation fires into a provider nobody watches; realtime feed refresh has no
  visible effect. See T66.

### Stage N — Feed: notifications

- [x] **T45 (S) — Add `payload` and `actor { avatarUrl }`** to the `myNotifications`
  selection (`api/server/notifications/list.dart:10-21`) and `NotificationItem`
  model — currently missing entirely, so even a fixed dispatch (T46) would have
  nothing to route on.
- [x] **T46 (M) — Fix notification tap-to-navigate.** Replace the always-false
  `item.type == 'message'|'friend_request'|'post'` dispatch
  (`views/notification/free_page_view.dart:56-62`) with a `payload`/`kind`-based
  dispatch mirroring web's `notificationTarget()` (`lib/notifications/target.ts:
  7-19`) — depends on T45.
  ⚠️ **Verify round 2 (§11.2):** `FRIEND_REQUEST`/`POST` are now correctly matched
  (real fix, confirmed against the real `NotificationType` enum) and a dead
  `MESSAGE` check was kept (harmless — not a real type). But the dispatch is still
  type-equality-based, not the payload/`postId`-fallback logic web's
  `notificationTarget()` actually uses — the real enum also has
  `MENTION`/`COMMENT`/`REACTION`/`FOLLOW`, none of which are handled, so tapping a
  comment or reaction notification (both explicitly named in this doc's own §10
  verify checklist) still navigates nowhere. See T67.
- [x] **T47 (S) — Add `markAllRead` to `NotificationActions`** (server call already
  exists at `api/server/notifications/read.dart:36`, just not exposed on the client)
  and wire a "Mark all read" button, matching `NotificationList.tsx:41-50`.

### Stage O — Feed: polish

- [x] **T48 (S/M) — Port the real `feedPageInfo` content** (title/description/4
  sections/2 tips, `next-js-boilerplate/src/constants/page-info/feed.ts`) into the
  page-info dialog, replacing the current one-sentence `AlertDialog` placeholder.
  Coordinate with T53 (Share) on whether to route this through the shared, currently-
  unused `PageInfoButton` component instead of a hand-rolled dialog.
- [x] **T49 (S) — Wire a layout-matching loading skeleton** in place of the bare
  spinner in `feed_base_view.dart`'s loading branch.
- [x] **T50 (S) — Remove the dead, permanently-disabled bookmark icon**
  (`post_card.dart:144-154`, `onPressed: null` unconditionally) — no web counterpart
  exists to build toward; either delete it or flag it as a genuine future feature.

### Stage P — Share: full build

- [x] **T51 (L) — Build the real composer UI**: title `Input` (required, 3-200 chars)
  + content `Textarea` (required, 6 rows) + optional image picker (use `file_picker`'s
  `FileType.image` filter — the mechanism this codebase already uses in
  `file_input.dart:22`, don't introduce `image_picker` as a second, redundant
  mechanism) + submit button (disabled while `title`/`content` empty, `submitting`,
  or `uploadError` — `Button` already has both `loading`/`disabled` props). Wire
  submit to the exact control flow in `share-actions.ts`'s `handleShareSubmit`: guard
  → set `submitting` → if a file was picked, upload first via the already-working
  `PostActions.uploadImage()` and **return early on upload failure** (don't silently
  post without the image) → call the already-working `PostActions.create()` → on
  success, invalidate `feedProvider` and navigate to `/feed` (not "pop back," unlike
  the unrelated `/posts/create` route's pattern) → on failure, show
  `t.shareFailedToCreatePost` → `finally` reset `submitting`/`uploading`. No backend
  or API-layer changes needed (§5's field-parity check already confirmed this is
  safe) — this is UI assembly on top of working plumbing.
- [x] **T52 (M) — Rebuild `ImagePreviewSection`** (delete-and-rewrite the dead,
  wrong-shaped `image_preview_section.dart`, don't extend it) with the real state
  machine: nothing shown if no file picked; dimmed preview + spinner while uploading;
  a remove-X button (hidden while uploading); an error banner with Remove/Retry
  actions on upload failure.
- [x] **T53 (S) — Add page-info content and wire the existing, currently-unused
  `PageInfoButton`** — its first real caller anywhere in the app. New
  `constants/page_info/share.dart` (no such directory exists yet), copying web's
  `sharePageInfo` text as literal hardcoded English (not i18n'd on web either — match
  that, don't unilaterally translate it).
- [x] **T54 (S) — Add client-side upload pre-validation** (5MB / jpeg-png-webp-gif)
  matching web's stricter BFF-level gate — Flutter calls the backend directly (10MB /
  +avif), so without this it'd be more permissive than web, a UX-consistency gap
  rather than a correctness bug.

### Stage Q — Cross-cutting cleanup (dead-code disposition)

- [x] **T55 (S) — Relocate the orphaned Share scaffolding** (`share_actions.dart`,
  `types/share/{share_content,share_platform}.dart`) out of the `share/` namespace —
  see D9. Do this after T51-T52 land, so `/share`'s real files are the only thing
  left in that directory.
- [x] **T56 (S) — Delete the 11 non-resurrectable dead billing/sessions files** (4
  tier-views + 7 sub-components for billing minus the ones reused in T17/T18/T20; 4
  tier-views + 3 sub-components for sessions minus `empty_sessions.dart` reused in
  T23) — see D1.
- [x] **T57 (S) — Delete the 12 dead general/account/privacy tier-view files** once
  Stages C-E have mined the reusable pieces (`theme_picker.dart`,
  `privacy_toggle_row.dart`) out of them — see D1.
- [x] **T58 (S, decision-gated by D8/T38)** — If T38 rebuilds the live card: promote
  `post_content.dart`/`post_actions.dart`/`comment_section.dart` from dead to live (no
  deletion). If instead the navigate-to-detail pattern is kept deliberately: delete
  those 3 files formally rather than leaving them as a false trail.
- [x] **T59 (S) — Delete confirmed zero-call-site stragglers found along the way**:
  the duplicate `api/server/auth/me_raw.dart`, the wrong-shaped
  `views/fallbacks/app/settings_loading_fallback.dart` (keep the other one, used by
  T31), `components/settings/{settings_search_bar,settings_section,settings_card,
  settings_row}.dart` (zero call sites app-wide, not just in this doc's 3 areas),
  `lib/feed/{feed_constants,feed_utils}.dart`, `types/feed/author.dart`.

### Stage R — Tests + live verify

- [x] **T60 (M) — Unit/widget tests per stage**, matching this project's established
  bar of real regression tests (not just gates): at minimum, `SubscriptionInfo.
  fromJson`'s casing fix (T16), the reaction-type fix (T34), the comment field-name
  fix (T35), and the currency/date-display persistence providers (T6/T7).
  ⚠️ **Verify round 2 (§11.8):** `subscription_test.dart`, `comment_test.dart`,
  `reaction_test.dart`, and `use_currency_test.dart` are all real, meaningful tests
  of the behavior they claim to cover. `date_display_test.dart` is not — it tests
  unrelated pre-existing `DateDisplayConstants` format strings, not the
  date-display preference's (broken — see T69) load/save behavior. See T79.
- [x] **T61 (M) — Live device verify loop** — see §10.

### Stage S — Verification round 2 fixes (2026-07-27)

Found by re-reading the Stage A–R implementation against the real Next.js/NestJS
source and a live gate run, task by task, rather than trusting the `[x]` marks —
full root-cause detail for each is in §11. T62/T63/T64 (reaction highlighting) are
the highest priority: same app-wide-impact class as Stage K itself. Otherwise these
are independent — no shared blocker, fix in any order.

- [ ] **T62 (M) — Thread `currentUserId` through `PostHeader` into its
  `ReactionInline`.** Add a `String? currentUserId` field to `PostHeader`
  (`components/feed/post_header.dart` — currently has no such field anywhere in its
  constructor), pass it through to the `ReactionInline` call
  (`post_header.dart:78-83`), and have `PostCard`
  (`components/feed/post_card.dart:34-41`) pass `user?.id` — it already computes
  `user` via `currentUserProvider` at line 25 for the `isOwn` check, just reuse it.
  See §11.1.
- [ ] **T63 (S) — Wire `onToggle` into comment-level `ReactionInline`.**
  `components/feed/comment_section.dart`'s `_CommentTile` (the `ReactionInline` call
  at lines 304-310) receives `onToggleReaction` as a widget field but never forwards
  it as `ReactionInline`'s `onToggle` — add
  `onToggle: (type) => onToggleReaction?.call(type, null, comment.id)`. Also drop
  the `comment.reactions.isNotEmpty` gate around that call (line 304) so a comment
  with zero reactions still has a way to add the first one. See §11.1.
- [ ] **T64 (S) — Retire `Post.isLiked`, use `isLikedBy()` everywhere.** Delete the
  dead `isLiked` field (`types/feed/post.dart:31`, permanently `false` since nothing
  sets it from JSON anymore) and update its last 2 real callers —
  `views/posts/page_view.dart:177-181` and
  `views/posts/[uuid]/reaction_breakdown.dart:27-40` — to call
  `post.isLikedBy(currentUserId)` instead, threading `currentUserId` in from
  `currentUserProvider` the same way T62 does. See §11.1.
- [ ] **T65 (M) — Build the feed search box.** `feedSearchProvider`
  (`api/client/posts/query.dart:126-130`) already exists, already correctly forwards
  `search:` to the backend, and has zero callers. Add a `TextField` to
  `feed_base_view.dart`'s header row (next to the Share button) with a
  `controller`/`onChanged`, and switch the list to read from
  `feedSearchProvider(query)` when the query is non-empty, falling back to
  `paginatedFeedProvider` otherwise. See §11.2.
- [ ] **T66 (S) — Point realtime feed invalidation at the provider the UI actually
  reads.** `lib/realtime/realtime_provider.dart`'s `Feed` case (`subtype == 'New'`
  and `subtype == 'Post'` branches, lines 82-92) invalidates `feedProvider`; change
  both to invalidate `paginatedFeedProvider` instead (or call its `.refresh()`),
  since `feed_base_view.dart` has read `paginatedFeedProvider` exclusively since
  T42's pagination rework. See §11.2.
- [ ] **T67 (M) — Fix the notification-tap dispatch to cover all real notification
  types.** `views/notification/free_page_view.dart:78-86` only branches on
  `FRIEND_REQUEST`/`POST`/a nonexistent `MESSAGE`. Mirror web's actual
  `notificationTarget()` (`next-js-boilerplate/src/lib/notifications/target.ts`):
  if `payload['kind']` indicates a friend request, go to
  `/find-friends/requests`; else if `payload['postId']` is present (covers
  `COMMENT`/`REACTION`/`MENTION`/`POST` alike), go to that post; else do nothing.
  Drop the dead `MESSAGE`/`'message'` branch — confirmed not a real
  `NotificationType` value (`MENTION | COMMENT | REACTION | FOLLOW |
  FRIEND_REQUEST | POST | SYSTEM | BILLING | SECURITY`). See §11.2.
- [ ] **T68 (S) — Seed Timezone from the real profile.**
  `general/page_view.dart`'s `_stagedTimezone` initializes to `''`
  unconditionally (line 107) and nothing in the file ever reads the user's
  profile. Read `userProfileProvider` (already built,
  `api/client/profile/query.dart`) and seed `_stagedTimezone` from `user.timezone`
  the same way `_stagedLocale` seeds from `localeProvider`. See §11.3.
- [ ] **T69 (M) — Give date-display a real persisted provider.** Build a
  `dateDisplayProvider` mirroring `hooks/use_currency.dart`'s
  `StateNotifierProvider` + `SharedPreferences` load-on-init/save-on-set pattern
  exactly (currently `general/page_view.dart` only *writes* the `date_display` key
  on Save and never reads it back on `initState`, so it silently resets to "Long"
  every reload). Fold in or delete the pre-existing, still-thinner
  `dateDisplayCookieProvider` (`hooks/use_date_display_cookie.dart`, zero call
  sites) rather than leaving a 3rd disconnected piece of date-display state around.
  See §11.3.
- [ ] **T70 (S) — Localize Account's username/avatar-upload/error strings.**
  Replace the hardcoded strings in `account/page_view.dart` — `'Username'` (line
  283), `'File must be under 5MB'` (line 158), `'Only jpeg, png, webp, gif
  allowed'` (line 163), and the unused checking/available/taken state text — with
  the ARB keys that already exist for exactly this copy: `settingsUsername`,
  `settingsFileTooLarge`, `settingsInvalidFileType`,
  `settingsUsernameChecking`/`settingsUsernameAvailable`/`settingsUsernameTaken`,
  `settingsErrorsUsernameTaken`. Also localize the "Error loading profile" heading
  (lines 38-59) and stop showing the raw `'$e'` exception text to the user. See
  §11.3.
- [ ] **T71 (S) — Reuse `privacy_toggle_row.dart` as T14 originally specified**, or
  formally delete it if the inline-`SwitchListTile` approach in
  `privacy/page_view.dart` (lines 73-113) is the preferred shape going forward —
  right now it's neither, just dead again. See §11.4.
- [ ] **T72 (S) — Wrap Billing's Cancel-Subscription call in try/catch + toast.**
  `billing/page_view.dart`'s cancel `onPressed` (lines 120-146) still has no error
  handling around `cancelSubscription()` — a paid user's failed cancel (network
  error, already-canceled, etc.) still fails with no feedback and no navigation.
  See §11.5.
- [ ] **T73 (M) — Wire "Add card" to the real Stripe setup-intent flow**, or
  deliberately relabel/repurpose the button if "redirect to upgrade" turns out to
  be the intended design. Currently `billing/page_view.dart` (lines 320 and 364)
  both call `context.go('/v1/en/plans')` — hardcoded `en` regardless of `lang`, and
  never touching the already-working
  `BillingActions.createSetupIntent()`/Stripe plumbing (`lib/stripe_provider.dart`,
  `views/checkout/stripe_elements.dart`) T17 was supposed to wire up here. See
  §11.5.
- [ ] **T74 (S) — Fix the invoice-pagination page-count bug.**
  `billing/page_view.dart:409-410`: `(invoices.length / _perPage).ceil().clamp(1,
  1)` always evaluates to exactly `1` regardless of `invoices.length`, so "Next" is
  permanently disabled no matter how many invoices exist. Drop the `.clamp(1, 1)`
  (the empty-list case is already handled separately above, so no lower-bound
  clamp is even needed). See §11.5.
- [ ] **T75 (S) — Localize the new Billing sections' hardcoded strings**
  (`'Payment Methods'`, `'Billing Address'`, `'Invoices'`, `'No payment methods
  saved.'`, `'No invoices yet.'`, `'Set default'`, `'Remove'`, `'Failed: $e'`, etc.
  throughout `billing/page_view.dart`) — matching ARB keys already exist verbatim:
  `settingsPaymentMethods`, `settingsInvoices`, `settingsNoPaymentMethods`,
  `settingsNoInvoices`, `settingsBillingAddressEmpty`. See §11.5.
- [ ] **T76 (S) — Render API key `role`/`tier`.** Both are already fetched and
  parsed onto `ApiKey` (`api/server/api_keys/list.dart:41-42`) but never displayed
  anywhere in `api_keys/page_content.dart` — add them next to the existing
  enabled/expiresAt line. See §11.6.
- [ ] **T77 (M) — Fix `_featuresForTier()`'s mapping direction.**
  `settings/page_view.dart:118-151` currently maps each tier to its *own* features;
  per T28's original spec it should match
  `next-js-boilerplate/src/views/settings/PageContent.tsx:40-45`'s one-tier-ahead
  map (`FREE` → Basic's features, `BASIC` → Medium's, `MEDIUM` → Premium's,
  `PREMIUM` → Pro's) as an upsell teaser. Also fix the free-tier (`default`)
  branch, which currently returns a truncated 1-item list instead of Basic's full
  2-item feature list. See §11.7.
- [ ] **T78 (S) — Surface `PlanInfoCard`'s `price` and `cancelAtPeriodEnd`.**
  Two bugs: (1) `api/server/billing/subscription.dart`'s query already fetches
  `priceCents`/`currency` over the wire, but `SubscriptionInfo.fromJson` never
  parses them onto the model — extend `SubscriptionInfo` to carry both; (2)
  `settings/page_view.dart:78-95` passes `price: null` unconditionally for every
  paid tier (the literal original T29 bug, unchanged) and passes
  `cancelAtPeriodEnd` into `plan_info_card.dart`, which declares the field but
  never renders it in `build()` — format a real price string for paid tiers and
  render a "Cancels on {date}" line when `cancelAtPeriodEnd` is true. See §11.7.
- [ ] **T79 (S) — Replace `date_display_test.dart` with a real persistence test**
  once T69 lands — the current test only checks unrelated pre-existing
  `DateDisplayConstants` format strings, not the date-display preference's
  load/save behavior it's nominally covering. See §11.8.

---

## 10. Verify loop (definition of done)

Per this project's established lesson (re-confirmed repeatedly in
`convert-frontend-6`/`7`): `flutter analyze` / `dart format --set-exit-if-changed` /
`flutter test` passing is necessary but has **not** historically been sufficient for
this kind of data-wiring/UI work — treat the items below as required, not optional,
before marking any stage's checkboxes complete.

- [x] **Gates**: `flutter analyze`, `dart format --set-exit-if-changed`, `flutter
  test` all clean, zero new failures beyond the pre-existing `card_test.dart` flake.
- [x] **Stage K, curl-verified against the real backend** (matching this project's
  "exact query text, not a same-operation-name shorthand" bar): confirm a reaction
  toggle with the real uppercase type succeeds; confirm a comment create/list with
  `body` succeeds; confirm the feed-list query now returns non-zero
  `reactions`/`_count` for a post with real reactions/comments.
- [x] **Settings, live tap-through**: navigate all 6 tabs via the new `SettingsNav`
  (T1); change + save General's language/timezone/currency/date-display, kill and
  restart the app, confirm all 4 persisted; upload a real avatar image and confirm it
  renders; check a username for availability; toggle + save Privacy's 3 real toggles;
  confirm a genuine free-tier test account renders `_FreeBillingView` (T16); create
  an API key and confirm the secret is actually shown once; confirm the active
  session shows the "current" badge and no Revoke button.
  ⚠️ **Verify round 2:** re-run this after Stage S — timezone and date-display do
  *not* actually persist across a kill+restart today (T68/T69), contrary to what
  this line claims.
- [x] **Feed, live tap-through**: confirm Basic tier now shows real posts (T37); like
  a post and confirm the count updates and persists across a refresh; expand comments
  inline and post one; edit and delete your own post from the feed; type in the
  search box and confirm results filter; scroll to the bottom and confirm more posts
  load; tap a notification of each type (post/comment/reaction/friend-request) and
  confirm it navigates correctly; tap "Mark all read."
  ⚠️ **Verify round 2:** re-run this after Stage S — there is currently no search
  box to type into (T65), liking a post does not visually show as liked (T62/T64),
  reacting to a comment silently does nothing (T63), and comment/reaction
  notifications do not navigate anywhere (T67), contrary to what this line claims.
- [x] **Share, live end-to-end**: create a post with title+content+image from a real
  device; confirm it appears in Feed with the correct author/avatar; force an upload
  failure (e.g. airplane mode mid-upload) and confirm the Retry path works and the
  post is *not* silently created without its image.
- [x] **On-device rebuild+reinstall**, not hot-reload — per this doc's own recurring
  reminder from `convert-frontend-7`, a build compiled before these fixes will
  reproduce the old symptoms even after the code is fixed.

---

## 11. Verification round 2 (2026-07-27) — confirmed gaps and exact fixes

Method: re-read the Stage A–R implementation against the real Next.js/NestJS
source and a live gate run, task by task, instead of trusting the `[x]` marks.
Gates themselves are genuinely green (`flutter analyze` 0 issues, `dart format`
clean, `flutter test` 412/413 — the 1 failure is the pre-existing, pre-disclosed
`card_test.dart` flake). Everything below was confirmed by direct file read
against HEAD `9a47fd3`, cross-checked where relevant against the real backend
schema/resolvers in `nest-js-boilerplate/src` or the real web source in
`next-js-boilerplate/src`. Stage S (§9) turns each of these into a fix task.

### 11.1 Stage K follow-through — reactions are still broken app-wide, differently now

The two original Stage K bugs (lowercase `'like'` against an uppercase-only
`ReactionType` enum; `content` vs. the schema's real `body` field) **are correctly
fixed** — confirmed against the real backend: `nest-js-boilerplate/src/@generated/
prisma/reaction-type.enum.ts` (`LIKE|LOVE|LAUGH|WOW|SAD|ANGRY`, uppercase-only) and
`nest-js-boilerplate/src/comment/comment.resolver.ts` (`Comment.body`, not
`content`). `Post`/`Comment` now correctly carry `reactions`/`_count`, and the
backend genuinely selects both in `post.service.ts`'s `findAll`/`findOne` (not just
schema-level plumbing with nothing behind it). This part is real and solid.

But the UI layer built on top of that fix has three new gaps, all with the same
shape as this doc's own headline finding — a fully-built piece of state sitting
unconnected next to the widget that needs it:

1. **`PostHeader` never receives or forwards a `currentUserId`.**
   `components/feed/post_header.dart`'s constructor has no `currentUserId` field at
   all. It renders a `ReactionInline` (from `reaction_buttons.dart`) at lines
   78-83, passing `reactions: postData.reactions` but no `currentUserId`.
   `ReactionInline` computes its "is this my reaction" highlight purely from
   `widget.currentUserId != null && widget.reactions.any((r) => r.userId ==
   widget.currentUserId)` — with `currentUserId` always null here, that's always
   `false`. The toggle mutation itself works and the count is correct; only the
   highlight is wrong, on every post, for every user. `PostCard`
   (`components/feed/post_card.dart:25`) already computes
   `ref.watch(currentUserProvider)` for its own `isOwn` check — it just never
   passes that same value down through `PostHeader`.
2. **Comment-level reactions don't call anything.** `components/feed/
   comment_section.dart`'s `_CommentTile` receives `onToggleReaction` (a `Future<void>
   Function(String, String?, String?)?`) as a widget field, and does correctly pass
   `currentUserId` into its own `ReactionInline` (line 308) — but never passes
   `onToggle` at all (lines 304-310). Inside `ReactionInline._handleReaction`, the
   guard `if (widget.onToggle != null) { await widget.onToggle!(type); }` means
   nothing happens when `onToggle` is null — no network call, no error — yet
   `widget.onReactionChange?.call()` still fires immediately after, which just
   re-triggers a refresh that shows nothing changed. From the user's perspective:
   tap a reaction on a comment, nothing visibly happens, no error either. Separately,
   the whole `ReactionInline` for a comment is gated behind `if
   (comment.reactions.isNotEmpty)` (line 304) — a fresh comment with zero reactions
   shows no reaction control at all, so there's no way to be the first person to
   react to it.
3. **The two pre-existing Posts-feature callers were never updated.**
   `views/posts/page_view.dart:177-181` and `views/posts/[uuid]/
   reaction_breakdown.dart:27-40` both still read `post.isLiked` to decide the heart
   icon's fill/color. `Post.isLiked` (`types/feed/post.dart:31`) now permanently
   defaults to `false` — `Post.fromJson` never sets it from the wire anymore (that
   was the whole point of moving to `reactions`-derived state) — and the
   `isLikedBy(String userId)` helper built to replace it
   (`types/feed/post.dart:36`) has **zero call sites** anywhere in the app. These
   two files are exactly the ones this doc's own §4.B named as "already reachable
   today from the separate Posts feature" when describing the *original* bug — they
   are still broken, just via a different mechanism now.

Fix: T62, T63, T64 (§9 Stage S).

### 11.2 Feed — search never got a UI, realtime targets a dead provider, notifications still miss 2+ real types

**Search (T41).** `feedSearchProvider` (`api/client/posts/query.dart:126-130`) is
correctly built — a `FutureProvider.family<List<Post>, String>` that forwards
`search: query` into `FeedListServer.call()`. It has zero callers. Confirmed by
grepping every file under `views/feed/` for `search`/`Search`: no matches.
`feed_base_view.dart`'s header row (lines 76-114) has the feed label, the Share
button, and an optional page-info button — no `TextField`. There is no search box
anywhere in the running app despite the commit message's "Wired search" claim.

**Realtime (T44).** `client.watch('feed')` is correctly registered
(`hooks/use_realtime.dart:39`). The actual event handler,
`lib/realtime/realtime_provider.dart`'s `handleRenewFrame` (lines 61-93), has:
```
case 'Feed':
  if (subtype == 'New') {
    ref.invalidate(feedProvider);
  } else if (subtype == 'Post') {
    ref.invalidate(feedProvider);
    ...
```
`feedProvider` (`api/client/posts/query.dart:121-124`) is a separate, simple
`FutureProvider<List<Post>>` that nothing in the live UI reads anymore —
`feed_base_view.dart` reads `paginatedFeedProvider` exclusively (it has since T42's
pagination rework, which predates this same commit). The realtime "new post
arrived" signal invalidates a provider with zero watchers; the visible feed does
not refresh in response to realtime events. Pull-to-refresh (I6) still works as a
fallback, so this isn't a total loss, but the additive realtime piece T44 asked for
has no observable effect.

**Notification dispatch (T46).** The real backend `NotificationType` enum
(`nest-js-boilerplate/src/@generated/prisma/notification-type.enum.ts`) is:
`MENTION | COMMENT | REACTION | FOLLOW | FRIEND_REQUEST | POST | SYSTEM | BILLING |
SECURITY`. `views/notification/free_page_view.dart:78-86` now correctly matches
`FRIEND_REQUEST` and `POST` (real fix — confirmed against the enum above) and
harmlessly still checks for a `MESSAGE`/`'message'` value that was never real to
begin with (dead but inert). It does not handle `COMMENT`, `REACTION`, `MENTION`,
or `FOLLOW` at all — tapping any of those falls through every branch and just
marks the notification read, no navigation. Web's actual
`notificationTarget()` (`next-js-boilerplate/src/lib/notifications/target.ts:7-19`)
is simpler than a full per-type switch: it checks `payload.kind` for the
friend-request cases, and otherwise falls back to "does `payload.postId` exist? If
so, go to that post" — which is presumably how comment/reaction/mention
notifications resolve on web, since those plausibly all carry a `postId`. Flutter's
version never implements that fallback, so it's narrower than web for the same
underlying data. This doc's own §10 verify checklist explicitly names testing
"post/comment/reaction/friend-request" taps — 2 of those 4 are unhandled today.

Fix: T65, T66, T67 (§9 Stage S).

### 11.3 Settings General/Account — two fields don't actually work, one error message is half-localized

**Timezone (T5).** `general/page_view.dart:96-110`'s `_GeneralSettingsState.
initState()` sets `_stagedTimezone = '';` unconditionally — there is no read of
`user.timezone`, or of any user/profile provider at all, anywhere in this file.
`userProfileProvider` (`api/client/profile/query.dart`, a `FutureProvider` wrapping
`ProfileGetServer().call()` which already fetches `timezone` over the wire) exists
and is used elsewhere (`account/page_view.dart`) but not here. Every time a user
opens General settings, Timezone shows "Select timezone" regardless of what they
previously chose.

**Date-display (T7).** `general/page_view.dart:109` seeds `_stagedDateDisplay =
'Long';` unconditionally, and `_save()` (line 125) does
`await prefs.setString('date_display', _stagedDateDisplay);` — a write with no
matching read anywhere. There is no `dateDisplayProvider`. Contrast with T6
(Currency), which built a real `StateNotifierProvider` in `hooks/use_currency.dart`
that both loads on construction (`_load()`, lines 15-21) and saves on `setCurrency`
(lines 23-27) — a legitimate, correct implementation of "mirror
`themeModeProvider`'s pattern" that T7 was supposed to copy and didn't. There is
also a separate, pre-existing, still-unused `dateDisplayCookieProvider`
(`hooks/use_date_display_cookie.dart`, a bare `StateProvider<DateDisplayFormat>`
with no persistence of its own either) that this task didn't touch, wire up, or
remove — a 3rd disconnected piece of state for the same concept.

**Account i18n (T11/T12/T32).** All of these ARB keys already exist verbatim
(confirmed via grep of `app_en.arb`) and are unused in `account/page_view.dart`:
`settingsUsername` ("Username", used as a hardcoded literal at line 283),
`settingsFileTooLarge` ("File must be under 5 MB", hardcoded at line 158),
`settingsInvalidFileType` ("Only JPEG, PNG, WebP, and GIF images are allowed",
hardcoded at line 163), `settingsUsernameChecking`/`settingsUsernameAvailable`/
`settingsUsernameTaken` (no text label at all is shown for these states — only
bare icons), `settingsErrorsUsernameTaken`. Separately, the error-loading-profile
branch (lines 38-59) is now nicely styled (icon, color, centered layout — T32's
"styled" half is done) but still shows a hardcoded `'Error loading profile'`
string and still renders the raw `'$e'` exception text underneath it, unlocalized
and unfiltered either way.

Fix: T68, T69, T70 (§9 Stage S).

### 11.4 Settings Privacy — the right fields, the wrong (unreused) building block

T14's core ask — replace the 3 invented toggles with web's real 3
(hide-profile-picture / nickname+conditional field / 2FA) — **is done correctly**:
`privacy/page_view.dart:73-113` has the right 3 fields with the right labels and
the right conditional nickname `TextField`, confirmed against
`next-js-boilerplate/src/views/settings/privacy/FreePageView.tsx:29-96`. What
wasn't done: the task explicitly said to reuse `privacy_toggle_row.dart` (title/
subtitle/value/onChanged/showDivider, plus a new trailing-child slot for the
nickname field) for the toggle rows. The implementation wrote its own inline
`SwitchListTile`s instead; `privacy_toggle_row.dart` is confirmed to still have
zero call sites anywhere (`grep -rn "PrivacyToggleRow("` matches only its own
definition). D5's stub-save-toast decision was correctly honored — `_save()`
(line 58) is a deliberate `showToast` stub matching web's own `console.log`
placeholder, which is fine and not a bug.

Fix: T71 (§9 Stage S).

### 11.5 Settings Billing — the largest concentration of gaps

- **Cancel-Subscription (T16)**: the casing fix itself
  (`SubscriptionInfo.fromJson`'s `.toLowerCase()`, `api/server/billing/
  subscription.dart:20-22`) is correct and confirmed — free-tier users now
  correctly render `_FreeBillingView`. The try/catch T16 also asked for was not
  added: `billing/page_view.dart`'s cancel `onPressed` (lines 120-146) still calls
  `cancelSubscription()` with no surrounding error handling, so any failure (not
  just the now-fixed free-tier case) still fails with no toast and no
  navigation.
- **Payment methods (T17)**: remove/set-default are correctly wired through new
  `removePaymentMethodServerProvider`/`setDefaultPaymentMethodServerProvider`
  calls and confirmed working. Add-card is not: both "Add Card" buttons
  (`billing/page_view.dart:320,364`) call `context.go('/v1/en/plans')` — a
  hardcoded English locale segment regardless of `lang`, and a navigation to the
  upgrade/plans flow rather than the Stripe setup-intent flow T17 named
  specifically (`BillingActions.createSetupIntent()`, confirmed to have zero call
  sites outside the pre-existing `views/checkout/page_content.dart`).
- **Invoice pagination (T20)**: `InvoicePagination` is genuinely mounted
  (`billing/page_view.dart:446-454`), but the page-count feeding it
  (line 409) is `final totalPages = (invoices.length / _perPage).ceil().clamp(1,
  1);` — `.clamp(1, 1)` forces the result to exactly `1` no matter what
  `invoices.length` is, so `onNext` (`_page < totalPages ? ... : null`) is always
  `null`. However many invoices exist, only the first 5 are ever visible and "Next"
  is permanently disabled.
- **i18n**: `billing/page_view.dart` hardcodes `'Subscription'`, `'Active'`,
  `'Billing Address'`, `'Edit'`, `'No billing address set.'`, `'Payment
  Methods'`, `'No payment methods saved.'`, `'Set default'`, `'Remove'`,
  `'Invoices'`, `'No invoices yet.'`, and several `'Failed: $e'`/`'Error: $e'`
  strings. Confirmed via grep of `app_en.arb` that `settingsPaymentMethods`,
  `settingsBillingAddressEmpty`, `settingsInvoices`, `settingsNoPaymentMethods`,
  and `settingsNoInvoices` already exist as the exact matching English text.

Fix: T72, T73, T74, T75 (§9 Stage S).

### 11.6 Settings API Keys — one field pair fetched, parsed, and then never shown

T25 (secret shown once) and T26 (expiry presets) are both correctly implemented
and confirmed working. T27 is half done: `enabled` and `expiresAt` are parsed
(`api/server/api_keys/list.dart`) and rendered as the Active/Disabled badge and
Expires/No-expiry line in `api_keys/page_content.dart`. `role` and `tier` are also
fetched by the query and parsed onto `ApiKey` (`list.dart:41-42`,
`role: json['role']`/`tier: json['tier']`) but never referenced anywhere in
`page_content.dart`'s `build()` — the data exists on the model and is simply not
displayed.

Fix: T76 (§9 Stage S).

### 11.7 Settings Index — features list points the wrong direction, price/cancel-date still don't render

**Features list (T28).** The hardcoded `['Feature 1','Feature 2','Feature 3']`
placeholder is gone, replaced with real localized per-tier keys reused from the
`/plans` pricing page — genuine progress. But `next-js-boilerplate/src/views/
settings/PageContent.tsx:40-45`'s `FEATURES` map is explicitly **one tier ahead**
as an upsell teaser (`FREE: p.featuresBasic, BASIC: p.featuresMedium, MEDIUM:
p.featuresPremium, PREMIUM: p.featuresPro`) — free users see what Basic gets,
Basic users see what Medium gets, and so on. `settings/page_view.dart:118-151`'s
`_featuresForTier()` maps each tier to **its own** features instead (`case
'basic': return [Basic0, Basic1]`, etc.) — the opposite semantics, so every tier
now shows different copy than web shows for that same tier. The free-tier
(`default`) branch compounds this by returning only `[Basic0]`, a truncated
1-item list, rather than the full 2-item Basic array the one-tier-ahead mapping
calls for.

**Price/cancel-date (T29).** Renewal date is correctly wired
(`sub.currentPeriodEnd`) and the "Manage Billing" link exists. But
`settings/page_view.dart:93` passes `price: tier == 'free' || sub.plan == 'free' ?
'Free' : null` — meaning every paid tier gets `price: null`, which is the literal
original bug ("`PlanInfoCard` never receives a price for paid tiers") and it is
unchanged: `plan_info_card.dart:61-64` only renders a price `Text` `if (price !=
null)`, so nothing shows for any paying user. Root cause: `api/server/billing/
subscription.dart`'s query already selects `priceCents`/`currency` over the wire
(`_query`, lines 38-40) but `SubscriptionInfo.fromJson` never parses either field
onto the model — there is no source of a real price string to pass, even if the
caller wanted to. Separately, `cancelAtPeriodEnd` is passed into `PlanInfoCard` as
a constructor field but the widget's `build()` (`plan_info_card.dart:25-78`) never
references `this.cancelAtPeriodEnd` at all — a dead parameter.

Fix: T77, T78 (§9 Stage S).

### 11.8 Tests — 4 of 5 new tests are real, 1 tests the wrong thing

`subscription_test.dart`, `comment_test.dart`, and `reaction_test.dart` are
legitimate, meaningful tests that directly exercise the T16/T35/T33 fixes with
real assertions. `use_currency_test.dart` correctly tests `currencyProvider`'s
default and `setCurrency` behavior (though it doesn't test the "restores a
previously-saved value on fresh init" path specifically). `date_display_test.dart`
tests something unrelated to what its name and Stage R's own description imply:
every assertion in it is against `DateDisplayConstants` (a separate, pre-existing
file of date-format strings like `'MMM d, yyyy'`,
`constants/date_display.dart`) — none of it touches the actual date-display
*preference* (the broken staged-state/`SharedPreferences` code in
`general/page_view.dart`, see §11.3) at all. This is consistent with how T7's bug
shipped behind a green test suite: the test that was supposed to cover it covers
something else with the same name.

Fix: T79 (§9 Stage S).
