---
name: radix-primitives
description: Building accessible interactive components on @radix-ui/react-* primitives in this repo's frontend (next-js-boilerplate). Use when adding or modifying any overlay, disclosure, or interactive widget — popovers, menus, dialogs, tooltips, accordions, sliders, toggles, hover cards, context menus, sheets — or when the user mentions Radix, headless UI, focus management, or accessibility of interactive components. Covers the wrapping pattern (re-export Root/Trigger, forwardRef Content in a Portal), which components here are Radix-backed vs deliberately hand-rolled, data-state styling, asChild, and when to prefer native elements.
---

# Radix Primitives in This Codebase

Radix supplies behavior and accessibility (focus trapping, roving tabindex, typeahead, positioning, ARIA wiring); this codebase supplies **all** styling via semantic tokens. The library deliberately mixes Radix-backed and hand-rolled components — knowing which is which matters before you touch one or add one.

Paths relative to `next-js-boilerplate/`.

## What's Radix-backed vs hand-rolled

**Radix-backed** (packages already installed — check `package.json` before adding new ones):
accordion, alert-dialog, aspect-ratio, collapsible, context-menu, hover-card, menubar, navigation-menu, progress, radio-group, scroll-area, sheet, slider, toggle, toggle-group.

**Deliberately hand-rolled** (do not convert to Radix without being asked):
- `dialog/` — native `<dialog>` element: free focus trap, Esc handling, `::backdrop`, top-layer
- `select/`, `native-select/`, `time-input/` — native `<select>`: correct mobile UX for free
- popover, dropdown-menu, tooltip, tabs, switch, checkbox, combobox, command, drawer — custom implementations

The decision rule the library follows: **if the platform gives the behavior for free (dialog, select, details), use the native element; reach for Radix when the a11y is genuinely hard** (roving focus in menus/toolbars, collision-aware positioning, typeahead, nested menus). A new component should follow the same rule.

## The wrapping pattern

`src/components/ui/hover-card/hover-card.tsx` is the canonical shape — read it before wrapping any primitive:

```tsx
"use client";
import { forwardRef } from "react";
import { Root, Trigger, Portal, Content } from "@radix-ui/react-hover-card";
import { cn } from "@/lib/cn";

const defaultStyles = "bg-bg border-border text-fg";   // semantic tokens only

export const HoverCard = Root;          // structural parts: re-export untouched
export const HoverCardTrigger = Trigger;

export const HoverCardContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content> & { sideOffset?: number }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Portal>
    <Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn("z-50 w-64 rounded-md border p-4 shadow-md", defaultStyles, className)}
      {...props}
    >
      <div className="pointer-events-auto">{props.children}</div>
    </Content>
  </Portal>
));
HoverCardContent.displayName = "HoverCardContent";
```

The pieces and why they matter:

- **Re-export structural parts as-is** (`Root`, `Trigger`) — they render no DOM of their own or need no styling; wrapping them adds indirection for nothing.
- **Style only the parts that paint** (Content, Item, Separator…), each as `forwardRef` with `React.ElementRef<typeof X>` / `ComponentPropsWithoutRef<typeof X>` so refs and every primitive prop pass through. Set `displayName` — these show up in React DevTools and error stacks.
- **Portal floating content** and wrap children in `<div className="pointer-events-auto">` — a library-wide requirement so portaled content stays interactive.
- **`z-50`** on floating content, `sideOffset` defaulting to `4`.
- **`className` comes after `defaultStyles`** in `cn()`, but remember `cn` does not merge conflicting utilities (see the **ui-components** skill) — expose props for anything consumers will realistically want to change.

## Styling Radix state

Primitives expose state as data attributes — style them with Tailwind arbitrary variants instead of tracking state in React:

```
data-[state=open]:rotate-180
data-[state=checked]:bg-brand
data-[disabled]:opacity-40
data-[side=top]:slide-in-from-bottom-2
```

Animate open/close from `data-[state=open]` / `data-[state=closed]` with CSS transitions or keyframes; never `useState` + timers for something Radix already exposes declaratively.

## Composition with asChild

Every Radix part that renders an element accepts `asChild` to merge onto your own component instead of rendering its default tag — the way to attach a trigger to the library's `Button` without nested buttons:

```tsx
<HoverCardTrigger asChild>
  <Button variant="ghost">Details</Button>
</HoverCardTrigger>
```

The child must spread incoming props and forward its ref (the library's components do).

## Adding a new primitive

1. Check `package.json` — 15 Radix packages are already installed; the primitive you need may be there.
2. If not: `pnpm add @radix-ui/react-<name>` inside `next-js-boilerplate/` (caret range, matching the others).
3. Wrap it following the hover-card pattern; controlled props (`open`, `onOpenChange`) stay pass-through so consumers can control or not.
4. Register it everywhere the **ui-components** skill's checklist says (folder, shim, barrel, types, demo page, test).
