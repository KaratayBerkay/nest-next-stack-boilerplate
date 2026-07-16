## Code Patterns

### Extract inline prop types to `src/types/`

Never define prop types inline in component files. Instead:

1. Create a file at `src/types/<feature>/<ComponentName>-types.ts`
2. Define and export the interface (e.g. `StripeCardFormProps`)
3. Import it in the component file with `import type { ... }`

Example: `src/types/billing/StripeCardForm-types.ts` → `StripeCardFormProps` → used in `StripeCardForm.tsx`.

**Directory structure mirrors source:**
- `src/components/ui/button/button.tsx` → `src/types/ui/Button-types.ts`
- `src/views/feed/FreePageView.tsx` → `src/types/feed/FreePageView-types.ts`
- `src/lib/realtime/RealtimeProvider.tsx` → `src/types/lib/RealtimeProvider-types.ts`

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

### Clean and readable pages

Page files (`page.tsx`, `PageContent.tsx`, view files) must stay clean and focused. If a file grows too large or complex, break it down:

1. **Extract sub-components** into sibling files: `ComponentName.tsx` alongside the parent
2. **Extract hooks** into `src/hooks/<feature>/` or `src/lib/<feature>/`
3. **Extract utility functions** into `src/lib/<feature>/`
4. **Keep the page file as a thin shell** — just imports, metadata, and layout composition

```tsx
// ✅ Good — page is clean, logic lives in separate files
import type { Metadata } from "next";
import { FeedContent } from "@/views/feed/FeedContent";

export const metadata: Metadata = { title: "Feed" };

export default function FeedPage() {
  return <FeedContent />;
}
```

```tsx
// ❌ Bad — page contains 300+ lines of hooks, handlers, sub-components
"use client";
export default function FeedPage() {
  // 5 useState calls
  // 3 useEffect calls
  // 4 event handlers
  // 2 inline sub-components
  // 200+ lines of JSX
}
```

**Rule of thumb:** If a view/page file exceeds ~150 lines, split it.

## Visiting Deployed URLs with Playwright

When asked to visit a URL that requires authentication (e.g. `https://app.eys.gen.tr/...`), use Playwright with cookies to bypass the login form.

### Auth flow

1. **Navigate to the site** first to establish the domain context
2. **Register a test user** via `POST /api/auth/register` with `{ email, password, name }`
3. **Set cookies** from the registration response — `access_token` and `session_user` (base64url-encoded JSON)
4. **Navigate to the target URL**

```python
import time, json, base64, uuid
from playwright.sync_api import sync_playwright

BASE = "https://app.eys.gen.tr"
EMAIL = f"test-{uuid.uuid4().hex[:8]}@test.com"
PASSWORD = "TestPass123!"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()

    # 1. Establish domain context
    page.goto(BASE, timeout=30000, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle", timeout=15000)

    # 2. Register
    reg = page.request.post(f"{BASE}/api/auth/register", data={
        "email": EMAIL, "password": PASSWORD, "name": "Test User"
    }).json()

    # 3. Set cookies
    context.add_cookies([
        {"name": "access_token", "value": reg["accessToken"],
         "domain": "app.eys.gen.tr", "path": "/"},
        {"name": "session_user", "value": base64.urlsafe_b64encode(
            json.dumps(reg["user"]).encode()).decode(),
         "domain": "app.eys.gen.tr", "path": "/"},
    ])

    # 4. Navigate
    page.goto(f"{BASE}/v1/en/ui/alert?tab=variants", timeout=30000)
    page.wait_for_load_state("networkidle", timeout=15000)
```

### Key details

- `dev-activate` returns **404** in production — new users stay `PENDING_VERIFICATION` unless email is verified. Registering still returns an `accessToken` that works for cookie-based access.
- `device_token` cookie is set by the backend **after** login — not needed for the register-then-cookie approach.
- Always use `uuid.uuid4().hex[:8]` suffix on the email to avoid conflicts with existing test users.
- `POST /api/auth/login` returns **500** for `PENDING_VERIFICATION` users — don't use login, use register + cookies.

## Log Query Hooks

When asked to read/show websocket logs, payment logs, billing logs, or any application logs, query the last logs from Elasticsearch.

- **ES endpoint:** `http://localhost:9200`
- **Kibana:** `http://10.10.2.175:5601`

### Quick queries

| Log type | ES index | Query |
|---|---|---|
| WebSocket exceptions | `websocket-exception-logs` | `curl -s http://localhost:9200/websocket-exception-logs/_search?size=20` |
| HTTP exceptions | `http-exception-logs` | `curl -s http://localhost:9200/http-exception-logs/_search?size=20` |
| App exceptions | `application-exception-logs` | `curl -s http://localhost:9200/application-exception-logs/_search?size=20` |
| Session logs | `session-logs` | `curl -s http://localhost:9200/session-logs/_search?size=20` |
| Page logs | `page-logs` | `curl -s http://localhost:9200/page-logs/_search?size=20` |
| Network logs | `network-logs` | `curl -s http://localhost:9200/network-logs/_search?size=20` |
| Database logs | `database-logs` | `curl -s http://localhost:9200/database-logs/_search?size=20` |
| Performance logs | `performance-logs` | `curl -s http://localhost:9200/performance-logs/_search?size=20` |
| App logs (all backend) | `app-logs` | `curl -s http://localhost:9200/app-logs/_search?size=20` |
| Payment logs | `payment-logs` | `curl -s http://localhost:9200/payment-logs/_search?size=20` |
| Billing logs | `billing-logs` | `curl -s http://localhost:9200/billing-logs/_search?size=20` |
| Frontend logs (all) | `frontend-logs` | `curl -s http://localhost:9200/frontend-logs/_search?size=20` |

Always return the results formatted with `python3 -m json.tool` and summarize key fields like `event`, `context`, `service`, `level`, `userId`, `errorMessage`, `category`.

## Agent Skills

Claude Code skills live in `.claude/skills/<skill-name>/` at the repo root. Each skill is a `SKILL.md` with YAML frontmatter (`name` + `description` — the description is what makes the skill trigger) followed by markdown instructions that load into context when the skill activates. Skills may bundle resources (e.g. `scripts/`) that are run or read on demand, keeping the always-loaded footprint small.

Three skills are vendored from [anthropics/skills](https://github.com/anthropics/skills); four are custom-authored from this codebase's real conventions (exemplar files, not generic advice).

| Skill | Source | Covers |
|---|---|---|
| `ui-components` | custom | Component anatomy in `next-js-boilerplate/src/components/ui`: kebab folder + PascalCase shim + central barrel, types in `src/types/ui/`, non-merging `cn()`, `as const` variant maps, `useComponentVariant`, semantic tokens, new-component checklist |
| `tailwind-theming` | custom | Tailwind v4 CSS-first config, `.theme-*` token pipeline in `globals.css`, adding themes/tokens, color-harmony rules |
| `radix-primitives` | custom | Wrapping `@radix-ui/react-*` primitives (hover-card pattern), which components are Radix-backed vs deliberately native, `data-state` styling, `asChild` |
| `datetime-inputs` | custom | Calendar/DatePicker/TimeInput conventions, `@/lib/date-time` helpers, react-day-picker v10 API caution, store-UTC-display-local |
| `frontend-design` | anthropics/skills | Distinctive visual design direction — typography, palette, layout choices that don't read as templated |
| `theme-factory` | anthropics/skills | 10 pre-set color/font themes plus on-the-fly theme generation for pages and artifacts |
| `webapp-testing` | anthropics/skills | Playwright-driven testing of the local app: verify flows, capture screenshots, read browser logs |

Notes:

- The four custom skills mirror real code. When a convention in `next-js-boilerplate/src/components/ui/` or `globals.css` changes, update the matching `SKILL.md` — a stale skill is misinformation.
- `tailwind-theming` bundles a WCAG contrast checker; run it after any palette change: `node .claude/skills/tailwind-theming/scripts/check-contrast.mjs [theme] [--strict]` (from repo root).
