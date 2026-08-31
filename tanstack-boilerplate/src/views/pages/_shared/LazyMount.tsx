"use client";

import { useEffect, useRef, useState } from "react";
import type { LazyMountProps } from "@/types/pages/TemplateBrowser-types";

/**
 * Mounts children only once the wrapper approaches the viewport, so a
 * category grid of 100+ live template previews doesn't render eagerly.
 * Environments without IntersectionObserver mount immediately.
 */
export function LazyMount({ children, placeholder }: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    if (typeof IntersectionObserver === "undefined") {
      // No IO (jsdom, very old browsers): mount on the next task instead.
      const id = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(id);
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  return <div ref={ref}>{mounted ? children : placeholder}</div>;
}
