# UI component library analysis — what's missing, what to enhance

> Written 2026-07-16. Scope: `next-js-boilerplate/src/components/ui/` (60
> component folders + shared partials/style maps) and
> `next-js-boilerplate/src/views/ui/` (57 demo pages + `_shared`
> scaffolding). Method: full inventory of folders, the central barrel,
> all 85 `src/types/ui/*-types.ts` files (complete API surface), and
> line-by-line reads of the hand-rolled interaction machinery
> (dropdown-menu, select, popover, tooltip, toast, tabs, dialog, command,
> combobox, carousel, pagination, table, input-otp, drawer, breadcrumb,
> input/button + style maps). This is an **analysis doc**, not a tracker —
> when a work phase is green-lit, convert the chosen sections into a
> `ui-upgrade-5.md` tracker with per-item gates, per the house convention.
>
> Position relative to ui-upgrade-4 (closed 2026-07-14, commit `aaeba2a`):
> that phase fixed theme integrity, broken demos, empty tabs, page
> redesigns, and landed the 57-page e2e smoke + axe walk. Its deliberate
> leftovers — T4 visual eyeball matrix, P15/P20 re-shoots, full-auth e2e
> in CI — are **not** restated here. This doc is about the component
> library itself: API completeness, behavioral gaps, and what a consumer
> of the boilerplate would miss first.

---

## 1. Snapshot — what exists and is genuinely solid

- **60 component folders**, uniform anatomy (impl folder + `index.ts`,
  PascalCase shim, types in `src/types/ui/`, demo page, central barrel),
  plus shared partials `bottom-sheet.tsx`, `field-messages.tsx`,
  `skeleton-shapes.tsx` and shared style maps `button-styles.ts`,
  `input-styles.ts`, `menu-item-styles.ts`, `global-style-variants.ts`.
- **Dependency posture is deliberate and lean**: 15 Radix primitives
  (accordion, alert-dialog, aspect-ratio, collapsible, context-menu,
  hover-card, menubar, navigation-menu, progress, radio-group,
  scroll-area, slider, toggle, toggle-group + dialog for sheet), embla
  (carousel), vaul (drawer), react-day-picker v10 (calendar),
  react-resizable-panels (resizable). Everything else — dialog (native
  `<dialog>`), select, dropdown-menu, popover, tooltip, tabs, toast,
  command, combobox, switch, checkbox, pagination, table, input-otp — is
  hand-rolled. No shadcn, no cva, no cmdk, no sonner.
- **Theme system**: 4 themes × 5 global component styles, token-only
  styling, `useComponentVariant` consumed by 44 component files (46
  consumers) with recorded exemption headers on separator, spinner,
  aspect-ratio. Contrast checker `--strict` green and in CI.
- **Mobile adaptation pattern**: popover/select/dropdown-menu render as a
  shared bottom sheet below the `sm` breakpoint — a genuinely nice
  library-wide behavior most boilerplates don't have.
- **A11y groundwork** from ui-upgrade-4's axe sweep: labeled controls,
  roving tabindex tabs, sr-only OTP input (single real input → native
  paste works), toast pause-on-hover/focus + `role=alert|status`,
  `motion-reduce` on the 8 most animated components, e2e
  `ui-smoke.spec.ts` + `ui-a11y.spec.ts` walking all 57 pages.
- **Well-executed details worth keeping as exemplars**: Button's
  width-stable `loading` overlay; dialog on native `showModal()` (free
  focus trap + `cancel` handling); InputOTP's sr-only-input + decorative
  boxes design; Select's hidden form input + typeahead; toast's
  pause/resume timer bookkeeping.

**Tests**: 15 test files inside `components/ui` (158 unit tests
repo-wide), concentrated on accordion, button, calendar, checkbox,
counter, date-picker, dialog, dropdown-item, field-messages, file-upload,
popover positioning, sheet, toast.

---

## 2. Part A — correctness & consistency debt (do first, mostly small)

These are defects or drift, not features. Each is verified against the
code as of today.

### A1 — `"use client"` missing on 10 variant-hook consumers (footgun)

`useComponentVariant` reads theme context (client-only), but these files
lack the directive and rely on being imported from client trees:

```
skeleton/skeleton.tsx   breadcrumb/breadcrumb.tsx  kbd/kbd.tsx
textarea/textarea.tsx   pagination/pagination.tsx  card/card.tsx
button/icon-button.tsx  button/button.tsx          badge/badge.tsx
input/input.tsx
```

Today every import path happens to be inside `"use client"` PageContents,
so nothing crashes — but the first server component that renders
`<Button>` or `<Card>` gets a runtime "attempted to call a client hook
from the server" error, and these are exactly the primitives most likely
to be used in a server page. Fix: add the directive to all 10 (or
restructure the hook — see C6). Gate:
`for f in $(grep -rl useComponentVariant src/components/ui --include='*.tsx' | grep -v test); do head -1 $f | grep -q 'use client' || echo $f; done` → empty.

### A2 — Typography is implemented twice with drift potential

`src/components/ui/Typography.tsx` (139 lines) is a **full
implementation** (the `Typography` component + `H1…Quote` helpers) — it
was supposed to be a one-line PascalCase shim. `typography/typography.tsx`
holds a second, currently-identical copy of `H1…Quote` *without* the
`Typography` component, and the central barrel imports `Typography` from
the root file but `H1…Quote` from the folder. Any restyle applied to one
copy silently misses the other. Fix: move the full implementation into
`typography/`, reduce root `Typography.tsx` to a real shim, keep barrel
exports stable.

### A3 — 14 duplicated/orphaned types files with definition drift

Both a consolidated per-component types file and older standalone files
exist, with **diverging definitions**, and component files import from a
mix of both:

| Consolidated file | Redundant standalone file(s) | Observed drift |
|---|---|---|
| `Avatar-types.ts` | `AvatarGroup-types.ts` | one has `max?: number`, the other extends div + font trio |
| `Checkbox-types.ts` | `CheckboxGroup-types.ts`, `IndeterminateCheckbox-types.ts` | font trio + `size` only in consolidated version |
| `Dialog-types.ts` | `DialogContent-types.ts` | standalone lacks `variant`/`size` |
| `Command-types.ts` | `CommandItem-types.ts` | duplicated verbatim |
| `Select-types.ts` | `SelectContent-types.ts`, `SelectItem-types.ts`, `SelectValue-types.ts` | duplicated |
| `Tooltip-types.ts` | `TooltipContent-types.ts`, `TooltipTrigger-types.ts` | content props differ (`variant`, base element) |
| `Skeleton-types.ts` | `SkeletonCard/Line/Message/ChatMessage/ConversationSidebar/FeedList-types.ts` | `width` prop only in standalone `SkeletonLine` |
| `DropdownMenu-types.ts` | `DropdownMenuItem-types.ts` | `dropdown-menu-item.tsx` imports the standalone one |

Fix: one types file per component, rewrite imports, delete the rest.
Gate: `ls src/types/ui | wc -l` drops by ~14; typecheck green.

### A4 — central barrel is incomplete

`components/ui/index.ts` omits `FileUpload`, `ImageUpload`,
`LogoSpinner`, `CheckboxCard`, `CheckboxChip` (all exist, all have folder
barrels, all consumed via PascalCase shims today). Add them; the barrel
is supposed to be the canonical surface.

### A5 — Combobox has three real defects

`combobox/combobox.tsx`:
1. Trigger `<button>` has **no `type="button"`** → inside any `<form>` it
   submits on click (every other hand-rolled trigger sets it).
2. **No outside-click dismissal** — Select/Popover/Dropdown all close on
   outside pointer-down; Combobox stays open until you click the trigger
   again (and there's no Escape handling on the trigger either).
3. **Not portaled** — the listbox renders `absolute` in place, so it
   clips inside any `overflow-hidden` ancestor and stacks under later
   siblings; inconsistent with Select/Dropdown which portal to body.

Plus missing ARIA: trigger needs `role="combobox"`, `aria-expanded`,
`aria-haspopup="listbox"`; and there's no `disabled` prop.

### A6 — Select: disabled options are invisible to styling and keyboard nav

`select-item.tsx` renders a native `<button>`; the `disabled` attribute
passes through, but `menuItemStyles` only styles `data-[disabled]` (never
set here), so disabled options **don't look disabled**, and
`select-content.tsx` keyboard nav queries `[role="option"]` without
excluding them — `.focus()` on a disabled button is a no-op, so arrowing
lands on dead positions. Also `labelMap` only captures **string**
children; a `<SelectItem>` with JSX children displays an empty trigger
value. Fix: set `data-disabled`, filter nav targets, and fall back to
`textContent` for labels.

### A7 — three positioning engines, three different behaviors

The same anchored-overlay logic is hand-rolled three times with unequal
feature sets:

| | reposition on scroll/resize | vertical collision flip | horizontal clamp | typeahead |
|---|---|---|---|---|
| `popover-content.tsx` | ✓ | ✓ | ✓ | — |
| `select-content.tsx` | ✓ | ✗ (always opens down, `max-h-60`) | ✗ | ✓ |
| `dropdown-menu-content.tsx` | ✗ (position frozen at open) | ✗ | ✗ | ✗ |

A dropdown near the viewport bottom/right edge renders off-screen; a
dropdown open during scroll detaches from its trigger. Fix: extract one
`useAnchoredPosition` hook (popover's logic is the best seed) + one
`useDismissableLayer` (outside-click + Escape; note `useClickOutside`
already exists in `src/hooks/` and none of the three use it). This single
item fixes A5.2/A5.3 and the dropdown defects, and is a prerequisite for
`side`/`align` props (B-series). `popover-positioning.test.ts` already
exists as the seed test file.

### A8 — untyped `variant?: string` escapes the type system

`Counter`, `CheckboxCard`, `CheckboxChip` (in types), plus inline
`{ variant?: string }` on `PaginationLink`, `BreadcrumbList`,
`CarouselPrevious/Next`, `DrawerContent`, `DropdownMenuContent`,
`PopoverContent`, `TooltipContent`. Typos silently fall back to
`variants.default`. Fix: export a proper union per component
(`keyof typeof variants` pattern already used by button-styles).

### A9 — V0 focus spec vs reality: `ring-offset` exists in exactly 1 file

The design language says solid controls get `focus-visible:ring-2
ring-brand` **plus `ring-offset-1 ring-offset-bg`**; a grep finds
`ring-offset` in one ui file. Decide: either roll the offset out to solid
controls (button, icon-button, switch, checkbox, toggle…) or amend the
spec text in `.claude/skills/ui-components/SKILL.md`. Today the docs
promise something the library doesn't do.

### A10 — hardcoded English strings in components (app ships en + tr)

Two flavors:
- **Visible text that props can't change**: Pagination's
  `Previous`/`Next` (children are hardcoded after the props spread, so
  consumer children are ignored), Combobox's `"Search..."` /
  `"No results"` empty state, ConfirmDialog's `"Delete"`/`"Cancel"`
  defaults (these at least are props).
- **~19 `aria-label` defaults** (`"Close"`, `"Scroll to bottom"`,
  `"One-time code"`, `"Previous month"`, …) — overridable via spread in
  most files, but Turkish screen-reader users get English today.

Fix pattern: accept optional label props with English defaults
(`previousLabel`, `nextLabel`, `emptyMessage`, `labels={{...}}`) — no
i18n runtime in the library, just overridability. Then thread `tr`
strings through app-level usage.

### A11 — status-variant vocabulary drift across Alert / Badge / Toast

- `Alert`: `default | destructive | success | warning` — **no `info`**
  despite the `info` token existing.
- `Badge`: `default | secondary | outline | destructive | success |
  warning | error | info | soft | dot | pill` — has **both** `destructive`
  and `error`, and mixes *status* with *shape* (`dot`, `pill`) in one
  enum (shape should be an orthogonal prop).
- `Toast`: `default | destructive | success` — no `warning`/`info`.

Fix: standardize on `info | success | warning | error` everywhere
(keep `destructive` as an alias where it's public API), add the missing
entries, split Badge shape from Badge status.

---

## 3. Part B — feature gaps in existing components

Ordered by how quickly a real app hits the wall. S/M/L = effort.

### B1 — Tabs: no controlled mode (S, unblocks URL-synced tabs)
`Tabs` accepts only `defaultValue`; internal state is unreachable. Add
`value?` + `onValueChange?` (keep uncontrolled path), and optionally
`keepMounted` on `TabsContent` (today inactive panels unmount, losing
form state typed into a tab). The keyboard/roving-tabindex work is
already done and unaffected.

### B2 — Toast: no update/promise flow, no warning/info, unbounded queue (M)
The reducer knows only `ADD`/`DISMISS`. Add:
- `UPDATE` action → `toast.update(id, opts)` and
  `toast.promise(p, {loading, success, error})` — the async-mutation
  pattern every dashboard needs;
- `warning`/`info` variants (recipes already exist as soft-tint classes);
- a viewport cap (e.g. max 3 visible, queue the rest) and a
  `position` prop on `ToastViewport`.

### B3 — DropdownMenu: submenus, check/radio items, shortcuts (L)
The menu is a flat list of `menuitem`s. Missing vs any mature menu:
`DropdownMenuSub` (+ trigger/content), `DropdownMenuCheckboxItem`,
`DropdownMenuRadioGroup/RadioItem`, a `DropdownMenuShortcut` slot (Kbd
exists — compose it), `align`/`side`/`sideOffset` props, typeahead +
Home/End (Select already has both — port it), `aria-labelledby` linking
content to trigger. Do after A7 so positioning comes free. The same item
templates should then be reused by context-menu and menubar (Radix-backed,
so there it's mostly re-exporting `Sub`/`CheckboxItem`/`RadioItem` parts
that are currently just not wrapped).

### B4 — Select: groups, sizes, open-with-arrow (M)
Missing `SelectGroup`/`SelectLabel` parts; no `size` prop (trigger
hardcodes `h-9` while `inputSizes` sm/md/lg sit unused — same map should
drive it); trigger doesn't open on `ArrowDown`/`ArrowUp` (native select
muscle memory); no `disabled` visual story (A6). Multi-select is
deliberately *not* proposed here — that's the MultiSelect component (D2).

### B5 — Input family: expose the size system that already exists (S)
`input-styles.ts` ships `inputSizes = {sm, md, lg}` but `input.tsx`
hardcodes `inputSizes.md` and `InputProps` has no `size`. Add
`size?: "sm" | "md" | "lg"` to Input, Textarea, NativeSelect,
SelectTrigger, Combobox trigger, DatePicker/TimeInput triggers — one
prop, one existing map, large consistency payoff (Button/Checkbox/Switch/
Toggle/Badge/Avatar/Spinner already have sizes).

### B6 — form-control parity for error/description (S–M)
`error`/`description` (FieldMessages wiring) exist on Input, Textarea,
SelectTrigger, Combobox, DatePicker, TimeInput, InputOTP, FileInput — but
**not** on Checkbox/CheckboxGroup, RadioGroup, Switch, Slider,
NativeSelect. Forms need "you must accept the terms" under a checkbox as
often as under an input. Reuse `useFieldMessages`; group-level for
CheckboxGroup/RadioGroup.

### B7 — ConfirmDialog: pending state + error path (S)
`onConfirm` may be async but the confirm button shows nothing and stays
clickable (double-fire), and a thrown error leaves the dialog open with
an unhandled rejection. Add internal `pending` (Button already has
`loading`), disable both buttons while pending, close on success, keep
open + surface message on error. Also make the confirm variant/tone
configurable (it's hardcoded destructive; "Publish?" shouldn't be red).

### B8 — Carousel: a11y + indicators + autoplay (M)
Nav buttons render only an SVG — **no accessible name** (add
`aria-label="Previous slide"/"Next slide"`, overridable per A10); the
region lacks `role="region" aria-roledescription="carousel"` and items
lack `aria-roledescription="slide"`. Feature-wise: dot indicators +
`scrollTo(index)` (embla exposes it; context only exposes prev/next
today), and opt-in autoplay with pause-on-hover/reduced-motion respect.

### B9 — Pagination: a `usePagination` brain (S)
Parts are markup-only; every consumer must hand-roll the "1 … 4 5 6 … 20"
window math. Ship `usePagination({page, count, siblings})` returning the
item model, plus a `PaginationButton` (or `as` prop) — current
`PaginationLink` is an `<a>`, which demos then use with `onClick` and no
`href` (keyboard-unfocusable). Make Previous/Next text overridable (A10).

### B10 — Calendar/DatePicker: range + multiple selection (M)
`react-day-picker` v10 supports `mode="range" | "multiple"` natively;
Calendar's props type already passes `ComponentProps<typeof DayPicker>`
through, but DatePicker's public API is single-`Date` only. Add
`DateRangePicker` (or `mode` prop) with two-month layout — check-in/out
and report-period pickers are the most-requested date UI after single
date. Document `disabled`/`hidden` matcher pass-through on the demo page.

### B11 — Dialog/Drawer/Popover polish (S each)
- Dialog: `dismissible={false}` mode (block backdrop-click + Escape for
  must-decide flows); a scroll-lock/`max-h` + `overflow-y-auto` recipe on
  `DialogBody` for long content.
- Drawer: expose vaul's `direction` — `DrawerContent` hardcodes
  bottom-sheet styling (`inset-x-0 bottom-0 rounded-t-2xl`); side drawers
  currently require Sheet even when swipe-to-dismiss is wanted.
- Popover: `side` prop + focus containment (today Tab walks out of the
  portaled popover into the page with it still open; either trap focus or
  close on focus-out — `role="dialog"` implies the former).

### B12 — Command: filter quality + ⌘K surface (M)
Filtering is `value.includes(substring)` only — no match on separate
`keywords`, no ranking (prefix > word-start > substring), no
per-item `filter` opt-out. Add a `CommandDialog` wrapper (Dialog +
Command + global hotkey listener) so the boilerplate has a working ⌘K
palette out of the box, plus `CommandSeparator` and a shortcut slot on
`CommandItem` reusing Kbd.

### B13 — smaller singles (S each)
- **Slider**: `marks`/tick labels + optional value tooltip on the thumb
  (Radix `orientation`/range already pass through — demo them).
- **InputOTP**: `pattern` prop for alphanumeric codes (numeric is
  hardcoded); grouped rendering with separator ("123 - 456") — the
  `InputOTPGroup` export exists but the boxes ignore grouping.
- **Table**: `stickyHeader` option, a `TableHead sortable` part
  (aria-sort + indicator), and empty/loading-slot conventions — the
  stepping stone to D1 DataTable.
- **Progress**: circular variant (SVG ring, reuses `value`/indeterminate
  API) — spinners can't show determinate progress today.
- **Avatar**: extend `status` beyond `online|away` (`busy`, `offline`),
  map to tokens not palette colors.
- **ScrollArea**: `scrollHideDelay`/always-visible option — with the
  app-wide native-scrollbar hiding, ScrollArea is the *only* affordance
  users get; make its thumb behavior tunable.
- **NavigationMenu**: viewport-style animated indicator is absent (fine),
  but at minimum document composing it with Next `Link` via `asChild` on
  `NavigationMenuLink` — currently plain `<a>` props only.

---

## 4. Part D — missing components (what we don't have at all)

Judged against what this boilerplate's own app surface (dashboard: users,
posts, invoices, chat, settings, auth) reaches for first. Tier 1 =
build; Tier 2 = build if appetite; listed non-goals are deliberate.

### Tier 1

| # | Component | Why here, not later |
|---|---|---|
| D1 | **DataTable** (on top of Table: column defs, client sort, row selection via IndeterminateCheckbox, empty/loading/skeleton slots, pagination hookup) | Every list page (users, invoices, posts) re-implements this today. No new dep needed at client-side scale; keep server-driven sort/filter as props, not TanStack Table. |
| D2 | **MultiSelect** (checkbox listbox in the Select/anchored-layer shell, chips or "+N" summary in trigger) | Tag/role/filter pickers; CheckboxChip already covers the chip visual. |
| D3 | **Field / Form binding** for TanStack Form (`Field` wrapper: Label + control slot + FieldMessages with ids wired; adapter helpers mapping field state → `error`) | `@tanstack/react-form` is already a dep and the signup flow uses it raw; every form re-wires label/error/aria by hand. This is the highest-leverage DX gap in the library. |
| D4 | **Stepper / Wizard** (numbered steps, states: complete/current/upcoming/error; horizontal + vertical; controlled index) | Onboarding, checkout, multi-step forms — nothing covers it, and it's pure markup + tokens. |
| D5 | **TagInput** (free-text chips: type + Enter/comma, Backspace deletes, paste-splits, max/validate hooks) | Distinct from CheckboxChip (predefined options); needed for emails-to-invite, labels, keywords. |
| D6 | **CopyButton** (IconButton + clipboard + copied-state swap + optional Tooltip) | API-key/token/code surfaces everywhere in a boilerplate; 40 lines, disproportionate polish value. |
| D7 | **Rating** (radiogroup semantics, half-step display mode, readonly display variant) | Product/feedback UIs; small, self-contained. |
| D8 | **CommandDialog / ⌘K** | Counted under B12 — listed here so the roster is honest about it being a missing *surface*, not just a feature. |

### Tier 2

- **Timeline** (activity feeds / audit logs — invoices and posts both
  want it), **Banner** (page-level dismissible announcement distinct from
  inline Alert), **Stat** (KPI tile: label/value/delta, composes Card),
  **TreeView** (only if a file/hierarchy UI lands — non-trivial a11y),
  **CodeBlock** (pre + CopyButton + line numbers; no highlighter dep —
  Typography `Code` is inline-only), **AnchorNav/Scrollspy** (long
  settings/docs pages), **Lightbox** (image-upload previews currently
  have nowhere to zoom), **ScrollToTopButton** (mirror of the existing
  scroll-to-bottom), **AvatarStack input** — already covered by
  AvatarGroup ✓.

### Deliberate non-goals (record the "why" so it isn't re-litigated)

- **Charts** — needs a runtime dep (recharts/visx) against the "no new
  runtime dependencies" constraint; revisit only with a real dashboard
  requirement, then via the dataviz skill.
- **Rich text editor, phone input, color picker** — heavy, low reuse in
  this app's surface.
- **Virtualized list** — needs a dep; nothing in the app renders
   10k-row lists yet.
- **Sidebar/AppShell as a ui component** — `V1Sidebar` view + layout
  already own this app-specifically; generalizing it is a views refactor,
  not a ui-library gap.

---

## 5. Part C — cross-cutting enhancements

- **C1 — shared anchored-layer engine** (from A7): `useAnchoredPosition`
  + `useDismissableLayer` in `src/hooks/`, adopted by popover, select,
  dropdown-menu, combobox (and future MultiSelect/CommandDialog). Kill
  the three divergent copies; unit-test the position math where
  `popover-positioning.test.ts` already lives.
- **C2 — reduced-motion audit**: `motion-reduce` exists in 8 component
  files + globals; sweep the remaining animated surfaces (accordion/
  collapsible chevrons + content, carousel scroll, drawer/sheet slide,
  bottom-sheet `animate-slide-in-up`, popover `animate-scale-in`, toast
  slide) and add `motion-reduce:animate-none`/`transition-none` where
  missing.
- **C3 — interactive-state uniformity gate**: one grep-able base
  (focus ring ± offset per A9, `disabled:opacity-50
  disabled:pointer-events-none`, press feedback) asserted across
  controls; today Button has `active:translate-y-px` but e.g. Toggle/
  SelectTrigger don't — pick the rule, enforce with a canary test like
  the dialog/sheet className canaries from ui-upgrade-4.
- **C4 — string overridability** (from A10) as a library convention:
  every built-in human-readable string is a prop with an English default;
  demo pages show a Turkish example so the pattern stays exercised.
- **C5 — RTL groundwork (low)**: en+tr are both LTR, so this is
  future-proofing only — prefer logical utilities (`ms-*/me-*`,
  `start-*/end-*`) in *new* code (native-select already does one `rtl:`
  override); no sweep of existing code yet.
- **C6 — document the client-boundary reality**: any component consuming
  `useComponentVariant` is client-only by construction. After A1, add a
  short section to the ui-components SKILL.md stating it, so "components
  are server-rendered by default" stops overpromising; longer-term
  option (only if server rendering of primitives becomes a need): resolve
  the global style to a CSS class on `<html>` (it already lands there via
  ThemeProvider) and let components read it with CSS instead of context.
- **C7 — unit-test debt targeting behavior just added/fixed**: combobox
  (dismissal, type="button", ARIA), select (disabled-skip nav, JSX-label
  fallback), tabs (controlled mode), toast (update/promise, cap),
  dropdown (collision reposition), pagination hook math, confirm-dialog
  pending. Aim: every A/B item above lands with its test, mirroring the
  C1 pattern from ui-upgrade-4.
- **C8 — SKILL.md sync**: the ui-components skill's roster paragraph
  (44 files) and the `useComponentVariant` consumer count drift with
  every phase; regenerate the roster from the gate grep during closeout,
  and add the A-series footguns (type="button" on hand-rolled triggers,
  `data-disabled` convention) to the skill checklist.

---

## 6. Demo & documentation enhancements (views/ui)

- **VariantGallery coverage is 21/57 pages**; several variant-bearing
  components (e.g. toggle, kbd, textarea sizes-after-B5) render examples
  but no matrix. Extend the gallery to every component with a variant or
  size axis — it's also what the e2e style-switcher walk keys off.
- **Add an "API" tab convention to ExampleTabs pages**: a small props
  table (name/type/default) per component, sourced by hand from the types
  file. The types are the single source of truth; today a consumer must
  open the source to learn `DialogContent size` exists. Cheap and
  compounding — do it as new/changed components land (B/D items), not as
  a big-bang backfill.
- **Keyboard-interaction legend** on pages with nontrivial keyboard
  behavior (select, dropdown, tabs, command, otp, slider): a small
  Kbd-composed table — doubles as the manual-QA checklist for T4-style
  passes.
- **Fold demo learnings back into tests**: the ui-upgrade-4 e2e walk
  found real defects; keep `ui-smoke`/`ui-a11y` in the gate list for
  every Part B/D item (new pages must join the 57-page roster —
  DataTable, Stepper, TagInput, etc. each add a page).

---

## 7. Suggested phasing (for the future ui-upgrade-5 tracker)

Per the "finish all components first" directive: complete and harden the
existing library before growing it.

1. **Phase A — debt closeout** (items A1–A11; ~all S, two M):
   mechanical, each with a grep/test gate; ends with types consolidated,
   barrel complete, directives present, combobox/select defects fixed.
2. **Phase B — behavior completion** (B1–B13, C1–C4): C1 first (it
   unblocks B3/B4/B11/B12 and finishes A7), then per-component features,
   each landing with its C7 test and demo-page update.
3. **Phase C — new components tier 1** (D1–D8): one folder each,
   full house anatomy (types, shim, barrel, demo page joins e2e roster,
   test); D3 (Field/TanStack) first — it makes every subsequent form
   demo cleaner; then D1 DataTable.
4. **Phase D — docs/demos polish + tier 2 by appetite** (section 6,
   C8 skill sync, tier-2 picks).

**Standing gates for every item** (unchanged house style):
`pnpm lint && pnpm typecheck && pnpm test` in `next-js-boilerplate/`,
contrast `--strict` exit 0, `e2e/ui-smoke.spec.ts` + `e2e/ui-a11y.spec.ts`
green over the page roster, all four themes for anything touching
tokens/overlays, plus the item's own named grep/behavior gate. Demo copy
stays English; no visible scrollbars; token-only styling; no new runtime
deps (Tier-1 components above are all dep-free by design).

---

## 8. Evidence appendix (verification anchors)

- `use client` gap list: grep run 2026-07-16 (A1 block above) — 10 files.
- Typography duplication: `diff` of `components/ui/Typography.tsx` vs
  `components/ui/typography/typography.tsx` → folder file = tail subset
  (H1…Quote) of root file; barrel imports split across both.
- Types duplication: `ls src/types/ui` (85 files) cross-checked against
  imports in component files (e.g. `dialog-content.tsx` →
  `Dialog-types`, `dropdown-menu-item.tsx` → `DropdownMenuItem-types`).
- Combobox defects: `combobox/combobox.tsx` — trigger `<button` without
  `type`, no outside-click effect present, listbox `absolute z-50`
  (no portal).
- Select disabled/label issues: `select-item.tsx` (`text` =
  `typeof children === "string" ? children : ""`), `select-content.tsx`
  (`querySelectorAll('[role="option"]')` unfiltered).
- Positioning matrix: `popover-content.tsx` (flip + clamp + scroll),
  `select-content.tsx` (scroll only), `dropdown-menu-content.tsx`
  (position set once on open; no listeners).
- Tabs uncontrolled-only: `tabs/tabs.tsx` (`useState(defaultValue)`, no
  `value` prop in `Tabs-types.ts`).
- Toast reducer: `toast-provider.tsx` (`ADD`/`DISMISS` only);
  variants in `Toast-types.ts`.
- Input size hardcode: `input/input.tsx` (`const sizeClass =
  inputSizes.md;`) vs `inputSizes` sm/lg in `input-styles.ts`.
- Hardcoded strings: grep list (19 aria-labels) + `pagination.tsx`
  Previous/Next children, `combobox.tsx` placeholder/empty copy,
  `confirm-dialog.tsx` defaults.
- Carousel unlabeled nav: `carousel.tsx` `CarouselPrevious/Next` — svg
  only, no `aria-label`.
- InputOTP paste concern **cleared**: single sr-only `<input>` holds the
  value (native paste path), `autoComplete="one-time-code"` present.
- ring-offset count: `grep -rln ring-offset src/components/ui` → 1 file.
- VariantGallery coverage: `grep -rln VariantGallery src/views/ui | wc -l`
  → 21.
- Barrel omissions: `components/ui/index.ts` read end-to-end; FileUpload/
  ImageUpload/LogoSpinner/CheckboxCard/CheckboxChip absent; consumers
  import via PascalCase shims.
