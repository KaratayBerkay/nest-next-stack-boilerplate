import type React from "react";

export interface TabsTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value"
> {
  value: string;
  variant?: "default" | "shiny" | "glass" | "neon" | "gradient";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
