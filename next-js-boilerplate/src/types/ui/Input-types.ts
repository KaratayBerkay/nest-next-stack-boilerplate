import type React from "react";

export type InputVariant = "default";

export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: string;
  description?: string;
  variant?: "default";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
