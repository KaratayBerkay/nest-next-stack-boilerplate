"use client";

import { useCallback, useState } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { formOptions } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { Button } from "@/components/ui/Button";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { FormErrorBanner } from "@/components/ui/FormErrorBanner";

const STEPS = ["Emails", "Role", "Message", "Review"];

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

const teamFormOpts = formOptions({
  defaultValues: {
    emails: [] as string[],
    role: "member" as string,
    message: "",
  },
});

export default function TeamInvitePage() {
  const t = useMessages("forms");
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [inputEmail, setInputEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const form = useAppForm(teamFormOpts);

  const handleAddEmail = useCallback(() => {
    const email = inputEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Invalid email format");
      return;
    }
    if (form.state.values.emails.includes(email)) {
      setFormError(t.teamInvite.emailDuplicate);
      return;
    }
    form.setFieldValue("emails", [...form.state.values.emails, email]);
    setInputEmail("");
    setFormError(null);
  }, [inputEmail, form, t]);

  const handleRemoveEmail = useCallback((email: string) => {
    form.setFieldValue("emails", form.state.values.emails.filter((e: string) => e !== email));
  }, [form]);

  const handleSend = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1500));
    toast({ description: t.teamInvite.inviteSent, variant: "default" });
    form.reset();
    setStep(0);
  }, [toast, t, form]);

  const canNext = useCallback(() => {
    if (step === 0) return form.state.values.emails.length > 0;
    return true;
  }, [step, form.state.values.emails.length]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.teamInvite.heading}</h2>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      {formError && <FormErrorBanner message={formError} onDismiss={() => setFormError(null)} />}

      <form className="flex flex-col gap-4">
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">{t.teamInvite.stepEmails}</p>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded border border-border bg-field px-2 py-1.5 text-xs"
                placeholder={t.teamInvite.emailPlaceholder}
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddEmail(); } }}
              />
              <Button size="sm" variant="outline" onClick={handleAddEmail}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.state.values.emails.map((email: string) => (
                <span key={email} className="flex items-center gap-1 rounded bg-emphasis px-2 py-1 text-xxs">
                  {email}
                  <button onClick={() => handleRemoveEmail(email)} className="text-destructive">&times;</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium">{t.teamInvite.stepRole}</p>
            <form.AppField name="role">
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
            <Button type="button" disabled={!canNext()} onClick={() => setStep((s) => Math.min(3, s + 1))}>
              {t.teamInvite.next}
            </Button>
          ) : (
            <Button type="button" onClick={handleSend}>{t.teamInvite.send}</Button>
          )}
        </div>
      </form>
    </div>
  );
}
