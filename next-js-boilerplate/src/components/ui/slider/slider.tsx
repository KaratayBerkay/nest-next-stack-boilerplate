"use client";
import { forwardRef } from "react";
import { Root, Track, Range, Thumb } from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";
import type { SliderProps, SliderVariant } from "@/types/ui/Slider-types";

const variants: Record<SliderVariant, string> = {
  default: "text-fg",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export const Slider = forwardRef<
  React.ElementRef<typeof Root>,
  SliderProps
>(({ className, fontSize, fontWeight, fontFamily, ...props }, ref) => {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    >
      <Track className="bg-surface relative h-1.5 w-full grow overflow-hidden rounded-full">
        <Range className="bg-brand absolute h-full" />
      </Track>
      {props.value?.map((_, i) => (
        <Thumb
          key={i}
          className="border-border bg-bg focus-visible:ring-brand block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </Root>
  );
});
Slider.displayName = "Slider";
