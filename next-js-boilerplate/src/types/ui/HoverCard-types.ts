import type React from "react";

export interface HoverCardProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type HoverCardVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<"div"> {
  sideOffset?: number;
  className?: string;
}
