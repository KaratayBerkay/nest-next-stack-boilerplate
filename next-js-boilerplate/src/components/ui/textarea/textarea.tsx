import { cn } from "@/lib/cn";
import type { TextareaProps } from "@/types/ui/Textarea-types";

const defaultStyles = "border-border focus-visible:ring-brand";

export function Textarea({ className, error, fontSize, fontWeight, fontFamily, ...props }: TextareaProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <textarea
      className={cn(
        "placeholder:text-muted focus-visible:ring-brand flex min-h-20 w-full rounded border bg-transparent px-3 py-2 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        defaultStyles,
        error &&
          "border-red-500 focus-visible:ring-red-500 dark:border-red-500",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}
