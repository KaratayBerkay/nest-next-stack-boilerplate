# features/

Domain modules (e.g. `auth`, `realtime`). Each feature is self-contained with its own
`ui/`, `actions/`, `hooks/`, `queries/`, `types.ts`, and `index.ts` barrel export.

**Structure per feature:**

```
features/<name>/
  ui/           Feature-specific UI components
  actions/      Server actions (Next.js "use server")
  hooks/        Feature-specific React hooks
  queries/      Data fetching / TanStack Query definitions
  types.ts      Feature-specific types
  index.ts      Public API barrel export
```

**Dependency direction:** features may import from `components/`, `integrations/`, `lib/`,
and `types/`. Nothing in `components/`, `integrations/`, `lib/`, or `constants/` may import
from `features/`. `app/` is for routing only.
