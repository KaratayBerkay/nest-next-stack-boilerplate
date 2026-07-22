"use client";

import { useMemo } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { Separator } from "@/components/ui/Separator";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { advancedFormOpts } from "@/validators/forms/advanced-inits";
import { createAdvancedSchemas } from "@/validators/forms/advanced";
import { BusinessFields } from "./BusinessFields";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { TeamMembers } from "./TeamMembers";
import { handleAdvancedSubmit } from "./advanced-handlers";

export default function AdvancedPage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const fieldSchemas = useMemo(() => createAdvancedSchemas(t.advanced), [t]);

  const form = useAppForm({
    ...advancedFormOpts,
    validators: {
      onSubmitAsync: ({ value }) =>
        handleAdvancedSubmit(
          { value },
          {
            simulateError,
            allMessages,
            toast: { toast: toast as unknown as (opts: { description: string; variant: string }) => void },
            unknownError: t.errors.unknown,
            formErrors: t.advanced.formErrors,
            saveSuccess: t.advanced.submitSuccess,
          },
        ),
    },
  });

  const accountType = useStore(form.store, (s) => s.values.accountType);
  const members = useStore(form.store, (s) => s.values.members);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.advanced.heading}</h2>
      </div>

      <FormLevelError form={form} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <fieldset>
          <legend className="mb-2 flex items-center gap-1 text-xs font-semibold">
            {t.advanced.accountType}
            <FieldInfoButton description={t.advanced.accountTypeInfo} />
          </legend>
          <form.AppField name="accountType">
            {(field) => (
              <field.RadioGroupField
                label=""
                options={[
                  { value: "personal", label: t.advanced.personal },
                  { value: "business", label: t.advanced.business },
                ]}
              />
            )}
          </form.AppField>
        </fieldset>

        <Separator />

        <PersonalInfoFields
          form={form}
          fieldSchemas={fieldSchemas}
          t={t.advanced}
        />

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            accountType === "business"
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          {accountType === "business" && (
            <BusinessFields
              form={form}
              fieldSchemas={fieldSchemas}
              t={t.advanced}
            />
          )}
        </div>

        <Separator />

        <TeamMembers
          form={form}
          fieldSchemas={fieldSchemas}
          members={members}
          t={t.advanced}
        />

        <Separator />

        <FormLevelError form={form} />

        <form.AppForm>
          <form.SubmitButton
            label={t.advanced.submit}
            loadingLabel={t.advanced.submitting}
          />
        </form.AppForm>
      </form>
    </div>
  );
}
