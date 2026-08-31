// Regression coverage for the next/navigation compat hooks INSIDE a real
// RouterProvider. The hooks' client-side store subscription is only exercised
// after hydration in a browser — SSR never calls useSyncExternalStore's
// subscribe, and the no-router fallback path skips it entirely — so a bug in
// the subscription (like reading the pre-1.170 `router.__store` location,
// which crashed every page with "can't access property 'subscribe',
// __store is undefined") is invisible to both SSR smoke tests and
// provider-less unit tests. These tests mount the hooks under a live router
// and assert they update on navigation.
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type AnyRouter,
} from "@tanstack/react-router";
import { useParams, usePathname, useSearchParams } from "next/navigation";

function Probe() {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  return (
    <div>
      <span data-testid="pathname">{pathname}</span>
      <span data-testid="params">{JSON.stringify(params)}</span>
      <span data-testid="search">{searchParams.toString()}</span>
    </div>
  );
}

// AnyRouter: the ad-hoc test routes aren't part of the app's registered
// route tree, so the strictly-typed navigate() would reject their paths.
function makeRouter(initialEntry: string): AnyRouter {
  const rootRoute = createRootRoute({ component: Probe });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const itemRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/items/$id",
  });
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute, itemRoute]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
}

describe("next/navigation hooks under a live RouterProvider", () => {
  it("mounts without crashing and reports the current location", async () => {
    const router = makeRouter("/items/7?tab=info");
    render(<RouterProvider router={router} />);

    await waitFor(() =>
      expect(screen.getByTestId("pathname").textContent).toBe("/items/7"),
    );
    expect(screen.getByTestId("params").textContent).toBe('{"id":"7"}');
    expect(screen.getByTestId("search").textContent).toBe("tab=info");
  });

  it("updates pathname/params/search when the router navigates", async () => {
    const router = makeRouter("/");
    render(<RouterProvider router={router} />);
    await waitFor(() =>
      expect(screen.getByTestId("pathname").textContent).toBe("/"),
    );

    // navigate()'s types resolve against the app's globally-registered route
    // tree (routeTree.gen.ts augments Register), which these ad-hoc test
    // routes are not part of — go through an untyped signature.
    await (router.navigate as (opts: unknown) => Promise<void>)({
      to: "/items/$id",
      params: { id: "42" },
      search: { q: "hello" },
    });

    await waitFor(() =>
      expect(screen.getByTestId("pathname").textContent).toBe("/items/42"),
    );
    expect(screen.getByTestId("params").textContent).toBe('{"id":"42"}');
    expect(screen.getByTestId("search").textContent).toBe("q=hello");
  });
});
