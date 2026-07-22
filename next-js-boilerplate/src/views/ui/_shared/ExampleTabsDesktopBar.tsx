"use client";
import { cn } from "@/lib/cn";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

export function ExampleTabsDesktopBar({
  examples,
  currentValue,
  onChange,
}: {
  examples: UIExample[];
  currentValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="bg-surface hidden w-full gap-0.5 rounded-lg p-0.5 md:flex">
      {examples.map((example) => {
        const isActive = example.id === currentValue;
        return (
          <button
            key={example.id}
            type="button"
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
