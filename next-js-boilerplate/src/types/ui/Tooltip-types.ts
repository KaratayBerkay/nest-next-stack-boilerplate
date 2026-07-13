import type React from "react";

export interface TooltipProps {
  children: React.ReactNode;
  delay?: number;
  side?: "top" | "bottom" | "left" | "right";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  className?: string;
}
