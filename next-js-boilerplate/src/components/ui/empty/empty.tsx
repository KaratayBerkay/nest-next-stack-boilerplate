import { cn } from "@/lib/cn";
import type { EmptyProps, EmptyVariant } from "@/types/ui/Empty-types";

const variants: Record<EmptyVariant, string> = {
  default: "text-fg",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

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
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-semibold";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-12 text-center",
        className,
      )}
      {...props}
    >
      {icon && <div className={cn("text-muted mb-2", fontSizeClass, fontWeightClass, fontFamilyClass)}>{icon}</div>}
      <p className={cn("font-semibold", fontSizeClass, fontWeightClass, fontFamilyClass)}>{title}</p>
      {description && (
        <p className={cn("text-muted max-w-xs", fontSizeClass, fontWeightClass, fontFamilyClass)}>{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
