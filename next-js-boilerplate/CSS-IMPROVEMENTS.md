# CSS & UI Improvements

This document describes the enhanced CSS and UI system implemented in the Next.js Boilerplate.

## Table of Contents

- [Color System](#color-system)
- [Theme System](#theme-system)
- [Typography System](#typography-system)
- [Component Variants](#component-variants)
- [Animations](#animations)
- [Utilities](#utilities)
- [Accessibility](#accessibility)

---

## Color System

### Semantic Colors

The color system now includes semantic color tokens for consistent theming:

```css
--success: #16a34a; /* Green */
--success-fg: #ffffff;
--warning: #d97706; /* Amber */
--warning-fg: #ffffff;
--error: #dc2626; /* Red */
--error-fg: #ffffff;
--info: #0ea5e9; /* Blue */
--info-fg: #ffffff;
```

### Brand Colors

```css
--brand: #4f46e5; /* Indigo */
--brand-fg: #ffffff;
```

### Surface Colors

```css
--surface: #fafafa; /* Light gray */
--surface-hover: #f4f4f5;
```

### Muted Colors

```css
--muted: #71717a; /* Gray */
--muted-fg: #52525b;
```

---

## Theme System

### Available Themes

1. **Light** (default) - Bright, clean interface
2. **Dark** - Dark background with light text
3. **Ocean** - Light blue theme with ocean-inspired colors
4. **Violet** - Deep purple dark theme

### Adding a New Theme

Add a new `.theme-*` block in `globals.css`:

```css
.theme-mytheme {
  --bg: #ffffff;
  --fg: #171717;
  --brand: #4f46e5;
  --brand-fg: #ffffff;
  --muted: #71717a;
  --muted-fg: #52525b;
  --border: #e4e4e7;
  --surface: #fafafa;
  --surface-hover: #f4f4f5;
  --success: #16a34a;
  --success-fg: #ffffff;
  --warning: #d97706;
  --warning-fg: #ffffff;
  --error: #dc2626;
  --error-fg: #ffffff;
  --info: #0ea5e9;
  --info-fg: #ffffff;
}
```

Then apply the class to `<html>`:

```tsx
<html className="theme-mytheme">
```

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
fade-in-up
fade-in-down
fade-in-left
fade-in-right
fade-out-left
fade-out-right
scale-in
scale-out
slide-in-right
slide-in-left
slide-out-right
slide-out-left
pulse
shimmer
stagger
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
