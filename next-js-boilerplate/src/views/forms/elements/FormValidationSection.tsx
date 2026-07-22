import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useAppForm } from "@/features/forms/form-hook";
import { elementsFieldSchemas } from "@/validators/forms/elements-validation";
import { SectionCard } from "./SectionCard";

export function FormValidationSection() {
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: { email: "", password: "", bio: "" },
  });

  return (
    <SectionCard label={t.elements.section_formValidation}>
      <p className="text-xxs text-muted">{t.elements.validation_info}</p>
      <form className="flex flex-col gap-3">
        <form.AppForm>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField
              name="bio"
              validators={{ onChange: elementsFieldSchemas.bio }}
            >
              {(field) => (
                <field.TextField
                  label={t.elements.validationEmail_label}
                  placeholder={t.elements.validationEmail_placeholder}
                />
              )}
            </form.AppField>
            <form.AppField
              name="password"
              validators={{ onChange: elementsFieldSchemas.password }}
            >
              {(field) => (
                <field.TextField
                  label={t.elements.validationPassword_label}
                  type="password"
                  placeholder={t.elements.validationPassword_placeholder}
                  showPasswordToggle
                />
              )}
            </form.AppField>
          </div>
          <form.AppField
            name="bio"
            validators={{ onChange: elementsFieldSchemas.bio }}
          >
            {(field) => (
              <field.TextareaField
                label={t.elements.validationBio_label}
                hint={t.elements.validationBio_placeholder}
                maxLength={200}
              />
            )}
          </form.AppField>
        </form.AppForm>
      </form>
    </SectionCard>
  );
}
