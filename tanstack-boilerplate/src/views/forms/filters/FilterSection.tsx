import type { ReactNode } from "react";

export function FilterSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xxs text-muted font-medium">{label}</span>
      {children}
    </div>
  );
}
