import type { ComponentPropsWithoutRef, RefObject } from "react";

export interface EmojiPickerButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "onClick"
> {
  onEmojiSelect: (emoji: string) => void;
  label: string;
  /** Span the picker to this element's width instead of its own default. */
  matchWidthRef?: RefObject<HTMLElement | null>;
}
