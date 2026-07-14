"use client";

import { cn } from "@/lib/cn";
import { useCallback, useEffect, useRef } from "react";
import { useCommandContext } from "./command";

export function CommandList({
  className,
  children,
  onKeyDown,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { filteredItems, selectedIndex, setSelectedIndex } =
    useCommandContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        let next = selectedIndex + 1;
        while (next < filteredItems.length && filteredItems[next].disabled) {
          next++;
        }
        if (next < filteredItems.length) setSelectedIndex(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        let prev = selectedIndex - 1;
        while (prev >= 0 && filteredItems[prev].disabled) {
          prev--;
        }
        if (prev >= 0) setSelectedIndex(prev);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item && !item.disabled) item.onSelect?.();
      }
    },
    [filteredItems, selectedIndex, setSelectedIndex],
  );

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]');
    if (el) (el as HTMLElement).scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <div
      ref={listRef}
      className={cn("max-h-72 overflow-x-hidden overflow-y-auto", className)}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented) handleKeyDown(e);
      }}
      tabIndex={-1}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
}
