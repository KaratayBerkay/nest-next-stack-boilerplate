"use client";

import { cn } from "@/lib/cn";
import { menuItemStyles } from "@/components/ui/menu-item-styles";
import { useEffect, useRef } from "react";
import { useSelect } from "./select";
import type { SelectItemProps } from "@/types/ui/Select-types";

export function SelectItem({
  className,
  value: itemValue,
  disabled,
  children,
  onClick,
  ...props
}: SelectItemProps) {
  const { value, onValueChange, setOpen, triggerRef, labelMap } = useSelect();
  const itemRef = useRef<HTMLButtonElement>(null);
  const isSelected = value === itemValue;

  useEffect(() => {
    const label =
      typeof children === "string"
        ? children
        : (itemRef.current?.textContent ?? "");
    const map = labelMap.current;
    map.set(itemValue, label);
    return () => {
      map.delete(itemValue);
    };
  }, [itemValue, children, labelMap]);

  const handleClick = () => {
    if (disabled) return;
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
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        menuItemStyles,
        "w-full focus-visible:bg-surface-hover",
        isSelected && "bg-surface-hover text-brand",
        !isSelected && "text-fg",
        disabled && "cursor-not-allowed opacity-50",
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
