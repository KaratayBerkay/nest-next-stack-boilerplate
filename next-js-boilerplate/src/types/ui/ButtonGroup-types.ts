import type React from "react";
import type { Variant } from "@/components/ui/button-styles";

export interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: Extract<Variant, "default" | "outline" | "secondary">;
  className?: string;
}

export interface ButtonGroupItemProps extends React.ComponentPropsWithoutRef<"button"> {
  active?: boolean;
}
