import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { DialogFooterProps } from "@/types/ui/Dialog-types";

export function DialogFooter({ className, fontSize, fontWeight, fontFamily, ...props }: DialogFooterProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-end gap-2 pt-2",
        fonts,
        className,
      )}
      {...props}
    />
  );
}
