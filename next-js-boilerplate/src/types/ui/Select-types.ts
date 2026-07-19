import type React from "react";

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  defaultOpen?: boolean;
  name?: string;
}

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: SelectVariant;
  size?: SelectSize;
  className?: string;
  error?: string;
  description?: string;
  /** Hide the chevron icon — used when the select opens a bottom sheet instead of a dropdown. */
  hideChevron?: boolean;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export interface SelectContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  sideOffset?: number;
  /** Always render as the mobile bottom sheet, regardless of viewport width. */
  forceBottomSheet?: boolean;
}

export interface SelectItemProps extends React.ComponentPropsWithoutRef<"button"> {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export type SelectVariant =
  | "default"
  | "outline"
  | "shiny"
  | "glass"
  | "neon"
  | "gradient";

export type SelectSize = "sm" | "md";
