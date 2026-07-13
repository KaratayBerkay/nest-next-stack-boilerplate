---
name: tailwind-theming
description: Tailwind CSS v4 setup and the multi-theme color system for this repo's frontend (next-js-boilerplate). Use for ANY styling, CSS, or Tailwind work here, and whenever the user mentions colors, palettes, color harmony or arrangement, themes, dark mode, design tokens, shadows, fonts, globals.css, or adding/changing a theme. Covers the CSS-first v4 config (@theme, @custom-variant), the .theme-* token architecture, semantic utilities like bg-surface and text-fg, how to add themes and tokens, and color-harmony rules with a bundled WCAG contrast checker script.
---

# Tailwind v4 + Theme System

This project uses **Tailwind CSS v4** with CSS-first configuration. There is **no `tailwind.config.js` and there must never be one** — the entire design system lives in `next-js-boilerplate/src/app/globals.css`. If you find yourself wanting a config file, the answer is a `@theme` or `@custom-variant` block in that CSS file.

## How the token pipeline works

Three layers, all in `globals.css`:

```css
/* 1. Each theme defines raw palette vars */
.theme-dark { --bg: #0a0a0a; --fg: #ededed; --brand: #818cf8; ... }

/* 2. @theme inline maps raw vars to Tailwind color tokens */
@theme inline { --color-bg: var(--bg); --color-brand: var(--brand); ... }

/* 3. Components consume semantic utilities */
/* bg-bg  text-fg  bg-brand  text-brand-fg  border-border ... */
```

The ThemeProvider (`src/hooks/useTheme.tsx`) puts the active `theme-*` class on `<html>`, persists the choice in a cookie, and *also* toggles a bare `dark` class for themes listed in `DARK_THEMES` — that is what powers the `dark:` variant. The theme list itself lives in `@/constants/theme` (`THEMES`, `DARK_THEMES`).

Custom variants defined at the top of globals.css:

- `dark:` — matches inside `.dark` (any dark-ish theme, not just theme-dark). Prefer tokens over `dark:` overrides; use `dark:` only when a token genuinely can't express the difference.
- `touch:` / `mouse:` — input-modality variants (classes set by `DeviceTypeInit`), for hover-dependent affordances.

## Token vocabulary

Every theme must define all of these; components rely on the full set.

| Token (utility) | Role |
|---|---|
| `bg` / `fg` | page background / primary text — the anchor pair |
| `surface` / `surface-hover` | cards, inputs, menus / their hover state |
| `border` | hairlines, input borders |
| `muted` / `muted-fg` | secondary text / tertiary-secondary text |
| `brand` / `brand-fg` | accent (buttons, links, focus rings) / text on accent |
| `success|warning|error|info` + `-fg` | status colors / text on them |

Plus theme-aware shadows (`shadow-xs`…`shadow-xl`, `shadow-elevated`, `shadow-success|warning|error|info` rings) and fonts (`font-sans`/`font-mono` → Geist via next/font vars).

## Adding a theme

1. Copy an existing `.theme-*` block in globals.css (light and dark variants of each var — pick the closest starting point) and define **every** token.
2. Register it in `THEMES` in `@/constants/theme`; add to `DARK_THEMES` if backgrounds are dark so `dark:` and syntax themes follow.
3. Run the contrast checker (below) and fix failures.
4. No component changes should be needed — if a component looks broken in the new theme, the component is hardcoding colors and that's the bug to fix.

**Adding a token** is the reverse: add the var to *every* `.theme-*` block, map it in `@theme inline` (`--color-<name>: var(--<name>)`), and keep the `-fg` pairing convention if anything will ever sit on top of it.

## Color arrangement & harmony

Rules that keep a palette coherent — derived from the four shipped themes, which are the reference implementations:

**Build the neutral ladder first.** `bg → surface → surface-hover → border` must step monotonically away from `bg` in lightness, in small increments (in theme-light: `#ffffff → #fafafa → #f4f4f5 → #e4e4e7`). `fg` sits at the far end; `muted` roughly midway. Get this ladder right and the theme already works — accents are the last 10%.

**Proportion: ~60/30/10.** Neutrals dominate (bg/surface), secondary tones support (borders, muted text), brand appears sparingly (primary actions, focus rings, links). A theme where brand covers large areas will feel loud in every component at once.

**One accent hue family.** `brand` is the only free-choice hue. For tinted themes, pull the *neutrals* from the same hue family instead of adding more accents — theme-ocean does exactly this (sky-tinted bg `#f0f9ff`, borders `#bae6fd`, fg `#0c4a6e`, all analogous to brand `#0284c7`). That is analogous harmony: one hue, varied lightness/saturation.

**Dark themes lighten the accent.** On dark backgrounds, raise the brand's lightness (and let saturation drop slightly) or it loses contrast and vibrancy: light uses indigo-600 `#4f46e5`, dark uses indigo-400 `#818cf8`. Same relationship for status colors (`#16a34a` → `#22c55e`, etc.).

**Status hues are fixed semantics.** success=green, warning=amber, error=red, info=blue/sky — always recognizable, only *tuned* (lightness/saturation) toward the theme's temperature. Never reassign these hues.

**Contrast floors** (WCAG): `fg`/`bg` ≥ 7:1 target (4.5 minimum); `muted`/`bg` and `fg`/`surface` ≥ 4.5; `brand-fg`/`brand` and each `<status>-fg`/`<status>` ≥ 4.5 (3.0 tolerable only for large/bold text — amber is the usual offender; prefer darkening the amber over shrinking the text). `border` vs `bg` should be visible but quiet (≈1.2–2:1).

### Contrast checker

```bash
node .claude/skills/tailwind-theming/scripts/check-contrast.mjs           # all themes
node .claude/skills/tailwind-theming/scripts/check-contrast.mjs ocean    # one theme
node .claude/skills/tailwind-theming/scripts/check-contrast.mjs --strict # exit 1 on hard fails
```

Run it (from the repo root) after any palette change — it parses the `.theme-*` blocks straight out of globals.css and prints WCAG ratios for every critical pair. Don't eyeball contrast; the script is the arbiter.

## Practical notes

- Prefer v4 utility forms: `size-9` over `h-9 w-9`, opacity modifiers like `bg-brand/15`, arbitrary values sparingly.
- `prettier-plugin-tailwindcss` sorts classes on format — don't fight the ordering.
- Component-level styling conventions (cn(), variant maps, no hardcoded colors) live in the **ui-components** skill; per-theme palette work belongs here.
