"use client";

import { useMemo, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import { z } from "zod";
import { createInviteSchema, inviteSchema } from "@/validators/forms/invite";

const STEPS = ["Emails", "Role", "Message", "Review"];

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const teamFormOpts = formOptions({
  defaultValues: {
    emails: [] as string[],
    emailInput: "",
    role: "member" as "member" | "admin" | "owner",
    message: "",
  } satisfies z.input<typeof inviteSchema> & { emailInput: string },
});

async function submitTeamInvite(
  { value }: { value: typeof teamFormOpts.defaultValues },
  deps: {
    simulateError: (scenarioId: string) => Promise<ExceptionResponse>;
    toast: ReturnType<typeof useToast>["toast"];
    allMessages: Record<string, unknown>;
    setFormError: (err: string | null) => void;
  },
) {
  try {
    const exc = await deps.simulateError("invite-email-member");
    const surface = getSurface(exc.exc);
    if (surface === "toast") {
      deps.toast({ description: exceptionHandler(exc, deps.allMessages), variant: "destructive" });
      return null;
    }
    if (surface === "full-page") {
      deps.setFormError(exceptionHandler(exc, deps.allMessages));
      return null;
    }
    const result = exceptionToFormErrors(exc, deps.allMessages);
    return { form: result.form ?? undefined, fields: result.fields };
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (exc) {
      const surface = getSurface(exc.exc);
      if (surface === "toast") {
        deps.toast({ description: exceptionHandler(exc, deps.allMessages), variant: "destructive" });
        return null;
      }
      if (surface === "full-page") {
        deps.setFormError(exceptionHandler(exc, deps.allMessages));
        return null;
      }
      const result = exceptionToFormErrors(exc, deps.allMessages);
      return { form: result.form ?? undefined, fields: result.fields };
    }
    return { form: "An unexpected error occurred", fields: {} };
  }
}

export default function TeamInvitePage() {
  const t = useMessages("forms");
  const allMessages = useAllMessages();
  const { toast } = useToast();
  const { simulateError } = useFormsDemoActions();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const inviteSchemas = useMemo(() => createInviteSchema(t.teamInvite), [t]);

  const form = useAppForm({
    ...teamFormOpts,
    validators: {
      onSubmitAsync: ({ value }) =>
        submitTeamInvite({ value }, { simulateError, toast, allMessages, setFormError }),
    },
  });

  const canNext = step === 0 ? form.state.values.emails.length > 0 : true;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.teamInvite.heading}</h2>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      {formError && <FormErrorBanner message={formError} onDismiss={() => setFormError(null)} />}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (step < 3) return;
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">{t.teamInvite.stepEmails}</p>
            <form.AppField name="emailInput">
              {(field) => (
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = field.state.value.trim().toLowerCase();
                        if (!trimmed) return;
                        if (!EMAIL_RE.test(trimmed)) return;
                        if (form.state.values.emails.includes(trimmed)) return;
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
                      if (!EMAIL_RE.test(trimmed)) return;
                      if (form.state.values.emails.includes(trimmed)) return;
                      form.pushFieldValue("emails", trimmed);
                      field.handleChange("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </form.AppField>
            <div className="flex flex-wrap gap-1.5">
              {form.state.values.emails.map((email, index) => {
                const chipError = form.getFieldMeta(`emails[${index}]` as never)?.errors?.[0];
                return (
                  <div key={email} className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1 rounded bg-emphasis px-2 py-1 text-xxs">
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
                      <p className="text-xxs text-error">{chipError as string}</p>
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
            <form.AppField name="role" validators={{ onChange: inviteSchemas.shape.role }}>
              {(field) => (
                <field.RadioGroupField label={t.teamInvite.roleLabel} options={ROLE_OPTIONS} />
              )}
            </form.AppField>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">{t.teamInvite.stepMessage}</p>
            <form.AppField name="message">
              {(field) => (
                <field.TextareaField label={t.teamInvite.messageLabel} placeholder={t.teamInvite.messagePlaceholder} />
              )}
            </form.AppField>
          </div>
        )}

        {step === 3 && (
          <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
            <p className="text-xs font-semibold">{t.teamInvite.stepReview}</p>
            <div className="flex flex-col gap-1 text-xs">
              <span>Emails: {form.state.values.emails.join(", ")}</span>
              <span>Role: {ROLE_OPTIONS.find((r) => r.value === form.state.values.role)?.label ?? form.state.values.role}</span>
              {form.state.values.message && <span>Message: {form.state.values.message}</span>}
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
            <Button type="button" disabled={!canNext} onClick={() => setStep((s) => Math.min(3, s + 1))}>
              {t.teamInvite.next}
            </Button>
          ) : (
            <Button type="submit">{t.teamInvite.send}</Button>
          )}
        </div>
      </form>
    </div>
  );
}
