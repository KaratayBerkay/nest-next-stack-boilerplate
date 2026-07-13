import { cn } from "@/lib/cn";
import type { DialogTitleProps } from "@/types/ui/Dialog-types";

export function DialogTitle({ className, fontSize, fontWeight, fontFamily, ...props }: DialogTitleProps) {
  const fontSizeClass = fontSize || "text-lg";
  const fontWeightClass = fontWeight || "font-semibold";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
