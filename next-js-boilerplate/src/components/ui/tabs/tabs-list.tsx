"use client";

import { cn } from "@/lib/cn";
import { useRef } from "react";

function handleTabsKeyDown(
  e: React.KeyboardEvent,
  listRef: React.RefObject<HTMLDivElement | null>,
) {
  const tabs =
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  if (!tabs?.length) return;

  const currentIndex = Array.from(tabs).findIndex(
    (tab) => tab === document.activeElement,
  );
  if (currentIndex === -1) return;

  let nextIndex: number;

  if (e.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % tabs.length;
  } else if (e.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else {
    return;
  }

  e.preventDefault();
  tabs[nextIndex]?.focus();
  tabs[nextIndex]?.click();
}

export function TabsList({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const listRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={listRef}
      role="tablist"
      // Children already implement roving tabindex (TabsTrigger sets tabIndex 0/-1 per tab),
      // so the tablist container itself stays out of the Tab order.
      tabIndex={-1}
      onKeyDown={(e) => handleTabsKeyDown(e, listRef)}
      className={cn(
        "bg-surface inline-flex items-center gap-1 rounded-lg p-1",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
