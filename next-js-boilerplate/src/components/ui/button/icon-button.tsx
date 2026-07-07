import { cn } from "@/lib/cn";
import { variants, sizes, type Variant, type Size } from "@/components/ui/button-styles";

interface IconButtonProps extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  icon: React.ReactNode;
  label: string;
  variant?: Variant;
  size?: Extract<Size, "icon" | "icon-sm" | "icon-xs">;
}

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
