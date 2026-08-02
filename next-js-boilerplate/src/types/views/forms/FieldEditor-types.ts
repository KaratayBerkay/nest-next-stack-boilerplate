import type { BuilderField } from "@/types/forms/BuilderField-types";
import type { useMessages } from "@/lib/i18n/MessagesProvider";

export interface FieldEditorProps {
  field: BuilderField;
  idx: number;
  fieldsLength: number;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BuilderField>) => void;
  t: ReturnType<typeof useMessages<"forms">>;
}
