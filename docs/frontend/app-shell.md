# App shell (`v1/[lang]` chrome)

**Source:** [`src/views/v1/[lang]/`](../../next-js-boilerplate/src/views/v1/[lang]/) · **Mobile
equivalent:** [mobile/app-shell.md](../mobile/app-shell.md)

Infra, not a page — the header/sidebar/nav chrome every real page under
[`v1/[lang]/**`](./v1/README.md) renders inside. Mounted once by
[`v1/[lang]/layout.tsx`](../../next-js-boilerplate/src/app/v1/[lang]/layout.tsx), which does the
actual session gate (`getSessionUser()` → redirect to login if absent — see
[architecture.md](../architecture.md)) before handing off to `V1Shell`.

## Component tree

```
V1Shell                      (RealtimeProvider + skip-to-content link + layout frame)
├─ V1Header                  (toggle button, brand mark, lang/theme switches, auth-dependent right side)
│   ├─ MessageDropdown        (unread-DM bell, auto-pops on live arrival)
│   ├─ NotificationDropdown   (feed notification bell — not part of this inventory, see feed/notification docs)
│   └─ ProfileDropdown        (wraps the header avatar; desktop popover / mobile full-screen sheet)
├─ V1Sidebar                  (collapsible aside; mobile overlay, desktop push)
│   ├─ V1Nav                  (the actual link list)
│   └─ ProfileSection         (sidebar-footer account block, expand/collapse — a second, independent
│                              profile-menu implementation from ProfileDropdown, not the same component
│                              reused twice)
└─ children                   (the page, wrapped in <main>)
```

`PageNavWrapper` is **not** in this tree — it's a separate wrapper
([`v1/[lang]/layout.tsx`](../../next-js-boilerplate/src/app/v1/[lang]/layout.tsx) composes it around
`V1Shell`'s children independently) providing `PageNavigationProvider` + a `NavigationOverlay`
(in-flight-navigation progress indicator), unrelated to the header/sidebar/nav chrome itself.

## Files

| File | Role |
|---|---|
| [`V1Shell.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/V1Shell.tsx) | Top-level orchestrator. Owns `sidebarOpen` state, wires `useSidebarEscape`/`useSidebarDrag` (below), an edge-swipe-to-open gesture (`useEdgeSwipe`, touch only), and service-worker registration (`/sw.js`) for the SW-message → route-navigate bridge (`V1ShellSW.ts`). Wraps everything in `RealtimeProvider` — the WebSocket connection lives at this level, not per-page. |
| [`V1Header.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/V1Header.tsx) | Fixed top bar: sidebar-toggle button, brand mark (also opens the sidebar), `LangSwitcher`/`ThemeToggle`, then — while `useAuth()` is loading, a "loading" label; once resolved, either `MessageDropdown` + `NotificationDropdown` + `ProfileDropdown` (authenticated) or a sign-in link (not). |
| [`V1Nav.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/V1Nav.tsx) | The link list itself: Home, Feed, Share, Users, Chat Room, Messages, Find Friends, Friends, Premium, Settings, then the UI/Forms/Pages showcase entries and the Boom/Missing error-boundary demos, all prefixed `/v1/{lang}`. Entries flagged `auth: true` (`AUTH_REQUIRED_HREFS`) are hidden entirely for a logged-out visitor rather than shown-then-blocked. **Admin/Audit Log links are appended conditionally** (`isAdmin = user?.role === "ADMIN" \|\| user?.role === "SUPERADMIN"`, computed client-side from `useAuth()`) — see [v1/admin/page.md](./v1/admin/page.md#the-admin-role-gate-is-enforced-correctly-but-is-client-side-only-at-the-page-level) for how this same check recurs (and is independently re-verified) at the page level. |
| [`V1Sidebar.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/V1Sidebar.tsx) | The collapsible `<aside>` wrapping `V1Nav` + `ProfileSection` (or a sign-in button when logged out). `inert={!sidebarOpen}` when closed. Fixed overlay below `md:`, a width-animated static column above it. |
| [`ProfileDropdown.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/ProfileDropdown.tsx) | Wraps the header avatar. Desktop (`useBreakpoint("sm")`): an absolutely-positioned popover. Narrow viewports: a `createPortal`-rendered full-screen sheet. Both render the same `content` (name/email/tier badge, a settings link, sign-out). |
| [`ProfileSection.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/ProfileSection.tsx) | The sidebar-footer account block — a separate expand/collapse implementation (own `open` state, own `useClickOutside`) with the same two actions (settings link, sign-out) as `ProfileDropdown`, not a shared sub-component of it. |
| [`MessageDropdown.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/MessageDropdown.tsx) | Unread-conversation bell. Subscribes to the realtime `direct-message` event and **auto-opens itself for ~3s** when a DM arrives from a peer whose conversation isn't already the active page-claim — desktop only (mobile's variant is the same full-screen-portal pattern as `ProfileDropdown`, deliberately not force-opened uninvited). Reuses [Badge.tsx](../../next-js-boilerplate/src/views/v1/[lang]/Badge.tsx) for the unread-count pip. |
| [`Badge.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/Badge.tsx) | A tiny `count`-driven red pip (`null` when `count <= 0`), positioned absolutely by its caller. Used by `MessageDropdown`; the header's `NotificationDropdown` (feed notifications, documented separately) is a different component tree not covered here. |
| [`PageNavWrapper.tsx`](../../next-js-boilerplate/src/views/v1/[lang]/PageNavWrapper.tsx) | `PageNavigationProvider` + `NavigationOverlay` — an in-flight-navigation progress indicator. Composed directly in `v1/[lang]/layout.tsx`, not inside `V1Shell`'s own tree. |
| [`useV1Sidebar.ts`](../../next-js-boilerplate/src/views/v1/[lang]/useV1Sidebar.ts) | Two hooks: `useSidebarEscape` (Escape key closes + refocuses the toggle button) and `useSidebarDrag` (touch/mouse drag-to-close, delegating the actual math to `V1ShellDrag.ts`). |
| [`V1ShellDrag.ts`](../../next-js-boilerplate/src/views/v1/[lang]/V1ShellDrag.ts) | Pure drag-state helpers (`dragOnStart`/`dragOnMove`/`dragOnEnd`) — a >50px leftward drag closes the sidebar. No React/DOM dependency, easy to unit-test in isolation (kept separate from `useV1Sidebar.ts` for that reason). |
| [`V1ShellSW.ts`](../../next-js-boilerplate/src/views/v1/[lang]/V1ShellSW.ts) | One-line adapter: forwards a service-worker `message` event to `handleServiceWorkerMessage` (`src/lib/v1/touch-handlers.ts`), which presumably drives notification-click → route navigation. Not investigated further here (outside this vertical's scope — the shared `lib/v1/touch-handlers.ts` helper backs both drag and SW handling and isn't itself app-shell-specific). |

## The admin nav-link gate

`V1Nav.tsx` and [`v1/admin/page.md`](./v1/admin/page.md) independently compute the identical
`isAdmin` client-side check — the nav link and the page's own access gate are two separate call sites
of the same logic, not one shared source of truth, but they agree with each other. See
[CROSS-039](../issues.md#cross-039) for the cross-platform comparison of how strong this gate actually is.

## Known issues affecting this shell

None found specific to the frontend shell itself — see [mobile/app-shell.md](../mobile/app-shell.md)
for a significant mobile-side dead-code finding in the equivalent chrome.
