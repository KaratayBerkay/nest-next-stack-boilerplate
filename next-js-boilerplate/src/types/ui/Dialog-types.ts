import type React from "react";
import type { ReactNode } from "react";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  variant?: DialogVariant;
}

export type DialogVariant = "default" | "shiny" | "glass" | "neon" | "gradient";

export type DialogFooterProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DialogTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DialogHeaderProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DialogDescriptionProps = React.ComponentPropsWithoutRef<"p"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DialogCloseProps = React.ComponentPropsWithoutRef<"button"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DialogTitleProps = React.ComponentPropsWithoutRef<"h2"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type DialogSize = "sm" | "md" | "lg" | "full";

export interface DialogContentProps extends React.ComponentPropsWithoutRef<"dialog"> {
  children: React.ReactNode;
  className?: string;
  variant?: DialogVariant;
  size?: DialogSize;
  closeLabel?: string;
}

export type DialogBodyProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};
