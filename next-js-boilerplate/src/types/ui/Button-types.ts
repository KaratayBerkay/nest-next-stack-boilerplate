import type { Variant, Size } from "@/components/ui/button-styles";

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
}
