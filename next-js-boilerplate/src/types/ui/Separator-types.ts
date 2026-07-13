import type React from "react";

export interface SeparatorProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical";
  variant?: SeparatorVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type SeparatorVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
