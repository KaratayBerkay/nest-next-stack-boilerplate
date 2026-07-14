"use client";

import { IconChevronDown } from "@tabler/icons-react";
import type { ScrollToBottomButtonProps } from "@/types/ui/ScrollToBottomButton-types";

export function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-bg hover:bg-surface-hover text-muted absolute right-4 bottom-20 z-10 flex size-10 items-center justify-center rounded-full border border-border shadow-lg transition-all animate-fade-in-up"
      aria-label="Scroll to bottom"
    >
      <IconChevronDown className="size-5" />
    </button>
  );
}
