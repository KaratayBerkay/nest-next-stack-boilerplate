"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface TabsContextValue {
  activeValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue: string;
}

export function Tabs({ defaultValue, className, ...props }: TabsProps) {
  const [activeValue, setActiveValue] = useState(defaultValue);

  const onValueChange = useCallback((value: string) => {
    setActiveValue(value);
  }, []);

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange }}>
      <div className={cn(className)} {...props} />
    </TabsContext.Provider>
  );
}

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

interface TabsTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value"
> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const { activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onValueChange(value)}
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:outline-none",
        "data-[state=active]:bg-bg data-[state=active]:text-fg data-[state=active]:shadow-sm",
        "data-[state=inactive]:text-muted data-[state=inactive]:hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "value"
> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { activeValue } = useTabsContext();
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      data-state="active"
      className={cn(
        "focus-visible:ring-brand mt-2 focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
