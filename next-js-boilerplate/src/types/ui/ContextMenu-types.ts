import type React from "react";

export interface ContextMenuProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type ContextMenuTriggerProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type ContextMenuAnimation = "center" | "left" | "right" | "top" | "bottom";

export type ContextMenuContentProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
  animation?: ContextMenuAnimation;
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
