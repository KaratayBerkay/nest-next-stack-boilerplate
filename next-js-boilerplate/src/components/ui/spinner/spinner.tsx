// Exempt from global style system — inherits currentColor; no styleable surface.
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { SpinnerProps, SpinnerSize } from "@/types/ui/Spinner-types";

const sizeMap: Record<SpinnerSize, string> = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function Spinner({
  className,
  size = "md",
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: SpinnerProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <svg
      className={cn(
        "animate-spin",
        sizeMap[size],
        fonts,
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
