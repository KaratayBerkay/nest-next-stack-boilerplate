import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { CardTitleProps } from "@/types/ui/Card-types";

export function CardTitle({ className, fontSize, fontWeight, fontFamily, ...props }: CardTitleProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily }, { fontSize: "text-base", fontWeight: "font-semibold" });

  return (
    // jsx-a11y/heading-has-content can't see that `children` arrives via `{...props}` — this
    // is a generic wrapper, not a heading rendered without content.
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h3
      className={cn(
        "text-base leading-none tracking-tight @sm:text-lg",
        fonts,
        className,
      )}
      {...props}
    />
  );
}
