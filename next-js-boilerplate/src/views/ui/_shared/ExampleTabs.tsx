"use client";

import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { ExampleTabsDesktopBar } from "./ExampleTabsDesktopBar";
import { ExampleTabsMobileAccordion } from "./ExampleTabsMobileAccordion";
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

      <ExampleTabsDesktopBar
        examples={examples}
        currentValue={currentValue}
        onChange={handleChange}
      />

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

      <ExampleTabsMobileAccordion
        examples={examples}
        currentValue={currentValue}
        onChange={handleChange}
        accordionOpen={accordionOpen}
        onToggle={() => setAccordionOpen((prev) => !prev)}
      />
    </div>
  );
}
