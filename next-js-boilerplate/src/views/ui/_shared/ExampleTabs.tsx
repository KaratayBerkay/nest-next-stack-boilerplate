"use client";

import {
  useId,
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { IconCode, IconEye } from "@tabler/icons-react";
import { ExampleTabsDesktopBar } from "./ExampleTabsDesktopBar";
import { ExampleTabsMobileAccordion } from "./ExampleTabsMobileAccordion";
import { CodeBlock } from "./CodeBlock";
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

function ExamplePanel({
  example,
  baseId,
  viewMode,
  onToggleView,
}: {
  example: UIExample;
  baseId: string;
  viewMode: "preview" | "code";
  onToggleView: () => void;
}) {
  return (
    <div
      id={`${baseId}-panel-${example.id}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${example.id}`}
      className="space-y-4"
    >
      <p className="text-muted text-sm italic">{example.description}</p>
      {example.code && (
        <button
          type="button"
          onClick={onToggleView}
          className="text-muted hover:text-fg flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          {viewMode === "preview" ? (
            <>
              <IconCode size={14} /> View Code
            </>
          ) : (
            <>
              <IconEye size={14} /> Preview
            </>
          )}
        </button>
      )}
      {viewMode === "preview" ? (
        <div>{example.render()}</div>
      ) : example.code ? (
        <CodeBlock code={example.code} />
      ) : null}
    </div>
  );
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
  const baseId = useId();

  const validIds = examples.map((e) => e.id);
  const defaultTab =
    initialTab && validIds.includes(initialTab)
      ? initialTab
      : (examples[0]?.id ?? "");

  const [internalValue, setInternalValue] = useState(defaultTab);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [viewModes, setViewModes] = useState<
    Record<string, "preview" | "code">
  >({});

  const toggleView = useCallback((id: string) => {
    setViewModes((prev) => ({
      ...prev,
      [id]: prev[id] === "code" ? "preview" : "code",
    }));
  }, []);

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
        baseId={baseId}
      />

      <div className="hidden md:block">
        {examples.map((example) =>
          example.id === currentValue ? (
            <ExamplePanel
              key={example.id}
              example={example}
              baseId={baseId}
              viewMode={viewModes[example.id] ?? "preview"}
              onToggleView={() => toggleView(example.id)}
            />
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
