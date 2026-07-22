"use client";

import { useActionState, useMemo, useState } from "react";
import { useMessages, useAllMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import {
  initialFormState,
  mergeForm,
  useTransform,
} from "@tanstack/react-form-nextjs";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { useFormsDemoActions } from "@/api/client/forms-demo/actions";
import { createInviteSchema } from "@/validators/forms/invite";
import { inviteAction } from "@/features/forms/actions/invite";
import { STEPS, teamFormOpts, submitTeamInvite } from "./config";
import { EmailsStep } from "./EmailsStep";
import { RoleStep } from "./RoleStep";
import { MessageStep } from "./MessageStep";
import { ReviewStep } from "./ReviewStep";
import { NavigationButtons } from "./NavigationButtons";
import { QuotaExceeded } from "./QuotaExceeded";

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
      <QuotaExceeded
        heading={t.teamInvite.heading}
        quotaTitle={t.teamInvite.quotaTitle}
        quotaBody={t.teamInvite.quotaBody}
        onReset={() => {
          setQuotaExceeded(false);
          setStep(0);
        }}
      />
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
          <EmailsStep
            form={form}
            t={t.teamInvite}
            emailInputError={emailInputError}
            setEmailInputError={setEmailInputError}
          />
        )}

        {step === 1 && (
          <RoleStep form={form} t={t.teamInvite} roleSchema={inviteSchemas} />
        )}

        {step === 2 && <MessageStep form={form} t={t.teamInvite} />}

        {step === 3 && (
          <ReviewStep
            emails={emails}
            role={role}
            message={message}
            t={t.teamInvite}
          />
        )}

        <NavigationButtons
          step={step}
          setStep={setStep}
          canNext={canNext}
          t={t.teamInvite}
          form={form}
        />
      </form>
    </div>
  );
}
