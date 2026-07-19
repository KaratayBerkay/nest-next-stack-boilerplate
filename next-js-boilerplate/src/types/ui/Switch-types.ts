import type React from "react";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children" | "size"
> {
  label?: string;
  variant?: SwitchVariant;
  switchSize?: SwitchSize;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type SwitchVariant =
  | "default"
  | "outline"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";
