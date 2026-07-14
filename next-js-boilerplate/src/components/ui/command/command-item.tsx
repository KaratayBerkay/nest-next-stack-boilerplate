"use client";

import { cn } from "@/lib/cn";
import { useEffect } from "react";
import { useCommandContext } from "./command";
import type { CommandItemProps } from "@/types/ui/CommandItem-types";

export function CommandItem({
  value,
  onSelect,
  disabled = false,
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}: CommandItemProps) {
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
      // No roving-tabindex manager exists yet (focus normally stays on CommandInput while
      // typing), so make each option independently reachable/activatable via keyboard too.
      tabIndex={disabled ? -1 : 0}
      onClick={(e) => {
        onClick?.(e);
        if (!disabled && !e.defaultPrevented) onSelect?.();
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (disabled || e.defaultPrevented) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      {...props}
    >
      {renderContent()}
    </div>
  );
}
