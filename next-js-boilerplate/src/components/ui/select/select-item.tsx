"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef } from "react";
import { useSelect } from "./select";
import type { SelectItemProps } from "@/types/ui/Select-types";

export function SelectItem({
  className,
  value: itemValue,
  children,
  onClick,
  ...props
}: SelectItemProps) {
  const { value, onValueChange, setOpen, triggerRef, labelMap } = useSelect();
  const itemRef = useRef<HTMLButtonElement>(null);
  const isSelected = value === itemValue;
  const text = typeof children === "string" ? children : "";

  useEffect(() => {
    const map = labelMap.current;
    map.set(itemValue, text);
    return () => {
      map.delete(itemValue);
    };
  }, [itemValue, text, labelMap]);

  const handleClick = () => {
    onValueChange(itemValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <button
      ref={itemRef}
      type="button"
      role="option"
      aria-selected={isSelected}
      className={cn(
        "focus-visible:bg-surface-hover relative flex w-full cursor-default items-center rounded px-2 py-1.5 text-sm transition-colors outline-none select-none focus-visible:outline-none",
        isSelected && "bg-surface-hover text-brand",
        !isSelected && "text-fg",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) handleClick();
      }}
      tabIndex={-1}
      {...props}
    >
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 shrink-0"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      <span className={cn(!isSelected && "ml-6")}>{children}</span>
    </button>
  );
}
