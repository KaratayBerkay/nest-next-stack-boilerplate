"use client";
import { forwardRef } from "react";
import { Root } from "@radix-ui/react-toggle";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ToggleProps } from "@/types/ui/Toggle-types";

const variants = {
  ...globalStyleVariants,
  default: "hover:bg-surface-hover hover:text-muted data-[state=on]:bg-surface data-[state=on]:text-fg",
  outline: "border border-border hover:bg-surface-hover data-[state=on]:bg-surface data-[state=on]:text-fg",
};

export const Toggle = forwardRef<
  React.ElementRef<typeof Root>,
  ToggleProps
>(({ className, variant, ...props }, ref) => {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <Root
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4",
        resolveVariant(variants, effectiveVariant),
        className,
      )}
      {...props}
    />
  );
});
Toggle.displayName = "Toggle";
