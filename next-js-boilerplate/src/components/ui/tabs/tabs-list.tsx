"use client";

import { cn } from "@/lib/cn";
import { useRef } from "react";
import { useTabsContext } from "./tabs";
import type { TabsListProps } from "@/types/ui/TabsList-types";

function handleTabsKeyDown(
  e: React.KeyboardEvent,
  listRef: React.RefObject<HTMLDivElement | null>,
  orientation: "horizontal" | "vertical",
) {
  const tabs =
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  if (!tabs?.length) return;

  const currentIndex = Array.from(tabs).findIndex(
    (tab) => tab === document.activeElement,
  );
  if (currentIndex === -1) return;

  let nextIndex: number;

  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

  if (e.key === nextKey) {
    nextIndex = (currentIndex + 1) % tabs.length;
  } else if (e.key === prevKey) {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  } else if (e.key === "Home") {
    nextIndex = 0;
  } else if (e.key === "End") {
    nextIndex = tabs.length - 1;
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
}: TabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { orientation } = useTabsContext();

  return (
    <div
      ref={listRef}
      role="tablist"
      tabIndex={-1}
      aria-orientation={orientation}
      onKeyDown={(e) => handleTabsKeyDown(e, listRef, orientation)}
      className={cn(
        "bg-surface inline-flex items-center gap-1 rounded-lg p-1",
        orientation === "vertical" && "flex-col",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
