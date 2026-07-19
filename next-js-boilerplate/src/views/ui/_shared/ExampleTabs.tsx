"use client";

import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { ExampleTabsProps, UIExample } from "@/types/ui/ExampleTabs-types";

function handleChangeModuleLevel(
  newValue: string,
  isControlled: boolean,
  setInternalValue: Dispatch<SetStateAction<string>>,
  onControlledChange: ((value: string) => void) | undefined,
  examples: UIExample[],
  router: ReturnType<typeof useRouter>,
  pathname: string,
) {
  const next = newValue || examples[0]?.id || "";
  if (!isControlled) setInternalValue(next);
  onControlledChange?.(next);

  const qs = next !== examples[0]?.id ? `?tab=${next}` : "";
  router.replace(qs ? `${pathname}${qs}` : pathname, { scroll: false });
}

export function ExampleTabs({
  title,
  intro,
  examples,
  initialTab,
  value: controlledValue,
  onValueChange: onControlledChange,
}: ExampleTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const validIds = examples.map((e) => e.id);
  const defaultTab =
    initialTab && validIds.includes(initialTab)
      ? initialTab
      : (examples[0]?.id ?? "");

  const [internalValue, setInternalValue] = useState(defaultTab);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const [accordionOpen, setAccordionOpen] = useState(false);

  const handleChange = useCallback(
    (newValue: string) =>
      handleChangeModuleLevel(
        newValue,
        isControlled,
        setInternalValue,
        onControlledChange,
        examples,
        router,
        pathname,
      ),
    [isControlled, onControlledChange, router, pathname, examples],
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted text-sm">{intro}</p>
      </div>

      <div className="bg-surface hidden w-full gap-0.5 rounded-lg p-0.5 md:flex">
        {examples.map((example) => {
          const isActive = example.id === currentValue;
          return (
            <button
              key={example.id}
              type="button"
              onClick={() => handleChange(example.id)}
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

      <div className="hidden md:block">
        {examples.map((example) =>
          example.id === currentValue ? (
            <div key={example.id} className="space-y-4">
              <p className="text-muted text-sm italic">{example.description}</p>
              <div>{example.render()}</div>
            </div>
          ) : null,
        )}
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setAccordionOpen(!accordionOpen)}
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
                    handleChange(isActive ? "" : example.id);
                    setAccordionOpen(false);
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
    </div>
  );
}
