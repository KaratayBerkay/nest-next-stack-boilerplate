"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import { Checkbox } from "./checkbox";
import { IndeterminateCheckbox } from "./indeterminate-checkbox";
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
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

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
      {label && <span className={cn("text-muted text-xs font-medium", fonts)}>{label}</span>}
      <div
        className={cn(
          "flex gap-3",
          direction === "vertical" ? "flex-col" : "flex-row flex-wrap",
        )}
      >
        {showSelectAll && items.length > 0 && (
          <IndeterminateCheckbox
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={handleSelectAll}
            label="Select all"
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontFamily={fontFamily}
          />
        )}
        {items.map((item) => (
          <Checkbox
            key={item.value}
            id={`${autoId}-${item.value}`}
            checked={values.includes(item.value)}
            disabled={item.disabled}
            onChange={() => handleToggle(item.value)}
            label={item.label}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontFamily={fontFamily}
          />
        ))}
      </div>
    </div>
  );
}
