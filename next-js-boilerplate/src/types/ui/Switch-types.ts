import type React from "react";

export interface SwitchProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children"
> {
  label?: string;
  variant?: SwitchVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type SwitchVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
