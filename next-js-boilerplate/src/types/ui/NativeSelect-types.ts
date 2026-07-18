import type React from "react";

export interface NativeSelectProps extends React.ComponentPropsWithoutRef<"select"> {
  error?: string;
  description?: string;
  className?: string;
}
