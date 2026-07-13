"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useComponentVariant } from "@/hooks/useComponentVariant";
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
  variant?: "default" | "shiny" | "glass" | "neon" | "gradient";
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandContext() {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error("Command sub-components must be used within <Command>");
  }
  return ctx;
}

const variants: Record<"default" | "shiny" | "glass" | "neon" | "gradient", string> = {
  default: "border-border bg-bg text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 text-white border-transparent shadow-2xl",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export function Command({
  className,
  children,
  variant,
  ...props
}: CommandProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [search, setSearchRaw] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<ItemData[]>([]);

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
        variant: effectiveVariant,
      }}
    >
      <div
        className={cn(
          "border-border bg-bg flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-lg",
          className,
        )}
        {...props}
      >
        <div className="pointer-events-auto">{children}</div>
      </div>
    </CommandContext.Provider>
  );
}
