import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { EmptyProps } from "@/types/ui/Empty-types";

export function Empty({
  className,
  icon,
  title,
  description,
  action,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: EmptyProps) {
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontWeight: "font-semibold" },
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon && <div className={cn("text-muted mb-2", fonts)}>{icon}</div>}
      <p className={cn("font-semibold", fonts)}>{title}</p>
      {description && (
        <p className={cn("text-muted max-w-xs", fonts)}>{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
