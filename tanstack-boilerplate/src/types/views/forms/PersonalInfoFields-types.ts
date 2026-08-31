import type { AdvancedFormType } from "@/types/forms/AdvancedPage-types";

export interface PersonalInfoFieldsProps {
  form: AdvancedFormType;
  fieldSchemas: Record<string, unknown>;
  t: Record<string, string>;
}
