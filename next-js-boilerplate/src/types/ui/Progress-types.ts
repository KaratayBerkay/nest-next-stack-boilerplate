import type React from "react";

export interface ProgressProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: ProgressVariant;
  value?: number;
  max?: number;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ProgressVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
