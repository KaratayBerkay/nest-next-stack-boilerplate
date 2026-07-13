import type React from "react";

export interface DrawerProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type DrawerVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export type DrawerFooterProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DrawerTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DrawerHeaderProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<"p"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DrawerCloseProps = React.ComponentPropsWithoutRef<"button"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DrawerTitleProps = React.ComponentPropsWithoutRef<"h2"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  className?: string;
}
