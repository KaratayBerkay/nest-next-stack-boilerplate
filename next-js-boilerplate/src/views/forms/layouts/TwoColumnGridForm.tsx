import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { createFormSubmitHandler } from "@/lib/forms/shared";
import { twoColumnFormOpts } from "@/validators/forms/layouts-inits";
import { twoColumnFieldSchemas } from "@/validators/forms/layouts-validation";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Label } from "@/components/ui/Label";
import { LayoutCard } from "./LayoutCard";

export function TwoColumnGridForm() {
  const t = useMessages("forms");
  const form = useAppForm({
    ...twoColumnFormOpts,
  });
  const isDirty = useStore(form.store, (s) => s.isDirty);
  const onSubmit = createFormSubmitHandler(form);

  return (
    <LayoutCard
      label={t.layouts.twoColumn_label}
      description={t.layouts.twoColumn_description}
    >
      <form.AppForm>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.AppField
              name="firstName"
              validators={{ onChange: twoColumnFieldSchemas.firstName }}
            >
              {(field) => (
                <div className="flex items-center gap-1">
                  <field.TextField
                    label={t.layouts.twoColumnFirstName_label}
                    placeholder={t.layouts.twoColumnFirstName_placeholder}
                  />
                  <FieldInfoButton
                    description={t.layouts.twoColumnFirstName_info}
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField
              name="lastName"
              validators={{ onChange: twoColumnFieldSchemas.lastName }}
            >
              {(field) => (
                <div className="flex items-center gap-1">
                  <field.TextField
                    label={t.layouts.twoColumnLastName_label}
                    placeholder={t.layouts.twoColumnLastName_placeholder}
                  />
                  <FieldInfoButton
                    description={t.layouts.twoColumnLastName_info}
                  />
                </div>
              )}
            </form.AppField>
          </div>
          <form.AppField
            name="email"
            validators={{ onChange: twoColumnFieldSchemas.email }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextField
                  label={t.layouts.contactEmail_label}
                  placeholder={t.layouts.contactEmail_placeholder}
                />
                <FieldInfoButton description={t.layouts.contactEmail_info} />
              </div>
            )}
          </form.AppField>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Label>{t.layouts.twoColumnSubject_label}</Label>
              <FieldInfoButton description={t.layouts.twoColumnSubject_info} />
            </div>
            <NativeSelect
              value={form.getFieldValue("subject")}
              onChange={(e) => form.setFieldValue("subject", e.target.value)}
            >
              <option value="">{t.layouts.twoColumnSubject_placeholder}</option>
              <option value="option1">
                {t.layouts.twoColumnSubject_option1}
              </option>
              <option value="option2">
                {t.layouts.twoColumnSubject_option2}
              </option>
              <option value="option3">
                {t.layouts.twoColumnSubject_option3}
              </option>
              <option value="option4">
                {t.layouts.twoColumnSubject_option4}
              </option>
            </NativeSelect>
          </div>
          <form.AppField
            name="message"
            validators={{ onChange: twoColumnFieldSchemas.message }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextareaField
                  label={t.layouts.twoColumnMessage_label}
                  maxLength={200}
                />
                <FieldInfoButton
                  description={t.layouts.twoColumnMessage_info}
                />
              </div>
            )}
          </form.AppField>
          <div className="flex items-center justify-between">
            <form.SubmitButton
              label={t.layouts.twoColumnSubmit}
              loadingLabel={t.layouts.twoColumnSubmitting}
            />
            {isDirty && (
              <span className="text-warning text-xxs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}
