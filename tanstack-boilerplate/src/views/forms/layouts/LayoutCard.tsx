import type { LayoutCardProps } from "@/types/forms/LayoutCard-types";

export function LayoutCard({
  label,
  description,
  fullWidth,
  children,
}: LayoutCardProps) {
  return (
    <div
      className={`surface border-border flex flex-col gap-4 rounded-lg border p-5 shadow-xs ${
        fullWidth ? "max-w-4xl" : "max-w-2xl"
      }`}
    >
      <div>
        <p className="text-xs font-semibold">{label}</p>
        {description && <p className="text-muted text-xs">{description}</p>}
      </div>
      {children}
    </div>
  );
}
