import type React from "react";

type Variant = "default" | "destructive" | "success" | "warning";

export type AlertVariant = Variant;

export interface AlertProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: Variant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  upper?: React.ReactNode;
  header?: React.ReactNode;
}
