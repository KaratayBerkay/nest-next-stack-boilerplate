import type React from "react";

export type TextareaVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  error?: string;
  variant?: TextareaVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
