import { Suspense } from "react";
import { containerClass } from "@/constants/site";
import { Counter } from "@/components/ui/Counter";
import { NavLink } from "@/components/layout/NavLink";
import { RouterNav } from "./_components/RouterNav";
import type { RoutingLayoutProps } from "@/types/routing/RoutingLayout-types";

// Nested layout for the Stage-1 routing demos.
//
// A `layout.tsx` wraps every page in its segment. Unlike a page, a layout
// *persists* across navigation between sibling pages: Next.js keeps it mounted
// and only swaps the page below it, so the layout's DOM and state survive. The
// click counter in the header proves it — its count is preserved across
// navigation while each page's counter resets (see e2e/routing-layout.spec.ts).
//
// The nav (NavLink) and RouterNav demonstrate client-side navigation via
// `<Link>` and `useRouter` (see e2e/routing-nav.spec.ts).
export default function RoutingLayout({
  children,
}: RoutingLayoutProps) {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Routing demos</h1>
        <p className="text-muted max-w-xl text-sm">
          This shell is rendered by <code>routing/layout.tsx</code>. It stays
          mounted while the page below swaps on navigation.
        </p>
        <p className="text-muted text-xs">
          <Counter label="layout" />
        </p>
      </header>

      <Suspense fallback={<nav className="flex gap-4 text-sm" />}>
        <nav className="flex gap-4 text-sm" aria-label="Routing demos">
          <NavLink href="/routing/a">Page A</NavLink>
          <NavLink href="/routing/b">Page B</NavLink>
        </nav>
      </Suspense>

      <Suspense fallback={null}>
        <RouterNav />
      </Suspense>

      <section className="surface flex flex-col gap-2 p-5">{children}</section>
    </main>
  );
}
