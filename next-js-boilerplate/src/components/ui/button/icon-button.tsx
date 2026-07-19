"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { variants, sizes } from "@/components/ui/button-styles";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { Spinner } from "@/components/ui/Spinner";
import type { IconButtonProps } from "@/types/ui/IconButton-types";

export function IconButton({
  icon,
  label,
  variant,
  size = "icon",
  className,
  loading,
  disabled,
  ...props
}: IconButtonProps) {
  const effectiveVariant = useComponentVariant(variant);
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "ring-offset-bg focus-visible:ring-brand inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        resolveVariant(variants, effectiveVariant),
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
    </button>
  );
}
