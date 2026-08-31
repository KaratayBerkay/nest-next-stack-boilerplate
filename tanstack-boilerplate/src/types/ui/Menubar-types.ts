import type React from "react";

export interface MenubarProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type MenubarVariant = "default";

export type MenubarMenuProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type MenubarTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  className?: string;
};

export type MenubarContentProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type MenubarItemProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type MenubarSeparatorProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};

export type MenubarLabelProps = React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
};
