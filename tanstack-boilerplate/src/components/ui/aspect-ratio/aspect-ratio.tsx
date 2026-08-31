// Exempt from global style system — structural/utility component with no styleable surface.
"use client";
import { Root } from "@radix-ui/react-aspect-ratio";
import { cn } from "@/lib/cn";
export function AspectRatio({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Root>) {
  return <Root className={cn("overflow-hidden", className)} {...props} />;
}
