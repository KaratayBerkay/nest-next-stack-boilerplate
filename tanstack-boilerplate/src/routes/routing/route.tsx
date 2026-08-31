// Ported from next-js-boilerplate/src/app/routing/layout.tsx (+ not-found.tsx)
import { Suspense } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { containerClass } from "@/constants/site";
import { Counter } from "@/components/ui/Counter";
import { NavLink } from "@/components/layout/NavLink";
import { RouterNav } from "@/views/routing/RouterNav";
import { RoutingNavFallback } from "@/fallbacks";
import { NotFoundPage } from "@/features/statics";

export const Route = createFileRoute("/routing")({
  component: RoutingLayout,
  notFoundComponent: RoutingNotFound,
});

// Nested layout for the routing demos. A layout route wraps every child page
// in its segment and *persists* across navigation between siblings: the
// router keeps it mounted and only swaps the page below, so the layout's DOM
// and state survive. The click counter in the header proves it — its count is
// preserved across navigation while each page's counter resets.
function RoutingLayout() {
  return (
    <main className={`${containerClass} flex flex-1 flex-col gap-6 py-16`}>
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Routing demos</h1>
        <p className="text-muted max-w-xl text-sm">
          This shell is rendered by <code>routing/route.tsx</code>. It stays
          mounted while the page below swaps on navigation.
        </p>
        <div className="text-muted text-xs">
          <Counter label="layout" />
        </div>
      </header>

      <Suspense fallback={<RoutingNavFallback />}>
        <nav className="flex gap-4 text-sm" aria-label="Routing demos">
          <NavLink href="/routing/a">Page A</NavLink>
          <NavLink href="/routing/b">Page B</NavLink>
        </nav>
      </Suspense>

      <Suspense fallback={null}>
        <RouterNav />
      </Suspense>

      <section className="surface flex flex-col gap-2 p-5">
        <Outlet />
      </section>
    </main>
  );
}

function RoutingNotFound() {
  return (
    <div data-testid="not-found" className="surface flex flex-col gap-2 p-5">
      <NotFoundPage />
    </div>
  );
}
