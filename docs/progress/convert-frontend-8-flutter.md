# convert-frontend-8-flutter — Settings, Feed, and Share: close the gap with Next.js

**Date:** 2026-07-27 · **Verified against:** HEAD `b8afd99` · **Status:** 📋
**PLANNING ONLY — NOT STARTED.** 0/61 tasks. Researched via 4 parallel deep-comparison
passes (Settings general/account/privacy/nav, Settings billing/api-keys/sessions/index,
Feed, Share), each independently verifying file:line citations on both sides against
current HEAD. Nothing in this doc has been implemented yet — per this project's
planning convention, implementation starts only when explicitly kicked off.

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

- [ ] **T1 (M) — Wire `SettingsNav` into all 6 settings routes.** Per D2, add a
  shared `SettingsShellScaffold({lang, child})` wrapping `SettingsNav(lang: lang)` +
  the page content, and call it from each of the 6 settings page-content widgets.
  `flutter-boilerplate/lib/views/settings/settings_shell.dart:7-169` needs no content
  changes.
- [ ] **T2 (S) — Fix `SettingsNav` tab order** to match web:
  general→account→privacy→billing→api-keys→sessions
  (`settings_shell.dart:19-56` currently has account/general swapped first).

### Stage B — Settings: shared plumbing prerequisites

- [ ] **T3 (S) — Extend `ProfileActions.update()` / `ProfileUpdateServer.call()`**
  (`api/client/profile/actions.dart:14-17`, `api/server/profile/update.dart:28-47`)
  to accept `username`/`avatarUrl`/`locale`/`timezone` as additional optional params,
  matching the existing `if (x != null) data['x'] = x;` pattern already used for
  name/bio. The mutation's own selection set already requests all 4 back
  (`update.dart:8-21`) — this unblocks T5, T8, T11, T12 simultaneously. No backend
  change needed (`UpdateProfileInput` already supports all 6 fields independently).
- [ ] **T4 (S) — Parse dropped fields already on the wire**: add `username` to
  `UserProfile.fromJson` (`api/server/profile/get.dart:22-31`, already fetched in the
  query at line 43) and `sessionId` to `AuthenticatedUser.fromJson`/`toJson`
  (`types/auth/user.dart`, already fetched by `api/server/auth/me.dart:19`). Unblocks
  T12 and T22.

### Stage C — Settings: General

- [ ] **T5 (M) — Add a Timezone field** (`SettingsSelect`-shaped dropdown, seed from
  `user.timezone`), matching `next-js-boilerplate/src/views/settings/general/
  FreePageView.tsx:69-74`.
- [ ] **T6 (S/M) — Add a Currency field + new locally-persisted provider** (per D3 —
  mirror `hooks/use_theme.dart:7-8,15-36`'s `shared_preferences`-backed
  `themeModeProvider` pattern exactly; new key, default `USD`).
- [ ] **T7 (M) — Add a Date-Display field** with the 3 live-formatted previews
  (long/iso/short) and the same local-persistence pattern as T6, matching
  `FreePageView.tsx:88-104`.
- [ ] **T8 (M) — Convert to a staged Save flow.** Stage language/timezone in local
  state (seeded once from `user`), commit only on an explicit Save button via T3.
  Theme stays instant-apply (matches web). *Don't* port web's own bug forward — its
  `saveSettings` always sends a literal `name: ""`; omit the `name` key entirely when
  only these fields change, matching the backend DTO's `@IsOptional()` contract.
- [ ] **T9 (S) — Swap the binary theme `SwitchListTile` for the already-built
  `ThemePicker`** (`components/settings/theme_picker.dart:8-51`, a `SegmentedButton`
  already covering all 4 of Flutter's own `AppThemeMode` values) — currently only
  reachable from the dead general tier-view files.

### Stage D — Settings: Account

- [ ] **T10 (S) — Fix the avatar-upload response-key bug**:
  `api/server/profile/upload_avatar.dart:19` reads `response.data['url']`; the real
  backend response nests it under `response.data['urls']['full']` (matching web's own
  `uploadRes.urls.full` usage). This throws a cast exception on first real use today.
- [ ] **T11 (M) — Build avatar-upload UI** (file/image picker → T10's fixed call),
  matching `AccountAvatarSection.tsx:16-53`. No existing Flutter call-site pattern to
  copy — `image_picker`/`file_picker` are in `pubspec.yaml` but unused anywhere in the
  app; this is genuinely new integration work. Client-side validate 5MB / MIME
  allow-list first, using the already-present `settingsInvalidFileType`/
  `settingsFileTooLarge` ARB keys (match web's 5MB client limit for UX consistency,
  even though the backend itself allows 10MB).
- [ ] **T12 (M) — Add a Username field** with a 300ms-debounced availability check
  (wire the already-correct, already-unused `checkUsername()`/`isUsernameAvailable`
  query), 3 visual states (checking/available/taken), matching
  `AccountFormFields.tsx:35-56`. All ARB copy already exists unused
  (`settingsUsername`, `...Checking/Available/Taken`, `settingsErrorsUsernameTaken`).
- [ ] **T13 (S) — Remove the invented email-edit field and delete-account button**
  (`account_form_fields.dart`, `profile_actions.dart` — both dead, no web
  counterpart) — see D4 before doing this.

### Stage E — Settings: Privacy

- [ ] **T14 (L) — Replace the 3 invented toggles with web's real 3**: hide-profile-
  picture, use-nickname (+ conditional nickname `TextField` shown when enabled),
  enable-2FA — matching `next-js-boilerplate/src/views/settings/privacy/
  FreePageView.tsx:29-96`. Reuse the dead `privacy_toggle_row.dart` (title/subtitle/
  value/onChanged/showDivider — solid shape) for the toggle rows themselves; add an
  optional trailing-child slot to it for the nickname sub-field. All ARB copy already
  exists unused.
- [ ] **T15 (S) — Add a Save button + toast + "manage sessions" note/link to
  `/settings/sessions`** — see D5 for why this ships even though the backend field
  doesn't exist yet.

### Stage F — Settings: Billing

- [ ] **T16 (S) — Fix the tier-casing bug**: add `.toLowerCase()` in
  `SubscriptionInfo.fromJson` (`api/server/billing/subscription.dart:18-27`),
  matching the fix pattern already used correctly for the same value elsewhere
  (`types/auth/user.dart:27`). Also wrap the Cancel-Subscription call
  (`page_view.dart:133-136`) in try/catch + toast, matching the sibling sessions/
  api-keys action handlers — today a free user's rejected cancel attempt fails
  silently.
- [ ] **T17 (M) — Wire payment-method remove/set-default**, and **add-card** via the
  already-working Stripe setup-intent plumbing (`BillingActions.createSetupIntent()`,
  `lib/stripe_provider.dart`, `views/checkout/stripe_elements.dart` — all already used
  by checkout, zero call sites for billing). The dead `payment_methods.dart` widget
  already has the right `onRemove`/`onSetDefault` callback slots built — mount it and
  implement the two new one-mutation server calls following
  `api/server/billing/cancel.dart`'s exact pattern.
- [ ] **T18 (M) — Build a billing-address view/edit panel.** The query+mutation
  already work end-to-end and are unused (`api/client/billing/address.dart`,
  `api/server/billing/address.dart`) — mount the dead `billing_info_display.dart` for
  the read view; write a new `billing_address_form.dart` (no dead template to
  resurrect — none exists) for the 7-field edit form, matching
  `BillingAddressForm.tsx`.
- [ ] **T19 (S) — Fix the invoice-row tap no-op** (`page_view.dart:262`) — launch
  `inv.pdfUrl` via `url_launcher` instead of an empty closure.
- [ ] **T20 (S) — Wire the existing dead `invoice_pagination.dart`** (prev/next +
  page counter) at 5-per-page, matching web's `InvoicePagination.tsx`.
- [ ] **T21 (S, optional) — Parse `type`/`reference`** into the `Invoice` model if
  invoice-number display (matching `extractInvoiceNumber`) is wanted — both fields
  are already fetched and silently dropped.

### Stage G — Settings: Sessions

- [ ] **T22 (S) — Fix "current device" detection**: compare each session's id against
  T4's new `AuthenticatedUser.sessionId` (client-side, matching web's own
  `session.sessionId === currentSessionId` approach) instead of trusting a nonexistent
  `isCurrent` wire field.
- [ ] **T23 (S) — Wire the existing dead `empty_sessions.dart`** into the
  `sessions.isEmpty` branch (currently missing — an empty list just renders a blank
  scroll area).
- [ ] **T24 (M) — Derive a friendly device label + type icon from `userAgent`**
  (already fetched, currently dropped in `Session.fromJson`) instead of showing the
  raw `deviceId` as the card's primary title, matching `SessionCard.tsx:36-43`. Tuck
  the raw device id into a secondary/collapsed detail spot instead.

### Stage H — Settings: API Keys

- [ ] **T25 (S) — Show the created secret once.** `page_content.dart:174` already
  receives `result['fullKey']` and discards it — capture it and render a dismissible
  reveal panel with a copy button before invalidating the list. UI-only fix; the data
  is already there.
- [ ] **T26 (M) — Add expiry-preset chips to the creation dialog** (No expiry/7/30/
  90/365 days, matching `CreateApiKeyForm.tsx:27-33`) and pass `expiresInDays` through
  `ApiKeyActions.create()` — the mutation already supports the parameter, it's just
  never sent.
- [ ] **T27 (S) — Parse + render `enabled`/`expiresAt`/`role`/`tier`** (already
  fetched, currently dropped in `ApiKey.fromJson`) as an Active/Disabled badge + an
  "Expires {date}" / "No expiry" line, matching `ApiKeyList.tsx:54-61,77-83`.

### Stage I — Settings: Index / plan cards

- [ ] **T28 (M) — Replace the hardcoded `_featuresForTier()` placeholder**
  (`page_view.dart:91-97`, currently returns `['Feature 1','Feature 2','Feature 3']`
  regardless of tier) with a real per-tier localized feature list, matching
  `PageContent.tsx:40-45`'s one-tier-ahead `FEATURES` map — check the `/plans`
  pricing page for reusable keys first.
- [ ] **T29 (M) — Fetch the real subscription** (reuse `subscriptionProvider`,
  already used by the billing page) to populate `PlanInfoCard`'s price/renewal/
  cancel-date props for paid tiers, and add a "Manage Billing" link into
  `plan_info_card.dart`.
- [ ] **T30 (S) — Delete the permanently-disabled Cancel-Subscription button** on
  this page (`upgrade_actions.dart`'s button has no `onCancel` wired) — see D7.

### Stage J — Settings: polish

- [ ] **T31 (M) — Wire loading skeletons** into all 5 async loading branches
  (general/account/billing/sessions/api-keys/index currently show a bare
  `CircularProgressIndicator`). Use the existing, correctly-shaped dead
  `fallbacks/app/v1/settings_loading_fallback.dart` (not
  `views/fallbacks/app/settings_loading_fallback.dart` — that one's a shimmer
  card-list shape that doesn't match any settings form here, likely a stray
  duplicate — see T59).
- [ ] **T32 (S) — Replace the raw error text** (`account/page_view.dart:31`, `Text('Error: $e')`
  — unlocalized, shows the raw exception) with a styled, localized message.

### Stage K — Feed: critical data-layer fixes (app-wide impact — prioritize independently)

- [ ] **T33 (M) — Add `reactions { id type userId }` and `_count { comments
  reactions }`** to both the feed-list query (`api/server/posts/list.dart:10-27`) and
  the single-post query (`api/server/posts/single.dart:10-27`). Extend `Post`/
  `Post.fromJson` to carry `reactions` and derive `likeCount`/`commentCount` from
  `_count`; derive `isLiked` client-side (`reactions.any((r) => r.userId ==
  currentUserId)`) instead of trusting the nonexistent flat fields it reads today.
- [ ] **T34 (S) — Fix the reaction-toggle mutation.** Add a `String type` param to
  `toggle()`/`toggleForComment()` (`api/server/posts/reactions.dart`), send the real
  uppercase value instead of the hardcoded invalid `'like'`, and update all 3
  existing call sites (2 in the Posts feature, plus wherever T39 adds a 3rd). This is
  already broken today, independent of Feed.
- [ ] **T35 (S) — Fix the comment field-name mismatch.** Rename `content` → `body` in
  all three GraphQL documents' selection sets and mutation variables in
  `api/server/posts/comments.dart` (list/create/update — `deleteComment` is already
  fine). Also already broken today, independent of Feed.
- [ ] **T36 (S) — Add `author.id` and `coverImage`** to `Post` + its query selection
  (bundle with T33). Unblocks T40.

### Stage L — Feed: tier + component wiring

- [ ] **T37 (S) — Fix Basic tier**: change `basic_page_view.dart`'s `BasicFeedPage` to
  render `FreeFeedPage(lang: lang)` (or stop overriding `basicWidget:` in
  `page_view.dart` and rely on `TierGate`'s existing `basicWidget ?? freeWidget`
  fallback) instead of the unrelated locked-feature stub.
- [ ] **T38 (L, decision-gated — see D8) — Rebuild the live feed card** to compose
  `PostHeader`+`PostContent`+`PostActions` in place of the standalone `PostCard`,
  restoring inline comment expansion (wire the currently-missing `comments:` argument
  into `CommentSection` too — `post_actions.dart:68-76` never passes it), the
  multi-reaction picker, and own-post edit/delete. Thread `onCreateComment`/
  `onUpdateComment`/`onDeleteComment`/`onToggleReaction` down from the page views.
- [ ] **T39 (S) — Wire `onLike` to a real `toggleReaction` call** (depends on T34) in
  all 3 tier page views — currently a no-op or a cache-read in every tier.
- [ ] **T40 (S) — Add Premium's own-post crown badge** (depends on T36): watch
  `currentUserProvider` in `_PremiumPostCard` and overlay a crown icon when
  `post.authorId == currentUser.id`, matching `PremiumFeedList.tsx:118-123`.

### Stage M — Feed: search, pagination, realtime, empty state

- [ ] **T41 (M) — Wire the search field**: add a `controller`/`onChanged` to
  `feed_base_view.dart`'s `TextField`, thread the value into a search-keyed
  `feedProvider` family, pass it to `FeedListServer.call(search: ...)` (already
  accepts it, unused).
- [ ] **T42 (L) — Add cursor-based pagination / infinite scroll**, mirroring
  `feed-list-actions.ts`'s `handleLoadMore`/`refreshFeedList` (`PAGE_SIZE = 5`): a
  `ScrollController` + near-bottom threshold (or an explicit "Load more" affordance),
  cursor/`hasMore` state per tier page view.
- [ ] **T43 (S) — Wire the existing dead `FeedListEmptyState`** (with its
  "Be the first to share" → `/share` CTA) into `feed_base_view.dart`'s empty branch,
  replacing the generic `EmptyWidget`.
- [ ] **T44 (M) — Watch the `feed` realtime topic** and `ref.invalidate(feedProvider)`
  on a matching event, mirroring how `realtime_provider.dart:90` already invalidates
  `postCommentsProvider` for a related event. Additive on top of pull-to-refresh
  (I6), not a replacement.

### Stage N — Feed: notifications

- [ ] **T45 (S) — Add `payload` and `actor { avatarUrl }`** to the `myNotifications`
  selection (`api/server/notifications/list.dart:10-21`) and `NotificationItem`
  model — currently missing entirely, so even a fixed dispatch (T46) would have
  nothing to route on.
- [ ] **T46 (M) — Fix notification tap-to-navigate.** Replace the always-false
  `item.type == 'message'|'friend_request'|'post'` dispatch
  (`views/notification/free_page_view.dart:56-62`) with a `payload`/`kind`-based
  dispatch mirroring web's `notificationTarget()` (`lib/notifications/target.ts:
  7-19`) — depends on T45.
- [ ] **T47 (S) — Add `markAllRead` to `NotificationActions`** (server call already
  exists at `api/server/notifications/read.dart:36`, just not exposed on the client)
  and wire a "Mark all read" button, matching `NotificationList.tsx:41-50`.

### Stage O — Feed: polish

- [ ] **T48 (S/M) — Port the real `feedPageInfo` content** (title/description/4
  sections/2 tips, `next-js-boilerplate/src/constants/page-info/feed.ts`) into the
  page-info dialog, replacing the current one-sentence `AlertDialog` placeholder.
  Coordinate with T53 (Share) on whether to route this through the shared, currently-
  unused `PageInfoButton` component instead of a hand-rolled dialog.
- [ ] **T49 (S) — Wire a layout-matching loading skeleton** in place of the bare
  spinner in `feed_base_view.dart`'s loading branch.
- [ ] **T50 (S) — Remove the dead, permanently-disabled bookmark icon**
  (`post_card.dart:144-154`, `onPressed: null` unconditionally) — no web counterpart
  exists to build toward; either delete it or flag it as a genuine future feature.

### Stage P — Share: full build

- [ ] **T51 (L) — Build the real composer UI**: title `Input` (required, 3-200 chars)
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
- [ ] **T52 (M) — Rebuild `ImagePreviewSection`** (delete-and-rewrite the dead,
  wrong-shaped `image_preview_section.dart`, don't extend it) with the real state
  machine: nothing shown if no file picked; dimmed preview + spinner while uploading;
  a remove-X button (hidden while uploading); an error banner with Remove/Retry
  actions on upload failure.
- [ ] **T53 (S) — Add page-info content and wire the existing, currently-unused
  `PageInfoButton`** — its first real caller anywhere in the app. New
  `constants/page_info/share.dart` (no such directory exists yet), copying web's
  `sharePageInfo` text as literal hardcoded English (not i18n'd on web either — match
  that, don't unilaterally translate it).
- [ ] **T54 (S) — Add client-side upload pre-validation** (5MB / jpeg-png-webp-gif)
  matching web's stricter BFF-level gate — Flutter calls the backend directly (10MB /
  +avif), so without this it'd be more permissive than web, a UX-consistency gap
  rather than a correctness bug.

### Stage Q — Cross-cutting cleanup (dead-code disposition)

- [ ] **T55 (S) — Relocate the orphaned Share scaffolding** (`share_actions.dart`,
  `types/share/{share_content,share_platform}.dart`) out of the `share/` namespace —
  see D9. Do this after T51-T52 land, so `/share`'s real files are the only thing
  left in that directory.
- [ ] **T56 (S) — Delete the 11 non-resurrectable dead billing/sessions files** (4
  tier-views + 7 sub-components for billing minus the ones reused in T17/T18/T20; 4
  tier-views + 3 sub-components for sessions minus `empty_sessions.dart` reused in
  T23) — see D1.
- [ ] **T57 (S) — Delete the 12 dead general/account/privacy tier-view files** once
  Stages C-E have mined the reusable pieces (`theme_picker.dart`,
  `privacy_toggle_row.dart`) out of them — see D1.
- [ ] **T58 (S, decision-gated by D8/T38)** — If T38 rebuilds the live card: promote
  `post_content.dart`/`post_actions.dart`/`comment_section.dart` from dead to live (no
  deletion). If instead the navigate-to-detail pattern is kept deliberately: delete
  those 3 files formally rather than leaving them as a false trail.
- [ ] **T59 (S) — Delete confirmed zero-call-site stragglers found along the way**:
  the duplicate `api/server/auth/me_raw.dart`, the wrong-shaped
  `views/fallbacks/app/settings_loading_fallback.dart` (keep the other one, used by
  T31), `components/settings/{settings_search_bar,settings_section,settings_card,
  settings_row}.dart` (zero call sites app-wide, not just in this doc's 3 areas),
  `lib/feed/{feed_constants,feed_utils}.dart`, `types/feed/author.dart`.

### Stage R — Tests + live verify

- [ ] **T60 (M) — Unit/widget tests per stage**, matching this project's established
  bar of real regression tests (not just gates): at minimum, `SubscriptionInfo.
  fromJson`'s casing fix (T16), the reaction-type fix (T34), the comment field-name
  fix (T35), and the currency/date-display persistence providers (T6/T7).
- [ ] **T61 (M) — Live device verify loop** — see §10.

---

## 10. Verify loop (definition of done)

Per this project's established lesson (re-confirmed repeatedly in
`convert-frontend-6`/`7`): `flutter analyze` / `dart format --set-exit-if-changed` /
`flutter test` passing is necessary but has **not** historically been sufficient for
this kind of data-wiring/UI work — treat the items below as required, not optional,
before marking any stage's checkboxes complete.

- [ ] **Gates**: `flutter analyze`, `dart format --set-exit-if-changed`, `flutter
  test` all clean, zero new failures beyond the pre-existing `card_test.dart` flake.
- [ ] **Stage K, curl-verified against the real backend** (matching this project's
  "exact query text, not a same-operation-name shorthand" bar): confirm a reaction
  toggle with the real uppercase type succeeds; confirm a comment create/list with
  `body` succeeds; confirm the feed-list query now returns non-zero
  `reactions`/`_count` for a post with real reactions/comments.
- [ ] **Settings, live tap-through**: navigate all 6 tabs via the new `SettingsNav`
  (T1); change + save General's language/timezone/currency/date-display, kill and
  restart the app, confirm all 4 persisted; upload a real avatar image and confirm it
  renders; check a username for availability; toggle + save Privacy's 3 real toggles;
  confirm a genuine free-tier test account renders `_FreeBillingView` (T16); create
  an API key and confirm the secret is actually shown once; confirm the active
  session shows the "current" badge and no Revoke button.
- [ ] **Feed, live tap-through**: confirm Basic tier now shows real posts (T37); like
  a post and confirm the count updates and persists across a refresh; expand comments
  inline and post one; edit and delete your own post from the feed; type in the
  search box and confirm results filter; scroll to the bottom and confirm more posts
  load; tap a notification of each type (post/comment/reaction/friend-request) and
  confirm it navigates correctly; tap "Mark all read."
- [ ] **Share, live end-to-end**: create a post with title+content+image from a real
  device; confirm it appears in Feed with the correct author/avatar; force an upload
  failure (e.g. airplane mode mid-upload) and confirm the Retry path works and the
  post is *not* silently created without its image.
- [ ] **On-device rebuild+reinstall**, not hot-reload — per this doc's own recurring
  reminder from `convert-frontend-7`, a build compiled before these fixes will
  reproduce the old symptoms even after the code is fixed.
