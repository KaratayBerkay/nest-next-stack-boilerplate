"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { FieldMessages } from "@/components/ui/field-messages";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { cn } from "@/lib/cn";
import { cardLoginFormSchema, cardRegisterFormSchema } from "@/lib/validation/auth";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

// ---------- Shared ----------

function FieldInfo({ field }: { field: AnyFieldApi }) {
  if (field.state.meta.errors.length === 0) return null;
  return (
    <p className="text-destructive mt-1 text-xs" role="alert">
      {field.state.meta.errors
        .map((e) => (typeof e === "string" ? e : e?.message))
        .filter(Boolean)
        .join(", ")}
    </p>
  );
}

// ---------- Login Tab ----------

function LoginTab() {
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

      <Card className="w-full max-w-[480px]">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="email"
              validators={{
                onChange: loginSchema.shape.email,
                onBlur: loginSchema.shape.email,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium"
                  >
                    {t.form.login.emailLabel}
                  </label>
                  <div className="mt-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder={t.form.login.emailPlaceholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={
                        field.state.meta.errors.length > 0
                          ? field.state.meta.errors
                              .map((e) =>
                                typeof e === "string" ? e : e?.message,
                              )
                              .filter(Boolean)
                              .join(", ")
                          : undefined
                      }
                    />
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: loginSchema.shape.password,
                onBlur: loginSchema.shape.password,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium"
                  >
                    {t.form.login.passwordLabel}
                  </label>
                  <div className="mt-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      placeholder={t.form.login.passwordPlaceholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={
                        field.state.meta.errors.length > 0
                          ? field.state.meta.errors
                              .map((e) =>
                                typeof e === "string" ? e : e?.message,
                              )
                              .filter(Boolean)
                              .join(", ")
                          : undefined
                      }
                    />
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="text-sm">
                  {t.form.login.rememberMe}
                </label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  className="text-brand hover:text-brand/80 font-semibold"
                >
                  {t.form.login.forgotPassword}
                </button>
              </div>
            </div>

            {formError && <FieldMessages error={formError} />}

            <div>
              <form.Subscribe
                selector={(s) => [s.canSubmit, s.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? t.form.login.submitting : t.form.login.submit}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center gap-x-6">
              <div className="bg-border h-px flex-1" />
              <p className="text-muted text-sm font-medium text-nowrap">
                {t.social.continueWith}
              </p>
              <div className="bg-border h-px flex-1" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="bg-surface hover:bg-surface-hover flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset ring-border transition-colors"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="bg-surface hover:bg-surface-hover flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset ring-border transition-colors"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

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

// ---------- Register Tab ----------

function RegisterTab() {
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
        <p className="text-muted mt-1 text-sm">
          {t.form.register.subheading}
        </p>
      </div>

      <Card className="w-full max-w-[480px]">
        <CardContent className="pt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="firstName"
                validators={{
                  onChange: registerSchema.shape.firstName,
                  onBlur: registerSchema.shape.firstName,
                }}
              >
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium"
                    >
                      {t.form.register.firstNameLabel}
                    </label>
                    <div className="mt-2">
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        autoComplete="given-name"
                        placeholder={t.form.register.firstNamePlaceholder}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="lastName"
                validators={{
                  onChange: registerSchema.shape.lastName,
                  onBlur: registerSchema.shape.lastName,
                }}
              >
                {(field) => (
                  <div>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium"
                    >
                      {t.form.register.lastNameLabel}
                    </label>
                    <div className="mt-2">
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        autoComplete="family-name"
                        placeholder={t.form.register.lastNamePlaceholder}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field
              name="email"
              validators={{
                onChange: registerSchema.shape.email,
                onBlur: registerSchema.shape.email,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium"
                  >
                    {t.form.register.emailLabel}
                  </label>
                  <div className="mt-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      placeholder={t.form.register.emailPlaceholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: registerSchema.shape.password,
                onBlur: registerSchema.shape.password,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium"
                  >
                    {t.form.register.passwordLabel}
                  </label>
                  <div className="mt-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder={t.form.register.passwordPlaceholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                onChange: registerSchema.shape.confirmPassword,
                onBlur: registerSchema.shape.confirmPassword,
              }}
            >
              {(field) => (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium"
                  >
                    {t.form.register.confirmPasswordLabel}
                  </label>
                  <div className="mt-2">
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder={t.form.register.confirmPasswordPlaceholder}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            {formError && <FieldMessages error={formError} />}

            <div>
              <form.Subscribe
                selector={(s) => [s.canSubmit, s.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={!canSubmit}
                  >
                    {isSubmitting
                      ? t.form.register.submitting
                      : t.form.register.submit}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative flex items-center gap-x-6">
              <div className="bg-border h-px flex-1" />
              <p className="text-muted text-sm font-medium text-nowrap">
                {t.social.continueWith}
              </p>
              <div className="bg-border h-px flex-1" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="bg-surface hover:bg-surface-hover flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset ring-border transition-colors"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="bg-surface hover:bg-surface-hover flex w-full items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-semibold shadow-xs ring-1 ring-inset ring-border transition-colors"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

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

// ---------- Profile Card Tab ----------

function handleLike(
  liked: boolean,
  setLiked: React.Dispatch<React.SetStateAction<boolean>>,
  setCount: React.Dispatch<React.SetStateAction<number>>,
) {
  setLiked((p) => !p);
  setCount((c) => (liked ? c - 1 : c + 1));
}

function ProfileCardTab() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(42);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Profile Card</h3>
        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-muted size-12 rounded-full" />
              <div>
                <CardTitle>Sarah Johnson</CardTitle>
                <CardDescription>Frontend Developer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Passionate about building beautiful user interfaces and
              design systems.
            </p>
            <div className="mt-4 flex gap-2">
              <Badge>React</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button size="sm" variant="outline">
              Message
            </Button>
            <Button size="sm">Follow</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Project Card with Like</h3>
        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Tailwind CSS</CardTitle>
                <CardDescription>
                  A utility-first CSS framework
                </CardDescription>
              </div>
              <Badge variant="success">Stable</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Rapidly build modern websites without ever leaving your
              HTML.
            </p>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <span className="text-muted text-xs">{count} likes</span>
            <Button
              size="sm"
              variant={liked ? "default" : "outline"}
              onClick={() => handleLike(liked, setLiked, setCount)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
              {liked ? "Liked" : "Like"}
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

// ---------- Stats Dashboard Tab ----------

function StatsDashboardTab() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Stats Dashboard</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">$45,231.89</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">+20.1% from last month</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Subscriptions</CardDescription>
            <CardTitle className="text-2xl">+2,350</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">+180.1% from last month</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-2xl">+12,234</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="info">+19% from last month</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Feature Cards Tab ----------

function FeatureCardsTab() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Feature Cards</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Blazing fast performance with optimized rendering and
              lazy loading.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Enterprise-grade security with encryption at rest and in
              transit.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scalability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Scales effortlessly from small projects to enterprise
              applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------- Pricing Tiers Tab ----------

const tiers = [
  {
    name: "Starter",
    price: 19,
    description: "Perfect for side projects and experiments.",
    cta: "Start free trial",
    popular: false,
    logos: ["Vercel", "Netlify", "Cloudflare"],
  },
  {
    name: "Professional",
    price: 49,
    description: "For growing teams that need more power.",
    cta: "Start free trial",
    popular: true,
    logos: ["Stripe", "Supabase", "PlanetScale"],
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For large organizations with custom needs.",
    cta: "Contact sales",
    popular: false,
    logos: ["AWS", "Google Cloud", "Azure"],
  },
];

const sections = [
  {
    name: "Features",
    features: [
      {
        name: "Cloud storage",
        tiers: ["5 GB", "50 GB", "Unlimited"],
      },
      {
        name: "Team members",
        tiers: ["1", "Up to 10", "Unlimited"],
      },
      {
        name: "API requests",
        tiers: ["10k / mo", "100k / mo", "Unlimited"],
      },
      {
        name: "Integrations",
        tiers: ["Basic", "Advanced", "Custom"],
      },
    ],
  },
  {
    name: "Support",
    features: [
      {
        name: "Community forum",
        tiers: [true, true, true],
      },
      {
        name: "Email support",
        tiers: [true, true, true],
      },
      {
        name: "Priority chat support",
        tiers: [false, true, true],
      },
      {
        name: "Dedicated account manager",
        tiers: [false, false, true],
      },
      {
        name: "Custom SLA",
        tiers: [false, false, true],
      },
    ],
  },
  {
    name: "Security & Compliance",
    features: [
      {
        name: "SSL certificates",
        tiers: [true, true, true],
      },
      {
        name: "SOC 2 Type II",
        tiers: [false, true, true],
      },
      {
        name: "SSO / SAML",
        tiers: [false, false, true],
      },
      {
        name: "Custom data retention",
        tiers: [false, false, true],
      },
    ],
  },
];

function CheckIcon() {
  return (
    <svg
      className="text-brand h-5 w-5 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      className="text-muted/40 h-5 w-5 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" />
    </svg>
  );
}

function PricingTiersTab() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="isolate grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.name;
          return (
            <button
              key={tier.name}
              type="button"
              onClick={() => setSelectedTier(isSelected ? null : tier.name)}
              className={cn(
                "rounded-xl border p-8 flex flex-col text-left transition-all duration-200 cursor-pointer",
                "hover:shadow-md",
                isSelected
                  ? "border-brand ring-2 ring-brand/50 shadow-lg scale-[1.02]"
                  : tier.popular
                    ? "border-brand/50 bg-surface relative ring-1 ring-brand/20"
                    : "border-border bg-surface",
              )}
            >
              {tier.popular && !isSelected && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              {isSelected && (
                <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Selected
                </Badge>
              )}

              <div className="flex items-center gap-3 mb-4">
                {tier.logos.map((logo) => (
                  <span
                    key={logo}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                      isSelected
                        ? "bg-brand/15 text-brand"
                        : "bg-muted/30 text-muted",
                    )}
                  >
                    {logo[0]}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="text-muted mt-1 text-sm">{tier.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  ${tier.price}
                </span>
                <span className="text-muted text-sm font-medium">/month</span>
              </div>

              <div
                className={cn(
                  "mt-8 w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-brand text-white"
                    : tier.popular
                      ? "bg-brand text-white"
                      : "border border-border text-fg",
                )}
              >
                {isSelected ? "Selected" : tier.cta}
              </div>

              <p className="text-muted mt-3 text-center text-xs">
                14-day free trial &middot; No credit card required
              </p>
            </button>
          );
        })}
      </div>

      {selectedTier && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" className="px-12">
            Pay for {selectedTier}
          </Button>
        </div>
      )}

      {/* Feature comparison table */}
      <div className="mt-16">
        <h3 className="text-xl font-bold text-center mb-8">
          Compare features across all tiers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="py-3.5 pr-4 text-left font-semibold" />
                {tiers.map((tier) => (
                  <th
                    key={tier.name}
                    className={cn(
                      "px-4 py-3.5 text-center font-semibold",
                      selectedTier === tier.name
                        ? "text-brand"
                        : tier.popular && !selectedTier
                          ? "text-brand"
                          : "",
                    )}
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <>
                  <tr key={section.name}>
                    <td
                      colSpan={4}
                      className="text-muted pt-8 pb-2 text-xs font-semibold uppercase tracking-wider"
                    >
                      {section.name}
                    </td>
                  </tr>
                  {section.features.map((feature) => (
                    <tr
                      key={feature.name}
                      className="border-border border-b"
                    >
                      <td className="py-4 pr-4 text-fg font-medium">
                        {feature.name}
                      </td>
                      {feature.tiers.map((value, i) => (
                        <td
                          key={i}
                          className={cn(
                            "px-4 py-4 text-center",
                            tiers[i]?.popular && "bg-brand/5",
                          )}
                        >
                          {typeof value === "boolean" ? (
                            value ? (
                              <CheckIcon />
                            ) : (
                              <MinusIcon />
                            )
                          ) : (
                            <span className="text-fg">{value}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- Variant Gallery Tab ----------

function VariantGalleryTab() {
  return (
    <VariantGallery
      variants={["default", "elevated", "interactive"]}
      sizes={["sm", "md", "lg"]}
      render={(variant, size) => (
        <Card
          variant={
            variant as
              | "default"
              | "elevated"
              | "interactive"
              | "outline"
              | "surface"
          }
          className="min-w-32"
        >
          <CardContent
            className={
              size === "sm" ? "p-3" : size === "lg" ? "p-6" : "p-4"
            }
          >
            <p className="text-muted text-xs">
              Variant: {variant}
              <br />
              Size: {size}
            </p>
          </CardContent>
        </Card>
      )}
    />
  );
}

// ---------- Page ----------

export default function CardPage({ initialTab }: { initialTab?: string }) {
  const examples: UIExample[] = [
    {
      id: "profile-card",
      title: "Profile Card",
      description: "Profile card with avatar, badges, and action buttons.",
      render: () => <ProfileCardTab />,
    },
    {
      id: "stats-dashboard",
      title: "Stats Dashboard",
      description: "Stats cards showing revenue, subscriptions, and active users.",
      render: () => <StatsDashboardTab />,
    },
    {
      id: "feature-cards",
      title: "Feature Cards",
      description: "Feature highlight cards in a responsive grid.",
      render: () => <FeatureCardsTab />,
    },
    {
      id: "login",
      title: "Login",
      description: "Login card with email, password, remember-me, and validation.",
      render: () => <LoginTab />,
    },
    {
      id: "register",
      title: "Register",
      description: "Registration form with personal information fields and social login.",
      render: () => <RegisterTab />,
    },
    {
      id: "pricing-tiers",
      title: "Pricing Tiers",
      description: "Three-column pricing grid with a highlighted Professional plan.",
      render: () => <PricingTiersTab />,
    },
    {
      id: "variant-gallery",
      title: "Variant Gallery",
      description: "All card variants and sizes in a side-by-side comparison table.",
      render: () => <VariantGalleryTab />,
    },
  ];

  return (
    <ExampleTabs
      title="Card"
      intro="A container component with header, content, and footer sections."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
