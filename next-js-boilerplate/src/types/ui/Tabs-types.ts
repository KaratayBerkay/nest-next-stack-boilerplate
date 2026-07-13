import type React from "react";

export interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue: string;
  orientation?: "horizontal" | "vertical";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
