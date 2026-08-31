"use client";

import { cn } from "@/lib/cn";
import { useDialog } from "./dialog";
import { fontClasses } from "@/lib/font-classes";
import { resolveVariant } from "@/lib/resolve-variant";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import {
  variants as buttonVariants,
  sizes as buttonSizes,
  sizeFonts as buttonSizeFonts,
} from "@/components/ui/button-styles";
import type { DialogTriggerProps } from "@/types/ui/Dialog-types";

// Same interactive base Button itself uses (button/button.tsx) — Trigger
// renders a real <button>, so it should look identical to <Button> given
// the same variant.
const dialogButtonBase =
  "ring-offset-bg relative inline-flex items-center justify-center rounded-md whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

export function DialogTrigger({
  className,
  variant,
  size = "md",
  fontSize,
  fontWeight,
  fontFamily,
  onClick,
  ...props
}: DialogTriggerProps) {
  const { onOpenChange } = useDialog();
  const effectiveVariant = useComponentVariant(variant);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <button
      type="button"
      className={cn(
        dialogButtonBase,
        buttonSizes[size],
        buttonSizeFonts[size],
        resolveVariant(buttonVariants, effectiveVariant),
        fonts,
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onOpenChange(true);
      }}
      {...props}
    />
  );
}
