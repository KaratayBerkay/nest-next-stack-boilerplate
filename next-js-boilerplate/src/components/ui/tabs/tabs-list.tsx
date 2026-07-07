"use client";

import { cn } from "@/lib/cn";
import { useRef } from "react";

export function TabsList({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
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
