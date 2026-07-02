import { cn } from "@/lib/cn";

const variants = {
  default: "bg-fg text-bg",
  secondary: "bg-surface text-fg",
  outline: "border border-border text-muted",
  destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
} as const;

type Variant = keyof typeof variants;

interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant?: Variant;
}

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
