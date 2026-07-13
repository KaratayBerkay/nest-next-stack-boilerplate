import type React from "react";

export interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: string;
  variant?: "default";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
