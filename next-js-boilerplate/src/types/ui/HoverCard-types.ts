import type React from "react";

export interface HoverCardProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<"div"> {
  sideOffset?: number;
  className?: string;
}
