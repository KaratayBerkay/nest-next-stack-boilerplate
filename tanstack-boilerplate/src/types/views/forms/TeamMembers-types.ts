import type { AdvancedFormType } from "@/types/forms/AdvancedPage-types";

export interface TeamMembersProps {
  form: AdvancedFormType;
  fieldSchemas: Record<string, unknown>;
  members: Array<{ name: string; email: string; role: string }>;
  t: Record<string, string>;
}
