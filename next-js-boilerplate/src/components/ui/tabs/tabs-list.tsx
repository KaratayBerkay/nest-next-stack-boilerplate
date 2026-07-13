"use client";

import { cn } from "@/lib/cn";
import { useRef } from "react";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { TabsListProps } from "@/types/ui/TabsList-types";

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
  variant,
  ...props
}: TabsListProps) {
  const effectiveVariant = useComponentVariant(variant);
  const listRef = useRef<HTMLDivElement>(null);

  const variants = {
    default: "bg-surface inline-flex items-center gap-1 rounded-lg p-1",
    shiny: "bg-gradient-to-br from-slate-700 to-slate-900 inline-flex items-center gap-1 rounded-xl p-1 shadow-lg",
    glass: "bg-white/10 backdrop-blur-md inline-flex items-center gap-1 rounded-xl p-1 border border-white/10",
    neon: "bg-slate-950/80 border border-cyan-500/30 inline-flex items-center gap-1 rounded-xl p-1 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    gradient: "bg-gradient-to-br from-slate-900 to-slate-950 inline-flex items-center gap-1 rounded-xl p-1 shadow-2xl",
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      tabIndex={-1}
      onKeyDown={(e) => handleTabsKeyDown(e, listRef)}
      className={cn(
        variants[effectiveVariant as keyof typeof variants],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
