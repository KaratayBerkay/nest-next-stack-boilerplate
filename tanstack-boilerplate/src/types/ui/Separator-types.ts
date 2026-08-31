import type React from "react";

export interface SeparatorProps extends React.ComponentPropsWithoutRef<"div"> {
  orientation?: "horizontal" | "vertical";
  label?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
