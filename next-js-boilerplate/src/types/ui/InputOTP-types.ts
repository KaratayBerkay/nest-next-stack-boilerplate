import type React from "react";

export interface InputOTPProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
}
