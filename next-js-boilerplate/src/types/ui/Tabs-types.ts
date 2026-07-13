import type React from "react";

export interface TabsProps extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue: string;
  type?: "single" | "multiple";
  orientation?: "horizontal" | "vertical";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
