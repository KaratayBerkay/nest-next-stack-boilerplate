"use client";
import { forwardRef } from "react";
import { Root, Item } from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ToggleSize } from "@/types/ui/Toggle-types";

const itemVariants = {
  ...globalStyleVariants,
  default: "hover:bg-surface-hover data-[state=on]:bg-surface data-[state=on]:text-fg",
  outline: "border border-border hover:bg-surface-hover data-[state=on]:bg-surface data-[state=on]:text-fg",
};

const itemSizes: Record<ToggleSize, string> = {
  sm: "h-8 min-w-8 px-2 text-xs",
  md: "h-9 min-w-9 px-2.5 text-sm",
  lg: "h-10 min-w-10 px-3 text-base",
};

export const ToggleGroup = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn("inline-flex items-center divide-x divide-border rounded-md border border-border", className)}
    {...props}
  />
));
ToggleGroup.displayName = "ToggleGroup";

export const ToggleGroupItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item> & { variant?: string; size?: ToggleSize }
>(({ className, variant, size = "md", ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Item
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-none font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 first:rounded-l-md last:rounded-r-md [&_svg]:size-4",
        resolveVariant(itemVariants, effectiveVariant),
        itemSizes[size],
        className,
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem";
