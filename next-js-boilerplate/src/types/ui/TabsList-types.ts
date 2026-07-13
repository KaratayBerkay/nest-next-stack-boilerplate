import type React from "react";

export interface TabsListProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "default" | "shiny" | "glass" | "neon" | "gradient";
}
