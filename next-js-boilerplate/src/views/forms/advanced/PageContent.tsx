"use client";

import { useMemo } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { Separator } from "@/components/ui/Separator";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Button } from "@/components/ui/Button";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { advancedFormOpts } from "@/validators/forms/advanced-inits";
import { createAdvancedSchemas } from "@/validators/forms/advanced";
import type { ExceptionResponse } from "@/lib/api-client";

const EMPTY_MEMBER = { name: "", email: "", role: "" };

const ROLE_OPTIONS = (t: Record<string, string>) => [
  { value: "developer", label: t.roleDeveloper },
  { value: "designer", label: t.roleDesigner },
  { value: "manager", label: t.roleManager },
  { value: "viewer", label: t.roleViewer },
];

const INDUSTRY_OPTIONS = (t: Record<string, string>) => [
  { value: "technology", label: t.industryTechnology },
  { value: "finance", label: t.industryFinance },
  { value: "healthcare", label: t.industryHealthcare },
  { value: "education", label: t.industryEducation },
  { value: "ecommerce", label: t.industryEcommerce },
  { value: "other", label: t.industryOther },
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

        <form.AppField
          name="fullName"
          validators={{ onChange: fieldSchemas.fullName }}
        >
          {(field) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.advanced.fullName}
                placeholder={t.advanced.fullNamePlaceholder}
                required
              />
              <FieldInfoButton description={t.advanced.fullNameInfo} />
            </div>
          )}
        </form.AppField>

        <form.AppField
          name="email"
          validators={{ onChange: fieldSchemas.email }}
        >
          {(field) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.advanced.email}
                placeholder={t.advanced.emailPlaceholder}
                required
              />
              <FieldInfoButton description={t.advanced.emailInfo} />
            </div>
          )}
        </form.AppField>

        <form.AppField
          name="password"
          validators={{ onChange: fieldSchemas.password }}
        >
          {(field) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.advanced.password}
                placeholder={t.advanced.passwordPlaceholder}
                required
              />
              <FieldInfoButton description={t.advanced.passwordInfo} />
            </div>
          )}
        </form.AppField>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            accountType === "business"
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          {accountType === "business" && (
            <div className="flex flex-col gap-4">
              <Separator />

              <p className="text-xxs text-muted">{t.advanced.business}</p>

              <form.AppField
                name="companyName"
                validators={{ onChange: fieldSchemas.companyName }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.advanced.companyName}
                      placeholder={t.advanced.companyNamePlaceholder}
                      required
                    />
                    <FieldInfoButton description={t.advanced.companyNameInfo} />
                  </div>
                )}
              </form.AppField>

              <form.AppField
                name="taxId"
                validators={{ onChange: fieldSchemas.taxId }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.advanced.taxId}
                      placeholder={t.advanced.taxIdPlaceholder}
                      required
                    />
                    <FieldInfoButton description={t.advanced.taxIdInfo} />
                  </div>
                )}
              </form.AppField>

              <form.AppField
                name="industry"
                validators={{ onChange: fieldSchemas.industry }}
              >
                {(field) => (
                  <field.SelectField
                    label={t.advanced.industry}
                    placeholder={t.advanced.industry}
                    options={INDUSTRY_OPTIONS(t.advanced)}
                  />
                )}
              </form.AppField>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold">{t.advanced.teamMembers}</p>
            <FieldInfoButton description={t.advanced.teamMembersInfo} />
          </div>

          {members.map((_, i) => (
            <div
              key={i}
              className="animate-fade-in border-border surface flex flex-col gap-3 rounded-lg border p-3"
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
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.advanced.memberName}
                      placeholder={t.advanced.memberNamePlaceholder}
                      required
                    />
                    <FieldInfoButton description={t.advanced.memberNameInfo} />
                  </div>
                )}
              </form.AppField>

              <form.AppField
                name={`members[${i}].email`}
                validators={{ onChange: fieldSchemas.memberEmail }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.advanced.memberEmail}
                      placeholder={t.advanced.memberEmailPlaceholder}
                      required
                    />
                    <FieldInfoButton description={t.advanced.memberEmailInfo} />
                  </div>
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
                    options={ROLE_OPTIONS(t.advanced)}
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
