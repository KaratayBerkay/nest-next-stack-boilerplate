"use client";
// Compat shim for `next/script`.
// `beforeInteractive` scripts belong in the route `head()` (the root route
// already registers /scripts/theme-init.js there); this component covers the
// `afterInteractive`/`lazyOnload` cases by injecting the script post-mount.
// Injection is deduplicated by id/src/content, so effect re-runs are no-ops —
// matching next/script, which keeps a script alive once loaded.

import { useEffect } from "react";
import type { ScriptHTMLAttributes } from "react";

export interface ScriptProps extends Omit<
  ScriptHTMLAttributes<HTMLScriptElement>,
  "onLoad" | "onError"
> {
  strategy?: "afterInteractive" | "lazyOnload" | "beforeInteractive" | "worker";
  onLoad?: (event: Event) => void;
  onReady?: () => void;
  onError?: (event: Event) => void;
}

const injected = new Set<string>();

export default function Script({
  src,
  strategy = "afterInteractive",
  onLoad,
  onReady,
  onError,
  children,
  dangerouslySetInnerHTML,
  id,
  ...rest
}: ScriptProps) {
  const inlineContent =
    dangerouslySetInnerHTML?.__html !== undefined
      ? String(dangerouslySetInnerHTML.__html)
      : typeof children === "string"
        ? children
        : "";
  const dedupeKey = id ?? src ?? inlineContent;
  const restJson = JSON.stringify(rest);

  useEffect(() => {
    if (!dedupeKey) return;
    if (injected.has(dedupeKey)) {
      onReady?.();
      return;
    }
    injected.add(dedupeKey);

    const element = document.createElement("script");
    if (src) element.src = src;
    if (id) element.id = id;
    if (inlineContent) element.textContent = inlineContent;
    const attrs = JSON.parse(restJson) as Record<string, unknown>;
    for (const [attr, value] of Object.entries(attrs)) {
      if (value === undefined || value === null) continue;
      if (typeof value === "boolean") {
        if (value) element.setAttribute(attr, "");
      } else if (typeof value === "string" || typeof value === "number") {
        element.setAttribute(attr, String(value));
      }
    }
    if (onLoad) element.addEventListener("load", onLoad);
    if (onError) element.addEventListener("error", onError);
    if (onReady) element.addEventListener("load", () => onReady());

    const append = () => {
      document.body.appendChild(element);
    };

    if (strategy === "lazyOnload") {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(append);
      } else {
        window.setTimeout(append, 1);
      }
    } else {
      append();
    }
  }, [
    dedupeKey,
    src,
    id,
    inlineContent,
    restJson,
    strategy,
    onLoad,
    onReady,
    onError,
  ]);

  return null;
}
