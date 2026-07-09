import { cn } from "@/lib/cn";
import { inputBaseClasses, inputErrorClasses } from "@/components/ui/input-styles";
import type { InputWithIconProps } from "@/types/ui/InputWithIcon-types";

export function InputWithIcon({
  icon,
  side = "left",
  error,
  className,
  ...props
}: InputWithIconProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          "text-muted pointer-events-none absolute inset-y-0 flex items-center",
          side === "left" ? "left-0 pl-3" : "right-0 pr-3",
        )}
      >
        {icon}
      </div>
      <input
        className={cn(
          inputBaseClasses,
          side === "left" ? "pl-10" : "pr-10",
          error && inputErrorClasses,
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
    </div>
  );
}
