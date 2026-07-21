"use client";

import { useMemo } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { Separator } from "@/components/ui/Separator";
import { Button } from "@/components/ui/Button";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { advancedFormOpts } from "@/validators/forms/advanced-inits";
import { createAdvancedSchemas } from "@/validators/forms/advanced";
import type { ExceptionResponse } from "@/lib/api-client";

const EMPTY_MEMBER = { name: "", email: "", role: "" };

const ROLE_OPTIONS = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "manager", label: "Manager" },
  { value: "viewer", label: "Viewer" },
];

const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "other", label: "Other" },
];

async function handleAdvancedSubmit(
  { value: _value }: { value: typeof advancedFormOpts.defaultValues },
  deps: {
    simulateError: (id: string) => Promise<ExceptionResponse>;
    allMessages: Record<string, unknown>;
    toast: ReturnType<typeof useToast>["toast"];
    unknownError: string;
    formErrors: string;
    saveSuccess: string;
  },
) {
  try {
    await deps.simulateError("email-taken");
    deps.toast({ description: deps.saveSuccess, variant: "default" });
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return { form: deps.unknownError, fields: {} };

    const { form: formError, fields } = exceptionToFormErrors(
      exc,
      deps.allMessages,
    );

    if (formError) return { form: formError, fields };

    return { form: deps.formErrors, fields };
  }
}

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
            toast,
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
          <legend className="mb-2 text-xs font-semibold">
            {t.advanced.accountType}
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

        <form.AppField
          name="fullName"
          validators={{ onChange: fieldSchemas.fullName }}
        >
          {(field) => <field.TextField label={t.advanced.fullName} required />}
        </form.AppField>

        <form.AppField
          name="email"
          validators={{ onChange: fieldSchemas.email }}
        >
          {(field) => <field.TextField label={t.advanced.email} required />}
        </form.AppField>

        <form.AppField
          name="password"
          validators={{ onChange: fieldSchemas.password }}
        >
          {(field) => <field.TextField label={t.advanced.password} required />}
        </form.AppField>

        {accountType === "business" && (
          <>
            <Separator />

            <p className="text-xxs text-muted">{t.advanced.business}</p>

            <form.AppField
              name="companyName"
              validators={{ onChange: fieldSchemas.companyName }}
            >
              {(field) => (
                <field.TextField label={t.advanced.companyName} required />
              )}
            </form.AppField>

            <form.AppField
              name="taxId"
              validators={{ onChange: fieldSchemas.taxId }}
            >
              {(field) => <field.TextField label={t.advanced.taxId} required />}
            </form.AppField>

            <form.AppField
              name="industry"
              validators={{ onChange: fieldSchemas.industry }}
            >
              {(field) => (
                <field.SelectField
                  label={t.advanced.industry}
                  placeholder={t.advanced.industry}
                  options={INDUSTRY_OPTIONS}
                />
              )}
            </form.AppField>
          </>
        )}

        <Separator />

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold">{t.advanced.teamMembers}</p>

          {members.map((_, i) => (
            <div
              key={i}
              className="border-border surface flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xxs text-muted">
                  {t.advanced.memberName} {i + 1}
                </span>
                <button
                  type="button"
                  className="text-destructive text-xxs hover:underline"
                  onClick={() => form.removeFieldValue("members", i)}
                >
                  {t.advanced.removeMember}
                </button>
              </div>

              <form.AppField
                name={`members[${i}].name`}
                validators={{ onChange: fieldSchemas.memberName }}
              >
                {(field) => (
                  <field.TextField label={t.advanced.memberName} required />
                )}
              </form.AppField>

              <form.AppField
                name={`members[${i}].email`}
                validators={{ onChange: fieldSchemas.memberEmail }}
              >
                {(field) => (
                  <field.TextField label={t.advanced.memberEmail} required />
                )}
              </form.AppField>

              <form.AppField
                name={`members[${i}].role`}
                validators={{ onChange: fieldSchemas.memberRole }}
              >
                {(field) => (
                  <field.SelectField
                    label={t.advanced.memberRole}
                    placeholder={t.advanced.memberRole}
                    options={ROLE_OPTIONS}
                  />
                )}
              </form.AppField>
            </div>
          ))}

          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                form.pushFieldValue("members", { ...EMPTY_MEMBER })
              }
            >
              {t.advanced.addMember}
            </Button>
          </div>
        </div>

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
