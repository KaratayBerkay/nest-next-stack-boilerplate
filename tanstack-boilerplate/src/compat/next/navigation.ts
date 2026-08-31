// Compat shim for `next/navigation`.
// Hooks are backed by TanStack Router state; `redirect`/`notFound` throw the
// TanStack control-flow objects, which work in components, `beforeLoad`,
// loaders, and server function bodies alike.
// Like next/navigation in a bare jsdom test (no app router context), the
// hooks degrade gracefully when no RouterProvider is mounted instead of
// throwing — components under unit test render with default values.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  notFound as tanstackNotFound,
  redirect as tanstackRedirect,
  useRouter as useTanstackRouter,
  type AnyRouter,
} from "@tanstack/react-router";

export class ReadonlyURLSearchParams extends URLSearchParams {
  override append(): void {
    throw readonlyError();
  }
  override delete(): void {
    throw readonlyError();
  }
  override set(): void {
    throw readonlyError();
  }
  override sort(): void {
    throw readonlyError();
  }
}

function readonlyError() {
  return new Error("ReadonlyURLSearchParams cannot be modified");
}

// The router's state store moved from `router.__store` (pre-1.170) to
// `router.stores.__store`, and the client-side atom's subscribe() returns
// `{ unsubscribe }` rather than a cleanup function (the SSR store has no
// subscribe at all — React never calls subscribe during SSR). Resolve the
// store wherever it lives and normalize both unsubscribe shapes.
interface RouterStoreLike {
  subscribe: (
    onChange: () => void,
  ) => (() => void) | { unsubscribe: () => void };
}

function subscribeToRouterState(
  router: AnyRouter | null,
  onStoreChange: () => void,
): () => void {
  const r = router as unknown as {
    stores?: { __store?: RouterStoreLike };
    __store?: RouterStoreLike;
  } | null;
  const store = r?.stores?.__store ?? r?.__store;
  if (!store || typeof store.subscribe !== "function") return () => {};
  const result = store.subscribe(onStoreChange);
  return typeof result === "function" ? result : () => result.unsubscribe();
}

function useOptionalRouter(): AnyRouter | null {
  const router = (
    useTanstackRouter as unknown as (opts?: {
      warn?: boolean;
    }) => AnyRouter | undefined
  )({ warn: false });
  return router ?? null;
}

/** Subscribe to a slice of router-location state, tolerating a missing router. */
function useLocationSlice<T>(
  select: (location: { pathname: string; searchStr: string }) => T,
  fallback: T,
): T {
  const router = useOptionalRouter();
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToRouterState(router, onStoreChange),
    [router],
  );
  const getSnapshot = useCallback(() => {
    if (!router) return fallback;
    return select(router.state.location);
  }, [router, select, fallback]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export interface AppRouterInstance {
  push: (href: string, options?: { scroll?: boolean }) => void;
  replace: (href: string, options?: { scroll?: boolean }) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string) => void;
}

export function useRouter(): AppRouterInstance {
  const router = useOptionalRouter();
  return useMemo(
    () => ({
      push: (href: string) => {
        router?.history.push(href);
      },
      replace: (href: string) => {
        router?.history.replace(href);
      },
      back: () => router?.history.back(),
      forward: () => router?.history.forward(),
      refresh: () => {
        void router?.invalidate();
      },
      prefetch: (href: string) => {
        void (
          router as {
            preloadRoute?: (opts: { href: string }) => Promise<unknown>;
          } | null
        )
          ?.preloadRoute?.({ href })
          ?.catch(() => {});
      },
    }),
    [router],
  );
}

export function usePathname(): string {
  return useLocationSlice((location) => location.pathname, "/");
}

export function useSearchParams(): ReadonlyURLSearchParams {
  const searchStr = useLocationSlice((location) => location.searchStr, "");
  return useMemo(() => new ReadonlyURLSearchParams(searchStr), [searchStr]);
}

const EMPTY_PARAMS: Record<string, string> = {};

export function useParams<
  T extends Record<string, string | Array<string>> = Record<
    string,
    string | Array<string>
  >,
>(): T {
  const router = useOptionalRouter();
  const cache = useMemo(
    () => ({ state: null as unknown, params: EMPTY_PARAMS }),
    [],
  );
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToRouterState(router, onStoreChange),
    [router],
  );
  const getSnapshot = useCallback(() => {
    if (!router) return EMPTY_PARAMS;
    const state = router.state;
    if (cache.state !== state) {
      cache.state = state;
      cache.params = state.matches.reduce<Record<string, string>>(
        (acc, match) => Object.assign(acc, match.params),
        {},
      );
    }
    return cache.params;
  }, [router, cache]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot) as T;
}

export enum RedirectType {
  push = "push",
  replace = "replace",
}

export function redirect(url: string, type?: RedirectType): never {
  throw tanstackRedirect({
    href: url,
    replace: type !== RedirectType.push,
  });
}

export function permanentRedirect(url: string, _type?: RedirectType): never {
  throw tanstackRedirect({ href: url, statusCode: 308 });
}

export function notFound(): never {
  throw tanstackNotFound();
}

/** Next.js exposes this for edge cases; here navigation is always "app router". */
export function useServerInsertedHTML(_callback: () => React.ReactNode): void {
  // SSR-inserted style hoisting is handled by Vite/Start; intentionally a no-op.
}
