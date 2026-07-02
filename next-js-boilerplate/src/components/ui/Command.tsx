"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
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

function useCommandContext() {
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

export function CommandInput({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  const { search, setSearch } = useCommandContext();

  return (
    <div className="border-border flex items-center border-b px-3">
      <svg
        className="text-muted mr-2 size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        className={cn(
          "placeholder:text-muted flex h-11 w-full bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        {...props}
      />
    </div>
  );
}

export function CommandList({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { filteredItems, selectedIndex, setSelectedIndex } =
    useCommandContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        let next = selectedIndex + 1;
        while (next < filteredItems.length && filteredItems[next].disabled) {
          next++;
        }
        if (next < filteredItems.length) setSelectedIndex(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        let prev = selectedIndex - 1;
        while (prev >= 0 && filteredItems[prev].disabled) {
          prev--;
        }
        if (prev >= 0) setSelectedIndex(prev);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item && !item.disabled) item.onSelect?.();
      }
    },
    [filteredItems, selectedIndex, setSelectedIndex],
  );

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]');
    if (el) (el as HTMLElement).scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <div
      ref={listRef}
      className={cn("max-h-72 overflow-x-hidden overflow-y-auto", className)}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
}

export function CommandEmpty({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { filteredItems } = useCommandContext();
  if (filteredItems.length > 0) return null;

  return (
    <div
      className={cn("text-muted py-6 text-center text-sm", className)}
      {...props}
    >
      {children ?? "No results found."}
    </div>
  );
}

export function CommandGroup({
  heading,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { heading?: string }) {
  return (
    <div
      className={cn("overflow-hidden p-1", className)}
      role="group"
      {...props}
    >
      {heading && (
        <div className="text-muted px-2 py-1.5 text-xs font-medium">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

export function CommandItem({
  value,
  onSelect,
  disabled = false,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  value: string;
  onSelect?: () => void;
  disabled?: boolean;
}) {
  const { search, filteredItems, selectedIndex, registerItem } =
    useCommandContext();

  useEffect(() => {
    const unregister = registerItem({ value, onSelect, disabled });
    return unregister;
  }, [value, onSelect, disabled, registerItem]);

  const index = filteredItems.findIndex((i) => i.value === value);
  const isVisible = index !== -1;
  const isSelected = index === selectedIndex;

  if (!isVisible) return null;

  const renderContent = () => {
    if (typeof children !== "string" || !search) return children;
    const text = children;
    const lowerSearch = search.toLowerCase();
    const lowerText = text.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerSearch);
    if (matchIndex === -1) return children;

    return (
      <>
        {text.slice(0, matchIndex)}
        <mark className="text-brand bg-transparent underline underline-offset-2">
          {text.slice(matchIndex, matchIndex + search.length)}
        </mark>
        {text.slice(matchIndex + search.length)}
      </>
    );
  };

  return (
    <div
      className={cn(
        "relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none",
        isSelected && "bg-surface",
        !isSelected && "hover:bg-surface-hover",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected}
      data-disabled={disabled}
      data-command-item
      onClick={() => {
        if (!disabled) onSelect?.();
      }}
      {...props}
    >
      {renderContent()}
    </div>
  );
}
