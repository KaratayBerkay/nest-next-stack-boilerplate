import type React from "react";

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<"div"> {
  align?: "start" | "end";
  sideOffset?: number;
}
