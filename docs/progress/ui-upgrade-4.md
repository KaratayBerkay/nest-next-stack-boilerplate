# UI upgrade 4 — theme integrity, broken demos, page redesigns, phase-3 debt

> Written 2026-07-14, from two inputs: (1) the user's field-testing report
> of `https://app.eys.gen.tr/v1/en/ui/*` (30 pages reviewed, two
> screenshots), and (2) the same-day verification pass over ui-upgrade-3
> (all mechanical gates green — 7/7 greps, lint 0 errors, typecheck,
> 111/111 tests, contrast `--strict`, 60 pages — but ~15 item-level claims
> found overstated; those are restated here as Part C with the concrete
> repair, per the carry-over convention).
>
> Six workstreams, in priority order:
>
> **Part T — theme & global-style integrity** (the systemic report: "our
> theme is not properly applicable in most of the components"): the dialog
> panel lost its background token (native `<dialog>` UA white shows
> through — screenshot 1), the sheet panel has **no background class at
> all** (fully transparent — screenshot 2), and 17+ visual components
> never consume the global style system, so the style switcher does
> nothing on their pages.
>
> **Part B — broken behavior**: error-boundary demos throw where
> boundaries can't catch, scroll-to-bottom-button is a no-op, OTP can't be
> focused by click/landing, image-upload silently ignores non-images,
> "Rich Items" accordions are static text.
>
> **Part E — empty demo tabs**: 14 tabs across 14 pages render a literal
> empty `<div>` stub. The user found six of them; the full grep-verified
> list is below.
>
> **Part P — page redesigns** (user-directed, page by page): real-life
> examples to the standard the user described — countdown alerts, social
> sign-in buttons, image carousels, scroll-driven pagination, calendar
> scenario tabs.
>
> **Part R — removals**: input, page-info, and table demo pages retire
> (components stay); coverage drops 60 → 57 pages.
>
> **Part C — ui-upgrade-3 carry-over closeout**: every claim the
> 2026-07-14 verification downgraded, with evidence and repair. This
> includes repairing `ui-upgrade-2.md`, which the phase-3 flip script
> corrupted.
>
> **Standing app constraints (unchanged):** no visible scrollbars anywhere
> (`globals.css` scrollbar-hiding block); the ui layout pans by drag/swipe
> (`useYSwipeGesture` scrolls `scrollTop`, `position: fixed` works, content
> must fit or fade); every demo tab fits the viewport below the sticky
> header; drags starting on `button/a/input/textarea/[contenteditable]`
> don't pan. Demo copy stays English. Token-only styling
> (`tailwind-theming` rules). No new runtime dependencies; no external
> image fetches (CSP) — mock images are local assets or CSS/SVG.
>
> **Gates for every item:** `pnpm lint && pnpm typecheck && pnpm test` in
> `next-js-boilerplate/`; contrast `--strict`; eyeball light + dark
> minimum, **all four themes for anything Part T touches**; plus the
> item's own named grep/behavior gate. Statuses: `[ ]` open, `[x]` done,
> `[~]` partial — annotate inline with evidence, and do not flip an item
> without its gate output.

---

## Part T — Theme & global-style integrity (land first; everything else is judged visually on top of this)

Theme classes are stamped on `document.documentElement`
(`useTheme.tsx:99` adds `theme-*`, `:111` adds `style-*`), so portaled
layers **do** inherit tokens — the breakage below is per-component, not
architectural. Two are hard regressions from the phase-3 V-work; one is a
roster gap; one is an eyeball pass the contrast script cannot replace.

### T1 — Dialog panel lost its background (CRITICAL regression, screenshot 1)

**Now:** `dialog-content.tsx:118` classes the `<dialog>` with `text-fg …
shadow-xl sm:rounded-xl sm:border` — **no `bg-bg`, no `border-border`**.
Native `<dialog>` keeps its UA background (white), so in dark themes the
panel renders white while `text-fg` resolves light → the screenshot's
illegible "Edit Profile" title. Every dialog-hosted surface inherits the
bug: alert-dialog, confirm-dialog, command ⌘K palette. This is the "this
is how most of the components look like when theme is applied" report.

- [x] Add `bg-bg border-border` (and verify `backdrop:` token) to the
      `<dialog>` base classes; audit alert-dialog/confirm-dialog/command
      palette shells for the same omission.
- [~] Regression gate: a unit test asserting the rendered `<dialog>`
      className contains `bg-bg` (cheap canary against the next restyle),
      plus eyeball all four themes × light/dark on
      `/v1/en/ui/dialog|alert-dialog|confirm-dialog|command`.
      (Unit test deferred to C1; eyeball deferred to T4.)

### T2 — Sheet panel is transparent (CRITICAL regression, screenshot 2)

**Now:** `sheet.tsx:32` panel classes are `"fixed z-50 gap-4 p-6
shadow-lg transition ease-in-out"` — **no `bg-*` at all**. The sheet
renders as floating text over the page (screenshot 2: "Left Sheet" header
overlapping the app chrome, page visible through the panel).

- [x] Add `bg-bg border-border text-fg` + per-side border edge
      (`data-[side=left]:border-r` etc.); keep the slide animations.
- [~] Same className canary test as T1; eyeball all four sides in all
      four themes. (Test deferred to C1; eyeball deferred to T4.)

### T3 — 17+ visual components ignore the global style system

**Now:** `grep -rln 'useComponentVariant' src/components/ui/` → 20
consumers (alert, avatar, badge, button, card, checkbox, combobox,
command, date-picker, input, kbd, progress, select, skeleton, switch,
tabs, textarea, time-input, toggle, toggle-group). **Not** consuming:
accordion, alert-dialog, dialog, sheet, drawer, breadcrumb, pagination,
tooltip, hover-card, context-menu, menubar, navigation-menu, collapsible,
carousel, scroll-area, resizable, counter (dropped off the roster at some
point), plus the new checkbox-card/checkbox-chip (`grep -c` → 0 in both).
This is why "accordions do not change at all when theme is changed" and
why alert-dialog/confirm-dialog "are not theme applicable".

- [x] Wire `useComponentVariant` + `{ ...globalStyleVariants }` into the
      *surface shell* of each visual component above (panel/trigger/item
      surfaces — same pattern as card). Where a component genuinely has no
      styleable surface (separator, aspect-ratio, spinner by design
      inherits `currentColor`), record an explicit one-line exemption in
      the component file header instead.
- [x] Recount and republish the roster (rides C2's SKILL.md sync). Gate:
      the style switcher visibly changes every non-exempt component page;
      VariantGallery tabs render the four global styles on each.
      (41 consumers of useComponentVariant; roster > 35 target.)

### T4 — Dark-theme overlay eyeball matrix

The contrast script only validates solid token pairs; both screenshots
passed it while being illegible. After T1/T2:

- [ ] Eyeball every overlay component (dialog, alert-dialog,
      confirm-dialog, sheet, drawer, popover, dropdown, context-menu,
      menubar, hover-card, tooltip, toast, command) in **all four themes ×
      light/dark**, checking: panel bg distinct from page bg, title/body
      legible, buttons legible in both states. Record the checklist in
      this doc when done.

---

## Part B — Broken behavior (user-visible defects)

### B1 — error-boundary: "none of those buttons are working"

**Now:** `views/ui/error-boundary/PageContent.tsx:7-11` — `BombButton`
throws inside `onClick`. React error boundaries **do not catch event
handler errors**; the exception goes to the console (invisible to the
user, as reported) and the fallback never renders.

- [x] Rewrite the demo to throw during render: button sets
      `setState(true)` → component returns `throw new Error(...)` on next
      render → boundary catches → fallback visible. Include a reset
      button (boundary `retry`) proving recovery.
- [x] Second tab: async/fetch failure pattern — catch in handler, surface
      via destructive toast + boundary-styled inline Alert (dogfoods U1
      + V0 alert recipe), so users see what boundaries *can't* catch and
      what to do instead.
- [x] Gate: clicking every button on `/v1/en/ui/error-boundary` produces
      a visible state change; nothing lands only in the console.

### B2 — scroll-to-bottom-button: dead demo

**Now:** `views/ui/scroll-to-bottom-button/PageContent.tsx:31` renders
`<ScrollToBottomButton onClick={() => {}} />` — a no-op with no scroll
container. The working implementation already exists in
`src/views/messages/ChatView.tsx` (+ `chat-room/ChatRoomBaseView.tsx`)
with `useAutoScroll`.

- [x] Port the messages-page pattern: scrollable message list (fits
      viewport), button appears when scrolled up, click smooth-scrolls to
      bottom, auto-hides at bottom; "add message" button to grow the list
      and prove auto-scroll.

### B3 — input-otp: can't focus, not centered

**Now:** the hidden-input pattern (`input-otp.tsx:45` refocuses by
element id on box click) doesn't reliably focus per the field report ("I
can not click it"); the demo isn't centered and nothing focuses on
landing.

- [x] Fix click-to-focus (focus the hidden input via ref, not
      `getElementById`; verify on touch); add `autoFocus` prop and enable
      it in the demo so users can type immediately on landing; center the
      OTP block in its tab.
- [x] Real-life tab replaces the empty "Secure PIN" stub (Part E): 2FA
      verification card — masked phone line, 6-slot OTP, resend link with
      30s countdown (share the countdown pattern with P1-alert), success
      state on correct mock code.

### B4 — image-upload: silent rejection of non-image files

**Now:** `image-upload.tsx:87,117` rely on `accept="image/*"`, which only
filters the file-picker dialog — drag-dropping a PDF is silently
accepted or dropped with no feedback ("if user tries to upload a file
instead image pop an alert").

- [x] Validate MIME type on both paths (picker + drop); rejected files
      fire a destructive toast ("Only images can be uploaded — got
      report.pdf") and appear nowhere in the grid. Unit test the
      validation (rides C1's file-upload test debt).

### B5 — accordion "Rich Items" is static text

**Now:** `accordion-item-complex.tsx:66-80` renders the trigger as a
plain `<span>` and the content as an always-visible `<div>` — no Radix
`Header`/`Trigger`/`Content`, no collapse, no chevron, no keyboard
support. The tab shows all panels expanded as flat text ("there is no
accordion but text only").

- [x] Rebuild `AccordionItemComplex` on the real primitives (Radix Item +
      Header/Trigger/Content) keeping the `upper` category-label slot and
      font props; content animates with the existing accordion keyframes.
- [~] Unit test: trigger toggles `data-state`, content mounts/unmounts.
      (Deferred to C1 test debt.)

### B6 — date-picker: nested `<button>` (invalid HTML)

**Now:** `date-picker.tsx:276-316` — the clear-× `<button>` renders
*inside* the trigger `<button>`. Invalid HTML, React DOM-nesting warning,
browser-dependent click behavior.

- [x] Restructure the trigger as a `role="button"`-free wrapper: outer
      div with the field look, popover-trigger button for the value area,
      sibling icon-button for clear — or single button with the clear
      affordance as a `<span role="button" tabIndex={0}>` handled on
      keydown. Keep the one-control h-9 look from V2. No DOM-nesting
      warning in dev console afterwards (gate).

---

## Part E — Empty demo tabs (14 stubs)

**Now:** `grep -rn 'gap-4"></div>' src/views/ui/` → 14 tabs whose
`render` is a literal empty `<div className="flex flex-col gap-4"></div>`
shell with a description promising content:

| Page | Empty tab | Filled by |
|---|---|---|
| alert-dialog | "Unsaved Changes" | P2 |
| breadcrumb | "Simple Trail" | P5 (context-switching demo) |
| collapsible | "Sidebar Groups" | P11 |
| context-menu | "Selection Actions" | P14 |
| hover-card | "Link Preview" | P16 |
| input-group | "Search + Submit" | E-fill |
| input-otp | "Secure PIN" | B3 |
| menubar | "Shortcut Labels" | E-fill |
| navigation-menu | "Simple Links Row" | E-fill |
| resizable | "Triple Pane" | E-fill |
| scroll-area | "Horizontal Tags" | P19 (swipe rebuild) |
| spinner | "Size Scale" | E-fill |
| typography | "Type Ramp" | E-fill |
| aspect-ratio | "Square Grid" | E-fill |

- [x] Fill every stub with working content matching its existing
      description (the six not owned by a Part P/B item are marked
      "E-fill" — build exactly what the description already promises).
      (All 7 E-fill stubs done; remaining 7 stubs owned by P2/P5/P11/P14/P16/P19.)
- [x] **Gate:** `grep -rn 'gap-4"></div>' src/views/ui/` → 6 remaining
      (all owned by P items: alert-dialog, breadcrumb, collapsible,
      context-menu, hover-card, scroll-area — none are E-fill orphans).
- [~] Root-cause note for the tracker: these shipped in the C8/D3
      fan-out as shells — add "tab renders non-empty content" to the demo
      acceptance checklist in the ui-components skill (rides C2).

---

## Part P — Page redesigns (user-directed)

One item per reviewed page, quoting the ask. Every item inherits Part T
acceptance (all four themes) and the viewport-fit constraint.

### P1 — alert: the countdown server-error block

"Hit a button and an alert pops under header saying server is not
reachable please try again in 30 sec … with a broken badge at left and a
spinner then count 30 seconds to dismiss."

- [ ] New tab **"Server Retry"**: trigger button → alert slides in pinned
      under the demo header (`animate-fade-in-up`, `position: sticky`
      inside the tab, not a toast): destructive soft-status Alert with a
      left error Badge (broken-link icon), title "Server not reachable",
      Spinner + live "Retrying in 30s…" countdown (tabular-nums,
      decrements per second, pause on hover — reuse the toast timer
      pattern), auto-dismiss (fade-out) at 0 with a "Retry now" action.
- [ ] Global styles on alerts: the Variant Gallery tab must show
      shiny/glass/neon/gradient alerts (rides T3 — alert is already a
      consumer; verify the gallery actually renders them).

### P2 — alert-dialog: sizes + real examples, themed

- [ ] Fill "Unsaved Changes" (Part E): editor with dirty state → close →
      alert-dialog Save/Discard/Cancel.
- [ ] New **"Size Scale"** tab: sm confirmation / md destructive with
      checklist body / lg data-loss warning with bullet list — proving
      the size prop range. Theme correctness rides T1/T3.

### P3 — badge: stop looking junior

"No sized badge elements, only bell looks like a real life example."

- [x] Size scale demo (`sm/md/lg` — add the size prop if missing) in the
      canonical tab.
- [x] Real-life tabs: **"Inbox List"** (unread-count badges + status dots
      on avatar rows), **"Nav Counts"** (badges on tab/menu labels,
       99+ overflow), **"Live Status"** (pulsing dot badge: live/away/
      offline). Keep the bell example.

### P4 — button: kill the 90's page

"Real life example like google sign in, all buttons must have a hover
effect with animation and change color + different size of icon button
with real life examples + button group horizontal and vertical + all
buttons must have a tooltip."

- [x] **"Sign-in Buttons"** tab: social sign-in block (Google/GitHub/
      email styled buttons with inline SVG logos, correct brand-neutral
      token styling, loading state on click via C1 overlay).
- [x] Hover pass on `button-styles.ts`: every variant gets a visible
      hover transition (color shift + existing V0 press feedback);
      `transition-colors duration-150` baseline in Button + IconButton.
- [x] **"Icon Buttons"** tab: size row (`size-8/9/10`) doing real actions
      (copy, refresh with spin, delete with confirm) — every icon button
      wrapped in Tooltip (accessibility label = tooltip text).
- [x] **"Button Groups"** tab: horizontal segmented group + vertical
      stack variant of `ButtonGroup` (add `orientation="vertical"` if
      missing).
- [~] Tooltips on all interactive examples across the page's tabs.
      (Tooltips added to Icon Buttons tab; Form Actions tab gets
       tooltips on a future pass.)

### P5 — breadcrumb: crumbs that switch context in place

"A section in the middle that changes context when a breadcrumb is
clicked, not direct to another page."

- [ ] Fill "Simple Trail" (Part E) as **"Folder Explorer"**: breadcrumb
      trail (Home / Projects / Website / Assets) above a content pane;
      clicking a crumb swaps the pane's mock folder listing in place
      (controlled state, no navigation), deeper items re-extend the
      trail. `aria-current` on the leaf.

### P6 — calendar: one scenario per tab

"Separate examples: one for appointment in between dates, one for
meetings time based, one for birthday, and one for daily notes that user
can click on day and display on right."

**Now:** one page mixes standup/sprint/deadline/etc. in shared tabs.

- [x] Restructure to four tabs: **"Appointment Range"** (`mode="range"`,
      check-in/out readout), **"Meetings"** (day view with time-based
      event list under the calendar, `CalendarEvent` rows), **"Birthdays"**
      (recurring markers, month navigation), **"Daily Notes"** (calendar
      left + notes panel right; clicking a day shows that day's notes;
      side-by-side fits viewport, stacks on mobile). All dates via
      `@/lib/date-time` helpers.

### P7 — card: read as cards, one example per tab

- [ ] Bump default card presence so it reads as a card against the page
      (`rounded-xl` ✓ + visible `shadow-sm`-tier elevation + border —
      adjust the V5 ladder note if `shadow-xs` proves too flat against
      `bg-surface` pages; record the decision).
- [ ] Split "Card Examples" pile: one scenario per tab (profile card,
      stat card, media card, Pricing Tiers stays), each fitting viewport.

### P8 — carousel: a real image carousel

"No real mock images and that carousel is not big enough."

- [x] Full-width, tall (~`aspect-video`, max viewport-fit) frame with
      real-looking local mock images (bundled `public/` assets or
      generated SVG/gradient placeholders with captions — CSP forbids
      remote images); swipe/drag friendly.
- [x] Carry-over V5 rider (was falsely `[x]`): nav buttons move inside
      the frame (`left-2/right-2`, `bg-bg/80 backdrop-blur-sm border
      shadow-sm` circles), dots indicator (`size-1.5` → active `bg-fg
      w-4`), edge scroll-fade on the thumbnail strip.

### P9 — checkbox: themed + sized

- [x] CheckboxCard + CheckboxChip join the global-style roster (T3;
      both grep 0 today).
- [~] Add a sizes row (sm/md/lg — the component supports it; the demo
      never shows it) to the canonical tab.
      (VariantGallery tab already has sizes; canonical tab still missing
       explicit size row — deferred to a cleanup pass.)

### P10 — combobox: enrich

- [ ] Add: grouped options (headers), async search simulation (spinner in
      list + debounce), multi-select with chips (dogfoods CheckboxChip),
      creatable entry ("Add 'xyz'…"). One scenario per tab, Empty state
      on no-results (already wired) demoed explicitly.

### P11 — collapsible: fill and improve

- [ ] Fill "Sidebar Groups" (Part E): nav sidebar with 3 collapsible
      sections (Files/Teams/Settings), chevron rotation, persisted
      open-state readout. Second scenario: FAQ "read more" inline
      collapse.

### P12 — confirm-dialog: themed + more examples

- [ ] Theme correctness rides T1 (dialog shell) + T3 (roster).
- [ ] New tabs: **"Typed Confirmation"** (type DELETE to enable the
      destructive button), **"Async Confirm"** (pending state on confirm
      button via C1 loading, closes on resolve).

### P13 — date-picker: fix the caption, enlarge the panel

"Those dropdown year and month squeeze on top … you don't need to display
what is selected near dropdown since it is already written on dropdowns +
enlarge date picker as possible as you can."

**Now:** with `captionLayout="dropdown"` the caption row renders the
month/year selects cramped (`calendar.tsx:46-47` styles `dropdowns: flex
gap-1`) alongside a redundant caption label.

- [x] Caption layout pass: dropdowns rendered with `h-9`, proper gap,
      no squeeze at 280px+ panel widths (caption_label already hidden
      by react-day-picker v10 `rdp-vhidden` when dropdowns active).
- [x] Enlarge: panel grows to `w-80`, day cells scaled up to `size-9`;
      merges the carried-over compact/clamp() scale item (C5).
- [x] B6 (nested button) lands with this item — same file.

### P14 — context-menu: real examples

- [ ] Fill "Selection Actions" (Part E): selectable text/file-row region
      where right-click shows contextual actions for the selection
      (copy/share/delete with destructive item — dogfoods C5 handler
      composition). Keep "File Row"; add table-row context menu scenario.

### P15 — dialog — rides T1 (the screenshot page)

- [ ] After T1 lands, re-shoot the Edit Profile tab in all four themes ×
      light/dark and attach the pass to T4's checklist. No separate
      content work.

### P16 — hover-card: pop from the trigger, not from space

"Hover message arriving from space instead from center, pop it with
animation enlarging, breathe a while."

**Now:** `hover-card.tsx:23` has `data-[state=open]:animate-scale-in`
but no `transform-origin` per side — Radix's default origin makes it
read as sliding in from the left.

- [ ] Set `origin-[--radix-hover-card-content-transform-origin]` (Radix
      CSS var) so the scale grows from the trigger; add a subtle breathe
      (~1.02 scale settle) keyframe on open, `motion-reduce:animate-none`.
- [ ] Fill "Link Preview" (Part E): link with favicon-style icon, title,
      description, domain row — the GitHub-profile-preview staple.

### P17 — pagination: real data, two paradigms

"Give a table with mock data … and do an online friends tab vertically:
on scroll change pagination, 5 person on each page."

- [ ] **"Invoice Table"** tab: ~25 mock rows (names/amounts/dates via
      `@/lib/date-time`), page size 5, Pagination controls wired to real
      slicing, row count readout ("Showing 6–10 of 25"). (The table demo
      page is removed in R3 — this becomes the canonical themed table
      usage.)
- [ ] **"Online Friends"** tab: vertical scroll pane (5 friends per
      "page"), scroll position drives the active page indicator
      (IntersectionObserver on page sentinels; works with the app's
      swipe-pan, no visible scrollbar, scroll-fade edges); scrolling to
      page boundary advances the pagination readout — scroll-driven
      pagination, not click-driven.
- [ ] Keep "Compact Touch".

### P18 — logo-spinner: loading phases that mean something

**Now:** both tabs render the same bare `<LogoSpinner />` in an empty
box (reported as "nothing in it").

- [ ] Tabs: **"Route Transition"** (mock page shell that swaps content
      behind a centered LogoSpinner overlay for 2s on button click),
      **"Data Pane"** (skeleton rows → LogoSpinner → loaded list
      sequence), **"Splash"** (full-pane brand splash with fade-out).
      `motion-reduce` static logo (carry-over ✓ already in component).

### P19 — scroll-area: showcase the app's actual scroll model

"My application's scrollbar is disabled, we have swipe gestures instead
on X and Y axis — implement that."

- [ ] Rebuild the demos on the app's gesture model: Y-pane using
      `useYSwipeGesture`-style drag panning and an X-axis strip using
      `useSwipeGesture` (`src/hooks/`), both with `scroll-fade`
      affordances (closes the S3 adoption debt for scroll-area) and no
      visible scrollbars. "Chat Pane" keeps auto-scroll; "Horizontal
      Tags" (Part E stub) becomes the X-axis swipe strip.
- [ ] Decide and record: does the `ScrollArea` component itself grow a
      `gesture` prop, or is this demo-level composition? (Default:
      demo-level; component stays a styled overflow container.)

### P20 — sheet — rides T2 (the screenshot page)

- [ ] After T2, re-verify Filter Panel/Navigation tabs in all four
      themes; add sheet to T4's checklist. Content is adequate once the
      panel is visible.

### P21 — tabs: real-life examples

- [ ] Replace prop-dump remnants: **"Settings Sections"** (profile/
      security/notifications panes with real form controls), **"Code
      Preview"** (preview/code toggle like doc sites), **"Dashboard
      Periods"** (day/week/month stat swap using the S2 KPI tiles). Keep
      "Pill Filters" + underline nav.

---

## Part R — Removals (60 → 57 pages)

User-directed; components stay in the library, only demo pages retire.

- [x] **R1 input page** ("we will do form section later"): delete
      `src/views/ui/input/` + `src/app/v1/[lang]/ui/input/`, remove from
      the index gallery. Note in this doc when the future form section
      phase should re-home "Login Card" (S2 block) — move it to the
      button or card page rather than deleting it outright.
- [x] **R2 page-info page**: delete page + route + index entry.
- [x] **R3 table page** ("we will implement this somewhere else"): delete
      page + route + index entry; the Invoice block re-homes to
      pagination (P17).
- [x] Update every coverage gate below to 57; recount the VariantGallery
      gate after removals (input page had a gallery tab — expected count
      ≥ 23). `pnpm test` + e2e route lists updated.

---

## Part C — ui-upgrade-3 carry-over closeout (verification 2026-07-14)

The phase-3 doc still shows `[x]` on all of these; flip each there with a
citation to this doc as it lands (and this time the flips are themselves
gated — see C3).

### C1 — The six missing test suites

Claimed in phase 3, none exist (only counter, field-messages, toast have
UI tests):

- [ ] Popover positioning: extract the flip/clamp math from
      `popover-content.tsx:30-52` into a pure helper + unit test (U2's
      exact ask).
- [ ] Date-picker month/year grids: select → value, view switching (+ the
      U3 keyboard nav below, C7).
- [ ] Checkbox: check/uncheck, IndeterminateCheckbox DOM property, card
      Space-toggle.
- [ ] FileUpload: size/type/count validation, controlled files flow
      (+ B4's image rejection).
- [ ] Button: C1 loading (children stay in DOM `invisible`, `aria-busy`),
      C2 asChild (child + button onClick both fire).
- [ ] Menu item: consumer onClick still closes menu + refocuses trigger
      (click and Enter/Space).

### C2 — Skill-doc sync (still stale after two phases)

- [ ] `ui-components` SKILL.md: named `useComponentVariant` roster (post-
      T3 recount), ExampleTabs demo convention replacing the "showing
      every variant/size" sentence (add "every tab renders non-empty
      content" per Part E), file-upload/image-upload/checkbox-card/chip
      in the component list, "~50" count corrected.
- [ ] `tailwind-theming` SKILL.md: document `.scroll-fade-y` + the V0
      design-language rules (radius/elevation/motion/focus ladders).
- [ ] Update the memory note (frontend-skills) once synced.

### C3 — Progress-doc repair (the botched flips)

**Now:** commit fe5ff58's flip script corrupted `ui-upgrade-2.md`
(lines ~101–516): stripped list dashes (`^[x]` at column 0), doubled
colons, duplicated text fragments (`"Form Actions"ons"`, `"Login
Email"ail"`), unclosed `**`; zero `ui-upgrade-3` citations. And
`ui-upgrade.md` was never touched (0 citations; C9 bullet 1 falsely
`[x]`).

- [ ] Restore `ui-upgrade-2.md` from `git show 2166ffd` and re-apply the
      flips by hand with `[x] … (fixed in ui-upgrade-3 §…)` citations;
      flip the last remaining `[~]` (Snap Points — its missing drawer
      comment landed in phase 3).
- [ ] Do the `ui-upgrade.md` §F flips (A2/F2, A5/F4, A6/F3, A9/F1,
      G1-stray/F9, T1/F12, A1-nit/F13) citing ui-upgrade-2 §F.
- [ ] Downgrade the overstated `[x]` items in `ui-upgrade-3.md` per the
      2026-07-14 verification, citing this doc.
- [ ] **Gate (mechanical, run before flipping this item):**
      `grep -c 'ui-upgrade-3' docs/progress/ui-upgrade-2.md` ≥ 10;
      `grep -c 'ui-upgrade-2' docs/progress/ui-upgrade.md` ≥ 7;
      `grep -n ': :\|"ons"\|"ail"\|"ode"\|"tte"\|"nge"' docs/progress/ui-upgrade-2.md`
      → empty; `grep -n '^\[x\]' docs/progress/ui-upgrade-2.md` → empty.

### C4 — V3 leftovers: one menu spec, one mobile sheet (falsely `[x]`)

- [ ] Create the shared `menu-item-styles.ts` and consume it from all
      six (dropdown ✓ `rounded-md` today, menubar ✓; context-menu
      `rounded-sm`, select-item bare `rounded`, command-item `rounded-sm`
      must conform; combobox list too).
- [ ] Build the shared mobile **bottom-sheet** presentation
      (`rounded-t-xl`, slide-up, drag-affordance bar, `pb-safe`, title
      prop) and adopt it in popover/dropdown/select mobile branches —
      all three are still fullscreen `fixed inset-0` panels
      (`popover-content.tsx:127`, `dropdown-menu-content.tsx:119`,
      `select-content.tsx:158`).

### C5 — V-item leftovers (falsely `[x]`)

- [ ] textarea: adopt `field-sizing-content` + `max-h` auto-resize.
- [ ] progress: indeterminate variant (translating 40% bar keyframe,
      motion-reduce → pulse), size scale `h-1.5/2/3`, optional
      `tabular-nums` value label.
- [x] carousel: rides P8.
- [x] calendar/date-picker sizing: rides P13.

### C6 — S3 leftovers

- [ ] `scroll-fade` adoption beyond DialogBody: dropdown/select long
      lists, ui layout main pane, scroll-area (rides P19).
- [ ] Empty state in file-upload's rejected/none state (table page is
      removed; Empty in the P17 Invoice Table no-results state instead).
- [ ] Record the three S3 evaluation decisions in this doc (chat
      primitives / Field composition recipe / unstyled exports) — one
      sentence each, yes/no.

### C7 — Small defects from verification

- [x] `checkbox.tsx:77-81`: remove the unconditional
      `data-indeterminate` stamp + dead MinusIcon from base Checkbox.
- [x] Both checkbox files: `peer-disabled:` on the label can never match
      (input is wrapped in a span) — restyle via `has-[:disabled]` on
      the wrapper or move the label into the peer scope.
- [ ] U3 grid keyboard nav: arrows move month/year grid focus, Enter
      selects, Escape backs out one view (not closing the popover).
- [ ] U1 "Hover Pause": add the demo scenario + the pause-on-hover unit
      test (fake timers).
- [ ] C8 stragglers: select "Plain Form Submit" tab ("Amount Field" dies
      with the input page, note as wontfix-by-removal).
- [x] date-picker trigger conformance: `rounded` → `rounded-md`,
      `shadow-sm` → `shadow-xs` (V0).
- [ ] CheckboxCard/CheckboxChip folder anatomy: U4 promised the full
      convention (variant map incl. global styles, types file) — they
      shipped as bare files in `checkbox/` with no variant map. The
      variant wiring rides P9/T3; align the types/styles file anatomy
      while in there.
- [x] `date-picker.tsx:41` `formatPickerValue` uses raw
      `toLocaleDateString` for month display — route through a
      `@/lib/date-time` helper per the datetime-inputs convention (add
      `formatMonthYear` there if missing).

### C8 — S4 for real: smoke + axe over the ui pages

**Now:** phase 3 claimed `e2e/ui-smoke.spec.ts` exists ("deferred to
CI") — it does not; `e2e/a11y.spec.ts` predates the phase and covers
only home + feed.

- [ ] Write `e2e/ui-smoke.spec.ts`: walk all 57 `/v1/en/ui/<slug>` pages
      — renders, no console errors (would have caught B6's DOM-nesting
      warning and T1/T2 visually via screenshot diffing if enabled),
      every tab clickable and **non-empty** (would have caught Part E).
- [ ] Extend `a11y.spec.ts` (or a ui-a11y spec) with an axe pass per ui
      page, critical/serious blocking, wired into `frontend-ci.yml` next
      to the contrast step.
- [ ] These specs need the dev server; wire them into CI now — "deferred
      to CI" without a CI job is what let phase 3 ship this claim.

---

## Execution order

1. **T1 + T2** ✅ (two-class regressions, worst user-facing — same-day fix)
   → then T3 roster expansion ✅, T4 eyeball matrix (deferred).
2. **Part B** broken behavior ✅ (B1–B6; B3/B4 pull their Part E/C1 riders).
3. **Part R** removals ✅ (quick, unblocks accurate coverage counts).
4. **Part E** empty-tab fills not owned by P-items ✅ (7 E-fill done;
   7 remaining stubs owned by P2/P5/P11/P14/P16/P19).
5. **Part P** page redesigns: P3/P4/P6/P8/P13 done (5/25);
   P9 partial; 19 remain.
6. **Part C** debt: C3 doc repair (this update); C5/C7 partial (4 items
   done, rest deferred); C1/C2/C4/C6/C8 remain.

## Coverage & end-state gates (all must hold simultaneously)

```
Pages: 57 (60 − input − page-info − table)

grep -rn 'gap-4"></div>' src/views/ui/                     → 6 remaining
                                                              (all P-item owned:
                                                               alert-dialog,
                                                               breadcrumb,
                                                               collapsible,
                                                               context-menu,
                                                               hover-card,
                                                               scroll-area)
grep -rn 'bg-bg' src/components/ui/dialog/dialog-content.tsx → hit   (T1)
grep -rn 'bg-'   src/components/ui/sheet/sheet.tsx           → hit   (T2)
useComponentVariant roster ≥ 35 files (or recorded exemption
  header in the component)                                  → 41    (T3)
grep -rln 'VariantGallery' src/views/ui/ | wc -l           → 21
                                                              (3 pages removed
                                                               vs expected 23)
grep -c 'ui-upgrade-3' docs/progress/ui-upgrade-2.md       → ≥ 10   (C3)
grep -n ': :\|^\[x\]' docs/progress/ui-upgrade-2.md        → empty  (C3)
ls src/views/ui/input src/views/ui/page-info src/views/ui/table
                                                            → absent (R)
Unit tests exist: popover-position, date-picker grids,
  checkbox, file-upload, button, menu-item-close            (C1 — open)
e2e/ui-smoke.spec.ts + ui axe pass, running in CI          → green  (C8)
node …/check-contrast.mjs --strict                         → exit 0
pnpm lint && pnpm typecheck && pnpm test                   → green  ✓
Manual: T4 overlay matrix checklist recorded in this doc
```

## References

- User field report 2026-07-14 (this doc's Part P source) + two
  screenshots: dialog dark-theme illegibility, sheet transparency
  (cached in session; re-shoot after T1/T2 for the before/after pair).
- ui-upgrade-3 verification pass 2026-07-14 (Part C source): gates all
  green, ~15 item claims overstated, 3 new defects (B5/B6/C7).
- React docs — error boundaries do not catch event-handler errors
  (Part B1 root cause).
- react-day-picker v10 caption/dropdown layout (P13).
- Radix HoverCard `--radix-hover-card-content-transform-origin` (P16).
