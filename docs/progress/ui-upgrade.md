# UI upgrade — enhancing the custom component library

> Written 2026-07-13. Scope: every component under
> `next-js-boilerplate/src/components/ui/` — 57 component folders plus 2
> root-level strays (`LogoSpinner.tsx`, `skeleton-shapes.tsx`). Unlike
> `upgrade.md`–`upgrade-5.md` (security/correctness/performance), this pass is
> scoped to the **component library itself**: API consistency, accessibility,
> theming correctness, visual polish, and test/demo coverage.
>
> Method: audited with the repo skills (`ui-components`, `tailwind-theming`,
> `radix-primitives`, `datetime-inputs`, `frontend-design`, `webapp-testing`)
> against a per-folder matrix (LOC, ARIA/keyboard markers, variant-map
> coverage, `useComponentVariant` adoption, type/demo/test parity) plus the
> WCAG contrast script. Every claim below carries a file reference verified
> against current code on 2026-07-13. Statuses: `[ ]` open, `[x]` done,
> `[~]` partial (annotate inline like the upgrade-5 control runs).
>
> Library baseline for orientation: 15 components are Radix-backed (accordion,
> alert-dialog, aspect-ratio, collapsible, context-menu, hover-card, menubar,
> navigation-menu, progress, radio-group, scroll-area, sheet, slider, toggle,
> toggle-group — a11y comes from the primitive), drawer is `vaul`, carousel is
> `embla`, calendar is `react-day-picker` v10; the rest is hand-rolled. The
> hand-rolled overlays are in better shape than folklore suggests — popover
> has outside-click + Escape + focus-return (`popover/popover-content.tsx:60-79`),
> tabs implement the WAI-APG roving pattern (`tabs/tabs-list.tsx:22-47`),
> select has listbox roles + arrow nav + Escape (`select/select-content.tsx:47-102`)
> — so the plan below is *enhancement*, not rescue.
>
> **Control pass (2026-07-13, same day):** every file:line citation re-checked
> before commit. Two claims corrected (popover's trigger already ships
> `aria-expanded`/`aria-haspopup`, popover-trigger.tsx:32-33; calendar already
> caps at 3 events/day, calendar.tsx:92) and one new defect found (toggle's
> dead `hover:text-muted-foreground` class — see V1).
>
> **Verification pass (2026-07-13, post-commit 54d4eb3):** every `[x]` claim
> re-audited against code. Gates: lint 0 errors, typecheck clean, 96/96 tests,
> contrast `--strict` exit 0. Twelve claims downgraded to `[~]` and one to
> `[ ]` with evidence inline; one new defect found (`FieldMessages` renders
> its `<p>` rows without ids, so every `aria-describedby` wired through
> `useFieldMessageIds` dangles — see A9).

---

## G — Systemic (P0: correctness of the component system itself)

### G1 — The five global component styles are dead letters (headline item)

**Now:** `@/constants/theme.ts` defines `ComponentStyle = "default" | "shiny"
| "glass" | "neon" | "gradient"`, user-selectable via
`useTheme().setComponentStyle` and persisted in the `componentStyle` cookie.
`useComponentVariant()` resolves it as the effective variant. But **no variant
map in the entire library defines `shiny`, `glass`, `neon`, or `gradient`**
(verified: `grep -rln "shiny:\|glass:\|neon:\|gradient:" src/components/ui/`
→ zero hits). When the global style is e.g. `neon`,
`variants[effectiveVariant]` in `button/button.tsx:28` is `undefined` — the
Button silently loses its entire variant class string (background, border,
hover). Every `useComponentVariant` consumer has the same failure.

**How:**
- [x] Create `src/components/ui/global-style-variants.ts` with the four
      recipes as token-only class strings, designed once and reused:
      - `shiny` — subtle top-light: `bg-gradient-to-b from-surface to-surface-hover border border-border shadow-sm`
      - `glass` — translucency: `bg-surface/60 backdrop-blur-md border border-border/50`
      - `neon` — brand glow: `bg-bg border border-brand text-brand shadow-[0_0_12px_var(--brand)]`
      - `gradient` — brand sweep: `bg-gradient-to-r from-brand to-info text-brand-fg`
      Follow the `frontend-design` skill here: pick one signature look per
      style and keep it disciplined; validate all four against all four
      themes (the `tailwind-theming` skill + contrast script are the guard).
- [x] Spread these into each `useComponentVariant` consumer's variant map
      (`{ ...globalStyleVariants, default: …, primary: …, }`) so lookup always
      succeeds — starting with the 12 current consumers (G3 list).
      (fixed in ui-upgrade-2 §F9: DatePicker joined the variant system)
- [x] Interim safety regardless: `?? variants.default` at every lookup site (G2).
- [ ] Demo: extend the theme/style switcher demo page to render the style ×
      component matrix so regressions are visible.

### G2 — Unsafe variant indexing library-wide

**Now:** the idiom `variants[effectiveVariant as keyof typeof variants]`
(e.g. `button/button.tsx:28`, `date-picker/date-picker.tsx`) returns
`undefined` for any unknown key — silent unstyling instead of a loud failure.

**How:**
- [x] Add a tiny resolver and use it everywhere:
      `export function resolveVariant<M extends Record<string, string>>(map: M, key: string | undefined): string { return (key && map[key]) || map.default; }`
      in `src/lib/` with a unit test; sweep all variant lookups to it.

### G3 — `useComponentVariant` adoption is 12/57

**Now:** only alert, avatar, badge, button, card, checkbox, date-picker,
input, kbd, progress, skeleton, time-input resolve the global style. The
other 45 ignore `componentStyle` entirely, so switching to "glass" restyles a
Button but not the Select beside it.

**How:**
- [x] Decide the roster deliberately: global styles should apply to
      *surface-painting interactive* components (select, combobox, textarea,
      switch, toggle, tabs triggers, popover/dropdown/dialog content, toast,
      pagination, native-select) — not to structural/utility ones (separator,
      aspect-ratio, scroll-area, label, kbd is debatable).
- [~] Wire `useComponentVariant` + `{ ...globalStyleVariants }` into the
      roster; document the roster in this file as items complete.
      *(verify 2026-07-13: wired — select-trigger, combobox, command,
      textarea, switch, toggle, toggle-group, tabs-trigger (20 total incl.
      the original 12 minus date-picker). Still unwired from the named
      roster: popover/dropdown/dialog content, toast, pagination,
      native-select. The final roster was never documented here.)*

### G4 — Font-trio boilerplate repeated in ~20 components

**Now:** the same three lines (`fontSize || "text-sm"`, `fontWeight ||
"font-medium"`, `fontFamily || "font-sans"`) are hand-copied per component
(button.tsx:20-22, combobox.tsx:28-30, date-picker, time-input, …) with
per-component defaults drifting — button's size-derived default
(`sizes[size].split(" ")[2]`, button.tsx:20) vs everyone else's `"text-sm"`
is exactly that drift.

**How:**
- [~] `src/lib/font-classes.ts`: `fontClasses({ fontSize, fontWeight, fontFamily }, defaults?)`
      returning the joined string; unit test; sweep consumers. Keep the
      prop API unchanged (it exists because `cn()` doesn't merge — see the
      `ui-components` skill).
      *(verify 2026-07-13: utility + unit test ✓, adopted by tabs-trigger/
      tabs-content/popover-trigger/combobox/textarea/time-input; but 34 ui
      files still hand-roll the trio, including named examples
      button.tsx:22-24, date-picker.tsx:26-28, input.tsx:28-30,
      tabs.tsx:38-40.)*

### G5 — `className` double-application and cn-no-merge API audit

**Now:** `combobox/combobox.tsx` applies the same `className` to both the
wrapper (`cn("relative", className)`) and the trigger button
(`cn(…, defaultStyles, className)`) — a consumer's margin class lands twice.
Since `cn()` intentionally doesn't dedupe, each component must apply
`className` to exactly one element and expose props for the rest.

**How:**
- [x] Fix combobox (wrapper keeps `className`; trigger gets a new
      `triggerClassName` or, better, variant/size props).
- [ ] Sweep all multi-element components for the same mistake (date-picker,
      input-with-icon, input-group are the likely suspects); add one demo
      snippet per fixed component proving `className` lands once.

### G6 — Anatomy debt: missing types, demos, and root strays

**Now:** violates the repo's own rules (AGENTS.md "Extract inline prop types",
demo-page parity from the `ui-components` skill):
- Missing `src/types/ui/<Name>-types.ts` (11): alert-dialog, aspect-ratio,
  breadcrumb, carousel, collapsible, input-group, native-select, pagination,
  table, toggle, toggle-group.
- Missing `src/views/ui/<name>/` demo (5): confirm-dialog, counter,
  error-boundary, page-info, scroll-to-bottom-button.
- Root strays: `LogoSpinner.tsx` and `skeleton-shapes.tsx` sit at the ui root
  without the folder + shim + types anatomy.

**How:**
- [ ] Add type files where a named prop interface exists or should exist
      (breadcrumb, carousel, pagination, table, input-group, native-select);
      for pure Radix passthroughs (aspect-ratio is 10 LOC of
      `ComponentPropsWithoutRef<typeof Root>` — nothing to extract), skip
      with a one-line comment so the omission reads as deliberate.
- [ ] Add the 5 demo pages (every variant/size/state per page).
- [ ] Move LogoSpinner → `logo-spinner/`, skeleton-shapes → into `skeleton/`;
      keep root shims for import compatibility.

### G7 — Reduced-motion pass

**Now:** exactly one component respects `prefers-reduced-motion`
(`toast/toast.tsx:47` has `motion-reduce:transition-none`). Dialog's
keyframe animations (`dialog/dialog-content.tsx` `<style>` block), tooltip
delay/fade, popover, drawer springs (vaul), and carousel autoplay ignore it.

**How:**
- [x] Add `motion-reduce:animate-none motion-reduce:transition-none` to every
      animated surface; for the dialog `<style>` block add an
      `@media (prefers-reduced-motion: reduce)` override; verify with DevTools
      emulation on each demo page.
      *(verify 2026-07-13: effectively delivered by the global
      `prefers-reduced-motion: reduce` base-layer rule in globals.css (~:991)
      forcing 0.01ms animation/transition durations everywhere — covers the
      mobile `animate-fade-in` overlays and vaul's transitions — plus the
      dialog `@media` block (dialog-content.tsx:104-111). Per-component
      `motion-reduce:` classes exist only on dialog/skeleton/toast/tooltip.)*

### G8 — Overlay scrim is hardcoded black

**Now:** `backdrop:bg-black/50` (dialog), `bg-black/50` (drawer overlay,
`drawer/drawer.tsx:15`) — the only hardcoded colors left in the overlay path.
Tinted themes (ocean/violet) can't tint their scrims.

**How:**
- [x] Add `--overlay` to every `.theme-*` block + `@theme inline` mapping
      (`--color-overlay`); replace the two `bg-black/50` and the dialog
      `backdrop:` usage with `bg-overlay/50`; document in the
      `tailwind-theming` skill token table.
      *(verify 2026-07-13: ✓ — zero `bg-black` left in ui/. Note all four
      themes currently set `--overlay: #000000`, so ocean/violet don't yet
      use the tinting the token was added to enable.)*

---

## T — Theming & contrast (pairs with G1's four-theme validation)

### T1 — Status `-fg` pairs fail WCAG AA in three of four themes

**Now** (from `node .claude/skills/tailwind-theming/scripts/check-contrast.mjs`,
2026-07-13): white text on status colors fails AA (4.5:1) repeatedly —
theme-dark is worst (`brand-fg`/`brand` **2.98**, `warning-fg` **2.15**,
`info-fg` **2.14**, `success-fg` **2.28**), theme-light fails `info-fg`
(**2.77**) and only large-text-passes success/warning (~3.2–3.3), theme-ocean
fails `brand-fg` (**4.10**). theme-violet passes everything — use it as the
reference for what "right" looks like.

**How:**
- [x] For dark themes, flip the strategy instead of nudging hexes: status
      buttons/badges on dark backgrounds read better as *dark text on the
      lighter status color* — set `--success-fg: #052e16`-style deep shades
      (the violet theme's ≥7:1 pairs prove the approach in-repo).
      (fixed in ui-upgrade-2 §F12: theme-dark error/info flipped, theme-light success darkened, --strict wired to CI)
- [x] For theme-light: darken `--info` toward `#0369a1` and `--warning`
      toward `#b45309` so white text clears 4.5.
- [x] Ocean: raise `--muted`/`--muted-fg` darkness one step (currently 4.46 /
      4.15 — body-size secondary text should clear 4.5); darken `--brand` a
      step for `brand-fg` 4.5+.
- [ ] Re-run the script with `--strict` until exit 0; then add it to
      frontend CI (see Q2) so palettes can't regress.

---

## A — Accessibility upgrades (hand-rolled interactive components)

Radix-backed components inherit their a11y and are excluded here except where
our wrapper undermines it. Work these with the `radix-primitives` skill's
"prefer the platform" rule in mind.

### A1 — Select: form participation + power-user keys

**Now:** solid base — `role="listbox"`/`option`, `aria-expanded`,
`aria-selected`, arrow nav, Escape (`select/select-content.tsx:47-102`). But
no hidden `<input name=…>` (grep: zero `name=` hits in `select/`), so it
can't participate in a plain `<form>` submit; no typeahead; no Home/End; no
scroll-selected-into-view on open.

- [x] Render `<input type="hidden" name={name} value={value}>` when a `name`
      prop is passed.
- [x] Typeahead (accumulate printable keys ~500 ms, jump to match), Home/End,
      and `selectedEl.scrollIntoView({ block: "nearest" })` on open.
      (fixed in ui-upgrade-2 §F13: case-insensitive matching)
- [ ] `aria-activedescendant` on the listbox alternative to moving DOM focus —
      pick one model and note it in the demo page.

### A2 — DropdownMenu: scoped Escape, typeahead, focus return

**Now:** `role="menu"`/`menuitem`, ArrowUp/Down roving focus, first-item
focus on open (`dropdown-menu/dropdown-menu-content.tsx:46-91`). Escape is a
**document-level** listener (`:51`) — it fires even when a nested overlay
(dialog opened from a menu item) is on top; no typeahead/Home/End; focus does
not return to the trigger on close.

- [x] Move Escape onto the menu element's own `onKeyDown` (it has focus
      anyway via roving items) or guard with a topmost-layer check.
      (fixed in ui-upgrade-2 §F2)
- [x] Focus the trigger on close (popover already does this —
      `popover-content.tsx:79` — copy the pattern).
      (fixed in ui-upgrade-2 §F2)
- [ ] Typeahead + Home/End, same helper as A1 (extract
      `src/lib/roving-focus.ts` once, use in select/dropdown/menubar-adjacent
      code — three copies of querySelectorAll roving already exist:
      `select-content.tsx:47`, `dropdown-menu-content.tsx:62`, `tabs-list.tsx:12`).

### A3 — Combobox + Command: complete the WAI-APG combobox pattern

**Now:** Combobox is a button + Command list (`combobox/combobox.tsx`);
Command has arrow nav + `aria-selected` + scroll-into-view
(`command/command-list.tsx:18-42`, `command-item.tsx:59`). Missing on the
Combobox trigger: `role="combobox"`, `aria-expanded`, `aria-controls`,
open-on-ArrowDown; missing on CommandInput: `role`/`aria-activedescendant`
(focus correctly stays in the input — the wiring to announce the active
option is what's absent). No outside-click close and no Escape on the
Combobox popup (Command handles in-list keys only). Also G5's `className`
double-application lives here.

- [ ] Trigger: `role="combobox" aria-expanded={open} aria-controls={listId}`,
      ArrowDown/Enter opens and focuses the input.
- [ ] CommandInput ↔ list: `aria-activedescendant` pointing at the active
      option id; active-option state already exists as `data-selected`.
- [ ] Outside-click + Escape close with focus return (reuse popover's
      handlers — consider literally rebuilding Combobox on `<Popover>` to
      delete the bespoke positioning).
- [ ] `filter` prop for custom/async matching (current filter is hardcoded
      `label.toLowerCase().includes(query)` — fine as default, not as the
      only option).

### A4 — Tooltip: describedby wiring + trigger semantics

**Now:** `role="tooltip"` (`tooltip/tooltip-content.tsx:93,120`), Escape
dismiss (`:43`), 200 ms delay (`tooltip.tsx:35-44`). But no
`aria-describedby` linking trigger → tooltip (role alone announces nothing),
and the trigger wraps children in `role="button"`
(`tooltip-trigger.tsx:101`) — a div-button that re-implements what the
wrapped element usually already is.

- [x] Generate an id (`useId`), set `aria-describedby` on the trigger while
      open.
- [ ] Replace the `role="button"` wrapper with prop-cloning onto the child
      (asChild-style via `cloneElement`, the pattern Radix uses) so a real
      `<Button>` keeps its own semantics; keep a plain-span fallback for text
      triggers.
- [ ] Touch devices: tooltips are hover-only today — use the repo's `touch:`
      variant/device classes to show on long-press or suppress cleanly.

### A5 — Popover: aria-controls + initial focus

**Now:** the best hand-rolled overlay — outside-click, Escape, focus return
(`popover/popover-content.tsx:60-79`), and the trigger already carries
`aria-expanded` + `aria-haspopup="dialog"` (`popover-trigger.tsx:32-33`).
Remaining gaps: no `aria-controls` id pairing, and focus doesn't move into
the panel on open (keyboard users tab from the trigger *past* the open panel).

- [x] `useId` on the content; `aria-controls` on the trigger; `role="dialog"`
      + `aria-label(ledby)` on content.
- [x] Optional `initialFocus` ref prop; default: focus the panel container
      (`tabIndex={-1}`).
      (fixed in ui-upgrade-2 §F4)

### A6 — Tabs: finish the pattern (already 90% WAI-APG)

**Now:** roving tabIndex + ArrowLeft/Right + roles + `aria-selected`
(`tabs/tabs-list.tsx`, `tabs-trigger.tsx:25-29`). Missing: Home/End; tab ↔
panel `aria-controls`/`aria-labelledby` id pairing; optional
`orientation="vertical"` (ArrowUp/Down + `aria-orientation`).

- [x] Add the three; done — this one is nearly finished.
      (fixed in ui-upgrade-2 §F3: orientation implemented, lint warnings resolved)

### A7 — Toast: per-toast semantics and lifecycle control

**Now:** viewport is `role="status" aria-live="polite"`
(`toast/toast-viewport.tsx:17-18`); dismiss is a hardcoded 5 000 ms
`setTimeout` (`toast/toast.tsx:30`); reducer supports ADD/DISMISS only
(`toast-provider.tsx:21-26`).

- [ ] `duration` per toast (`Infinity` = sticky); pause the timer on
      hover/focus of the toast region (WCAG 2.2.1 timing-adjustable).
- [ ] Error/destructive toasts route to an `aria-live="assertive"` sibling
      region (`role="alert"`).
- [ ] Optional `action` slot (button) + queue cap (drop-oldest beyond ~3,
      like the reducer is shaped for).

### A8 — Carousel: name the pattern for AT users

**Now:** embla wiring + prev/next buttons with zero ARIA
(`carousel/carousel.tsx` — no `aria-` hits in the folder).

- [ ] Container `role="region" aria-roledescription="carousel"` +
      `aria-label` prop; each slide `role="group"
      aria-roledescription="slide" aria-label="{i} of {n}"`.
- [ ] `aria-label="Previous slide"/"Next slide"` + `aria-disabled` sync on
      the buttons; announce slide changes via a polite live region.
- [ ] Respect G7 (no autoplay under reduced motion, if autoplay is added).

### A9 — Input family: error message wiring

**Now:** `error` prop → `aria-invalid` + error classes exist
(`input/input.tsx:13,41,49`, `textarea/textarea.tsx:6-23`) — good. But the
error *message* element isn't part of the component, so nothing links it via
`aria-describedby`; every form re-invents the message row.

- [x] Accept `error?: string | boolean` + optional `description`; when
      strings, render `<p id={…}>` rows and wire `aria-describedby`
      (message id + description id). Same for Textarea, InputOTP, Select,
      Combobox, DatePicker, TimeInput — one shared `FieldMessages` partial.
      (fixed in ui-upgrade-2 §F1: FieldMessages ids wired, 5 components adopted)
- [x] This is 80% of a `Field` wrapper — see N1 before building it twice.

### A10 — Date & time (work with the `datetime-inputs` skill)

- [ ] DatePicker panel: outside-click + Escape + focus return (it's a raw
      `open && <div>` today, `date-picker/date-picker.tsx` — same treatment
      as A3, or rebuild on Popover).
- [ ] TimeInput: group the selects in a labelled container
      (`role="group" aria-label={label}`) so "hours/minutes" reads as one
      control; each `<select>` gets its own `aria-label`.
- [ ] Calendar: verify react-day-picker v10's built-in a11y props against the
      installed `.d.ts` (don't trust v8/v9 memory — skill rule) and pass
      labels for nav buttons; events get `aria-label` summaries on their day
      cells.

### A11 — Small fry (verify, likely quick)

- [ ] breadcrumb/pagination: already carry ARIA (5 hits each) — verify
      `aria-current="page"` on both; add `rel="prev|next"` links opt.
- [ ] switch: native input + `role="switch"` (`switch/switch.tsx:16-18`) ✓ —
      just add a demo of labelled usage with `<Label htmlFor>`.
- [ ] checkbox: indeterminate + group tri-state already exist
      (`checkbox/indeterminate-checkbox.tsx`, `checkbox-group.tsx:61`) ✓ —
      demo page should show it.
- [x] table: add `<caption>`/`aria-label` support + `scope="col"` on headers;
      `aria-sort` once V5 sorting lands.

---

## V — Visual & API polish (per family; every component gets its line)

Design work here follows the `frontend-design` skill: one deliberate look,
executed with restraint — the token system is the palette, `theme-violet` is
the contrast reference, and the four global styles (G1) are where the
personality budget goes. No new hues, no hardcoded colors.

### V1 — Actions: button, toggle, toggle-group, counter, scroll-to-bottom-button
- [~] Button: `loading` prop (Spinner swap-in + `aria-busy` + width-stable),
      `asChild`-style composition for link-buttons, document the
      shadow-on-hover default (it surprises on dark themes — consider
      variant-scoped shadows instead of global `hover:shadow-md`,
      `button/button.tsx:27`).
      *(verify 2026-07-13: loading ✓ — spinner + `aria-busy` + disabled,
      button.tsx:36-63 — but children are replaced by the spinner, so width
      is not stable; `asChild` absent; `hover:shadow-md` still global and
      undocumented, button.tsx:29.)*
- [~] toggle/toggle-group (Radix): **bug** — `toggle/toggle.tsx` styles hover
      with `hover:text-muted-foreground`, a shadcn token that doesn't exist
      in this theme system (ours is `text-muted`) — the class silently
      no-ops; it also uses `disabled:opacity-50` where the library standard
      is `opacity-40`. Fix both, then add `variant`/`size` maps matching
      button's scale.
      *(verify 2026-07-13: both class fixes ✓ (toggle.tsx:12,25) and variant
      map ✓ (default/outline + global styles); `size` map absent, and
      ToggleProps declares font-trio props the component never consumes —
      they leak into `{...props}` onto the DOM button.)*
- [ ] counter: keyboard step (Arrow keys), `min/max/step` props, long-press
      repeat; it's the only tested component — extend that test alongside.
- [ ] scroll-to-bottom-button: fold into anatomy (G6 demo) + `aria-label`
      review; expose `threshold` prop.

### V2 — Form inputs: input(-with-icon/date/date-time/file), input-group, input-otp, textarea, native-select, label
- [ ] input family (594 LOC, 6 files): decide the overlap — `date-input.tsx`
      / `date-time-input.tsx` duplicate date-picker/calendar territory;
      either delete in favor of DatePicker or re-export them as thin native
      (`<input type="date">`) alternatives with a doc comment saying when to
      use which. Add `size` map (`sm/md/lg`) shared via `input-styles.ts`.
- [ ] file-input: drag-over state uses tokens (`border-brand bg-brand/5`),
      show selected-file chips with remove buttons, `accept`/multiple demo.
- [ ] input-group: currently 10 LOC — grow into addon slots (prefix/suffix,
      button attach) with `first:rounded-l`/`last:rounded-r` seams.
- [ ] input-otp: verify paste-splitting + `autocomplete="one-time-code"`,
      `inputMode="numeric"`; add `length` prop demo.
- [ ] textarea: `autoResize` opt (there's an AutoResizeTextarea type in
      `types/ui/` — reconcile), char-count slot tied to `maxLength`.
- [ ] native-select: chevron via background-image inherits `currentColor`?
      verify RTL + dark; add size map parity with input.
- [ ] label: `required` marker (`after:content-['*'] after:text-error`) +
      `disabled` dimming when paired control is disabled.

### V3 — Overlays: dialog, alert-dialog, confirm-dialog, sheet, drawer, popover, tooltip, hover-card, context-menu, dropdown-menu, menubar
- [~] dialog: `size` prop (`sm/md/lg/full` widths — hardcoded `sm:max-w-lg`
      today, `dialog/dialog-content.tsx`), sticky header/footer with
      scrollable body region, G7 reduced-motion, G8 scrim token.
      *(verify 2026-07-13: size ✓ (dialog-content.tsx:16-21), reduced-motion
      ✓ (:104-111), scrim token ✓ (:117); sticky header/footer not
      implemented — the whole dialog scrolls as one region.)*
- [ ] alert-dialog (Radix) + confirm-dialog: default initial focus on the
      *cancel* button (safe default for destructive confirms); confirm-dialog
      gets `variant="destructive"` styling the action with `bg-error`.
- [ ] sheet: side variants (`left/right/top/bottom`) + size map if not
      present; align its overlay with G8.
- [~] drawer: **bug** — the drag-handle div has no background class so it's
      invisible (`drawer/drawer.tsx:25`: `h-1.5 w-12 rounded-full` with no
      `bg-*`); add `bg-muted/40`. Add snap points demo (vaul supports).
      *(verify 2026-07-13: handle fixed ✓ — `bg-muted/40`, drawer.tsx:25;
      snap-points demo absent — no `snapPoints` usage anywhere in the repo.)*
- [ ] popover: `side`/`align` props if not complete; arrow element opt.
- [ ] tooltip: shrink it — 366 LOC across 4 files for a tooltip suggests
      duplicated render paths (two `role="tooltip"` blocks at
      `tooltip-content.tsx:93,120`); unify to one positioned renderer.
- [ ] hover-card/context-menu/menubar (Radix): add `data-[state=open]`
      fade/zoom animations consistent with dialog's curve
      (`cubic-bezier(0.16,1,0.3,1)`), consistent `sideOffset={4}`.

### V4 — Navigation: tabs, navigation-menu, breadcrumb, pagination
- [ ] tabs: `variant` map (`underline` default, `pills`, `enclosed`);
      animated active indicator (single sliding element, respects G7).
- [ ] navigation-menu (Radix): viewport-position styling for submenu panels;
      mobile fallback documented (NavigationOverlay exists in layout/ —
      cross-link, don't duplicate).
- [ ] breadcrumb: collapse-middle overflow (`…` menu after N items) using
      DropdownMenu; add types file (G6).
- [ ] pagination: `siblingCount`/`boundaryCount` ellipsis logic as props
      (verify current hardcoding), compact variant for mobile via `touch:`.

### V5 — Data display: table, card, badge, avatar, accordion, aspect-ratio, carousel, collapsible, empty, kbd, typography, separator, scroll-area, page-info
- [ ] table: density variants (`compact/normal`), sticky header opt
      (`sticky top-0 bg-surface`), row hover + selected states, sortable
      header cell component emitting `aria-sort` (pairs with A11).
- [ ] card: interactive variant (hover lift + focus ring when it wraps a
      link), header/footer separators opt; `as` prop for `article/section`.
- [ ] badge: dot + removable (× button) variants; count overflow (`99+`).
- [ ] avatar: image error → initials fallback via `@/lib/initials.ts`
      (verify it's wired, it exists in lib), status-dot slot, group overlap
      already exists (AvatarGroup) — demo max+overflow count.
- [ ] accordion (Radix): chevron rotation via `data-[state=open]:rotate-180`,
      `type="multiple"` demo.
- [ ] aspect-ratio (Radix, 10 LOC): fine — just G6 types + demo parity.
- [ ] carousel: dots/thumbs indicator component, loop + align options
      surfaced from embla `opts` (typed, not `Parameters<>` inference —
      `carousel/carousel.tsx:32`).
- [ ] collapsible (Radix): animated height via
      `data-[state]` + `--radix-collapsible-content-height` CSS var.
- [ ] empty: `icon`/`action` slots (it's text-only today); use in feed/search
      empty states to dogfood.
- [ ] kbd: sequence support (`<Kbd keys={["⌘","K"]}>` with `+` separators);
      it already reads the font trio — good citizen, small polish only.
- [ ] typography: align its scale with the type ramp the `frontend-design`
      skill pushes — one display size with real personality, disciplined
      body sizes; add `prose`-like article wrapper for docs pages.
- [ ] separator: `label` variant (text-in-middle divider).
- [ ] scroll-area (Radix): themed scrollbar thumb (`bg-muted/40`), auto-hide
      delay prop.
- [ ] page-info: add missing demo page (G6) then evaluate — likely fold into
      typography/empty patterns.

### V6 — Feedback & status: alert, toast, progress, spinner, logo-spinner, skeleton, error-boundary
- [ ] alert: already 4 variants + ucv ✓ — add `icon` auto-selection per
      variant (success→check etc., Tabler icons) and dismissible opt.
- [ ] toast: A7 covers behavior; visually add per-variant left border
      (`border-l-2 border-l-success` style) so variants scan at a glance.
- [ ] progress (Radix): `indeterminate` mode (looping bar, G7-aware),
      value label opt (`aria-valuetext`).
- [ ] spinner: size map aligned with button sizes so `loading` buttons (V1)
      compose cleanly.
- [ ] logo-spinner: G6 anatomy; expose `size`; ensure it uses `text-brand`
      not a hardcoded fill.
- [ ] skeleton + skeleton-shapes: merge into `skeleton/` (G6); shimmer
      animation with `motion-reduce:animate-none`; shape presets (text
      lines, avatar+lines, card) already sketched in skeleton-shapes —
      finish and demo them.
- [ ] error-boundary: `fallback` render-prop + `onReset`/`resetKeys` (retry
      button wired to remount), report into `@/lib/exception-handler`; add
      demo page (G6) with a throw-on-click bomb.

### V7 — Date & time: calendar, date-picker, time-input (with `datetime-inputs` skill)
- [ ] calendar: events already cap at 3/day (`calendar/calendar.tsx:92`
      `dayEvents.slice(0, 3)`) but the overflow is silently dropped — add a
      "+N more" affordance (popover with the full list); week-start from
      locale; min/max + disabled-dates pass-through (verify v10 prop names
      against installed `.d.ts` first — skill rule).
- [ ] date-picker: `mode="range"` + presets column ("Today", "Last 7 days"),
      `min/max`, close-on-select opt, format via `formatDate*` helpers only.
- [ ] time-input: minute `step` (5/15/30 lists), 12/24h default from
      `ClientLocaleProvider` locale instead of a hardcoded prop default;
      keep native selects (deliberate — don't popover-ify).

### V8 — Layout & utility: resizable, hover-card, input-group (covered V2), confirm-dialog (covered V3)
- [ ] resizable (react-resizable-panels): keyboard resize verification +
      visible handle grip (same fix family as drawer's invisible handle),
      `autoSaveId` persistence demo.

---

## Q — Quality infrastructure (what makes the above stick)

### Q1 — Test floor: 1/57 components have tests

**Now:** only `counter` has a colocated test inside `ui/`. The stateful,
logic-bearing components ship untested.

- [ ] Priority order (logic density × usage): select, dropdown-menu, tabs,
      toast (reducer + timers), combobox/command, dialog (open/close/cancel
      events), popover, pagination (ellipsis math), time-input (12/24
      conversion, `formatHour`), date-picker, checkbox-group (tri-state),
      resolveVariant + fontClasses utils (G2/G4).
- [ ] Pattern: vitest + @testing-library/react, keyboard-first assertions
      (`await user.keyboard("{ArrowDown}")` then role queries) — the a11y
      items in section A become the test specs.

### Q2 — Automated a11y smoke over the demo pages

The demo-page parity (G6) makes this cheap: every component already has a
route to point a browser at.

- [ ] Add `@axe-core/playwright`; write one Playwright spec (per the
      `webapp-testing` skill: black-box script, server managed by
      `with_server`-style lifecycle or `pnpm dev` reuse) that walks
      `/…/ui/<name>` demo routes, runs axe, fails on serious/critical.
- [ ] Wire into frontend CI next to lint/typecheck/test; add the contrast
      script `--strict` run (T1) to the same job.

### Q3 — Keep the skills in sync (they are the conventions doc)

- [x] When G1–G8 land, update `ui-components` / `tailwind-theming` /
      `radix-primitives` / `datetime-inputs` SKILL.md files in the same PR
      (AGENTS.md "Agent Skills" section: a stale skill is misinformation).
      New conventions introduced by this plan that must be written back:
      `resolveVariant`, `fontClasses`, `global-style-variants`, `--overlay`
      token, roving-focus helper.

---

## N — New primitives (backlog — only after G/A phases)

- [ ] **N1 Field** — label + control + description + error composition
      wiring `htmlFor`/`aria-describedby` once (A9 does the per-input half;
      Field is the layout half). API: `<Field label error description required>`.
- [ ] **N2 Stepper** — multi-step progress for checkout/onboarding flows
      (billing feature exists; dogfood there).
- [ ] **N3 Tag/Chip input** — combobox + removable badges composition.
- [ ] **N4 Data list / description list** — settings pages currently
      hand-roll dl patterns.

---

## Coverage index — every component → its items

| Component | Backing | Items |
|---|---|---|
| accordion | Radix | V5, G6-demo ✓has |
| alert | custom | V6 (✓ already ucv + 4 variants) |
| alert-dialog | Radix | V3, G6-types |
| aspect-ratio | Radix | G6-types, V5 |
| avatar | custom | V5 |
| badge | custom | V5 |
| breadcrumb | custom | A11, V4, G6-types |
| button | custom | G1-G4, V1 |
| calendar | day-picker | A10, V7 |
| card | custom | V5, G3 |
| carousel | embla | A8, V5, G6-types, G7 |
| checkbox | native | A11 ✓mostly done |
| collapsible | Radix | V5, G6-types |
| combobox | custom | **A3, G5** (hot spot) |
| command | custom | A3 |
| confirm-dialog | custom | V3, G6-demo |
| context-menu | Radix | V3 |
| counter | custom | V1, G6-demo (only tested component ✓) |
| date-picker | custom | A10, V7, G5-check |
| dialog | native `<dialog>` | V3, G7, G8 |
| drawer | vaul | **V3 bug: invisible handle**, G8 |
| dropdown-menu | custom | A2, V3 |
| empty | custom | V5 |
| error-boundary | custom | V6, G6-demo |
| hover-card | Radix | V3 |
| input (+5 subfiles) | native | A9, V2 (consolidation decision) |
| input-group | custom | V2, G6-types |
| input-otp | custom | V2 |
| kbd | custom | V5 |
| label | native | V2 |
| menubar | Radix | V3 |
| native-select | native | V2, G6-types |
| navigation-menu | Radix | V4 |
| page-info | custom | V5, G6-demo |
| pagination | custom | A11, V4, G6-types, Q1 |
| popover | custom | A5, V3 |
| progress | Radix | V6, G3 ✓ucv |
| radio-group | Radix | (cross-cutting only) |
| resizable | resizable-panels | V8 |
| scroll-area | Radix | V5 |
| scroll-to-bottom-button | custom | V1, G6-demo |
| select | custom | **A1, Q1** (hot spot) |
| separator | custom | V5 |
| sheet | Radix dialog | V3, G8 |
| skeleton (+shapes) | custom | V6, G6-anatomy, G7 |
| slider | Radix | (cross-cutting only) |
| spinner | custom | V6 |
| switch | native | A11 ✓mostly done |
| table | custom | A11, V5, G6-types |
| tabs | custom | A6 (nearly done), V4, Q1 |
| textarea | custom | A9, V2 |
| time-input | native selects | A10, V7, Q1 |
| toast | custom | A7, V6, Q1 |
| toggle | Radix | **V1 bug: dead `text-muted-foreground` class**, G6-types |
| toggle-group | Radix | V1, G6-types |
| tooltip | custom | A4, V3 (366 LOC diet) |
| typography | custom | V5 |
| LogoSpinner (stray) | custom | V6, G6-anatomy |

---

## Execution order

1. **Phase 1 — system correctness:** G2 → G1 → G3 (variant system made
   sound), G5, G6, T1 (+contrast `--strict` green). Everything else builds
   on these.
2. **Phase 2 — accessibility:** A1–A11, extracting the shared helpers
   (roving-focus, FieldMessages) as they recur; Q1 tests written per item
   as the acceptance criteria.
3. **Phase 3 — polish:** V1–V8 family by family, G7/G8 riding along; Q2 axe
   smoke lands at the start of this phase so polish can't regress a11y.
4. **Phase 4 — backlog:** N1–N4, and Q3 skill-sync as the closing PR of each
   phase (not a separate phase — noted here so it isn't dropped).

**Verification per item:** `pnpm lint && pnpm typecheck && pnpm test` in
`next-js-boilerplate/`; contrast script for anything touching tokens; the
relevant demo page eyeballed in light + dark at minimum (all four themes for
G1/T1 work); axe smoke once Q2 exists. Per the phased-roadmap convention,
annotate items `[x]`/`[~]` with evidence inline rather than deleting them.
