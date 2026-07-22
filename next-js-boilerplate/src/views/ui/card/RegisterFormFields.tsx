/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormInputField } from "./FormInputField";

export function RegisterFormFields({
  form,
  registerSchema,
  t,
}: {
  form: any;
  registerSchema: any;
  t: any;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="firstName"
          validators={{
            onChange: registerSchema.shape.firstName,
            onBlur: registerSchema.shape.firstName,
          }}
        >
          {(field: any) => (
            <FormInputField
              field={field}
              label={t.form.register.firstNameLabel}
              placeholder={t.form.register.firstNamePlaceholder}
              autoComplete="given-name"
            />
          )}
        </form.Field>

        <form.Field
          name="lastName"
          validators={{
            onChange: registerSchema.shape.lastName,
            onBlur: registerSchema.shape.lastName,
          }}
        >
          {(field: any) => (
            <FormInputField
              field={field}
              label={t.form.register.lastNameLabel}
              placeholder={t.form.register.lastNamePlaceholder}
              autoComplete="family-name"
            />
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
        {(field: any) => (
          <FormInputField
            field={field}
            label={t.form.register.emailLabel}
            type="email"
            placeholder={t.form.register.emailPlaceholder}
            autoComplete="email"
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: registerSchema.shape.password,
          onBlur: registerSchema.shape.password,
        }}
      >
        {(field: any) => (
          <FormInputField
            field={field}
            label={t.form.register.passwordLabel}
            type="password"
            placeholder={t.form.register.passwordPlaceholder}
            autoComplete="new-password"
          />
        )}
      </form.Field>

      <form.Field
        name="confirmPassword"
        validators={{
          onChange: registerSchema.shape.confirmPassword,
          onBlur: registerSchema.shape.confirmPassword,
        }}
      >
        {(field: any) => (
          <FormInputField
            field={field}
            label={t.form.register.confirmPasswordLabel}
            type="password"
            placeholder={t.form.register.confirmPasswordPlaceholder}
            autoComplete="new-password"
          />
        )}
      </form.Field>
    </>
  );
}
