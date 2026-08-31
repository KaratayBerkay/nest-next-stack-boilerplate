import type { SectionCardProps } from "@/types/forms/SectionCard-types";

export function SectionCard({ label, children }: SectionCardProps) {
  return (
    <div className="surface border-border flex flex-col gap-3 rounded-lg border p-4 shadow-xs">
      <p className="text-xxs text-muted tracking-wider uppercase">{label}</p>
      {children}
    </div>
  );
}
