/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import type { AdvancedFormType } from "@/types/forms/AdvancedPage-types";

interface PersonalInfoFieldsProps {
  form: AdvancedFormType;
  fieldSchemas: Record<string, unknown>;
  t: Record<string, string>;
}

export function PersonalInfoFields({ form, fieldSchemas, t }: PersonalInfoFieldsProps) {
  return (
    <>
      <form.AppField
        name="fullName"
        validators={{ onChange: fieldSchemas.fullName }}
      >
        {(field: any) => (
          <div className="flex items-center gap-1">
            <field.TextField
              label={t.fullName}
              placeholder={t.fullNamePlaceholder}
              required
            />
            <FieldInfoButton description={t.fullNameInfo} />
          </div>
        )}
      </form.AppField>

      <form.AppField
        name="email"
        validators={{ onChange: fieldSchemas.email }}
      >
        {(field: any) => (
          <div className="flex items-center gap-1">
            <field.TextField
              label={t.email}
              placeholder={t.emailPlaceholder}
              required
            />
            <FieldInfoButton description={t.emailInfo} />
          </div>
        )}
      </form.AppField>

      <form.AppField
        name="password"
        validators={{ onChange: fieldSchemas.password }}
      >
        {(field: any) => (
          <div className="flex items-center gap-1">
            <field.TextField
              label={t.password}
              placeholder={t.passwordPlaceholder}
              required
            />
            <FieldInfoButton description={t.passwordInfo} />
          </div>
        )}
      </form.AppField>
    </>
  );
}
