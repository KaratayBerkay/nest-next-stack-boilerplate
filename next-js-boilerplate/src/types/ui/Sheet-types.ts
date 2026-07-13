import type React from "react";

export interface SheetProps extends React.ComponentPropsWithoutRef<"div"> {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export type SheetVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export type SheetFooterProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type SheetTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type SheetHeaderProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type SheetDescriptionProps = React.ComponentPropsWithoutRef<"p"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type SheetCloseProps = React.ComponentPropsWithoutRef<"button"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type SheetTitleProps = React.ComponentPropsWithoutRef<"h2"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export interface SheetContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}
