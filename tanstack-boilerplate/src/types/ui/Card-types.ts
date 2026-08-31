import type React from "react";

export type CardProps = React.ComponentPropsWithoutRef<"div"> & {
  variant?: "default" | "elevated" | "interactive" | "outline" | "surface";
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type CardContentProps = React.ComponentPropsWithoutRef<"div"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type CardDescriptionProps = React.ComponentPropsWithoutRef<"p"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};

export type CardFooterProps = React.ComponentPropsWithoutRef<"div">;

export type CardHeaderProps = React.ComponentPropsWithoutRef<"div"> & {
  upper?: React.ReactNode;
  title?: React.ReactNode;
};

export type CardTitleProps = React.ComponentPropsWithoutRef<"h3"> & {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};
