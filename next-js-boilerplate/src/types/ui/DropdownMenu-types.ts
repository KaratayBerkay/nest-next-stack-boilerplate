import type React from "react";

export interface DropdownMenuProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type DropdownMenuVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export type DropdownMenuTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DropdownMenuContentProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
  variant?: DropdownMenuVariant;
};

export type DropdownMenuItemProps = React.ComponentPropsWithoutRef<"div"> & {
  disabled?: boolean;
  className?: string;
};

export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};
