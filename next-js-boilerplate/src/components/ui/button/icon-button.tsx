import { cn } from "@/lib/cn";
import { variants, sizes } from "@/components/ui/button-styles";
import type { IconButtonProps } from "@/types/ui/IconButton-types";

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "icon",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded font-medium transition-all focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
