import type React from "react";
import type { Variant, Size } from "@/components/ui/button-styles";

export interface IconButtonProps extends Omit<
  React.ComponentPropsWithoutRef<"button">,
  "children"
> {
  icon: React.ReactNode;
  label: string;
  variant?: Variant;
  size?: Extract<Size, "icon" | "icon-sm" | "icon-xs">;
  loading?: boolean;
}
