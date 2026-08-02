"use client";

import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Picker } from "emoji-mart";
import data from "@emoji-mart/data";
import {
  IconMoodSmile,
  IconClockFilled,
  IconMoodSmileFilled,
  IconPawFilled,
  IconPizzaFilled,
  IconTrophyFilled,
  IconCarFilled,
  IconBulbFilled,
  IconSparklesFilled,
  IconFlagFilled,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  usePopover,
} from "@/components/ui/popover";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";
import type { EmojiPickerButtonProps } from "@/types/ui/EmojiPickerButton-types";

// emoji-mart's own stock category icons (esp. its combined heart/note/camera
// glyph for "symbols") don't match this app's icon language. Swap in the
// same Tabler set used everywhere else so the nav row looks intentional
// instead of like an unstyled default widget.
//
// Must use the *Filled Tabler variants, not the outline ones: emoji-mart's
// own CSS forces `fill: currentColor` on the nav icon's <path>s (its stock
// icons are solid shapes), which overrides an outline icon's `fill="none"`
// and turns e.g. the clock's ring into a solid disc, hiding the hands.
// Filled variants are drawn as closed regions that are meant to be filled,
// so they render correctly under that CSS instead of fighting it.
const categoryIcons = {
  frequent: { svg: renderToStaticMarkup(<IconClockFilled size={18} />) },
  people: { svg: renderToStaticMarkup(<IconMoodSmileFilled size={18} />) },
  nature: { svg: renderToStaticMarkup(<IconPawFilled size={18} />) },
  foods: { svg: renderToStaticMarkup(<IconPizzaFilled size={18} />) },
  activity: { svg: renderToStaticMarkup(<IconTrophyFilled size={18} />) },
  places: { svg: renderToStaticMarkup(<IconCarFilled size={18} />) },
  objects: { svg: renderToStaticMarkup(<IconBulbFilled size={18} />) },
  symbols: { svg: renderToStaticMarkup(<IconSparklesFilled size={18} />) },
  flags: { svg: renderToStaticMarkup(<IconFlagFilled size={18} />) },
};

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
      categoryIcons,
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
      <PopoverContent align="start" className="w-[22rem] p-1">
        <EmojiPicker onEmojiSelect={onEmojiSelect} />
      </PopoverContent>
    </Popover>
  );
}
