"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LOGIN_PATH } from "@/constants/routes";
import Link from "next/link";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { registerFormSchema } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const t = useMessages("auth");
  const { register, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const schema = registerFormSchema(t.errors);

  if (loading) {
    return <p className="text-muted text-sm">{t.loading}</p>;
  }

  if (user) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-green-600">
          {t.signedInAs.replace("{email}", user.email)}
        </p>
        <p className="text-muted text-xs">
          {t.role} {user.role} &middot; {t.status} {user.status}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = schema.safeParse({ email, password, name: name || undefined });
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
      await register(email, password, name || undefined);
    } catch (err) {
      const exc = (err as { exc?: string; field?: string; msg?: string }).exc;
      const field = (err as { field?: string }).field;
      const msg = (err as { msg?: string }).msg;
      if (exc === "EX_AUTH_EMAIL_TAKEN" || field === "email") {
        setFieldErrors({ email: msg ?? t.errors.emailTaken });
      } else if (field) {
        setFieldErrors({ [field]: msg ?? t.errors.registerFailed });
      } else {
        setFieldErrors({ form: t.errors.registerFailed });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-center">
      <h2 className="text-brand text-sm font-semibold">{t.form.register.title}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="reg-name-input">
            {t.form.register.nameLabel}
          </Label>
          <Input
            id="reg-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.form.register.namePlaceholder}
            data-testid="reg-name"
          />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="reg-email-input" required>
            {t.form.register.emailLabel}
          </Label>
          <Input
            id="reg-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={fieldErrors.email}
            data-testid="reg-email"
          />
          {fieldErrors.email && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <Label htmlFor="reg-password-input" required>
            {t.form.register.passwordLabel}
          </Label>
          <Input
            id="reg-password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            error={fieldErrors.password}
            data-testid="reg-password"
          />
          {fieldErrors.password && (
            <p className="mt-0.5 text-xs text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        {fieldErrors.form && (
          <p className="text-sm text-red-600" data-testid="reg-error">
            {fieldErrors.form}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          data-testid="reg-submit"
        >
          {submitting ? t.form.register.submitting : t.form.register.submit}
        </Button>
      </form>

      <p className="text-muted text-xs">
        {t.form.register.hasAccount}{" "}
        <Link href={LOGIN_PATH} className="text-brand underline">
          {t.form.register.loginLink}
        </Link>
      </p>
    </div>
  );
}
