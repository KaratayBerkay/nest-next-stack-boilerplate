"use client";
// Compat shim for `next/dynamic`.
// `ssr: false` renders nothing until after mount (the Next behavior client
// components rely on for browser-only libraries), otherwise it is React.lazy
// with a Suspense boundary and optional `loading` component.

import {
  Component as ReactComponent,
  Suspense,
  lazy,
  useSyncExternalStore,
} from "react";
import type { ComponentType, ReactNode } from "react";

type LoaderResult<P> = { default: ComponentType<P> } | ComponentType<P>;

export interface DynamicOptions<P = object> {
  ssr?: boolean;
  loading?: ComponentType<{
    error?: Error | null;
    isLoading?: boolean;
    pastDelay?: boolean;
  }> | null;
  loader?: () => Promise<LoaderResult<P>>;
}

const emptySubscribe = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function dynamic<P extends object>(
  loader: (() => Promise<LoaderResult<P>>) | DynamicOptions<P>,
  options?: DynamicOptions<P>,
): ComponentType<P> {
  const resolvedLoader =
    typeof loader === "function" ? loader : (loader.loader ?? null);
  const resolvedOptions = typeof loader === "function" ? options : loader;

  if (!resolvedLoader) {
    throw new Error("next/dynamic compat: a loader function is required");
  }

  const LazyComponent = lazy(async () => {
    const mod = await resolvedLoader();
    return typeof mod === "object" && mod !== null && "default" in mod
      ? (mod as { default: ComponentType<P> })
      : { default: mod as ComponentType<P> };
  });

  const Loading = resolvedOptions?.loading ?? null;
  const fallback: ReactNode = Loading ? (
    <Loading isLoading pastDelay error={null} />
  ) : null;
  const ssr = resolvedOptions?.ssr ?? true;

  function DynamicComponent(props: P) {
    const mounted = useMounted();
    if (!ssr && !mounted) return fallback;
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  DynamicComponent.displayName = "DynamicComponent";
  return DynamicComponent;
}

/** Class-only escape hatch some codebases use; kept for API parity. */
export class NoSSR extends ReactComponent<{ children?: ReactNode }> {
  render() {
    return typeof window === "undefined" ? null : this.props.children;
  }
}
