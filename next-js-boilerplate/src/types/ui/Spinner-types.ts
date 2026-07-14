import type React from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export interface SpinnerProps extends React.ComponentPropsWithoutRef<"svg"> {
  size?: SpinnerSize;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
