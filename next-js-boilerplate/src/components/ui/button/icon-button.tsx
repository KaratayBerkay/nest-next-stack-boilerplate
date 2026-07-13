import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { variants, sizes } from "@/components/ui/button-styles";
import { useComponentVariant } from "@/hooks/useComponentVariant";
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
        "focus-visible:ring-brand inline-flex items-center justify-center rounded font-medium transition-all focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
        resolveVariant(variants, effectiveVariant),
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        icon
      )}
    </button>
  );
}
