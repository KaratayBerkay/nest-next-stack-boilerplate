"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib";
import type { NavLinkProps } from "@/types/layout/NavLink-types";

/**
 * A `<Link>` that knows whether it points at the current route.
 *
 * `usePathname()` makes it a client component; when the path matches `href` it
 * marks itself active (`aria-current="page"` + emphasis). This is the building
 * block of an app nav and demonstrates `<Link>` client-side navigation paired
 * with the `usePathname` hook.
 */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "underline",
        active ? "text-brand font-semibold" : "text-muted",
      )}
    >
      {children}
    </Link>
  );
}
