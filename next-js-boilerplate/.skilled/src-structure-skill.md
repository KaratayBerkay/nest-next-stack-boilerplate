# `src/` Directory Structure & File Placement

## Directory Layout

```
src/
  api/              API utility modules (placeholder — .gitkeep)
  app/              Next.js App Router — routing ONLY (layouts, pages, route handlers)
  assets/           Static assets — images, SVGs, fonts (placeholder — .gitkeep)
  components/
    layout/         Structural layout components (SideMenu, SiteHeader, ThemePicker, LocaleSwitcher, NavLink, ThemeToggle)
    ui/             Primitive UI components — shadcn-style (Button, Card, Dialog, Badge, Input, etc.)
  constants/        App-wide constants (site config, cookie names, etc.)
  context/          React context providers (theme, locale, auth, preferences)
  data/             Static data files — JSON, seed data (placeholder — .gitkeep)
  features/         Self-contained domain modules
    <feature>/
      actions/      Server actions
      ui/           Feature-specific UI components
      hooks/        Feature-specific hooks
      queries/      Data fetching / TanStack Query definitions
      types.ts      Feature-specific types
  generated/        Auto-generated code (Prisma client, etc.)
  hooks/            Cross-cutting React hooks (not owned by a single feature)
  integrations/     Third-party integration wrappers (TanStack Query provider, etc.)
  lib/              Low-level utilities + clients (cn, env, i18n, backend, validation)
    seo/            SEO helpers (JsonLd, meta, OG)
  pages/            Page-level components (placeholder — .gitkeep)
  services/         Service layer — business logic (placeholder — .gitkeep)
  store/            State management (cookies, global stores)
  types/            App-wide shared TypeScript type definitions
  utils/            Utility functions (placeholder — .gitkeep)
```

## Dependency Rules (import direction)

- `app/` → may use everything; holds NO business logic.
- `features/` → may import `components/`, `integrations/`, `lib/`, `types/`.
- `components/` → may import `lib/`, `types/`. Never imports `features/`.
- `integrations/` → may import `lib/`, `types/`.
- `lib/` → may import `types/` only. No UI, no features.
- `hooks/` → may import `lib/`, `types/`. Feature-specific hooks live inside that feature.
- `constants/` → may import `types/` only.

Use the `@/*` alias for all internal imports (e.g. `import { cn } from "@/lib"`).

## File Placement Rules

| File type                               | Destination                               |
| --------------------------------------- | ----------------------------------------- |
| Page / layout / route handler           | `src/app/<segment>/`                      |
| UI primitive (Button, Card, Dialog)     | `src/components/ui/<Component>.tsx`       |
| Layout component (Header, Sidebar, Nav) | `src/components/layout/<Component>.tsx`   |
| Top-level reusable component            | `src/components/<Component>.tsx`          |
| Feature-specific server action          | `src/features/<name>/actions/<action>.ts` |
| Feature-specific UI component           | `src/features/<name>/ui/<Component>.tsx`  |
| Feature-specific hook                   | `src/features/<name>/hooks/<hook>.ts`     |
| Cross-cutting hook                      | `src/hooks/<hook>.ts`                     |
| Integration wrapper                     | `src/integrations/<name>/<wrapper>.tsx`   |
| Constant / config                       | `src/constants/<name>.ts`                 |
| Context provider                        | `src/context/<name>.tsx`                  |
| Utility function                        | `src/lib/<name>.ts`                       |
| SEO helper                              | `src/lib/seo/<name>.tsx`                  |
| Type definition                         | `src/types/<name>.ts`                     |
| API utility                             | `src/api/<name>.ts`                       |
| Service / business logic                | `src/services/<name>.ts`                  |
| State management                        | `src/store/<name>.ts`                     |
| Static data / JSON                      | `src/data/<name>.json`                    |
| Asset (image, font)                     | `src/assets/<name>`                       |
