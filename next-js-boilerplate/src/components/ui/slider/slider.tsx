"use client";
import { forwardRef } from "react";
import { Root, Track, Range, Thumb } from "@radix-ui/react-slider";
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { SliderProps } from "@/types/ui/Slider-types";

export const Slider = forwardRef<
  React.ElementRef<typeof Root>,
  SliderProps
>(({ className, fontSize, fontWeight, fontFamily, ...props }, ref) => {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        fonts,
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
          aria-label={props.value && props.value.length > 1 ? `Value ${i + 1}` : "Value"}
          className="border-border bg-bg focus-visible:ring-brand block size-5 rounded-full border shadow-sm transition-all hover:scale-110 active:scale-105 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </Root>
  );
});
Slider.displayName = "Slider";
