"use client";

import { IconChevronDown } from "@tabler/icons-react";
import type { ScrollToBottomButtonProps } from "@/types/ui/ScrollToBottomButton-types";

export function ScrollToBottomButton({
  onClick,
}: ScrollToBottomButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-surface hover:bg-surface-hover text-muted absolute bottom-20 right-4 z-10 flex size-10 items-center justify-center rounded-full shadow-lg transition-colors"
      aria-label="Scroll to bottom"
    >
      <IconChevronDown className="size-5" />
    </button>
  );
}
