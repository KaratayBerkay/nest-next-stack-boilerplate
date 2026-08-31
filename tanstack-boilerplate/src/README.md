# `src/` — directory structure & conventions

```
src/
  api/              API utility modules (placeholder)
  app/              Next.js App Router — routing ONLY (layouts, pages, route handlers)
  assets/           Static assets — images, SVGs, fonts (placeholder)
  components/
    layout/         Structural layout components
    ui/             Primitive UI — shadcn-style (Button, Card, Dialog, Badge, Input, ...)
  constants/        App-wide constants (site config, cookie names, ...)
  context/          React context providers (theme, locale, auth, preferences)
  data/             Static data — JSON, seed data (placeholder)
  features/         Self-contained domain modules (see features/README.md)
  generated/        Auto-generated code (Prisma client, ...)
  hooks/            Cross-cutting React hooks (see hooks/README.md)
  integrations/     Third-party integration wrappers (TanStack Query, ...)
  lib/              Low-level utilities + clients (cn, env, i18n, backend, validation)
    seo/            SEO helpers (JsonLd, meta, OG)
  pages/            Page-level components (placeholder)
  services/         Service layer — business logic (placeholder)
  store/            State management (cookies, global stores)
  types/            App-wide shared TypeScript types
  utils/            Utility functions (placeholder)
```

## Dependency rules (import direction)

- `app/` → may use everything; holds NO business logic.
- `features/` → may import `components/`, `integrations/`, `lib/`, `types/`.
- `components/` → may import `lib/`, `types/`. Never imports `features/`.
- `integrations/` → may import `lib/`, `types/`.
- `lib/` → may import `types/` only. No UI, no features.
- `hooks/` → may import `lib/`, `types/`. Feature-specific hooks live inside that feature.
- `constants/` → may import `types/` only.

Use the `@/*` alias for all internal imports (e.g. `import { cn } from "@/lib"`).
