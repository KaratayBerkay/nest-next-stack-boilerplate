import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { DialogTitleProps } from "@/types/ui/Dialog-types";

export function DialogTitle({ className, fontSize, fontWeight, fontFamily, ...props }: DialogTitleProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily }, { fontSize: "text-lg", fontWeight: "font-semibold" });

  return (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        fonts,
        className,
      )}
      {...props}
    />
  );
}
