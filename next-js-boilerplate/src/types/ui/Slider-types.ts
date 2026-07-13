import type { ComponentPropsWithoutRef } from "react";
import type { Root } from "@radix-ui/react-slider";

export type SliderProps = ComponentPropsWithoutRef<typeof Root> & {
  variant?: SliderVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type SliderVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
