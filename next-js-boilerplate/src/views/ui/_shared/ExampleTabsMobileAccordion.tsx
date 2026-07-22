"use client";
import { cn } from "@/lib/cn";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

export function ExampleTabsMobileAccordion({
  examples,
  currentValue,
  onChange,
  accordionOpen,
  onToggle,
}: {
  examples: UIExample[];
  currentValue: string;
  onChange: (value: string) => void;
  accordionOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "border-border flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
          accordionOpen
            ? "bg-surface-hover text-fg"
            : "bg-surface text-muted hover:bg-surface-hover hover:text-fg",
        )}
      >
        {examples.find((e) => e.id === currentValue)?.title ?? "Select"}
        <svg
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            accordionOpen && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {accordionOpen && (
        <div className="border-border bg-surface flex flex-col gap-1 rounded-lg border p-1">
          {examples.map((example) => {
            const isActive = example.id === currentValue;
            return (
              <button
                key={example.id}
                type="button"
                onClick={() => {
                  onChange(isActive ? "" : example.id);
                  onToggle();
                }}
                className={cn(
                  "rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-hover text-fg"
                    : "text-muted hover:bg-surface-hover/50 hover:text-fg",
                )}
              >
                {example.title}
              </button>
            );
          })}
        </div>
      )}
      {examples.map((example) =>
        example.id === currentValue ? (
          <div key={example.id} className="space-y-4 pt-2">
            <p className="text-muted text-sm italic">{example.description}</p>
            <div>{example.render()}</div>
          </div>
        ) : null,
      )}
    </div>
  );
}
