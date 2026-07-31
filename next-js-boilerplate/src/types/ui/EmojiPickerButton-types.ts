import type { ComponentPropsWithoutRef } from "react";

export interface EmojiPickerButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "onClick"
> {
  onEmojiSelect: (emoji: string) => void;
  label: string;
}
