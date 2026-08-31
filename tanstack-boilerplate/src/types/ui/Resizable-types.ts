import type React from "react";

export interface ResizablePanelGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  direction?: "horizontal" | "vertical";
  className?: string;
}

export interface ResizablePanelProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export interface ResizableHandleProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}
