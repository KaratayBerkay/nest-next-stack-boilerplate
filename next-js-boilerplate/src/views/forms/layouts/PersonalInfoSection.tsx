/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Label } from "@/components/ui/Label";
import { DatePicker } from "@/components/ui/DatePicker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { sectionedFieldSchemas } from "@/validators/forms/layouts-validation";
import { convertTextToDate, formatDateOnly } from "@/lib/date-time";
import type { PersonalInfoSectionProps } from "@/types/views/forms/PersonalInfoSection-types";

export function PersonalInfoSection({ form }: PersonalInfoSectionProps) {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
        {t.layouts.sectioned_personalInfo}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.AppField
          name="firstName"
          validators={{ onChange: sectionedFieldSchemas.firstName }}
        >
          {(field: any) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.layouts.sectionedFirstName_label}
                placeholder={t.layouts.sectionedFirstName_placeholder}
              />
              <FieldInfoButton
                description={t.layouts.sectionedFirstName_info}
              />
            </div>
          )}
        </form.AppField>
        <form.AppField
          name="lastName"
          validators={{ onChange: sectionedFieldSchemas.lastName }}
        >
          {(field: any) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.layouts.sectionedLastName_label}
                placeholder={t.layouts.sectionedLastName_placeholder}
              />
              <FieldInfoButton description={t.layouts.sectionedLastName_info} />
            </div>
          )}
        </form.AppField>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.AppField
          name="email"
          validators={{ onChange: sectionedFieldSchemas.email }}
        >
          {(field: any) => (
            <field.TextField label={t.layouts.sectionedEmail_label} />
          )}
        </form.AppField>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.layouts.sectionedDob_label}</Label>
            <FieldInfoButton description={t.layouts.sectionedDob_info} />
          </div>
          <DatePicker
            value={
              form.getFieldValue("dateOfBirth")
                ? (convertTextToDate(form.getFieldValue("dateOfBirth")) as Date)
                : undefined
            }
            onChange={(date) =>
              form.setFieldValue(
                "dateOfBirth",
                date ? formatDateOnly(date) : "",
              )
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedGender_label}</Label>
          <FieldInfoButton description={t.layouts.sectionedGender_info} />
        </div>
        <RadioGroup defaultValue="female">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="male" />
              {t.layouts.sectionedGender_male}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="female" />
              {t.layouts.sectionedGender_female}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <RadioGroupItem value="other" />
              {t.layouts.sectionedGender_other}
            </label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedCategory_label}</Label>
          <FieldInfoButton description={t.layouts.sectionedCategory_info} />
        </div>
        <RadioGroup
          value={form.getFieldValue("category")}
          onValueChange={(v) => form.setFieldValue("category", v)}
        >
          <div className="flex gap-4">
            {[
              {
                value: "tech" as const,
                label: t.layouts.sectionedCategory_tech,
              },
              {
                value: "design" as const,
                label: t.layouts.sectionedCategory_design,
              },
              {
                value: "business" as const,
                label: t.layouts.sectionedCategory_business,
              },
            ].map((c) => (
              <label key={c.value} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={c.value} />
                {c.label}
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
