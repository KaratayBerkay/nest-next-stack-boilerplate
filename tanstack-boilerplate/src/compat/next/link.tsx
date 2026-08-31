"use client";
// Compat shim for `next/link`.
// Renders a real <a> and routes same-origin clicks through the TanStack
// Router history, so any href shape the app produces (path + query + hash
// strings, UrlObjects) navigates client-side without needing to be expressed
// as a typed `to` target.

import { forwardRef } from "react";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";

export type Url =
  | string
  | {
      pathname?: string | null;
      query?:
        | string
        | Record<string, string | number | boolean | null | undefined>
        | null;
      hash?: string | null;
      search?: string | null;
    };

export interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  href: Url;
  as?: Url;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean | null;
  locale?: string | false;
  legacyBehavior?: boolean;
  onNavigate?: (event: { preventDefault: () => void }) => void;
  children?: ReactNode;
}

export function formatUrl(href: Url): string {
  if (typeof href === "string") return href;
  const pathname = href.pathname ?? "";
  let search = "";
  if (href.search) {
    search = href.search.startsWith("?") ? href.search : `?${href.search}`;
  } else if (href.query) {
    if (typeof href.query === "string") {
      search = href.query ? `?${href.query}` : "";
    } else {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(href.query)) {
        if (value === null || value === undefined) continue;
        params.set(key, String(value));
      }
      const str = params.toString();
      search = str ? `?${str}` : "";
    }
  }
  const hash = href.hash
    ? href.hash.startsWith("#")
      ? href.hash
      : `#${href.hash}`
    : "";
  return `${pathname}${search}${hash}`;
}

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

const EXTERNAL_RE = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    as: _as,
    replace = false,
    scroll: _scroll,
    shallow: _shallow,
    passHref: _passHref,
    prefetch: _prefetch,
    locale: _locale,
    legacyBehavior: _legacyBehavior,
    onNavigate,
    onClick,
    target,
    children,
    ...rest
  },
  ref,
) {
  const router = useRouter();
  const url = formatUrl(href);
  const isExternal = EXTERNAL_RE.test(url);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isExternal || url.startsWith("#")) return;
    if (target && target !== "_self") return;
    if (isModifiedEvent(event)) return;

    if (onNavigate) {
      let prevented = false;
      onNavigate({ preventDefault: () => (prevented = true) });
      if (prevented) {
        event.preventDefault();
        return;
      }
    }

    event.preventDefault();
    if (replace) {
      router.history.replace(url);
    } else {
      router.history.push(url);
    }
  };

  return (
    <a ref={ref} href={url} target={target} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
});

export default Link;
