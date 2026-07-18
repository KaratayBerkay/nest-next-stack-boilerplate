# UI Updates — Comprehensive Design Audit

**Date:** 2026-07-18
**Scope:** Full codebase audit — components, views, CSS, i18n, a11y, architecture
**Priority order:** P0 (critical) → P1 (high) → P2 (medium) → P3 (low) → P4 (cosmetic/debt)

---

## P0 — Critical Fixes

### 1. Badge `pill` prop is a no-op

Both branches of the ternary return `"rounded-full"` — the non-pill variant should likely use `rounded-md`.

**File:** `src/components/ui/badge/badge.tsx:46`

```tsx
pill ? "rounded-full" : "rounded-full", // ← bug: identical
```

### 2. ConfirmDialog children prop type mismatch

`children` is called as a render-prop function (`children(() => setOpen(true))`) but `ConfirmDialogProps` defines `children: ReactNode` (not a function type). TypeScript won't catch callers passing regular JSX instead of a function — will throw at runtime.

**File:** `src/components/ui/confirm-dialog/confirm-dialog.tsx:35`
**File:** `src/types/ui/ConfirmDialog-types.ts` (missing function signature)

### 3. SkeletonLine dynamic class won't work at runtime

`width && \`w-[${width}]\`` — Tailwind v4's JIT compiler cannot detect arbitrary values only present at runtime; the class will never be generated.

**File:** `src/components/ui/skeleton-shapes.tsx:12`

### 4. Dialog animation keyframes break CSP

Animation keyframes injected via inline `<style>` tag inside the component violate `Content-Security-Policy: style-src 'nonce-...'`. Should be moved to `globals.css`.

**File:** `src/components/ui/dialog/dialog-content.tsx:90-127`

### 5. `userScalable: false` violates WCAG 1.4.4

Prevents pinch-zoom on mobile — a WCAG violation. Should be `maximumScale: 5` or removed.

**File:** `src/app/layout.tsx:40`

---

## P1 — High Priority

### Components

#### 1.1 Validation message bypass (5 components)

`InputWithIcon`, `FileInput`, `DateInput`, `DateTimeInput`, `AutoResizeTextarea` all accept an `error` prop but do not call `useFieldMessages()` — no rendered error/description text, no `aria-describedby` linking.

**Files:**
- `src/components/ui/input/input-with-icon.tsx`
- `src/components/ui/input/file-input.tsx`
- `src/components/ui/input/date-input.tsx`
- `src/components/ui/input/date-time-input.tsx`
- `src/components/ui/textarea/auto-resize-textarea.tsx`

#### 1.2 `pb-safe` class undefined

Used in `bottom-sheet.tsx` but not defined anywhere in the codebase.

**File:** `src/components/ui/bottom-sheet.tsx:8,16`

#### 1.3 Hardcoded Tailwind palette colors (~105 instances)

~98 instances in `src/views/` and ~7 in `src/components/` use raw palette colors (`bg-red-500`, `text-green-600`, `bg-blue-500`, etc.) instead of semantic tokens (`bg-error`, `text-success`, etc.).

**Notable offenders:**
- `src/views/messages/` — ~12 instances
- `src/views/chat-room/ChatRoomBaseView.tsx` — ~8 instances
- `src/views/settings/` — ~15 instances
- `src/views/admin/` — ~16 instances
- `src/views/find-friends/` — ~6 instances
- `src/components/feed/ReactionButtons.tsx:76` — raw hex `bg-[#1a1a2e]`

#### 1.4 Overlay scrims use `bg-black/*` instead of `bg-overlay/*`

6 scrims use hardcoded `bg-black/50` or `bg-black/30` instead of the semantic `bg-overlay/50` token.

**Files:**
- `src/views/messages/FreePageView.tsx:252`
- `src/views/chat-room/ChatRoomBaseView.tsx:389`
- `src/views/v1/[lang]/ProfileDropdown.tsx:88`
- `src/views/v1/[lang]/MessageDropdown.tsx:103`
- `src/views/v1/[lang]/V1Shell.tsx:165`
- `src/components/feed/NotificationDropdown.tsx:120`

#### 1.5 Contrast checker broken — `.style-*` vs `.theme-*` mismatch

The WCAG contrast checker script parses `.theme-*` blocks from globals.css, but the actual codebase uses `.style-*` class names. The checker will always find zero themes.

**File:** `.claude/skills/tailwind-theming/scripts/check-contrast.mjs:28`

#### 1.6 `DemoBadge.module.css` uses nonexistent CSS variable

`color: var(--color-brand-foreground)` — theme system defines `--brand-fg` / `--color-brand-fg`, not `--color-brand-foreground`.

**File:** `src/components/DemoBadge.module.css:12`

#### 1.7 Checkout Suspense missing fallback

`<Suspense>` with no `fallback` prop — renders nothing while loading.

**File:** `src/app/v1/[lang]/checkout/[tier]/page.tsx:13`

#### 1.8 Privacy settings form is completely non-functional

`handleSave` just shows a toast. Switches are local state only — nothing saved to server.

**File:** `src/views/settings/privacy/FreePageView.tsx:14-16`

### i18n

#### 1.9 V1Nav hardcoded English nav labels

5 nav items ("Feed", "Share", "Premium", "Admin", "Audit Log") are hardcoded inside `MessagesProvider` scope.

**File:** `src/views/v1/[lang]/V1Nav.tsx:46-74`
**Missing keys:** `v1-shell` namespace needs `navFeed`, `navShare`, `navPremium`, `navAdmin`, `navAuditLog`

#### 1.10 Admin and Audit Log pages fully hardcoded English

~35+ hardcoded English strings across the admin section (headings, placeholders, table headers, filter options, pagination text).

**Files:**
- `src/views/admin/PageContent.tsx`
- `src/views/admin/audit-logs/PageContent.tsx`

#### 1.11 No skip-to-content link (WCAG 2.4.1 violation)

Users navigating via keyboard must tab through the entire header, sidebar, and navigation before reaching main content.

---

## P2 — Medium Priority

### Components

#### 2.1 Unnecessary `"use client"` on pure presentational components

`BadgeButton`, `BadgeCount`, `AvatarGroup`, `ButtonGroup`, `DialogBody` — no hooks, state, or browser APIs. Could be server components.

#### 2.2 Components missing `font` customization props

`InputWithIcon`, `FileInput`, `DateInput`, `DateTimeInput`, `AutoResizeTextarea` — missing `fontSize`, `fontWeight`, `fontFamily` props that other form components support.

#### 2.3 Missing type definition files (per AGENTS.md)

8 components lack their own type files in `src/types/ui/`:
- `Carousel`, `Table`, `Collapsible`, `Breadcrumb`, `Pagination`, `AlertDialog`, `AspectRatio`, `NativeSelect`, `InputGroup`

#### 2.4 Unnecessary `cn()` calls returning empty strings

Dialog context and Popover context wrap content in `<div className={cn()}>` which renders an empty string.

**Files:**
- `src/components/ui/dialog/dialog.tsx:44`
- `src/components/ui/popover/popover.tsx:42`

#### 2.5 Dropdown is a 1:1 wrapper around Select

Can be consolidated — or deprecated in favor of `Select`.

**File:** `src/components/ui/dropdown/`

#### 2.6 Duplicate close-button SVG across 4+ components

The X icon SVG is repeated in dialog, sheet, file-upload, checkbox-chip. Should be extracted.

#### 2.7 Dialog, AlertDialog, and ConfirmDialog use different tech stacks

Dialog uses native `<dialog>`, AlertDialog uses Radix, ConfirmDialog wraps Dialog. Standardizing on one would reduce maintenance.

#### 2.8 AvatarGroup overflow `+N` hardcoded to `size-10`

Doesn't match the avatar size in the group — if avatars use `size="sm"` (size-8), the `+N` badge is still size-10.

**File:** `src/components/ui/avatar/avatar-group.tsx:24`

#### 2.9 CardHeader/Alert bypass sub-component hierarchy

`upper` and `header`/`title` props render styled text directly, bypassing `CardTitle`, `CardDescription`, `AlertTitle`, `AlertDescription`.

**Files:**
- `src/components/ui/card/card-header.tsx:10-11`
- `src/components/ui/alert/alert.tsx:44-45`

#### 2.10 `BadgeCount` always has `p-2.5` regardless of content

Unnecessary padding for small icons.

**File:** `src/components/ui/badge/badge-count.tsx:53`

### Views

#### 2.11 No `<h1>` in `v1/[lang]/` route pages

All child pages under `v1/[lang]/` use `<h2>` as the top-level heading, creating a heading hierarchy gap.

**Affected:** feed, share, find-friends, messages, notification, premium, users list

#### 2.12 No error boundaries on plans or settings sub-pages

**Missing:** `plans/error.tsx`, `settings/account/error.tsx`, `settings/billing/error.tsx`, `settings/general/error.tsx`, `settings/privacy/error.tsx`, `settings/sessions/error.tsx`

#### 2.13 No Suspense boundaries on plans and settings pages

Plans and settings pages render content directly without `<Suspense>`, even though they use `use(params)` and `useSuspenseQuery`.

**Files:**
- `src/app/v1/[lang]/plans/page.tsx:14`
- `src/app/v1/[lang]/settings/page.tsx:14`
- Settings sub-pages (account, billing, general, privacy, sessions)

#### 2.14 Hardcoded `/v1/en/share` link in feed empty state

Ignores current language — should use `/${lang}/share`.

**File:** `src/views/feed/FreeFeedList.tsx:224`, `MediumFeedList.tsx:224`

#### 2.15 `confirm()` dialog in API keys page

Blocks main thread and is unstyled. Should use `ConfirmDialog` component.

**File:** `src/views/settings/api-keys/PageContent.tsx:96`

#### 2.16 `select-none` on chat messages prevents text selection

Users can't copy message text.

**Files:**
- `src/views/chat-room/ChatRoomBaseView.tsx:503`
- `src/views/messages/ChatView.tsx:166`

#### 2.17 `router.back()` for navigation — unpredictable

If user navigated directly to a URL, `router.back()` may exit the app.

**Files:**
- `src/views/posts/[uuid]/PostDetailBaseView.tsx:106`
- `src/views/notification/FreePageView.tsx:125`

#### 2.18 Export/import inconsistency for tier views

Some use `export const BasicPageView = FreePageView` (named), others use `export { FreePageView as default }`. Import patterns differ accordingly.

### CSS & Theming

#### 2.19 `z-45` non-standard z-index value

Not in the default Tailwind z-index scale — breaks the implied layering contract.

**File:** `src/views/v1/[lang]/V1Sidebar.tsx:20`

#### 2.20 `.btn` and `.badge` classes contain unprocessed Tailwind utilities

`display: inline-flex items-center justify-center gap-2;` — Tailwind utilities mixed into raw CSS, not processed.

**File:** `src/app/globals.css:595,662`

#### 2.21 5 different easing curves across animation system

| Curve | Usage |
|---|---|
| `cubic-bezier(0.16, 1, 0.3, 1)` | Default transitions, dialog enter |
| `cubic-bezier(0.4, 0, 1, 1)` | Dialog exit, slide-out |
| `ease-out` | Checkbox, progress |
| `ease-in-out` | Sheet |
| `cubic-bezier(0.22, 1, 0.36, 1)` | Accordion (500ms — 2.5x default) |

#### 2.22 Button transition `duration-150` conflicts with global `200ms`

Button uses `transition-all duration-150` while the global default is `200ms`.

#### 2.23 Container query `@sm:` breakpoint undefined

No `@container`/`container-type` declared on parent elements of components using `@sm:`.

**Used in:** `card-header.tsx`, `card-content.tsx`, `card-footer.tsx`, `card-title.tsx`, `V1Shell.tsx`, `ui/layout.tsx`

### i18n

#### 2.24 CommentSection hardcoded English

4 strings ("Reply", "Send", "Cancel", "No comments yet.") hardcoded inside `MessagesProvider` scope.

**File:** `src/components/feed/CommentSection.tsx:216-239`

#### 2.25 NotificationDropdown hardcoded English

"Notifications" heading and `aria-label="Close"` hardcoded.

**File:** `src/components/feed/NotificationDropdown.tsx:126,130`

#### 2.26 LangSwitcher `aria-label` hardcoded

`aria-label="Switch language"` — not translated.

**File:** `src/components/layout/LangSwitcher.tsx:69`

### Accessibility

#### 2.27 25+ `aria-label` values hardcoded in English

Throughout UI components (pagination, carousel, counter, file-upload, date-picker, dialog close, tooltip close, breadcrumb, progress, input-otp, etc.)

#### 2.28 No `aria-live` on dynamic content area

`v1/[lang]/layout.tsx` content area has no `aria-live` region — screen readers won't announce async content loading.

**File:** `src/app/v1/[lang]/layout.tsx:24-31`

#### 2.29 Sidebar has no `Escape` key handler for keyboard dismissal

Touch/mouse event listeners exist but no keyboard handler.

**File:** `src/views/v1/[lang]/V1Shell.tsx:106-132`

#### 2.30 `<aside>` on V1Sidebar has no `aria-label`

Screen readers announce generically as "complementary region".

**File:** `src/views/v1/[lang]/V1Sidebar.tsx:16-27`

#### 2.31 Admin audit-logs filter controls lack `<label>` or `aria-label`

`<select>` and `<Input>` filters have no accessible labels.

**File:** `src/views/admin/audit-logs/PageContent.tsx:95,124,147`

#### 2.32 ProfileSection and MessageDropdown icon buttons missing aria labels

Toggle buttons for profile settings and messages dropdown lack accessible names.

**Files:**
- `src/views/v1/[lang]/ProfileSection.tsx:20-48`
- `src/components/feed/NotificationDropdown.tsx:81-87`

#### 2.33 Feed, settings, admin loading states lack `role="alert"` or `aria-live"

Screen readers won't announce status changes.

**Files:**
- `src/views/feed/FreeFeedList.tsx:246`
- `src/views/settings/api-keys/PageContent.tsx:280`
- `src/views/admin/PageContent.tsx:65-75`

---

## P3 — Low Priority

### Components

- Duplicate outside-click/keyboard handling in PopoverContent, DropdownMenuContent, SelectContent — extract to shared `useOverlay` hook
- Duplicate chevron SVGs across date-input, select-trigger, combobox, navigation-menu
- SelectItem hidden input doesn't update value on selection change
- SelectItem disabled click leaks through via parent click handlers (`select-item.tsx:33-38`)
- Orphaned type files: `ExampleTabs-types.ts`, `PopupAlert-types.ts`, `VariantGallery-types.ts`, `UILayout-types.ts`
- Carousel missing `useCarousel` from barrel export (`src/components/ui/index.ts`)
- `fallow-ignore` comments in index.ts files — dead if `fallow` plugin not configured

### Views

- Back button behavior inconsistency: `router.back()` vs explicit `<Link>` paths
- Messages `sessionStorage` for tab state instead of URL params — no deep linking
- Chat room URL param + local state desync
- UI demo pages named export inconsistency (`Page` vs `ButtonPage` vs `EmptyPage`)
- Static `metadata` on most pages instead of `generateMetadata` (can't do i18n metadata)
- Hardcoded `$` sign in premium page stats — should use `formatPrice`
- Messages empty state hidden on mobile (`max-md:hidden`) — mobile users get blank space
- Silent catch blocks in feed load-more and message read-marking
- Mock data in users list/detail pages — not real API data

### CSS

- `--comp-*` tokens defined in 4 of 6 themes but never consumed — vestigial
- `.style-default` empty class block
- `.container-responsive` class in globals.css — never used
- `.typography-*` 10 classes defined but never used
- Full Tailwind spacing/radius/font-weight/container scales redefined unnecessarily (~65 lines)
- Duplicate `containerClasses` in `src/constants/site.ts` and `src/lib/container.ts`
- `body` font-family hardcodes unused fallback (Geist always resolves)
- `theme-init.js` duplicates cookie-reading logic from `useTheme.tsx`
- `DARK_THEMES` constant referenced in SKILL.md but doesn't exist in code

### i18n

- `/v1/en/ui/` demo pages cast `lang as Lang` without validation — type lie
- Interpolation params (`{count}`, `{email}`) not captured in generated types — developer must manually validate

### Accessibility

- Alert title uses `<h5>` — unconventional
- Instructional swipe image in `NavigationOverlay.tsx` has `alt=""` — should describe the gesture
- `ImageUpload` uses raw filenames as alt text (e.g. `"IMG_20230101_123456.jpg"`)
- Empty states lack icons across sessions, api-keys, billing-history, find-friends
- Heading level jumps: `<h2>` → `<h4>` in audit-logs (missing `<h3>`)

---

## P4 — Technical Debt / Cosmetic

- `resolvedContainerClass` dead code in V1Shell (`src/views/v1/[lang]/V1Shell.tsx:55`)
- `PremiumPageView` heading rendered outside tier view — inconsistent with other pages
- Raw `<button>` elements in find-friends and checkout instead of `Button` component
- `native-select` UI demo exists alongside raw `<select>` elements in settings
- `ErrorBoundary` usage inconsistent — some views wrap, others don't
- `PageInfoButton` conditional `showPageInfo` prop pattern inconsistent
- Demo pages (`(demos)/`) may stay English — but should be catalogued

---

## Quick Wins (Can Fix in <30 min Each)

1. **Badge pill prop** — change non-pill to `rounded-md`
2. **`cn()` calls** — remove empty `<div className={cn()}>` wrappers
3. **`pb-safe`** — define utility in globals.css or use `pb-[env(safe-area-inset-bottom)]`
4. **Dialog `<style>` → globals.css** — move keyframes to existing `@keyframes` section
5. **Contrast checker regex** — update to match `.style-*` instead of `.theme-*`
6. **`userScalable: false`** → `maximumScale: 5`
7. **`DemoBadge.module.css`** — fix variable name to `--color-brand-fg`
8. **Hardcoded `/v1/en/share`** → `/${lang}/share`
9. **`select-none` on chat** — remove to allow text selection
10. **`z-45` → `z-50`** to match overlay convention

---

## Affected File Count Summary

| Category | Files |
|---|---|
| UI components with bugs | ~15 |
| Views with hardcoded colors | ~30+ |
| Views with i18n gaps | ~10 |
| Views missing metadata/error/Suspense | ~15 |
| Accessibility issues | ~20+ |
| CSS/style files | ~8 |
| Configuration/skill files | ~3 |
| **Total** | **~80+ unique files** |
