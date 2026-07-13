import type React from "react";

export interface TabsContentProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "value"
> {
  value: string;
  variant?: "default" | "shiny" | "glass" | "neon" | "gradient";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
