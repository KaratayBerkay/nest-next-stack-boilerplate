"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

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

export function Command({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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
      }}
    >
      <div
        className={cn(
          "border-border bg-bg flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-lg",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}
