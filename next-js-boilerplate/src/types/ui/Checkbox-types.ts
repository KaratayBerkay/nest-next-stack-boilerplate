import type React from "react";
import type { GlobalVariant } from "@/components/ui/global-style-variants";

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "children" | "size"
> {
  label?: string;
  variant?: CheckboxVariant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  size?: CheckboxSize;
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
  "type" | "children" | "size"
> {
  indeterminate?: boolean;
  label?: string;
  checked?: boolean;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  size?: CheckboxSize;
}

export interface CheckboxCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  value?: string;
  variant?: GlobalVariant;
  className?: string;
}

export interface CheckboxChipProps {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  count?: number;
  onRemove?: () => void;
  variant?: GlobalVariant;
  className?: string;
}

export type CheckboxVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export type CheckboxGroupShinyProps = React.ComponentPropsWithoutRef<"div">;

export type CheckboxGroupGlassProps = React.ComponentPropsWithoutRef<"div">;

export type CheckboxGroupNeonProps = React.ComponentPropsWithoutRef<"div">;

export type CheckboxGroupGradientProps = React.ComponentPropsWithoutRef<"div">;
