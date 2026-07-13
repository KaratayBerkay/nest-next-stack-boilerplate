"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { CheckboxGroupProps } from "@/types/ui/Checkbox-types";

export function CheckboxGroup({
  values,
  onValueChange,
  items,
  label,
  showSelectAll = false,
  className,
  direction = "vertical",
  fontSize,
  fontWeight,
  fontFamily,
}: CheckboxGroupProps) {
  const autoId = useId();
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  const allSelected = items.every((item) => values.includes(item.value));
  const someSelected = items.some((item) => values.includes(item.value));

  const handleToggle = (itemValue: string) => {
    if (values.includes(itemValue)) {
      onValueChange(values.filter((v) => v !== itemValue));
    } else {
      onValueChange([...values, itemValue]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onValueChange([]);
    } else {
      onValueChange(items.map((item) => item.value));
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <span className={cn("text-muted text-xs font-medium", fontSizeClass, fontWeightClass, fontFamilyClass)}>{label}</span>}
      <div
        className={cn(
          "flex gap-3",
          direction === "vertical" ? "flex-col" : "flex-row flex-wrap",
        )}
      >
        {showSelectAll && items.length > 0 && (
          <label
            key="select-all"
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected;
              }}
              onChange={handleSelectAll}
              className={cn(
                "peer border-border bg-bg checked:border-brand checked:bg-brand focus-visible:ring-brand size-4 shrink-0 cursor-pointer appearance-none rounded border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
            <span className="text-muted text-xs font-medium">Select all</span>
          </label>
        )}
        {items.map((item) => {
          const id = `${autoId}-${item.value}`;
          return (
            <label
              key={item.value}
              htmlFor={id}
              className={cn(
                "flex cursor-pointer items-center gap-2 text-sm",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="checkbox"
                id={id}
                checked={values.includes(item.value)}
                disabled={item.disabled}
                onChange={() => handleToggle(item.value)}
                className={cn(
                  "peer border-border bg-bg checked:border-brand checked:bg-brand focus-visible:ring-brand size-4 shrink-0 cursor-pointer appearance-none rounded border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
              <span className="text-muted peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                {item.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
