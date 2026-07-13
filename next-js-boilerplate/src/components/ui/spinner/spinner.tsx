import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SpinnerProps, SpinnerVariant } from "@/types/ui/Spinner-types";

const variants: Record<SpinnerVariant, string> = {
  default: "text-muted",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export function Spinner({
  className,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: SpinnerProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = variants[effectiveVariant as keyof typeof variants];
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <svg
      className={cn(
        "animate-spin",
        variantClass,
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
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
  );
}
