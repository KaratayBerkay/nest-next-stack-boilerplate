"use client";

import { useEffect, useRef } from "react";
import { Picker } from "emoji-mart";
import data from "@emoji-mart/data";
import { IconMoodSmile } from "@tabler/icons-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  usePopover,
} from "@/components/ui/popover";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import type { EmojiPickerButtonProps } from "@/types/ui/EmojiPickerButton-types";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const { theme } = useTheme();
  const { close } = usePopover();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const picker = new Picker({
      data,
      theme: theme === "light" ? "light" : "dark",
      locale: "en",
      dynamicWidth: true,
      perLine: 8,
      noCountryFlags: true,
      onEmojiSelect: (emoji: { native: string }) => {
        onEmojiSelect(emoji.native);
        close();
      },
    });
    const node = picker as unknown as HTMLElement;
    containerRef.current?.appendChild(node);
    return () => {
      node.remove();
    };
  }, [theme, onEmojiSelect, close]);

  return <div ref={containerRef} className="flex min-h-[18rem] w-full" />;
}

export function EmojiPickerButton({
  onEmojiSelect,
  label,
  className,
  ...props
}: EmojiPickerButtonProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "text-muted hover:bg-surface-hover focus-visible:ring-brand size-9 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
        aria-label={label}
        {...props}
      >
        <IconMoodSmile size={20} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-1">
        <EmojiPicker onEmojiSelect={onEmojiSelect} />
      </PopoverContent>
    </Popover>
  );
}
