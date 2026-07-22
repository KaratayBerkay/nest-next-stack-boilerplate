/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { sectionedFieldSchemas } from "@/validators/forms/layouts-validation";

interface PersonalInfoSectionProps {
  form: any;
}

export function PersonalInfoSection({ form }: PersonalInfoSectionProps) {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
        Personal Info
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
              <FieldInfoButton
                description={t.layouts.sectionedLastName_info}
              />
            </div>
          )}
        </form.AppField>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <form.AppField
          name="email"
          validators={{ onChange: sectionedFieldSchemas.email }}
        >
          {(field: any) => <field.TextField label="Email" />}
        </form.AppField>
        <div className="flex flex-col gap-1">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={form.getFieldValue("dateOfBirth")}
            onChange={(e) =>
              form.setFieldValue("dateOfBirth", e.target.value)
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedGender_label}</Label>
          <FieldInfoButton description={t.layouts.sectionedGender_info} />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="gender" className="accent-brand" />
            {t.layouts.sectionedGender_male}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="gender"
              defaultChecked
              className="accent-brand"
            />
            {t.layouts.sectionedGender_female}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="gender" className="accent-brand" />
            {t.layouts.sectionedGender_other}
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedCategory_label}</Label>
          <FieldInfoButton
            description={t.layouts.sectionedCategory_info}
          />
        </div>
        <div className="flex gap-4">
          {[
            { value: "tech" as const, label: "Technology" },
            { value: "design" as const, label: "Design" },
            { value: "business" as const, label: "Business" },
          ].map((c) => (
            <label
              key={c.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="category"
                value={c.value}
                className="accent-brand"
                checked={form.getFieldValue("category") === c.value}
                onChange={() => form.setFieldValue("category", c.value)}
              />
              {c.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
