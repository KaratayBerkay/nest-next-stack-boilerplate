import type React from "react";

export interface SpinnerProps extends React.ComponentPropsWithoutRef<"svg"> {
  variant?: SpinnerVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type SpinnerVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
