import type React from "react";

export interface ToggleProps extends React.ComponentPropsWithoutRef<"button"> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ToggleVariant = "default" | "outline" | "shiny" | "glass" | "neon" | "gradient";
