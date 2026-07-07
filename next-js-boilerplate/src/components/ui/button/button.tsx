import { cn } from "@/lib/cn";
import { variants, sizes, type Variant, type Size } from "@/components/ui/button-styles";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "default",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded font-medium shadow-xs transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none active:shadow-xs disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
