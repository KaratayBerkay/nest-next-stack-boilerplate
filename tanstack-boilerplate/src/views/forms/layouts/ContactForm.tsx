import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { createFormSubmitHandler } from "@/lib/forms/shared";
import { useToast } from "@/components/ui/Toast";
import { basicFormOpts } from "@/validators/forms/layouts-inits";
import { contactFieldSchemas } from "@/validators/forms/layouts-validation";
import { Dropdown } from "@/components/ui/Dropdown";
import { Label } from "@/components/ui/Label";
import { LayoutCard } from "./LayoutCard";

export function ContactForm() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const form = useAppForm({
    ...basicFormOpts,
    onSubmit: async () => {
      toast({
        description: t.layouts.contactSubmitSuccess,
        variant: "default",
      });
      form.reset();
    },
  });
  const isDirty = useStore(form.store, (s) => s.isDirty);
  const onSubmit = createFormSubmitHandler(form);

  return (
    <LayoutCard
      label={t.layouts.contact_label}
      description={t.layouts.contact_description}
    >
      <form.AppForm>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <form.AppField
            name="fullName"
            validators={{ onChange: contactFieldSchemas.fullName }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextField
                  label={t.layouts.contactFullName_label}
                  placeholder={t.layouts.contactFullName_placeholder}
                />
                <FieldInfoButton description={t.layouts.contactFullName_info} />
              </div>
            )}
          </form.AppField>
          <form.AppField
            name="email"
            validators={{ onChange: contactFieldSchemas.email }}
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
              <Label>{t.layouts.contactSubject_label}</Label>
              <FieldInfoButton description={t.layouts.contactSubject_info} />
            </div>
            <Dropdown
              options={[
                { value: "general", label: t.layouts.contactSubject_general },
                { value: "support", label: t.layouts.contactSubject_support },
                {
                  value: "feedback",
                  label: t.layouts.contactSubject_feedback,
                },
                { value: "other", label: t.layouts.contactSubject_other },
              ]}
              value={form.getFieldValue("subject")}
              onChange={(value) => form.setFieldValue("subject", value)}
              placeholder={t.layouts.contactSubject_placeholder}
            />
          </div>
          <form.AppField
            name="message"
            validators={{ onChange: contactFieldSchemas.message }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextareaField label={t.layouts.contactMessage_label} />
                <FieldInfoButton description={t.layouts.contactMessage_info} />
              </div>
            )}
          </form.AppField>
          <div className="flex items-center justify-between">
            <form.SubmitButton
              label={t.layouts.contactSubmit}
              loadingLabel={t.layouts.contactSubmitting}
            />
            {isDirty && (
              <span className="text-warning text-xxs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {t.layouts.unsaved}
              </span>
            )}
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}
