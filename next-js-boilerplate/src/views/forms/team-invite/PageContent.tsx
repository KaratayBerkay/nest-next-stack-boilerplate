"use client";

import { useActionState, useMemo, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions, useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import {
  initialFormState,
  mergeForm,
  useTransform,
} from "@tanstack/react-form-nextjs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import { createInviteSchema } from "@/validators/forms/invite";
import { inviteDefaultValues } from "@/validators/forms/invite-inits";
import { inviteAction } from "@/features/forms/actions/invite";

const STEPS = ["Emails", "Role", "Message", "Review"];

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const teamFormOpts = formOptions({
  defaultValues: inviteDefaultValues,
});

async function submitTeamInvite(
  { value }: { value: typeof teamFormOpts.defaultValues },
  deps: {
    simulateError: (scenarioId: string) => Promise<ExceptionResponse>;
    toast: ReturnType<typeof useToast>["toast"];
    allMessages: Record<string, unknown>;
    setQuotaExceeded: (v: boolean) => void;
    unknownError: string;
  },
) {
  if (value.emails.length > 5) {
    try {
      await deps.simulateError("invite-quota");
    } catch (err) {
      const exc = (err as { exception?: ExceptionResponse }).exception;
      if (exc && getSurface(exc.exc) === "full-page") {
        deps.setQuotaExceeded(true);
        return null;
      }
    }
  }
  try {
    const exc = await deps.simulateError("invite-email-member");
    const surface = getSurface(exc.exc);
    if (surface === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.allMessages),
        variant: "destructive",
      });
      return null;
    }
    if (surface === "full-page") {
      return { form: exceptionHandler(exc, deps.allMessages), fields: {} };
    }
    const result = exceptionToFormErrors(exc, deps.allMessages);
    return { form: result.form ?? undefined, fields: result.fields };
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (exc) {
      const surface = getSurface(exc.exc);
      if (surface === "toast") {
        deps.toast({
          description: exceptionHandler(exc, deps.allMessages),
          variant: "destructive",
        });
        return null;
      }
      if (surface === "full-page") {
        return { form: exceptionHandler(exc, deps.allMessages), fields: {} };
      }
      const result = exceptionToFormErrors(exc, deps.allMessages);
      return { form: result.form ?? undefined, fields: result.fields };
    }
    return { form: deps.unknownError, fields: {} };
  }
}

export default function TeamInvitePage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const [step, setStep] = useState(0);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [emailInputError, setEmailInputError] = useState<string | null>(null);
  const [state, action] = useActionState(inviteAction, initialFormState);
  const inviteSchemas = useMemo(() => createInviteSchema(t.teamInvite), [t]);

  const form = useAppForm({
    ...teamFormOpts,
    transform: useTransform((baseForm) => mergeForm(baseForm, state!), [state]),
    validators: {
      onSubmitAsync: ({ value }) =>
        submitTeamInvite(
          { value },
          {
            simulateError,
            toast,
            allMessages,
            setQuotaExceeded,
            unknownError: t.errors.unknown,
          },
        ),
    },
    onSubmit: async () => {
      toast({ description: t.teamInvite.inviteSent, variant: "default" });
    },
  });

  const { emails, role, message } = useStore(form.store, (s) => ({
    emails: s.values.emails,
    role: s.values.role,
    message: s.values.message,
  }));

  const canNext = step === 0 ? emails.length > 0 : true;

  if (quotaExceeded) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold">{t.teamInvite.heading}</h2>
        <div className="surface border-border flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
          <h3 className="text-base font-semibold">{t.teamInvite.quotaTitle}</h3>
          <p className="text-muted text-xs">{t.teamInvite.quotaBody}</p>
          <Button
            onClick={() => {
              setQuotaExceeded(false);
              setStep(0);
            }}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.teamInvite.heading}</h2>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      <FormLevelError form={form} />

      <form
        action={action as never}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (step < 3) return;
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="emails" value={JSON.stringify(emails)} />
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="message" value={message} />

        {step === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">{t.teamInvite.stepEmails}</p>
            <form.AppField name="emailInput">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Input
                      className="flex-1"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        if (emailInputError) setEmailInputError(null);
                      }}
                      onBlur={field.handleBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmed = field.state.value.trim().toLowerCase();
                          if (!trimmed) return;
                          if (!EMAIL_RE.test(trimmed)) {
                            setEmailInputError(t.teamInvite.emailInvalid);
                            return;
                          }
                          if (form.state.values.emails.includes(trimmed)) {
                            setEmailInputError(t.teamInvite.emailDuplicate);
                            return;
                          }
                          setEmailInputError(null);
                          form.pushFieldValue("emails", trimmed);
                          field.handleChange("");
                        }
                      }}
                      placeholder={t.teamInvite.emailPlaceholder}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const trimmed = field.state.value.trim().toLowerCase();
                        if (!trimmed) return;
                        if (!EMAIL_RE.test(trimmed)) {
                          setEmailInputError(t.teamInvite.emailInvalid);
                          return;
                        }
                        if (form.state.values.emails.includes(trimmed)) {
                          setEmailInputError(t.teamInvite.emailDuplicate);
                          return;
                        }
                        setEmailInputError(null);
                        form.pushFieldValue("emails", trimmed);
                        field.handleChange("");
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {emailInputError && (
                    <p className="text-xxs text-error">{emailInputError}</p>
                  )}
                </div>
              )}
            </form.AppField>
            <div className="flex flex-wrap gap-1.5">
              {emails.map((email, index) => {
                const chipError = form.getFieldMeta(`emails[${index}]` as never)
                  ?.errors?.[0];
                return (
                  <div key={email} className="flex flex-col gap-0.5">
                    <span className="bg-emphasis text-xxs flex items-center gap-1 rounded px-2 py-1">
                      {email}
                      <button
                        type="button"
                        onClick={() => form.removeFieldValue("emails", index)}
                        className="text-destructive"
                      >
                        &times;
                      </button>
                    </span>
                    {chipError && (
                      <p className="text-xxs text-error">
                        {chipError as string}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">{t.teamInvite.stepRole}</p>
            <form.AppField
              name="role"
              validators={{ onChange: inviteSchemas.shape.role }}
            >
              {(field) => (
                <field.RadioGroupField
                  label={t.teamInvite.roleLabel}
                  options={ROLE_OPTIONS}
                />
              )}
            </form.AppField>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">{t.teamInvite.stepMessage}</p>
            <form.AppField name="message">
              {(field) => (
                <field.TextareaField
                  label={t.teamInvite.messageLabel}
                  placeholder={t.teamInvite.messagePlaceholder}
                />
              )}
            </form.AppField>
          </div>
        )}

        {step === 3 && (
          <div className="surface border-border flex flex-col gap-2 rounded-lg border p-4">
            <p className="text-xs font-semibold">{t.teamInvite.stepReview}</p>
            <div className="flex flex-col gap-1 text-xs">
              <span>
                {t.teamInvite.emails}: {emails.join(", ")}
              </span>
              <span>
                {t.teamInvite.role}:{" "}
                {ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role}
              </span>
              {message && (
                <span>
                  {t.teamInvite.message}: {message}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            {t.teamInvite.back}
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => Math.min(3, s + 1))}
            >
              {t.teamInvite.next}
            </Button>
          ) : (
            <form.AppForm>
              <form.SubmitButton
                label={t.teamInvite.send}
                loadingLabel={t.teamInvite.sending}
              />
            </form.AppForm>
          )}
        </div>
      </form>
    </div>
  );
}
