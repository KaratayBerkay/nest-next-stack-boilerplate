import { cn } from "@/lib/cn";
import type { DialogTitleProps } from "@/types/ui/Dialog-types";

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    // jsx-a11y/heading-has-content can't see that `children` arrives via `{...props}` — this
    // is a generic wrapper, not a heading rendered without content.
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
