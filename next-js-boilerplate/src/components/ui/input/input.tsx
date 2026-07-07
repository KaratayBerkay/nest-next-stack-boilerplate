import { cn } from "@/lib/cn";
import { inputBaseClasses, inputErrorClasses } from "@/components/ui/input-styles";

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        inputBaseClasses,
        error && inputErrorClasses,
        className,
      )}
      aria-invalid={!!error}
      {...props}
    />
  );
}
