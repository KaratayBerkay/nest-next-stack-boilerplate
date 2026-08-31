"use client";

import { IconChevronDown } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import type { ScrollToBottomButtonProps } from "@/types/ui/ScrollToBottomButton-types";

export function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  return (
    <IconButton
      icon={<IconChevronDown className="size-5" />}
      label="Scroll to bottom"
      className="bg-bg hover:bg-surface-hover border-border animate-fade-in-up absolute right-4 bottom-20 z-10 rounded-full border shadow-lg"
      onClick={onClick}
    />
  );
}
