/* eslint-disable @typescript-eslint/no-explicit-any */
import { Separator } from "@/components/ui/Separator";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import type { AdvancedFormType } from "@/types/forms/AdvancedPage-types";

const INDUSTRY_OPTIONS = (t: Record<string, string>) => [
  { value: "technology", label: t.industryTechnology },
  { value: "finance", label: t.industryFinance },
  { value: "healthcare", label: t.industryHealthcare },
  { value: "education", label: t.industryEducation },
  { value: "ecommerce", label: t.industryEcommerce },
  { value: "other", label: t.industryOther },
];

interface BusinessFieldsProps {
  form: AdvancedFormType;
  fieldSchemas: Record<string, unknown>;
  t: Record<string, string>;
}

export function BusinessFields({ form, fieldSchemas, t }: BusinessFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Separator />

      <p className="text-xxs text-muted">{t.business}</p>

      <form.AppField
        name="companyName"
        validators={{ onChange: fieldSchemas.companyName }}
      >
        {(field: any) => (
          <div className="flex items-center gap-1">
            <field.TextField
              label={t.companyName}
              placeholder={t.companyNamePlaceholder}
              required
            />
            <FieldInfoButton description={t.companyNameInfo} />
          </div>
        )}
      </form.AppField>

      <form.AppField
        name="taxId"
        validators={{ onChange: fieldSchemas.taxId }}
      >
        {(field: any) => (
          <div className="flex items-center gap-1">
            <field.TextField
              label={t.taxId}
              placeholder={t.taxIdPlaceholder}
              required
            />
            <FieldInfoButton description={t.taxIdInfo} />
          </div>
        )}
      </form.AppField>

      <form.AppField
        name="industry"
        validators={{ onChange: fieldSchemas.industry }}
      >
        {(field: any) => (
          <field.SelectField
            label={t.industry}
            placeholder={t.industry}
            options={INDUSTRY_OPTIONS(t)}
          />
        )}
      </form.AppField>
    </div>
  );
}
