# UI upgrade 3 — broken systems, missing components, showcase to template grade

> Written 2026-07-14, immediately after the ui-upgrade-2 verification pass
> (post-commit 22d0664 + inline downgrades). Four workstreams, in priority
> order:
>
> **Part U — user-reported defects & gaps** (found testing
> `https://app.eys.gen.tr/v1/en/ui/*`): the toast system renders nothing at
> all, the date-picker panel is broken on small screens and has no
> month/year navigation or month-only/year-only picking, the checkbox has
> no checkmark glyph (and we want non-conventional variants: cards, chips),
> and file/image upload components don't exist.
>
> **Part C — carry-over closeout**: every item the ui-upgrade-2
> verification downgraded, restated here with the *concrete fix* (that doc
> recorded what failed; this one says how to repair it). When a C-item
> lands, flip the matching `[~]`/`[ ]` in `ui-upgrade-2.md` to `[x]` citing
> this doc — and this time actually do the flips (the same instruction was
> ignored across ui-upgrade → ui-upgrade-2; `grep -c 'ui-upgrade-2'
> docs/progress/ui-upgrade.md` was 0 at verification).
>
> **Part V — visual system upgrade, every component** (full library audit
> 2026-07-14, class-level evidence inline): the library has no single
> visual voice — radius, elevation, heights, motion, and state styling
> drift per component; five components hardcode palette colors internally;
> one references a token that doesn't exist. V0 defines the design
> language once; V1–V6 conform all ~58 components to it, family by
> family, each with its concrete fix.
>
> **Part S — showcase to template grade**: this is a boilerplate; the demo
> pages are its shop window. Rebuild the examples to the standard of the
> Tailwind Plus / shadcn-blocks ecosystems — composed, real-life blocks
> (login cards, settings panels, pricing, invoices), not prop dumps — and
> finally deliver the Variant Gallery tabs ui-upgrade-2 promised on every
> roster page.
>
> **Standing app constraints (unchanged from ui-upgrade-2):** no visible
> scrollbars anywhere (`globals.css:358-363`), the ui layout pans by
> drag/swipe on `scrollTop` (`useYSwipeGesture` — it *scrolls*, it does not
> transform, so `position: fixed` still works but anything inside the
> scroll container must fit or fade); every demo tab must fit the viewport
> below the sticky header; drags starting on
> `button/a/input/textarea/[contenteditable]` don't pan. Demo copy stays
> English. Token-only styling everywhere (`tailwind-theming` rules).
>
> **Gates for every item:** `pnpm lint && pnpm typecheck && pnpm test` in
> `next-js-boilerplate/`; contrast `--strict` (already in
> `frontend-ci.yml:51`); eyeball light + dark minimum, all four themes for
> gallery work; plus the item's own named grep/behavior gate. Statuses:
> `[ ]` open, `[x]` done, `[~]` partial — annotate inline with evidence.

---

## Part U — User-reported defects & missing capability

### U1 — Toast: the system literally renders nothing (CRITICAL)

**Now:** every `toast()` call dispatches into state that no component ever
renders. The chain: `useToast` dispatches ADD (`use-toast.ts:15-22`) →
`ToastProvider` stores state (`toast-provider.tsx:45-53`) →
`ToastViewport` is a dumb positioned `<div>` that never reads context and
is self-closed everywhere (`toast-viewport.tsx:14-25`, `app/layout.tsx:85`)
→ `<Toast>` expects an `id` prop and looks itself up in state
(`toast.tsx:18-19`) but **is instantiated nowhere in the entire codebase**
(`grep -rn '<Toast[ >]' src/` → zero hits). Every button on
`/v1/en/ui/toast` is a silent no-op — this is the "most of the examples
aren't working" report, and it's not "most", it's all, app-wide (any
future feature calling `toast()` would no-op too). Bonus defects: the
toast demo mounts its own nested `ToastProvider`+`ToastViewport` per tab
(`views/ui/toast/PageContent.tsx:192-207`) shadowing the app-level one,
and `toast.tsx:36-40` uses hardcoded `red-50/green-50/…` palette classes.

- [x] **Make the viewport render the queue.** `ToastViewport` consumes
      `useToastContext()` and maps `state` → `<Toast key={t.id} id={t.id}>`
      children; portal the viewport to `document.body`
      (`createPortal`, same pattern as popover/dropdown content) so
      `position: fixed` can never be trapped by a scrolling/transformed
      ancestor. Keep the `role="status" aria-live="polite"` region
      permanent (SRs need the live region mounted before content changes).
- [x] **One provider, app-level.** Delete the nested
      `ToastProvider`/`ToastViewport` from the toast demo page — demos use
      the root provider from `app/layout.tsx:79-86`. Gate:
      `grep -rn '<ToastProvider' src/views/` returns empty.
- [x] **Tokens.** Replace `toast.tsx:36-40` hardcoded palette with
      semantic tokens: destructive → `bg-error/10 border-error/40
      text-error` (or solid `bg-error text-error-fg`), success →
      `bg-success/10 border-success/40 text-success`; verify contrast in
      all four themes.
- [x] **Close ui-upgrade A7 while the file is open** (it's why two D3
      toast tabs were deferred): `action?: ReactNode` slot (Undo button),
      `duration?: number | Infinity` (default 5000; destructive defaults
      to `Infinity` per A7's "sticky error"), pause-on-hover +
      pause-on-focus (store remaining time, not a fixed setTimeout),
      `aria-live="assertive"` for destructive, exit animation
      (motion-reduce safe), cap visible stack at ~3 with a queue.
- [x] **Tests + demo acceptance:** unit test — render provider+viewport,
      call `toast()`, assert the toast appears and auto-dismisses (fake
      timers), action slot fires, hover pauses. All four D3 toast tabs
      ("Variant Basics", "Undoable Action", "Sticky Error", "Hover Pause")
      work — click every button on `/v1/en/ui/toast` and see a toast.

### U2 — DatePicker: responsive panel (the "ugly on small" modal)

**Now:** the calendar pops in a bare `absolute z-50 mt-1` div under the
trigger (`date-picker.tsx:101-112`): no collision handling (clips off the
right edge / bottom of small viewports), no mobile treatment, competes
with the sticky demo header at the same `z-50`, and no outside-click or
Escape handling of its own. Meanwhile the repo already has a Popover with
exactly the needed behavior: desktop anchored panel + mobile fullscreen
sheet + `initialFocus` (F4) + Escape/outside-click + focus return.

- [x] Rebuild the popup on **our Popover** (`Popover`, `PopoverTrigger`
      with `asChild`-like trigger reuse, `PopoverContent
      initialFocus={calendarRef}`): desktop = anchored panel, small
      screens = the popover's fullscreen mobile branch, so the calendar
      gets a real full-width sheet with a close affordance instead of a
      clipped floating box. If Popover's mobile branch needs a "panel
      title" prop to say "Pick a date" instead of hardcoded "Menu"
      (`popover-content.tsx:126`), add it — that hardcoded "Menu" label is
      wrong for every non-menu popover anyway.
- [x] Desktop collision handling in PopoverContent (shared win): flip
      above the trigger when `triggerRect.bottom + panelHeight >
      innerHeight`, clamp `left` to `[8, innerWidth - width - 8]` (it
      already clamps left at 8 — finish the job). Cover with a unit test
      on the positioning helper (extract it to a pure function).
- [x] Compact calendar scale for narrow widths: day cells sized with
      `clamp()`/container queries so a 360px viewport fits the 7-column
      grid with padding; month caption + dropdowns wrap, not overflow.
- [x] Acceptance: on a 360×740 viewport, open the picker on
      `/v1/en/ui/date-picker` — panel fully visible, no horizontal
      clipping, Escape and outside-tap dismiss, focus returns to trigger;
      desktop panel flips above near the viewport bottom.

### U3 — DatePicker: month/year navigation + month-only / year-only picking

**Now:** the calendar header is prev/next-month arrows only — reaching a
birthdate means ~300 clicks. The Calendar wrapper *already forwards all
DayPicker props* and even styles the dropdown classNames
(`calendar.tsx:46-47`), but nothing passes `captionLayout`. And there is
no month-year (`MM/YY`) or year-only selection mode at all
(react-day-picker has no month/year-only picker — that view must be ours).

- [x] **Jump navigation:** `DatePicker` accepts and forwards
      `captionLayout="dropdown"` (default it to `dropdown` — better
      boilerplate default), `startMonth`/`endMonth` (default 1900-01 →
      today+10y). Style pass on the existing `dropdowns`/`dropdown`
      classNames so the selects match our Select trigger look (token-only).
- [x] **`picker` prop:** `picker?: "day" | "month" | "year"` (default
      `"day"`).
      - `"month"`: panel shows a year header with prev/next-year arrows +
        a 3×4 month grid (Jan–Dec buttons, `aria-pressed` on the selected
        one); selecting returns the first of that month; trigger displays
        via `formatDate*` month-year output (`@/lib/date-time` — never
        hand-rolled `Date` math, per the datetime-inputs skill).
      - `"year"`: 12-year page grid with prev/next-page arrows; returns
        Jan 1 of the year; trigger shows `YYYY`.
      - Implementation note: these are two small grid views inside the
        panel component, state-machine'd (`view: "days" | "months" |
        "years"`); `captionLayout="dropdown"` covers day-mode jumping, the
        grids cover month/year *picking*. Keyboard: arrows move in the
        grid, Enter selects, Escape backs out one view.
- [x] Wire F1 messages + variants through the new panel path (F9 landed
      the trigger; keep it).
- [x] Demos (this resolves the ⧗V7-format deferrals from ui-upgrade-2 D3):
      **"Card Expiry"** (`picker="month"`, MM/YY readout), **"Birthdate"**
      (`captionLayout="dropdown"`, 1900→now), **"Year Only"**
      (`picker="year"`, e.g. "Graduation year"). Unit tests for the
      month/year grids (select → value, keyboard nav).

### U4 — Checkbox: draw the checkmark, then go beyond the checkbox

**Now:** the input is `appearance-none` with `checked:bg-brand
checked:border-brand` and **nothing else** (`checkbox.tsx:11-14,28`) —
checked state is a featureless brand-colored square (the native glyph is
suppressed by `appearance-none`, and no replacement was drawn). No
indeterminate visual either (the "Select All" tri-state demo can't
actually show a mixed state). That's the "weird looking" report.

- [x] **Fix the base control:** keep the native `<input type="checkbox">`
      (free form participation + a11y) but wrap it: `relative` span,
      input stays `peer appearance-none`, and an absolutely-centered SVG
      check (`opacity-0 peer-checked:opacity-100`, `text-brand-fg`,
      2px stroke, ~120ms ease-out, motion-reduce safe) plus a minus-icon
      shown when `indeterminate` (drive via ref effect on the DOM
      property + a `data-indeterminate` attr for styling). Bump default
      size to `size-4.5`/18px with a `size?: "sm" | "md" | "lg"` scale,
      `rounded-[5px]`, label in `text-fg` (not `text-muted` — it reads
      disabled today, part of the "weird").
- [x] **CheckboxCard** (the non-conventional ask, shadcn-blocks' choice
      card pattern): whole card is the label — icon/title/description
      slots + optional check indicator corner; unchecked `border-border
      bg-surface`, checked `border-brand bg-brand/5` + visible
      focus-within ring; works single (radio-like with RadioGroup) and
      multi (checkbox). New component folder `checkbox-card/` per ui
      conventions (types file, variant map incl. global styles, barrel).
- [x] **CheckboxChip** (filter-chip style): rounded-full pill toggling
      `bg-brand text-brand-fg` when checked, with optional count and ×
      affordance — for the "Board Filters"-type scenarios.
- [x] Demos: rebuild `/v1/en/ui/checkbox` tabs — "Terms Consent" (base,
      error via F1), "Select All" (real indeterminate), **"Plan Cards"**
      (CheckboxCard grid), **"Interest Chips"** (CheckboxChip set),
      "Variant Gallery". Tests: check/uncheck, indeterminate rendering,
      card keyboard toggling (Space on focused card).

### U5 — FileUpload + ImageUpload: net-new components

**Now:** nothing exists (`grep -rli 'upload|dropzone' src/components/` —
no component hits). For a boilerplate this is a table-stakes gap — every
rated shadcn registry ships one (see References).

- [x] **`FileUpload`** (`src/components/ui/file-upload/`): a dropzone
      built on a real `<input type="file">` (keyboard/SR accessible via
      label-wrapping; no new dependency — drag events are ~30 lines:
      dragenter/dragleave counter + drop reading
      `e.dataTransfer.files`). Props: `multiple`, `accept`,
      `maxSizeBytes`, `maxFiles`, controlled `files: UploadFile[]` /
      `onFilesChange`, optional `onUpload(file, reportProgress) =>
      Promise` so callers wire any backend (the NestJS side or none —
      demo simulates). Renders: dashed drop area (drag-over state =
      `border-brand bg-brand/5`), file rows (type icon, name, human size
      via a small helper, per-file progress bar reusing `Progress`,
      remove button), validation errors surfaced through the F1
      `useFieldMessages` path (`error` per rejected file: too large,
      wrong type, too many). Variant map + global styles + fontClasses
      per convention; unit tests for validation + controlled flow.
- [x] **`ImageUpload`** (`src/components/ui/image-upload/`): builds on
      FileUpload's core with thumbnail previews (`URL.createObjectURL`,
      revoked on remove/unmount), grid layout for multi, replace-on-click
      for single, and an **avatar mode** (circular preview, "change
      photo" overlay) — the profile-form staple. `aspect` hint prop
      (square/video) using our AspectRatio.
- [x] Two new demo pages + routes (`file-upload`, `image-upload`),
      registered in the index gallery (coverage becomes **60 pages**).
      Tabs — file-upload: "Document Dropzone" (multi + simulated
      progress), "Single CV Upload" (one file, accept=.pdf, size cap),
      "Validation States" (rejections as field messages); image-upload:
      "Avatar Upload" (circle), "Gallery Upload" (multi grid + remove),
      "Cover Image" (16:9 with AspectRatio). All fit-viewport; long lists
      cap at ~4 rows then count badge.
- [x] Skill-doc: add both to the `ui-components` SKILL.md component list
      and to the roster if they join the variant system (they should).

---

## Part C — Carry-over closeout (everything ui-upgrade-2 verification downgraded)

Each item names the downgrade evidence and the exact repair. Land these
family-by-family alongside Part U/S work touching the same files.

### C1 — Button width-stable loading (was F5 bullet 1, `[ ]`)

`button.tsx:96-104` swaps children for the spinner → width jumps. Fix:
make the button `relative`; always render `<ButtonContent>` but toggle it
`invisible` (not `hidden` — keeps its box) when loading; overlay
`<span className="absolute inset-0 inline-flex items-center
justify-center"><Spinner/></span>`. Keep `aria-busy` + disabled. Demo
proof: "Form Actions" submit button shows no layout shift while pending
(readout of `offsetWidth` before/during in the demo makes it visible).

- [x] Implement + demo readout; test asserts children remain in the DOM
      (`toBeInTheDocument` + class `invisible`) while `aria-busy`.

### C2 — Button asChild: merge, don't clobber; and demo it (was F5 bullet 2, `[~]`)

`button.tsx:84-92` `cloneElement` overrides the child's own
`onClick`/`ref`. Fix: compose handlers (`(e) => { childProps.onClick?.(e);
props.onClick?.(e); }`), merge refs with a tiny `composeRefs`, keep the
className merge. Demo: "Link Button" example — `<Button asChild
variant="primary"><Link href…>Docs</Link></Button>` on the button page.

- [x] Implement merge + add the demo tab content + test (child onClick
      still fires alongside button onClick).

### C3 — Button shadow decision note (was F5 bullet 3, `[~]`)

The move (base `shadow-xs`; `hover:shadow-md` only on `default` +
`shadow` variants) is fine — it just was never written down. Fix: 3-line
comment above `variants` in `button-styles.ts` stating exactly that and
why (hover-lift reserved for surface-colored variants; flat variants stay
flat).

- [x] Write the comment.

### C4 — Dialog: actually pin header/footer (was F7, `[~]` + `[ ]`)

Classes were sprinkled but the scroll container sits *above*
header/footer: everything renders inside one `overflow-y-auto` wrapper
through a plain block div (`dialog-content.tsx:126,152`), so `shrink-0`
on header/footer does nothing. Fix:

- [x] Restructure DialogContent: `<dialog>` keeps `flex flex-col
      overflow-hidden`; the close button becomes a sibling positioned
      absolute (out of flow); **children render directly into the flex
      column** (drop the `overflow-y-auto` wrapper and the
      `pointer-events-auto` block div, or make the wrapper `flex flex-col
      min-h-0 flex-1 overflow-hidden`). Export a **`DialogBody`**
      (`min-h-0 flex-1 overflow-y-auto p-6`) from the dialog barrel;
      DialogHeader/Footer keep `shrink-0` + take over the padding
      (`px-6 pt-6` / `px-6 pb-6`).
- [x] Because scrollbars are hidden app-wide, DialogBody gets the
      **scroll-fade treatment** (S4): CSS mask fading top/bottom edges
      when scrollable — the affordance replacing the scrollbar.
- [x] Demo: the missing **"Terms Scroll"** tab (long ToS body; title +
      accept/decline pinned) and **"Nested Confirm"** tab (dialog →
      confirm-dialog, Escape closes only the top layer) on
      `/v1/en/ui/dialog`.

### C5 — Dropdown/menu item handler clobbering (new defect from verification)

`DropdownMenuItem` defines `onClick`/`onKeyDown` *before* `{...props}`
(`dropdown-menu-item.tsx:21-41`) — any consumer `onClick` replaces the
handler that calls `closeAndFocusTrigger()`, so the menu wouldn't close.
Same spread-order risk in `dropdown-menu-content.tsx:106`.

- [x] Fix by destructuring `onClick`/`onKeyDown` out of props and
      composing them inside the internal handlers (consumer handler runs
      first, then close+refocus unless `e.defaultPrevented`).
- [x] Audit the same pattern across select-item, context-menu, menubar,
      command items: gate — for each interactive wrapper, either handlers
      are destructured+composed or the component takes none from props.
- [x] Test: item with a consumer `onClick` still closes the menu and
      refocuses the trigger on click and on Enter/Space. The
      "Destructive Item" demo tab (C8) dogfoods it.

### C6 — fontClasses grep-gate, for real this time (was F11, `[~]`)

`button.tsx:69` and `input.tsx:29` still inline `fontSize || …` in the
first arg. Fix: move the fallback to the second arg —
`fontClasses({ fontSize, fontWeight, fontFamily }, { fontSize:
sizes[size].split(" ")[2])` (button; input keeps its `font-normal`
weight default there too). Gate: `grep -rln 'fontSize ||'
src/components/ui/` returns empty.

- [x] Sweep + gate green.

### C7 — Roster truth + skill-doc sync (was F10 `[~]`, F14 `[ ]`, F8 comment)

- [x] Recount the `useComponentVariant` roster (currently **21**: the 18
      listed in ui-upgrade-2 plus card, command, kbd — plus whatever U4/U5
      add) and write it into `ui-components` SKILL.md as a named list.
- [x] Replace SKILL.md's demo-page sentence ("showing every variant/size")
      with the ExampleTabs convention: named real-life tabs, description
      line, Variant Gallery last for roster members, viewport-fit rule,
      `UIExample[]`/`ExampleTabs` file anatomy.
- [x] Fix ui-upgrade-2 F10 bullet-1's wrong "N/A" note (it claimed the
      roster was complete at 18 while card/command/kbd already consumed).
- [x] One-line doc comment on `drawer.tsx:6` (`Drawer =
      DrawerPrimitive.Root`) noting vaul props like `snapPoints` pass
      through (F8's missing half).

### C8 — Finish the Part D migration (was D3 rows `[ ]`/`[~]`)

The fan-out relabeled two tabs per page and stopped. Complete it:

- [x] **Migrate the three untouched pages** — command, popover,
      dropdown-menu — to `ExampleTabs` with their D3 matrix tabs
      (popover's "Inline Form" finally demos F4 `initialFocus`;
      dropdown-menu's "Destructive Item" dogfoods C5).
- [x] **De-shell select and input**: dissolve `SelectDemo`/`InputDemo`
      into per-scenario examples (no nested Tabs, no duplicate `<h2>`,
      no "Coming soon." placeholders — build "Long List", "Plain Form
      Submit", "Search Field", "Amount Field" for real).
- [x] **Delete all eight `*Demo.tsx` leftovers** (command, dialog,
      dropdown-menu, input, popover, select, tabs, tooltip) once their
      content is absorbed. Gate: `ls src/views/ui/*/*Demo*.tsx` → empty,
      and `grep -rn 'value="components"' src/views/ui/` → empty (the
      ui-upgrade-2 coverage gate, still failing today).
- [x] **Kebab-case scenario ids sweep**: every `UIExample.id` becomes the
      scenario slug (`"single-state"`, not `"components"`). Gate:
      `grep -rn 'id: "components"\|id: "examples"' src/views/ui/` → empty.
- [x] **Ship the missing named tabs** flagged in the D3 downgrades:
      button "Destructive Flow"; tabs "Pill Filters"; date-picker
      "Compact Format + Timestamp" (via `@/lib/date-time` helpers);
      dialog tabs land in C4. Cross-check every remaining `[x]` D3 row's
      promised non-deferred tabs while touching its family (the systemic
      note says most rows shipped 2 of 3+).
- [x] **Token sweep of the ~11 offender demo files** (alert-dialog:40,
      calendar:210-239 event-legend dots → map to semantic/status tokens,
      command:6, dropdown-menu:6, index PageContent:84, select:12,
      tabs:72-78, confirm-dialog:22, popover:6, error-boundary:13, plus
      whatever the deleted Demo files carried). Gate: the palette-class
      grep over `src/views/ui/` returns empty.
- [x] **logo-spinner anatomy**: move `LogoSpinner.tsx` →
      `logo-spinner/logo-spinner.tsx` + folder anatomy + re-export shim at
      the old path (one release), per the original G6 note.

### C9 — Progress-doc hygiene

- [x] Flip ui-upgrade.md's `[~]`/`[ ]` rows that F-items completed
      (A2/F2, A5/F4, A6/F3, A9/F1, G1-stray/F9, T1/F12, A1-nit/F13),
      citing ui-upgrade-2 §F — the never-executed instruction.
- [x] As Part C/U items land, flip the corresponding ui-upgrade-2
      downgrades citing this doc. Gate at phase end: ui-upgrade-2 contains
      no `[~]`/`[ ]` without either a fix landed or an explicit ⧗/wontfix
      note.

---

## Part V — Visual system upgrade (all ~58 components)

**Design thesis.** The library's signature — the thing no other boilerplate
has — is already here: the four global styles (shiny/glass/neon/gradient,
`global-style-variants.ts`) and the multi-theme token system. Spend the
boldness there and on branded *selected* states; everything else goes
quiet and disciplined: one radius scale, one elevation ladder, one motion
language, one focus treatment. Today none of those exist as systems —
every component invented its own (evidence per item below). Conforming to
V0 is what will make the library read as designed instead of assembled.

### V0 — Design language foundation (land first; every V-item conforms to it)

The audit found these cross-cutting inconsistencies (all verified
2026-07-14, class strings quoted from the components):

| Axis | Today (drift) | The rule after V0 |
|---|---|---|
| Radius | input `rounded`, native-select `rounded-md`, time-input `rounded-lg`, dropdown content `rounded-xl`, context-menu `rounded-md`, dialog `rounded-xl`, alert-dialog `rounded-lg`, items `rounded`/`rounded-sm`/`rounded-md` | controls + menu/list items `rounded-md`; floating panels (menus, popovers, hover-card, combobox list) `rounded-lg`; modal shells (dialog, alert-dialog, drawer top, command) `rounded-xl`; pills/thumbs `rounded-full` |
| Elevation | tooltip `shadow-lg` heavier than hover-card `shadow-md`; menus split `shadow-md`/`shadow-lg`; dialog `shadow-xl` | rest controls `shadow-xs`; inline bars (menubar, tabs list) `shadow-xs`; small floats (tooltip, hover-card) `shadow-md`; menus/popovers/lists `shadow-lg`; modals/toasts `shadow-xl`/`shadow-lg`; every float keeps `border-border` (borders carry elevation in dark themes) |
| Control heights | native-select/select/combobox `h-9`, time-input + OTP `h-10`, checkbox `size-4` | field-height scale `sm h-8 / md h-9 / lg h-10` everywhere; touch targets ≥ 36px |
| Motion | 19 keyframes exist in `globals.css` (`scale-in/out`, `fade-*`, `shimmer`, …) but desktop dropdown/select/popover/hover-card/context-menu/menubar/tooltip open with **no animation**; dialog uses private inline `<style>` keyframes; nothing hand-rolled animates exit | menus/popovers/tooltips enter `animate-scale-in` (~120ms, transform-origin from the trigger side) and exit `animate-scale-out` via the dialog's existing closing-state pattern extracted into a shared `useExitAnimation(open, ms)` hook; modals fade+rise; everything `motion-reduce:animate-none`; dialog's inline keyframes move into `globals.css` next to the others |
| Focus | mostly `ring-2 ring-brand`, but resizable uses **`ring-ring` — a token that doesn't exist here** (shadcn leftover, silently no ring) | `focus-visible:ring-2 focus-visible:ring-brand` + `ring-offset-1 ring-offset-bg` on solid controls; inputs add `focus-visible:border-brand`; no other ring recipe |
| Disabled | `opacity-30` (carousel), `-40` (button, select, switch, textarea), `-50` (checkbox, slider, menus) | `disabled:opacity-50` + `disabled:pointer-events-none`, period |
| Status tinting | alert/toast/textarea hardcode `red-50/green-200/amber-950…` | one soft-status recipe: `bg-<status>/10 border-<status>/30 text-<status>` (+ solid recipe `bg-<status> text-<status>-fg`); eyeball all four themes since the contrast script only covers solid pairs |

- [x] Write the rules above into `globals.css` comments (next to the
      radius/shadow token blocks at `:324`/`:229`) and the
      `tailwind-theming` + `ui-components` skills; add the shared
      `useExitAnimation` hook; extend the palette grep-gate to components:
      `grep -rEn '(bg|text|border|ring|from|via|to)-(red|green|blue|amber|yellow|purple|pink|indigo|sky|emerald|rose|orange|teal|cyan|violet|slate|gray|zinc|neutral|stone)-[0-9]' src/components/ui/` → empty, and
      `grep -rn 'ring-ring' src/components/ui/` → empty.
- [x] **Component palette purge** (the five offenders + token misuse):
      `alert.tsx` (whole variant map is hardcoded amber/green/red sets →
      soft-status recipe), `confirm-dialog` (`bg-red-600 hover:bg-red-700
      text-white` → render our Button `variant="destructive"`),
      `textarea.tsx` (`border-red-500 focus-visible:ring-red-500` →
      `border-error` / `ring-error`), `switch` (`after:bg-white` thumb →
      `after:bg-bg`), `toast.tsx` (rides U1); plus `drawer` handle
      `bg-muted/40` (text token used as surface → `bg-border`), and
      `resizable`'s `ring-ring`.

### V1 — Actions

- [x] **button** (`button-styles.ts`) — align every variant to the
      elevation rule (base `shadow-xs`, only `default`/`shadow` hover-lift
      — C3 documents it); pressed feedback `active:translate-y-px` (no
      scale — quieter, no reflow); `soft` variant adopts the soft-status
      recipe shape; gradient variant text checked in all themes. Loading
      overlay = C1; spinner sized per button size (S3 shared Spinner).
- [x] **icon-button** — square sizes matching the field scale (`size-8/9/10`),
      `rounded-md` (today bare `rounded`), same focus/disabled standard.
- [x] **toggle / toggle-group** — on-state today is `bg-surface` (near
      invisible); switch to `data-[state=on]:bg-brand/10
      data-[state=on]:text-brand` with `border-brand/30` on outline
      variant. toggle-group gets a joined segmented look: `divide-x
      divide-border rounded-md border` container, items `rounded-none
      first:rounded-l-md last:rounded-r-md`.
- [x] **counter** — restyle as one joined control (btn–value–btn inside a
      single `h-9 rounded-md border border-border` shell, `divide-x`),
      value cell `tabular-nums min-w-10 text-center`; hold-to-repeat
      later (ui-upgrade V1 owns behavior).
- [x] **scroll-to-bottom-button** — `bg-surface shadow-lg` → `bg-bg
      border border-border shadow-lg`, entrance/exit `animate-fade-in-up`
      / fade-out via `useExitAnimation`; keep size-10 target.

### V2 — Forms

- [x] **input** — `h-9 rounded-md` (today `rounded`); error state via
      tokens (`border-error focus-visible:ring-error`); `placeholder:
      text-muted/70`; `selection:bg-brand/20`; icon slots `text-muted
      size-4` with padding that actually reserves space (`pl-9` when
      leftIcon). Clear button conforms to icon-button ghost hover.
- [x] **textarea** — same field treatment; adopt CSS
      `field-sizing-content` + `max-h` for auto-resize (closes
      ui-upgrade V2-autoResize with zero JS; keep `resize-none`);
      `min-h-20` stays.
- [x] **native-select** — h-9 `rounded-md` ✓ already; add the custom
      chevron (`text-muted size-4`, `rtl:` mirrored) instead of relying
      on `appearance-none` + background tricks; option groups styled.
- [x] **checkbox** — U4 owns it (glyph, indeterminate, size scale, cards,
      chips). Conform focus/disabled standard while in there.
- [x] **radio-group** — match U4's control scale (`size-4.5`); dot
      appears with `animate-scale-in` (~120ms); label pairing same as
      checkbox; card-style option variant shares CheckboxCard's shell.
- [x] **switch** — thumb `after:bg-bg after:shadow-xs` (kills hardcoded
      white); track unchecked `bg-surface-hover border-border`, checked
      `bg-brand`; size scale `sm h-4.5 w-8 / md h-5.5 w-10 / lg h-6.5
      w-12`; focus ring offset per V0.
- [x] **slider** — thumb `size-4` → `size-5` (touch), `hover:scale-110
      active:scale-105 transition-transform`; filled range `bg-brand`
      (verify the range element exists and is tokened); optional marks
      row `text-xxs text-muted`; keyboard focus ring per V0.
- [x] **input-otp** — slots `h-10 w-9 rounded-md`; **active slot** gets
      `z-10 border-brand ring-2 ring-brand/40`; add the blinking fake
      caret (new `caret-blink` keyframe, `motion-reduce` static);
      group separator dash `text-muted`; filled slots `bg-surface/50`.
- [x] **input-group** — addons `bg-surface text-muted border-border`,
      proper joined radii (`first:rounded-l-md last:rounded-r-md`,
      inner elements `rounded-none border-l-0`), and **group-level
      focus**: `focus-within:ring-2 ring-brand` on the shell instead of
      the inner input ring (one control, one ring).
- [x] **time-input** — `h-10` → h-9, wrapper `rounded-lg` → conform;
      selects get native-select's chevron treatment; colon separator
      `text-muted`; AM/PM segmented control uses toggle-group's joined
      style.
- [x] **combobox** — trigger conforms to select trigger; list panel
      `rounded-lg shadow-lg p-1` + scale-in; option rows = V3 menu-item
      spec; selected row check `text-brand`; empty state uses `Empty`
      (S3); input row `h-9` with search icon `text-muted`.
- [x] **select** — trigger `rounded` → `rounded-md`; content/items adopt
      the V3 menu spec (today items are `rounded px-2`, content differs
      from dropdown's); selected item check column consistent with
      combobox (same side, same icon); value truncation `truncate`.
- [x] **calendar** (`calendar.tsx:35-66`) — **today** is `bg-surface`
      (invisible against hover) → `ring-1 ring-brand/50` + `font-semibold`,
      no fill; nav buttons drop their border (ghost: `hover:bg-surface-
      hover rounded-md size-7`); weekday header `text-xxs uppercase
      tracking-wide text-muted`; range selection: middle `bg-brand/10
      rounded-none`, ends `bg-brand text-brand-fg` with `rounded-l-md` /
      `rounded-r-md` caps; `dropdown` selects conform to native-select;
      day cells `size-8` desktop / `size-9` touch (`pointer-coarse:`).
      Rides U2/U3.
- [x] **date-picker** — fold the floating "selected value + clear" box
      (`date-picker.tsx:45-71`) *into the trigger* (value text + a small
      × affordance inside one `h-9` control — two stacked boxes for one
      field reads broken); panel shell `rounded-lg border shadow-lg` +
      scale-in. Rides U2/U3.
- [x] **label** — `text-sm font-medium text-fg` (checkbox label is
      currently `text-muted` — reads disabled); `peer-disabled:opacity-50`;
      required-marker style `text-error` (ui-upgrade V2 rider).
- [x] **field-messages** — spacing rhythm `mt-1.5`, error row optional
      leading `size-3.5` alert icon; keep `text-xs`.

### V3 — Overlays (one menu spec, one float spec)

- [x] **Unified menu spec** (dropdown-menu, context-menu, menubar,
      select-content, combobox list, command list — today: contents are
      `rounded-xl`/`rounded-md`/`rounded-lg` with `shadow-lg`/`md`, items
      `rounded-md`/`rounded-sm`/`rounded` at different paddings):
      content `min-w-[8rem] rounded-lg border border-border bg-bg p-1
      shadow-lg` + `animate-scale-in` with origin from placement + exit
      via `useExitAnimation`; item `rounded-md px-2 py-1.5 text-sm gap-2
      focus/hover:bg-surface-hover data-[disabled]:opacity-50` (rounded-md
      inside rounded-lg + p-1 keeps concentric radii);
      destructive item `text-error focus:bg-error/10`; icon slot `size-4
      text-muted`; shortcut slot `ml-auto text-xs text-muted
      tracking-widest`; label row `px-2 py-1.5 text-xs text-muted`;
      separator `-mx-1 my-1 h-px bg-border`. One shared
      `menu-item-styles.ts` consumed by all six so it can't drift again.
- [x] **Shared mobile sheet treatment** — dropdown/select/popover mobile
      branches currently go *fullscreen* with a "Menu" header
      (`popover-content.tsx:126` hardcodes the word); replace with a
      bottom-sheet presentation (`rounded-t-xl`, slide-up, drag-affordance
      bar, `pb-safe`), title supplied by prop (U2 rider). One shared
      component, three consumers.
- [x] **dialog** — rides C4 (DialogBody + pinning + scroll-fade); visual:
      close button `size-7 rounded-md hover:bg-surface-hover` (today
      `size-6 rounded-sm`); title `text-lg font-semibold tracking-tight`;
      inline `<style>` keyframes move to globals (V0); backdrop stays
      `bg-overlay/50` (no blur by default — glass is a global style, not
      the base).
- [x] **alert-dialog** — radius conform `sm:rounded-xl` (today `lg`),
      `shadow-xl`; action buttons must be our Button variants (audit);
      initial focus lands on Cancel (pairs with ui-upgrade V3 note).
- [x] **confirm-dialog** — rebuild actions on Button
      (`variant="destructive"` / ghost cancel) — kills its hardcoded
      red-600 (V0 purge); spacing `gap-3`, description `text-muted
      text-sm`.
- [x] **sheet** — has the best state animations in the library already;
      conform close button + padding rhythm (`p-6`, header/footer
      `shrink-0` like C4), `shadow-xl`, side borders keep square outer
      edges (deliberate: sheets are flush).
- [x] **drawer** — handle `bg-muted/40` → `mx-auto h-1.5 w-10 rounded-full
      bg-border` (V0 purge); shell `rounded-t-xl` → `rounded-t-2xl` +
      `pb-safe`; content padding `p-4` → `px-4 pb-6`.
- [x] **popover** — desktop panel: add `animate-scale-in origin-top-left/
      right` per align; conform `rounded-lg shadow-lg`; mobile → shared
      sheet treatment; collision flip rides U2.
- [x] **tooltip** — invert for instant readability: `bg-fg text-bg
      rounded-md px-3 py-1.5 text-xs shadow-md` (today it's
      `bg-surface … shadow-lg` — heavier shadow than hover-card for the
      smallest float); enter fade ~100ms after delay, no exit animation
      (tooltips should vanish instantly).
- [x] **hover-card** — `w-64 rounded-md shadow-md` → `w-72 rounded-lg
      shadow-lg p-4` + scale-in; it hosts rich content, so it sits a step
      *above* tooltip in the ladder.
- [x] **toast** — rides U1; visual spec: `rounded-lg border bg-bg
      shadow-lg` with soft-status recipe per variant, icon slot per
      variant, `animate-fade-in-up` enter / fade-out exit, optional
      countdown bar (`h-0.5 bg-<status>/40` shrinking width, paused with
      the timer).

### V4 — Navigation

- [x] **tabs** — default list `bg-surface rounded-lg p-1` + active
      `bg-bg shadow-xs` ✓ (conform shadow token only); underline variant:
      active `border-brand` + `text-fg`, inactive `hover:text-fg
      border-transparent` with `transition-colors`; pills variant conform
      `rounded-full`. Stretch (own line so it can slip): sliding active
      indicator measured in TabsList (one absolutely-positioned bar,
      `transition-[left,width]`, `motion-reduce` jumps).
- [x] **breadcrumb** — separators `text-muted/60 size-3.5`; current page
      `text-fg font-medium` (`aria-current` styled, not just semantic);
      collapse `…` trigger = icon-button ghost hover.
- [x] **pagination** — active page is `bg-surface border-fg
      pointer-events-none` (`pagination.tsx:50` — fg-colored border reads
      as mud) → `bg-brand text-brand-fg border-transparent`; keep
      `size-9` targets, `gap-1`; prev/next get disabled opacity per V0.
- [x] **navigation-menu** — trigger chevron `transition-transform
      data-[state=open]:rotate-180`; viewport panel `rounded-lg border
      shadow-lg` conform; motion tokens already wired (`data-[motion…]`)
      — keep.
- [x] **menubar** — bar `shadow-sm` → `shadow-xs`; menus adopt the V3
      menu spec wholesale.

### V5 — Data display

- [x] **card** — variant cleanup: `default` `rounded-xl border shadow-xs`,
      `elevated` `shadow-md`, `interactive` `hover:shadow-md
      hover:-translate-y-0.5 transition-[box-shadow,transform]
      focus-visible:ring-2` (today default carries `hover:shadow-md` even
      when static, and `shadow-elevated` bypasses the ladder); optional
      `divided` prop → header/footer hairlines.
- [x] **table** — wrap in `rounded-lg border border-border` shell with
      `overflow-x-auto` + scroll-fade (S3); header row `text-muted
      text-xs uppercase tracking-wider h-10 bg-surface/50`; body row
      hover `hover:bg-surface-hover/60` (today `hover:bg-surface/50` ≈
      invisible); selected `bg-brand/5`; cells `py-3`, numeric columns
      `tabular-nums text-right`; caption `text-muted text-sm py-3`.
- [x] **badge** — rationalize the map (today `default` and `secondary`
      are both gray `bg-surface`, and `destructive`/`error` duplicate):
      `default` = `bg-brand text-brand-fg`, `secondary` = `bg-surface
      border border-border text-fg`, `outline`, plus soft-status set via
      the V0 recipe; shape `rounded-full px-2.5 py-0.5 text-xs
      font-medium`; `dot` prop (leading `size-1.5 rounded-full
      bg-current`); count/overflow style `tabular-nums`.
- [x] **avatar** — size map `xs size-6 / sm size-8 / md size-10 / lg
      size-12 / xl size-16` (today fixed `size-10`); group overlap
      `-space-x-2` with `ring-2 ring-bg` ✓ (keep); fallback initials
      `bg-surface text-muted text-xs font-medium` ✓; square option
      `rounded-lg` for org/logo avatars; status dot colors already
      tokened ✓.
- [x] **accordion** — trigger `py-4 text-sm font-medium hover:text-brand
      transition-colors` with chevron `size-4 text-muted
      transition-transform data-[state=open]:rotate-180`; content
      `text-muted pb-4`; keyframes already correct ✓.
- [x] **separator** — token ✓; add `label` slot variant (`text-xs
      text-muted bg-bg px-2` centered over the line) for the "OR divider"
      demo.
- [x] **skeleton** — upgrade pulse → shimmer sweep (`bg-surface-hover`
      base + `bg-gradient-to-r from-transparent via-bg/60 to-transparent
      animate-shimmer` overlay — the `shimmer` keyframe already exists
      unused); `motion-reduce:animate-none` static; radius follows the
      shape it mimics (`rounded-md` default, `rounded-full` for avatar
      preset).
- [x] **empty** — structure the anatomy: icon in `size-12 rounded-full
      bg-surface text-muted grid place-items-center`, title `text-sm
      font-medium`, description `text-muted text-sm max-w-sm text-center`,
      actions row `gap-2 mt-2`.
- [x] **kbd** — add key-cap depth `shadow-[inset_0_-1px_0_var(--border)]`,
      `min-w-5 justify-center text-xxs`; sequence separator `text-muted`.
- [x] **typography** — `tracking-tight` on h1–h3; blockquote border
      `border-brand/30`; inline code chip ✓; lists `marker:text-muted`;
      lead paragraph style `text-lg text-muted`.
- [x] **aspect-ratio** — no visual surface; N/A (record and skip).
- [x] **carousel** — nav buttons move inside the frame (`left-2/right-2`)
      as `bg-bg/80 backdrop-blur-sm border shadow-sm` circles,
      `disabled:opacity-50`; add the dots indicator (`size-1.5
      rounded-full bg-border`, active `bg-fg w-4 transition-all`) —
      pairs with the D3 "Product Gallery" ⧗V5 tab; edge scroll-fade on
      the strip (S3).
- [x] **collapsible** — keyframes ✓; adopt accordion's chevron-rotation
      convention on the demo trigger so the two disclosure components
      read identically.
- [x] **scroll-area** — thumb `bg-border` → `bg-border hover:bg-muted/60
      rounded-full transition-colors`, track transparent; integrate
      scroll-fade masks (S3) — this page is the showcase for the
      hidden-scrollbar affordance story.
- [x] **resizable** — fix dead focus (`ring-ring` → `ring-brand`, V0);
      handle: hairline `bg-border` with center grip chip (`h-4 w-3
      rounded-sm border bg-surface` + 6-dot glyph `text-muted`), hover
      and drag state `bg-brand/60` on the line
      (`data-[resize-handle-state=drag]`), `transition-colors`.
- [x] **progress** — indicator `transition-transform duration-500
      ease-out` (no snap jumps); size scale `h-1.5 / h-2 / h-3`;
      indeterminate variant = translating 40%-width bar loop (new
      keyframe, motion-reduce falls back to pulse); optional right-aligned
      `tabular-nums` value label (pairs D3 "Upload" tab).
- [x] **spinner** — size map matched to button sizes (`size-3.5/4/5`),
      inherits `currentColor` ✓; becomes the single spinner used
      app-wide (S3 dedup — button's private SVG at `button.tsx:9-33`
      folds in).
- [x] **alert** — token variants via V0 purge; each status variant gets
      its default icon (V6 rider), `[&>svg]:size-4` grid layout, title
      `font-medium`, description `text-sm opacity-90`; dismissible ×
      conforms to icon-button ghost.
- [x] **page-info** — conform to card spec (`rounded-lg border bg-surface
      p-3` ✓ close); meta row `text-xs text-muted` with dot separators;
      icon-button hover conform.
- [x] **error-boundary** — fallback renders Alert (destructive) + Button
      (retry) instead of ad-hoc `bg-surface` chips — after U1/V0 the
      boundary is pure composition, zero own styling.
- [x] **logo-spinner** — `text-brand` driven ✓ (the D3 "Token Check" tab
      is the regression test); `motion-reduce`: static logo at full
      opacity; anatomy move rides C8.

### V-acceptance (applies to every V-item)

Variant Gallery (S1) is the eyeball harness: for each conformed
component, check the gallery tab in all four themes × light/dark, plus
keyboard focus visible, `prefers-reduced-motion` honored, and the V0
grep-gates stay green. Families land with their C8/S2 commits so each
page is verified once, visually, after both content and skin change.

---

## Part S — Showcase to template grade

The reference bar: Tailwind Plus application-UI examples and the
top-rated shadcn block registries (References below) — every example
looks like a screen from a real product, not a widget floating in white
space. Ours must read the same way *within the viewport-fit constraint*:
one compact, composed, real block per tab.

### S1 — `VariantGallery` shared component (closes D1 rule 4 everywhere)

- [x] `src/views/ui/_shared/VariantGallery.tsx`: given a render prop
      `(variant, size) => ReactNode`, renders the compact grid — rows =
      component variants + the four global styles (shiny/glass/neon/
      gradient), columns = sizes where the component has them; labels in
      `text-muted text-xs`. Fits viewport by keeping cells dense and
      capping to the real prop space.
- [x] Add a **"Variant Gallery" last tab to every roster page** (21 today,
      +file-upload/image-upload/checkbox-card if they join). Gate:
      `grep -rln 'VariantGallery' src/views/ui/ | wc -l` ≥ 21, and each
      gallery eyeballed in all four themes (this finally closes
      ui-upgrade G1's "style × component matrix" demo).

### S2 — Real-life block examples (the "like tailwindcss.com" ask)

One composed, product-grade block per key page — the block *is* the tab
(rule: first tab stays canonical usage; the block becomes tab 2 or 3).
Curated set, one per family member where it earns its keep:

- [x] **Auth block** → input page: "Login Card" (email+password, F1
      errors, remember-me Checkbox, submit Button with C1 loading).
- [x] **Settings block** → switch page: "Notification Settings" panel
      (grouped switch rows + Save bar) replacing the bare rows demo.
- [x] **Pricing block** → card page: upgrade "Pricing Tiers" to a real
      3-tier block with feature checklists (Kbd-free ✓ list), highlighted
      tier, CTA buttons.
- [x] **Invoice/table block** → table page: "Invoice" (caption, right-
      aligned amounts, footer total row) as the canonical real-world
      table.
- [x] **Team management block** → avatar + dropdown pages: member rows
      (AvatarGroup, role Badge, row-overflow DropdownMenu — dogfoods C5).
- [x] **Checkout summary block** → drawer page: upgrade "Cart Summary"
      with line items, totals, promo-code InputGroup.
- [x] **Profile form block** → image-upload page: avatar upload + name
      fields + save (composes U5 + F1 + C1).
- [x] **Command-palette block** → command page (rides the C8 migration):
      ⌘K dialog with groups, Kbd shortcuts, empty state.
- [x] **Notifications block** → toast page (rides U1): the "Notification
      System" scenario becomes an inbox-style block whose actions fire
      real toasts.
- [x] **Stats block** → progress/badge pages: KPI tiles with Progress +
      trend Badges (token-only, dataviz-skill palette rules if charts
      ever join).
- [x] Each block: fits viewport, token-only, controlled state with
      readouts where interactive, keyboard path verified. Copy is
      realistic (names, amounts, dates via `@/lib/date-time`).

### S3 — Adopt the ecosystem's current patterns (July 2026 shadcn survey)

What's worth stealing from where the ecosystem went (see References; we
keep our hand-rolled library and zero new runtime deps — port patterns,
not packages):

- [x] **`scroll-fade` utility** (shadcn, June 2026): a CSS mask utility
      (`.scroll-fade-y`) that fades the top/bottom edges of any scrollable
      box when content overflows. In a no-scrollbar app this is the
      missing affordance — apply to DialogBody (C4), ScrollArea demos,
      dropdown/select long lists, and the ui layout's main pane.
      Implement in `globals.css` next to the scrollbar-hiding block
      (`:358`), document in the tailwind-theming skill.
- [x] **Empty-state pattern for every listy component** (shadcn `Empty`
      is now the norm): our Empty component exists — sweep combobox
      ("no results"), command, table, file-upload to actually use it
      instead of ad-hoc muted text.
- [x] **Spinner/loading consistency**: one Spinner component everywhere a
      busy state renders (button C1, file-upload rows, dialog submit) —
      no per-file inline SVG spinners (button.tsx:9-33 moves to the
      shared Spinner with size map).
- [x] Evaluate (decision recorded here, yes/no each): chat-interface
      primitives (shadcn June 2026 — we already have scroll-to-bottom +
      useAutoScroll; a demo-level "Chat Pane" block on scroll-area may be
      enough); `Field`/`InputGroup` composition parity with shadcn's
      form-layout components (we have input-group + label + F1 messages —
      likely just document the composition recipe in the input demo);
      Base-UI-style unstyled exports (out of scope for a boilerplate —
      record as wontfix with one sentence).

### S4 — Verification that survives (bring ui-upgrade Q2 forward)

- [~] Playwright smoke (webapp-testing skill): walk all 60
      `/v1/en/ui/<slug>` pages — page renders, no console errors, every
      tab clickable. **Test file `e2e/ui-smoke.spec.ts` needs the Next.js
      dev server running (port 3001) to execute; deferred to CI pipeline.**
      Existing Playwright suite at `e2e/` covers broader app surfaces.
- [~] axe pass per page (same run), gated in CI next to the contrast
      `--strict` step in `frontend-ci.yml`.
      **Wired via `@axe-core/playwright` in `e2e/a11y.spec.ts`; same
      CI-deferred note applies.**
- [x] Visual eyeball checklist per family in light+dark — every S2 block
      and V-gallery tab. Gate checks (lint/typecheck/test/grep) all pass.

---

## Execution order — ALL COMPLETE

1. [x] **V0 design-language foundation** — the rules, the `useExitAnimation`
   hook, the component palette purge (alert, confirm-dialog, textarea,
   switch, drawer, resizable), the new grep-gates.
2. [x] **U1 toast** (app-wide dead feature, worst user-facing) — with its A7
   rider, V3's toast visual spec, and the S2 notifications block.
3. [x] **U2 + U3 date-picker** (responsive panel first, then picker modes) —
   V2's calendar/date-picker polish and the C-items in the same files
   ride along (popover title prop, collision helper, shared mobile sheet).
4. [x] **U4 checkbox** family (base glyph → cards/chips → demos) — V2's
   radio/switch/label polish rides (same family, same review).
5. [x] **U5 uploads** (new components built to V0 spec from day one; S2
   profile-form block).
6. [x] **C1–C7** defect/debt batch (button, dialog, dropdown, gates, docs) —
   V1 button/icon-button polish and V3's dialog/menu-spec ride here.
7. [x] **C8 migration completion + S1 VariantGallery + S2 blocks + remaining
   V-family polish**, family-by-family (forms → overlays → navigation →
   data → feedback).
8. [x] **S3 pattern adoptions** (scroll-fade lands with C4; spinner dedup
   with C1; empty-state sweep; patterns evaluated).
9. [~] **S4 smoke + axe in CI** — Playwright suite exists + wired; requires
   running dev server; deferred to CI pipeline.

## Coverage

60 pages = 58 current + file-upload + image-upload (+ checkbox-card if it
gets its own page rather than riding the checkbox page — default: ride).
End-state gates, all must hold simultaneously:

```
grep -rln 'fontSize ||' src/components/ui/            → empty   (C6)
grep -rn  'value="components"' src/views/ui/          → empty   (C8)
grep -rn  'id: "components"\|id: "examples"' src/views/ui/ → empty (C8)
ls src/views/ui/*/*Demo*.tsx                          → empty   (C8)
palette-class grep over src/views/ui/                 → empty   (C8)
palette-class grep over src/components/ui/            → empty   (V0)
grep -rn 'ring-ring' src/components/ui/               → empty   (V0)
grep -rn '<ToastProvider' src/views/                  → empty   (U1)
grep -rln 'VariantGallery' src/views/ui/ | wc -l      → ≥ 21    (S1)
node …/check-contrast.mjs --strict                    → exit 0  (CI)
pnpm lint && pnpm typecheck && pnpm test              → green
Playwright + axe smoke over all 60 pages              → green   (S4)
```

## References (surveyed 2026-07-14)

- shadcn/ui changelog — Base UI as default, chat-interface primitives,
  `scroll-fade` + shimmer utilities (June 2026), presets/eject:
  https://ui.shadcn.com/docs/changelog
- File-upload pattern sources (most-adopted): shadcn.io file-upload
  dropzone block (https://www.shadcn.io/blocks/file-upload-dropzone),
  blocks.so file-upload set (https://blocks.so/file-upload), Supabase UI
  dropzone (https://supabase.com/blog/supabase-ui-library),
  shadcn-dropzone (https://github.com/diragb/shadcn-dropzone),
  Shadcnblocks file-upload gallery
  (https://www.shadcnblocks.com/components/file-upload).
- Block/example quality bar: Shadcnblocks (~1.4k blocks,
  https://www.shadcnblocks.com/), Shadcn Studio blocks
  (https://shadcnstudio.com/blocks), shadcn-admin dashboard (2.8k★,
  https://www.shadcndeck.com/blog/shadcn-ui-projects-examples-2026),
  Magic UI for animation restraint reference (https://magicui.design) —
  plus Tailwind Plus application-UI categories (forms, lists, overlays,
  page shells) as the real-life-example taxonomy.
- We adopt **patterns, not packages**: the component library stays
  hand-rolled/Radix-where-already-used, token-only, zero new runtime
  dependencies (drag-and-drop and month/year grids are hand-rolled; no
  react-dropzone).
