import type React from "react";

export interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue: string;
  variant?: "default" | "shiny" | "glass" | "neon" | "gradient";
  type?: "single" | "multiple";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
