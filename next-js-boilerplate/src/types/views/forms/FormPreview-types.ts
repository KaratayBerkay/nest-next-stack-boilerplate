import type { BuilderField } from "@/types/forms/BuilderField-types";
import type { useMessages } from "@/lib/i18n/MessagesProvider";
import type { useAppForm } from "@/features/forms/form-hook";

export interface FormPreviewProps {
  fields: BuilderField[];
  dynamicForm: ReturnType<typeof useAppForm>;
  onSubmit: () => void;
  t: ReturnType<typeof useMessages<"forms">>;
}
