import type React from "react";

export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  error?: string;
  description?: string;
  variant?: TextareaVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type TextareaVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
