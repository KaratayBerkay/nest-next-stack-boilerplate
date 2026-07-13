import type React from "react";

export interface EmptyProps extends React.ComponentPropsWithoutRef<"div"> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type EmptyVariant = "default" | "shiny" | "glass" | "neon" | "gradient";
