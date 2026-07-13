import type React from "react";

export interface PopoverProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: PopoverVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type PopoverVariant = "default";

export interface PopoverTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  align?: "start" | "end";
  sideOffset?: number;
  className?: string;
  variant?: PopoverVariant;
  initialFocus?: React.RefObject<HTMLElement>;
}
