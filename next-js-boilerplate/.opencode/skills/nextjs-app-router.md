# Next.js App Router — Patterns & Best Practices

## Page Files (`page.tsx`)

### `params` (dynamic route segments)

**`params` is always a `Promise`** — must be `await`ed (server) or read via `use()` (client).

**Server Component:**

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
}
```

**Client Component** (use `useParams()` hook, NOT the `params` prop):

```tsx
"use client";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ slug: string }>();
  // params is a plain object (not a Promise) in client components
}
```

**Client Component receiving `params` as prop** (use React `use()` to unwrap):

```tsx
"use client";
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
}
```

### `searchParams`

**`searchParams` is always a `Promise`** — must be awaited.

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page = "1", sort = "asc" } = await searchParams;
}
```

Client Component:

```tsx
"use client";
import { use } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query } = use(searchParams);
}
```

### `PageProps` helper

Globally available (no import needed):

```tsx
export default async function Page(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
}
```

### `generateStaticParams`

Must return an array matching the dynamic segments:

```tsx
export async function generateStaticParams() {
  return [{ slug: "post-1" }, { slug: "post-2" }];
}
```

Child segments receive parent params:

```tsx
export async function generateStaticParams({
  params: { category },
}: {
  params: { category: string };
}) {
  // params here is synchronous (already resolved by parent)
}
```

## Layouts (`layout.tsx`)

Same `params` rules as pages:

```tsx
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
}
```

- Layouts can have `generateStaticParams` for their own dynamic segments.
- Layouts do NOT receive `searchParams`.

## Route Handlers (`route.ts`)

```tsx
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
}
```

## Key Rules

1. **`params` is always `Promise<{...}>`** in server components, layouts, and route handlers.
2. **Client components** should use `useParams()` hook, NOT the `params` prop.
3. If a client component MUST receive `params` as a prop (e.g., a child of a server page), use React's `use()` to unwrap.
4. **`searchParams` is always `Promise<{...}>`** — opt-in to dynamic rendering.
5. **`"use client"` pages** cannot be `async` — use `use()` or `useParams()`.
6. **Root layouts** (`app/layout.tsx`) do NOT receive `params`.
7. **Parallel route slots** (e.g., `@modal`) follow the same file conventions.
