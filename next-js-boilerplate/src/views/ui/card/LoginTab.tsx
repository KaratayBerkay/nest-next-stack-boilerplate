"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cardLoginFormSchema } from "@/validators/auth/schema";
import { LoginForm } from "./LoginForm";

export function LoginTab() {
  const t = useMessages("auth");
  const router = useRouter();
  const pathname = usePathname();
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginSchema = cardLoginFormSchema({
    emailRequired: t.errors.emailRequired,
    emailInvalid: t.errors.emailInvalid,
    passwordRequired: t.errors.passwordRequired,
    passwordMin6: t.errors.passwordMin6,
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async () => {
      setFormError(null);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setFormError(t.errors.loginFailed);
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
          {t.form.login.heading}
        </h2>
      </div>

      <LoginForm
        form={form}
        loginSchema={loginSchema}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        formError={formError}
        t={t}
      />

      <p className="text-muted mt-10 text-center text-sm">
        {t.form.login.noAccount}{" "}
        <button
          type="button"
          onClick={() => router.push(`${pathname}?tab=register`)}
          className="text-brand hover:text-brand/80 font-semibold"
        >
          {t.form.login.registerLink}
        </button>
      </p>
    </div>
  );
}
