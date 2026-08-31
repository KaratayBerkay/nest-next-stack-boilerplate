import type React from "react";

export interface FileInputProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "type" | "value"
> {
  error?: string;
  buttonLabel?: string;
}
