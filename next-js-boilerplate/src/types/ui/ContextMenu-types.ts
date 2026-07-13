import type React from "react";

export interface ContextMenuProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ContextMenuVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export type ContextMenuTriggerProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type ContextMenuContentProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type ContextMenuItemProps = React.ComponentPropsWithoutRef<"div"> & {
  disabled?: boolean;
  className?: string;
};

export type ContextMenuSeparatorProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type ContextMenuLabelProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};
