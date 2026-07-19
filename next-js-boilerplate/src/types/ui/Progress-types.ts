import type React from "react";

export interface ProgressProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: ProgressVariant;
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: "sm" | "md" | "lg";
  showValueLabel?: boolean;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ProgressVariant =
  | "default"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";
