# CSS & UI Improvements

This document describes the CSS and UI system in the Next.js Boilerplate — Tailwind v4, multi-theme tokens, component class utilities, and design conventions.

## Table of Contents

- [Token Pipeline](#token-pipeline)
- [Theme System](#theme-system)
- [Component-Level Tokens](#component-level-tokens)
- [V0 Design Language](#v0-design-language)
- [Typography System](#typography-system)
- [Component Variants](#component-variants)
- [Animations](#animations)
- [Utilities](#utilities)
- [Accessibility](#accessibility)

---

## Token Pipeline

Three layers, all in `src/app/globals.css`:

```css
/* 1. Each theme defines raw palette vars via .style-* class */
.style-light { --bg: #ffffff; --fg: #171717; --brand: #4f46e5; ... }

/* 2. @theme inline maps raw vars to Tailwind color tokens */
@theme inline { --color-bg: var(--bg); --color-brand: var(--brand); ... }

/* 3. Components consume semantic utilities */
/* bg-bg  text-fg  bg-brand  text-brand-fg  border-border ... */
```

The active `style-<name>` class is set on `<html>` by `useTheme` (via `ThemeProvider`) and pre-paint by `theme-init.js`. All themes except `light` also add `.dark` for the `dark:` variant.

---

## Theme System

Six themes in a single dropdown (`ThemeToggle`), persisted as a `theme` cookie. Internally `themeToComponentStyle()` maps light/dark → `"default"` for `useComponentVariant()`; shiny/glass/neon/gradient keep their name.

### Available Themes

| Theme | CSS class | Description |
|---|---|---|
| `light` | `.style-light` | Light bg, dark text (default browser palette) |
| `dark` | `.style-dark` | Pure black bg, light text |
| `shiny` | `.style-shiny` | Dark navy, gradient surfaces + buttons |
| `glass` | `.style-glass` | Translucent surfaces with backdrop blur |
| `neon` | `.style-neon` | Dark with cyan accents and glow |
| `gradient` | `.style-gradient` | Dark purple with gradient surfaces + text |

### Semantic Token Reference (all themes)

| Token | Light (#ffffff) | Dark (#000000) |
|---|---|---|
| `--bg` | `#ffffff` | `#000000` |
| `--fg` | `#171717` | `#e5e5e5` |
| `--brand` | `#4f46e5` | `#818cf8` |
| `--brand-fg` | `#ffffff` | `#0b0b1a` |
| `--surface` | `#f5f5f5` | `#171717` |
| `--surface-hover` | `#e5e5e5` | `#262626` |
| `--border` | `#d4d4d4` | `#262626` |
| `--muted` | `#737373` | `#a3a3a3` |
| `--muted-fg` | `#52525b` | `#a3a3a3` |
| `--success` | `#15803d` | `#22c55e` |
| `--success-fg` | `#ffffff` | `#052e16` |
| `--warning` | `#b45309` | `#f59e0b` |
| `--warning-fg` | `#ffffff` | `#451a03` |
| `--error` | `#dc2626` | `#ef4444` |
| `--error-fg` | `#ffffff` | `#2a0808` |
| `--info` | `#0369a1` | `#38bdf8` |
| `--info-fg` | `#ffffff` | `#082f49` |
| `--overlay` | `#000000` | `#000000` |

Shiny/glass/neon/gradient override all tokens above — their exact values are in `globals.css`.

### Adding a New Theme

1. Add a `.style-newname` block in `globals.css` defining all tokens (copy an existing block as template).
2. Register it in `THEMES` in `src/constants/theme.ts`:
   ```ts
   { name: "newname", label: "New Name" }
   ```
3. If the background is dark, the `dark` class will be applied automatically (themes other than `light` get it).
4. No component changes needed — components consume semantic tokens only.

### Flash Prevention

`public/scripts/theme-init.js` reads the `theme` cookie and applies the `style-<name>` + `dark` classes to `<html>` before the first paint.

### Explicit Variant Override

Components accept an explicit `variant` prop that overrides the global component style:

```tsx
<Button variant="primary">Always primary, regardless of component style</Button>
```

---

## Component-Level Tokens

Shiny, glass, neon, and gradient themes define `--comp-*` tokens for component-specific overrides:

| Token | Purpose |
|---|---|
| `--comp-card-bg` | Card background (solid or gradient) |
| `--comp-card-border` | Card border color |
| `--comp-card-shadow` | Card box-shadow |
| `--comp-btn-bg` | Button primary background (solid or gradient) |
| `--comp-btn-text` | Button primary text |
| `--comp-btn-border` | Button primary border |
| `--comp-btn-shadow` | Button primary shadow |
| `--comp-input-bg` | Input background |
| `--comp-input-border` | Input border color |
| `--comp-badge-bg` | Badge background (solid or gradient) |
| `--comp-badge-text` | Badge text color |
| `--comp-alert-bg` | Alert background |
| `--comp-alert-border` | Alert border color |

These are consumed by component CSS classes (`.card`, `.btn-primary`, `.badge`, etc.) or inline in component code. `light` and `dark` themes don't define `--comp-*` tokens — components fall back to their base styles.

---

## V0 Design Language

Embedded in `globals.css` as a reference block. Enforced across all components:

**Radius:** controls → `rounded-md`; floating panels → `rounded-lg`; modals → `rounded-xl`; pills → `rounded-full`

**Elevation:** controls → `shadow-xs`; inline bars → `shadow-xs`; small floats → `shadow-md`; menus/popovers → `shadow-lg`; modals/toasts → `shadow-xl`

**Control heights:** `sm h-8` / `md h-9` / `lg h-10`; touch targets ≥ 36px

**Focus:** `focus-visible:ring-2 focus-visible:ring-brand` + `ring-offset-1 ring-offset-bg` on solid controls; inputs add `focus-visible:border-brand`

**Disabled:** `disabled:opacity-50 disabled:pointer-events-none`

**Status tinting (soft):** `bg-<status>/10  border-<status>/30  text-<status>`; solid: `bg-<status> text-<status>-fg`

**Motion:** menus/popovers/tooltips → `animate-scale-in` (~120ms) + useExitAnimation; modals → fade + rise; `motion-reduce:animate-none`

**Palette:** semantic tokens ONLY — `bg-error`, `text-success`, `border-warning`, etc. Hardcoded palette colors are forbidden in component files.

---

## Typography System

### Type Scale

```css
text-xxs: 0.625rem  (10px)
text-xs:  0.75rem   (12px)
text-sm:  0.875rem  (14px)
text-base: 1rem     (16px)
text-lg:  1.125rem  (18px)
text-xl:  1.25rem   (20px)
text-2xl: 1.5rem    (24px)
text-3xl: 1.875rem  (30px)
text-4xl: 2.25rem   (36px)
text-5xl: 3rem      (48px)
text-6xl: 3.75rem   (60px)
text-7xl: 4.5rem    (72px)
```

### Typography Components

```tsx
import { Typography } from "@/components/ui/Typography";

<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="h3">Heading 3</Typography>
<Typography variant="h4">Heading 4</Typography>
<Typography variant="h5">Heading 5</Typography>
<Typography variant="h6">Heading 6</Typography>
<Typography variant="body">Body text</Typography>
<Typography variant="bodyLarge">Large body</Typography>
<Typography variant="bodySmall">Small body</Typography>
<Typography variant="caption">Caption</Typography>
<Typography variant="overline">Overline</Typography>
```

### Pre-styled Typography Components

```tsx
import { H1, H2, H3, H4, Lead, Large, Small, Muted, Code, Quote } from "@/components/ui/Typography";

<H1>Heading 1</H1>
<H2>Heading 2</H2>
<H3>Heading 3</H3>
<H4>Heading 4</H4>
<Lead>Lead paragraph</Lead>
<Large>Large text</Large>
<Small>Small text</Small>
<Muted>Muted text</Muted>
<Code>npm install</Code>
<Quote>Blockquote</Quote>
```

---

## Component Variants

### Button Variants

```tsx
import { Button } from "@/components/ui/Button";

<Button variant="default">Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="soft">Soft</Button>
<Button variant="shadow">Shadow</Button>
```

### Button Sizes

```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
<Button size="icon-sm">Icon Small</Button>
<Button size="icon-xs">Icon Extra Small</Button>
```

### Card Variants

```tsx
import { Card } from "@/components/ui/Card";

<Card variant="default">Default Card</Card>
<Card variant="elevated">Elevated Card</Card>
<Card variant="interactive">Interactive Card</Card>
<Card variant="outline">Outline Card</Card>
<Card variant="surface">Surface Card</Card>
```

### Badge Variants

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="soft">Soft</Badge>
<Badge variant="dot">Dot</Badge>
<Badge variant="pill">Pill</Badge>
```

### Avatar Variants

```tsx
import { Avatar } from "@/components/ui/Avatar";

<Avatar variant="default" fallback="JD" />
<Avatar variant="brand" fallback="JD" />
<Avatar variant="success" fallback="JD" />
<Avatar variant="warning" fallback="JD" />
<Avatar variant="error" fallback="JD" />
<Avatar variant="info" fallback="JD" />
```

### Avatar Sizes

```tsx
<Avatar size="xs" fallback="JD" />
<Avatar size="sm" fallback="JD" />
<Avatar size="md" fallback="JD" />
<Avatar size="lg" fallback="JD" />
<Avatar size="xl" fallback="JD" />
```

### Avatar Status

```tsx
<Avatar variant="default" fallback="JD" status="online" />
<Avatar variant="default" fallback="JD" status="away" />
```

---

## Animations

### Available Animations

```css
fade-in
fade-out
fade-in-up
fade-in-down
fade-in-left
fade-in-right
fade-out-left
fade-out-right
scale-in
scale-out
scale-in-breathe
slide-in-right
slide-in-left
slide-out-right
slide-out-left
slide-in-up
spin
pulse
shimmer
stagger
accordion-down
accordion-up
dialog-fade-in
dialog-fade-out
backdrop-fade-in
backdrop-fade-out
progress-indeterminate
```

### Using Animations

```tsx
<div className="animate-fade-in">Content</div>
<div className="animate-fade-in-up">Content</div>
<div className="animate-stagger-0">Item 1</div>
<div className="animate-stagger-100">Item 2</div>
<div className="animate-stagger-200">Item 3</div>
```

### Stagger Animation

Use for lists to animate items sequentially:

```tsx
{
  items.map((item, i) => (
    <div key={item.id} className={`animate-stagger-${i * 50}`}>
      {item.content}
    </div>
  ));
}
```

---

## Utilities

### Container Classes

```tsx
import { getContainerClass } from "@/lib/container";

<div className={getContainerClass("xl")}>Content</div>
<div className={getContainerClass("2xl")}>Content</div>
```

### Surface Classes

```html
<div class="surface">Default surface (border + rounded-xl + shadow-sm)</div>
<div class="surface-elevated">Elevated surface (larger shadow)</div>
<div class="surface-interactive">Interactive surface (hover lift)</div>
<div class="surface-outline">Outline surface (2px border, no bg)</div>
```

### Card Classes

```html
<div class="card">Default card (rounded-xl, hover lift)</div>
<div class="card-elevated">Elevated card (shadow-elevated, no hover)</div>
<div class="card-interactive">Interactive card (pointer cursor, hover lift + translateY)</div>
```

### Scroll-Fade Affordance

No visible scrollbars (hidden via CSS). Use fade-mask gradients on overflow containers:

```html
<div class="scroll-fade-y">Content fades at top and bottom</div>
<div class="scroll-fade-x">Content fades at left and right</div>
```

Complementary classes (`scrolled-to-top`, `scrolled-to-bottom`, `scrolled-to-left`, `scrolled-to-right`) let JS toggle the fade at scrolled edges.

### Border Styles

```tsx
<div className="border-dashed">Dashed border</div>
<div className="border-dotted">Dotted border</div>
<div className="border-double">Double border</div>
<div className="border-groove">Groove border</div>
<div className="border-ridge">Ridge border</div>
<div className="border-inset">Inset border</div>
<div className="border-outset">Outset border</div>
```

### Shadow Utilities

```tsx
<div className="shadow-success">Success shadow</div>
<div className="shadow-warning">Warning shadow</div>
<div className="shadow-error">Error shadow</div>
<div className="shadow-info">Info shadow</div>
```

### Border Colors

```tsx
<div className="border-brand">Brand border</div>
<div className="border-success">Success border</div>
<div className="border-warning">Warning border</div>
<div className="border-error">Error border</div>
<div className="border-info">Info border</div>
```

### Text Colors

```tsx
<div className="text-brand">Brand text</div>
<div className="text-success">Success text</div>
<div className="text-warning">Warning text</div>
<div className="text-error">Error text</div>
<div className="text-info">Info text</div>
```

### Background Colors

```tsx
<div className="bg-brand">Brand background</div>
<div className="bg-success">Success background</div>
<div className="bg-warning">Warning background</div>
<div className="bg-error">Error background</div>
<div className="bg-info">Info background</div>
```

### Gradient Utilities

```tsx
<div className="bg-gradient-brand">Brand gradient</div>
<div className="bg-gradient-success">Success gradient</div>
<div className="bg-gradient-warning">Warning gradient</div>
<div className="bg-gradient-error">Error gradient</div>
<div className="bg-gradient-info">Info gradient</div>
```

---

## Accessibility

### Focus Visible Styles

All interactive elements have focus-visible styles:

```css
*:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
```

### Reduced Motion Support

Respects user's reduced motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode

Supports high contrast mode with enhanced focus indicators:

```css
@media (prefers-contrast: more) {
  *:focus-visible {
    outline-width: 3px;
  }
}
```

### Touch-Friendly Targets

All interactive elements are at least 44px:

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

### Input Modality Utilities

```html
<div class="touch-only">Visible only on touch devices</div>
<div class="mouse-only">Visible only on mouse devices</div>
```

Set by `DeviceTypeInit` component adding `.touch-device` or `.mouse-device` to `<html>`.
Custom variants `touch:` and `mouse:` are also available for conditional styling.

---

## Migration Guide

### Before

```tsx
<Card className="border-border bg-bg rounded-xl border shadow-sm">
  <div className="p-4">
    <h3 className="text-xl font-semibold">Title</h3>
    <p className="text-muted text-sm">Description</p>
  </div>
</Card>
```

### After

```tsx
<Card variant="default">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Before

```tsx
<Button className="bg-brand rounded-lg px-4 py-2 text-white">Click me</Button>
```

### After

```tsx
<Button variant="primary">Click me</Button>
```

### Before

```tsx
<span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
  Success
</span>
```

### After

```tsx
<Badge variant="success">Success</Badge>
```

---

## Best Practices

1. **Use semantic colors**: Always use `bg-success` instead of `bg-green-500`
2. **Use component variants**: Prefer `variant="primary"` over custom classes
3. **Use typography components**: Use `<Typography variant="h1">` instead of `<h1 className="text-4xl font-bold">`
4. **Use animations**: Add subtle animations to improve UX
5. **Respect reduced motion**: Don't disable reduced motion support
6. **Use container classes**: Use `getContainerClass()` for consistent spacing

---

## API Reference

### Typography Props

```ts
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "bodyLarge"
    | "bodySmall"
    | "caption"
    | "overline";
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}
```

### Button Props

```ts
interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "soft"
    | "shadow";
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-xs";
}
```

### Card Props

```ts
interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "default" | "elevated" | "interactive" | "outline" | "surface";
}
```

### Badge Props

```ts
interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "soft"
    | "dot"
    | "pill";
}
```

### Avatar Props

```ts
interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "brand" | "success" | "warning" | "error" | "info";
  status?: "online" | "away";
}
```
