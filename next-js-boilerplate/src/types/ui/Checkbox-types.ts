import type React from "react";

export interface CheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children"
> {
  label?: string;
  variant?: CheckboxVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface CheckboxGroupItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  values: string[];
  onValueChange: (values: string[]) => void;
  items: CheckboxGroupItem[];
  label?: string;
  showSelectAll?: boolean;
  className?: string;
  direction?: "vertical" | "horizontal";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface IndeterminateCheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children"
> {
  indeterminate?: boolean;
  label?: string;
  checked?: boolean;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type CheckboxVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export type CheckboxGroupShinyProps = React.ComponentPropsWithoutRef<"div">;

export type CheckboxGroupGlassProps = React.ComponentPropsWithoutRef<"div">;

export type CheckboxGroupNeonProps = React.ComponentPropsWithoutRef<"div">;

export type CheckboxGroupGradientProps = React.ComponentPropsWithoutRef<"div">;
