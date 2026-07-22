import type { FieldInfoProps } from "@/types/ui/FieldInfo-types";

export function FieldInfo({ field }: FieldInfoProps) {
  if (field.state.meta.errors.length === 0) return null;
  return (
    <p className="text-destructive mt-1 text-xs" role="alert">
      {field.state.meta.errors
        .map((e) => (typeof e === "string" ? e : e?.message))
        .filter(Boolean)
        .join(", ")}
    </p>
  );
}
