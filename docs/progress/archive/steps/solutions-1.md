# solutions-1 — designed fixes for everything in ui-analyze.md

> Written 2026-07-16. Companion to `ui-analyze.md` (same item IDs). This
> is a **design document** — it stays frozen as the design record. Every
> item below is a decided solution: API shape, files to touch,
> implementation notes where the design is non-obvious, and the per-item
> gate. When a phase is green-lit, copy its items into the
> `ui-upgrade-5.md` tracker with checkboxes; statuses live there, never
> here. *(Progress note: Phase A landed in b349c61 and was
> control-verified with gate fixes on 2026-07-16 — see the tracker.
> Parts B/C/D not started.)*
>
> **Global constraints honored by every solution** (house rules): no new
> runtime dependencies; token-only styling; `cn()` does not merge — new
> knobs are props, not className overrides; variant maps are plain
> `as const` objects resolved through `useComponentVariant` +
> `resolveVariant`; types live in `src/types/ui/`; every new part gets
> shim + barrel + demo-page + test treatment. Paths are relative to
> `next-js-boilerplate/`.
>
> **Standing gates for every item**: `pnpm lint && pnpm typecheck &&
> pnpm test`, contrast `--strict` exit 0, `e2e/ui-smoke.spec.ts` +
> `e2e/ui-a11y.spec.ts` green, all four themes for anything touching
> tokens/overlays, plus the item's own named gate below.
>
> **Breaking-change register** (internal-only; boilerplate has no
> external consumers — each lands with a grep-and-fix of app usages):
> `TabsProps.defaultValue` becomes optional (B1); Badge `variant` union
> drops `pill`/`dot`/`destructive` (A11); Alert `destructive` becomes an
> alias of `error` (A11); ~14 types files deleted with import rewrites
> (A3); `InputProps` gains `Omit<…, "size">` (B5).

---

## Part A — correctness & consistency debt

### A1 — add `"use client"` to the 10 variant-hook consumers

**Solution**: prepend the directive to the 10 files listed in
ui-analyze §A1 (skeleton, breadcrumb, kbd, textarea, pagination, card,
icon-button, button, badge, input). No restructuring — these components
are already client-only by construction (theme context); the directive
makes the failure mode a build-time story instead of a runtime crash.
The CSS-class alternative (read the global style from the `style-*`
class instead of context) is recorded under C6 as a future option, not
done now.

**Plus a canary** so the list can't regress: new
`src/components/ui/use-client-directive.test.ts` — reads every
`components/ui/**/*.tsx` that imports `useComponentVariant` (via
`fs` + glob, same spirit as the dialog/sheet className canaries) and
asserts line 1 is `"use client";`.

**Gate**: the canary test passes; the shell one-liner from ui-analyze §A1
returns empty.

### A2 — consolidate Typography into the folder; root becomes a shim

**Solution**:
1. Replace `typography/typography.tsx` with the full implementation
   currently in root `Typography.tsx` (the `Typography` component, its
   `variants`/`tags` maps, and `H1…Quote`). The folder copy is a subset,
   so this is a superset overwrite — nothing is lost.
2. Extend `typography/index.ts` to export `Typography` alongside
   `H1…Quote`.
3. Reduce root `Typography.tsx` to the standard one-line shim:
   `export { Typography, H1, H2, H3, H4, Lead, Large, Small, Muted, Code, Quote } from "./typography";`
4. Central barrel: change `export { Typography } from "./Typography";`
   to pull from `./typography`, merging with the existing `H1…Quote`
   line into a single export statement.
5. `grep -rn 'from "@/components/ui/Typography"' src/` — imports keep
   working through the shim; no call-site changes expected.

**Gate**: `wc -l src/components/ui/Typography.tsx` ≤ 3;
`grep -c "const variants" src/components/ui/typography/typography.tsx`
= 1 and the root file has none; typecheck + tests green.

### A3 — one types file per component; delete the 14 duplicates

**Decision rule**: the consolidated per-component file keeps the name
(`Avatar-types.ts`, `Checkbox-types.ts`, `Dialog-types.ts`,
`Command-types.ts`, `Select-types.ts`, `Tooltip-types.ts`,
`Skeleton-types.ts`, `DropdownMenu-types.ts`); the shape is the **union
of fields from both copies** unless a field is provably dead
(grep shows no consumer). Known reconciliations from the analysis:
- `SkeletonLineProps` adopts `width?: string` from the standalone file.
- `IndeterminateCheckboxProps` keeps `size?: CheckboxSize` + font trio
  (the richer consolidated shape).
- `DialogContentProps` keeps `variant`/`size` (consolidated shape).
- `TooltipContentProps` keeps the `ComponentPropsWithoutRef<"div">` base
  and gains a **typed** variant per A8 (not `variant?: string`).

**Mechanics**: for each of the 14 standalone files
(`AvatarGroup-types`, `CheckboxGroup-types`, `IndeterminateCheckbox-types`,
`DialogContent-types`, `CommandItem-types`, `SelectContent-types`,
`SelectItem-types`, `SelectValue-types`, `TooltipContent-types`,
`TooltipTrigger-types`, `SkeletonCard-types`, `SkeletonChatMessage-types`,
`SkeletonConversationSidebar-types`, `SkeletonFeedList-types`,
`SkeletonLine-types`, `SkeletonMessage-types` — 16 files if the two
Skeleton extras both exist; take the actual `ls` at implementation time):
`grep -rln "types/ui/<Name>-types"` → repoint each import to the
consolidated file → delete. Do it family-by-family (one commit per
family) so typecheck bisects cleanly.

**Gate**: `ls src/types/ui | wc -l` drops by the number of deleted files;
`grep -rn "DialogContent-types\|CommandItem-types\|SelectContent-types\|SelectItem-types\|SelectValue-types\|TooltipContent-types\|TooltipTrigger-types\|AvatarGroup-types\|CheckboxGroup-types\|IndeterminateCheckbox-types\|SkeletonLine-types\|SkeletonCard-types\|SkeletonMessage-types\|SkeletonChatMessage-types\|SkeletonConversationSidebar-types\|SkeletonFeedList-types" src/`
→ 0; typecheck green.

### A4 — complete the central barrel

**Solution**: in `components/ui/index.ts`:
- extend the checkbox line to
  `export { Checkbox, CheckboxGroup, IndeterminateCheckbox, CheckboxCard, CheckboxChip } from "./checkbox";`
- add `export { FileUpload } from "./file-upload";`,
  `export { ImageUpload } from "./image-upload";`,
  `export { LogoSpinner } from "./logo-spinner";` in alphabetical
  position.
Existing shim-based imports stay valid; no call-site changes.

**Gate**: `for n in FileUpload ImageUpload LogoSpinner CheckboxCard
CheckboxChip; do grep -q "$n" src/components/ui/index.ts || echo
"missing $n"; done` → empty.

### A5 — Combobox repairs (split: A5a mechanical now, A5b via C1)

**A5a (independent, do in Phase A)** — `combobox/combobox.tsx`:
1. `type="button"` on the trigger.
2. ARIA: trigger gets `role="combobox"`, `aria-expanded={open}`,
   `aria-haspopup="listbox"`, `aria-controls={listId}` (new `useId`);
   the `CommandList` gets `id={listId}` passed down.
3. `disabled?: boolean` prop → trigger `disabled` attr (base classes
   already style `disabled:` via the shared input-like recipe — add
   `disabled:cursor-not-allowed disabled:opacity-50` to the trigger
   class string, mirroring select-trigger).
4. Escape closes: `onKeyDown` on the wrapper div — `Escape` →
   `setOpen(false)` + refocus trigger.
5. Interim outside-click dismiss: reuse the existing
   `src/hooks/useClickOutside.ts` on the wrapper (single containing
   element, so the two-ref problem Select has doesn't apply here).
   This is ~6 lines and removes the user-facing bug without waiting
   for C1.

**A5b (lands with C1 adoption)**: portal the listbox through the shared
anchored layer (gets clipping fix, flip, scroll tracking) and swap the
interim `useClickOutside` for `useDismissableLayer`.

**Gate (A5a)**: new `combobox/combobox.test.tsx` — asserts
`type="button"`, `role="combobox"` + `aria-expanded` toggling, Escape
close + focus return, outside-click close, `disabled` blocks open.

### A6 — Select disabled options + non-string labels

**Solution** in `select/select-item.tsx`:
- Destructure `disabled`; render
  `data-disabled={disabled ? "" : undefined}` and `aria-disabled`
  alongside the native attr (menuItemStyles' `data-[disabled]:opacity-50
  data-[disabled]:pointer-events-none` then applies).
- Label fallback: registration effect becomes

```ts
useEffect(() => {
  const label =
    typeof children === "string"
      ? children
      : (itemRef.current?.textContent ?? "");
  const map = labelMap.current;
  map.set(itemValue, label);
  return () => void map.delete(itemValue);
}, [itemValue, children, labelMap]);
```

(ref is populated by effect time; `textContent` of the rendered item is
exactly what the trigger should display.)

**Solution** in `select/select-content.tsx`: change both querySelectorAll
calls (initial-focus effect + keyboard handler) to
`'[role="option"]:not([data-disabled])'` so arrows, Home/End, and
typeahead skip disabled options. Also clear the typeahead timeout on
unmount (store the id in a ref; `clearTimeout` in the keydown before
re-set and in a cleanup effect) — fixes the stray-timer nit.

**Gate**: extend/add `select/select.test.tsx` — disabled item has
`data-disabled` and is skipped by ArrowDown; a `<SelectItem>` with JSX
children shows its text in the trigger after selection.

### A7 — three positioning engines → solved by C1 (see Part C)

No separate work; recorded here only so the ID map stays 1:1 with the
analysis.

### A8 — replace every `variant?: string` with a typed union

**Pattern**: the file that owns the variant map exports its key union —
`export type FooVariant = keyof typeof fooVariants;` (this includes the
four global styles because the maps spread `globalStyleVariants`).
Types files then `import type { FooVariant }` — type-only imports, no
runtime cycle (`Button-types.ts` already does exactly this against
`button-styles.ts`).

**Touch list**: `Counter-types.ts` (`variant?: CounterVariant` from
counter.tsx map), `Checkbox-types.ts` (`CheckboxCardProps`/`ChipProps`
variants → `CheckboxVariant`), and the inline-typed props on
`PaginationLink`, `BreadcrumbList`, `CarouselPrevious/Next`,
`DrawerContent`, `DropdownMenuContent`, `PopoverContent`,
`TooltipContent` — each swaps `{ variant?: string }` for the owning
map's union.

**Gate**: `grep -rn "variant?: string" src/components/ui src/types/ui`
→ 0.

### A9 — implement the ring-offset spec on solid controls (decision: code follows spec)

**Decision rationale**: the offset isn't cosmetic — on brand-solid
controls (`bg-brand` + `ring-brand`) the focus ring is invisible without
a bg-colored gap; that's a WCAG focus-visibility problem, and it's why
the V0 spec says "solid controls". So the spec stays; the code catches
up. Inputs keep their current offset-less ring + `border-brand` (also
per spec).

**Touch list** (append `ring-offset-1 ring-offset-bg` next to the
existing `focus-visible:ring-2 focus-visible:ring-brand`): button,
icon-button, button-group item, badge-button, toggle, toggle-group item,
switch, checkbox (+card/chip), radio-group item, tabs-trigger,
pagination link/button, carousel prev/next, scroll-to-bottom-button.
`--bg` exists in all four theme blocks, so `ring-offset-bg` is
theme-safe. This lands mechanically via C3's shared
`interactive-states.ts` consts (see C3) rather than 15 hand edits —
sequence A9 with C3.

**Gate**: `grep -rln "ring-offset" src/components/ui --include='*.tsx' |
wc -l` ≥ 14; eyeball light + dark; contrast `--strict` re-run.

### A10 — every built-in string becomes overridable

**Two mechanics, matched to the two flavors found**:

1. **aria-labels**: audit the 19 grep hits; ensure each hardcoded
   `aria-label` is written **before** the `{...props}` spread so a plain
   `aria-label` prop wins (most already comply; fix the exceptions —
   e.g. `command-list.tsx` sets its label after destructuring, verify
   spread order per file). Document in SKILL.md (C8): *"localize by
   passing `aria-label`"*. No new props.
2. **Visible text**: dedicated overrides where text is baked in —
   - `PaginationPrevious`/`PaginationNext`: render
     `{children ?? <default svg+text>}` so consumers replace the whole
     content (today consumer children are silently discarded).
   - `Combobox`: add `searchPlaceholder?: string` (input placeholder,
     defaults to `placeholder`), `emptyTitle?: string` (default
     `"No results"`), `emptyDescription?: string`.
   - `ConfirmDialog`: already prop-driven (`confirmLabel`/`cancelLabel`)
     — no change.
   - `DatePicker`/`TimeInput`/date-inputs: verify placeholder/label
     defaults are props (most are); add where missing.

**Gate**: unit tests — Pagination renders custom children; Combobox
renders custom empty copy; `aria-label` override test on dialog close
button. Demo pages gain one Turkish-labeled example each for
pagination + combobox (keeps the pattern exercised; demo copy otherwise
stays English per house rule).

### A11 — one status vocabulary: `info | success | warning | error`

- **Alert** (`Alert-types.ts` + `alert/alert.tsx`): add `info` recipe
  (`bg-info/10 border-info/30 text-info` soft pattern, matching the
  existing success/warning recipes); rename `destructive` → `error` in
  the map and keep `destructive` as an alias key pointing at the same
  class string (zero-cost back-compat, both type-visible).
- **Toast** (`Toast-types.ts`, `toast/toast.tsx`): extend
  `variant` to `"default" | "success" | "warning" | "info" |
  "destructive"`; add the two soft recipes to `variantClasses`;
  duration policy — `destructive` stays `Infinity`, others default 5 s.
- **Badge** (`Badge-types.ts`, `badge/badge.tsx`): split axes —
  `variant` keeps `default | secondary | outline | soft | info | success
  | warning | error` (drop `destructive`, `pill`, `dot` from the union);
  new orthogonal props `pill?: boolean` (`rounded-full`) and
  `dot?: boolean` (leading `size-1.5 rounded-full bg-current` dot).
  Migrate app/demo usages via
  `grep -rn 'Badge[^>]*variant="\(destructive\|pill\|dot\)"' src/`.

**Gate**: the grep above → 0; contrast `--strict` re-run (new tints);
alert/badge/toast demo pages show the full status row; VariantGallery
variant lists updated on those three pages.

---

## Part C — cross-cutting engines (C1 first; it unblocks half of Part B)

### C1 — shared anchored-layer engine (solves A7, finishes A5b)

**Two hooks in `src/hooks/`** (client-only, tested):

```ts
// useAnchoredPosition.ts
interface AnchoredPositionOptions {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLElement | null>;
  side?: "top" | "bottom" | "left" | "right"; // default "bottom"
  align?: "start" | "center" | "end";         // default "start"
  sideOffset?: number;                          // default 8
  matchAnchorWidth?: boolean;                   // Select's trigger-width
}
// returns { style: React.CSSProperties | undefined; actualSide: Side }
```

Behavior (generalized from popover-content.tsx, today's best copy):
measure on open; re-measure on window `resize` and capture-phase
`scroll`; **flip on the main axis** when the preferred side lacks room
and the opposite side has it (report via `actualSide` so callers can set
`transform-origin`/animation direction); **clamp on the cross axis** to
an 8 px viewport inset; `position: fixed` output (matches the current
approach; no CSS anchor-positioning dependency). Left/right sides are
included from day one because dropdown submenus (B3) need them — same
math transposed.

```ts
// useDismissableLayer.ts
useDismissableLayer({
  open: boolean;
  onDismiss: () => void;
  insideRefs: React.RefObject<HTMLElement | null>[]; // content + trigger
  closeOnEscape?: boolean; // default true
});
```

Capture-phase `pointerdown` outside all `insideRefs` → `onDismiss`;
document-level Escape (when enabled) → `onDismiss`. Implementation
check: `src/hooks/useClickOutside.ts` already exists — if its signature
extends cleanly to a ref *array*, build on it; otherwise supersede it
and migrate its current consumers (grep at implementation time). One
outside-click implementation must remain at the end.

**Adoption order (one commit each, no visual change intended except the
named fixes)**:
1. **popover-content.tsx** — reference adopter; port
   `popover-positioning.test.ts` cases onto the hook (they become
   `useAnchoredPosition.test.ts`); popover gains `side` + `align:
   "center"` for free (B11 rider).
2. **select-content.tsx** — keeps width-match (`matchAnchorWidth`) and
   typeahead; **gains** vertical flip (the A7 fix).
3. **dropdown-menu-content.tsx** — **gains** scroll/resize tracking and
   flip (the A7 fix); keeps mobile bottom-sheet branch untouched (hook
   returns `undefined` style when the caller skips it below `sm`).
4. **combobox.tsx** — moves the listbox into a body portal anchored by
   the hook; swaps interim `useClickOutside` for `useDismissableLayer`
   (= A5b).

**Tests**: `useAnchoredPosition.test.ts` — fits-below, flips-above,
clamps-left/right, width-match, repositions on scroll (jsdom +
mocked `getBoundingClientRect`, pattern already proven in
`popover-positioning.test.ts`). `useDismissableLayer.test.ts` —
outside pointerdown dismisses, inside doesn't, Escape dismisses.

**Gate**: the four adopters share zero private positioning code
(`grep -n "getBoundingClientRect" src/components/ui/{popover,select,dropdown-menu,combobox} -r`
→ 0 outside the hooks); dropdown demo page: open menu, scroll — menu
tracks; all previous unit tests still green.

### C2 — reduced-motion sweep

**Solution**: add `motion-reduce:animate-none` (or
`motion-reduce:transition-none` for transition-driven cases) to the
remaining animated surfaces: `bottom-sheet.tsx` shared const
(`animate-slide-in-up` — one edit covers popover/select/dropdown mobile
branches), popover desktop `animate-scale-in`, drawer/sheet slide
classes, accordion/collapsible content animation classes (verify which
classes animate at implementation time), toast enter/exit (already has
`motion-reduce:transition-none` — extend to the `animate-slide-*`
classes), scroll-to-bottom `animate-fade-in-up`. **Documented
exemptions** (spinning loaders stay animated — they convey busy-ness,
and both already carry reduced-motion-safe usage): spinner, logo-spinner
— record with a header comment like the style-system exemptions. Carousel
is JS-scroll (embla), covered by B8's autoplay-respects-reduced-motion
rule instead.

**Gate**: `grep -rn "animate-" src/components/ui --include='*.tsx' -l`
cross-checked against `motion-reduce` presence in the same file (small
audit script in the tracker item); exemption headers present on the two
spinners.

### C3 — canonical interactive-state consts (carries A9)

**Solution**: new `src/components/ui/interactive-states.ts`:

```ts
export const focusRingSolid =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ring-offset-1 ring-offset-bg";
export const focusRingInput =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand";
export const disabledClasses =
  "disabled:pointer-events-none disabled:opacity-50";
export const pressFeedback = "active:translate-y-px";
```

Refactor the A9 touch list (buttons/toggles/switch/checkbox/etc.) to
compose `focusRingSolid` + `disabledClasses` (+ `pressFeedback` where
Button already has it — extend to icon-button, toggle, toggle-group,
badge-button for consistency); inputs compose `focusRingInput` +
existing base. Add a canary test asserting the const strings and their
presence in button/switch/checkbox classNames (same style as the
dialog/sheet canaries from ui-upgrade-4).

**Gate**: canary green; `grep -c "focus-visible:ring-brand
focus-visible:ring-2\|focus-visible:ring-2 focus-visible:ring-brand"
raw-string duplicates trends toward the consts (target: consts used in
≥ 12 files).

### C4 — string-overridability convention → implemented by A10; SKILL.md line lands with C8.

### C5 — RTL groundwork (rule only, no sweep)

**Solution**: one paragraph added to the ui-components SKILL.md styling
rules: *"Prefer logical utilities (`ms-*/me-*`, `ps-*/pe-*`,
`start-*/end-*`, `text-start/end`) over `ml/mr/left/right` in new
component code; both shipped locales are LTR today, so do not sweep
existing code."* Nothing else.

### C6 — document the client-boundary reality (after A1)

**Solution**: replace the SKILL.md "Client vs server" paragraph with
(copy-paste ready):

> Components are server-renderable **only if they don't consume the
> global style system**. Anything calling `useComponentVariant` (the
> 44-file roster) is client-only by construction and must carry
> `"use client"` itself — do not rely on being imported from a client
> tree; a canary test enforces this. Truly server-safe components today:
> table, native-select, input-group, typography, label, empty and other
> hook-free files. Future option (not planned): resolve the global style
> from the `style-*` class on `<html>` via CSS instead of context, which
> would make the primitives server-safe again.

### C7 — test-with-the-fix rule + named backfills

**Solution**: definition-of-done for every A/B item above includes its
test (each item's gate already names it). Standalone backfills bundled
into the phase: `combobox.test.tsx` (A5a), `select.test.tsx` (A6/B4),
`tabs` controlled tests (B1), toast update/promise/cap (B2), dropdown
collision + submenu/check/radio (C1/B3), `usePagination` math (B9),
confirm-dialog pending (B7), anchored-position + dismissable-layer hook
suites (C1). Target: ui test files 15 → ~24.

### C8 — SKILL.md sync (closeout item, do last)

**Solution**: regenerate the `useComponentVariant` roster paragraph from
the A1 gate grep (count will shift as B/D items add consumers); add to
the checklist: hand-rolled triggers set `type="button"`; disabled
menu/list items set `data-disabled`; hardcoded `aria-label`s go before
the props spread; props extending `input` must `Omit<…, "size">` when
adding a size prop; new strings follow the A10 overridability pattern;
C5's logical-properties line; C6's client-boundary paragraph. Also
update the roster count note in the project memory file afterwards.

---

## Part B — feature completion of existing components

### B1 — controlled Tabs (+ `keepMounted`)

**API** (`Tabs-types.ts`): `defaultValue?: string` (was required),
`value?: string`, `onValueChange?: (v: string) => void`;
`TabsContentProps` gains `keepMounted?: boolean`.

**Implementation** (`tabs/tabs.tsx`):

```ts
const [internal, setInternal] = useState(defaultValue ?? "");
const isControlled = value !== undefined;
const activeValue = isControlled ? value : internal;
const handleValueChange = useCallback((v: string) => {
  if (!isControlled) setInternal(v);
  onValueChange?.(v);
}, [isControlled, onValueChange]);
```

`tabs-content.tsx`: `if (!active && !keepMounted) return null;` else
render with `hidden={!active}` + `data-state` — preserves form state in
inactive panels when opted in.

**Demo**: "Controlled" tab on the tabs page syncing to the URL via the
existing `useClientSearchParams` hook. **Test**: controlled switching
(parent state drives), uncontrolled still works, `keepMounted` preserves
an `<input>` value across tab switches.

### B2 — Toast: update/promise API, warning/info, cap, position

**Reducer** (`toast-provider.tsx`): add
`{ type: "UPDATE"; id: string; patch: Partial<Omit<ToastData, "id">> }`;
`ADD` evicts the oldest toast when `state.length >= 5` (hard cap in one
place; predictable).

**Hook** (`use-toast.ts`): return `{ toast, dismiss, update, promise }`:

```ts
const update = (id, opts: ToastOptions) =>
  dispatch({ type: "UPDATE", id, patch: opts });

function promise<T>(p: Promise<T>, msgs: {
  loading: ToastOptions | string;
  success: (v: T) => ToastOptions | string;
  error: (e: unknown) => ToastOptions | string;
}): Promise<T> {
  const id = toast({ ...norm(msgs.loading), duration: Infinity });
  p.then(
    (v) => update(id, { ...norm(msgs.success(v)), variant: "success", duration: DEFAULT_DURATION }),
    (e) => update(id, { ...norm(msgs.error(e)), variant: "destructive" }),
  );
  return p;
}
```

(`norm` lifts a plain string to `{ title }`.) Timer note: the per-toast
effect in `toast.tsx` keys on `toast.duration`, so Infinity → 5000
retriggers it naturally; content-only updates don't restart the timer —
correct behavior, assert it in tests.

**Variants**: extend `variantClasses` with
`warning: "bg-warning/10 border-warning/30 text-warning"`,
`info: "bg-info/10 border-info/30 text-info"` (A11 lands the type).

**Position**: `ToastViewport` gains
`position?: "bottom-right" | "top-right" | "bottom-center"` (default
bottom-right) → placement-class map + matching enter/exit animation pair
per position (slide-in-right for right column, fade/slide-up for
bottom-center); keep the map small and closed.

**Tests** (extend `toast.test.tsx`, fake timers): update patches in
place; promise loading→success and loading→error; cap evicts oldest;
warning/info render their recipes.

### B3 — DropdownMenu: submenus, checkbox/radio items, shortcuts (after C1)

**New parts** (each a sibling file in `dropdown-menu/`, exported through
folder barrel → shim → central barrel):
- `dropdown-menu-checkbox-item.tsx` — `role="menuitemcheckbox"`,
  `checked`/`onCheckedChange`, `aria-checked`, leading `w-4` indicator
  column (check svg), `data-disabled` convention, does **not**
  auto-close (checkboxes toggle in place; document).
- `dropdown-menu-radio-group.tsx` + `dropdown-menu-radio-item.tsx` —
  group context `{value, onValueChange}`; items `role="menuitemradio"`,
  dot indicator, close on select.
- `dropdown-menu-sub.tsx` (+ `SubTrigger`, `SubContent`) — sub context
  `{open, setOpen, triggerRef}`; SubTrigger is a `menuitem` with
  `aria-haspopup="menu"` + trailing chevron; opens on hover (150 ms
  intent delay) and `ArrowRight`/Enter; `ArrowLeft` closes back to
  parent. SubContent uses `useAnchoredPosition` with `side: "right"`
  (flips to left near the edge) — this is why C1 ships left/right.
  **Mobile**: SubContent renders inline (indented, non-portaled) inside
  the bottom sheet — no nested sheets.
- `dropdown-menu-shortcut.tsx` — `<span className="ms-auto">` composing
  `Kbd` (uses a logical property per C5).

**Shared keyboard util**: extract Select's typeahead + Home/End +
arrow logic into `src/components/ui/menu-keyboard.ts`
(`handleMenuKeyNav(e, container, { itemSelector, typeaheadRef })`) and
use it from select-content, dropdown-menu-content (which today lacks
typeahead/Home/End), and future context-menu parity.

**Root additions**: trigger id via `useId` in root context; content gets
`aria-labelledby={triggerId}`.

**Radix parity riders** (small, same commit series): export the
already-available Radix `Sub`/`CheckboxItem`/`RadioGroup`/`RadioItem`
parts from `context-menu` and `menubar` wrappers, styled with
`menuItemStyles`, so all three menus offer the same item vocabulary.

**Types**: extend `DropdownMenu-types.ts` (post-A3 single file).
**Demo**: rebuild dropdown page tabs — "View options" (checkboxes),
"Sort by" (radio), "Share ▸" (submenu), shortcut column. **Tests**:
aria-checked toggle, radio single-select, ArrowRight/Left open/close,
typeahead jump, shortcut renders.

### B4 — Select: groups, size, arrow-to-open

- `select-group.tsx`: `<div role="group" aria-labelledby={id}>`;
  `select-label.tsx`: `useId`-linked label styled like
  `DropdownMenuLabel` (`px-2 py-1.5 text-xs text-muted`).
- `SelectTriggerProps` gains `size?: "sm" | "md" | "lg"` → reuse
  `inputSizes` (the trigger's base already mirrors input base; swap the
  hardcoded `h-9 px-3 py-2 text-sm` for the map lookup).
- Trigger `onKeyDown`: `ArrowDown`/`ArrowUp` (and Enter/Space already
  native) → `setOpen(true)`; content's existing selected-item focus
  effect then does the right thing.
- Barrel/shim/types/demo updates; VariantGallery on the select page
  gains the sizes axis.

**Tests**: group label association; ArrowDown on closed trigger opens
and focuses the selected option; size classes applied.

### B5 — `size` prop across text controls

**API**: `size?: "sm" | "md" | "lg"` (default `"md"`) on Input,
Textarea, NativeSelect, Combobox (trigger), DatePicker (trigger),
TimeInput (segments scale), SelectTrigger (done in B4). **Type care**:
props extending `ComponentPropsWithoutRef<"input"|"select">` must add
`Omit<…, "size">` (native numeric `size` attr conflict — Checkbox
already models this).

**Implementation**: Input/NativeSelect/triggers use `inputSizes[size]`
directly (`input.tsx` deletes the `inputSizes.md` hardcode — the map
finally earns its keep). Textarea gets its own
`textareaSizes = { sm: "text-xs px-2 py-1.5", md: …, lg: … }` in
`input-styles.ts` (no fixed heights — rows stay consumer-controlled).
Icon-padding (`pl-9`/`pr-9`) stays constant in v1.

**Demo**: input/textarea/native-select/combobox/date-picker/time-input
pages set `sizes={["sm","md","lg"]}` in their VariantGallery (today
`sizes={[]}`). **Gate**: galleries render 3 size columns; typecheck
(the Omits); existing e2e pages stay green.

### B6 — error/description parity on choice controls

**Solution**: add `error?: string; description?: string` wired through
`useFieldMessages` to Checkbox, IndeterminateCheckbox, CheckboxGroup
(group-level: container `role="group"` + `aria-describedby`), RadioGroup
(on the Radix Root), Switch, Slider, NativeSelect. Control-level
`aria-invalid` where a single input exists; group-level otherwise.
Layout: same `flex flex-col gap-1` + `{messages}` pattern as Input.

**Tests**: extend `field-messages.test.tsx` with a parameterized matrix
over the seven controls (error id wiring + `aria-describedby`).

### B7 — ConfirmDialog: pending, error surface, tone

**API** (`ConfirmDialog-types.ts`): add
`tone?: "destructive" | "default"` (confirm button variant destructive ↔
primary; default `"destructive"` preserves current behavior) and
`errorFallbackLabel?: string` (default `"Something went wrong"`).

**Implementation sketch** (`confirm-dialog/confirm-dialog.tsx`):

```ts
const [pending, setPending] = useState(false);
const [error, setError] = useState<string | null>(null);
async function confirm() {
  setPending(true); setError(null);
  try { await onConfirm(); setOpen(false); }
  catch (e) { setError(e instanceof Error ? e.message : errorFallbackLabel); }
  finally { setPending(false); }
}
```

Confirm `<Button loading={pending}>`, cancel disabled while pending,
`error` rendered as an `<Alert variant="error">` inside the dialog body
(A11 provides the variant). Reset `error` on open.

**Tests**: resolve → closes; reject → stays open, shows message,
buttons re-enable; double-click during pending fires once.

### B8 — Carousel: labels, indicators, autoplay, slide semantics

- **A11y**: Carousel root gets `role="region"`,
  `aria-roledescription="carousel"`, `aria-label` prop (default
  `"Carousel"`); `CarouselPrevious/Next` get `aria-label` defaults
  (`"Previous slide"`/`"Next slide"`, overridable per A10);
  `CarouselContent` maps children with `Children.map` to provide an
  index/count context so `CarouselItem` renders `role="group"`,
  `aria-roledescription="slide"`, `aria-label="{i+1} of {n}"`.
- **Context expansion**: expose `selectedIndex`, `scrollSnaps`,
  `scrollTo(i)` (embla `api.scrollTo`, `selectedScrollSnap`,
  `scrollSnapList` + `select` listener already wired).
- **`CarouselDots`** new part: one button per snap,
  `aria-label="Go to slide N"`, `aria-current` on active, token styling
  (`bg-border` / active `bg-brand`).
- **Autoplay**: `autoplay?: number` (ms) on Carousel — `useEffect`
  interval calling `scrollNext` (wrap to 0 at end), cleared/paused on
  hover (`pointerenter/leave`), on focus-within, when
  `document.hidden`, and entirely disabled when
  `matchMedia("(prefers-reduced-motion: reduce)")` matches. Hand-rolled
  ~30 lines — embla's autoplay plugin is a separate package (dep rule).

**Tests** (fake timers): dots count/active state; `scrollTo` called on
dot click; autoplay advances, pauses on hover, no-ops under mocked
reduced-motion.

### B9 — `usePagination` + button mode

**Hook** `src/hooks/usePagination.ts`:

```ts
type PaginationItem = number | "ellipsis-start" | "ellipsis-end";
usePagination({ page, count, siblings = 1, boundaries = 1 }): PaginationItem[]
```

Standard windowing: always show `boundaries` pages at each end +
`siblings` around `page`; collapse gaps > 1 into the ellipsis sentinels;
total slots fixed at `boundaries*2 + siblings*2 + 3` so the control
never changes width. Pure function → exhaustive unit table.

**Parts**: `PaginationButton` — same classes as `PaginationLink` but a
real `<button type="button">` with `aria-current="page"` when active
(for client-side pagers where an `<a>` without `href` is wrong);
`PaginationPrevious/Next` children override lands via A10.

**Demo**: rewire the pagination page's scroll-driven example through the
hook. **Tests**: window math cases (short lists, head, middle, tail).

### B10 — DateRangePicker (new sibling, not a mode overload)

**Decision**: keep `DatePicker`'s single-`Date` API untouched; add
`date-picker/date-range-picker.tsx` + `DateRangePicker-types.ts`:

```ts
interface DateRange { from?: Date; to?: Date }
interface DateRangePickerProps {
  value?: DateRange; onChange?: (r: DateRange | undefined) => void;
  numberOfMonths?: 1 | 2;            // default 2 on desktop
  placeholder?: string; error?: string; description?: string;
  variant?: DatePickerVariant; startMonth?: Date; endMonth?: Date;
  disabled?: boolean;
}
```

Implementation: DayPicker `mode="range"` (v10 native) inside the same
anchored popover shell DatePicker uses; trigger renders
`"{format(from)} – {format(to)}"` via the existing `@/lib/date-time`
helpers (datetime-inputs skill rule: never hand-roll formatting).
**Calendar riders**: demo tabs for `mode="range"` and `mode="multiple"`
on the calendar page (props already pass through), plus a documented
`disabled` matcher example. Barrel/shim/demo/test per house anatomy;
range-selection test follows `date-picker.test.tsx` grid patterns.

### B11 — Dialog / Drawer / Popover polish

- **Dialog `dismissible?: boolean`** (default true): when false, the
  `cancel` listener still `preventDefault()`s but skips
  `onOpenChange(false)`; backdrop-click handler no-ops; the built-in
  close ✕ hides. Escape/backdrop behavior verified by test.
- **Scrollable body**: dialog panel gains `max-h-[85vh]` + `flex
  flex-col`; `DialogBody` gets `min-h-0 overflow-y-auto` so
  header/footer pin and content scrolls (verify against current
  `dialog-content.tsx` flex structure during implementation — adjust
  only the panel wrapper, not the portal/animation machinery).
- **Drawer `direction`**: `DrawerContent` accepts
  `direction?: "bottom" | "top" | "left" | "right"` (default bottom) —
  a class map per side (`bottom`: current classes; `right`:
  `inset-y-0 right-0 w-3/4 sm:max-w-sm rounded-l-2xl` etc.); the drag
  handle renders only for `bottom`/`top` (vertical bar variant for
  sides is noise — omit). Document that the same `direction` must be
  passed to the `Drawer` root (vaul's Root owns gesture direction and
  already forwards props through our re-export).
- **Popover**: `side`/`align="center"` arrive free with C1; **focus
  containment decision**: close-on-focus-out (lighter than a trap,
  matches the menu-ish usage): `focusout` listener on content — if
  `relatedTarget` is outside content **and** trigger → `close()` without
  focus restore. `initialFocus` behavior unchanged.

**Tests**: non-dismissible dialog ignores Escape + backdrop; drawer
`direction="right"` renders the side classes; popover closes when focus
tabs out.

### B12 — Command: ranked filtering + ⌘K dialog

- **Item registration** gains `keywords?: string[]` and uses the item's
  rendered label for matching (`label` captured like Select's fix in A6:
  string child or `textContent`).
- **Scoring** (`command.tsx`, pure helper + test):
  `score = 0` exact-prefix on label/value; `1` word-boundary start;
  `2` substring; `3` keyword hit; no match → filtered out. Sort by
  score, then registration order. `selectedIndex` reset logic unchanged.
- **New parts**: `command-separator.tsx` (`role="separator"`, border
  token); `CommandShortcut` span composing `Kbd` (`ms-auto`).
- **`command-dialog.tsx`**: Dialog (`size="sm"`, no padding body) +
  Command; props `{ open?, onOpenChange?, hotkey?: boolean | string }` —
  `hotkey` default `"mod+k"`: document-level keydown
  (`(e.metaKey || e.ctrlKey) && e.key === "k"` → toggle, preventDefault)
  attached only while mounted; uncontrolled internal state fallback so
  `<CommandDialog hotkey />` alone works.

**Demo**: "⌘K Dialog" tab on the command page (page count unchanged).
**Tests**: scoring order (prefix beats substring), keywords match,
hotkey opens/closes, separator/shortcut render.

### B13 — smaller singles (one solution line each)

- **Slider**: `marks?: { value: number; label?: string }[]` →
  absolutely-positioned ticks under the Radix track at
  `left: ((v - min) / (max - min)) * 100%`; `showValue?: boolean` →
  value bubble rendered as a child of `Slider.Thumb` (token styling,
  `shadow-md`, hidden until focus/drag via `data-state`).
- **InputOTP**: `pattern?: "numeric" | "alphanumeric"` → sanitizer map
  (`/[^0-9]/g` | `/[^a-zA-Z0-9]/g`, uppercase alphanumeric), keep
  `inputMode` in sync (`numeric` | `text`); `groups?: number[]`
  (e.g. `[3, 3]`) → visual boxes chunked with a `–` separator span
  (`aria-hidden`, value/input untouched).
- **Table**: `stickyHeader?: boolean` on Table → `[&_thead]:sticky
  [&_thead]:top-0 [&_thead]:z-10` + solid `bg-surface` on TableHead
  (replaces `bg-surface/50` when sticky — translucency smears over
  scrolled rows); new `TableHead sortable` mode:
  `{ sorted?: "asc" | "desc" | false; onSort?: () => void }` renders an
  internal `<button type="button">` filling the cell + `aria-sort`;
  new `TableEmpty` part (`<tr><td colSpan>` wrapping a compact `Empty`).
- **ProgressCircle**: new `progress/progress-circle.tsx` — SVG ring
  (`stroke-dasharray` = circumference, `dashoffset` from `value/max`),
  `size sm|md|lg` (`size-4/6/8`), `indeterminate` → spin animation
  (+`motion-reduce:animate-none`), same aria pattern as Progress
  (`role="progressbar"`, `aria-valuenow`), reuses `Progress-types`
  unions; exported as `ProgressCircle`.
- **Avatar**: `status` union extends to
  `"online" | "away" | "busy" | "offline"` → dot classes
  `bg-success | bg-warning | bg-error | bg-muted`.
- **ScrollArea**: pass through Radix Root's `type?: "auto" | "always" |
  "scroll" | "hover"` and `scrollHideDelay?: number` (pure prop
  plumbing + types) — gives consumers an always-visible thumb where the
  app-wide native-scrollbar hiding needs an affordance.
- **NavigationMenu**: `asChild` on `NavigationMenuLink` using the same
  clone pattern as `DropdownMenuTrigger` (merge className/onClick, no
  wrapper span needed for an anchor) so `next/link` composes; demo shows
  it.

---

## Part D — new components (design-level specs; full specs go in the tracker item when each starts)

Common anatomy for every D-item: `src/components/ui/<kebab>/` +
folder barrel, PascalCase shim, `src/types/ui/<Pascal>-types.ts`,
central-barrel export, `src/views/ui/<kebab>/PageContent.tsx` with
ExampleTabs (+ VariantGallery where a variant/size axis exists),
colocated test, **and** a bump to the e2e page-roster count in
`e2e/ui-smoke.spec.ts` / `e2e/ui-a11y.spec.ts` (57 → 57 + n).

### D1 — DataTable

```ts
interface DataTableColumn<T> {
  key: string; header: React.ReactNode;
  cell?: (row: T) => React.ReactNode;      // default: row[key]
  sortable?: boolean; align?: "left" | "right" | "center"; width?: string;
}
interface DataTableProps<T> {
  columns: DataTableColumn<T>[]; data: T[]; getRowId: (row: T) => string;
  sort?: { key: string; dir: "asc" | "desc" } | null;      // controlled
  defaultSort?: { key: string; dir: "asc" | "desc" };       // uncontrolled
  onSortChange?: (s: { key: string; dir: "asc" | "desc" } | null) => void;
  selection?: { selected: string[]; onChange: (ids: string[]) => void };
  loading?: boolean; skeletonRows?: number;                 // default 5
  empty?: React.ReactNode;                                   // default <Empty …>
  onRowClick?: (row: T) => void; stickyHeader?: boolean;
  caption?: string;
}
```

Composes Table parts (B13 sticky/sortable/TableEmpty do the heavy
lifting), IndeterminateCheckbox in the header + Checkbox per row for
selection (`data-state="selected"` styling already exists on TableRow),
SkeletonLine rows for `loading`. Uncontrolled sort = client-side
comparator (localeCompare / numeric auto-detect); controlled sort =
server-driven, component only renders indicators. Generic component —
types file carries the generics. Demo: invoice-style mock with sort +
selection + `usePagination` (B9) wired.

### D2 — MultiSelect

Trigger styled like SelectTrigger showing selected labels as chips
(reuses the CheckboxChip visual, `+N` overflow summary past 2);
panel = C1 anchored layer (bottom sheet on mobile, matching Select)
containing an optional search input + checkbox option list.
API: `{ options: { value; label; disabled? }[]; values: string[];
onValuesChange; placeholder?; searchable?; max?; size?; error?;
description?; disabled? }`. Semantics: panel `role="listbox"
aria-multiselectable="true"`, options `role="option" aria-selected`;
keyboard parity with Select (arrows/Home/End/typeahead via the shared
`menu-keyboard.ts` from B3, Space toggles without closing, Escape
closes). Hidden `<input name>` serialization: one input per value.

### D3 — Field + TanStack Form adapter (build first in Phase C)

- `src/components/ui/field/`: `Field` (context provider generating ids;
  `flex flex-col gap-1` layout), `FieldLabel` (renders `Label` with
  `htmlFor` from context + `required` pass-through), `FieldControl`
  (clones its single child adding `id`, `aria-describedby`,
  `aria-invalid` — the child stays any of our inputs), and field
  messages rendered from context via the existing
  `field-messages.tsx` machinery (no duplication — Field wraps
  `useFieldMessages`).
- `src/lib/forms/field-adapter.ts`:
  `fieldProps(field)` → `{ name, value, onChange, onBlur, error }`
  mapping TanStack Form's field api (first error of
  `field.state.meta.errors` → our `error` string; adapters for both
  `onChange(e)` DOM-style and `onValueChange(v)` value-style controls).
- **Acceptance test = migration**: rewrite
  `src/views/(demos)/form/Form.tsx` (the raw TanStack signup form) onto
  Field/fieldProps; the diff shrinking is the DX proof. Unit tests on
  id/aria wiring + adapter mapping.

### D4 — Stepper

Parts: `Stepper` (root: `value: number`, `onValueChange?`,
`orientation?: "horizontal" | "vertical"`, `linear?: boolean` default
true), `StepperItem` (`index`, derives `complete | current | upcoming`
from context, `error?: boolean` override), `StepperTrigger` (button;
clickable when `!linear || complete`), `StepperSeparator` (connector
line, `bg-border` → `bg-brand` when the preceding step is complete).
Semantics: `<ol>` list, `aria-current="step"` on the current item;
indicator circle shows index / check / error glyph with status-token
tinting. Pure markup + tokens, no deps.

### D5 — TagInput

`{ value: string[]; onChange; placeholder?; validate?: (tag: string) =>
boolean | string; max?; allowDuplicates?: false; disabled?; size?;
error?; description?; addOnPaste?: true; removeLabel? }`. Behavior:
Enter/comma commits the draft; paste splits on commas/newlines;
Backspace on an empty draft removes the last tag; invalid `validate`
result shows via FieldMessages. Rendering: chip row (new `Tag` visual —
CheckboxChip minus checkbox semantics, with an ✕ remove button carrying
`removeLabel` default `"Remove {tag}"`) wrapping a borderless inner
input inside one focus-ringed container (input-styles base).

### D6 — CopyButton

`{ value: string; label?: string ("Copy"); copiedLabel?: string
("Copied"); timeout?: number (2000); size?; variant? }` — IconButton
composing `navigator.clipboard.writeText` (modern-only; no execCommand
fallback — documented), swaps `IconCopy` → `IconCheck` for `timeout` ms,
announces via an `aria-live="polite"` sr-only span. ~50 lines + test
(clipboard mocked).

### D7 — Rating

`{ value: number; onChange?; max?: 5; allowHalf?; readOnly?; size?;
label? }`. Interactive mode: `role="radiogroup"` of visually-hidden
radios (keyboard arrows + click), tabler `IconStar/IconStarFilled` (+
half via clipped overlay) in `text-warning`; `readOnly` renders a
static `role="img"` with `aria-label="{value} of {max}"`. No deps.

### D8 — CommandDialog → delivered by B12 (kept here for ID parity).

**Tier 2** (Timeline, Banner, Stat, TreeView, CodeBlock, AnchorNav,
Lightbox, ScrollToTopButton): deliberately **not designed here** — spec
them in `solutions-2.md` if/when Phase C completes with appetite left,
per the phased-workflow rule of not writing the next phase early.

---

## Demo & docs solutions (Phase D)

1. **VariantGallery to full coverage**: compute the worklist at start via
   `grep -rLn "VariantGallery" src/views/ui/*/PageContent.tsx` filtered
   to components with a variant or size axis; known adds from this doc:
   input/textarea/native-select/combobox/select/date-picker/time-input
   (sizes, B5), alert/badge/toast (status rows, A11), toggle/kbd
   (variant axes). Target: every axis-bearing page has a gallery tab.
2. **PropsTable convention**: new `src/views/ui/_shared/PropsTable.tsx`
   (`{ rows: { prop, type, default?, description }[] }` → Table parts);
   `ExampleTabs` gains optional `api?: PropsTableRow[]` appending an
   "API" tab. Adoption rule: every page touched by an A/B/D item adds
   its table in the same commit — no big-bang backfill.
3. **KeyboardLegend**: new `_shared/KeyboardLegend.tsx`
   (`{ bindings: { keys: string[]; action: string }[] }` → Kbd rows);
   adopt on select, dropdown-menu, tabs, command, input-otp, slider
   pages. Doubles as the manual-QA checklist for T4-style passes.
4. **e2e roster bookkeeping**: every D-item page bumps the expected page
   count in `e2e/ui-smoke.spec.ts` + `e2e/ui-a11y.spec.ts`; the
   ui-index page (`views/ui/PageContent.tsx`) gains the new links.

---

## Execution order (for the future ui-upgrade-5 tracker)

| Phase | Items | Notes |
|---|---|---|
| **A — debt** | A1, A2, A3, A4, A5a, A6, A8, A10, A11 (A9 deferred into C3) | All independent of each other except A3 before any B-item that edits the same types files. One commit per item, gate in the commit message. |
| **B — engines + behavior** | C1 (+A5b) → B3, B4, B11, B12 (anchored-layer dependents); C3 (+A9), C2 in parallel; B1, B2, B5, B6, B7, B8, B9, B10, B13 independent | C1 is the critical path; land it first with the popover no-change refactor as proof. |
| **C — new components** | D3 → D1 → D2, D4, D5, D6, D7 | D3 first (every later form demo uses it); D1 depends on B13-table + B9. |
| **D — docs/demos/closeout** | Demo items 1–4, C7 residuals, C8 SKILL.md sync, memory-file roster update | C8 strictly last — it snapshots the end state. |

Conversion rule (per the phased-roadmap workflow): when a phase starts,
copy its items into `ui-upgrade-5.md` as `[ ]` checklist entries with
their gates verbatim; annotate evidence inline there; this file stays
frozen as the design record. **Do not begin implementation from this
document alone.**
