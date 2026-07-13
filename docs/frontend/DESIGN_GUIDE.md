# Design Guide

> Spacing, color, typography, and component conventions for this boilerplate.
>
> _Last updated: 2026-06-30_

---

## Theming

Two independent theme dimensions via CSS custom properties on `<html>` class (managed by `useTheme`):

### Color Themes

| Token | Light | Dark | Ocean |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0a0a0a` | `#f0f9ff` |
| `--fg` | `#171717` | `#ededed` | `#0c4a6e` |
| `--brand` | `#4f46e5` | `#818cf8` | `#0284c7` |
| `--muted` | `#71717a` | `#a1a1aa` | `#64748b` |
| `--border` | `#e4e4e7` | `#27272a` | `#bae6fd` |
| `--surface` | `#fafafa` | `#18181b` | `#e0f2fe` |

### Component Styles (Visual Themes)

Applied via `style-*` class on `<html>`. These override CSS custom properties to change visual appearance globally:

| Style | Description |
|---|---|
| `default` | Base CSS variables from current color theme |
| `shiny` | Gradient backgrounds, white text, shadows |
| `glass` | Translucent with backdrop blur |
| `neon` | Dark with cyan accents and glow |
| `gradient` | Gradient text with dark backgrounds |

Tailwind utilities: `bg-bg`, `text-fg`, `bg-brand`, `text-muted`, `border-border`, `bg-surface`, `bg-surface-hover`.

Dark mode uses `dark:` variant (`@custom-variant dark (&:where(.dark, .dark *));`).

---

## Spacing Scale

Stick to the Tailwind spacing scale. **Never use arbitrary values** (`p-[13px]`, `text-[#333]`).

| Context | Token |
|---|---|
| Page wrapper (UI demos, sections) | `gap-4` |
| Section wrapper, button groups | `gap-3` |
| Tight sections, chat input area | `gap-2` |
| Tab toggle, card internals | `gap-1.5` |
| Compact groups | `gap-1` |
| Nav links, conversation/friend lists | `gap-0.5` |
| Heading + description pair | `space-y-1` |
| Sidebar body (drawer) | `p-3 md:p-4` |
| Main content area | `p-4 md:p-6` |
| Chat area overflow container | `p-3` |
| Compact panel, input bar | `p-2` |
| Tab toggle container, icon buttons | `p-1` |
| Standard button/list-item cell | `px-3 py-2` |
| List items (conversations, friends) | `px-2.5 py-2` |
| Search inputs, small buttons | `px-3 py-1.5` |
| Small action buttons (Add, Accept) | `px-2.5 py-1` |
| Small pill buttons (Load earlier) | `px-3 py-1` |
| Count badges | `px-1.5 py-0.5` |
| Between sections in a sidebar | `gap-4` |
| Within a section | `gap-3` |
| Between items in a list | `gap-0.5` / `gap-1` |

---

## Typography

| Role | Classes |
|---|---|
| Page title | `text-xl font-bold` |
| Section heading | `text-lg font-semibold` |
| Sub-label / section header | `text-xs font-semibold tracking-wider uppercase` |
| Description / meta text | `text-sm text-zinc-500 dark:text-zinc-400` |
| Body text | `text-sm` |
| Small meta / timestamps | `text-xs` / `text-[10px]` |
| Message bubble text | `text-sm` |
| Placeholder / empty state | `text-xs text-zinc-400` |

### Element hierarchy pattern

```tsx
<section className="flex flex-col gap-3">   {/* section wrapper: gap-3 */}
  <h3 className="text-lg font-semibold">    {/* section heading */}</h3>
  {/* content */}
</section>
```

```tsx
<div className="space-y-1">        {/* heading group */}
  <h2 className="text-xl font-bold">Page Title</h2>
  <p className="text-sm text-zinc-500 dark:text-zinc-400">Description</p>
</div>
```

---

## Color Conventions

| Usage | Light | Dark |
|---|---|---|
| Page / card background | `bg-bg` | `bg-bg` |
| Panel / sidebar surface | `bg-white` | `dark:bg-zinc-900` |
| Subtle background (search) | `bg-zinc-50` | `dark:bg-zinc-800` |
| Hover state | `hover:bg-zinc-100` | `dark:hover:bg-zinc-800` |
| Active tab / brand bg | `bg-brand text-white` | `bg-brand text-white` |
| Primary text | `text-zinc-800` | `dark:text-zinc-200` |
| Muted / secondary text | `text-zinc-500` | `dark:text-zinc-400` |
| Navigation text | `text-zinc-600` | `dark:text-zinc-300` |
| Placeholder | `text-zinc-400` | `dark:text-zinc-500` |
| Border (input, card) | `border-zinc-200` | `dark:border-zinc-700` |

---

## Dark Mode Pairing

Every light class must have its dark counterpart. The most common pairs:

```tsx
// Panel surface
className="bg-white dark:bg-zinc-900"

// Subtle background
className="bg-zinc-50 dark:bg-zinc-800"

// Hover
className="hover:bg-zinc-100 dark:hover:bg-zinc-800"

// Text
className="text-zinc-600 dark:text-zinc-300"
className="text-zinc-500 dark:text-zinc-400"
className="text-zinc-400 dark:text-zinc-500"

// Border
className="border-zinc-200 dark:border-zinc-700"

// Header
className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm"
```

---

## Component API Conventions

Use the `cn()` utility (`src/lib/cn.ts`) for conditional classes — a simple filter-join (no `tailwind-merge`).

### Variant + Size pattern (see Button, Badge)

```tsx
const variants = {
  default: "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-black",
  primary: "bg-brand text-brand-fg hover:opacity-90",
  outline: "border border-border bg-transparent hover:bg-surface-hover",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}
```

Compose with `cn(variants[variant], sizes[size])`.

### Component class order convention

1. Layout / display (`flex`, `inline-flex`, `grid`, `hidden`)
2. Positioning (`items-center`, `justify-between`, `gap-*`)
3. Sizing (`w-full`, `h-*`, `size-*`)
4. Spacing (`p-*`, `px-*`, `py-*`)
5. Typography (`text-*`, `font-*`)
6. Visual (`rounded-*`, `border`, `shadow-*`)
7. Interactive (`transition-colors`, `hover:*`, `focus:*`, `disabled:*`)
8. Dark mode (`dark:*`)

---

## Sidebar Pattern (Messages & Chat Room)

```tsx
<div className={[
  sidebarOpen
    ? "fixed inset-y-0 left-0 z-50 w-72 md:static md:z-auto"
    : "hidden md:flex",
  "flex-col gap-4 rounded-xl border bg-white p-3 md:w-72 md:p-4 dark:bg-zinc-900",
].join(" ")}>
```

### Tab toggle
```tsx
<div className="flex gap-1.5 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
  <button className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
  }`}>
```

### Search input
```tsx
<input className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs
  transition-colors outline-none focus:border-zinc-400 focus:bg-white
  dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-zinc-500 dark:focus:bg-zinc-800/50"
  placeholder="Search..." />
```

### Section sub-label
```tsx
<p className="mb-2 px-0.5 text-[10px] font-semibold tracking-wider uppercase">
  {/* e.g., "Online — 3", "Requests — 2" */}
</p>
```

### List item (conversation, friend, room)
```tsx
<button className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm
  transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
```

---

## Message Bubble (Chat UI)

```tsx
// Container
<div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
  <div className="flex max-w-[70%] items-end gap-1">
    {/* Avatar for other person only */}
    <Avatar className="bg-brand h-5 w-5 shrink-0 text-[8px] text-white" />

    {/* Bubble */}
    <span className={`rounded-xl px-3 py-1.5 text-sm ${
      isMe
        ? "bg-brand text-white"
        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
    }`}>
      {body}
    </span>

    {/* Read receipts (outside bubble) */}
    {isMe && status === "read" && <Icon className="fill-current text-blue-400 drop-shadow-sm" />}
    {isMe && status === "delivered" && <Icon className="fill-current text-white/80" />}
    {isMe && status === "sent" && <Icon className="fill-current text-white/40" />}
  </div>
</div>
```

### Chat input bar
```tsx
<div className="flex gap-2 border-t p-2">
  <input className="rounded border px-3 py-2 text-sm flex-1 disabled:opacity-50" />
  <button className="bg-brand rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50">
    Send
  </button>
</div>
```

### Load earlier messages
```tsx
<button className="rounded bg-zinc-100 px-3 py-1 text-xs text-zinc-600
  hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
  Load earlier messages
</button>
```

### Empty state
```tsx
<div className="flex flex-1 items-center justify-center">
  <p className="text-xs text-zinc-400">No messages yet. Say hello!</p>
</div>
```

---

## Component Reference

| Component | File | Base Classes |
|---|---|---|
| `Badge` | `src/components/ui/Badge.tsx` | `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium` |
| `Button` | `src/components/ui/Button.tsx` | `inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40` |
| `Alert` | `src/components/ui/Alert.tsx` | `relative w-full rounded-lg border p-4 text-sm` |
| `Card` | `src/components/ui/Card.tsx` | `rounded-xl border border-border bg-bg text-fg shadow-sm` |
| `Avatar` | `src/components/ui/Avatar.tsx` | `relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface font-medium text-muted` |
| `Separator` | `src/components/ui/Separator.tsx` | `shrink-0 bg-border` (horizontal: `h-px w-full`, vertical: `h-full w-px`) |
| `Label` | `src/components/ui/Label.tsx` | `text-xs font-medium text-muted` |
| `.surface` | `globals.css` (class) | `border rounded-xl` with `color-mix(in oklab, currentColor 12%, transparent)` |

---

## App Shell (V1Shell)

```
┌──────────────────────────────────────────────────┐
│ Header (fixed top, z-50, h-14)                   │
│ [☰] [v1 brand]              [theme] [profile]    │
├────────┬─────────────────────────────────────────┤
│        │                                         │
│ Sidebar│  Main Content                            │
│ (w-56, │  (flex-1, p-4 md:p-6)                   │
│  z-40) │                                         │
│        │  ┌───────────────────────────────────┐   │
│ Nav    │  │ .surface                          │   │
│ links  │  │   flex flex-1 flex-col gap-2      │   │
│        │  │   p-4 md:p-5                      │   │
│        │  └───────────────────────────────────┘   │
│        │                                         │
├────────┴─────────────────────────────────────────┤
│ Footer (optional)                                 │
└──────────────────────────────────────────────────┘
```

Sidebar is a fixed overlay on mobile (`translate-x-full`) and static on `md:`.

---

## Class Order Convention (within className)

1. Display/position: `flex`, `hidden`, `fixed`, `relative`
2. Flex/grid layout: `flex-col`, `items-center`, `justify-between`, `gap-*`
3. Sizing: `w-*`, `h-*`, `max-w-*`, `flex-1`
4. Spacing: `p-*`, `px-*`, `py-*`, `m-*`
5. Typography: `text-*`, `font-*`, `tracking-*`, `uppercase`
6. Visual: `rounded-*`, `border`, `shadow-*`, `bg-*`
7. Interactive: `transition-colors`, `outline-none`, `hover:*`, `focus:*`, `disabled:*`, `active:*`
8. Dark mode: `dark:*` (last group)

---

## Color-Coded Section Labels

| Section | Text Color |
|---|---|
| Online (green) | `text-green-600` (light) |
| Requests (amber) | `text-amber-600` (light) |
| Offline / meta (zinc) | `text-zinc-500` / `text-zinc-400` |

---

## Read Receipt Icons

| Status | Color | Meaning |
|---|---|---|
| Gray single tick | `text-white/40` | Sent |
| Gray double tick | `text-white/80` | Delivered |
| Blue double tick | `text-blue-400 drop-shadow-sm` | Read |

Ticks sit outside the message bubble as a `self-end` flex sibling.

---

## Responsiveness

| Breakpoint | Tailwind | Usage |
|---|---|---|
| sm (640px) | `sm:` | Minimal adjustments |
| md (768px) | `md:` | Sidebar static layout, expanded padding |
| lg (1024px) | `lg:` | Wider layouts |
| xl (1280px) | `xl:` | Multi-column |
| 2xl (1536px) | `2xl:` | Max-width containers |

Mobile-first: `hidden md:flex` for desktop-only elements, `fixed md:static` for sidebar drawers.
