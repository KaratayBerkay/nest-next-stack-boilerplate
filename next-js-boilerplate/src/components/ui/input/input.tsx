import { cn } from "@/lib/cn";
import {
  inputBaseClasses,
  inputErrorClasses,
} from "@/components/ui/input-styles";
import type { InputProps } from "@/types/ui/Input-types";

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(inputBaseClasses, error && inputErrorClasses, className)}
      aria-invalid={!!error}
      {...props}
    />
  );
}
