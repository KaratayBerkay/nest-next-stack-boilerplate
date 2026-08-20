"use client";

import { useState, type FormEvent } from "react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import { changePasswordFormSchema } from "@/validators/auth/schema";
import { useAuthActions } from "@/api/client/auth/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PasswordRequirements } from "@/features/auth/ui/PasswordRequirements";
import type { SecurityChangePasswordProps } from "@/types/views/settings/SecurityPageContent-types";

export function SecurityChangePassword({ t }: SecurityChangePasswordProps) {
  const tAuth = useMessages("auth");
  const { toast } = useToast();
  const { changePassword } = useAuthActions();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const schema = changePasswordFormSchema({
    currentPasswordRequired: tAuth.errors.currentPasswordRequired,
    passwordRequired: tAuth.errors.passwordRequired,
    passwordMin: tAuth.errors.passwordMin,
    passwordMax: tAuth.errors.passwordMax,
    passwordsMustMatch: tAuth.errors.passwordsMustMatch,
    passwordLowercase: tAuth.errors.passwordLowercase,
    passwordUppercase: tAuth.errors.passwordUppercase,
    passwordNumber: tAuth.errors.passwordNumber,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = schema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const errors: Record<string, string> = {};
      for (const [field, msgs] of Object.entries(flat)) {
        if (msgs && msgs.length > 0) errors[field] = msgs[0];
      }
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({ title: t.securityChangePasswordSuccess, variant: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const exception = (err as Error & { exception?: { msg?: string } })
        .exception;
      toast({
        title: exception?.msg ?? t.securityChangePasswordFailed,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted text-sm">
        {t.securityChangePasswordDescription}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="current-password-input" required>
            {t.securityCurrentPasswordLabel}
          </Label>
          <Input
            id="current-password-input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            error={fieldErrors.currentPassword}
          />
          {fieldErrors.currentPassword && (
            <p className="text-error mt-0.5 text-xs">
              {fieldErrors.currentPassword}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="new-password-input" required>
            {t.securityNewPasswordLabel}
          </Label>
          <Input
            id="new-password-input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            error={fieldErrors.newPassword}
          />
          {fieldErrors.newPassword && (
            <p className="text-error mt-0.5 text-xs">
              {fieldErrors.newPassword}
            </p>
          )}
          <PasswordRequirements password={newPassword} />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="confirm-new-password-input" required>
            {t.securityConfirmNewPasswordLabel}
          </Label>
          <Input
            id="confirm-new-password-input"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            error={fieldErrors.confirmNewPassword}
          />
          {fieldErrors.confirmNewPassword && (
            <p className="text-error mt-0.5 text-xs">
              {fieldErrors.confirmNewPassword}
            </p>
          )}
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting
            ? t.securityChangePasswordSubmitting
            : t.securityChangePasswordSubmit}
        </Button>
      </form>
    </div>
  );
}
