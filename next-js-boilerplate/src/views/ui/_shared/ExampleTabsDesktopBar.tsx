"use client";
import { useCallback } from "react";
import { cn } from "@/lib/cn";
import type { ExampleTabsDesktopBarProps } from "@/types/views/ui/ExampleTabsShared-types";

export function ExampleTabsDesktopBar({
  examples,
  currentValue,
  onChange,
  baseId,
}: ExampleTabsDesktopBarProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const ids = examples.map((ex) => ex.id);
      const idx = ids.indexOf(currentValue);
      if (idx === -1) return;

      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % ids.length;
      else if (e.key === "ArrowLeft")
        next = (idx - 1 + ids.length) % ids.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = ids.length - 1;
      else return;

      e.preventDefault();
      onChange(ids[next]);
    },
    [examples, currentValue, onChange],
  );

  return (
    <div
      role="tablist"
      aria-label="Demo sections"
      tabIndex={-1}
      className="bg-surface hidden w-full gap-0.5 rounded-lg p-0.5 md:flex"
      onKeyDown={handleKeyDown}
    >
      {examples.map((example) => {
        const isActive = example.id === currentValue;
        const tabId = `${baseId}-tab-${example.id}`;
        const panelId = `${baseId}-panel-${example.id}`;
        return (
          <button
            key={example.id}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(example.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-all",
              isActive
                ? "bg-surface-hover text-fg ring-border shadow-sm ring-1"
                : "text-muted hover:bg-surface-hover/50 hover:text-fg",
            )}
          >
            {example.title}
          </button>
        );
      })}
    </div>
  );
}
