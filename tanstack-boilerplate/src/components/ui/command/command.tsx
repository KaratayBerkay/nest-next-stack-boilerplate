"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { createContext, useContext, useState, useCallback } from "react";
import type { CommandProps } from "@/types/ui/Command-types";

interface ItemData {
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
}

interface CommandContextValue {
  search: string;
  setSearch: (value: string) => void;
  filteredItems: ItemData[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  registerItem: (item: ItemData) => () => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandContext() {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error("Command sub-components must be used within <Command>");
  }
  return ctx;
}

const commandVariants = {
  ...globalStyleVariants,
  default: "border-border bg-bg",
};

export function Command({
  className,
  variant,
  children,
  ...props
}: CommandProps) {
  const [search, setSearchRaw] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<ItemData[]>([]);
  const effectiveVariant = useComponentVariant(variant);

  const handleSetSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setSelectedIndex(0);
  }, []);

  const registerItem = useCallback((item: ItemData) => {
    setItems((prev) => [...prev, item]);
    setSelectedIndex(0);
    return () => {
      setItems((prev) => prev.filter((i) => i.value !== item.value));
      setSelectedIndex(0);
    };
  }, []);

  const filteredItems = (() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter((i) => i.value.toLowerCase().includes(lower));
  })();

  return (
    <CommandContext.Provider
      value={{
        search,
        setSearch: handleSetSearch,
        filteredItems,
        selectedIndex,
        setSelectedIndex,
        registerItem,
      }}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-lg",
          resolveVariant(commandVariants, effectiveVariant),
          className,
        )}
        {...props}
      >
        <div className="pointer-events-auto">{children}</div>
      </div>
    </CommandContext.Provider>
  );
}
