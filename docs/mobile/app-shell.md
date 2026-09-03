# App shell (`v1/:lang` chrome)

**Source:** [`lib/views/v1/`](../../flutter-boilerplate/lib/views/v1/) top-level files · **Web
equivalent:** [frontend/app-shell.md](../frontend/app-shell.md)

Infra, not a screen — the header/sidebar chrome every real screen under
[`v1/:lang/**`](./v1/README.md) renders inside, mounted by the `ShellRoute` wrapping every `/v1/:lang/*`
`GoRoute` in [`router.dart`](../../flutter-boilerplate/lib/app/router.dart) (`V1Shell(lang: lang, child:
child)`). `lib/views/v1/home/` is **not** covered here — it's a real, separate screen (the root
`/v1/:lang` landing), documented at [v1/screen.md](./v1/screen.md).

## Component tree (as actually wired — see the dead-code note below)

```
V1Shell                       (Scaffold; responsive Row-vs-Stack layout at 768px)
├─ V1Header (as appBar)        (menu button, brand mark, lang/theme switches, auth-dependent right side)
│   ├─ notification bell        — inline InkWell + badge, NOT a NotificationDropdown-equivalent widget
│   ├─ message icon             — inline InkWell + badge, navigates straight to /messages
│   └─ _ProfileAvatar            — a PRIVATE class inside v1_header.dart (PopupMenuButton), NOT ProfileDropdown
├─ V1Sidebar
│   ├─ V1Nav
│   └─ ProfileSection            (the one real cross-reuse — genuinely imported and used)
├─ HeaderMessageBanner          (Positioned overlay, independent of the header/sidebar tree)
└─ child                        (the screen)
```

## ⚠ Four of this inventory's files were dead code — since deleted

**Resolved by deletion:** all four files below were removed in the cross-stack dead-code pass
(commit `b98fac8a`), closing `MOB-026` (resolved). The analysis is kept because the
inline-reimplementation pattern it documents is real and recurring.

**`message_dropdown.dart`, `profile_dropdown.dart`, and `badge.dart` (`BadgeWidget`) were never
imported anywhere** (`grep -rn "MessageDropdown(\|ProfileDropdown(\|BadgeWidget(" lib` matches only
each file's own definition). `V1Header.dart` reimplements all three concerns **entirely inline**
instead of composing them: a private `_ProfileAvatar` class (a `PopupMenuButton`, not a dropdown
panel), and hand-written `InkWell` + `Positioned`/`Container` badge circles for the notification and
message icons — no shared `BadgeWidget`, no auto-pop-on-arrival behavior like web's `MessageDropdown`.
This is the same "scaffolded, then reimplemented inline, original left behind" pattern already on
record for api-keys/security/account/general (see
`CROSS-013` (resolved)/`FE-007` (resolved)/`MOB-006` (resolved)) —
this app-shell cluster is a fourth, previously-unrecorded instance of it, and larger (3 files at once).

**`page_nav_wrapper.dart`'s `PageNavWrapper` is also dead** (zero instantiations anywhere) — and even
if wired up, it is **not** the mobile port of web's same-named component: web's `PageNavWrapper.tsx`
provides an in-flight-navigation progress overlay (`PageNavigationProvider` + `NavigationOverlay`);
mobile's `PageNavWrapper` is an unrelated `AnimatedSwitcher`/`FadeTransition` per-page-key transition
wrapper. Same file name, same directory position in the port, unrelated concept and both unused.

See `MOB-026` (resolved) for the full write-up. `ProfileSection`, by contrast, **is** genuinely
imported and used by `V1Sidebar` — not every file in this folder is dead, just these four.

## Files

| File | Role |
|---|---|
| [`v1_shell.dart`](../../flutter-boilerplate/lib/views/v1/v1_shell.dart) | Top-level orchestrator (`ConsumerStatefulWidget`). Owns `_sidebarOpen`; branches layout on `MediaQuery` width (<768 = `Stack` overlay, ≥768 = side-by-side `Row`) rather than web's CSS-breakpoint classes. Stacks `HeaderMessageBanner` above everything via `Positioned`. |
| [`v1_header.dart`](../../flutter-boilerplate/lib/views/v1/v1_header.dart) | `PreferredSizeWidget` app bar. Menu button, brand mark (navigates to `/v1/$lang`), lang/theme switches, then — loading / authenticated / signed-out branches mirroring web. Notification and DM unread counts are two **separate** providers (`notificationsUnreadCountProvider`, `dmUnreadCountProvider`) rendered as two separate icons with independent badges — a deliberate choice per this file's own comment, to avoid DMs inflating the notification bell for content that never appears on the notifications screen. |
| [`v1_nav.dart`](../../flutter-boilerplate/lib/views/v1/v1_nav.dart) | The link list: Home, Feed, Share, Users, Chat Room, Messages, Find Friends, Friends, Premium, Settings, UI, Forms, error/not-found demo entries — then, conditionally, an Admin section header + Admin + Audit Log links, gated by the same `isAdmin = user?.role == 'ADMIN' \|\| user?.role == 'SUPERADMIN'` check web uses (computed independently here, not shared code, but in agreement). |
| [`v1_sidebar.dart`](../../flutter-boilerplate/lib/views/v1/v1_sidebar.dart) | Responsive container: `AnimatedPositioned` slide-in overlay on mobile widths, `AnimatedContainer` width animation on wider ones. Composes `V1Nav` + `ProfileSection` (or a sign-in button when logged out). |
| [`profile_section.dart`](../../flutter-boilerplate/lib/views/v1/profile_section.dart) | Sidebar-footer account block — avatar, name/email/tier, expand/collapse to reveal settings-link + sign-out. Genuinely imported by `v1_sidebar.dart`. |
| [`header_message_banner.dart`](../../flutter-boilerplate/lib/views/v1/header_message_banner.dart) | A transient "new message" toast shown ~3s under the header on DM/room-message arrival (`headerMessageBannerProvider`, read from [`realtime_provider.dart`](../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart)). Its own doc comment calls this a mirror of "the web's `HeaderMessageBanner`" — imprecise: web has no component by that name, the closest equivalent is the dead-on-mobile `MessageDropdown`'s own auto-pop-on-arrival behavior (see [frontend/app-shell.md](../frontend/app-shell.md)). Functionally this file *does* cover the same user-facing need, just via an independently-built mechanism rather than a port of a specific web file. |
| [`missing_page.dart`](../../flutter-boilerplate/lib/views/v1/missing_page.dart) | The `/v1/:lang/missing` route's content — mirrors web's not-found demo fixture (see [v1/page.md](../frontend/v1/page.md)). Real, routed, alive. |
| `message_dropdown.dart` | **Deleted** (`b98fac8a`) — was a dead, never-instantiated would-be `MessageDropdown`; see above. |
| `profile_dropdown.dart` | **Deleted** (`b98fac8a`) — was a dead, never-instantiated would-be `ProfileDropdown`; see above. |
| `badge.dart` | **Deleted** (`b98fac8a`) — was a dead, never-instantiated `BadgeWidget`; see above. |
| `page_nav_wrapper.dart` | **Deleted** (`b98fac8a`) — was dead, and not a port of web's same-named file regardless; see above. |

## Global RTC call overlay (post-docs, RTC phases)

Not part of the v1 shell tree above but shell-level all the same:
[`app.dart`](../../flutter-boilerplate/lib/app/app.dart) mounts
[`RtcCallOverlay`](../../flutter-boilerplate/lib/components/rtc/rtc_call_overlay.dart) as a
`Positioned.fill` at the **app root** (same level as the biometric-lock overlay), so 1:1 calls ring
and run on any screen. State machine + signaling:
[`lib/rtc/rtc_call_provider.dart`](../../flutter-boilerplate/lib/lib/rtc/rtc_call_provider.dart) —
see [v1/rtc/README.md](./v1/rtc/README.md).

## The admin nav-link gate

Same relationship as web: `v1_nav.dart`'s `isAdmin` check and
[v1/admin/screen.md](./v1/admin/screen.md)'s router-level `requireAdmin()` gate are independently
computed, not shared code, but agree with each other. See [CROSS-039](../issues.md#cross-039).

## Known issues affecting this shell

- `MOB-026` (resolved) — four dead files (`message_dropdown.dart`, `profile_dropdown.dart`,
  `badge.dart`, `page_nav_wrapper.dart`); **resolved by deletion** in `b98fac8a`, see above.
