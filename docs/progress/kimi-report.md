# UI Component Library & Showcase — Audit Report

**Date:** 2026-08-02
**Scope:** `next-js-boilerplate/src/components/ui/` (component library) + `next-js-boilerplate/src/app/v1/[lang]/ui/` (live showcase) + theming/docs
**Method:** Static audit of ~200 component files, 62 demo routes, shared demo scaffolding, e2e specs, `globals.css`, root docs. Key claims below were verified against the source.

---

## 1. Executive Summary

You have a genuinely mature setup: **~68 components**, a uniform anatomy (kebab folder + PascalCase shim + central barrel + extracted types), a custom theme pipeline (Tailwind v4 CSS-first, 6 theme presets, semantic tokens), a live in-app styleguide with 61 registered demos, and an unusually strict rulebook in `AGENTS.md` that the code mostly follows. This is well past "shadcn clone" quality in consistency — the `useComponentVariant`/`resolveVariant` global-style pipeline and the `?tab=` SSR-synced demo scaffolding are ideas most libraries don't have.

The main weaknesses are **drift, not design**: a showcase registry that misses a demo (`emoji-picker`), an e2e smoke suite anchored on ARIA roles the demo scaffolding doesn't render, a barrel/shim convention with a handful of gaps, 7 shipped components with no demo at all (including `Table` and standalone `Input`), and demo-index UX that doesn't scale (flat grid of 61 tiles, no search/categories, no code snippets). For a boilerplate meant to be reused across projects, the highest-leverage improvements are: fix the broken test/registry gaps, close the demo coverage holes, add "copy the code" to the showcase, and de-drift `components.md`.

---

## 2. Inventory

| Area | Count | Notes |
|---|---|---|
| Component folders (`src/components/ui/<kebab>/`) | 68 | uniform `index.ts` per folder |
| PascalCase root shims | 66 | `page-header` / `page-info` missing shims (see §4.1) |
| Root-level helper files | 7 | `button-styles.ts`, `input-styles.ts`, `menu-item-styles.ts`, `global-style-variants.ts`, `bottom-sheet.tsx`, `field-messages.tsx`, `skeleton-shapes.tsx` |
| Type files (`src/types/ui/`) | 94 | ~105 component files consume them |
| Colocated unit tests | 21 | incl. a `"use client"` canary meta-test |
| Demo routes (`app/v1/[lang]/ui/`) | 62 | 61 in the registry + `emoji-picker` unregistered |
| Registered in `UI_COMPONENTS` (`src/constants/ui-gallery.ts`) | 61 | drives index grid + both e2e specs |
| Themes (`globals.css`) | 6 | light, dark, shiny, glass, neon, gradient (+ `.style-default` marker) |
| Semantic color tokens | 18 | `bg`, `fg`, `brand`, `surface*`, `muted*`, 4 status pairs, `overlay`, `border` |
| Radix-backed components | ~19 files / 15 `@radix-ui/*` deps | accordion, alert-dialog, slider, menubar, etc. |
| Hand-rolled overlays | dialog, select, popover, tooltip, dropdown-menu, tabs, command | deliberate, documented |

---

## 3. Strengths (keep doing these)

1. **Architecture discipline is real, not aspirational.** Zero `"use client"` in `app/v1/[lang]/ui/`, all 65 `page.tsx` files export `generateMetadata` from i18n keys, all client content lives in `src/views/ui/`. This matches the AGENTS.md rules exactly.
2. **The `ExampleTabs` + `VariantGallery` scaffolding** (`src/views/ui/_shared/`) gives every demo tabbed, URL-synced (`?tab=`, SSR `initialTab` via `searchParams`) examples plus a variant×size preview matrix wired into the global style recipes (shiny/glass/neon/gradient).
3. **i18n parity is perfect:** 136/136 keys in `messages/en/ui` vs `messages/tr/ui`; metadata is bilingual everywhere.
4. **Theming is well-engineered:** class-based dark mode (`@custom-variant dark`), pre-paint `theme-init.js` flash prevention, cookie persistence, semantic-token-only styling, `--comp-*` component tokens for the style presets.
5. **Testing beyond the baseline:** 21 colocated tests, a meta-test asserting every `useComponentVariant` consumer starts with `"use client"`, per-page axe e2e (`ui-a11y.spec.ts`), and a content-integrity smoke walk (`ui-smoke.spec.ts`).
6. **Zero TODO/FIXME/HACK debt** in the library; a single, documented `@deprecated` (`FieldMessages` → `useFieldMessages`).
7. **No unused components** — every suspicious one (`bottom-sheet`, `Counter`, `LogoSpinner`, `ScrollToBottomButton`, `Kbd`…) has real consumers.

---

## 4. Findings

### 4.1 Broken / out-of-sync (fix first)

| # | Finding | Evidence | Impact |
|---|---|---|---|
| B1 | **`e2e/ui-smoke.spec.ts` anchors on `role="tablist"`/`role="tab"`/`role="tabpanel"`, but `ExampleTabs` renders plain `<button>`s with no tab roles.** The only `role="tablist"` in the codebase is the real `Tabs` component (`tabs/tabs-list.tsx`). | `e2e/ui-smoke.spec.ts:35-48`; `src/views/ui/_shared/ExampleTabsDesktopBar.tsx` (no roles); same anchor in `e2e/ui-a11y.spec.ts:28` | The smoke walk fails on essentially every demo page whenever it actually runs (in CI it silently passes because pages redirect to `/sign-in` and the spec skips). The a11y suite inherits the same mismatch. Fix by giving `ExampleTabs` real tab semantics (recommended — also fixes the a11y gap, see A1) or re-anchor the specs. |
| B2 | **`emoji-picker` demo is orphaned:** route, view, and i18n keys exist, but it's missing from `UI_COMPONENTS`. | `src/constants/ui-gallery.ts` (no entry); `app/v1/[lang]/ui/emoji-picker/page.tsx` exists | Invisible on the gallery index; skipped by both e2e suites. |
| B3 | **Root barrel gaps.** Folder barrels/shims export names the central `index.ts` doesn't: `AccordionItemComplex`, `AccordionUpperSection` (accordion), `BadgeCount` (badge), `DialogBody` (dialog), `useTabsContext` (tabs). Hook exports are inconsistent: `usePopover` is in the barrel, `useDialog`/`useSelect`/`useTooltip` are not. | `src/components/ui/index.ts` vs `dialog/index.ts:9`, `badge/index.ts:3`, `accordion/index.ts:5`, `tabs/index.ts:1` | Consumers importing from the barrel get an incomplete public API; boilerplate users will hit "not exported" surprises. |
| B4 | **Missing root shims** for `page-header` and `page-info` (barrel imports straight from the folders, `index.ts:148-149`). | no `PageHeader.tsx` / `PageInfo.tsx` at ui root | Breaks the "every folder has a PascalCase shim" convention. |

### 4.2 Demo coverage gaps

Seven shipped components have **no demo page and no registry entry**:

| Component | Note |
|---|---|
| `Table` | Not imported by *any* demo view either — the only component with zero showcase presence. High priority: tables are a top-3 lookup in any component library. |
| `Input` (standalone) | Only shown incidentally inside other demos; `input-group`/`input-otp` have pages. Input deserves its own states/validation showcase. |
| `FormLevelError` | Sibling `form-error-banner` has a demo — inconsistent pair. |
| `FieldInfoButton` | Sibling `form-field-info` has a demo — inconsistent pair. |
| `page-header`, `page-info` | No demos; also missing shims (B4). |
| `bottom-sheet` | Internal helper used by popover/select/dropdown-menu mobile branches — a demo is optional, but decide consciously and document the exemption. |

Additionally, 3 demos break the `ExampleTabs` convention with bespoke layouts (`form-error-banner`, `form-field-info`, `step-indicator` — no tabs, no `initialTab`/`searchParams`, different heading scale), and `accordion` is a full architectural outlier: nested routes + its own `layout.tsx` + `TabNav` + a dedicated i18n namespace, while all 58 others use `?tab=` `ExampleTabs`. Pick one pattern; if nested routes are better, migrate the gallery, otherwise fold accordion back into `ExampleTabs`.

### 4.3 Convention drift inside the library

| # | Finding | Evidence |
|---|---|---|
| D1 | **Variant map not `as const` / wrong scope:** `card/card.tsx:19-27` defines its variant map *inside the component body* (recreated per render); `tabs/tabs-trigger.tsx:12-21` is module-level but not `as const`. Button/Badge do it right. | `card.tsx`, `tabs-trigger.tsx` |
| D2 | **Inline prop types** (violates the "never inline" rule): `emoji-picker/emoji-picker-button.tsx:52`; all 5 exported shapes in `skeleton-shapes.tsx` (which also has **no types file**); demo views `views/ui/combobox/*` (4 files), `views/ui/alert/*` (4 files), `views/ui/card/*` (3 files), plus `_shared/ExampleTabsDesktopBar.tsx:9-13` and `ExampleTabsMobileAccordion.tsx`, and `TabNavItem` in `_shared/TabNav.tsx`. | paths as listed |
| D3 | **Misplaced types:** ~11 files in `src/types/ui/` serve demo views, not ui components (`ExampleTabs-types.ts`, `VariantGallery-types.ts`, `PageContent-types.ts`, `UILayout-types.ts`, `Bomb-types.ts`, `CarouselComponent-types.ts`, `PopupAlert-types.ts`, `ServerRetryTab-types.ts`, `RegisterForm-types.ts`, `PaginationPageContent-types.ts`, `ClassName-types.ts`). Per the mirror convention these belong under `src/types/views/ui/` (or similar). | `src/types/ui/` |
| D4 | **Naming/imports:** `page-info/PageInfoButton.tsx` is the only PascalCase implementation file inside a kebab folder; `StepIndicator.tsx` shim imports via the `@/` alias while all 65 other shims use relative paths; ~10 internal cross-imports go through PascalCase shims (`@/components/ui/Spinner`, `@/components/ui/Command`…) instead of folder paths. | as listed |
| D5 | **Mixed ref era:** 23 Radix-wrapper files still use `forwardRef`; newer custom components use React 19 ref-as-prop. Not a bug, but worth a documented decision (or a codemod) before boilerplate users copy both styles. | `accordion/*`, `sheet`, `slider`, `table`, … |
| D6 | **Duplicated helper:** `ScrollChevron` is copy-pasted in `command/command-list.tsx:14` and `select/select-content.tsx:21`. | as listed |
| D7 | **`form-error-banner` demo keeps an unused `_visible` state** and renders a section that is empty by design — looks like a broken demo. | `views/ui/form-error-banner/PageContent.tsx` |

### 4.4 Accessibility

| # | Finding | Recommendation |
|---|---|---|
| A1 | **The demo scaffolding itself is inaccessible**: `ExampleTabs` desktop bar = plain buttons, mobile = accordion; no `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, no arrow-key navigation. Ironic for an a11y-conscious library, and it's the direct cause of B1. | Give `ExampleTabs` real tab semantics (or reuse your own `Tabs` component — dogfooding). Fixes B1 + a11y in one move. |
| A2 | Component-level a11y is otherwise strong: `eslint-plugin-jsx-a11y` recommended ruleset, global `focus-visible` ring, `prefers-reduced-motion`/`prefers-contrast` blocks, correct roles/aria wiring across combobox/select/dialog/tooltip, per-page axe walk (currently undermined by B1). | Keep; consider running the bundled WCAG contrast checker (`.claude/skills/tailwind-theming/scripts/check-contrast.mjs`) in CI after palette changes. |

### 4.5 Showcase UX (what makes a styleguide *useful*)

The index page (`src/views/ui/PageContent.tsx`) is a flat responsive grid of 61 tiles. For a boilerplate you'll browse constantly, the gaps are:

1. **No search / filter** — with 61+ entries, add a `Command`-style quick filter (you already own the component — dogfood it).
2. **No categories** — group tiles: *Forms & Inputs* (input, select, checkbox…), *Overlays* (dialog, sheet, popover…), *Navigation* (tabs, menubar, pagination…), *Feedback* (alert, toast, progress, skeleton…), *Data Display* (table, card, badge, avatar…), *Layout & Misc*. The registry can carry a `category` field; e2e specs keep iterating the flat list.
3. **No code snippets / copy button** — the single biggest boilerplate feature. Demos show rendered output but not the code that produced it. Add a per-tab "View code" (static string per example, like `tabs/CodePreviewTab.tsx` already does for itself) with a copy button. Without this, the gallery proves components work but doesn't help you *reuse* them.
4. **No props/API table** — variants and sizes are visible in `VariantGallery`, but prop names/types/defaults aren't surfaced. Even a hand-written `PropRow[]` per component (or rendering the `*-types.ts` interface) would close the loop.
5. **Demo content is English-only** while metadata is bilingual — fine as a decision, but make it consciously; the accordion namespace proves translated content is possible.
6. **Theme/component-style switcher** is only the header `ThemeToggle`; consider a prominent preset strip on the index ("view everything in glass/neon") since the style-preset pipeline is your differentiator.
7. **Index tiles are name-only** — a one-line description or component thumbnail/status badge (e.g. "new", "radix", "custom") would help scanning.

### 4.6 Documentation drift

- **`components.md` lists components that don't exist**: "Chart (Recharts)", "Sonner", "Data Table (TanStack Table)", "Direction", "Item", "Marker", "Message/Bubble/Attachment" — none are deps or components (`package.json` has no recharts/sonner/cmdk/lucide; Command and Toast are custom; icons are `@tabler/icons-react`). It reads like a copied shadcn wishlist. Either build them or trim the list to reality — misleading docs are worse than none for a boilerplate.
- **`CSS-IMPROVEMENTS.md`** is misnamed but excellent: it's 658 lines of *current-state* token/theme/variant documentation. Rename to something like `CSS-THEME-SYSTEM.md` so people actually find it.
- **No per-component docs** beyond the live gallery (see 4.5.3/4.5.4 — snippets + props tables would double as docs).

### 4.7 Boilerplate-readiness gaps (for reuse across projects)

1. **Missing high-value components** relative to what real projects need: `Data Table` (sortable/filterable, you have TanStack Query but not Table demos), `Chart` wrapper, `Sonner`-style toaster positioning (your Toast is custom — fine, but showcase stacking/positions), standalone `Input`/`Textarea` form integration examples, `Form` composition recipe (you have the pieces: `field-messages`, `FormErrorBanner`, `FormFieldInfo`, validators — but no single "build a form" showcase tying them together; `docs/recipes/new-form-domain.md` is a start).
2. **Registry ↔ reality isn't enforced.** B2/B4/§4.2 all stem from "add component" being a multi-file manual ritual. A tiny script (or a vitest meta-test, like your `use-client-directive.test.ts`) asserting *every ui folder has: shim, barrel export, types file, registry entry, demo route* would make drift impossible.
3. **No token-generation pipeline** — tokens are hand-maintained in `globals.css`. Fine today, but if the Flutter twin must stay in sync, a JSON source-of-truth → CSS/Dart generator pays for itself quickly.
4. **`cn()` non-merging is a sharp edge for consumers** — it's documented in the skill, but a boilerplate user's first instinct is `className` overrides that silently lose. Consider a short "Theming & overriding" note in `README.md`/`components.md`, since the prop-knob API (fontSize/fontWeight/fontFamily) is the intended escape hatch.
5. **No package/export story** — fine if the boilerplate is always copied wholesale, but if you ever extract the library, the barrel gaps (B3) and internal shim cross-imports (D4) become public-API problems.

---

## 5. Prioritized Action Plan

### P0 — fix what's broken or invisible
- [ ] Add `role="tablist"`/`tab`/`tabpanel` + `aria-selected`/`aria-controls` + arrow-key nav to `ExampleTabs` (or rebuild it on your own `Tabs`) — fixes B1 + A1; re-run `ui-smoke`/`ui-a11y` against an authenticated session to confirm they're not silently skipping.
- [ ] Add `emoji-picker` to `UI_COMPONENTS` (`src/constants/ui-gallery.ts`).
- [ ] Complete the barrel: `AccordionItemComplex`, `AccordionUpperSection`, `BadgeCount`, `DialogBody`, `useTabsContext`; decide the hook-export policy (`usePopover` precedent) and apply it uniformly.
- [ ] Add `PageHeader.tsx` / `PageInfo.tsx` shims; rename `page-info/PageInfoButton.tsx` → kebab-case; make `StepIndicator.tsx` shim relative.
- [ ] Add a **conformance meta-test**: every ui folder ⇒ shim + barrel export + types file + registry entry + demo route (would have caught B2/B3/B4/§4.2 automatically).

### P1 — coverage & consistency
- [ ] Demo pages for `Table`, standalone `Input`, `FormLevelError`, `FieldInfoButton`, `page-header`, `page-info`; decide `bottom-sheet`'s status explicitly.
- [ ] Move `card.tsx` variant map to module-level `as const`; add `as const` to `tabs-trigger.tsx`.
- [ ] Extract inline prop types in demo views + `emoji-picker-button` + `skeleton-shapes` (new `src/types/ui/SkeletonShapes-types.ts`); move the ~11 view-serving type files out of `src/types/ui/`.
- [ ] Fold the 3 bespoke demos + accordion back into one `ExampleTabs` pattern (or migrate everyone to nested routes — pick one).
- [ ] Fix `form-error-banner`'s empty-looking section.

### P2 — showcase value & docs
- [ ] Gallery index: search (dogfood `Command`) + categories + one-line descriptions.
- [ ] Per-example "View code" + copy button; props/API table per component.
- [ ] Prominent theme-preset switcher on the gallery.
- [ ] Rewrite `components.md` to match reality (or build Chart/Data-Table); rename `CSS-IMPROVEMENTS.md` → `CSS-THEME-SYSTEM.md`.
- [ ] Document the ref convention (forwardRef vs ref-as-prop) and the non-merging `cn()` override story in the README for boilerplate consumers.
- [ ] Optional: contrast-checker in CI; token JSON source-of-truth if Flutter sync matters.

---

## 6. Appendix — Verified References

- Registry: `next-js-boilerplate/src/constants/ui-gallery.ts` (61 entries, no `emoji-picker`, no `table`)
- Smoke spec anchor: `next-js-boilerplate/e2e/ui-smoke.spec.ts:35-48`; a11y spec: `e2e/ui-a11y.spec.ts:28`
- Scaffolding without tab roles: `next-js-boilerplate/src/views/ui/_shared/ExampleTabs.tsx`, `ExampleTabsDesktopBar.tsx`, `ExampleTabsMobileAccordion.tsx`
- Barrel: `next-js-boilerplate/src/components/ui/index.ts:148-149` (page-header/page-info direct folder imports)
- Folder barrels proving the gaps: `dialog/index.ts:9`, `badge/index.ts:3`, `accordion/index.ts:5`, `tabs/index.ts:1`
- Variant-map drift: `card/card.tsx:19-27`, `tabs/tabs-trigger.tsx:12-21` vs `button-styles.ts` (`as const`)
- Themes: `next-js-boilerplate/src/app/globals.css` (1431 lines, `@custom-variant dark`, `.style-*` blocks, `--comp-*` tokens)
- i18n: `messages/en/ui/messages.json` / `messages/tr/ui/messages.json` (136 keys each, full parity)
- Docs: `next-js-boilerplate/components.md` (lists nonexistent Chart/Sonner/Data Table), `next-js-boilerplate/CSS-IMPROVEMENTS.md` (current-state theme docs)
