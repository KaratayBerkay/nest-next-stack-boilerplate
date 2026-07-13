import type React from "react";

export interface KbdProps extends React.ComponentPropsWithoutRef<"kbd"> {
  variant?: KbdVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type KbdVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
