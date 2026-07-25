# convert-frontend-5-flutter — APK UI overlap, RBAC, and design-fidelity audit

**Date:** 2026-07-25 · **Verified against:** `3022fde` (HEAD of main) ·
**Predecessor:** [convert-frontend-4-flutter.md](convert-frontend-4-flutter.md)
(web-parity plan + OAuth login, landed `dd4cb74`; this doc starts from the
first real on-device APK run of that work — the OAuth flow itself was fixed
separately, same session, see the register in project memory, not tracked
in this doc)

> **Rev 1 — 2026-07-25.** Berkay signed in via Google OAuth on a real Android
> build (Pixel 7 API 37 emulator, `flutter-boilerplate`) for the first time and
> hit a broken layout: the hamburger menu was unreachable and the Plans page
> showed a duplicate title bar with pricing cards cut off mid-card with no
> scroll cue. Root-caused and fixed same session (§4). Berkay then asked for a
> systematic sweep of the rest of the app for the same classes of bug — **APK
> build only**, not the Chrome web preview, which has no status bar, no
> gesture-nav bar, and a different keyboard-overlay model, so bugs in this doc
> may not reproduce there at all.
>
> **This is a planning register only — no code was changed for the findings
> below** (§4's two fixes were already applied before this doc was written;
> everything in §6 onward is unimplemented).
>
> **Headline finding: the header/Plans bug was not an isolated incident — it's
> the dominant pattern in this app.** 109 of the 118 page widgets rendered
> inside the shared `V1Shell` chrome build their own `Scaffold(appBar:
> AppBar(...))`, nested inside `V1Shell`'s own `Scaffold`. Every one of those
> reproduces the exact "duplicate title bar + redundant status-bar gap" defect
> already fixed on the Plans page. Beyond that systemic issue, the sweep found
> one confirmed hard runtime crash (a `Positioned` widget with no `Stack`
> ancestor in the chat room's scroll-to-bottom button — throws the moment a
> user scrolls up in any chat), one page that's permanently unusable on phone
> widths (chat room sidebar, fixed at 220px with no responsive collapse), and
> a handful of smaller items. Keyboard-avoidance and bottom-navigation/FAB
> placement are otherwise clean across the app.
>
> **Rev 2 — 2026-07-25 (same day).** Berkay reported 4 more issues from his
> own on-device testing pass, broader than pure layout/overlap: a sidebar-nav
> UX gap, and — far more severe — a confirmed **RBAC/tier-gating defect that
> silently breaks premium access for every non-free-tier user in the app, on
> every login.** Added as Part II (§13-16), with its own phase plan (§17) and
> verification addendum (§18). Same rule as Rev 1: **planning only, nothing
> in Part II has been implemented.**
>
> **If you only fix one thing from this entire document, fix §14 (Finding
> G) first** — worse than any single-page rendering bug, it means paying
> customers are not receiving the product they're paying for, silently, on
> every session, and it also disables the Admin nav section for actual
> admins (§14.1) via a related structural gap in the same code path.

---

## Table of contents

1. [How to use this doc](#1-how-to-use-this-doc)
2. [Executive summary — priority board](#2-executive-summary--priority-board)
3. [Scope & methodology](#3-scope--methodology)
4. [Already fixed this session (context)](#4-already-fixed-this-session-context)
5. [Finding A — Nested-Scaffold chrome duplication (systemic, 109 files)](#5-finding-a--nested-scaffold-chrome-duplication-systemic-109-files)
6. [Finding B — V1Sidebar has no bottom-inset protection](#6-finding-b--v1sidebar-has-no-bottom-inset-protection)
7. [Finding C — Chat room scroll-to-bottom button crashes](#7-finding-c--chat-room-scroll-to-bottom-button-crashes)
8. [Finding D — Chat room sidebar is permanently cramped on phones](#8-finding-d--chat-room-sidebar-is-permanently-cramped-on-phones)
9. [Finding E — Minor / low-severity items](#9-finding-e--minor--low-severity-items)
10. [Fix plan — phases](#10-fix-plan--phases)
11. [Appendix — full Finding A file inventory](#11-appendix--full-finding-a-file-inventory)
12. [Post-fix verification checklist](#12-post-fix-verification-checklist)

**Part II — added Rev 2, 2026-07-25, from Berkay's on-device testing:**

13. [Finding F — Sidebar doesn't auto-close on navigation](#13-finding-f--sidebar-doesnt-auto-close-on-navigation)
14. [Finding G — Tier-casing mismatch breaks RBAC for every non-free user (CRITICAL)](#14-finding-g--tier-casing-mismatch-breaks-rbac-for-every-non-free-user-critical)
15. [Finding H — UI component library: missing font/theme wiring + per-component gaps](#15-finding-h--ui-component-library-missing-fonttheme-wiring--per-component-gaps)
16. [Finding I — Forms pages: dead composition files, minimal design-system usage](#16-finding-i--forms-pages-dead-composition-files-minimal-design-system-usage)
17. [Fix plan — Phases 7-10 (Part II)](#17-fix-plan--phases-7-10-part-ii)
18. [Post-fix verification addendum (Part II)](#18-post-fix-verification-addendum-part-ii)

---

## 1. How to use this doc

Work the phases in §10 in order — each is scoped to be a self-contained
session. §11 is the reference checklist for Phase 3/4 (the mechanical bulk of
the work); don't re-derive the file list, use it directly. Every finding below
cites `file:line` where a specific instance was read and confirmed directly
(either by me or by an agent whose claim I independently re-verified by
reading the file myself) — flagged inline where verification depth differs.

## 2. Executive summary — priority board

| # | Finding | Severity | Scope | User-facing symptom |
|---|---|---|---|---|
| A | Nested `Scaffold`+`AppBar` inside `V1Shell` | **High** (systemic) | 109 files | Duplicate title bar; empty gap above it; on `ui/drawer` demo, a second redundant hamburger icon |
| B | `V1Sidebar` bottom content has no `SafeArea` | **High** (used on every `/v1/*` page) | 1 file | Sign-out button / sign-in CTA at the bottom of the nav drawer can render under Android's gesture-nav bar, unreliable to tap |
| C | Chat room scroll-to-bottom FAB: `Positioned` with no `Stack` ancestor | **Critical** (hard crash) | 1 file | App throws a `TypeError` the instant a user scrolls up in any chat room |
| D | Chat room sidebar fixed at 220px, no responsive collapse | **Medium-high** | 1 file | Chat is cramped/unusable on any phone width — not a crash, but a broken core flow |
| E | OTP demo overflow; dead-code billing form | **Low** | 2 files | Demo-only overflow; unreachable dead code (not a live bug) |
| F | Sidebar nav items never close the mobile drawer | **Medium** | 1 file | Every tap on a nav link leaves the sidebar open, covering the destination page until manually dismissed |
| G | `SubscriptionTier` casing mismatch (backend UPPERCASE vs. Flutter lowercase) | **Critical** — highest in this doc | 3-4 files, all sessions | Every non-free-tier user sees "upgrade to premium" instead of their actual content, on every login — includes Berkay's report. Related: Admin nav section unreachable for real admins too (§14.1) |
| H | UI component library missing font/theme wiring; Card/Checkbox/Select/AlertDialog are unstyled Material defaults | **High** (systemic, app-wide look) | 2 systemic + 4+ components | Whole app renders in stock Android Roboto instead of the brand (Geist) font; several core components look like generic Material, not the branded design system |
| I | Forms pages hand-roll hardcoded-English content; fully-built sibling section files exist but are never imported | **High** (feature-scoped) | 4+ form pages, ~15+ dead files | Forms show a fraction of the web version's fields/sections, in English regardless of locale, with plain unstyled headings |

Already fixed this session, listed for context only: the `V1Header` missing
top-inset (was hiding the hamburger menu under the status bar on every page)
and the Plans page's own instance of Finding A plus a fixed-width pricing
carousel with no scroll affordance. See §4.

## 3. Scope & methodology

**In scope:** anything that only manifests (or manifests differently/worse)
on a real or emulated Android APK build — status-bar insets, the Android 15+
edge-to-edge gesture-nav bar, on-screen-keyboard overlay, and real phone
screen widths (~360-430dp). Confirmed via `android/app/build.gradle.kts`
(`compileSdk`/`targetSdk` = `flutter.*SdkVersion`, i.e. whatever this Flutter
SDK ships as its default — Android 15+ territory) and
`android/app/src/main/kotlin/.../MainActivity.kt`, which is a bare
`FlutterFragmentActivity()` with **no** custom inset/window handling — this
app relies entirely on Dart-level `SafeArea`/`MediaQuery` usage to avoid
system-UI overlap. There is no native-side safety net.

**Out of scope:** anything that also reproduces identically on `flutter run -d
chrome` (visual/theming issues, i18n, business logic) — those belong to a
different audit. Not re-litigated: the OAuth `redirect_uri` fix and the
`oauth_link_handler.dart` deep-link parsing fix from earlier this session
(unrelated bug class, already closed).

**Method:** `lib/app/router.dart` was read in full to get the authoritative,
current list of every route inside the single `/v1/:lang/*` `ShellRoute` (118
builder widgets) — the only shell in the app besides `DashboardShell`
(`/dashboard`, standalone route, confirmed clean — uses a real `AppBar`, not
a custom one). Two parallel research passes then swept: (1) every one of
those 118 files for nested-`Scaffold`/root-`Stack` issues, and (2) the whole
830-file `lib/` tree by pattern (bottom-inset collisions, fixed-width
overflow risk, keyboard-avoidance gaps, other hand-rolled top bars). The
highest-stakes claims (the chat-room crash, the chat sidebar being
permanently un-collapsed, one nested-Scaffold instance, the dead-code claim)
were independently re-verified by directly reading the cited files myself —
noted per finding below.

## 4. Already fixed this session (context)

Both landed in `flutter-boilerplate` before this doc was written; included so
the rest of the doc reads as "what's left," not "what's wrong."

- **`lib/views/v1/v1_header.dart`** — the shared top bar (used as `V1Shell`'s
  `Scaffold.appBar`) was a bare `Container(height: 56, ...)` with no top-inset
  handling, so on a real device it rendered underneath the transparent status
  bar — including its hamburger menu button, which was effectively unreachable.
  Fixed by wrapping in `SafeArea(bottom: false, child: ...)`.
- **`lib/views/plans/page_content.dart`** — nested its own
  `Scaffold(appBar: AppBar(title: Text(t.plansTitle)))` inside `V1Shell`
  (Finding A, one instance) *and* laid out pricing cards as fixed-`220px`
  `Container`s in a horizontal-scroll `Row` with no scroll affordance, hiding
  all but ~1.5 cards on a phone with no hint to swipe. Fixed by removing the
  inner `Scaffold` and switching to a `LayoutBuilder`-driven vertical stack
  below `constraints.maxWidth < 768` (the breakpoint already used by
  `v1_shell.dart`/`v1_sidebar.dart`), keeping the horizontal-scroll `Row` only
  above that width.

## 5. Finding A — Nested-Scaffold chrome duplication (systemic, 109 files)

**Mechanism (established in §4, applies identically here):** `V1Shell`
(`lib/views/v1/v1_shell.dart:34-71`) already renders one `Scaffold(appBar:
V1Header(...), body: ...)` around every `/v1/*` page. `V1Shell`'s body wraps
the routed page in `SafeArea(top: false, child: widget.child)` — `top: false`
means it neither adds *nor consumes* the top `MediaQuery` padding for
descendants. So when a page's own `build()` returns a second
`Scaffold(appBar: AppBar(title: ...))`, two things happen every time: (1) a
second, redundant title-bar row renders directly below `V1Header`'s row, and
(2) the real `AppBar` widget always re-applies `MediaQuery.paddingOf(context)
.top` for the status bar — which was never consumed by the outer shell — so
there's also a visible empty gap above that second title, sized to the status
bar height.

**Confirmed scope:** 118 files back a route inside the `/v1/:lang/*`
`ShellRoute`. Only **9 are clean** (use this list as the reference pattern —
they return bare content, no `Scaffold`):

```
lib/views/v1/home/page_content.dart
lib/views/v1/missing_page.dart
lib/views/feed/page_view.dart
lib/views/messages/page_view.dart
lib/views/notification/page_view.dart
lib/views/premium/page_view.dart
lib/views/chat_room/page_view.dart
lib/views/find_friends/page_view.dart
lib/views/plans/page_content.dart          (fixed this session, §4)
```

The other **109** all nest a nested `Scaffold(appBar: AppBar(...))` at the
top of `build()`. Full list in §11. No file anywhere in this set sets
`bottomNavigationBar:` or `floatingActionButton:` on the inner `Scaffold`
(checked explicitly, zero hits) — so there's no FAB/bottom-nav compounding
factor to worry about. Exactly one file sets `drawer:` —
`lib/views/ui/drawer/page_content.dart:16` — a legitimate Drawer-component
*demo*, but nested inside `V1Shell` it produces a second, redundant hamburger
icon next to `V1Header`'s own. Needs individual attention, not the mechanical
bulk fix (see §10 Phase 4).

**Verified directly (not just agent-reported) — `lib/views/settings/page_view.dart:23-30`:**

```dart
return Scaffold(
  appBar: AppBar(
    title: Text(t.settingsSettingsSectionLabel),
    leading: IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () => context.go('/v1/$lang/feed'),
    ),
  ),
  body: ListView(...),
);
```

This one also carries a back-arrow to `/v1/$lang/feed` — no other page in the
109 has this. It's a genuine navigation shortcut, not just redundant title
text, so it needs a product decision, not a blind strip (flagged in §10
Phase 2).

**The mechanical fix**, used for Plans in §4 and applicable to the bulk of
these 109 files:

```dart
// Before
return Scaffold(
  appBar: AppBar(title: Text(t.someTitle)),
  body: ListView(...),   // or Column, Center, etc.
);

// After — V1Shell already supplies the Scaffold + V1Header
return ListView(...);
```

For files where the inner `AppBar` carries something beyond a redundant
title — a page-specific action icon, a back-arrow, tabs — that chrome needs
to be *relocated* into the returned content (e.g. an inline header `Row` at
the top), not silently dropped. Per-group notes on which files need this are
in §10.

**Worked example — relocating an `actions:` icon (e.g. posts' "add post"
button).** Don't just delete the `AppBar`'s `actions:` entry; move it into an
inline `Row` at the top of the returned content so the action stays
reachable:

```dart
// Before
return Scaffold(
  appBar: AppBar(
    title: Text(t.postsTitle),
    actions: [
      IconButton(icon: const Icon(Icons.add), onPressed: _createPost),
    ],
  ),
  body: PostsList(...),
);

// After
return Column(
  children: [
    Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          Text(
            t.postsTitle,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const Spacer(),
          IconButton(icon: const Icon(Icons.add), onPressed: _createPost),
        ],
      ),
    ),
    Expanded(child: PostsList(...)),
  ],
);
```

Two things to get right here: (1) wrap the list/body in `Expanded` once it's
no longer inside a `Scaffold.body` (which sizes its child implicitly) — a
bare `Column` gives unbounded height to non-`Expanded` children, and a
scrollable list needs a bounded height to lay out correctly; (2) this
inline-header pattern is exactly what §15.1/§15.2's typography-token work
(once landed) should drive the heading's `TextStyle` from, rather than a
one-off inline `TextStyle` — but don't block this phase on that one, ship
with a plain `TextStyle` now and swap it later if it lands first.

**How to verify each file individually before touching it (don't skip
this even though the pattern looks mechanical):** for every file in §11,
read its `build()` method fully first and check for anything beyond a bare
`appBar: AppBar(title: Text(...))` — an `actions:` list, a custom `leading:`,
a `bottom:` (`TabBar`), or a `Scaffold`-level `floatingActionButton`/`drawer`
that Finding A's own sweep (§5, "confirmed scope") already checked is absent
everywhere except `ui/drawer` — but re-confirm per file rather than trusting
that blanket claim blindly, since it was a repo-wide grep, not a per-file
read of all 109.

## 6. Finding B — V1Sidebar has no bottom-inset protection

**Verified directly** (already read in full earlier this session).
`lib/views/v1/v1_shell.dart:40-54`: on mobile, the body is a `Stack` with
`SafeArea(top: false, child: widget.child)` as one child and `V1Sidebar(...)`
as a **sibling**, not a descendant — so the sidebar gets zero inset handling
from that `SafeArea` either way. `lib/views/v1/v1_sidebar.dart` (whole file,
confirmed by direct read): no `SafeArea` anywhere. On mobile the sidebar
renders via `AnimatedPositioned(top: 0, bottom: 0, width: width, ...)`
(`v1_sidebar.dart:111-119`), stretching the full screen height, and its
bottom-most content — the `ProfileSection`/sign-out row, or the sign-in CTA
for logged-out users (`v1_sidebar.dart:63-98`) — has nothing protecting it
from Android's bottom gesture-nav bar. This is the primary navigation drawer,
opened from every single `/v1/*` page (once Finding from §4 makes the menu
button reachable at all) — high real-world impact.

**Fix:** wrap `sidebarContent` (the `Container` built at
`v1_sidebar.dart:32-101`) in `SafeArea(top: false, child: ...)` — symmetric
with the `V1Header` fix in §4, and safe to add unconditionally since the
sidebar already starts below the header by construction (no double-padding
risk on top).

## 7. Finding C — Chat room scroll-to-bottom button crashes

**Verified directly** by reading `lib/views/chat_room/chat_room_main_content.dart:90-131`.
The widget tree is:

```dart
return Container(
  ...
  child: Column(               // ← NOT a Stack
    children: [
      Container(/* header */),
      Expanded(child: ChatRoomMessageList(...)),
      if (!isAtBottom && messages.isNotEmpty)
        Positioned(                              // line 123
          bottom: 80,
          right: 16,
          child: FloatingActionButton.small(...),
        ),
      Container(/* input bar */),
    ],
  ),
);
```

`Positioned` is a `ParentDataWidget` that only works with a `Stack` ancestor
— its `applyParentData` does an unguarded `renderObject.parentData! as
StackParentData` cast. The immediate parent here is a `Flex`/`Column`
(`FlexParentData`), so that cast throws a `TypeError` — not a debug-only
`assert()`, an actual runtime exception in every build mode, including a
release APK. This fires the moment `!isAtBottom && messages.isNotEmpty`
becomes true, i.e. as soon as any user scrolls up in any chat room. This is
the single most severe finding in this doc — a guaranteed crash on a core,
frequently-used flow, not a layout quirk.

**Fix:** wrap the whole thing in a `Stack` with the existing `Column` as the
base layer and the FAB as an overlay:

```dart
return Container(
  ...
  child: Stack(
    children: [
      Column(
        children: [
          Container(/* header */),
          Expanded(child: ChatRoomMessageList(...)),
          Container(/* input bar */),   // Positioned's sibling removed from here
        ],
      ),
      if (!isAtBottom && messages.isNotEmpty)
        Positioned(
          bottom: 80,
          right: 16,
          child: FloatingActionButton.small(...),
        ),
    ],
  ),
);
```

(`bottom: 80` was presumably tuned against the input bar's height when this
was originally a `Column`-relative offset — re-check visually once it's an
actual `Stack`-relative offset, since the reference frame changes.)

## 8. Finding D — Chat room sidebar is permanently cramped on phones

**Verified directly**, including a targeted follow-up confirming the
`sidebarOpen` flag is vestigial. `lib/views/chat_room/chat_room_sidebar.dart:59-60`:

```dart
return Container(
  width: 220,
  margin: const EdgeInsets.only(right: 12),
  ...
```

No `LayoutBuilder`/`MediaQuery` width check anywhere in the file. It's
composed unconditionally in a `Row` at `chat_room_base_view.dart:163-175`,
next to `Expanded(child: messagesAsync...)` — always present, regardless of
screen size, unlike the `width < 768` swap-to-column convention already used
in `v1_shell.dart` and `feed_base_view.dart`. On a ~360-390dp phone this
leaves only ~120-160dp for the message list and input bar. The `sidebarOpen`
prop passed into `ChatRoomSidebar` looks like it should gate this (mirroring
`V1Sidebar`'s mobile drawer pattern) but doesn't — inside `ChatRoomSidebar`
it only toggles whether `SidebarCloseButton` renders
(`chat_room_sidebar.dart:82-86`); the sidebar `Container` itself is always
built. In the parent, `_sidebarOpen` only drives a tap-to-dismiss scrim
overlay (`chat_room_base_view.dart:158-162`) — it never gates the sidebar's
presence in the tree. This reads as a vestigial flag left over from a web
version where the sidebar really was an off-canvas drawer.

**Fix (larger than a one-line tweak — scope accordingly):** actually wire
`sidebarOpen`/a `width < 768` check into `ChatRoomSidebar`'s presence in the
layout, mirroring `V1Sidebar`'s own mobile pattern — collapse it into an
overlay drawer triggered by the existing hamburger button
(`HamburgerButton` is already wired to `onSetSidebarOpen`, per
`chat_room_main_content.dart:104-109`) rather than a permanent column, on
narrow widths.

## 9. Finding E — Minor / low-severity items

- **`lib/views/ui/input_otp/page_content.dart:32-40`** — six fixed
  `Container(width: 48, margin: horizontal: 4)` boxes in a centered `Row`
  with no `Expanded`/scroll wrapper; needs ~368dp+ and will overflow/clip on
  a 360dp-wide low-end Android phone. Demo-only page, low priority.
- **`lib/views/settings/billing/billing_address_form.dart` +
  `billing_address_field.dart`** — verified directly: `grep -rn
  "BillingAddressForm"` across `lib/` only matches inside the file itself (the
  class/state declarations). Zero call sites anywhere in the app. This is the
  one multi-`TextField` form in the codebase with no scroll wrapper (would be
  a Finding-C-class keyboard-avoidance bug if it were ever wired up), but
  since nothing imports it, it isn't live. Decision needed, not a fix: either
  delete both files, or — if `next-js-boilerplate` has a live billing-address
  feature this was meant to port — wire it up properly (with a scroll
  wrapper) rather than leaving it as unreachable dead code. Not investigated
  further here; out of scope for a UI-overlap audit.

Categories checked and found **clean** (stated explicitly, not just omitted):
keyboard-avoidance (auth screens share `components/auth/auth_layout.dart`,
which wraps in `SafeArea` + `SingleChildScrollView`; all `forms/*` and
`settings/account/*` pages use `ListView`; no
`resizeToAvoidBottomInset: false` anywhere in the app); `bottomNavigationBar`
/ `bottomSheet` / `showModalBottomSheet` (zero usages in the whole app); other
hand-rolled top bars beyond `V1Header` (none — `V1Header` is the only
`implements PreferredSizeWidget` class in the app, and all `Positioned(top:
0, ...)` hits found are small, correctly-`Stack`-scoped local overlays, e.g.
a per-thumbnail remove button in image upload — not page-level banners);
root-level `Stack`/`Positioned(top: 0)` full-bleed content bugs across the
118 shell pages (zero — `Stack`/`Positioned`/`Alignment.topCenter` don't
appear at all in that file set, besides the Finding-C instance which is a
*missing* `Stack`, not a misused one).

## 10. Fix plan — phases

**Phase 1 — contained, high/critical severity, do first (3 files).**
1. Finding C — wrap the chat room FAB in an actual `Stack` (§7). Prevents a
   guaranteed crash; do this before anything else in this doc.
2. Finding B — `SafeArea(top: false, ...)` around `V1Sidebar`'s content
   (§6).
3. Finding D — wire `sidebarOpen`/a width check into `ChatRoomSidebar`'s
   presence in the layout (§8). Larger than 1 and 2; budget more time.

**Phase 2 — real-feature nested-Scaffold cleanup (~21 files).** Settings (7:
`settings/page_view.dart` + 6 sub-pages), posts (`page_view.dart` free+paid
branches, `create_page_view.dart`, `detail_page_view.dart` free+paid
branches), find-friends (`requests_page.dart` free+paid branches),
`checkout/page_content.dart`, admin (2), users (3), `security`, `share`,
`boom`. Apply the §5 mechanical pattern, but: confirm with Berkay whether
`settings/page_view.dart`'s back-to-feed arrow should be dropped (relying on
the hamburger, like all 117 other pages) or relocated inline; check whether
the posts pages' "add post" action icon and any admin-page filter controls
need relocating into an inline header row rather than being silently
dropped.

**Phase 3 — forms gallery cleanup (13 files).** `forms/page_content.dart` +
12 sub-pages (advanced, api-key, billing, checkout, content-editor,
editable-table, elements, error-lab, field-states, filters, form-builder,
layouts, profile, team-invite, uploads). All confirmed single title-only
`AppBar`s — lower individual risk than Phase 2, straightforward mechanical
strip.

**Phase 4 — demo/UI-component gallery cleanup (~73 files: 9 `demos/*` + 64
`ui/*`).** Same mechanical pattern, near-total repetition — good candidate
for a scripted or single-agent batch pass rather than file-by-file manual
editing, since the fix is identical everywhere except two: special-case
`lib/views/ui/drawer/page_content.dart` (needs an actual look — it's
demonstrating the Drawer *component*, so blindly stripping its `Scaffold`
would break the demo, not just fix the redundant-chrome bug) and
individually verify `lib/views/ui/page_content.dart` (the `/v1/:lang/ui`
gallery index — check it's the same pattern before batch-fixing it). Full
file list in §11.

**How to batch this safely instead of opening 73 files one at a time:**
1. Confirm each file really is the simple case before touching it —
   `grep -c "Scaffold(" <file>` should be exactly `1`, and `grep
   "actions:\|floatingActionButton\|bottomNavigationBar\|drawer:" <file>`
   should return nothing (drawer/page_content.dart is the one known
   exception — handle it separately, don't run it through the batch pass at
   all).
2. For files that pass both checks, the transform is always the same:
   delete the `Scaffold(appBar: AppBar(title: Text(...)), body: X)` wrapper
   and return `X` directly, exactly as shown in §5's mechanical-fix snippet
   — nothing else in the file needs to change.
3. After each batch (e.g. 10-15 files), run `flutter analyze` — an unused
   `AppBar`/`Scaffold` import left behind, or a body expression that isn't
   valid as a bare return (e.g. a `body:` that was itself conditional) will
   surface immediately as an analyzer error rather than a silent runtime
   bug, so this is a cheap, frequent checkpoint. Don't batch all 73 and
   analyze once at the end — a single bad file blocks the whole batch's
   compile signal.
4. Spot-check 4-5 rendered pages per batch on the running APK rather than
   trusting the analyzer alone — the analyzer confirms the code compiles,
   not that the resulting layout looks right (e.g. a page whose `body:` was
   a `Center(child: ...)` may now look oddly positioned once it's the
   top-level return with no `Scaffold` centering behavior around it).

**Phase 5 — minor items (§9).** Fix or scroll-wrap the OTP demo; decide and
execute on `billing_address_form.dart`/`billing_address_field.dart` (delete,
or wire up properly — Berkay's call).

**Phase 6 — verification.** See §12.

## 11. Appendix — full Finding A file inventory

**Real-feature pages (Phase 2, 21 files) — verify each individually, some
carry chrome beyond a redundant title (see §5, §10):**

```
lib/views/settings/page_view.dart                    (back-arrow, see §5)
lib/views/settings/account/page_view.dart
lib/views/settings/billing/page_view.dart             (2 branches + helper fn)
lib/views/settings/general/page_view.dart
lib/views/settings/privacy/page_view.dart
lib/views/settings/sessions/page_view.dart
lib/views/settings/api_keys/page_content.dart
lib/views/posts/page_view.dart                        (free + paid branches; paid has an action icon)
lib/views/posts/create_page_view.dart
lib/views/posts/detail_page_view.dart                 (free + paid branches)
lib/views/find_friends/requests_page.dart              (free + paid branches)
lib/views/checkout/page_content.dart
lib/views/admin/page_view.dart
lib/views/admin/audit_logs/page_view.dart
lib/views/users/page_view.dart
lib/views/users/list/page_view.dart
lib/views/users/detail/page_view.dart
lib/views/security/page_view.dart
lib/views/share/page_content.dart
lib/views/boom/page_content.dart
```

**Forms gallery (Phase 3, 13 files) — mechanical, title-only:**

```
lib/views/forms/page_content.dart
lib/views/forms/advanced/page_content.dart
lib/views/forms/api_key/page_content.dart
lib/views/forms/billing/page_content.dart
lib/views/forms/checkout/page_content.dart
lib/views/forms/content_editor/page_content.dart
lib/views/forms/editable_table/page_content.dart
lib/views/forms/elements/page_content.dart
lib/views/forms/error_lab/page_content.dart
lib/views/forms/field_states/page_content.dart
lib/views/forms/filters/page_content.dart
lib/views/forms/form_builder/page_content.dart
lib/views/forms/layouts/page_content.dart
lib/views/forms/profile/page_content.dart
lib/views/forms/team_invite/page_content.dart
lib/views/forms/uploads/page_content.dart
```
(16 listed — `forms/page_content.dart` is the gallery index plus 15 sub-pages;
count in §2/§5 rounds this group to "13" loosely, use this list as ground
truth, it was derived directly from `router.dart` imports.)

**Demos (9 files) — mechanical, title-only:**

```
lib/views/demos/form_page.dart
lib/views/demos/i18n_page.dart
lib/views/demos/images_page.dart
lib/views/demos/lazy_loading_page.dart
lib/views/demos/observability_page.dart
lib/views/demos/page_view.dart
lib/views/demos/search_params_page.dart
lib/views/demos/theme_page.dart
lib/views/demos/ws_page.dart
```

**UI component demos (64 files) — mechanical, title-only, except
`drawer` (special-case, see §10 Phase 4) and `page_content.dart` (gallery
index — verify individually):**

```
lib/views/ui/accordion/page_content.dart
lib/views/ui/accordion/rich_items_page.dart
lib/views/ui/accordion/variants_page.dart
lib/views/ui/alert/page_content.dart
lib/views/ui/alert_dialog/page_content.dart
lib/views/ui/aspect_ratio/page_content.dart
lib/views/ui/avatar/page_content.dart
lib/views/ui/badge/page_content.dart
lib/views/ui/breadcrumb/page_content.dart
lib/views/ui/button/page_content.dart
lib/views/ui/calendar/page_content.dart
lib/views/ui/card/page_content.dart
lib/views/ui/carousel/page_content.dart
lib/views/ui/checkbox/page_content.dart
lib/views/ui/collapsible/page_content.dart
lib/views/ui/combobox/page_content.dart
lib/views/ui/command/page_content.dart
lib/views/ui/confirm_dialog/page_content.dart
lib/views/ui/context_menu/page_content.dart
lib/views/ui/counter/page_content.dart
lib/views/ui/date_picker/page_content.dart
lib/views/ui/dialog/page_content.dart
lib/views/ui/drawer/page_content.dart                  (special case, see §10)
lib/views/ui/dropdown/page_content.dart
lib/views/ui/dropdown_menu/page_content.dart
lib/views/ui/empty/page_content.dart
lib/views/ui/error_boundary/page_content.dart
lib/views/ui/file_upload/page_content.dart
lib/views/ui/form_error_banner/page_content.dart
lib/views/ui/form_field_info/page_content.dart
lib/views/ui/hover_card/page_content.dart
lib/views/ui/image_upload/page_content.dart
lib/views/ui/input_group/page_content.dart
lib/views/ui/input_otp/page_content.dart               (also Finding E overflow)
lib/views/ui/kbd/page_content.dart
lib/views/ui/label/page_content.dart
lib/views/ui/logo_spinner/page_content.dart
lib/views/ui/menubar/page_content.dart
lib/views/ui/native_select/page_content.dart
lib/views/ui/navigation_menu/page_content.dart
lib/views/ui/page_content.dart                         (gallery index, verify individually)
lib/views/ui/pagination/page_content.dart
lib/views/ui/popover/page_content.dart
lib/views/ui/progress/page_content.dart
lib/views/ui/radio_group/page_content.dart
lib/views/ui/resizable/page_content.dart
lib/views/ui/scroll_area/page_content.dart
lib/views/ui/scroll_to_bottom_button/page_content.dart
lib/views/ui/select/page_content.dart
lib/views/ui/separator/page_content.dart
lib/views/ui/sheet/page_content.dart
lib/views/ui/skeleton/page_content.dart
lib/views/ui/slider/page_content.dart
lib/views/ui/spinner/page_content.dart
lib/views/ui/step_indicator/page_content.dart
lib/views/ui/switch/page_content.dart
lib/views/ui/tabs/page_content.dart
lib/views/ui/textarea/page_content.dart
lib/views/ui/time_input/page_content.dart
lib/views/ui/toast/page_content.dart
lib/views/ui/toggle/page_content.dart
lib/views/ui/toggle_group/page_content.dart
lib/views/ui/tooltip/page_content.dart
lib/views/ui/typography/page_content.dart
```

## 12. Post-fix verification checklist

Run on a real APK build (`flutter build apk --release
--dart-define-from-file=.env`), installed on a real device or the Pixel 7
emulator — not `flutter run -d chrome`, which won't reproduce any of this.

- [ ] `flutter analyze` and `dart format --output=none --set-exit-if-changed
      .` both clean (project gate, per the flutter-testing skill).
- [ ] Sign in → feed: single header row only (no duplicate title bar
      anywhere), hamburger menu opens/closes the sidebar cleanly.
- [ ] Sidebar: scroll to the bottom entry (sign-out or sign-in CTA) — fully
      visible and tappable above the gesture-nav bar.
- [ ] Settings + all 6 sub-pages: single header, confirm the back-arrow
      decision (dropped or relocated) reads correctly.
- [ ] Posts list, create, detail (both free and paid tier if testable):
      single header, any action icon still present and working.
- [ ] Plans page: still correct (confirms the §4 fix wasn't regressed by
      later phases).
- [ ] Chat room: send a few messages, scroll up until the scroll-to-bottom
      button appears — **must not crash**. Sidebar collapses to a drawer (or
      is otherwise usable) on phone width.
- [ ] Spot-check 5-6 `forms/*` and `ui/*` demo pages for the single-header
      look; specifically check `ui/drawer` (no duplicate hamburger) and
      `ui/page_content.dart` (gallery index).
- [ ] `ui/input_otp` demo: six boxes fully visible, no clipping, on a
      360dp-simulated width if possible.
- [ ] No `pnpm test`/Playwright equivalent needed per established workflow —
      manual on-device pass is the gate here, same as this session.

---

# Part II — additional issues from on-device testing (Rev 2, 2026-07-25)

Berkay tested the app further on-device the same day and reported 4 more
issues. Unlike Part I, these are **not** all Android-rendering-specific —
Finding G (§14) is a pure Dart logic bug that would reproduce on the web
preview too, and Findings H/I (§15-16) are design-fidelity gaps, not
overlap bugs. Added here per Berkay's request to keep one register for this
audit. Same rules as Part I: planning only, nothing below is implemented,
every claim was verified by directly reading the cited file (not just
trusting agent reports — see each section for exact evidence).

## 13. Finding F — Sidebar doesn't auto-close on navigation

**Verified directly.** `lib/views/v1/v1_nav.dart`'s `_NavItem.onTap` (around
line 193) is:
```dart
onTap: active ? null : () => context.go(target),
```
It only navigates — nothing signals the sidebar to close. `V1Nav` has no
`onClose`/`onNavigate` constructor parameter at all. `V1Sidebar`
(`lib/views/v1/v1_sidebar.dart:57-61`), which *does* receive `onClose` from
`V1Shell`, never forwards it into its `V1Nav(lang: lang, currentPath:
currentPath)` call — there is no wiring path anywhere from "user tapped a
link" to "close the drawer." Applies identically to the 2 admin nav items
inlined directly in `V1Nav.build()` (~lines 135-155), since those are also
built via `_NavItem` — one fix point covers both.

This only matters on mobile: on wide/desktop screens `V1Sidebar` is a
permanent push-panel (`AnimatedContainer(width: sidebarOpen ? 224 : 0,
...)`, `v1_sidebar.dart:124-135`), not a dismissible overlay, and should stay
open across navigation there — any fix must not regress that.

**Fix:**
1. Add `final VoidCallback? onNavigate;` to `V1Nav`'s constructor.
2. In `V1Sidebar.build()`, pass `onNavigate: isMobile ? onClose : null` into
   the `V1Nav(...)` call (`isMobile` already computed at `v1_sidebar.dart:30`).
3. Add `final VoidCallback? onNavigate;` to `_NavItem`, threaded from both
   the `.map()` call site and the 2 admin `_NavItem(...)` call sites.
4. In `_NavItem`: `onTap: active ? null : () { onNavigate?.call();
   context.go(target); }`.

## 14. Finding G — Tier-casing mismatch breaks RBAC for every non-free user (CRITICAL)

The most severe finding in this document — worse than a rendering bug, this
silently denies paying users the product they're paying for, on every
session. This is almost certainly Berkay's literal reported symptom, and it
is not specific to his account — it reproduces for every basic/medium/
premium user.

### Root cause (verified directly, full evidence chain)

**Backend always emits uppercase.** `nest-js-boilerplate/prisma/schema.prisma:51-56`:
```prisma
enum SubscriptionTier {
  FREE
  BASIC
  MEDIUM
  PREMIUM
}
```
Every login/session/profile path on the backend serializes this verbatim
(`auth-login.service.ts:99`, `auth-token.service.ts:42,58`,
`cookies-ssr.service.ts:56,71` — all `tier: user.subscriptionTier ?? 'FREE'`).

**Flutter receives it verbatim and never normalizes it.**
`lib/types/auth/user.dart:23` (verified directly):
```dart
tier: (json['tier'] as String?) ?? (json['subscriptionTier'] as String?) ?? 'free',
```
No `.toLowerCase()` anywhere. Every login path funnels through this one
`fromJson` — email/password (`api/server/auth/login.dart`), OAuth
(`api/server/auth/oauth.dart`'s `OAuthLoginResponse.fromJson`, identical
unmodified shape), and profile refresh (`api/server/auth/me.dart`). The
`'free'` fallback only fires if the field is entirely absent, which it never
is — so for any real user, `AuthenticatedUser.tier` ends up as the literal
uppercase string from the backend (`"PREMIUM"`, `"MEDIUM"`, ...), and stays
that way through secure-storage persistence (`lib/hooks/use_auth.dart`
serializes/deserializes the object as-is, no case handling either direction).

**Gating compares against lowercase, so it can never match.**
`lib/lib/tier_view.dart` (verified directly, full file):
```dart
allowedTiers = const ['free', 'basic', 'medium', 'premium'],   // line 20
...
if (!allowedTiers.contains(tier)) {                             // line 28
  return _UpgradePrompt(tier: tier);
}
```
`tier` is `"PREMIUM"`; `allowedTiers` is all-lowercase; `.contains()` is
case-sensitive — always false for any non-free user, always falls into
`_UpgradePrompt`. `lib/lib/tier.dart:11-16`'s `tierOrder` map (used by
`Tier.hasAccess()`) is keyed identically lowercase, same failure mode. The
feed page (`lib/views/feed/page_view.dart:17-22`) wraps its tier-specific
content directly in this `TierGate` — exactly Berkay's reported symptom.

**Confirms it's a genuine defect, not an intentional lowercase convention:**
`lib/views/v1/v1_nav.dart:26` assumes UPPERCASE (`user?.tier == 'ADMIN' ||
user?.tier == 'SUPERADMIN'`) — see §14.1 for that line's own separate bug,
but it proves the codebase isn't uniformly lowercase by design, it's just
inconsistent. Ground truth from the web app confirms uppercase is correct:
`next-js-boilerplate/src/lib/tier.ts:8-15` uses uppercase `TIERS`/
`TIER_ORDER` throughout, matching the backend exactly — lowercase was
introduced during the Flutter port and never reconciled against real
backend values.

**Fix — normalize at the single choke point, don't scatter `.toLowerCase()`
calls throughout the codebase.** `lib/types/auth/user.dart:23`, change:
```dart
tier: (json['tier'] as String?) ?? (json['subscriptionTier'] as String?) ?? 'free',
```
to:
```dart
tier: ((json['tier'] as String?) ?? (json['subscriptionTier'] as String?) ?? 'free').toLowerCase(),
```
Every login/session-restore/profile-refresh path already flows through this
one `fromJson`, so this single change fixes gating everywhere at once —
`tier.dart`, `tier_view.dart`, and every `TierGate` call site are already
lowercase-based and need no changes. Do **not** touch `v1_nav.dart:26`'s
`'ADMIN'`/`'SUPERADMIN'` comparison as part of this fix — it compares
against a different backend enum (`UserRole`, not `SubscriptionTier`) and
has its own, separate bug (§14.1).

**Second, independent contributing bug (lower priority than the casing fix,
real but narrower):** `lib/views/checkout/page_content.dart:84-85` calls
`billing.subscribe()` then `billing.invalidate()`, which only invalidates
`subscriptionProvider`/`billingHistoryProvider`/`paymentMethodsProvider`
(`lib/hooks/use_billing.dart:29-33`) — never `authProvider`, never a
`setSession`/profile-refresh call. So a user who upgrades **mid-session**
(without logging out and back in) keeps their stale cached tier even after
the casing fix above. A `me` GraphQL query already exists
(`lib/api/server/auth/me.dart`) but is wired to a differently-scoped
`currentUserProvider` (`lib/api/client/auth/queries.dart:5`) that nothing in
the tier-gating path (`tier_view.dart:5`, `v1_nav.dart:6`, which both import
the cache-only `currentUserProvider` from `hooks/use_auth.dart:66`) actually
uses. Fix: after a successful `billing.subscribe()`, also refresh and
re-persist the session user (either re-run the `me` query and call
`authProvider.notifier.setSession(...)` again, or fold tier into whatever
`billing.invalidate()` already refetches).

### 14.1 Related structural gap — Admin nav section is unreachable for everyone

Verified directly. `lib/types/auth/user.dart` has exactly 6 fields: `id,
email, name, tier, avatarUrl, language` — **there is no `role` field.** The
backend's `UserRole` enum (`schema.prisma:44-49`: `USER / MODERATOR / ADMIN /
SUPERADMIN`) is a completely separate concept from `SubscriptionTier`, but
nothing in `AuthenticatedUser` captures it. `lib/views/v1/v1_nav.dart:26`'s
`isAdmin` check reads `user?.tier` — the *subscription-tier* field — and
compares it against `'ADMIN'`/`'SUPERADMIN'`, values that field can
structurally never hold (post-§14-fix it will only ever be
`'free'/'basic'/'medium'/'premium'`). This isn't a casing bug like §14 — it's
the wrong field compared against the wrong enum's values entirely. Confirmed
via grep: no Flutter auth query (`login.dart`, `oauth.dart`, `me.dart`)
requests `role` from the backend at all, even though the backend's generated
User GraphQL model has the field available (`schema.prisma:261`,
`@generated/user/user.model.ts`). Net effect: **the Admin section in the
sidebar nav never renders for anyone, including real admins.**

**Fix (larger than §14 — needs a field added, not just a normalize):**

1. **Add the field to the model.** `lib/types/auth/user.dart` currently has
   exactly this shape (verified above, full file) — add `role` alongside
   `tier`, both in the constructor and `fromJson`:
   ```dart
   class AuthenticatedUser {
     final String id;
     final String email;
     final String name;
     final String tier;
     final String role;              // + new field
     final String? avatarUrl;
     final String? language;

     const AuthenticatedUser({
       required this.id,
       required this.email,
       required this.name,
       required this.tier,
       this.role = 'USER',           // + default matches backend's @default(USER)
       this.avatarUrl,
       this.language,
     });

     factory AuthenticatedUser.fromJson(Map<String, dynamic> json) {
       return AuthenticatedUser(
         id: json['id'] as String,
         email: json['email'] as String,
         name: json['name'] as String,
         tier: ((json['tier'] as String?) ?? (json['subscriptionTier'] as String?) ?? 'free').toLowerCase(),
         role: (json['role'] as String?) ?? 'USER',   // + new — no case-normalizing here until the actual backend casing is confirmed (see step 3)
         avatarUrl: json['avatarUrl'] as String?,
         language: (json['language'] as String?) ?? (json['locale'] as String?),
       );
     }

     Map<String, dynamic> toJson() => {
           'id': id,
           'email': email,
           'name': name,
           'tier': tier,
           'role': role,             // + new — must round-trip through secure-storage persistence too
           'avatarUrl': avatarUrl,
           'language': language,
         };
   }
   ```
2. **Request the field from the backend.** Every query that currently
   selects `tier`/`subscriptionTier` needs `role` added alongside it. The
   OAuth path's exact shape is already known (`lib/api/server/auth/oauth.dart`,
   read in full earlier this session):
   ```dart
   const mutation = '''
     mutation LoginWithOAuth($profile: OAuthProfileInput!) {
       loginWithOAuth(profile: $profile) {
         accessToken
         user {
           id
           email
           name
           avatarUrl
           locale
           tier: subscriptionTier
           role                      // + add this line
         }
       }
     }
   ''';
   ```
   `login.dart` and `me.dart` weren't read in full during this audit, so
   don't copy this snippet verbatim into them — open each file, find
   wherever it currently selects `tier`/`subscriptionTier` in its own query
   text, and add `role` in the same style already used in that file.
3. **Fix the comparison, after confirming real casing.** Before changing
   `v1_nav.dart:26`, log or print an actual `role` value from a real admin
   test account's API response (or check the backend resolver/DTO the same
   way §14 checked `SubscriptionTier`'s Prisma enum) — don't assume it's
   uppercase just because `UserRole`'s Prisma enum values
   (`schema.prisma:44-49`) are declared uppercase; confirm nothing
   downcases it in a resolver/serializer first, the same class of mistake
   that caused §14. Once confirmed, change:
   ```dart
   final isAdmin = user?.tier == 'ADMIN' || user?.tier == 'SUPERADMIN';
   ```
   to:
   ```dart
   final isAdmin = user?.role == 'ADMIN' || user?.role == 'SUPERADMIN';
   ```

## 15. Finding H — UI component library: missing font/theme wiring + per-component gaps

### 15.1 Highest-leverage fix — the brand font is bundled but never applied

Verified directly. `pubspec.yaml:67-75` correctly registers the `Geist` font
family (Regular/Medium/SemiBold/Bold) with real `.ttf` assets. But
`lib/constants/theme.dart`'s `buildThemeData()` (lines 286-378) never
references `Geist` or sets a general `fontFamily`/`textTheme` — confirmed via
`grep -n "fontFamily\|Geist" lib/constants/theme.dart`, whose only hit is
`fontFamily: 'monospace'` (line 214, the code-sample token only). Every other
piece of text in the app renders in stock Android Roboto. This alone makes
the entire app look generic regardless of any per-component color work, and
is the cheapest, highest-impact fix in this whole document.

**Fix:** `lib/constants/theme.dart`'s `buildThemeData()` was read in full to
ground this precisely — it returns a single `ThemeData(...)` starting with
`useMaterial3: true, brightness: brightness, colorScheme: colorScheme,
extensions: [colors, typography], scaffoldBackgroundColor: ...`. Add
`fontFamily: 'Geist'` as a sibling of those top-level properties:
```dart
return ThemeData(
  useMaterial3: true,
  brightness: brightness,
  colorScheme: colorScheme,
  fontFamily: 'Geist',              // + add this line
  extensions: [colors, typography],
  scaffoldBackgroundColor: colors.surface,
  appBarTheme: AppBarTheme(...),
  ...
);
```
(Or build an explicit per-weight `textTheme` if finer control over which of
the 4 bundled weights maps to which `TextTheme` role is needed — a flat
`fontFamily: 'Geist'` is likely sufficient on its own since `FontWeight`
already varies per `AppTypography` token, and Flutter resolves the matching
weight file from the family automatically.)

### 15.2 `buildThemeData()` is incomplete — several Material categories have no theme at all

Verified directly (full-file read). `buildThemeData()` sets 11 theme
categories: `appBarTheme`, `cardTheme`, `dividerTheme`,
`inputDecorationTheme`, `elevatedButtonTheme`, `textButtonTheme`,
`snackBarTheme`, `bottomNavigationBarTheme`, `navigationRailTheme`, plus the
top-level `colorScheme`/`scaffoldBackgroundColor`. Two specific, verified
gaps within that:

- `ColorScheme.light`/`ColorScheme.dark` (both branches, symmetric) only set
  `primary/onPrimary/secondary/surface/onSurface/error` — `tertiary`,
  `secondaryContainer`, `outline`, `surfaceContainer*` and the rest of
  Material 3's ~20-role palette are left at Flutter's stock defaults.
- **No** `checkboxTheme`, `dialogTheme`, `radioTheme`, `switchTheme`,
  `outlinedButtonTheme`, or `filledButtonTheme` exist at all — any bare
  Material widget of those types (§15.3's `Checkbox`, `AlertDialog`) falls
  through entirely to generic, brand-less Material 3 styling with zero input
  from this app's `AppColors`.

(Correction to an earlier draft of this finding: `cardTheme` *does* already
exist — `CardThemeData(color: colors.surfaceAlt, elevation: 0, shape:
RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side:
BorderSide(color: colors.border)))` — so `Card`'s gap in §15.3 is narrower
than "completely unstyled": it inherits a real, reasonable single look. What
it's actually missing is *variant support* — the web's 5 variants
(elevated/interactive/outline/surface/default) all render identically in
Flutter today because `CardWidget` never branches on a variant at all,
see §15.3.)

**Fix:** fill out the remaining `ColorScheme` roles from `AppColors`, and add
the missing theme entries, appended after the existing
`navigationRailTheme` entry (last one in the constructor today):
```dart
    navigationRailTheme: NavigationRailThemeData(
      backgroundColor: colors.surface,
    ),
    checkboxTheme: CheckboxThemeData(                              // + new
      fillColor: WidgetStateProperty.resolveWith(
        (states) => states.contains(WidgetState.selected)
            ? colors.brand
            : Colors.transparent,
      ),
      checkColor: WidgetStateProperty.all(colors.surface),
      side: BorderSide(color: colors.border),
    ),
    dialogTheme: DialogThemeData(                                  // + new
      backgroundColor: colors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
  );
}
```
(`radioTheme`/`switchTheme`/`outlinedButtonTheme`/`filledButtonTheme` follow
the same shape — add them the same way once `checkboxTheme`/`dialogTheme`
are verified working; not sketched individually here since the pattern is
identical.) These are app-wide, zero-per-component-risk changes — do them
before any of §15.3's per-component work, since several of those components
will inherit correct-looking defaults for free once this lands.

### 15.3 Per-component gaps — Card, Checkbox, Select, AlertDialog are bare Material wrappers

Demo pages are confirmed **not** the problem — all 6 sampled
`views/ui/<name>/page_content.dart` pages correctly import and render the
real `components/ui/<name>/` widget. The plainness lives inside the library
itself:

| Component | Web reference | Flutter library status |
|---|---|---|
| Button | 9 variants, `button-styles.ts:8-34` | Styled — `AppColors` + 5-variant enum (`button/button.dart:33,110-159`); covers 5/9 web variants; radius hardcoded `6` instead of a `UIConstants` token (line 117) |
| Badge | 8 variants, rectangular default (`badge.tsx:49`) | Styled — `AppColors` + 6-variant enum, but **always** pill-shaped (`badge/badge.dart:50`, unconditional `BorderRadius.circular(999)`) regardless of variant |
| Card | 5 variants (`card.tsx:19-27`) | **No variant support** — 34 lines, zero `AppColors` refs, zero variant parameter (`card/card.dart:1-34`); just `Card(elevation: elevation ?? 0, ...)`. Inherits a real, designed look from the global `cardTheme` (§15.2 — surfaceAlt fill, radius 8, bordered), so it isn't unstyled, but all 5 web variants render pixel-identical since the widget never branches on one |
| Checkbox | 5 variants × 3 sizes, custom-drawn (`checkbox.tsx:18-47`) | **Bare wrapper** — literally `Checkbox(value:, onChanged:, tristate:)` (`checkbox/checkbox.dart:17-34`), zero styling, no `checkboxTheme` fallback either |
| Select | Custom animated popover, 5 files | **Bare wrapper** — 36-line `DropdownButtonFormField` + plain `InputDecoration` (`select/select.dart:22-36`), zero `AppColors`; popup menu 100% stock Material |
| AlertDialog | `rounded-xl`, `shadow-xl`, bordered, animated (`alert-dialog.tsx:64-76`) | **Bare wrapper**, and worse — `build()` is dead code (`return const SizedBox.shrink()`, `alert_dialog.dart:58`); real content comes from a static `show()` calling plain `AlertDialog(...)` (lines 36-53), zero shape/color override |

These 4 of 6 sampled components are likely representative of gaps across the
~65-widget library (§11's UI-component list), not isolated. Real product
screens that look fine (`components/auth/social_login_buttons.dart`,
`views/plans/page_content.dart`'s `_PlanCard`) do so by hand-rolling their
own styling inline with heavy direct `AppColors` use — they don't reuse
`Button`/`CardWidget` at all, itself evidence those two are currently too
thin to reuse for real layouts.

**Fix:** per component, add a variant enum + explicit `AppColors`-driven
styling matching the pattern `Button` already establishes — don't invent a
new pattern, copy this one (`components/ui/button/button.dart`, verified
directly, full pattern below):

```dart
enum ButtonVariant { primary, secondary, ghost, danger, outline }
enum ButtonSize { sm, md, lg }

class Button extends StatelessWidget {
  final ButtonVariant variant;
  // ...
  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    final style = _buildStyle(colors);   // ← the actual per-variant work happens here
    // ... switches on `variant` to pick ElevatedButton/TextButton/OutlinedButton
  }

  ButtonStyle _buildStyle(AppColors colors) {
    switch (variant) {
      case ButtonVariant.primary:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.brand,
          foregroundColor: colors.surface,
          disabledBackgroundColor: colors.brand.withValues(alpha: 0.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        );
      case ButtonVariant.secondary:
        return ElevatedButton.styleFrom(
          backgroundColor: colors.surfaceAlt,
          foregroundColor: colors.fg,
          // ...
        );
      // ... one case per variant, each an explicit AppColors-driven ButtonStyle
    }
  }
}
```

The shape to replicate: **(1)** a public `enum <Component>Variant { ... }`
matching the web's variant names as closely as Flutter idioms allow, **(2)**
a `variant` constructor parameter defaulting to whatever the web's default
variant is, **(3)** a private `_buildStyle`/`_buildDecoration` method that
switches on `variant` and returns fully-specified, `AppColors`-driven
styling per case — never a bare pass-through to ambient theme for anything
that's supposed to visually differ by variant.

**Worked sketch for `Card` specifically** (the actual per-variant styling
below is illustrative, not verified against the web's exact
`card.tsx:19-27` values — read that file before implementing for real
pixel values):
```dart
enum CardVariant { defaultCard, elevated, interactive, outline, surface }

class CardWidget extends StatelessWidget {
  final CardVariant variant;
  final Widget child;
  const CardWidget({super.key, this.variant = CardVariant.defaultCard, required this.child});

  @override
  Widget build(BuildContext context) {
    final colors = AppColors.of(context);
    switch (variant) {
      case CardVariant.elevated:
        return Card(
          color: colors.surface,
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          child: child,
        );
      case CardVariant.outline:
        return Container(
          decoration: BoxDecoration(
            border: Border.all(color: colors.border),
            borderRadius: BorderRadius.circular(8),
          ),
          child: child,
        );
      // ...interactive (add InkWell/hover treatment), surface, defaultCard
    }
  }
}
```
Minimum confirmed-broken set to apply this pattern to: Card, Checkbox,
Select, AlertDialog. Budget time to spot-check more of the ~65-component
library using the same method (read web + Flutter side by side) once these
land, since only 6 were sampled here — the 4-of-6 hit rate found in this
audit suggests more are likely affected.

## 16. Finding I — Forms pages: dead composition files, minimal design-system usage

### Verdict

Not a component-styling bug — `Input`'s box styling (border/fill/focus
color) *is* correctly themed globally (`constants/theme.dart:331-351`'s
`inputDecorationTheme`). The "plain" look is a **composition bug**:
fully-built, properly-localized sibling files already exist for most form
pages and are simply never imported. The routed `page_content.dart` instead
hand-rolls a stripped-down, hardcoded-English duplicate inline.

### Evidence (verified directly for `forms/elements`)

`lib/views/forms/elements/page_content.dart` (read in full) imports only
`checkbox`, `form_text_field`, `input`, `switch`, `textarea`, and `l10n` — no
section files. Its `build()` is one `Card` containing 4 inline groups,
headed by raw, hardcoded-English `Text` widgets:
```dart
const Text('Input Fields', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
...
const Text('FormTextField Examples', style: TextStyle(fontWeight: FontWeight.w600)),
...
const Text('Textarea', style: TextStyle(fontWeight: FontWeight.w600)),
...
const Text('Checkboxes & Switches', style: TextStyle(fontWeight: FontWeight.w600)),
```
— despite `AppLocalizations t` being in scope and correctly used two lines
away for the page title (`t.formsElementsHeading`, line 38) and submit
button (`t.formsFormBuilderSubmitPreview`, line 87). Meanwhile, 8
fully-built sibling files sit unused in the same directory:
`default_inputs_section.dart`, `selects_section.dart`,
`textarea_section.dart`, `toggles_section.dart`, `date_time_section.dart`,
`file_upload_sections.dart`, `form_validation_section.dart`,
`section_card.dart` — each already using proper localized labels internally
(e.g. `default_inputs_section.dart:16` uses `t.formsElementsInputDefault_label`),
but imported by nothing outside themselves anywhere in the repo (checked via
repo-wide grep). The web page
(`next-js-boilerplate/src/views/forms/elements/PageContent.tsx`) composes
roughly 12 sections in a responsive grid; the live Flutter page shows 4
groups stacked in a plain `Column`.

The identical pattern repeats in `forms/field_states/` (7 dead siblings:
`grid.dart`, `state_card.dart`, `validation_modes.dart`, `linked_fields.dart`,
`programmatic_meta.dart`, `eager_classic.dart`, `dynamic_async.dart` —
`page_content.dart` hardcodes `'Field States'`, `'Default'`, `'With Error'`,
`'Filled'`), `forms/form_builder/` (`field_editor.dart`, `form_preview.dart`
dead), and `forms/profile/` (`profile_fields.dart` →
`profile_basic_fields.dart`/`profile_preferences_fields.dart`/
`profile_validators.dart` chain entirely dead — `page_content.dart`
hardcodes `'Profile Details'`, `'Name'`, `'Email'`, `'Bio'`).

### Secondary component gaps

- `components/ui/input/input.dart:41-61` — `Input` is a bare `TextField`
  wrapper with no `enabled`/`readOnly` parameter at all; it *cannot* render
  a real disabled state (the "Disabled" demo in `forms/elements` fakes it by
  pre-populating a controller instead of actually disabling the field).
- `components/ui/label/label.dart` is called from nowhere except its own
  UI-gallery demo — zero real forms use it. `field_info_button.dart` has
  zero references anywhere in the app, including `router.dart` — not even
  demoed.
- No `labelStyle` is set on the global `inputDecorationTheme`, so floating
  labels fall back to generic Material text even though the border/fill
  around them is properly themed (ties into §15.1 — once `fontFamily` is set
  globally, labels inherit it too).

### Fix

Forms-specific composition work, largely independent of §15 — fixing
Card/Checkbox/Select won't fix a page that never imports its own sections.
Per affected form page: import and wire in the already-built sibling section
files instead of the inline hand-rolled version; replace hardcoded
`Text(..., style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold))`
headings with a proper typography token (ties into §15.1) and the
already-existing localization keys (this is a wiring gap, not a
missing-translation gap).

**Worked example — `forms/elements`.** `DefaultInputsSection`
(`default_inputs_section.dart`, read in full to confirm this) takes **zero**
constructor parameters — `const DefaultInputsSection({super.key})` — so
wiring it in is a straight drop-in, not a refactor:
```dart
// Before — page_content.dart's build(), the "Input Fields" group
const Text('Input Fields', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
const SizedBox(height: 12),
const Input(label: 'Default Input'),
const SizedBox(height: 8),
const Input(label: 'With Error', errorText: 'This field is required'),
// ...4 more inline Input() calls, all hardcoded English

// After
Text(t.formsElementsInputFieldsHeading, style: /* typography token, §15.1 */),
const SizedBox(height: 12),
const DefaultInputsSection(),   // already localized internally, already matches the 8-field web set
```
(`t.formsElementsInputFieldsHeading` is illustrative — check `l10n/app_en.arb`
for the actual key naming convention already used by this page's other
strings, e.g. `formsElementsHeading` for the page title, before inventing a
new one.) Repeat the same drop-in substitution for `SelectsSection`,
`TextareaSection`, `TogglesSection`, `DateTimeSection`,
`FileUploadSections`, `FormValidationSection` — check each one's own
constructor for required parameters before assuming it's equally
zero-argument (`DefaultInputsSection` was; the others weren't read during
this audit, don't assume). `SectionCard` is likely the shared wrapper these
sections are meant to sit inside (mirroring the web's per-section `Card`
layout) — read it first to see whether it should wrap each section or if
each section already wraps itself.

Separately: add `enabled`/`readOnly` support to `Input` (shared with
§15.3's component work), and either wire up `Label`/`FieldInfoButton` into
real forms or delete them if genuinely unneeded — a decision for whoever
implements this, not made here.

## 17. Fix plan — Phases 7-10 (Part II)

**Phase 7 — Finding G, the single most urgent item in this entire document
(1-4 files).** The `AuthenticatedUser.fromJson` casing fix (§14) — one-line
change, fixes premium/medium/basic gating for every user immediately. Then
§14.1's `role` field addition (touches `user.dart`, 3 query files,
`v1_nav.dart:26`) in the same pass, since it's the same investigation and
code area. Then, separately, the checkout mid-session-refresh fix noted
under §14 (lower priority than the two above, but real).

**Phase 8 — Finding F (1 file, small).** Wire `onNavigate` through
`V1Nav`/`V1Sidebar`/`_NavItem` per §13. Quick and fully contained.

**Phase 9 — Finding H (§15), systemic fixes first.** §15.1 (`fontFamily:
'Geist'`) and §15.2 (fill out `ColorScheme` + missing `*Theme`s) — cheap,
app-wide impact, no per-component risk. Then §15.3's per-component work
(Card, Checkbox, Select, AlertDialog minimum), budgeting time to spot-check
more of the ~65-component library beyond the 6 sampled here.

**Phase 10 — Finding I (§16).** Per form page: wire in the dead sibling
section files (`forms/elements`, `forms/field_states`, `forms/form_builder`,
`forms/profile` confirmed; check the remaining `forms/*` pages in §11 for
the same dead-sibling pattern, since only 4 were sampled here). Do this
after Phase 9's font/theme fixes land so the reworked sections inherit them
for free.

Phases 7-10 are independent of Phases 1-6 (Part I) and can be worked in
either order relative to those — but per the Rev 2 note at the top of this
doc, Phase 7 alone is more urgent than all of Part I combined.

## 18. Post-fix verification addendum (Part II)

Add to §12's checklist; same real-APK-build caveat applies (Finding G is the
one exception — it's pure Dart logic and would also be verifiable on
`flutter run -d chrome` if that's faster to iterate on).

- [ ] Log in as a non-free-tier test account (basic/medium/premium) → feed
      shows actual gated content, not the upgrade prompt. Repeat per tier if
      test accounts exist for each.
- [ ] Log in as an actual admin/superadmin test account (if one exists) →
      Admin section appears in the sidebar nav and both its links work.
- [ ] Upgrade tier mid-session via checkout (no logout/login in between) →
      feed reflects the new tier without requiring a fresh login.
- [ ] Tap any sidebar nav link on a phone-width screen → drawer closes
      automatically; confirm it does **not** also collapse on a wide/tablet
      window (desktop behavior unchanged).
- [ ] App-wide text renders in Geist, not stock Roboto (compare a heading
      against `next-js-boilerplate`'s rendered font).
- [ ] `ui/card`, `ui/checkbox`, `ui/select`, `ui/alert-dialog` demo pages:
      visually compare against their `next-js-boilerplate` equivalents —
      should no longer look like unstyled Material defaults.
- [ ] `forms/elements`, `forms/field-states`: full section set renders (not
      just the previous 4 inline groups), and displays correctly translated
      under a non-English locale (the keys already exist per §16 — confirm
      they actually show translated, not just present in the ARB files).
