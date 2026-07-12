## Code Patterns

### Extract inline prop types to `src/types/`

Never define prop types inline in component files. Instead:

1. Create a file at `src/types/<feature>/<ComponentName>-types.ts`
2. Define and export the interface (e.g. `StripeCardFormProps`)
3. Import it in the component file with `import type { ... }`

Example: `src/types/billing/StripeCardForm-types.ts` → `StripeCardFormProps` → used in `StripeCardForm.tsx`.

### API constants to `src/constants/api/`

Never hardcode URLs, HTTP methods, or headers inline. Instead:

1. **URLs** → `src/constants/api/urls.ts` — `export const NAME = "/api/path" as const`
2. **Methods** → `src/constants/api/methods.ts` — `export const POST = "POST" as const`
3. **Headers** → `src/constants/api/headers.ts` — `export const JSON_CONTENT_TYPE_HEADER = { "Content-Type": "application/json" } as const`

Import with `import { NAME } from "@/constants/api/<file>"`. Barrel re-exports are in `src/constants/index.ts`.

### Multi-page views and client components to `src/views/`

Only server components belong in `app/` route folders. All client components — whether page variants or full page content — go in `src/views/<route>/`.

**Rule 1 — Tier-based views:** When a route has multiple page variants (e.g. `FreePageView`, `BasicPageView`, `MediumPageView`, `PremiumPageView`), place them in `src/views/<route>/`.

```tsx
// ✅ Good — views in src/views/ import with @/ alias
import { FreePageView } from "@/views/notification/FreePageView";
```

```tsx
// ❌ Bad — co-located views
import { FreePageView } from "./views/FreePageView";
```

**Rule 2 — Client component pages:** If a page.tsx has `"use client"`, extract the client logic into `src/views/<route>/PageContent.tsx` and make `page.tsx` a server component that imports it. This allows `page.tsx` to export `metadata`/`generateMetadata`.

```tsx
// ✅ Good — page.tsx is a server component with metadata
import type { Metadata } from "next";
import { PlansContent } from "@/views/plans/PageContent";

export const metadata: Metadata = {
  title: "Plans",
  description: "View available plans",
};

export default function PlansPage() {
  return <PlansContent />;
}
```

```tsx
// ❌ Bad — client component can't export metadata
"use client";
export default function PlansPage() { ... }
```

**Rule 3 — Co-located client components:** Never place `"use client"` components in `app/` route folders (except Next.js convention files like `error.tsx`, `not-found.tsx`, `global-error.tsx`). Move them to `src/views/<route>/`.

```tsx
// ❌ Bad — NoncePanel.tsx is a "use client" component co-located in app/security/csp/
import { NoncePanel } from "./NoncePanel";
```

```tsx
// ✅ Good — moved to src/views/security/csp/NoncePanel.tsx
import { NoncePanel } from "@/views/security/csp/NoncePanel";
```

### SSR search params → pass to client components

Never read `window.location.search` or use `useClientSearchParams()` for data that drives business logic (room selection, tab state, filters, pagination). Instead, collect search params on the server and pass them as props.

**Why:** `window.location.search` is only available on the client. A client hook that reads it once on mount is stale — it won't update when `router.replace` changes only the search params (same pathname). This breaks page claims, analytics, and any logic that reacts to URL changes.

```tsx
// ✅ Good — page.tsx is a server component that reads searchParams and passes them down
import { ChatRoomContent } from "@/views/chat-room/PageContent";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChatRoomPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const room = (sp.room as string) || "general";
  return <ChatRoomContent initialRoom={room} />;
}
```

```tsx
// ❌ Bad — client component reads window.location.search (stale on router.replace)
"use client";
export default function ChatRoomPage() {
  const sp = useClientSearchParams();
  const room = sp?.get("room") || "general";
  // ...
}
```

### Extract nested handlers to module-level functions

Never define event handlers or async logic inside the component body. Instead:

1. Extract the function above the component (outside the component closure)
2. Pass all needed state setters and values as explicit parameters
3. This eliminates `// fallow-ignore-next-line complexity` suppressions

```tsx
// ✅ Good
async function handleSubmit(
  data: FormData,
  setError: Dispatch<SetStateAction<string | null>>,
) { ... }

export default function MyPage() { ... }
```

```tsx
// ❌ Bad
export default function MyPage() {
  const handleSubmit = async () => { ... };
  ...
}
```

### Fallback components to `src/fallbacks/`

Never define inline Suspense fallback JSX in component files. Instead:

1. Create a file at `src/fallbacks/<directory-mirror>/<Name>Fallback.tsx`
2. Define and export the fallback component (e.g. `ChatRoomFallback`)
3. Import it in the source file with `import { ChatRoomFallback } from "@/fallbacks"`

**Directory structure mirrors source:**

- `src/views/chat-room/FreePageView.tsx` → `src/fallbacks/views/chat-room/ChatRoomFallback.tsx`
- `src/app/v1/[lang]/messages/loading.tsx` → `src/fallbacks/app/v1/[lang]/messages/MessagesLoadingFallback.tsx`
- `src/app/auth/layout.tsx` → `src/fallbacks/app/auth/AuthFallback.tsx`

```tsx
// ✅ Good — fallback extracted to src/fallbacks/
import { ChatRoomFallback } from "@/fallbacks";

export function FreePageView() {
  return (
    <Suspense fallback={<ChatRoomFallback />}>
      <ChatRoomContent />
    </Suspense>
  );
}
```

```tsx
// ❌ Bad — inline fallback JSX
export function FreePageView() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-4">
          <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
          {/* ... 20+ lines of skeleton JSX */}
        </div>
      }
    >
      <ChatRoomContent />
    </Suspense>
  );
}
```

### Static edge-case pages to `src/features/statics/`

Pages that appear only in specific situations (error states, 404, access denied, loading, unauthenticated) must be extracted to `src/features/statics/`. Never hardcode English strings in these pages — use i18n where `MessagesProvider` is available.

**When to create a static page:**

- Error boundary (`error.tsx`) — shows when a segment throws
- Not-found (`not-found.tsx`) — shows when a route doesn't exist
- Access denied — shows when user lacks required role/tier
- Unauthorized — shows when user is not authenticated
- Loading state with text — shows during async loading

**Directory structure:**

```
src/features/statics/
├── error/ErrorPage.tsx          # Generic error page (for messages, routing, etc.)
├── not-found/NotFoundPage.tsx   # Non-i18n 404 page
├── not-found/I18nNotFoundPage.tsx  # i18n-aware 404 page
├── access-denied/AccessDeniedPage.tsx  # Role/tier denial
├── unauthorized/UnauthorizedPage.tsx   # Unauthenticated prompt
├── loading/LoadingPage.tsx      # Generic loading text
└── index.ts                     # Barrel re-export
```

**Types go in `src/types/features/statics/`:**

```
src/types/features/statics/
├── ErrorPage-types.ts
├── NotFoundPage-types.ts
├── AccessDeniedPage-types.ts
├── UnauthorizedPage-types.ts
└── LoadingPage-types.ts
```

**Route files stay thin — import from statics:**

```tsx
// ✅ Good — error.tsx is a thin wrapper
"use client";
import { ErrorPage } from "@/features/statics";
import type { BoomErrorProps } from "@/types/routing/BoomError-types";

export default function BoomError({ error, reset }: BoomErrorProps) {
  return (
    <div className="surface flex flex-col gap-2 p-5">
      <ErrorPage error={error} reset={reset} />
    </div>
  );
}
```

```tsx
// ❌ Bad — hardcoded English in error.tsx
"use client";
export default function BoomError({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

**i18n rules for static pages:**

- If the route is under `v1/[lang]/`, use `useMessages("error")` or the relevant namespace
- If the route is outside `MessagesProvider` scope (e.g. `global-error.tsx`), keep strings as-is or use client-side language detection
- After adding new i18n keys, run `pnpm generate-i18n-types` to update generated types
- Always create both `en` and `tr` message files for new namespaces

## Log Query Hooks

When asked to read/show websocket logs, payment logs, billing logs, or any application logs, query the last logs from Elasticsearch.

- **ES endpoint:** `http://localhost:9200`
- **Kibana:** `http://localhost:5601`

### Quick queries

| Log type               | ES index                     | Query                                                                      |
| ---------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| WebSocket exceptions   | `websocket-exception-logs`   | `curl -s http://localhost:9200/websocket-exception-logs/_search?size=20`   |
| HTTP exceptions        | `http-exception-logs`        | `curl -s http://localhost:9200/http-exception-logs/_search?size=20`        |
| App exceptions         | `application-exception-logs` | `curl -s http://localhost:9200/application-exception-logs/_search?size=20` |
| Session logs           | `session-logs`               | `curl -s http://localhost:9200/session-logs/_search?size=20`               |
| Page logs              | `page-logs`                  | `curl -s http://localhost:9200/page-logs/_search?size=20`                  |
| Network logs           | `network-logs`               | `curl -s http://localhost:9200/network-logs/_search?size=20`               |
| Database logs          | `database-logs`              | `curl -s http://localhost:9200/database-logs/_search?size=20`              |
| Performance logs       | `performance-logs`           | `curl -s http://localhost:9200/performance-logs/_search?size=20`           |
| App logs (all backend) | `app-logs`                   | `curl -s http://localhost:9200/app-logs/_search?size=20`                   |
| Payment logs           | `payment-logs`               | `curl -s http://localhost:9200/payment-logs/_search?size=20`               |
| Billing logs           | `billing-logs`               | `curl -s http://localhost:9200/billing-logs/_search?size=20`               |
| Frontend logs (all)    | `frontend-logs`              | `curl -s http://localhost:9200/frontend-logs/_search?size=20`              |

Always return the results formatted with `python3 -m json.tool` and summarize key fields like `event`, `context`, `service`, `level`, `userId`, `errorMessage`, `category`.
