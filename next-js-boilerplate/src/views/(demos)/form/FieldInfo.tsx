import type { FieldInfoProps } from "@/types/demos/FieldInfo-types";

export function FieldInfo({ field }: FieldInfoProps) {
  return (
    <>
      {field.state.meta.errors.length > 0 && (
        <p className="text-xs text-red-500">
          {field.state.meta.errors
            .map((e) => (typeof e === "string" ? e : e?.message))
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
      {field.state.meta.isValidating && (
        <span className="text-muted text-xs">Validating...</span>
      )}
    </>
  );
}
