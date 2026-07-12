import { cn } from "@/lib/cn";
import type { CardTitleProps } from "@/types/ui/Card-types";

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    // jsx-a11y/heading-has-content can't see that `children` arrives via `{...props}` — this
    // is a generic wrapper, not a heading rendered without content.
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h3
      className={cn(
        "text-base leading-none font-semibold tracking-tight @sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}
