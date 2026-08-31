import type { AdvancedFormType } from "@/types/forms/AdvancedPage-types";

export interface BusinessFieldsProps {
  form: AdvancedFormType;
  fieldSchemas: Record<string, unknown>;
  t: Record<string, string>;
}
