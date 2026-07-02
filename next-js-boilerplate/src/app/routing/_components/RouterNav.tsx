"use client";

import { usePathname, useRouter } from "next/navigation";

// Programmatic navigation with `useRouter`, plus reading the live path with
// `usePathname`. `router.push()` performs the same client-side (no full reload)
// transition as `<Link>`, just triggered imperatively — handy from event
// handlers, after mutations, etc. (`_components` is a private folder, so it is
// never treated as a route.)
export function RouterNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3 text-sm" data-testid="router-nav">
      <span className="text-muted">
        at <code data-testid="current-path">{pathname}</code>
      </span>
      <button
        type="button"
        data-testid="router-push-b"
        className="text-brand underline"
        onClick={() => router.push("/routing/b")}
      >
        push → /routing/b
      </button>
      <button
        type="button"
        data-testid="router-back"
        className="text-brand underline"
        onClick={() => router.back()}
      >
        back
      </button>
    </div>
  );
}
