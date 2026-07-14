---
name: ui-components
description: Conventions for building custom React components in this repo's frontend (next-js-boilerplate/src/components/ui). Use whenever creating, editing, restyling, or reviewing ANY frontend component here — buttons, cards, inputs, panels, overlays, any TSX under next-js-boilerplate — even if the user doesn't say "component" (e.g. "add a badge", "build a settings panel", "style this form"). Covers folder anatomy, cn(), variant maps, types placement, useComponentVariant, semantic color tokens, focus/disabled states, barrel exports, demo pages, and tests.
---

# Building UI Components

This frontend ships its own component library — **no shadcn, no cva, no clsx/tailwind-merge**. Roughly 50 components in `next-js-boilerplate/src/components/ui/` follow one uniform anatomy. New components must match it exactly; consistency is what makes the library maintainable, and a component that deviates (inline types, hardcoded colors, ad-hoc file layout) reads as foreign code here.

All paths below are relative to `next-js-boilerplate/`.

## Read the exemplars first

Before writing a new component, open the closest existing relative:

- `src/components/ui/button/` + `src/components/ui/button-styles.ts` — variant/size maps, font-override props, interactive base classes, `loading` prop pattern
- `src/components/ui/hover-card/hover-card.tsx` — wrapping a Radix primitive (details in the **radix-primitives** skill)
- `src/components/ui/dialog/` — hand-rolled overlay on native `<dialog>`, portal + animation pattern, `size` prop
- `src/components/ui/index.ts` — the central barrel

## Anatomy — where files go

For a new component `foo-bar`:

```
src/components/ui/foo-bar/
  foo-bar.tsx                   # implementation
  foo-bar-part.tsx              # split subparts into sibling files (dialog/ has 8)
  index.ts                      # export { FooBar } from "./foo-bar";
src/components/ui/FooBar.tsx    # one-line PascalCase shim re-exporting from ./foo-bar
src/components/ui/index.ts      # add exports to the central barrel
src/types/ui/FooBar-types.ts    # props types — never inline in the component file
src/views/ui/foo-bar/PageContent.tsx   # demo page — every ui component has one
```

Variant maps shared by several parts live at the ui root as `<name>-styles.ts` (see `button-styles.ts`, `input-styles.ts`); single-file components may keep a local `Record<Variant, string>`.

Props types extend the underlying element so all native props pass through:

```ts
// src/types/ui/Button-types.ts
import type { Variant, Size } from "@/components/ui/button-styles";

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}
```

## Styling rules

**1. `cn()` does not merge.** `cn` from `@/lib/cn` is a plain `filter(Boolean).join(" ")` — intentionally dependency-free, it does *not* deduplicate conflicting Tailwind classes. Consequence: a consumer's `className` cannot reliably override your base utilities (CSS stylesheet order decides conflicts, not class-attribute order). So design the API instead of relying on overrides — expose knobs as props. That is exactly why Button, DatePicker, and TimeInput take `variant`, `size`, `fontSize`, `fontWeight`, `fontFamily` rather than expecting `className="text-lg"` to win.

**2. Semantic tokens only.** Style with theme tokens — `bg-bg`, `text-fg`, `bg-brand`, `text-brand-fg`, `bg-surface`, `hover:bg-surface-hover`, `border-border`, `text-muted`, `bg-success|warning|error|info` (+ their `-fg` pairs), `bg-overlay/50` for overlay scrims. Never hardcode palette colors (`bg-zinc-100`, `text-white`, `#hex`, `bg-red-500`, `text-green-700`): there are four themes today (light, dark, ocean, violet) and components must survive all of them plus any future `.theme-*` block. Full token vocabulary and how themes work: **tailwind-theming** skill.

**Status tinting recipes (V0):**
- Soft: `bg-<status>/10 border-<status>/30 text-<status>` (e.g. `bg-error/10 border-error/30 text-error`)
- Solid: `bg-<status> text-<status>-fg` (e.g. `bg-error text-error-fg`)

**V0 Design Language (enforced across all components):**
- **Radius:** controls → `rounded-md`; floating panels → `rounded-lg`; modals → `rounded-xl`; pills → `rounded-full`
- **Elevation:** controls → `shadow-xs`; inline bars → `shadow-xs`; small floats → `shadow-md`; menus/popovers → `shadow-lg`; modals/toasts → `shadow-xl`
- **Control heights:** `sm h-8` / `md h-9` / `lg h-10`; touch targets ≥ 36px
- **Focus:** `focus-visible:ring-2 focus-visible:ring-brand` + `ring-offset-1 ring-offset-bg` on solid controls; inputs add `focus-visible:border-brand`; `ring-ring` is forbidden
- **Disabled:** `disabled:opacity-50 disabled:pointer-events-none`, period
- **Palette:** semantic tokens ONLY; hardcoded palette colors are forbidden in component files

**3. Standard interactive states** (copy from Button):

```
focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none
disabled:pointer-events-none disabled:opacity-50
transition-all   (or transition-colors for color-only changes)
```

**4. Variants are plain `as const` maps**, not cva:

```ts
export const variants = {
  default: "bg-surface text-fg hover:bg-surface-hover border border-border",
  primary: "bg-brand text-brand-fg hover:opacity-90",
  destructive: "bg-error text-error-fg hover:opacity-90 border border-error",
} as const;
export type Variant = keyof typeof variants;
```

**5. Resolve variants through `useComponentVariant` + `resolveVariant`.** Users can set a site-wide component style (persisted in a cookie, applied as a `style-*` class by ThemeProvider; the list lives in `@/constants/theme`). An explicit `variant` prop wins over the global style:

```ts
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { resolveVariant } from "@/lib/resolve-variant";
import { variants } from "./foo-bar-styles";

const effectiveVariant = useComponentVariant(variant);
// apply: resolveVariant(variants, effectiveVariant)
```

`resolveVariant` (`src/lib/resolve-variant.ts`) safely looks up a variant key, falling back to `variants.default` if the key is missing. Always use it instead of `variants[effectiveVariant]` directly.

Always define at least a `default` entry; add entries for other global styles only where the component should actually differ.

**6. Global style recipes.** For shared visual styles (shiny, glass, neon, gradient), import from `src/components/ui/global-style-variants.ts` and spread `globalStyleVariants[effectiveVariant]` into the element's className. The recipes define `shiny`, `glass`, `neon`, and `gradient` entries — components supply their own `default` in the variant map.

```ts
import { globalStyleVariants } from "@/components/ui/global-style-variants";
// in className: ...resolveVariant(variants, effectiveVariant), globalStyleVariants[effectiveVariant]
```

**7. Font classes utility.** Use `fontClasses` from `src/lib/font-classes.ts` to deduplicate the font-trio pattern (`font-sans font-medium text-sm`):

```ts
import { fontClasses } from "@/lib/font-classes";
// in className: ...fontClasses  (instead of manually writing "font-sans font-medium text-sm")
```

**8. Icons** come from `@tabler/icons-react`; tiny one-off glyphs (chevrons, close ×) are inlined as `stroke="currentColor"` SVGs so they inherit the text color — both patterns already exist, pick whichever the sibling components use.

## Client vs server

Components are server-rendered by default. Add `"use client"` only when the component uses state, effects, context, or event handlers. The React Compiler (`babel-plugin-react-compiler`) is enabled: write plain code first and reach for `useMemo`/`useCallback` when identity stability matters (dependency arrays, memoized children), not as reflexive micro-optimization.

## Overlays and portals

Portal to `document.body` with `createPortal`, and wrap portaled content in `<div className="pointer-events-auto">` — a library-wide pattern; portaled content must re-enable pointer events. For enter/leave animation in hand-rolled overlays, use a scoped `<style>` block with keyframes plus an open/closing class pair, exactly as `dialog/dialog-content.tsx` does (150 ms close timer before unmount).

**Overlay scrim token:** Always use `bg-overlay/50` for overlay backdrops (dialog, drawer, sheet, popover, select, dropdown-menu, alert-dialog, tooltip). The `--overlay` token is defined in all four theme blocks in `globals.css`.

## Shared a11y partials

For form inputs that need error/description wiring, use the shared `FieldMessages` component and `useFieldMessageIds` hook from `src/components/ui/field-messages.tsx`:

```tsx
import { FieldMessages, useFieldMessageIds } from "@/components/ui/field-messages";
const ids = useFieldMessageIds();
// on input: aria-describedby={ids.description ?? undefined}
// after input: <FieldMessages description={description} error={error} />
```

## Loading state pattern

For buttons and icon buttons, use the `loading` prop pattern:

```tsx
disabled={disabled || loading}
aria-busy={loading || undefined}
// render spinner SVG when loading, otherwise render children
```

## Checklist for a new component

1. Pick the closest existing component and read it end to end.
2. Create `src/components/ui/<kebab>/` with implementation + `index.ts`.
3. Add props types in `src/types/ui/<Pascal>-types.ts`.
4. Add the PascalCase shim `src/components/ui/<Pascal>.tsx`.
5. Export from the central barrel `src/components/ui/index.ts`.
6. Add a demo page `src/views/ui/<kebab>/PageContent.tsx` showing every variant/size.
7. Colocate a `*.test.tsx` (vitest + @testing-library/react) if the component carries logic.
8. Verify: `pnpm lint && pnpm typecheck && pnpm test` in `next-js-boilerplate/`; eyeball it with `pnpm dev` (port 3001) across at least the light and dark themes.
