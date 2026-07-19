import type React from "react";

export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type NavigationMenuListProps = React.ComponentPropsWithoutRef<"ul"> & {
  className?: string;
};

export type NavigationMenuItemProps = React.ComponentPropsWithoutRef<"li"> & {
  className?: string;
};

export type NavigationMenuTriggerProps =
  React.ComponentPropsWithoutRef<"button"> & {
    className?: string;
  };

export type NavigationMenuContentProps =
  React.ComponentPropsWithoutRef<"div"> & {
    className?: string;
  };

export type NavigationMenuLinkProps = React.ComponentPropsWithoutRef<"a"> & {
  className?: string;
};
