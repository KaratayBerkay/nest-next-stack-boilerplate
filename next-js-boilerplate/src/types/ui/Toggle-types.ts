import type React from "react";

export interface ToggleProps extends React.ComponentPropsWithoutRef<"button"> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
}

export type ToggleSize = "sm" | "md" | "lg";

export type ToggleVariant =
  | "default"
  | "outline"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";
