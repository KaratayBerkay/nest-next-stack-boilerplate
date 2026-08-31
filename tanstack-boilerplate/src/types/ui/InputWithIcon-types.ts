import type React from "react";

export interface InputWithIconProps extends React.ComponentPropsWithoutRef<"input"> {
  icon: React.ReactNode;
  side?: "left" | "right";
  error?: string;
}
