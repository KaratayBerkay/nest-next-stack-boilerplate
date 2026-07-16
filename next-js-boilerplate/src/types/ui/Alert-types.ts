import type React from "react";

type Variant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error"
  // Back-compat alias for `error` (A11); same recipe in the variant map.
  | "destructive";

export type AlertVariant = Variant;

export interface AlertProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: Variant;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  upper?: React.ReactNode;
  header?: React.ReactNode;
}
