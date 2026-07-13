"use client";
import { forwardRef } from "react";
import { Root, Item } from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";

const itemVariants = {
  ...globalStyleVariants,
  default: "hover:bg-surface-hover data-[state=on]:bg-surface data-[state=on]:text-fg",
  outline: "border border-border hover:bg-surface-hover data-[state=on]:bg-surface data-[state=on]:text-fg",
};

export const ToggleGroup = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
ToggleGroup.displayName = "ToggleGroup";

export const ToggleGroupItem = forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item> & { variant?: string }
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Item
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4",
        resolveVariant(itemVariants, effectiveVariant),
        className,
      )}
      {...props}
    />
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem";
