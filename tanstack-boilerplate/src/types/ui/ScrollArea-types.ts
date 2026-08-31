import type React from "react";

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface ScrollBarProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "vertical" | "horizontal";
  className?: string;
}
