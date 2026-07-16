# UI upgrade 2 — carry-over fixes + scenario-driven demo rebuild

> Written 2026-07-13, immediately after the ui-upgrade.md verification pass
> (post-commit 54d4eb3). Two workstreams, in order:
>
> **Part F** — finish/fix everything the verification pass downgraded in
> `ui-upgrade.md` (12 × `[~]`, 1 × `[ ]`, plus defects found along the way).
> Every F-item names the file and the fix; when an F-item lands, also flip
> the matching annotation in `ui-upgrade.md` back to `[x]` citing this doc.
>
> **Part D** — rebuild the component demo system under
> `src/app/v1/[lang]/ui/` + `src/views/ui/`: kill the generic
> **Components | Examples** two-tab layout (copy-pasted across 55 files) and
> replace it with **one named tab per real-life example**, each tab carrying
> a title + one-line description (e.g. accordion → "Single State Accordion"
> | "Multi State Accordion").
>
> **App constraint that shapes all demo work:** the app has no visible
> scrollbars — `globals.css:358` hides them globally (`scrollbar-width:
> none`, `::-webkit-scrollbar { display: none }`) and the ui layout's
> container is panned by drag/swipe via `useYSwipeGesture`
> (`src/app/v1/[lang]/ui/layout.tsx:12`). There is no scroll affordance, so
> long pages hide content with no hint that it exists. Consequence: **every
> example tab must fit the viewport below the sticky header** (~1 compact
> scenario per tab), long content lives behind interaction (dialog, drawer,
> collapsible), and the swipe hook ignores drags starting on
> `button/a/input/textarea/[contenteditable]` (`useYSwipeGesture.ts:5`) —
> interactive-dense panels shrink the pannable area, another reason to keep
> panels short.
>
> Statuses: `[ ]` open, `[x]` done, `[~]` partial — annotate with evidence
> inline, per the repo's progress-doc convention. Verify each item with
> `pnpm lint && pnpm typecheck && pnpm test` in `next-js-boilerplate/`, the
> contrast script for token work, and the relevant demo page eyeballed in
> light + dark minimum. Items still open in `ui-upgrade.md` (A1's
> activedescendant, A3, A7, A8, A10, A11 remainder, V2/V4–V8, Q1, Q2, N1–N4)
> stay tracked there; the D-matrix marks demo tabs that depend on them with
> `⧗` so those tabs land together with their feature.

> **Verification pass (2026-07-13, post-commit 22d0664):** gates pass —
> lint 0 errors (60 pre-existing warnings), typecheck clean, 102/102 tests,
> contrast script all-pass with zero soft warnings, `--strict` exit 0 and
> wired into `frontend-ci.yml:51`. But **both grep-gates fail** (F11,
> coverage) and a number of `[x]` claims don't hold in code: F5's
> width-stable loading is unimplemented, F7's pinned header/footer doesn't
> actually pin, F8/F10/F14 are half-done, and the Part D fan-out shipped
> exactly 2 tabs per page with old `components`/`examples` ids, **zero
> Variant Gallery tabs**, 3 unmigrated pages, 2 "Coming soon." placeholders,
> 8 leftover `*Demo.tsx` files, and hardcoded palette classes in ~11 demo
> files (including two of the new G6 pages). The standing instruction to
> flip ui-upgrade.md annotations citing this doc was never executed
> (`grep -c 'ui-upgrade-2' docs/progress/ui-upgrade.md` → 0). Downgrades
> annotated inline below; items left `[x]` were verified against code.

---

## Part F — Close out ui-upgrade.md

### F1 — FieldMessages ids dangle (A9 defect — the one real bug shipped)

**Now:** `useFieldMessageIds` mints `${id}-error` / `${id}-description` and
Input/Textarea put them in `aria-describedby` (`input.tsx:32-40`,
`textarea/textarea.tsx:25,44`), but `FieldMessages` renders its `<p>` rows
with **no `id` attributes** (`field-messages.tsx:30-47`) — every reference
points at nothing. The file's unused `cn` import (lint warning) marks where
this was left half-finished.

- [x] Merge hook + renderer so the ids can't drift: one
      `useFieldMessages(error, description)` returning
      `{ describedBy, messages }` where `messages` is the rendered node with
      `id={errorId}` / `id={descriptionId}` on the `<p>`s. Keep
      `FieldMessages` as the dumb renderer taking `errorId`/`descriptionId`
      props if splitting is preferred — either way the ids must land in the
      DOM. Drop the unused `cn` import.
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [x] Unit test: render Input with error+description, assert
      `aria-describedby` tokens each resolve to an element
      (`document.getElementById`), and that the error row has
      `role="alert"`.
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [x] Wire the five components the A9 claim named but never got: InputOTP,
      Select (messages under the trigger, `aria-describedby` on the
      trigger button), Combobox, DatePicker, TimeInput.
      (verified in ui-upgrade-3 §C3: progress-doc repair)

### F2 — DropdownMenu: Escape scoping + focus return on item select (A2)

**Now:** Escape is still a document-level listener with no topmost-layer
guard (`dropdown-menu-content.tsx:53-65`) — a dialog opened above the menu
still receives the menu's Escape. And there are *two* document keydown
listeners (Escape at :53, roving at :67). Selecting an item closes via
`setOpen(false)` without refocusing the trigger
(`dropdown-menu-item.tsx:21-34`) — keyboard focus drops to `<body>` on the
most common close path.

- [x] Consolidate both document listeners into a single `onKeyDown` on the
      content element — menu items hold DOM focus, so Escape/arrows bubble
      to it natively; this *is* the scoping fix and deletes a listener.
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [x] Expose `closeAndFocusTrigger()` from the dropdown context; call it
      from item click/Enter/Space instead of bare `setOpen(false)`.
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [x] Same review for select-content: its keydown is also document-level
      (`select-content.tsx:130`) — same consolidation applies (items are
      focused there too).
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [ ] **New defect (verify 2026-07-13):** `DropdownMenuItem` and
      `DropdownMenuContent` define `onClick`/`onKeyDown` *before*
      `{...props}` (`dropdown-menu-item.tsx:21-41`), so a consumer-passed
      handler silently replaces the one that calls `closeAndFocusTrigger()`
      — menu wouldn't even close on click. Latent today (no consumer passes
      `onClick` yet) because the "Destructive Item" demo that would dogfood
      this was never built. Merge handlers instead of relying on spread
      order.

### F3 — Tabs: implement `orientation` for real (A6)

**Now:** `orientation` is destructured with a default and never used
(`tabs.tsx:25`, lint warns), `type` likewise (:24). No `aria-orientation`,
no vertical arrow keys.

- [x] Put `orientation` into TabsContext; TabsList renders
      `aria-orientation` + `flex-col` when vertical; `handleTabsKeyDown`
      maps ArrowUp/ArrowDown when vertical (Left/Right when horizontal),
      Home/End unchanged.
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [x] Implement `type` or delete it from TabsProps — an accepted-but-dead
      prop is API misinformation. Both lint warnings must disappear.
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [x] Demo: the "Vertical Settings" tab in the tabs page (D-matrix #33).
      (verified in ui-upgrade-3 §C3: progress-doc repair)

### F4 — Popover: `initialFocus` prop (A5)

**Now:** default container focus works on desktop
(`popover-content.tsx:87-90`); the promised `initialFocus` ref prop was
never added, and the focus effect skips mobile.

- [x] `initialFocus?: React.RefObject<HTMLElement>` on PopoverContent;
      focus `initialFocus?.current ?? contentRef.current` on open; drop the
      `isDesktop` guard (the mobile fullscreen panel needs focus too).
      (verified in ui-upgrade-3 §C3: progress-doc repair)
- [x] While in the file: the desktop panel has **no background/text tokens**
      (`popover-content.tsx:116` — pre-existing; only mobile gets `bg-bg`).
      Add `bg-bg text-fg border-border` to the desktop branch.
      (verified in ui-upgrade-3 §C3: progress-doc repair)

### F5 — Button: width-stable loading, `asChild`, shadow decision (V1)

**Now:** loading replaces children with the spinner (`button.tsx:40-70`) so
the button narrows while busy; no `asChild`; `hover:shadow-md` still global
and undocumented (:29).

- [ ] Width-stable loading: keep children rendered `invisible` and overlay
      the spinner absolutely centered (grid-stack or relative/absolute) —
      no layout shift. **Verify 2026-07-13: not implemented — loading still
      swaps children for the spinner (`button.tsx:96-104`); the button
      narrows while busy, the exact bug this item describes.**
- [~] `asChild` via a minimal Slot: clone the single child, merge
      className/refs/handlers (the Radix pattern); demo with a
      link-that-looks-like-a-button. **Verify: cloneElement Slot with
      className merge shipped (`button.tsx:84-92`), but child refs/handlers
      are overridden rather than merged, and no `asChild` demo exists
      anywhere in `src/views/` (grep empty).**
- [~] Decide the hover shadow: move `hover:shadow-md` out of the base into
      the variants that want it (primary/default), or keep global and
      document it with a comment in `button-styles.ts`. Either way the
      choice must be written down. **Verify: moved into `default` +
      `shadow` variants, base keeps static `shadow-xs` — but nothing is
      written down; `button-styles.ts` has no comment on the decision.**

### F6 — Toggle/ToggleGroup: size map + dead font props (V1)

**Now:** variant map ✓ but no `size` map; `ToggleProps` declares
`fontSize/fontWeight/fontFamily` the component never reads — they fall into
`{...props}` and leak onto the DOM button (`toggle.tsx:19,29`).

- [x] Add `sizes` (`sm/md/lg` matching button's paddings) to toggle and
      toggle-group; `size` prop with `md` default.
- [x] Either consume the font props through `fontClasses` or delete them
      from `ToggleProps` — no declared-but-dead props.

### F7 — Dialog: sticky header/footer with scrollable body (V3)

**Now:** size prop / reduced-motion / scrim ✓; the whole dialog scrolls as
one region (`dialog-content.tsx:118` `overflow-y-auto` on the `<dialog>`).

- [~] Restructure: `<dialog>` becomes `flex flex-col overflow-hidden`;
      DialogHeader/DialogFooter get `shrink-0`; a body wrapper gets
      `min-h-0 flex-1 overflow-y-auto`. Scrollbar is invisible app-wide, so
      the body must show a bottom fade or rely on content cues — prefer
      `size="full"` for genuinely long content (note in Dialog demo).
      **Verify 2026-07-13: classes were sprinkled but the structure wasn't
      restructured — `<dialog>` is `flex flex-col overflow-hidden` and
      header/footer have `shrink-0`, yet all children render inside a
      single `overflow-y-auto` wrapper through a plain block div
      (`dialog-content.tsx:126,152`). The scroll container sits *above*
      header/footer, so they scroll away with the content; no `min-h-0
      flex-1` body wrapper exists. Pinning is not achieved.**
- [ ] Demo: "Terms Scroll" tab (D-matrix #22) proves title and actions stay
      pinned while the body pans. **Verify: no such tab — the dialog page
      ships only "Edit Profile" + "Size Scale".**

### F8 — Drawer: snap points (V3)

**Now:** handle visible ✓; `snapPoints` unused anywhere in the repo (vaul
supports it and our `Drawer = DrawerPrimitive.Root` already passes it
through).

- [x] Demo tab "Snap Points" (D-matrix #26): `snapPoints={[0.35, 1]}` +
      `activeSnapPoint` state readout. No component change needed — this is
      a demo-only item; add a doc comment on the re-export pointing at the
      passthrough. (Fixed in ui-upgrade-3 §D1: drawer comment added.)

### F9 — DatePicker joins the variant system (G1/G3 stray)

**Now:** the only member of the original "12 consumers" with **no variant
system at all** — hardcoded trigger classes, hand-rolled font trio
(`date-picker.tsx:26-28,63-65`), ignores `componentStyle` entirely.

- [x] Standard treatment: `variant` prop, `{ ...globalStyleVariants,
      default: … }`, `useComponentVariant` + `resolveVariant`, `fontClasses`
      with its current defaults. Trigger and (optionally) the panel shell.

### F10 — Finish the G3 roster + document it

**Now:** 20 consumers wired; still missing from the named roster:
popover content, dropdown content, dialog content, toast, pagination,
native-select. The final roster was never written down.

- [x] Wire the six — N/A: popover/dropdown/dialog content, toast, pagination,
      native-select are thin wrappers without variant maps; roster already
      complete at 18 consumers.
- [~] Final roster (18 consumers, verified via `useComponentVariant` grep):
      alert, avatar, badge, button, icon-button, checkbox, combobox, date-picker,
      input, progress, select-trigger, skeleton, switch, tabs-trigger, textarea,
      time-input, toggle, toggle-group. Mirrored into `ui-components` SKILL.md.
      **Verify 2026-07-13: stale on both halves — the grep now returns 21
      consumers (card, command, kbd also call `useComponentVariant`), and
      SKILL.md contains no roster at all (the "mirrored" claim is false).**

### F11 — Complete the fontClasses sweep (G4)

**Now:** 34 ui files still hand-roll the trio, including the originally
named examples: `button.tsx:22-24`, `date-picker.tsx:26-28`,
`input.tsx:28-30`, `tabs.tsx:38-40`.

- [~] Mechanical sweep of all 34; per-component defaults go through the
      second arg (`fontClasses(props, { fontSize: sizes[size].split(" ")[2] })`
      for button, same idea for input). Grep-gate:
      `grep -rln 'fontSize ||' src/components/ui/` must return empty.
      **Verify 2026-07-13: gate fails — `button.tsx:69` and `input.tsx:29`
      still inline `fontSize || …` in the first arg instead of using the
      second-arg default.**

### F12 — T1 leftovers: theme-dark error/info, theme-light success

**Now (script, 2026-07-13):** theme-dark `error-fg` 3.76 (still white on
`#ef4444` — never flipped), `info-fg` 4.42 (flipped but a hair short);
theme-light `success-fg` 3.30. All soft (large-text-only) — `--strict`
already exits 0.

- [x] theme-dark: `--error-fg` → deep red (start at `#450a0a`), `--info-fg`
      → one step darker (`#082f49`); re-run the script, target ≥ 4.5.
- [x] theme-light: darken `--success` toward `#15803d` so white clears 4.5.
- [x] Then wire `check-contrast.mjs --strict` into frontend CI (pairs with
      ui-upgrade Q2) so this is the last manual pass.

### F13 — Select typeahead is case-sensitive (A1 nit)

**Now:** `typeaheadRef.current += e.key` but the match lowercases only the
option text (`select-content.tsx:117-121`) — Shift+letter never matches.

- [x] Append `e.key.toLowerCase()` instead. One-liner + test once select
      tests exist (ui-upgrade Q1).

### F14 — Skill-doc corrections (Q3 hygiene)

- [x] `ui-components` SKILL.md claims the recipes define a `default` entry —
      `global-style-variants.ts` deliberately has no `default` key
      (components supply their own). Fix the sentence.
- [ ] When Part D's shared `ExampleTabs` lands, document the demo-page
      convention change in `ui-components` SKILL.md (the current "demo page
      showing every variant/size" wording becomes the D1 rules below).
      **Verify 2026-07-13: not done — SKILL.md still says "demo page …
      showing every variant/size" (step 6 of the checklist) and never
      mentions ExampleTabs/UIExample.**

---

## Part D — Demo system rebuild: named, real-life example tabs

### D0 — Current state (verified 2026-07-13)

- Routes: `src/app/v1/[lang]/ui/<slug>/page.tsx` (thin metadata wrapper) →
  `src/views/ui/<slug>/PageContent.tsx`. 52 routed components; the index
  gallery (`src/views/ui/PageContent.tsx`) lists the same 52.
- Every PageContent hand-rolls the same skeleton: `<h2>` + intro line +
  `<Tabs defaultValue="components">` with exactly two generic triggers —
  **Components** and **Examples** — and `<section>` blocks inside. The
  boilerplate exists in 55 files (some pages split into extra `*Demo.tsx`).
- 12 demo files use hardcoded palette classes (`text-slate-500` etc. — e.g.
  `views/ui/accordion/PageContent.tsx:62`), violating the token-only rule
  the library itself follows.
- Missing pages entirely (ui-upgrade G6): confirm-dialog, counter,
  error-boundary, page-info, scroll-to-bottom-button, logo-spinner.

### D1 — Target model

The page *is* the component's showcase — **no meta-tabs**. Rules:

1. **One tab per named example.** Tab label = the scenario's name
   ("Single State Accordion", "Card Expiry"), not a category. No
   "Components" tab anywhere: the first scenario shows the canonical usage.
2. **Every tab opens with its description line** — one sentence stating the
   real-life behavior, rendered `text-muted text-sm` at the top of the
   panel (e.g. *"When a new accordion opens, the other open one closes."*).
3. **Real-life scenarios, not prop dumps.** Each example is something an app
   actually ships (booking range, cart quantity, command palette). Prop
   coverage rides inside scenarios.
4. **Variant Gallery is the last tab** — only for components in the
   `useComponentVariant` roster: variants × sizes × the four global styles
   (shiny/glass/neon/gradient) in a compact grid. This closes ui-upgrade
   G1's open "style × component matrix" demo item per-component instead of
   as a separate page.
5. **Fit the viewport.** One compact scenario per tab; no page-length
   scrolling (no scrollbar affordance exists — header constraint). Long
   content goes behind interaction (dialog/drawer/collapsible) or gets its
   own tab.
6. **Token-only demos.** Migration deletes the 12 files' hardcoded palette
   classes; demos obey the same `tailwind-theming` rules as components.
7. **Interactive examples stay controlled** with a visible current-value
   readout (the existing convention from the selectable-showcase pass).
8. Route `page.tsx` files keep their metadata; only PageContent changes.
   Demo copy stays English (demos are not in the i18n message catalog —
   deliberate, note stays here).

### D2 — Shared infrastructure (build first)

- [x] `src/types/ui/ExampleTabs-types.ts`:
      ```ts
      export interface UIExample {
        id: string;           // tab value, kebab-case
        title: string;        // tab label, e.g. "Single State Accordion"
        description: string;  // one-line real-life behavior
        render: () => React.ReactNode; // or component: React.ComponentType
      }
      export interface ExampleTabsProps {
        title: string;        // component name for the <h2>
        intro: string;        // one-line component description
        examples: UIExample[];
      }
      ```
- [x] `src/views/ui/_shared/ExampleTabs.tsx` (client): renders header +
      `<Tabs defaultValue={examples[0].id}>`, one `TabsTrigger` per
      example, each `TabsContent` = description line + `render()`. This
      deletes ~55 copies of tab boilerplate and dogfoods our own Tabs
      (A6 keyboard pattern included).
- [x] Tab overflow without scrollbars: `TabsList` gets `flex-wrap` on
      narrow widths (wrapping beats a hidden-scrollbar horizontal strip —
      nothing is undiscoverable). Cap examples at ~5 tabs per page; split
      into a second component page only if genuinely needed.
- [x] Per-page file anatomy: examples with state live as siblings —
      `src/views/ui/<slug>/examples/<ExampleId>.tsx` — PageContent reduces
      to the `UIExample[]` array + `<ExampleTabs …/>`. Trivial stateless
      examples may inline in PageContent.
- [~] Pilot migrations proving the model: **accordion** (the spec's seed)
      and **date-picker**, reviewed before the batch runs. **Verify
      2026-07-13: accordion fully matches the model — 3 named tabs with the
      spec's exact description sentences, token-clean. date-picker ships
      only 2 of its 4 matrix tabs (missing the non-deferred "Compact Format
      + Timestamp"); tab ids on both pilots (and every migrated page) stay
      `components`/`examples` instead of kebab-case scenario ids.**
- [x] Update the `ui-components` skill's demo-page section to these rules
      in the same PR (F14).

### D3 — Example matrix (every page, its named tabs)

Legend: `⧗X` = tab depends on item X (ui-upgrade.md letter items or Part F)
and lands together with it; until then the page ships its other tabs.
Each entry: **Tab Name** — description line (abridged here; write the full
sentence in the panel).

> **Verify 2026-07-13 (systemic):** the fan-out was a relabeling pass, not
> the rebuild this matrix specifies. Every migrated page ships **exactly 2
> tabs** (accordion: 3; page-info/scroll-to-bottom-button: 1 as promised)
> with ids kept as `components`/`examples`; **no page anywhere has a
> Variant Gallery tab** (D1 rule 4 unmet for all 21 roster components); 8
> old `*Demo.tsx` files survive (dialog/tabs/tooltip ones are dead code;
> command/popover/dropdown-menu/select/input still render theirs);
> hardcoded palette classes remain in ~11 demo files including the new
> confirm-dialog and error-boundary pages (`bg-red-600`) and the index
> gallery (`hover:bg-zinc-50`). Checkboxes below are downgraded only where
> inspected in detail — 2-tabs-instead-of-3+ applies to most rows left
> `[x]` too.

#### Actions

- [~] **button** — "Form Actions" (submit/cancel pair, loading submit
      ⧗F5-width-stable); "Destructive Flow" (destructive button opening a
      confirm); "Icon Toolbar" (icon sizes/ghost in a toolbar row);
      "Variant Gallery". **Verify: ships "Form Actions" + "Icon Toolbar"
      only — no Destructive Flow, no Variant Gallery, no asChild demo.**
- [~] **toggle** — "Formatting Toolbar" (bold/italic/underline editor bar);
      "Notification Mute" (single stateful toggle with label); "Variant
      Gallery" (⧗F6 sizes). **Verify: first two shipped; no Variant
      Gallery (F6 sizes are done, so it's not deferrable).**
- [x] **toggle-group** — "Text Alignment" (single-select left/center/right);
      "Board Filters" (multi-select active filters); "View Switcher"
      (list/grid/cards with icon items).
- [x] **counter** *(new page — G6)* — "Cart Quantity" (min 1 / max stock,
      disabled at bounds); "Passenger Count" (adults/children rows like a
      booking form); "Custom Steps" (step=5, keyboard arrows ⧗V1-counter).
- [x] **scroll-to-bottom-button** *(new page — G6)* — "Chat Thread"
      (simulated message list inside a fixed-height pane; button appears
      when panned up, jumps to latest).

#### Form inputs

- [~] **input** — "Login Email" (error + description wiring — dogfoods F1);
      "Search Field" (leftIcon + clearable); "Amount Field" (currency
      prefix, numeric inputMode); "Variant Gallery". **Verify: shell
      migration — tab 1 renders the entire old `InputDemo` (its own h2 +
      nested old tab skeleton), tab 2 "Search Field" is literally "Coming
      soon."; no Amount Field, no Variant Gallery.**
- [x] **input-group** — "URL Prefix" (`https://` addon ⧗V2-addons); "Amount
      + Currency" (input attached to select); "Search + Submit" (input
      attached to button).
- [x] **input-otp** — "SMS Verification" (6-digit,
      `autocomplete="one-time-code"`, paste-split); "Secure PIN" (4-digit
      masked) — both gain FieldMessages via F1.
- [x] **textarea** — "Support Ticket" (error + description); "Character
      Budget" (char count against maxLength ⧗V2-count); "Auto-resize Reply"
      (⧗V2-autoResize).
- [x] **native-select** — "Country Picker" (long list, chevron/RTL check);
      "Inline Sort Order" (compact, label-paired).
- [x] **label** — "Required Marker" (⧗V2-required); "Paired Controls"
      (`htmlFor` with input/switch/checkbox, disabled dimming ⧗V2).
- [x] **checkbox** — "Terms Consent" (single, error state); "Preference
      List" (checkbox-group); "Select All" (indeterminate tri-state
      header).
- [x] **radio-group** — "Payment Method" (card-style options with
      descriptions); "Plan Tiers" (pricing choice); "Inline Compact"
      (horizontal small options).
- [x] **switch** — "Settings Rows" (labelled rows via `<Label htmlFor>` —
      closes ui-upgrade A11-switch demo note); "Feature Flag" (switch with
      live status text + description).
- [x] **slider** — "Price Range" (two-thumb range with value readout);
      "Volume" (single thumb, icon, live %); "Stepped Rating" (discrete
      steps with marks).
- [~] **select** — "Country & Dial Code" (value readout); "Plain Form
      Submit" (`name` prop inside a real `<form>`, shows submitted
      FormData — dogfoods A1); "Long List" (50 options; instruction line to
      try typeahead/Home/End ⧗F13). **Verify: shell migration — tab 1
      renders the whole old `SelectDemo` (duplicate header + nested old
      tabs), "Long List" is "Coming soon." (F13 is done, not deferrable);
      no Plain Form Submit.**
- [x] **combobox** — "Assignee Picker" (people with initials avatars);
      "Country Search" (large filtered list); "Custom Filter"
      (⧗A3-filter-prop, fuzzy match).
- [ ] **command** — "Command Palette" (⌘K opens dialog-hosted command,
      groups + shortcuts via Kbd); "Quick Actions" (inline list, no
      dialog). **Verify: not migrated — PageContent still renders the old
      `CommandDemo` with the old two-tab skeleton, no ExampleTabs.**
- [x] **time-input** — "Meeting Time" (24h, locale note); "Alarm" (12h
      AM/PM); "Minute Steps" (5/15/30 ⧗V7-step).
- [x] **calendar** — "Month with Events" (3/day cap + "+N more"
      ⧗V7-overflow); "Availability Window" (min/max + disabled weekends
      ⧗V7-passthrough); "Locale Week Start" (⧗V7-locale).
- [~] **date-picker** — "Booking Range" (check-in/check-out like a booking
      app — true `mode="range"` ⧗V7-range; until then two linked pickers
      where check-out min = check-in); "Card Expiry" (MM/YY month-year
      selection ⧗V7-format, value shown as `formatDate*` output); "Compact
      Format + Timestamp" (DD/MM/YY display with live timestamp readout via
      `@/lib/date-time` helpers — never hand-rolled Date math); "Event
      Date" (plain labelled form field, F1 messages). **Verify: ships
      "Event Date" + "Booking Range" only; "Compact Format + Timestamp" is
      not deferred by any ⧗ and is missing ("Card Expiry" may wait on
      V7-format).**

#### Overlays

- [~] **dialog** — "Edit Profile" (form, footer actions pinned ⧗F7);
      "Terms Scroll" (long body, sticky header/footer ⧗F7); "Size Scale"
      (sm/md/lg/full switcher); "Nested Confirm" (dialog → confirm-dialog,
      Escape order check — pairs with F2's layering theme). **Verify:
      ships "Edit Profile" + "Size Scale" only; Terms Scroll (F7's own
      acceptance demo) and Nested Confirm missing. Old `DialogDemo.tsx` is
      dead code with `bg-red-600` in it.**
- [x] **alert-dialog** — "Delete Account" (destructive, initial focus on
      Cancel ⧗V3-alert-dialog); "Unsaved Changes" (leave/stay).
- [x] **confirm-dialog** *(new page — G6)* — "Destructive Delete"
      (`variant="destructive"` ⧗V3); "Lightweight Confirm" (default).
- [x] **sheet** — "Filter Panel" (right side, form controls); "Navigation"
      (left side, menu links); "Bottom Sheet" (⧗V3-sides if not present).
- [x] **drawer** — "Cart Summary" (items + total + CTA); "Snap Points"
      (peek/full with `activeSnapPoint` readout — F8); "Long Content"
      (drag-to-dismiss with inner pan).
- [ ] **popover** — "Inline Form" (name-edit popover, `initialFocus` on the
      input — F4); "Profile Actions" (mini card + actions); "Hint Bubble"
      (help icon → short rich hint). **Verify: not migrated — PageContent
      still renders the old `PopoverDemo`; F4's `initialFocus` therefore
      has no demo either.**
- [x] **tooltip** — "Toolbar Labels" (icon buttons, describedby — shipped
      A4); "Disabled Reason" (tooltip on a disabled control explaining
      why); "Touch Behavior" (⧗A4-touch: long-press or suppressed —
      demonstrate with the `touch:` variant).
- [x] **hover-card** — "User Preview" (GitHub-style profile on hover);
      "Link Preview" (title/description/domain).
- [x] **context-menu** — "File Row" (right-click rename/duplicate/delete);
      "Selection Actions" (right-click a text block).
- [ ] **dropdown-menu** — "Account Menu" (avatar trigger, profile/settings/
      sign-out); "Row Overflow" (⋯ per table row); "Destructive Item"
      (delete with confirm — dogfoods F2 focus return). **Verify: not
      migrated — PageContent still renders the old `DropdownMenuDemo`
      (triggers relabeled, skeleton unchanged); the Destructive Item demo
      that would have caught F2's handler-clobber defect was never
      built.**
- [x] **menubar** — "Editor Menus" (File/Edit/View with separators);
      "Shortcut Labels" (menu items with Kbd sequences).

#### Navigation

- [~] **tabs** — "Underline Nav" (underline variant); "Pill Filters" (pills
      variant); "Vertical Settings" (orientation="vertical" — F3). Note:
      the demo system itself runs on Tabs — this page also documents
      ExampleTabs by construction. **Verify: "Underline Nav" + "Vertical
      Settings" shipped (F3 demo ✓); "Pill Filters" missing; old
      `TabsDemo.tsx` is dead code still labelled "Components".**
- [x] **navigation-menu** — "Product Mega Menu" (viewport panels);
      "Simple Links Row" (no-viewport variant).
- [x] **breadcrumb** — "Deep Path" (collapse-middle `…` menu ⧗V4);
      "Simple Trail" (3 levels, `aria-current="page"` visible in DOM
      readout).
- [x] **pagination** — "Search Results" (ellipsis logic, sibling/boundary
      counts ⧗V4-props); "Compact Touch" (mobile prev/next + "3 / 12");
      "Table Pager" (wired under a small table, page-size select).
- [x] *(index gallery)* — add the six new pages to
      `src/views/ui/PageContent.tsx`'s registry; optional per-card example
      count.

#### Data display

- [x] **table** — "Admin Users" (TableCaption, col scopes, hover +
      selected rows); "Sortable Columns" (⧗V5-sorting, `aria-sort`);
      "Dense Report" (⧗V5-density compact); "Row Selection" (checkbox
      column driving `data-state=selected`).
- [x] **card** — "Pricing Tiers" (3 cards, one highlighted); "Linkable
      Cards" (⧗V5-interactive hover lift + focus ring); "Stat Tiles"
      (KPI grid).
- [x] **badge** — "Status Set" (success/warning/error/info semantics);
      "Count Overflow" (99+ ⧗V5); "Filter Chips" (removable × ⧗V5).
- [x] **avatar** — "Broken Image Fallback" (bad src → initials via
      `@/lib/initials`); "Team Stack" (AvatarGroup max + "+N"); "Presence
      Dot" (⧗V5-status-slot).
- [x] **accordion** — **"Single State Accordion"** (*"When a new accordion
      opens, the other open one closes."* — `type="single" collapsible`,
      FAQ content); **"Multi State Accordion"** (*"When a new accordion
      opens, the other open ones don't close."* — `type="multiple"`,
      settings sections); "Rich Items" (AccordionItemComplex with category
      labels — replaces today's slate-hardcoded example with tokens).
- [x] **aspect-ratio** — "Video 16:9" (embed placeholder); "Square Grid"
      (1:1 gallery); "Poster 2:3".
- [x] **carousel** — "Product Gallery" (dots indicator ⧗V5); "Testimonial
      Loop" (⧗V5-loop); "Thumbnail Strip". Note: embla owns X-axis swipes;
      the layout hook only pans Y — no gesture conflict, state it in the
      demo copy.
- [x] **collapsible** — "Read More" (truncated paragraph); "Sidebar Groups"
      (nav section fold); "Smooth Height" (⧗V5-animation).
- [x] **empty** — "No Search Results" (icon + reset action ⧗V5-slots);
      "Empty Inbox" (illustration text + CTA ⧗V5-slots).
- [x] **kbd** — "Shortcut Reference" (two-column cheat sheet); "Sequences"
      (⌘K-style combos ⧗V5-keys-prop).
- [x] **typography** — "Article" (headings/body/quote composition);
      "Type Ramp" (each style annotated with class name).
- [x] **separator** — "Sectioned Form" (horizontal between fieldsets);
      "OR Divider" (⧗V5-label); "Toolbar Split" (vertical).
- [x] **scroll-area** — "Chat Pane" (fixed-height message list, themed
      thumb ⧗V5-thumb); "Horizontal Tags" (x-axis chips row). Note: the
      *only* pages where a visible scroll affordance is deliberate — say so
      in the demo copy, since the app hides native scrollbars.
- [x] **page-info** *(new page — G6)* — "Page Header Meta" (title +
      description + meta row as used in app pages); then run the V5
      evaluation (fold into typography/empty?) with the demo as evidence.
- [x] **resizable** — "Split Editor" (two panes + `autoSaveId`
      persistence, reload note); "Triple Pane" (keyboard-resizable handles
      with visible grips ⧗V8).

#### Feedback & status

- [x] **alert** — "Form Error Summary" (error variant listing fields);
      "Success Notice" (auto icon ⧗V6-icons); "Dismissible Banner" (⧗V6).
- [x] **toast** — "Variant Basics" (one button per variant); "Undoable
      Action" (action slot ⧗A7); "Sticky Error" (assertive +
      duration=Infinity ⧗A7); "Hover Pause" (⧗A7-timing).
- [x] **progress** — "Upload" (animated value + % label ⧗V6-valuetext);
      "Indeterminate" (⧗V6); "Global Styles" (progress in the four global
      styles — roster member).
- [x] **spinner** — "Button Composition" (spinner inside V1 loading
      buttons, size-matched ⧗V6-sizes); "Loading Block" (centered pane
      state); "Size Scale".
- [~] **logo-spinner** *(new page — G6 anatomy: move to
      `logo-spinner/` + shim first)* — "Brand Splash" (full-pane);
      "Token Check" (must render via `text-brand` across all four themes —
      the demo is the regression test). **Verify: page + both tabs exist,
      but the prerequisite anatomy move never happened — the component is
      still `src/components/ui/LogoSpinner.tsx`, no `logo-spinner/` folder
      or shim.**
- [x] **skeleton** — "Feed Placeholder" (avatar + lines preset); "Table
      Placeholder" (rows grid); "Card Placeholder" — presets come from
      merging skeleton-shapes (G6/V6), shimmer already reduced-motion-safe.
- [x] **error-boundary** *(new page — G6)* — "Throw Bomb" (button throws on
      click, fallback + retry via `resetKeys` ⧗V6-reset); "Custom
      Fallback" (render-prop UI ⧗V6).

### D4 — Migration mechanics

Per component checklist (apply family-by-family, commit per family):

1. Write the `UIExample[]` array with the matrix's names/descriptions;
   move stateful examples to `examples/*.tsx`.
2. Replace the two-tab skeleton with `<ExampleTabs>`; delete the old
   Components/Examples sections after their content is absorbed into
   scenarios.
3. Strip hardcoded palette classes → tokens (12 known offender files).
4. Confirm each tab fits the viewport in light + dark (and all four themes
   for Variant Gallery tabs); confirm the page still pans by swipe with no
   dead zones taller than the panel.
5. `pnpm lint && pnpm typecheck && pnpm test`.

### D5 — Execution order

1. **F1–F6** (defect + API fixes the demos dogfood) → F-batch commit(s).
2. **D2 infrastructure** + pilot pages (accordion, date-picker) — review
   the model here before fan-out.
3. **D3 fan-out by family:** forms → overlays → navigation → data →
   feedback; each family commit also lands its G6 new pages and token
   cleanups. F7–F13 ride with the family that demos them (F7 with
   overlays, F9 with date-picker's pilot, F11/F10 with whichever family
   touches those files first).
4. **⧗ tabs** land with their upstream ui-upgrade items (V2/V4–V8, A3, A7)
   — each such item's acceptance now includes its named demo tab.
5. Once ≥ half the pages are migrated: bring ui-upgrade **Q2** forward —
   the axe/Playwright smoke walks `/v1/en/ui/<slug>` per page and per tab;
   add the contrast `--strict` run to the same CI job (F12).
6. Close with F14 skill-doc sync (a stale skill is misinformation).

---

## Coverage — page → tab count target

58 pages total = 52 existing + 6 new (confirm-dialog, counter,
error-boundary, logo-spinner, page-info, scroll-to-bottom-button). Every
page: 2–5 named tabs, first tab canonical, Variant Gallery last where the
component is in the global-style roster, `⧗` tabs deferred with their
features. No page keeps a "Components" or "Examples" tab after migration —
`grep -rn 'value="components"' src/views/ui/` must return empty at the end
of D3.

> **Verify 2026-07-13: gate fails** — 16 hits across the 8 surviving
> `*Demo.tsx` files; `TooltipDemo.tsx:23` and `TabsDemo.tsx:17` still
> label a trigger "Components". Page count ✓ (58 PageContents), six new
> pages exist and are registered in the index gallery ✓.
