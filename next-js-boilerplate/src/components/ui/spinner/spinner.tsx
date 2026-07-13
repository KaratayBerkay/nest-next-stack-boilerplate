import { cn } from "@/lib/cn";
import type { SpinnerProps } from "@/types/ui/Spinner-types";

export function Spinner({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: SpinnerProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <svg
      className={cn(
        "animate-spin",
        "text-muted",
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
