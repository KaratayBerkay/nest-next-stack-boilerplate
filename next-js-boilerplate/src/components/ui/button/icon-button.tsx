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
        "focus-visible:ring-brand inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        resolveVariant(variants, effectiveVariant),
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        icon
      )}
    </button>
  );
}
