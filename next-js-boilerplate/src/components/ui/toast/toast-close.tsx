import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { ToastCloseProps } from "@/types/ui/Toast-types";

export function ToastClose({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastCloseProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <button
      className={cn(
        "text-muted hover:text-fg focus-visible:ring-brand absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none",
        fonts,
        className,
      )}
      {...props}
    >
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <span className="sr-only">Close</span>
    </button>
  );
}
