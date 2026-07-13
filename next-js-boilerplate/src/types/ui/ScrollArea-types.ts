import type React from "react";

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ScrollAreaVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export interface ScrollBarProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "vertical" | "horizontal";
  className?: string;
}
