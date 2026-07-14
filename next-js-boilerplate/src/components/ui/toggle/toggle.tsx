"use client";
import { forwardRef } from "react";
import { Root } from "@radix-ui/react-toggle";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ToggleProps, ToggleSize } from "@/types/ui/Toggle-types";

const variants = {
  ...globalStyleVariants,
  default: "hover:bg-surface-hover hover:text-muted data-[state=on]:bg-brand/10 data-[state=on]:text-brand",
  outline: "border border-border hover:bg-surface-hover data-[state=on]:bg-brand/10 data-[state=on]:text-brand data-[state=on]:border-brand/30",
};

const sizes: Record<ToggleSize, string> = {
  sm: "h-8 min-w-8 px-2 text-xs",
  md: "h-9 min-w-9 px-2.5 text-sm",
  lg: "h-10 min-w-10 px-3 text-base",
};

export const Toggle = forwardRef<
  React.ElementRef<typeof Root>,
  ToggleProps
>(({ className, variant, size = "md", ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Root
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4",
        resolveVariant(variants, effectiveVariant),
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});
Toggle.displayName = "Toggle";
