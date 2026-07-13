import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { variants, sizes } from "@/components/ui/button-styles";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ButtonProps } from "@/types/ui/Button-types";

export function Button({
  variant,
  size = "md",
  className,
  disabled,
  fontSize,
  fontWeight,
  fontFamily,
  leftIcon,
  rightIcon,
  loading,
  children,
  ...props
}: ButtonProps) {
  const effectiveVariant = useComponentVariant(variant);
  const fontSizeClass = fontSize || sizes[size].split(" ")[2];
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <button
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded shadow-xs transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none active:shadow-xs disabled:pointer-events-none disabled:opacity-40",
        resolveVariant(variants, effectiveVariant),
        className,
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
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
        <>
          {leftIcon && <span className="flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
