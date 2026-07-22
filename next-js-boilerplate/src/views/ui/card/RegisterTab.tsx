"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cardRegisterFormSchema } from "@/validators/auth/schema";
import { RegisterForm } from "./RegisterForm";

export function RegisterTab() {
  const t = useMessages("auth");
  const router = useRouter();
  const pathname = usePathname();
  const [formError, setFormError] = useState<string | null>(null);

  const registerSchema = cardRegisterFormSchema({
    firstNameRequired: t.errors.firstNameRequired,
    lastNameRequired: t.errors.lastNameRequired,
    emailRequired: t.errors.emailRequired,
    emailInvalid: t.errors.emailInvalid,
    passwordRequired: t.errors.passwordRequired,
    passwordMin6: t.errors.passwordMin6,
    confirmPasswordRequired: t.errors.confirmPasswordRequired,
    passwordsMustMatch: t.errors.passwordsMustMatch,
  });

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async () => {
      setFormError(null);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setFormError(t.errors.registerFailed);
    },
  });

  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-6 text-center">
        <svg
          className="mx-auto h-10 w-auto"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="40" rx="8" className="fill-brand" />
          <path
            d="M12 20L18 26L28 14"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="mt-4 text-2xl font-bold tracking-tight">
          {t.form.register.heading}
        </h2>
        <p className="text-muted mt-1 text-sm">{t.form.register.subheading}</p>
      </div>

      <RegisterForm
        form={form}
        registerSchema={registerSchema}
        formError={formError}
        t={t}
      />

      <p className="text-muted mt-10 text-center text-sm">
        {t.form.register.hasAccount}{" "}
        <button
          type="button"
          onClick={() => router.push(`${pathname}?tab=login`)}
          className="text-brand hover:text-brand/80 font-semibold"
        >
          {t.form.register.loginLink}
        </button>
      </p>
    </div>
  );
}
