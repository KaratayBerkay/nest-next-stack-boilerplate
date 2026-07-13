import type React from "react";

export interface TabsTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "value"
> {
  value: string;
  variant?: TabsTriggerVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type TabsTriggerVariant = "default" | "underline" | "pills" | "shiny" | "glass" | "neon" | "gradient";
