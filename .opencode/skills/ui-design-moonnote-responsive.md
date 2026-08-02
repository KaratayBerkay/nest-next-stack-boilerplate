# UI Design: Moon Note Theme + Responsive Best Practices

## Moon Note Theme

### Design Rationale

A calm, minimal, note-taking-app aesthetic with a moonlit dark palette. Deep indigo night sky, pale moon-gold accent, high readability. Designed for long-form reading and writing — the notes-app use case.

### Palette Spec (globals.css `.style-moonnote`)

```
--bg:         #0b0e1c   deep night ink (blue-violet)
--surface:    #131730   lifted night
--surface-hover: #1c2142
--border:     #2a3054   quiet indigo
--fg:         #eceef8   moonlit paper white (16.6:1 on bg)
--muted:      #9aa3c7
--muted-fg:   #9aa3c7
--brand:      #f2d48a   pale moon gold (13.3:1 on bg)
--brand-fg:   #241c08   dark warm ink
--success:    #8fd0a8   soft mint
--success-fg: #0d2417
--warning:    #e8a94f   warm amber
--warning-fg: #2a1a04
--error:      #ee9c9c   soft coral
--error-fg:   #2e0e0e
--info:       #93b5ef   soft sky
--info-fg:    #0e1f3a
--overlay:    #000000
```

Component-style maps to "default" (no comp tokens needed).

### Design Decisions

- Neutral ladder: bg → surface → surface-hover → border — monotonic lightness, cool indigo family
- Brand = warm moon gold, only warm hue — analogous neutral harmony from indigo
- Status colors tuned to night temperature (soft, not neon)
- `dark:` variant auto-applied (not "light") — dark: variant utilities follow

### Adding to the Boilerplate

Files touched:
- `src/app/globals.css` — `.style-moonnote` block
- `src/constants/theme.ts` — ThemeName, THEMES, themeToComponentStyle (returns "default")
- `src/hooks/useTheme.tsx` — getInitialTheme (style-moonnote check), applyTheme removal list
- `public/scripts/theme-init.js` — THEMES array
- `src/app/layout.tsx` — THEME_NAMES
- `src/components/layout/ThemeToggle.tsx` — THEME_ICONS (IconMoonStars)

---

## Responsive UI Design Skills

### Touch Targets (WCAG 2.2 SC 2.5.8)

- **Minimum:** 24×24 CSS px (Level AA)
- **Enhanced (2.5.5):** 44×44 CSS px (Level AAA)
- **Spacing exception:** undersized targets pass if 24px diameter circles centered on each don't intersect
- **Boilerplate baseline:** V0 Design Language mandates ≥36px touch targets; controls use `sm h-8` / `md h-9` / `lg h-10`

### Fitts's Law

Time to acquire a target = f(distance, size). Implications for responsive UI:
- **Mobile:** primary actions within thumb reach (bottom 40% of screen preferred)
- **Desktop:** consistent button positions across viewports (no jumping)
- Use `sticky` positioning for key CTAs on mobile

### Miller's Law

Average working memory: 7±2 items. Group related options into chunks of 5-9 maximum.
- Navigation menus: limit top-level items to 7
- Form fields: group into logical sections with clear headings

### Hick's Law

Decision time = k × ln(choices). Reduce visible options:
- Mobile: collapse secondary options into menus (mobile accordion pattern in ExampleTabs)
- Desktop: show more options directly, but use visual hierarchy (size, color, position)

### Doherty Threshold

Interface response < 400ms keeps users engaged. For UI components:
- Transitions: `transition-all` or `transition-colors` on interactive elements
- Focus ring: immediate (no delay)
- Loading states: show spinner immediately, not after 200ms+ delay

### Aesthetic-Users Effect

Users perceive aesthetically pleasing design as more usable. Moon Note achieves this via:
- Consistent palette (one hue family for neutrals)
- Generous spacing (not cramped)
- High contrast text (16.6:1 fg/bg)
- Minimal, purposeful accent use (10% rule: brand only for key actions)

### Law of Proximity + Common Region

Elements near each other or sharing a boundary are perceived as related.
- Use `gap-*` and `space-y-*` for consistent grouping
- Use `border` + `rounded-lg` for card grouping
- Use `bg-surface` background to create implicit regions

### Postel's Law (Robustness Principle)

Be liberal in what you accept, conservative in what you send.
- Forms: accept multiple date formats, phone formats, etc.
- Display: always show validation errors inline (use `FieldMessages`)
- Never silently drop user input

### Peak-End Rule

Users judge an experience by its peak and end:
- Show success state after form submission (Toast, not just redirect)
- Animate page transitions smoothly (use scroll-fade utilities)

---

## Mobile + Desktop Best Practices

### Layout Strategy

- **Mobile-first:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` pattern
- **Container widths:** `max-w-7xl mx-auto` for content, `px-4 sm:px-6 lg:px-8` for horizontal padding
- **Stacking:** single column on mobile, side-by-side on desktop

### Typography Scaling

Use the type scale in globals.css (`--text-*` tokens):
- Mobile: `text-sm` for body, `text-lg` for headings
- Desktop: `text-base` for body, `text-2xl` for headings
- Use `@media (min-width: ...)` or responsive Tailwind utilities

### Navigation Patterns

- **Mobile:** bottom sheet or hamburger menu
- **Desktop:** sidebar or horizontal nav
- The boilerplate's `useBreakpoint("sm")` hook switches between mobile accordion and desktop bar for ExampleTabs

### Scroll Affordances

- Hide scrollbars: `scrollbar-width: none`
- Show fade masks: `scroll-fade-y` / `scroll-fade-x`
- Toggle fade at scroll edge: `scrolled-to-top` / `scrolled-to-bottom`

### Touch vs Mouse Input

- `touch:` and `mouse:` custom variants from globals.css
- Touch: larger targets, no hover-dependent reveals
- Mouse: hover states, precise positioning for tooltips/popovers
- `DeviceTypeInit` component sets classes based on user agent

### Safe Areas (Notched Devices)

- `pb-safe` utility adds safe-area-inset padding for iOS/Android notches
- Bottom sheets, drawers, sticky footers should account for this

---

## Sources

- WCAG 2.2 SC 2.5.8 (Target Size Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Laws of UX: https://lawsofux.com/
- Refactoring UI (Adam Wathan, Steve Schoger): practical component styling
- Material Design 3: layout/spacing/grid systems
- Apple HIG: touch targets, safe areas, typography
